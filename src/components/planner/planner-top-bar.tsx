"use client";

// ------------------------------------------------------------------
// Sticky top bar — trip name, pace badge, duration, auto-save
// ------------------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";

export interface PlannerTopBarProps {
  onTogglePanel: () => void;
  panelOpen: boolean;
  onPreviewItinerary?: () => void;
}

// ------------------------------------------------------------------
// Pace badge styling (spec §3)
// ------------------------------------------------------------------

const PACE_STYLES: Record<string, string> = {
  relaxed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  balanced:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  packed:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
};

// ------------------------------------------------------------------
// Auto-save indicator helpers
// ------------------------------------------------------------------

type SaveStatus = "saved" | "unsaved" | "failed";

function SaveDot({ status }: { status: SaveStatus }) {
  const colors: Record<SaveStatus, string> = {
    saved: "bg-emerald-500",
    unsaved: "bg-amber-400",
    failed: "bg-red-500",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[status]}`}
    />
  );
}

function SaveLabel({ status }: { status: SaveStatus }) {
  const labels: Record<SaveStatus, string> = {
    saved: "Auto-saved",
    unsaved: "Unsaved",
    failed: "Auto-save failed",
  };
  return (
    <span className="text-xs text-zinc-500 dark:text-zinc-400">
      {labels[status]}
    </span>
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function PlannerTopBar({ onTogglePanel, panelOpen, onPreviewItinerary }: PlannerTopBarProps) {
  const board = useTripStore((s) => s.board);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const prevBoardRef = useRef(board);

  // Track board mutations to toggle save status
  useEffect(() => {
    if (board !== prevBoardRef.current) {
      prevBoardRef.current = board;
      setSaveStatus("unsaved");
      const t = setTimeout(() => setSaveStatus("saved"), 2000);
      return () => clearTimeout(t);
    }
  }, [board]);

  if (!board) return null;

  const paceStyle = PACE_STYLES[board.pace] ?? PACE_STYLES.balanced;

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 bg-white/95 px-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      {/* Left */}
      <div className="flex items-center gap-2">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onTogglePanel}
          className="flex items-center justify-center rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 md:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label={panelOpen ? "Hide panel" : "Show panel"}
        >
          {panelOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      {/* Center — trip info */}
      <div className="flex items-center gap-2 truncate text-center">
        <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {board.destinationText || board.title || "Untitled Trip"}
        </span>
        <span className="hidden text-xs text-zinc-400 sm:inline">·</span>
        <span className="hidden text-xs text-zinc-500 sm:inline">
          {board.durationDays} {board.durationDays === 1 ? "day" : "days"}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${paceStyle}`}
        >
          {board.pace}
        </span>
      </div>

      {/* Right — preview itinerary + auto-save indicator */}
      <div className="flex items-center gap-2">
        {onPreviewItinerary && (
          <button
            type="button"
            onClick={onPreviewItinerary}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            Preview Itinerary
          </button>
        )}
        <SaveDot status={saveStatus} />
        <SaveLabel status={saveStatus} />
      </div>
    </header>
  );
}
