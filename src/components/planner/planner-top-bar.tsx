"use client";

// ------------------------------------------------------------------
// Sticky top bar — trip name, pace badge, duration, mode selector
// ------------------------------------------------------------------

import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";

export type PlannerMode = "edit" | "view";

export interface PlannerTopBarProps {
  onTogglePanel: () => void;
  panelOpen: boolean;
  mode: PlannerMode;
  onModeChange: (mode: PlannerMode) => void;
}

// ------------------------------------------------------------------
// Pace badge styling (spec §3)
// ------------------------------------------------------------------

const PACE_STYLES: Record<string, string> = {
  relaxed:
    "bg-[#E7F1E8] text-[#2E6F40]",
  balanced:
    "bg-[#F0DAD5] text-[#6F493B]",
  packed:
    "bg-amber-100 text-amber-800",
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function PlannerTopBar({ onTogglePanel, panelOpen, mode, onModeChange }: PlannerTopBarProps) {
  const board = useTripStore((s) => s.board);

  if (!board) return null;

  const paceStyle = PACE_STYLES[board.pace] ?? PACE_STYLES.balanced;

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[#DED6CC] bg-[#FFFDFC] px-3 text-[#1F2A22] shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2">
        {mode === "edit" && (
          <button
            type="button"
            onClick={onTogglePanel}
            className="flex items-center justify-center rounded-md p-1 text-[#667066] hover:bg-[#E7F1E8] hover:text-[#2E6F40] md:hidden"
            aria-label={panelOpen ? "Hide panel" : "Show panel"}
          >
            {panelOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-[#667066] transition-colors hover:text-[#2E6F40]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      {/* Center — trip info */}
      <div className="flex items-center gap-2 truncate text-center">
        <span className="truncate text-sm font-medium text-[#1F2A22]">
          {board.destinationText || board.title || "Untitled Trip"}
        </span>
        <span className="hidden text-xs text-[#B6AA9F] sm:inline">·</span>
        <span className="hidden text-xs text-[#667066] sm:inline">
          {board.durationDays} {board.durationDays === 1 ? "day" : "days"}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${paceStyle}`}
        >
          {board.pace}
        </span>
      </div>

      {/* Right — mode selector + share */}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="planner-mode-selector">
          Trip workspace mode
        </label>
        <select
          id="planner-mode-selector"
          value={mode}
          onChange={(event) => onModeChange(event.target.value as PlannerMode)}
          className="rounded-md border border-[#DED6CC] bg-[#F7F4EF] px-2.5 py-1 text-xs font-medium text-[#1F2A22] transition-colors hover:bg-[#E7F1E8] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#FFFDFC]"
        >
          <option value="edit">Edit mode</option>
          <option value="view">View mode</option>
        </select>
        <button
          type="button"
          className="rounded-md px-2.5 py-1 text-xs font-medium text-[#2E6F40] transition-colors hover:bg-[#E7F1E8] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#FFFDFC]"
        >
          Share
        </button>
      </div>
    </header>
  );
}
