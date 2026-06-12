// ------------------------------------------------------------------
// Primitives
// ------------------------------------------------------------------

export type TripPace = "relaxed" | "balanced" | "packed";

export type BudgetLevel = "low" | "medium" | "high";

export type PlaceType =
  | "attraction"
  | "area"
  | "hotel"
  | "food"
  | "cafe"
  | "shopping"
  | "nature"
  | "ticket"
  | "custom";

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type MoneyRange = {
  currency: string;
  min: number;
  max: number;
};

// ------------------------------------------------------------------
// Place — a discoverable / saved destination
// ------------------------------------------------------------------

export type Place = {
  id: string;
  name: string;
  type: PlaceType;
  location: GeoPoint;
  city: string;
  country: string;
  description: string;
  estimatedCost?: MoneyRange;
  estimatedDurationMinutes?: number;
  tags?: string[];
  area?: string;
  notes?: string;
};

// ------------------------------------------------------------------
// DayPlan — assignment of places to a day (no scheduled times)
// ------------------------------------------------------------------

export type DayPlan = {
  dayId: string;
  assignedPlaceIds: string[];
};

// ------------------------------------------------------------------
// TripDay — a single day shell
// ------------------------------------------------------------------

export type TripDay = {
  id: string;
  dayNumber: number;
  title: string;
  summary: string;
};

// ------------------------------------------------------------------
// TripBoard — the full trip state (one per trip)
// ------------------------------------------------------------------

export type TripBoard = {
  id: string;
  title: string;
  destinationText: string;
  durationDays: number;
  pace: TripPace;
  budgetLevel?: BudgetLevel;
  interests: string[];
  assumptions: string[];
  warnings: string[];
  days: TripDay[];
  savedPlaces: Record<string, Place>;
  dayPlans: DayPlan[];
  createdAt: string;
  updatedAt: string;
};

// ------------------------------------------------------------------
// RecentTrip — lightweight trip header for the recent trips list
// ------------------------------------------------------------------

export type RecentTrip = {
  id: string;
  title: string;
  destinationText: string;
  durationDays: number;
  pace: TripPace;
  placeCount: number;
  updatedAt: string;
};
