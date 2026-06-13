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
    <div className="w-full rounded-xl border border-[#DED6CC] bg-[#FFFDFC] p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#1F2A22]">
        {trip.title || "Untitled trip"}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#667066]">
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

        <span className="inline-flex items-center rounded-full border border-[#BFCDBF] bg-[#E7F1E8] px-2 py-0.5 text-[11px] font-medium text-[#2E6F40]">
          {PACE_LABELS[trip.pace] ?? trip.pace}
        </span>

        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {trip.placeCount} {trip.placeCount === 1 ? "place" : "places"}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-[#667066]/80">
        Last edited {formatDate(trip.updatedAt)}
      </p>
    </div>
  );
}
