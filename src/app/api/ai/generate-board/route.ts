// ------------------------------------------------------------------
// POST /api/ai/generate-board
// Generate a full TripBoard from a natural-language prompt.
// ------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import {
  hasAzureAI,
  generateStructuredResponse,
  StructuredResponseError,
} from "@/lib/azure-openai";
import { generateBoardRequestSchema, tripBoardModelSchema, type tripBoardSchema as TripBoardSchema } from "@/lib/ai/schemas";
import type { Place } from "@/lib/trip-types";
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
// Types
// ------------------------------------------------------------------

interface GenerateBoardRequest {
  prompt: string;
  destination?: string;
  durationDays?: number;
  pace?: TripPace;
  budgetLevel?: BudgetLevel;
  interests?: string[];
}

// ------------------------------------------------------------------
// System prompt
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
    // Use model-safe schema with array-form savedPlaces
    interface TripBoardModelOutput {
      id: string; title: string; destinationText: string; durationDays: number;
      pace: TripPace; budgetLevel?: BudgetLevel; interests: string[];
      assumptions: string[]; warnings: string[]; days: TripBoard["days"];
      savedPlaces: Place[]; dayPlans: TripBoard["dayPlans"];
      createdAt: string; updatedAt: string;
    }

    const modelOutput = await generateStructuredResponse<TripBoardModelOutput>(
      SYSTEM_PROMPT,
      userMessage,
      "trip_board",
      tripBoardModelSchema,
    );

    // Convert savedPlaces array back to Record for application use
    const savedPlacesRecord: Record<string, Place> = {};
    for (const place of modelOutput.savedPlaces) {
      savedPlacesRecord[place.id] = place;
    }

    const board: TripBoard = {
      ...modelOutput,
      savedPlaces: savedPlacesRecord,
    };

    const cleaned = postProcessBoard(board);

    return NextResponse.json({ board: cleaned });
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

    return errorResponse(
      "ai_failed",
      "An unexpected error occurred. Please try again.",
      502,
    );
  }
}
