"use client";

import { Bookmark, MapPin } from "lucide-react";
import type { DiscoveryPlace } from "@/data/mock-discovery-places";

interface PlaceRowProps {
  place: DiscoveryPlace;
  isBookmarked: boolean;
  isSelected: boolean;
  onBookmarkToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  attraction: "Attraction",
  food: "Food & Drink",
  nature: "Nature",
  shopping: "Shopping",
  area: "Area",
};

export default function PlaceRow({
  place,
  isBookmarked,
  isSelected,
  onBookmarkToggle,
  onSelect,
}: PlaceRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className="flex w-full items-center gap-3 border-b px-3.5 py-2.5 text-left transition-colors last:border-b-0"
      style={{
        minHeight: 66,
        ...(isBookmarked
          ? {
              background: "#EEF2EB",
              borderLeft: "3px solid #163B2C",
              borderBottomColor: "rgba(31, 42, 34, 0.08)",
            }
          : {
              borderBottomColor: "rgba(31, 42, 34, 0.08)",
            }),
        ...(isSelected
          ? {
              outline: "1px solid rgba(22, 59, 44, 0.28)",
              background: isBookmarked ? "#EEF2EB" : "#F3F6F1",
            }
          : {}),
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(31, 42, 34, 0.06)" }}
      >
        <MapPin
          className="h-4 w-4"
          strokeWidth={1.5}
          style={{ color: "var(--wb-muted)" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[color:var(--wb-ink)]">
          {place.name}
        </p>
        <span className="text-xs text-[color:var(--wb-muted)]">
          {typeLabels[place.type] || place.type}
        </span>
      </div>

      <button
        type="button"
        aria-label={
          isBookmarked
            ? `Remove ${place.name} from saved`
            : `Save ${place.name}`
        }
        aria-pressed={isBookmarked}
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkToggle(place.id);
        }}
        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[color:var(--wb-sage-light)] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: "var(--wb-forest)" }}
      >
        <Bookmark
          className="h-4 w-4 transition-all duration-200"
          strokeWidth={1.75}
          style={{
            fill: isBookmarked ? "var(--wb-forest)" : "none",
            color: isBookmarked ? "var(--wb-forest)" : "var(--wb-muted)",
          }}
        />
      </button>
    </button>
  );
}
