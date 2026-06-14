// ------------------------------------------------------------------
// Mori Response Schemas — unified Zod schemas for structured AI output
// Used by the /api/ai/chat route across all three Mori surfaces.
// ------------------------------------------------------------------

import { z } from "zod";

// ------------------------------------------------------------------
// Mori Surface
// ------------------------------------------------------------------

export const moriSurfaceSchema = z.enum([
  "plan_discover",
  "day_itinerary",
  "guide",
]);

export type MoriSurface = z.infer<typeof moriSurfaceSchema>;

// ------------------------------------------------------------------
// Coordinate Confidence
// ------------------------------------------------------------------

export const coordinateConfidenceSchema = z.enum([
  "verified",
  "approximate",
  "missing",
]);

export type CoordinateConfidence = z.infer<typeof coordinateConfidenceSchema>;

// ------------------------------------------------------------------
// Place Category
// ------------------------------------------------------------------

export const placeCategorySchema = z.enum([
  "attraction",
  "food",
  "nature",
  "culture",
  "shopping",
  "activity",
  "accommodation",
  "transport",
  "custom",
]);

export type PlaceCategory = z.infer<typeof placeCategorySchema>;

// ------------------------------------------------------------------
// Place Suggestion
// ------------------------------------------------------------------

export const placeSuggestionSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
  category: placeCategorySchema,
  description: z.string(),
  reason: z.string(),
  destination: z.string().optional(),
  neighbourhood: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coordinateConfidence: coordinateConfidenceSchema,
  estimatedDurationMinutes: z.number().int().positive().optional(),
  estimatedCost: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().optional(),
  }).optional(),
  suggestedDayId: z.string().optional(),
  suggestedAfterPlaceId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  sourceIds: z.array(z.string()).default([]),
});

export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

// ------------------------------------------------------------------
// Itinerary Proposal Operations (flat schema to avoid oneOf)
// All fields optional except type — validated by refinement.
// ------------------------------------------------------------------

export const itineraryOperationSchema = z.object({
  type: z.enum([
    "reorder_places",
    "assign_place",
    "unassign_place",
    "move_place",
    "add_suggested_place",
    "update_day_summary",
    "update_time_estimate",
  ]),
  dayId: z.string().optional(),
  orderedPlaceIds: z.array(z.string()).optional(),
  placeId: z.string().optional(),
  position: z.number().int().nonnegative().optional(),
  fromDayId: z.string().optional(),
  toDayId: z.string().optional(),
  place: placeSuggestionSchema.optional(),
  summary: z.string().optional(),
  estimatedStartTime: z.string().optional(),
  estimatedEndTime: z.string().optional(),
}).refine(
  (op) => {
    switch (op.type) {
      case "reorder_places":
        return !!op.dayId && Array.isArray(op.orderedPlaceIds);
      case "assign_place":
        return !!op.dayId && !!op.placeId;
      case "unassign_place":
        return !!op.dayId && !!op.placeId;
      case "move_place":
        return !!op.placeId && !!op.fromDayId && !!op.toDayId;
      case "add_suggested_place":
        return !!op.dayId && !!op.place;
      case "update_day_summary":
        return !!op.dayId && !!op.summary;
      case "update_time_estimate":
        return !!op.dayId && !!op.placeId;
      default:
        return false;
    }
  },
  { message: "Operation is missing required fields for its type" },
);

export type ItineraryOperation = z.infer<typeof itineraryOperationSchema>;

// ------------------------------------------------------------------
// Itinerary Proposal
// ------------------------------------------------------------------

