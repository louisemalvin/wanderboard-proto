// ------------------------------------------------------------------
// POST /api/ai/chat
// Ask Wanderboard — propose mutations to an existing TripBoard.
// ------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  hasAzureAI,
  generateStructuredResponse,
  StructuredResponseError,
} from "@/lib/azure-openai";
import type { TripBoard, TripPace, BudgetLevel } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Shared error-response builder
// ------------------------------------------------------------------

function errorResponse(
  code: "invalid_request" | "not_configured" | "ai_failed" | "content_filtered",
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

// ------------------------------------------------------------------
// Request / Response types
// ------------------------------------------------------------------

interface ChatRequest {
  message: string;
  board: TripBoard;
}

interface ChatResponse {
  explanation: string;
  mutations: {
    addPlaces?: TripBoard["savedPlaces"][string][];
    assign?: Array<{ placeId: string; dayId: string }>;
    unassign?: Array<{ placeId: string; dayId: string }>;
    editPlaces?: Array<{ placeId: string; updates: Record<string, unknown> }>;
  };
}

// ------------------------------------------------------------------
// Zod schemas
// ------------------------------------------------------------------

// Reuse sub-schemas inline (kept self-contained for clarity)
const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const moneyRangeSchema = z.object({
  currency: z.string(),
  min: z.number(),
  max: z.number(),
});

const placeTypeEnum = z.enum([
  "attraction",
  "area",
  "hotel",
  "food",
  "cafe",
  "shopping",
  "nature",
  "ticket",
  "custom",
]);

const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: placeTypeEnum,
  location: geoPointSchema,
  city: z.string(),
  country: z.string(),
  description: z.string(),
  estimatedCost: moneyRangeSchema.optional(),
  estimatedDurationMinutes: z.number().optional(),
  tags: z.array(z.string()).optional(),
  area: z.string().optional(),
  notes: z.string().optional(),
});

const tripDaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
});

const dayPlanSchema = z.object({
  dayId: z.string(),
  assignedPlaceIds: z.array(z.string()),
});

const tripBoardSchema = z.object({
  id: z.string(),
  title: z.string(),
  destinationText: z.string(),
  durationDays: z.number().int().positive(),
  pace: z.enum(["relaxed", "balanced", "packed"]),
  budgetLevel: z.enum(["low", "medium", "high"]).optional(),
  interests: z.array(z.string()),
  assumptions: z.array(z.string()),
  warnings: z.array(z.string()),
  days: z.array(tripDaySchema),
  savedPlaces: z.record(z.string(), placeSchema),
  dayPlans: z.array(dayPlanSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Zod schema for the chat request body
const chatRequestSchema = z.object({
  message: z.string().min(1, "message is required and must not be empty"),
  board: tripBoardSchema,
});

// Zod schema for the chat response (AI output)
const mutationActionSchema = z.object({
  placeId: z.string(),
  dayId: z.string(),
});

const editPlaceActionSchema = z.object({
  placeId: z.string(),
  updates: z.record(z.string(), z.unknown()),
});

const chatResponseSchema = z.object({
  explanation: z.string(),
  mutations: z.object({
    addPlaces: z.array(placeSchema).optional(),
    assign: z.array(mutationActionSchema).optional(),
    unassign: z.array(mutationActionSchema).optional(),
    editPlaces: z.array(editPlaceActionSchema).optional(),
  }),
});

// ------------------------------------------------------------------
// System prompt (from architecture spec §6.6)
// ------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a travel planning assistant editing an existing trip board.
The user will describe a change in natural language. Propose specific
mutations to the board.

Rules:
- Only reference places and days that already exist in the board
  context provided. If adding new places, create unique, descriptive IDs.
- For new places, provide approximate coordinates near the area where
  the user wants them.
- Explain your proposal in one or two sentences.
- Do not claim live data. Note when something should be checked before
  going.
- Output only valid JSON matching the specified mutation schema.`;

// ------------------------------------------------------------------
// Post-processing validation
// ------------------------------------------------------------------

function postProcessChatResponse(
  response: ChatResponse,
  board: TripBoard,
): ChatResponse {
  const validPlaceIds = new Set(Object.keys(board.savedPlaces));
  const validDayIds = new Set(board.days.map((d) => d.id));

  const mutations = response.mutations;

  // Filter assign: only keep references that exist in the board
  const filteredAssign = mutations.assign?.filter(
    (a) => validPlaceIds.has(a.placeId) && validDayIds.has(a.dayId),
  );

  // Filter unassign: only keep references that exist
  const filteredUnassign = mutations.unassign?.filter(
    (u) => validPlaceIds.has(u.placeId) && validDayIds.has(u.dayId),
  );

  // Filter editPlaces: only keep edits for places that exist
  const filteredEditPlaces = mutations.editPlaces?.filter((e) =>
    validPlaceIds.has(e.placeId),
  );

  return {
    ...response,
    mutations: {
      ...mutations,
      assign: filteredAssign?.length ? filteredAssign : undefined,
      unassign: filteredUnassign?.length ? filteredUnassign : undefined,
      editPlaces: filteredEditPlaces?.length ? filteredEditPlaces : undefined,
    },
  };
}

// ------------------------------------------------------------------
// Route handler
// ------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- Body parsing & validation first ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "invalid_request",
      "Request body must be valid JSON.",
      400,
    );
  }

  // --- Request validation ---
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue
      ? firstIssue.message
      : "Invalid request body.";
    return errorResponse("invalid_request", message, 400);
  }

  const req = parsed.data as ChatRequest;

  // --- Configuration check (after request validation) ---
  if (!hasAzureAI()) {
    return errorResponse(
      "not_configured",
      "Azure OpenAI is not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT to .env.local.",
      503,
    );
  }

  // Build user message with board context
  const daysSummary = req.board.days
    .map(
      (d) =>
        `Day ${d.dayNumber} (${d.id}): ${d.title} — ${d.summary}`,
    )
    .join("\n");

  const placesSummary = Object.values(req.board.savedPlaces)
    .map((p) => `- ${p.id}: ${p.name} (${p.type}) in ${p.city}`)
    .join("\n");

  const userMessage = `Current board: "${req.board.title}" (${req.board.destinationText}, ${req.board.durationDays} days, ${req.board.pace} pace)

Days:
${daysSummary}

Saved places:
${placesSummary}

User request: ${req.message}

Propose mutations to the board that satisfy the user's request while maintaining data integrity.`;

  // --- AI call ---
  try {
    const result = await generateStructuredResponse<ChatResponse>(
      SYSTEM_PROMPT,
      userMessage,
      "chat_response",
      chatResponseSchema,
    );

    // --- Post-processing validation ---
    const cleaned = postProcessChatResponse(result, req.board);

    return NextResponse.json({
      explanation: cleaned.explanation,
      mutations: cleaned.mutations,
    });
  } catch (error) {
    if (error instanceof StructuredResponseError) {
      if (error.code === "content_filtered") {
        return errorResponse(
          "content_filtered",
          error.message,
          502,
        );
      }
      if (error.code === "ai_error") {
        return errorResponse(
          "ai_failed",
          error.message,
          502,
        );
      }
      if (error.code === "validation_failed" || error.code === "parse_failed") {
        return errorResponse(
          "ai_failed",
          "The AI response could not be processed. Please try again.",
          502,
        );
      }
    }

    // Catch-all
    return errorResponse(
      "ai_failed",
      "An unexpected error occurred. Please try again.",
      502,
    );
  }
}
