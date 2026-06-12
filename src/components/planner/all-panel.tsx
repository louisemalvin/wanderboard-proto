"use client";

// ------------------------------------------------------------------
// All tab — per-day summary cards + total stats
// ------------------------------------------------------------------

import { useTripStore } from "@/stores/trip-store";

// ------------------------------------------------------------------
// Pace badge styling (same palette as top bar)
// ------------------------------------------------------------------

const PACE_STYLES: Record<string, string> = {
  relaxed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  balanced:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  packed:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
};

const BUDGET_LABELS: Record<string, string> = {
  low: "$",
  medium: "$$",
  high: "$$$",
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function AllPanel() {
  const board = useTripStore((s) => s.board);
  const setActiveTab = useTripStore((s) => s.setActiveTab);

  if (!board) return null;

  // ------------------------------------------------------------------
  // Aggregate stats
  // ------------------------------------------------------------------

  const totalPlaces = Object.keys(board.savedPlaces).length;
  const totalAssigned = board.dayPlans.reduce(
    (sum, p) => sum + p.assignedPlaceIds.length,
    0
  );

  const paceStyle = PACE_STYLES[board.pace] ?? PACE_STYLES.balanced;

  // ------------------------------------------------------------------
  // Per-day data
  // ------------------------------------------------------------------

  const daySummaries = board.days.map((day) => {
    const plan = board.dayPlans.find((p) => p.dayId === day.id);
    const count = plan?.assignedPlaceIds.length ?? 0;
    return { day, count };
  });

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Title */}
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Trip Overview
      </h2>

      {/* Per-day cards */}
      <div className="flex flex-col gap-2">
        {daySummaries.map(({ day, count }) => (
          <button
            key={day.id}
            type="button"
            onClick={() =>
              setActiveTab(`day:${day.id}`)
            }
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Day {day.dayNumber}
              </p>
              {day.title && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {day.title}
                </p>
              )}
            </div>
            <span
              className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                count > 0
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              }`}
            >
              {count} {count === 1 ? "place" : "places"}
            </span>
          </button>
        ))}
      </div>

      {/* Total stats footer */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/80">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Trip Stats
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-700 dark:text-zinc-300">
          <span>
            <span className="text-zinc-400">Places:</span> {totalPlaces} saved
            ({totalAssigned} assigned)
          </span>

          <span>
            <span className="text-zinc-400">Pace:</span>{" "}
            <span
              className={
                `inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ` +
                paceStyle
              }
            >
              {board.pace}
            </span>
          </span>

          {board.budgetLevel && (
            <span>
              <span className="text-zinc-400">Budget:</span>{" "}
              {BUDGET_LABELS[board.budgetLevel] ?? board.budgetLevel}
            </span>
          )}

          <span>
            <span className="text-zinc-400">Duration:</span>{" "}
            {board.durationDays}{" "}
            {board.durationDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
}
