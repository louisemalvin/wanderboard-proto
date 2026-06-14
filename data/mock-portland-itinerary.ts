// ------------------------------------------------------------------
// Portland mock itinerary data — multi-day board, 6 planned places, 3 time-of-day sections
// ------------------------------------------------------------------

import type { TripBoard, Place } from "../lib/trip-types";

// ------------------------------------------------------------------
// Individual places
// ------------------------------------------------------------------

const portlandPlaces: Place[] = [
  {
    id: "pdx-coava",
    name: "Coffee at Coava",
    type: "cafe",
    location: { lat: 45.5201, lng: -122.6814 },
    city: "Portland",
    country: "US",
    description: "Artisan coffee in the Buckman neighborhood, known for single-origin pour-overs.",
    estimatedDurationMinutes: 45,
    tags: ["coffee", "breakfast"],
    area: "Buckman",
  },
  {
    id: "pdx-forest-park",
    name: "Forest Park Walk",
    type: "nature",
    location: { lat: 45.5424, lng: -122.7293 },
    city: "Portland",
    country: "US",
    description: "Scenic trail through Pacific Northwest forest, part of one of the largest urban forests in the US.",
    estimatedDurationMinutes: 90,
    tags: ["nature", "walking", "outdoor"],
    area: "Northwest Portland",
  },
  {
    id: "pdx-han-oak",
    name: "Lunch at Han Oak",
    type: "food",
    location: { lat: 45.5251, lng: -122.6573 },
    city: "Portland",
    country: "US",
    description: "Korean-inspired fare in a family setting, tucked behind a house in the Richmond neighborhood.",
    estimatedDurationMinutes: 75,
    tags: ["food", "lunch", "korean"],
    area: "Richmond",
  },
  {
    id: "pdx-powells",
    name: "Powell's Books",
    type: "shopping",
    location: { lat: 45.5231, lng: -122.6817 },
    city: "Portland",
    country: "US",
    description: "Iconic independent bookstore occupying a full city block in the Pearl District.",
    estimatedDurationMinutes: 60,
    tags: ["books", "shopping", "landmark"],
    area: "Pearl District",
  },
  {
    id: "pdx-canard",
    name: "Dinner at Canard",
    type: "food",
    location: { lat: 45.5272, lng: -122.6716 },
    city: "Portland",
    country: "US",
    description: "French-inspired bistro fare with a playful wine bar atmosphere.",
    estimatedDurationMinutes: 90,
    tags: ["food", "dinner", "french"],
    area: "Southeast Portland",
  },
  {
    id: "pdx-waterfront",
    name: "Sunset at Waterfront",
    type: "attraction",
    location: { lat: 45.5162, lng: -122.6709 },
    city: "Portland",
    country: "US",
    description: "Tom McCall Waterfront Park at dusk, with views of the Willamette River and Mount Hood.",
    estimatedDurationMinutes: 60,
    tags: ["sunset", "view", "walking"],
    area: "Downtown",
  },
];

// ------------------------------------------------------------------
// Section definitions — time-of-day groupings within the single day
// ------------------------------------------------------------------

export interface SectionDef {
  id: string;
  label: string;
  placeIds: string[];
}

export const MOCK_SECTIONS: SectionDef[] = [
  { id: "morning", label: "Morning", placeIds: ["pdx-coava", "pdx-forest-park"] },
  { id: "afternoon", label: "Afternoon", placeIds: ["pdx-han-oak", "pdx-powells"] },
  { id: "evening", label: "Evening", placeIds: ["pdx-canard", "pdx-waterfront"] },
];

export const MOCK_DAY_ID = "day-pdx-1";

// ------------------------------------------------------------------
// Full TripBoard compatible structure
// ------------------------------------------------------------------

export const portlandItinerary: TripBoard = {
  id: "trip-pdx-mock",
  title: "Portland Explorer",
  destinationText: "Portland, Oregon",
  durationDays: 3,
  pace: "balanced",
  interests: ["food", "nature", "coffee", "culture"],
  assumptions: [
    "All locations are open during the times shown",
    "Walking and transit times are estimates",
  ],
  warnings: [
    "Check hours before you go — schedules may change",
  ],
  days: [
    {
      id: MOCK_DAY_ID,
      dayNumber: 1,
      title: "Portland Day",
      summary: "A curated day exploring Portland's best coffee, nature, food, and culture.",
    },
    {
      id: "day-pdx-2",
      dayNumber: 2,
      title: "Neighborhoods",
      summary: "Keep a lighter day for saved places, shopping, and flexible discoveries.",
    },
    {
      id: "day-pdx-3",
      dayNumber: 3,
      title: "Open Day",
      summary: "Use this day for backup ideas, weather swaps, or a slower local route.",
    },
  ],
  savedPlaces: Object.fromEntries(portlandPlaces.map((p) => [p.id, p])),
  dayPlans: [
    {
      dayId: MOCK_DAY_ID,
      assignedPlaceIds: portlandPlaces.map((p) => p.id),
    },
    {
      dayId: "day-pdx-2",
      assignedPlaceIds: [],
    },
    {
      dayId: "day-pdx-3",
      assignedPlaceIds: [],
    },
  ],
  createdAt: "2026-06-13T00:00:00.000Z",
  updatedAt: "2026-06-13T00:00:00.000Z",
};
