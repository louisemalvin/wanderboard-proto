"use client";

// ------------------------------------------------------------------
// Individual place row within the bottom sheet
// Shows: name, type badge, bookmark toggle button
// Minimum 44px touch targets for all interactive elements
// ------------------------------------------------------------------

import { Bookmark, MapPin } from "lucide-react";
import type { DiscoveryPlace } from "@/data/mock-discovery-places";

interface PlaceRowProps {
  place: DiscoveryPlace;
  onBookmarkToggle: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  attraction: "Attraction",
  food: "Food & Drink",
  nature: "Nature",
  shopping: "Shopping",
  area: "Area",
};

const typeBadgeColors: Record<string, string> = {
  attraction: "bg-clay text-[#6F493B]",
  food: "bg-orange-100 text-orange-800",
  nature: "bg-forest-surface text-forest",
  shopping: "bg-amber-100 text-amber-900",
  area: "bg-app-bg text-muted",
};

export default function PlaceRow({ place, onBookmarkToggle }: PlaceRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0">
      {/* Type icon */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-app-bg flex items-center justify-center">
        <MapPin className="w-4 h-4 text-muted" strokeWidth={1.5} />
      </div>

      {/* Place info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate font-sans">
          {place.name}
        </p>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase leading-none mt-0.5 ${typeBadgeColors[place.type] || "bg-app-bg text-muted"}`}
        >
          {typeLabels[place.type] || place.type}
        </span>
      </div>

      {/* Bookmark toggle */}
      <button
        type="button"
        aria-label={
          place.isBookmarked
            ? `Remove ${place.name} from saved`
            : `Save ${place.name}`
        }
        aria-pressed={place.isBookmarked}
        onClick={() => onBookmarkToggle(place.id)}
        className="flex items-center justify-center w-[44px] h-[44px] shrink-0 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest hover:bg-app-bg"
      >
        <Bookmark
          className={`w-5 h-5 transition-all duration-200 ${
            place.isBookmarked
              ? "fill-forest text-forest"
              : "fill-none text-muted"
          }`}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
