"use client";

// ------------------------------------------------------------------
// ItineraryReadout — formatted day-by-day itinerary readout from the
// current trip board. Reads directly from the Zustand store.
// ------------------------------------------------------------------

import { useTripStore } from "@/stores/trip-store";
import type { Place, PlaceType } from "@/lib/trip-types";
import { formatDuration, formatMoneyRange } from "@/lib/format";

// ------------------------------------------------------------------
// Place type badge styling
// ------------------------------------------------------------------

const TYPE_BADGES: Record<PlaceType, { label: string; style: string }> = {
  attraction: {
    label: "Attraction",
    style: "bg-[#F0DAD5] text-[#6F493B]",
  },
  area: {
    label: "Area",
    style: "bg-[#E7F1E8] text-[#2E6F40]",
  },
  hotel: {
    label: "Hotel",
    style: "bg-[#E7F1E8] text-[#2E6F40]",
  },
  food: {
    label: "Food",
    style: "bg-orange-100 text-orange-800",
  },
  cafe: {
    label: "Café",
    style: "bg-[#F0DAD5] text-[#6F493B]",
  },
  shopping: {
    label: "Shopping",
    style: "bg-[#F0DAD5] text-[#6F493B]",
  },
  nature: {
    label: "Nature",
    style: "bg-[#E7F1E8] text-[#2E6F40]",
  },
  ticket: {
    label: "Ticket",
    style: "bg-rose-100 text-rose-700",
  },
  custom: {
    label: "Custom",
    style: "bg-[#F7F4EF] text-[#667066]",
  },
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getPlaceTypeBadge(type: PlaceType) {
  return TYPE_BADGES[type] ?? TYPE_BADGES.custom;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function ItineraryReadout() {
  const board = useTripStore((s) => s.board);

  if (!board) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[#667066]">No trip loaded.</p>
      </div>
    );
  }

  // ---- Build per-day stops ----
  const dayStops = board.days.map((day) => {
    const plan = board.dayPlans.find((p) => p.dayId === day.id);
    const assignedIds = plan?.assignedPlaceIds ?? [];
    const places = assignedIds
      .map((id) => board.savedPlaces[id])
      .filter((p): p is Place => p !== undefined);
    return { day, places };
  });

  // ---- Budget estimates ----
  const allAssignedPlaces = Object.values(board.savedPlaces).filter((p) =>
    board.dayPlans.some((plan) => plan.assignedPlaceIds.includes(p.id)),
  );

  let budgetMin = 0;
  let budgetMax = 0;
  let budgetCurrency = "USD";
  for (const place of allAssignedPlaces) {
    if (place.estimatedCost) {
      budgetMin += place.estimatedCost.min;
      budgetMax += place.estimatedCost.max;
      budgetCurrency = place.estimatedCost.currency;
    }
  }

  // ---- Total duration ----
  let totalDurationMin = 0;
  for (const place of allAssignedPlaces) {
    if (place.estimatedDurationMinutes) {
      totalDurationMin += place.estimatedDurationMinutes;
    }
  }

  // ---- PACE label ----
  const PACE_LABELS: Record<string, string> = {
    relaxed: "Relaxed",
    balanced: "Balanced",
    packed: "Packed",
  };

  const PACE_STYLES: Record<string, string> = {
    relaxed: "bg-[#E7F1E8] text-[#2E6F40]",
    balanced: "bg-[#F0DAD5] text-[#6F493B]",
    packed: "bg-amber-100 text-amber-800",
  };

  // ---- Refresh: re-reads from store by accessing fresh state ----
  const handleRefresh = () => {
    // Force a re-render by touching store state
    // The component already subscribes to `board`, so this just
    // triggers React to reconcile.
    useTripStore.setState({ previewPlaceId: null });
  };

  return (
    <div className="space-y-6">
      {/* Trip header */}
      <div>
        <h2 className="text-lg font-bold text-[#1F2A22]">
          {board.title || board.destinationText || "Untitled Trip"}
        </h2>
        {board.destinationText && (
          <p className="text-sm text-[#667066]">
            {board.destinationText}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#667066]">
            {board.durationDays} {board.durationDays === 1 ? "day" : "days"}
          </span>
          <span className="text-xs text-[#B6AA9F]">·</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${
              PACE_STYLES[board.pace] ?? PACE_STYLES.balanced
            }`}
          >
            {PACE_LABELS[board.pace] ?? board.pace}
          </span>
          {board.budgetLevel && (
            <>
              <span className="text-xs text-[#B6AA9F]">·</span>
              <span className="text-[10px] font-medium uppercase text-[#667066]">
                {board.budgetLevel} budget
              </span>
            </>
          )}
        </div>
      </div>

      {/* Day-by-day itinerary */}
      {dayStops.length === 0 && (
        <p className="text-sm text-[#667066]">
          No days have been planned yet.
        </p>
      )}

      {dayStops.map(({ day, places }) => (
        <div key={day.id}>
          <h3 className="mb-2 text-sm font-semibold text-[#1F2A22]">
            Day {day.dayNumber}: {day.title}
          </h3>
          {day.summary && (
            <p className="mb-2 text-xs italic text-[#667066]">
              {day.summary}
            </p>
          )}
          {places.length === 0 ? (
            <p className="text-xs text-[#667066]">
              No stops assigned yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {places.map((place) => {
                const badge = getPlaceTypeBadge(place.type);
                return (
                  <li
                    key={place.id}
                    className="rounded-lg border border-[#DED6CC] bg-[#FFFDFC] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1F2A22]">
                          {place.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#667066]">
                          {place.city}, {place.country}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${badge.style}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    {(place.estimatedCost || place.estimatedDurationMinutes) && (
                      <div className="mt-1.5 flex flex-wrap gap-3">
                        {place.estimatedCost && (
                          <span className="text-[10px] text-[#667066]">
                            {formatMoneyRange(
                              place.estimatedCost.min,
                              place.estimatedCost.max,
                              place.estimatedCost.currency,
                            )}
                          </span>
                        )}
                        {place.estimatedDurationMinutes && (
                          <span className="text-[10px] text-[#667066]">
                            {formatDuration(place.estimatedDurationMinutes)}
                          </span>
                        )}
                      </div>
                    )}
                    {place.description && (
                      <p className="mt-1 text-[11px] leading-relaxed text-[#667066]">
                        {place.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {/* Assumptions */}
      {board.assumptions.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#667066]">
            Assumptions
          </h3>
          <ul className="space-y-1">
            {board.assumptions.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-[#667066]"
              >
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#667066]" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {board.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800">
            Warnings
          </h3>
          <ul className="space-y-1">
            {board.warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-amber-800"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Budget estimate total */}
      {allAssignedPlaces.length > 0 && (
        <div className="rounded-lg border border-[#DED6CC] bg-[#FFFDFC] p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#667066]">
            Budget Estimate
          </h3>
          <p className="text-lg font-bold text-[#1F2A22]">
            {formatMoneyRange(budgetMin, budgetMax, budgetCurrency)}
          </p>
          {totalDurationMin > 0 && (
            <p className="mt-0.5 text-xs text-[#667066]">
              Estimated total time: {formatDuration(totalDurationMin)}
            </p>
          )}
          <p className="mt-1 text-[10px] text-[#667066]/80">
            Per-person estimates. Actual costs may vary.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-[11px] leading-relaxed text-yellow-800">
          <strong>Check before you go:</strong> Hours, prices, and
          availability change. Verify details directly with each location
          before your trip. Wanderboard provides planning suggestions
          only — not real-time data.
        </p>
      </div>

      {/* Refresh button */}
      <button
        type="button"
        onClick={handleRefresh}
        className="w-full rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-4 py-2 text-xs font-medium text-[#667066] transition-colors hover:bg-[#F7F4EF]"
      >
        Refresh Preview
      </button>
    </div>
  );
}
