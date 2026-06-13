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
    "bg-[#E7F1E8] text-[#2E6F40]",
  balanced:
    "bg-[#F0DAD5] text-[#6F493B]",
  packed:
    "bg-amber-100 text-amber-800",
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
      <h2 className="text-base font-semibold text-[#1F2A22]">
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
            className="flex items-center justify-between rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-3 py-2.5 text-left transition-colors hover:bg-[#E7F1E8]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1F2A22]">
                Day {day.dayNumber}
              </p>
              {day.title && (
                <p className="truncate text-xs text-[#667066]">
                  {day.title}
                </p>
              )}
            </div>
            <span
              className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                count > 0
                  ? "bg-[#E7F1E8] text-[#2E6F40]"
                  : "bg-[#F7F4EF] text-[#667066]"
              }`}
            >
              {count} {count === 1 ? "place" : "places"}
            </span>
          </button>
        ))}
      </div>

      {/* Total stats footer */}
      <div className="rounded-lg border border-[#DED6CC] bg-[#FFFDFC] p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#667066]">
          Trip Stats
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#1F2A22]">
          <span>
            <span className="text-[#667066]">Places:</span> {totalPlaces} saved
            ({totalAssigned} assigned)
          </span>

          <span>
            <span className="text-[#667066]">Pace:</span>{" "}
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
              <span className="text-[#667066]">Budget:</span>{" "}
              {BUDGET_LABELS[board.budgetLevel] ?? board.budgetLevel}
            </span>
          )}

          <span>
            <span className="text-[#667066]">Duration:</span>{" "}
            {board.durationDays}{" "}
            {board.durationDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
}
