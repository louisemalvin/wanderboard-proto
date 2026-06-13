import type { Place, TripBoard } from "@/lib/trip-types";

export type TransitMode = "Walk" | "Transit" | "Taxi";

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
  stops: Place[];
  legs: ItineraryAnalysisLeg[];
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
  "Calculating route timing between stops...",
  "Checking opening-hour risk windows...",
  "Looking at weather and pacing...",
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
  "Saves time, but check live traffic before leaving.",
];
const WEATHER_NOTES = [
  "Outdoor-heavy day. Check rain and heat before committing to the order.",
  "Mostly indoor-friendly. Good backup shape if the weather turns.",
  "Balanced indoor/outdoor mix. Keep one flexible stop as a weather buffer.",
];
const HOURS_NOTES = [
  "Verify hours for the first major stop before leaving.",
  "Several stops may have shorter evening hours; earlier is safer.",
  "Opening hours look low-risk, but confirm ticketed places before you go.",
];
const WINDOWS = ["Start 9:30-10:30", "Start 10:00-11:00", "Start after lunch", "Late afternoon works"];

function formatQuery(place: Place) {
  if (place.location) {
    return `${place.location.lat},${place.location.lng}`;
  }
  return [place.name, place.city, place.country].filter(Boolean).join(", ");
}

function buildGoogleMapsUrl(from: Place, to: Place, mode: TransitMode) {
  const travelMode = mode === "Walk" ? "walking" : mode === "Transit" ? "transit" : "driving";
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
      mode: "Transit",
      durationMinutes: baseline,
      distance,
      cost: "$2-5",
      mapUrl: buildGoogleMapsUrl(from, to, "Transit"),
      note: TRANSIT_NOTES[seed % TRANSIT_NOTES.length],
      recommended: true,
    },
    {
      mode: "Taxi",
      durationMinutes: Math.max(8, baseline - 8),
      distance,
      cost: "$12-24",
      mapUrl: buildGoogleMapsUrl(from, to, "Taxi"),
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

export function buildMockItineraryAnalysis(board: TripBoard | null): ItineraryAnalysis | null {
  if (!board) return null;

  const days = board.days.map((day, dayIndex) => {
    const stops = getAssignedPlaces(board, day.id);
    const legs = buildLegs(stops, day.id, dayIndex);
    const totalTravelMinutes = legs.reduce((sum, leg) => {
      const recommended = leg.options.find((option) => option.recommended) ?? leg.options[0];
      return sum + recommended.durationMinutes;
    }, 0);

    return {
      id: day.id,
      title: `Day ${day.dayNumber}: ${day.title || "Open planning day"}`,
      summary: day.summary || "A flexible day built from your current board order.",
      stopCount: stops.length,
      totalTravelMinutes,
      pacing: getPacing(stops.length, totalTravelMinutes),
      bestWindow: WINDOWS[dayIndex % WINDOWS.length],
      weatherNote: WEATHER_NOTES[dayIndex % WEATHER_NOTES.length],
      openingHoursNote: HOURS_NOTES[dayIndex % HOURS_NOTES.length],
      stops,
      legs,
    };
  });

  const plannedStops = days.reduce((sum, day) => sum + day.stopCount, 0);

  return {
    title: board.title || board.destinationText || "Itinerary preview",
    destination: board.destinationText || "Current board",
    overview:
      plannedStops > 0
        ? `${plannedStops} saved stops organized across ${days.length || board.durationDays} day${(days.length || board.durationDays) === 1 ? "" : "s"}. Route timing is estimated for prototype review.`
        : "Add places to your days to preview route timing, pacing, and map links.",
    assumption: "Mock analysis: route times, weather, and opening-hour notes are demo estimates, not live checks.",
    days,
  };
}
