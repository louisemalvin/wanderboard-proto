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
    "bg-[#F0DAD5] text-[#6F493B]",
  area: "bg-[#E7F1E8] text-[#2E6F40]",
  hotel:
    "bg-[#E7F1E8] text-[#2E6F40]",
  food: "bg-orange-100 text-orange-800",
  cafe:
    "bg-[#F0DAD5] text-[#6F493B]",
  shopping:
    "bg-[#F0DAD5] text-[#6F493B]",
  nature:
    "bg-[#E7F1E8] text-[#2E6F40]",
  ticket: "bg-red-100 text-red-700",
  custom:
    "bg-[#F7F4EF] text-[#667066]",
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
          ? "border-[#2E6F40]/45 bg-[#E7F1E8] ring-1 ring-[#2E6F40]/20"
          : "border-[#DED6CC] bg-[#FFFDFC]"
      } ${onClick ? "cursor-pointer hover:border-[#BFCDBF] hover:shadow-sm" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium text-[#1F2A22]">
              {place.name}
            </h4>
            <span
              className={
                `inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase leading-none ` +
                (TYPE_STYLES[place.type] ??
                  "bg-[#F7F4EF] text-[#667066]")
              }
            >
              {place.type}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-[#667066]">
            {place.description}
          </p>

          {place.tags && place.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {place.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-[#667066]/75"
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
