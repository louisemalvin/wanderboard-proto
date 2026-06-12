"use client";

import { useState } from "react";
import type { TripPace, BudgetLevel } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface OptionalDetails {
  destination: string;
  durationDays: number;
  pace: TripPace;
  budgetLevel: BudgetLevel;
  interests: string;
}

export const DEFAULT_DETAILS: OptionalDetails = {
  destination: "",
  durationDays: 1,
  pace: "balanced",
  budgetLevel: "medium",
  interests: "",
};

export interface PromptCardProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  details: OptionalDetails;
  onDetailsChange: (details: OptionalDetails) => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function PromptCard({
  prompt,
  onPromptChange,
  details,
  onDetailsChange,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);

  function handleDetailsField<K extends keyof OptionalDetails>(
    field: K,
    value: OptionalDetails[K]
  ) {
    onDetailsChange({ ...details, [field]: value });
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="6 days in Tokyo, balanced pace, food + shopping + nature..."
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
      />

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {expanded ? "Hide optional details" : "Add optional details"}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Destination */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Destination
            </label>
            <input
              type="text"
              value={details.destination}
              onChange={(e) =>
                handleDetailsField("destination", e.target.value)
              }
              placeholder="e.g. Tokyo"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={details.durationDays}
              onChange={(e) =>
                handleDetailsField(
                  "durationDays",
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Pace */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Pace
            </label>
            <select
              value={details.pace}
              onChange={(e) =>
                handleDetailsField("pace", e.target.value as TripPace)
              }
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="packed">Packed</option>
            </select>
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Budget
            </label>
            <select
              value={details.budgetLevel}
              onChange={(e) =>
                handleDetailsField(
                  "budgetLevel",
                  e.target.value as BudgetLevel
                )
              }
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Interests */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Interests
            </label>
            <input
              type="text"
              value={details.interests}
              onChange={(e) =>
                handleDetailsField("interests", e.target.value)
              }
              placeholder="food, nature, shopping, culture..."
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
