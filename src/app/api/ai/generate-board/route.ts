// ------------------------------------------------------------------
// POST /api/ai/generate-board
// Generate a full TripBoard from a natural-language prompt.
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
// Request types
// ------------------------------------------------------------------

interface GenerateBoardRequest {
  prompt: string;
  destination?: string;
  durationDays?: number;
  pace?: TripPace;
  budgetLevel?: BudgetLevel;
  interests?: string[];
}

// Zod schema for request validation
const generateBoardRequestSchema = z.object({
  prompt: z.string().min(1, "prompt is required and must not be empty"),
  destination: z.string().optional(),
  durationDays: z.number().int().positive().optional(),
  pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
  budgetLevel: z.enum(["low", "medium", "high"]).optional(),
  interests: z.array(z.string()).optional(),
});

// ------------------------------------------------------------------
// Zod schemas matching TripBoard shape (for AI response validation)
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// System prompt (from architecture spec §6.6)
// ------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a travel planning assistant. Generate a realistic multi-day trip
board based on the user's request.

Rules:
- Create internally consistent output with valid JSON structure.
- For each place, provide approximate coordinates within the city.
  These do not need to be exact — approximate center of the
  neighborhood or area is acceptable.
- Assign places to days intelligently: group by geographic area,
  keep arrival/departure days lighter, respect the user's pace.
- Do not claim live opening hours, exact prices, or real-time data.
- For each place, include brief notes about checking official sources
  before visiting.
- Output only valid JSON matching the specified schema.`;

// ------------------------------------------------------------------
// Post-processing validation
// ------------------------------------------------------------------

function postProcessBoard(board: TripBoard): TripBoard {
  const validDayIds = new Set(board.days.map((d) => d.id));
  const validPlaceIds = new Set(Object.keys(board.savedPlaces));

  // Filter dayPlans: remove entries referencing non-existent days,
  // and within each entry filter out non-existent place IDs.
  const filteredDayPlans = board.dayPlans
    .filter((dp) => validDayIds.has(dp.dayId))
    .map((dp) => ({
      ...dp,
      assignedPlaceIds: dp.assignedPlaceIds.filter((pid) =>
        validPlaceIds.has(pid),
      ),
    }));

  return {
    ...board,
    dayPlans: filteredDayPlans,
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
  const parsed = generateBoardRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue
      ? firstIssue.message
      : "Invalid request body.";
    return errorResponse("invalid_request", message, 400);
  }

  const req = parsed.data as GenerateBoardRequest;

  // --- Configuration check (after request validation) ---
  if (!hasAzureAI()) {
    return errorResponse(
      "not_configured",
      "Azure OpenAI is not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT to .env.local.",
      503,
    );
  }

  // Build user message from the request fields
  const userMessageParts: string[] = [req.prompt];
  if (req.destination) {
    userMessageParts.push(`Destination: ${req.destination}`);
  }
  if (req.durationDays) {
    userMessageParts.push(`Duration: ${req.durationDays} days`);
  }
  if (req.pace) {
    userMessageParts.push(`Pace: ${req.pace}`);
  }
  if (req.budgetLevel) {
    userMessageParts.push(`Budget level: ${req.budgetLevel}`);
  }
  if (req.interests && req.interests.length > 0) {
    userMessageParts.push(`Interests: ${req.interests.join(", ")}`);
  }
  const userMessage = userMessageParts.join("\n");

  // --- AI call ---
  try {
    const board = await generateStructuredResponse<TripBoard>(
      SYSTEM_PROMPT,
      userMessage,
      "trip_board",
      tripBoardSchema,
    );

    // --- Post-processing validation ---
    const cleaned = postProcessBoard(board);

    return NextResponse.json({ board: cleaned });
  } catch (error) {
    if (error instanceof StructuredResponseError) {
      // Map internal error codes to route-level error codes
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
