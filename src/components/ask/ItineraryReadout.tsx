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
    style: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  },
  area: {
    label: "Area",
    style: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  },
  hotel: {
    label: "Hotel",
    style: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  food: {
    label: "Food",
    style: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  },
  cafe: {
    label: "Café",
    style: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  shopping: {
    label: "Shopping",
    style: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  },
  nature: {
    label: "Nature",
    style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  ticket: {
    label: "Ticket",
    style: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  },
  custom: {
    label: "Custom",
    style: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
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
        <p className="text-sm text-zinc-400">No trip loaded.</p>
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
    relaxed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    balanced: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
    packed: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
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
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {board.title || board.destinationText || "Untitled Trip"}
        </h2>
        {board.destinationText && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {board.destinationText}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {board.durationDays} {board.durationDays === 1 ? "day" : "days"}
          </span>
          <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${
              PACE_STYLES[board.pace] ?? PACE_STYLES.balanced
            }`}
          >
            {PACE_LABELS[board.pace] ?? board.pace}
          </span>
          {board.budgetLevel && (
            <>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400">
                {board.budgetLevel} budget
              </span>
            </>
          )}
        </div>
      </div>

      {/* Day-by-day itinerary */}
      {dayStops.length === 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No days have been planned yet.
        </p>
      )}

      {dayStops.map(({ day, places }) => (
        <div key={day.id}>
          <h3 className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Day {day.dayNumber}: {day.title}
          </h3>
          {day.summary && (
            <p className="mb-2 text-xs italic text-zinc-500 dark:text-zinc-400">
              {day.summary}
            </p>
          )}
          {places.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              No stops assigned yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {places.map((place) => {
                const badge = getPlaceTypeBadge(place.type);
                return (
                  <li
                    key={place.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {place.name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
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
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {formatMoneyRange(
                              place.estimatedCost.min,
                              place.estimatedCost.max,
                              place.estimatedCost.currency,
                            )}
                          </span>
                        )}
                        {place.estimatedDurationMinutes && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {formatDuration(place.estimatedDurationMinutes)}
                          </span>
                        )}
                      </div>
                    )}
                    {place.description && (
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
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
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Assumptions
          </h3>
          <ul className="space-y-1">
            {board.assumptions.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {board.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Warnings
          </h3>
          <ul className="space-y-1">
            {board.warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400"
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
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Budget Estimate
          </h3>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatMoneyRange(budgetMin, budgetMax, budgetCurrency)}
          </p>
          {totalDurationMin > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Estimated total time: {formatDuration(totalDurationMin)}
            </p>
          )}
          <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            Per-person estimates. Actual costs may vary.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
        <p className="text-[11px] leading-relaxed text-yellow-800 dark:text-yellow-200">
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
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Refresh Preview
      </button>
    </div>
  );
}
