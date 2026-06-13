"use client";

// ------------------------------------------------------------------
// Horizontal tab bar: Places, Day 1…N, All
// ------------------------------------------------------------------

import { useTripStore } from "@/stores/trip-store";

export function LayerTabs() {
  const board = useTripStore((s) => s.board);
  const activeTab = useTripStore((s) => s.activeTab);
  const setActiveTab = useTripStore((s) => s.setActiveTab);

  if (!board) return null;

  const getDayCount = (dayId: string): number => {
    const plan = board.dayPlans.find((p) => p.dayId === dayId);
    return plan?.assignedPlaceIds.length ?? 0;
  };

  const tabClass = (isActive: boolean) =>
    `relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? "text-[#2E6F40] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#2E6F40]"
        : "text-[#667066] hover:text-[#1F2A22]"
    }`;

  return (
    <nav className="sticky top-12 z-10 flex gap-0 overflow-x-auto border-b border-[#DED6CC] bg-[#F7F4EF]/95 px-2 backdrop-blur">
      {/* Places */}
      <button
        type="button"
        onClick={() => setActiveTab("places")}
        className={tabClass(activeTab === "places")}
      >
        Places
      </button>

      {/* Days */}
      {board.days.map((day) => {
        const count = getDayCount(day.id);
        const tabId: `day:${string}` = `day:${day.id}`;
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={tabClass(activeTab === tabId)}
          >
            Day {day.dayNumber}
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E7F1E8] px-1.5 text-[10px] font-bold text-[#2E6F40]">
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* All */}
      <button
        type="button"
        onClick={() => setActiveTab("all")}
        className={tabClass(activeTab === "all")}
      >
        All
      </button>
    </nav>
  );
}
