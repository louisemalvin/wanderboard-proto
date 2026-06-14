// ------------------------------------------------------------------
// POST /api/ai/chat
// Ask Mori — context-aware AI assistant for travel planning.
// Supports three surfaces: plan_discover, day_itinerary, guide.
// Integrated with Foundry IQ knowledge retrieval for grounded responses.
// ------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import {
  hasAzureAI,
  generateStructuredResponse,
  StructuredResponseError,
} from "@/lib/azure-openai";
import {
  retrieveTravelKnowledge,
} from "@/lib/ai/foundry-iq";
import { buildRetrievalQuery } from "@/lib/ai/build-retrieval-query";
import { selectMoriPrompt } from "@/lib/ai/prompts";
import {
  moriChatRequestSchema,
  moriResponseSchema,
  type MoriResponse,
  type MoriApiResponse,
  type GroundingSource,
  type MoriChatRequest,
} from "@/lib/ai/mori-schemas";
import {
  validateMoriResponse,
  sanitizeMessage,
} from "@/lib/ai/mori-validator";

// ------------------------------------------------------------------
// Shared error-response builder
// ------------------------------------------------------------------

function errorResponse(
  code: "invalid_request" | "not_configured" | "ai_failed" | "content_filtered" | "rate_limited",
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

// ------------------------------------------------------------------
// Post-processing: attach authoritative source metadata
// ------------------------------------------------------------------

function attachAuthoritativeSources(
  modelResponse: MoriResponse,
  groundingSources: GroundingSource[],
): MoriApiResponse {
  // Map model sourceIds to actual grounding sources
  const modelSourceIds = new Set(modelResponse.grounding.sourceIds ?? []);
  const authoritativeSources = groundingSources.filter(
    (s) => s.id && modelSourceIds.has(s.id),
  );

  // If model reported grounded but we have no matching sources, downgrade
  let groundingStatus = modelResponse.grounding.status;
  if (
    groundingStatus === "grounded" &&
    authoritativeSources.length === 0
  ) {
    groundingStatus = "partially_grounded";
  }

  // Determine top-level grounding status based on retrieval results
  if (groundingSources.length === 0) {
    if (groundingStatus === "grounded") {
      groundingStatus = "partially_grounded";
    }
  }

  return {
    surface: modelResponse.surface,
    message: modelResponse.message,
    placeSuggestions: modelResponse.placeSuggestions,
    itineraryProposals: modelResponse.itineraryProposals,
    guideActions: modelResponse.guideActions,
    grounding: {
      status: groundingStatus,
      sources: authoritativeSources,
    },
    warnings: modelResponse.warnings,
    followUpSuggestions: modelResponse.followUpSuggestions,
  };
}

// ------------------------------------------------------------------
// Build surface-specific user message
// ------------------------------------------------------------------

function buildUserMessage(req: MoriChatRequest, groundingAnswer?: string, groundingSources?: GroundingSource[]): string {
  const daysSummary = req.board.days
    .map(
      (d) =>
        `Day ${d.dayNumber} (id: ${d.id}): ${d.title} — ${d.summary}`,
    )
    .join("\n");

  const placesSummary = Object.values(req.board.savedPlaces)
    .map((p) => `- id: ${p.id} | ${p.name} (${p.type}) in ${p.city}${p.area ? `, area: ${p.area}` : ""}`)
    .join("\n");

  const dayPlansSummary = req.board.dayPlans
    .map((plan) => {
      const day = req.board.days.find((d) => d.id === plan.dayId);
      const dayLabel = day ? `Day ${day.dayNumber}` : plan.dayId;
      const placeNames = plan.assignedPlaceIds
        .map((pid) => {
          const p = req.board.savedPlaces[pid];
          return p ? `${p.name} (id: ${pid})` : pid;
        })
        .join(", ");
      return `${dayLabel} (id: ${plan.dayId}): ${placeNames || "(empty)"}`;
    })
    .join("\n");

  // Selected day context
  let selectedDayContext = "";
  if (req.selectedDayId) {
    const day = req.board.days.find((d) => d.id === req.selectedDayId);
    if (day) {
      const plan = req.board.dayPlans.find((p) => p.dayId === req.selectedDayId);
      const placeNames = plan?.assignedPlaceIds
        .map((pid) => req.board.savedPlaces[pid]?.name)
        .filter(Boolean)
        .join(", ");
      selectedDayContext = `\nCurrent focus day: Day ${day.dayNumber} (id: ${day.id}), "${day.title}". Places: ${placeNames || "none"}.`;
    }
  }

  // Wrap retrieved knowledge in delimiters for prompt-injection protection
  let groundedContext = "";
  if (groundingAnswer) {
    groundedContext = `\n--- Begin Retrieved Knowledge (untrusted reference) ---\n${groundingAnswer}\n--- End Retrieved Knowledge ---\n`;
  } else if (groundingSources && groundingSources.length > 0) {
    const excerpts = groundingSources
      .filter((s) => s.excerpt)
      .map((s) => `[id: ${s.id ?? "unknown"} | ${s.title}]: ${s.excerpt}`)
      .join("\n\n");
    groundedContext = `\n--- Begin Retrieved Knowledge (untrusted reference) ---\n${excerpts}\n--- End Retrieved Knowledge ---\n`;
  }

  // Surface-specific context
  const surfaceContext = getSurfaceContext(req);

  return `Current board: "${req.board.title}" (${req.board.destinationText}, ${req.board.durationDays} days, ${req.board.pace} pace)
Interests: ${req.board.interests.join(", ") || "none specified"}
Budget: ${req.board.budgetLevel ?? "not specified"}

Days:
${daysSummary}

Day plans:
${dayPlansSummary}
${selectedDayContext}

Saved places (all, including unassigned):
${placesSummary}
${groundedContext}
${surfaceContext}

Traveller request: ${req.message}

Remember: you are in ${req.surface} mode. Return structured JSON matching the schema. Use retrieved knowledge only as supporting context. Do not fabricate source URLs — use source IDs from retrieved documents.`;
}

function getSurfaceContext(req: MoriChatRequest): string {
  switch (req.surface) {
    case "plan_discover":
      return `Surface context: Plan and Discover mode. Focus on suggesting new places that fit the trip. Return suggestions in "placeSuggestions". Do not auto-save. Keep coordinates honest.`;
    case "day_itinerary":
      return `Surface context: Day Itinerary mode. Evaluate and restructure the current day. Return structured proposals in "itineraryProposals". Explain trade-offs. Flag uncertain opening hours.`;
    case "guide":
      return `Surface context: Guide mode. Answer the traveller's immediate question conversationally. Return lightweight actions in "guideActions" — not full proposals unless asked. Be warm, calm, and gently playful. Keep the answer concise.`;
  }
}

// ------------------------------------------------------------------
// Build retrieval query with surface awareness
// ------------------------------------------------------------------

function buildSurfaceRetrievalQuery(req: MoriChatRequest): string {
  const baseQuery = buildRetrievalQuery({
    userInstruction: req.message,
    board: req.board,
    selectedDayId: req.selectedDayId,
  });

  const surfaceHint = (() => {
    switch (req.surface) {
      case "plan_discover":
        return "Focus: discovering new places, neighbourhood compatibility, category variety";
      case "day_itinerary":
        return "Focus: visit durations, geographic grouping, transfer times, opening hours, pacing";
      case "guide":
        return "Focus: practical travel tips, local context, nearby alternatives, what to expect";
    }
  })();

  return `${baseQuery}\nSurface: ${req.surface}\n${surfaceHint}`;
}

// ------------------------------------------------------------------
// Route handler
// ------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- Body parsing & validation ---
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
  const parsed = moriChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue
      ? firstIssue.message
      : "Invalid request body.";
    return errorResponse("invalid_request", message, 400);
  }

  const req = parsed.data as MoriChatRequest;

  // --- Configuration check ---
  if (!hasAzureAI()) {
    return errorResponse(
      "not_configured",
      "Azure OpenAI is not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT to .env.local.",
      503,
    );
  }

  // --- Foundry IQ retrieval ---
  let groundingSources: GroundingSource[] = [];
  let groundedAnswer: string | undefined;

  try {
    const retrievalQuery = buildSurfaceRetrievalQuery(req);
    const groundingResult = await retrieveTravelKnowledge({
      query: retrievalQuery,
      destination: req.board.destinationText,
    });

    groundingSources = groundingResult.sources.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      excerpt: s.excerpt,
      lastReviewed: s.lastReviewed,
    }));

    if (groundingResult.status === "grounded" && groundingResult.answer) {
      groundedAnswer = groundingResult.answer;
    }
  } catch {
    // Retrieval failure is non-fatal — proceed without grounding
    groundingSources = [];
  }

  // --- Build user message with board context and retrieved knowledge ---
  const userMessage = buildUserMessage(req, groundedAnswer, groundingSources);

  // --- Select prompt for surface ---
  const systemPrompt = selectMoriPrompt(req.surface);

  // --- AI call ---
  try {
    const result = await generateStructuredResponse<MoriResponse>(
      systemPrompt,
      userMessage,
      "mori_response",
      moriResponseSchema,
    );

    // --- Defensive validation ---
    const validation = validateMoriResponse(result);
    if (!validation.valid) {
      // If violations exist, attempt to sanitize the message
      const sanitizedMessage = sanitizeMessage(result.message);
      // If sanitization helped, use it; otherwise fail
      const recheck = validateMoriResponse({ ...result, message: sanitizedMessage });
      if (recheck.valid) {
        result.message = sanitizedMessage;
      } else {
        // Message still has violations — reject
        console.warn("[mori] Response validation failed:", validation.violations);
        return NextResponse.json({
          surface: req.surface,
          message: "I could not turn that into a safe board update, so I left your plan unchanged.",
          placeSuggestions: [],
          itineraryProposals: [],
          guideActions: [],
          grounding: {
            status: groundingSources.length > 0 ? "grounded" : "unavailable",
            sources: groundingSources,
          },
          warnings: [{ code: "validation_failed", message: "The response could not be safely validated.", severity: "warning" as const }],
          followUpSuggestions: [],
        } satisfies MoriApiResponse);
      }
    }

    // --- Attach authoritative sources ---
    const authoritativeResponse = attachAuthoritativeSources(result, groundingSources);

    return NextResponse.json(authoritativeResponse);
  } catch (error) {
    if (error instanceof StructuredResponseError) {
      if (error.code === "content_filtered") {
        return errorResponse(
          "content_filtered",
          error.message,
          502,
        );
      }
      if (error.code === "rate_limited") {
        return errorResponse(
          "rate_limited",
          error.message,
          429,
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
          "I could not finish that suggestion just now. Your current plan has not been changed.",
          502,
        );
      }
    }

    // Catch-all
    return errorResponse(
      "ai_failed",
      "I could not finish that suggestion just now. Your current plan has not been changed.",
      502,
    );
  }
}
