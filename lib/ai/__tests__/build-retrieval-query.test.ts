/**
 * Unit tests for the retrieval query builder.
 * Run with: npx tsx --test lib/ai/__tests__/build-retrieval-query.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildRetrievalQuery } from "../build-retrieval-query";
import type { TripBoard } from "../../../lib/trip-types";

function makeBoard(overrides: Partial<TripBoard> = {}): TripBoard {
  return {
    id: "test-trip-1",
    title: "Tokyo Test Trip",
    destinationText: "Tokyo",
    durationDays: 4,
    pace: "balanced",
    budgetLevel: "medium",
    interests: ["food", "culture"],
    assumptions: [],
    warnings: ["Day 3 may be busy"],
    days: [
      { id: "day-1", dayNumber: 1, title: "Asakusa Day", summary: "Historic Tokyo" },
      { id: "day-2", dayNumber: 2, title: "Shibuya Day", summary: "Modern Tokyo" },
    ],
    savedPlaces: {
      "place-1": {
        id: "place-1",
        name: "Sensoji Temple",
        type: "attraction",
        location: { lat: 35.7148, lng: 139.7967 },
        city: "Tokyo",
        country: "Japan",
        description: "Ancient Buddhist temple",
      },
      "place-2": {
        id: "place-2",
        name: "Shibuya Crossing",
        type: "attraction",
        location: { lat: 35.6595, lng: 139.7004 },
        city: "Tokyo",
        country: "Japan",
        description: "Famous scramble crossing",
      },
    },
    dayPlans: [
      { dayId: "day-1", assignedPlaceIds: ["place-1"] },
      { dayId: "day-2", assignedPlaceIds: ["place-2"] },
    ],
    createdAt: "2026-06-12T00:00:00Z",
    updatedAt: "2026-06-12T00:00:00Z",
    ...overrides,
  };
}

describe("buildRetrievalQuery", () => {
  it("includes destination", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Make day 1 more relaxed",
      board,
    });
    assert.ok(query.includes("Destination: Tokyo"));
  });

  it("includes user instruction", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Add a food stop near Asakusa",
      board,
    });
    assert.ok(query.includes("Planning request: Add a food stop near Asakusa"));
  });

  it("includes pace", () => {
    const board = makeBoard({ pace: "relaxed" });
    const query = buildRetrievalQuery({
      userInstruction: "Suggest changes",
      board,
    });
    assert.ok(query.includes("Current pace: relaxed"));
  });

  it("includes duration", () => {
    const board = makeBoard({ durationDays: 7 });
    const query = buildRetrievalQuery({
      userInstruction: "Make it slower",
      board,
    });
    assert.ok(query.includes("Trip duration: 7 days"));
  });

  it("includes interests", () => {
    const board = makeBoard({ interests: ["food", "shopping"] });
    const query = buildRetrievalQuery({
      userInstruction: "More food places",
      board,
    });
    assert.ok(query.includes("food"));
    assert.ok(query.includes("shopping"));
  });

  it("includes structural warnings", () => {
    const board = makeBoard({ warnings: ["Check opening hours"] });
    const query = buildRetrievalQuery({
      userInstruction: "Help",
      board,
    });
    assert.ok(query.includes("Check opening hours"));
  });

  it("includes selected day context with assigned places", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Make day 1 more relaxed",
      board,
      selectedDayId: "day-1",
    });
    assert.ok(query.includes("Day 1: Asakusa Day"));
    assert.ok(query.includes("Sensoji Temple"));
  });

  it("does not include non-existent day", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Change it up",
      board,
      selectedDayId: "nonexistent-day",
    });
    assert.ok(!query.includes("nonexistent-day"));
  });

  it("does not include personal notes (structural only)", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Make changes",
      board,
    });
    // Saved places with personal notes should not leak into query
    assert.ok(!query.includes("secret note"));
  });

  it("handles empty destination", () => {
    const board = makeBoard({ destinationText: "" });
    const query = buildRetrievalQuery({
      userInstruction: "Plan something",
      board,
    });
    assert.ok(!query.includes("Destination:"));
  });

  it("includes retrieval hint about neighbourhood/pacing/transport", () => {
    const board = makeBoard();
    const query = buildRetrievalQuery({
      userInstruction: "Make day 1 more relaxed",
      board,
    });
    assert.ok(query.includes("neighbourhood compatibility"));
    assert.ok(query.includes("pacing"));
    assert.ok(query.includes("transport"));
  });

  it("handles empty interests array", () => {
    const board = makeBoard({ interests: [] });
    const query = buildRetrievalQuery({
      userInstruction: "Plan",
      board,
    });
    assert.ok(!query.includes("Interests:"));
  });
});
