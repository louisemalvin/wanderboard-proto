import type { Place, TripBoard } from "@/lib/trip-types";
import { formatApproximateTime, formatDuration, parseTimeToMinutes } from "@/lib/format";

export type TransitMode = "Walk" | "Public transit" | "Taxi / drive";

export type TransitOption = {
  mode: TransitMode;
  durationMinutes: number;
  distance: string;
  cost: string;
  mapUrl: string;
  note: string;
  recommended: boolean;
};

export type ItineraryAnalysisLeg = {
  id: string;
  from: string;
  to: string;
  options: TransitOption[];
};

export type EstimatedDayFlowStopItem = {
  kind: "stop";
  id: string;
  place: Place;
  placeId: string;
  order: number;
  startMinutes: number;
  displayTime: string;
  durationMinutes: number;
  durationLabel: string;
  durationSource: "place-estimate" | "fallback";
  isFoodRelated: boolean;
};

export type EstimatedDayFlowMovementItem = {
  kind: "movement";
  id: string;
  leg: ItineraryAnalysisLeg;
  fromPlaceId: string;
  toPlaceId: string;
  afterStopOrder: number;
  startMinutes: number;
  displayTime: string;
  durationMinutes: number;
  durationLabel: string;
  recommendedOption: TransitOption;
  routeCheckReminder: string;
};

export type EstimatedDayFlowItem = EstimatedDayFlowStopItem | EstimatedDayFlowMovementItem;

export type EstimatedDayFlow = {
  dayStartMinutes: number;
  dayStartTime: string;
  dayStartDisplay: string;
  items: EstimatedDayFlowItem[];
};

export type ItineraryAnalysisDay = {
  id: string;
  title: string;
  summary: string;
  stopCount: number;
  totalTravelMinutes: number;
  pacing: "Relaxed" | "Balanced" | "Packed";
  bestWindow: string;
  weatherNote: string;
  openingHoursNote: string;
  guideNotes: string[];
  stops: Place[];
  legs: ItineraryAnalysisLeg[];
  estimatedFlow: EstimatedDayFlow;
};

export type ItineraryAnalysis = {
  title: string;
  destination: string;
  overview: string;
  assumption: string;
  days: ItineraryAnalysisDay[];
};

export const itineraryAnalysisSteps = [
  "Reading your trip board...",
  "Estimating time between stops...",
  "Looking for check-before-you-go reminders...",
  "Reviewing the day shape and pacing...",
  "Preparing map links and day notes...",
];

const DURATIONS = [12, 18, 24, 31, 15, 27, 36];
const DISTANCES = ["0.8 km", "1.6 km", "2.4 km", "3.1 km", "1.2 km", "4.0 km"];
const WALK_NOTES = [
  "Free and flexible if the weather is comfortable.",
  "Best if you want to explore between stops.",
  "Good backup if transit is crowded.",
];
const TRANSIT_NOTES = [
  "Best balance of time, cost, and predictability.",
  "Use this if you want to keep the day on schedule.",
  "Usually the safest default for this leg.",
];
const TAXI_NOTES = [
  "Fastest option if you are running late.",
  "Useful with luggage, rain, or tired travelers.",
  "May save time, but re-check the route before leaving.",
];
const WEATHER_NOTES = [
  "Outdoor-leaning day based on your current stops; check conditions before you leave.",
  "Mostly indoor-friendly based on your current stops; useful if plans change.",
  "Mixed indoor/outdoor day; keep one flexible stop as a buffer.",
];
const HOURS_NOTES = [
  "Verify hours for the first major stop before leaving.",
  "Several stops may have shorter evening hours; earlier is safer.",
  "Worth checking ticketed or reservation-style places before you go.",
];
const WINDOWS = ["Start 9:30-10:30", "Start 10:00-11:00", "Start after lunch", "Late afternoon works"];

export const DEFAULT_ESTIMATED_DAY_START_TIME = "10:00";
export const DEFAULT_ESTIMATED_DAY_START_MINUTES = parseTimeToMinutes(DEFAULT_ESTIMATED_DAY_START_TIME) ?? 10 * 60;
export const FALLBACK_STOP_DURATION_MINUTES = 60;
export const FALLBACK_MOVEMENT_DURATION_MINUTES = 20;
export const ROUTE_CHECK_REMINDER = "Estimated from your current plan; re-check the route before you leave.";

function formatQuery(place: Place) {
  if (place.location) {
    return `${place.location.lat},${place.location.lng}`;
  }
  return [place.name, place.city, place.country].filter(Boolean).join(", ");
}

