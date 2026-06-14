"use client";

import { ArrowRight } from "lucide-react";
import type { RecentTrip } from "@/lib/trip-types";

interface BoardCardProps {
  trip: RecentTrip;
  onOpen: (tripId: string) => void;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getTripName(trip: RecentTrip) {
  if (trip.destinationText) return trip.destinationText;
  return trip.title.replace(/ trip$/i, "") || "Untitled trip";
}

export default function BoardCard({ trip, onOpen }: BoardCardProps) {
  const name = getTripName(trip);
  const isUntitled = !trip.destinationText && (!trip.title || trip.title === "Untitled trip");

  return (
    <button
      type="button"
      onClick={() => onOpen(trip.id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--wb-forest)]"
      style={{ minHeight: 170 }}
    >
      <div className="h-14 bg-[color:var(--wb-sage-light)]">
        <svg
          className="h-full w-full opacity-25"
          viewBox="0 0 400 56"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0 40 C40 20, 80 50, 120 30 S200 48, 240 28 S320 44, 400 24"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[color:var(--wb-moss)]"
          />
          <path
            d="M0 46 C40 30, 80 56, 120 40 S200 52, 240 38 S320 50, 400 36"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[color:var(--wb-moss)]"
          />
        </svg>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className={`text-base leading-tight text-[color:var(--wb-ink)] ${isUntitled ? "italic text-[color:var(--wb-muted)]" : "font-display"}`}>
            {isUntitled ? "Untitled trip" : name}
          </h3>
          <p className="mt-1.5 text-sm text-[color:var(--wb-muted)]">
            {trip.durationDays} {trip.durationDays === 1 ? "day" : "days"}
            {trip.placeCount > 0 ? ` · ${trip.placeCount} ${trip.placeCount === 1 ? "place" : "places"}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-[color:var(--wb-muted)]">
            {isUntitled ? "Draft" : `Updated ${formatUpdatedAt(trip.updatedAt)}`}
          </p>
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--wb-forest)] transition-colors group-hover:text-[color:var(--wb-forest-hover)]">
          Continue
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
