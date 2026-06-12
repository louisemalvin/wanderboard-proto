"use client";

// ------------------------------------------------------------------
// Reusable place card — shared across Places, Day, and All panels
// ------------------------------------------------------------------

import type { Place, PlaceType } from "@/lib/trip-types";
import type { ReactNode } from "react";

export interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
  isHighlighted?: boolean;
  actions?: ReactNode;
}

// ------------------------------------------------------------------
// Type badge colours (spec §9)
// ------------------------------------------------------------------

const TYPE_STYLES: Record<PlaceType, string> = {
  attraction:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
  area: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  hotel:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  food: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
  cafe:
    "bg-amber-800/20 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
  shopping:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300",
  nature:
    "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300",
  ticket: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  custom:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function PlaceCard({
  place,
  onClick,
  isHighlighted = false,
  actions,
}: PlaceCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition-colors ${
        isHighlighted
          ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/50"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/80"
      } ${onClick ? "cursor-pointer hover:shadow-sm" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {place.name}
            </h4>
            <span
              className={
                `inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ` +
                (TYPE_STYLES[place.type] ??
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400")
              }
            >
              {place.type}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {place.description}
          </p>

          {place.tags && place.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-zinc-400 dark:text-zinc-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
