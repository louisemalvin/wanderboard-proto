import type { Place, TripBoard } from "./trip-types";
import { getPlacesByCity } from "../data/sample-places";

// ------------------------------------------------------------------
// Sample Trip Generator — fully deterministic
// Returns a hardcoded 4-day Tokyo trip board
// ------------------------------------------------------------------

const FIXED_TRIP_ID = "trip-sample-tokyo-20260612";
const FIXED_TIMESTAMP = "2026-06-12T12:00:00.000Z";

// Place IDs included in the sample trip (10 places)
const SAMPLE_PLACE_IDS: readonly string[] = [
  "place-sensoji-temple",
  "place-shibuya-crossing",
  "place-tsukiji-outer-market",
  "place-meiji-shrine",
  "place-shinjuku-gyoen",
  "place-akihabara-electric-town",
  "place-teamlab-borderless",
  "place-takeshita-street",
  "place-roppongi-hills",
  "place-golden-gai",
];

const DAYS = [
  {
    id: "day-1-trip-sample-tokyo-20260612",
    dayNumber: 1,
    title: "Day 1 — Asakusa & Sumida River",
    summary: "Arrival and orientation in historic Asakusa",
  },
  {
    id: "day-2-trip-sample-tokyo-20260612",
    dayNumber: 2,
    title: "Day 2 — Shibuya & Harajuku",
    summary: "Modern Tokyo: crossing, shopping, and youth culture",
  },
  {
    id: "day-3-trip-sample-tokyo-20260612",
    dayNumber: 3,
    title: "Day 3 — Tsukiji & Akihabara",
    summary: "Markets, food, and electronics",
  },
  {
    id: "day-4-trip-sample-tokyo-20260612",
    dayNumber: 4,
    title: "Day 4 — Art & Nature",
    summary: "Gardens, digital art, and departure",
  },
];

const DAY_PLANS = [
  {
    dayId: "day-1-trip-sample-tokyo-20260612",
    assignedPlaceIds: ["place-sensoji-temple"],
  },
  {
    dayId: "day-2-trip-sample-tokyo-20260612",
    assignedPlaceIds: [
      "place-shibuya-crossing",
      "place-meiji-shrine",
      "place-takeshita-street",
      "place-golden-gai",
    ],
  },
  {
    dayId: "day-3-trip-sample-tokyo-20260612",
    assignedPlaceIds: [
      "place-tsukiji-outer-market",
      "place-akihabara-electric-town",
      "place-roppongi-hills",
    ],
  },
  {
    dayId: "day-4-trip-sample-tokyo-20260612",
    assignedPlaceIds: ["place-shinjuku-gyoen", "place-teamlab-borderless"],
  },
];

const ASSUMPTIONS = [
  "All costs are rough estimates in JPY and may vary by season.",
  "Travel times between nearby neighborhoods assume 15–30 minutes by train or taxi.",
  "Opening hours and ticket prices should be confirmed from official sources before visiting.",
  "Weather and seasonal conditions can affect garden visits and outdoor attractions.",
  "The sample trip assumes a moderate walking pace with breaks for meals.",
];

const WARNINGS = [
  "Day 4 may feel rushed if you want to spend extra time at teamLab Borderless.",
  "Tsukiji Outer Market shops close by early afternoon — visit in the morning.",
  "Akihabara area can be overwhelming on weekends due to pedestrian crowds.",
  "Some attractions require advance booking (teamLab Borderless).",
];

export function createSampleTrip(): TripBoard {
  const tokyoPlaces = getPlacesByCity("Tokyo");

  const savedPlaces: Record<string, Place> = {};
  for (const place of tokyoPlaces) {
    if (SAMPLE_PLACE_IDS.includes(place.id)) {
      savedPlaces[place.id] = place;
    }
  }

  return {
    id: FIXED_TRIP_ID,
    title: "4-Day Tokyo Trip",
    destinationText: "Tokyo",
    durationDays: 4,
    pace: "balanced",
    budgetLevel: "medium",
    interests: ["food", "shopping", "nature", "culture"],
    assumptions: [...ASSUMPTIONS],
    warnings: [...WARNINGS],
    days: [...DAYS],
    savedPlaces,
    dayPlans: [...DAY_PLANS],
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
  };
}