function buildGoogleMapsUrl(from: Place, to: Place, mode: TransitMode) {
  const travelMode = mode === "Walk" ? "walking" : mode === "Public transit" ? "transit" : "driving";
  const params = new URLSearchParams({
    api: "1",
    origin: formatQuery(from),
    destination: formatQuery(to),
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function getPacing(stopCount: number, travelMinutes: number): ItineraryAnalysisDay["pacing"] {
  if (stopCount <= 2 && travelMinutes <= 35) return "Relaxed";
  if (stopCount >= 5 || travelMinutes >= 80) return "Packed";
  return "Balanced";
}

function getAssignedPlaces(board: TripBoard, dayId: string) {
  const plan = board.dayPlans.find((item) => item.dayId === dayId);
  return (plan?.assignedPlaceIds ?? [])
    .map((placeId) => board.savedPlaces[placeId])
    .filter((place): place is Place => Boolean(place));
}

function buildOptions(from: Place, to: Place, seed: number): TransitOption[] {
  const baseline = DURATIONS[seed % DURATIONS.length];
  const distance = DISTANCES[seed % DISTANCES.length];

  return [
    {
      mode: "Walk",
      durationMinutes: baseline + 18,
      distance,
      cost: "Free",
      mapUrl: buildGoogleMapsUrl(from, to, "Walk"),
      note: WALK_NOTES[seed % WALK_NOTES.length],
      recommended: false,
    },
    {
      mode: "Public transit",
      durationMinutes: baseline,
      distance,
      cost: "$2-5",
      mapUrl: buildGoogleMapsUrl(from, to, "Public transit"),
      note: TRANSIT_NOTES[seed % TRANSIT_NOTES.length],
      recommended: true,
    },
    {
      mode: "Taxi / drive",
      durationMinutes: Math.max(8, baseline - 8),
      distance,
      cost: "$12-24",
      mapUrl: buildGoogleMapsUrl(from, to, "Taxi / drive"),
      note: TAXI_NOTES[seed % TAXI_NOTES.length],
      recommended: false,
    },
  ];
}

function buildLegs(places: Place[], dayId: string, dayIndex: number) {
  return places.slice(0, -1).map((place, index) => {
    const next = places[index + 1];
    const seed = dayIndex + index;

    return {
      id: `${dayId}-${index}`,
      from: place.name,
      to: next.name,
      options: buildOptions(place, next, seed),
    };
  });
}

export function getEstimatedDayStartMinutes(startTime?: string | number | null) {
  if (typeof startTime === "number" && Number.isFinite(startTime)) {
    return Math.max(0, Math.round(startTime));
  }

  if (typeof startTime === "string") {
    return parseTimeToMinutes(startTime) ?? DEFAULT_ESTIMATED_DAY_START_MINUTES;
  }

  return DEFAULT_ESTIMATED_DAY_START_MINUTES;
}

function getRecommendedTransitOption(leg: ItineraryAnalysisLeg): TransitOption | null {
  return leg.options.find((option) => option.recommended) ?? leg.options[0] ?? null;
}

function getStopDurationMinutes(place: Place) {
  return place.estimatedDurationMinutes && place.estimatedDurationMinutes > 0
    ? place.estimatedDurationMinutes
    : FALLBACK_STOP_DURATION_MINUTES;
}

function isFoodRelatedPlace(place: Place) {
  if (place.type === "food" || place.type === "cafe") return true;

  const searchableText = [place.name, place.description, place.notes, ...(place.tags ?? [])]
    .filter(Boolean)
    .join(" ");

  return /\b(food|cafe|coffee|restaurant|dining|breakfast|brunch|lunch|dinner|bakery|market)\b/i.test(searchableText);
}

export function buildEstimatedDayFlow(
  stops: Place[],
  legs: ItineraryAnalysisLeg[],
  startTime?: string | number | null,
): EstimatedDayFlow {
  const dayStartMinutes = getEstimatedDayStartMinutes(startTime);
  let cursorMinutes = dayStartMinutes;
  const items: EstimatedDayFlowItem[] = [];

  stops.forEach((place, index) => {
    const durationMinutes = getStopDurationMinutes(place);
    const stopItem: EstimatedDayFlowStopItem = {
      kind: "stop",
      id: `stop-${place.id}`,
      place,
      placeId: place.id,
      order: index + 1,
      startMinutes: cursorMinutes,
      displayTime: formatApproximateTime(cursorMinutes),
      durationMinutes,
      durationLabel: `${formatDuration(durationMinutes)} visit`,
      durationSource: place.estimatedDurationMinutes && place.estimatedDurationMinutes > 0 ? "place-estimate" : "fallback",
      isFoodRelated: isFoodRelatedPlace(place),
    };
    items.push(stopItem);
    cursorMinutes += durationMinutes;

    const leg = legs[index];
    if (!leg) return;

    const recommendedOption = getRecommendedTransitOption(leg) ?? {
      mode: "Public transit",
      durationMinutes: FALLBACK_MOVEMENT_DURATION_MINUTES,
      distance: "Check route",
      cost: "Check locally",
      mapUrl: "https://www.google.com/maps",
      note: ROUTE_CHECK_REMINDER,
      recommended: true,
    };
    const movementDuration = recommendedOption.durationMinutes > 0
      ? recommendedOption.durationMinutes
      : FALLBACK_MOVEMENT_DURATION_MINUTES;

    items.push({
      kind: "movement",
      id: `movement-${leg.id}`,
      leg,
      fromPlaceId: place.id,
      toPlaceId: stops[index + 1]?.id ?? "",
      afterStopOrder: index + 1,
      startMinutes: cursorMinutes,
      displayTime: formatApproximateTime(cursorMinutes),
      durationMinutes: movementDuration,
      durationLabel: formatDuration(movementDuration),
      recommendedOption,
      routeCheckReminder: ROUTE_CHECK_REMINDER,
    });
    cursorMinutes += movementDuration;
  });

  return {
    dayStartMinutes,
    dayStartTime: formatApproximateTime(dayStartMinutes).replace(/^~/, ""),
    dayStartDisplay: formatApproximateTime(dayStartMinutes),
    items,
  };
}

function buildGuideNotes(
  stops: Place[],
  pacing: ItineraryAnalysisDay["pacing"],
  totalTravelMinutes: number,
  dayIndex: number,
) {
  if (stops.length === 0) return [];

  const hasTicketLikeStop = stops.some((place) => place.type === "ticket" || /ticket|museum|reservation|tour/i.test(`${place.name} ${place.description} ${place.notes ?? ""}`));
  const hasOutdoorStop = stops.some((place) => place.type === "nature" || place.type === "area" || /park|garden|view|walk|outdoor/i.test(`${place.name} ${place.description} ${place.notes ?? ""}`));
  const areas = Array.from(new Set(stops.map((place) => place.area || place.city).filter(Boolean)));

  const notes: string[] = [];

  if (hasTicketLikeStop) {
    notes.push("Worth checking ticket, timed-entry, or closure details for the places that may require planning ahead.");
  } else {
    notes.push("Use this as a practical order for the day, then confirm any must-do stop before you leave.");
  }

  if (pacing === "Packed") {
    notes.push("This day may need a flexible backup: choose one lower-priority stop you can skip if the pace feels tight.");
  } else if (pacing === "Relaxed") {
    notes.push("The day has breathing room based on your current plan, so it can absorb a slower meal, rest, or a changed route.");
  } else {
    notes.push("The pacing looks balanced; keep the first move simple so the rest of the day stays easy to follow.");
  }

  if (hasOutdoorStop) {
    notes.push("Because some stops are outdoors or area-based, check conditions and footwear needs before committing to the exact order.");
  } else if (areas.length > 1 || totalTravelMinutes > 45) {
    notes.push("There is some cross-area movement, so re-check the next leg before leaving each stop.");
  } else {
    notes.push("Most of the day appears geographically simple; keep nearby backup options in mind if plans change.");
  }

  return notes.slice(dayIndex % 2 === 0 ? 0 : 1, dayIndex % 2 === 0 ? 3 : 4);
}

export function buildMockItineraryAnalysis(board: TripBoard | null): ItineraryAnalysis | null {
  if (!board) return null;

  const days = board.days.map((day, dayIndex) => {
    const stops = getAssignedPlaces(board, day.id);
    const legs = buildLegs(stops, day.id, dayIndex);
    const totalTravelMinutes = legs.reduce((sum, leg) => {
      const recommended = leg.options.find((option) => option.recommended) ?? leg.options[0];
      return sum + recommended.durationMinutes;
    }, 0);

    const pacing = getPacing(stops.length, totalTravelMinutes);

    return {
      id: day.id,
      title: `Day ${day.dayNumber}: ${day.title || "Open planning day"}`,
      summary: day.summary || "A flexible day built from your current board order.",
      stopCount: stops.length,
      totalTravelMinutes,
      pacing,
      bestWindow: WINDOWS[dayIndex % WINDOWS.length],
      weatherNote: WEATHER_NOTES[dayIndex % WEATHER_NOTES.length],
      openingHoursNote: HOURS_NOTES[dayIndex % HOURS_NOTES.length],
      guideNotes: buildGuideNotes(stops, pacing, totalTravelMinutes, dayIndex),
      stops,
      legs,
      estimatedFlow: buildEstimatedDayFlow(stops, legs),
    };
  });

  const plannedStops = days.reduce((sum, day) => sum + day.stopCount, 0);

  return {
    title: board.title || board.destinationText || "Itinerary preview",
    destination: board.destinationText || "Current board",
    overview:
      plannedStops > 0
        ? `${plannedStops} saved stops organized across ${days.length || board.durationDays} day${(days.length || board.durationDays) === 1 ? "" : "s"}, with practical timing estimates based on your current plan.`
        : "Add places to your days to preview route timing, pacing, and map links.",
    assumption: "Timing, conditions, and hours notes are planning estimates, not live checks. Confirm important details before you go.",
    days,
  };
}
