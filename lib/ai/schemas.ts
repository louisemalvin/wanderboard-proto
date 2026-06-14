// ------------------------------------------------------------------
// Shared Zod schemas for AI routes
// Used by both generate-board and chat routes.
// ------------------------------------------------------------------

import { z } from "zod";

// ------------------------------------------------------------------
// Primitives
// ------------------------------------------------------------------

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const moneyRangeSchema = z.object({
  currency: z.string(),
  min: z.number(),
  max: z.number(),
});

export const placeTypeEnum = z.enum([
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

export const placeSchema = z.object({
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

export const tripDaySchema = z.object({
  id: z.string(),
  dayNumber: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
});

export const dayPlanSchema = z.object({
  dayId: z.string(),
  assignedPlaceIds: z.array(z.string()),
});

export const tripBoardSchema = z.object({
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

// Model-output safe version: savedPlaces as array (avoids additionalProperties in strict JSON schema)
export const tripBoardModelSchema = z.object({
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
  savedPlaces: z.array(placeSchema),
  dayPlans: z.array(dayPlanSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ------------------------------------------------------------------
// Grounding
// ------------------------------------------------------------------

export const groundingSourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  url: z.string().url().optional(),
  excerpt: z.string().max(500).optional(),
  lastReviewed: z.string().optional(),
});

// ------------------------------------------------------------------
// Chat request / response
// ------------------------------------------------------------------

export const chatRequestSchema = z.object({
  message: z.string().min(1, "message is required and must not be empty"),
  board: tripBoardSchema,
  selectedDayId: z.string().optional(),
});

export const mutationActionSchema = z.object({
  placeId: z.string(),
  dayId: z.string(),
});

export const editPlaceActionSchema = z.object({
  placeId: z.string(),
  updates: z.record(z.string(), z.unknown()),
});

export const chatResponseSchema = z.object({
  explanation: z.string(),
  mutations: z.object({
    addPlaces: z.array(placeSchema).optional(),
    assign: z.array(mutationActionSchema).optional(),
    unassign: z.array(mutationActionSchema).optional(),
    editPlaces: z.array(editPlaceActionSchema).optional(),
  }),
  grounding: z.object({
    status: z.enum(["grounded", "no_results", "unavailable"]),
    sources: z.array(groundingSourceSchema),
  }).optional(),
  warnings: z.array(z.string()).default([]).optional(),
});

// ------------------------------------------------------------------
// Generate board request
// ------------------------------------------------------------------

export const generateBoardRequestSchema = z.object({
  prompt: z.string().min(1, "prompt is required and must not be empty"),
  destination: z.string().optional(),
  durationDays: z.number().int().positive().optional(),
  pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
  budgetLevel: z.enum(["low", "medium", "high"]).optional(),
  interests: z.array(z.string()).optional(),
});
