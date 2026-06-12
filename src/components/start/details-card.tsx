"use client";

import type { RecentTrip } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface DetailsCardProps {
  trip: RecentTrip;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const PACE_LABELS: Record<string, string> = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  packed: "Packed",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function DetailsCard({ trip }: DetailsCardProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {trip.title || "Untitled trip"}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {trip.destinationText && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {trip.destinationText}
          </span>
        )}

        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {trip.durationDays} {trip.durationDays === 1 ? "day" : "days"}
        </span>

        <span className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300">
          {PACE_LABELS[trip.pace] ?? trip.pace}
        </span>

        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {trip.placeCount} {trip.placeCount === 1 ? "place" : "places"}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
        Last edited {formatDate(trip.updatedAt)}
      </p>
    </div>
  );
}
