"use client";

import type { RecentTrip } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface RecentTripsListProps {
  trips: RecentTrip[];
  onSelect: (tripId: string) => void;
  isLoading: boolean;
  error: string | null;
}

// ------------------------------------------------------------------
// Relative time helper
// ------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "Unknown";

  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "a few seconds ago";
  if (diffMin < 2) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 2) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 2) return "1 day ago";
  if (diffDay < 30) return `${diffDay} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ------------------------------------------------------------------
// Pace badge color
// ------------------------------------------------------------------

const PACE_BADGE: Record<string, string> = {
  relaxed:
    "bg-[#E7F1E8] text-[#2E6F40]",
  balanced:
    "bg-[#F0DAD5] text-[#6F493B]",
  packed:
    "bg-red-100 text-red-700",
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function RecentTripsList({
  trips,
  onSelect,
  isLoading,
  error,
}: RecentTripsListProps) {
  if (isLoading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-8 text-sm text-[#667066]">
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading recent trips...
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <p className="text-xs text-red-600">{error}</p>
      </Section>
    );
  }

  if (trips.length === 0) {
    return (
      <Section>
        <p className="py-4 text-center text-sm text-[#667066]">
          No recent trips yet.
        </p>
      </Section>
    );
  }

  const displayed = trips.slice(0, 10);

  return (
    <Section>
      <div className="space-y-2">
        {displayed.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onClick={() => onSelect(trip.id)}
            className="flex w-full items-center gap-3 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-4 py-3 text-left transition-colors hover:bg-[#E7F1E8]"
          >
            {/* Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7F1E8] text-[#2E6F40]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1F2A22]">
                {trip.title || "Untitled trip"}
              </p>
              <p className="truncate text-xs text-[#667066]">
                {trip.destinationText
                  ? `${trip.destinationText} · ${trip.durationDays} ${trip.durationDays === 1 ? "day" : "days"} · ${trip.placeCount} ${trip.placeCount === 1 ? "place" : "places"}`
                  : `${trip.durationDays} ${trip.durationDays === 1 ? "day" : "days"} · ${trip.placeCount} ${trip.placeCount === 1 ? "place" : "places"}`}
              </p>
            </div>

            {/* Badge + time */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ${
                  PACE_BADGE[trip.pace] ?? "bg-[#F7F4EF] text-[#667066]"
                }`}
              >
                {trip.pace}
              </span>
              <span className="text-[10px] text-[#667066]/80">
                {formatRelativeTime(trip.updatedAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------
// Section wrapper
// ------------------------------------------------------------------

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full">
      <h2 className="mb-3 text-sm font-semibold text-[#1F2A22]">
        Recent trips
      </h2>
      {children}
    </section>
  );
}