export const itineraryProposalSchema = z.object({
  proposalId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  dayId: z.string(),
  operations: z.array(itineraryOperationSchema),
  rationale: z.array(z.string()),
  warnings: z.array(z.string()),
  affectedPlaceIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

export type ItineraryProposal = z.infer<typeof itineraryProposalSchema>;

// ------------------------------------------------------------------
// Guide Actions (flat schema to avoid oneOf)
// ------------------------------------------------------------------

export const guideActionSchema = z.object({
  type: z.enum([
    "navigate_to_place",
    "show_on_map",
    "suggest_nearby_place",
    "mark_place_skipped",
    "move_to_later",
    "open_day_plan",
    "propose_day_adjustment",
  ]),
  placeId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  place: placeSuggestionSchema.optional(),
  dayId: z.string().optional(),
  proposal: itineraryProposalSchema.optional(),
}).refine(
  (action) => {
    switch (action.type) {
      case "navigate_to_place":
        return !!action.placeId;
      case "show_on_map":
        return true; // optional placeId or coordinates
      case "suggest_nearby_place":
        return !!action.place;
      case "mark_place_skipped":
        return !!action.dayId && !!action.placeId;
      case "move_to_later":
        return !!action.dayId && !!action.placeId;
      case "open_day_plan":
        return !!action.dayId;
      case "propose_day_adjustment":
        return !!action.proposal;
      default:
        return false;
    }
  },
  { message: "Guide action is missing required fields for its type" },
);

export type GuideAction = z.infer<typeof guideActionSchema>;

// ------------------------------------------------------------------
// Mori Warning
// ------------------------------------------------------------------

export const moriWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});

export type MoriWarning = z.infer<typeof moriWarningSchema>;

// ------------------------------------------------------------------
// Grounding
// ------------------------------------------------------------------

export const groundingSchema = z.object({
  status: z.enum([
    "grounded",
    "partially_grounded",
    "no_results",
    "unavailable",
  ]),
  sourceIds: z.array(z.string()).default([]),
});

// ------------------------------------------------------------------
// Opening Hours Status
// ------------------------------------------------------------------

export const openingHoursStatusSchema = z.enum([
  "verified_current",
  "retrieved_but_may_change",
  "user_provided",
  "unknown",
]);

export type OpeningHoursStatus = z.infer<typeof openingHoursStatusSchema>;

// ------------------------------------------------------------------
// Unified Mori Response (model output)
// ------------------------------------------------------------------

export const moriResponseSchema = z.object({
  surface: moriSurfaceSchema,
  message: z.string().min(1).max(1200),
  placeSuggestions: z.array(placeSuggestionSchema).default([]),
  itineraryProposals: z.array(itineraryProposalSchema).default([]),
  guideActions: z.array(guideActionSchema).default([]),
  grounding: groundingSchema,
  warnings: z.array(moriWarningSchema).default([]),
  followUpSuggestions: z.array(z.string()).max(3).default([]),
});

export type MoriResponse = z.infer<typeof moriResponseSchema>;

// ------------------------------------------------------------------
// Mori Chat Request (extended to include surface)
// ------------------------------------------------------------------

import { tripBoardSchema } from "./schemas";

export const moriChatRequestSchema = z.object({
  message: z.string().min(1, "message is required and must not be empty"),
  board: tripBoardSchema,
  surface: moriSurfaceSchema,
  selectedDayId: z.string().optional(),
});

export type MoriChatRequest = z.infer<typeof moriChatRequestSchema>;

// ------------------------------------------------------------------
// Grounding Source (authoritative metadata attached by server)
// ------------------------------------------------------------------

export const groundingSourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  url: z.string().url().optional(),
  excerpt: z.string().max(500).optional(),
  lastReviewed: z.string().optional(),
});

export type GroundingSource = z.infer<typeof groundingSourceSchema>;

// ------------------------------------------------------------------
// Mori API Response (what the client receives)
// ------------------------------------------------------------------

export const moriApiResponseSchema = z.object({
  surface: moriSurfaceSchema,
  message: z.string(),
  placeSuggestions: z.array(placeSuggestionSchema),
  itineraryProposals: z.array(itineraryProposalSchema),
  guideActions: z.array(guideActionSchema),
  grounding: z.object({
    status: z.enum([
      "grounded",
      "partially_grounded",
      "no_results",
      "unavailable",
    ]),
    sources: z.array(groundingSourceSchema),
  }),
  warnings: z.array(moriWarningSchema),
  followUpSuggestions: z.array(z.string()),
});

export type MoriApiResponse = z.infer<typeof moriApiResponseSchema>;
