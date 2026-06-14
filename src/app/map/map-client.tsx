"use client";

// ------------------------------------------------------------------
// Map & Discovery screen client orchestrator
// Assembles map canvas, search, filter chips, controls, bottom sheet
// ------------------------------------------------------------------

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";
import type { Place } from "@/lib/trip-types";
import TripRequiredState from "@/components/shared/trip-required-state";
import MapDiscoverySearch from "@/components/map-discovery/map-discovery-search";
import MapDiscoveryFilterChips from "@/components/map-discovery/map-discovery-filter-chips";
import MapDiscoveryControls from "@/components/map-discovery/map-discovery-controls";
import PlacesBottomSheet from "@/components/map-discovery/places-bottom-sheet";
import PlaceRow from "@/components/map-discovery/place-row";
import MoriChat from "@/components/guide/mori-chat";
import {
  discoveryPlaces,
  filterChips,
} from "@/data/mock-discovery-places";
import type { DiscoveryPlace } from "@/data/mock-discovery-places";

const DiscoveryLeafletMap = dynamic(
  () => import("@/components/map-discovery/discovery-leaflet-map"),
  { ssr: false },
);

type MapCommand = {
  id: number;
  type: "zoom-in" | "zoom-out" | "recenter";
};

function discoveryToPlace(place: DiscoveryPlace): Place {
  return {
    id: place.id,
    name: place.name,
    type: place.type,
    location: { lat: place.lat, lng: place.lng },
    city: place.city,
    country: place.city === "Tokyo" ? "JP" : "US",
    description: place.description,
    estimatedDurationMinutes: place.type === "food" ? 75 : 60,
    tags: [place.type],
  };
}

export default function MapClient() {
  const currentTripId = useTripStore((s) => s.currentTripId);
  const board = useTripStore((s) => s.board);
  const savePlace = useTripStore((s) => s.savePlace);
  const unsavePlace = useTripStore((s) => s.unsavePlace);

  // --- State ---
  const [hydrated, setHydrated] = useState(false);
  const [storeHasTrip, setStoreHasTrip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterId, setSelectedFilterId] = useState("all");
  const [mapCommand, setMapCommand] = useState<MapCommand | null>(null);

  useEffect(() => {
    const onHydrated = () => {
      setHydrated(true);
      setStoreHasTrip(Boolean(useTripStore.getState().board));
    };

    if (useTripStore.persist.hasHydrated()) {
      onHydrated();
    }

    const unsubFinish = useTripStore.persist.onFinishHydration(onHydrated);
    useTripStore.persist.rehydrate();
    return () => {
      unsubFinish();
    };
  }, []);

  // --- Derived: filtered places ---
  const filteredPlaces = useMemo(() => {
    const selectedChip = filterChips.find((c) => c.id === selectedFilterId);
    const filterType = selectedChip?.type || "all";

    return discoveryPlaces.filter((place) => {
      // Apply type filter
      if (filterType !== "all" && place.type !== filterType) return false;

      // Apply search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!place.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [selectedFilterId, searchQuery]);

  // --- Derived: flagged markers ---
  const markerHighlightIds = useMemo(() => {
    if (selectedFilterId === "all") return null; // no highlighting
    const selectedChip = filterChips.find((c) => c.id === selectedFilterId);
    if (!selectedChip || selectedChip.type === "all") return null;
    return discoveryPlaces
      .filter((p) => p.type === selectedChip.type)
      .map((p) => p.id);
  }, [selectedFilterId]);

  // --- Handlers ---
  const handleFilterSelect = useCallback((id: string) => {
    setSelectedFilterId(id);
  }, []);

  const handleZoomIn = useCallback(() => {
    setMapCommand({ id: Date.now(), type: "zoom-in" });
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapCommand({ id: Date.now(), type: "zoom-out" });
  }, []);

  const handleRecenter = useCallback(() => {
    setMapCommand({ id: Date.now(), type: "recenter" });
  }, []);

  const handleBookmarkToggle = useCallback((id: string) => {
    const tripId = currentTripId ?? useTripStore.getState().currentTripId;
    const tripBoard = board ?? useTripStore.getState().board;
    if (!tripId || !tripBoard) return;

    if (tripBoard.savedPlaces[id]) {
      unsavePlace(tripId, id);
      return;
    }

    const place = discoveryPlaces.find((item) => item.id === id);
    if (place) {
      savePlace(tripId, discoveryToPlace(place));
    }
  }, [board, currentTripId, savePlace, unsavePlace]);

  // --- Bottom sheet footer: hand off saved places to planning ---
  const savedPlacesCount = Object.keys(board?.savedPlaces ?? {}).length;
  const bottomSheetFooter = (
    <Link
      href={savedPlacesCount > 0 ? "/itinerary" : "#"}
      aria-disabled={savedPlacesCount === 0}
      className={`flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
        savedPlacesCount > 0
          ? "hover:bg-app-bg"
          : "pointer-events-none opacity-65"
      }`}
    >
      <div className="shrink-0 w-9 h-9 rounded-full bg-forest-surface flex items-center justify-center">
        <Bookmark className="w-4 h-4 text-forest" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-forest font-sans">
          {savedPlacesCount > 0 ? "Plan itinerary" : "Save places to start planning"}
        </span>
        <p className="mt-0.5 text-xs text-muted">
          {savedPlacesCount > 0
            ? "Assign saved destinations into days."
            : "Bookmark destinations from the list first."}
        </p>
      </div>
      {savedPlacesCount > 0 && (
        <span className="text-xs text-muted font-sans bg-app-bg rounded-full px-2 py-0.5">
          {savedPlacesCount}
        </span>
      )}
    </Link>
  );

  // --- Guard: no trip selected ---
  if (hydrated && !storeHasTrip) {
    return (
      <TripRequiredState
        title="Choose or create a trip first"
        description="Destination discovery saves places into your active trip. Start from the project hub, then come back to the map."
        primaryHref="/home"
        primaryLabel="Go to home"
      />
    );
  }

  return (
    <>
    <div className="relative h-[calc(100vh-7rem)] min-h-[620px] w-full bg-app-bg md:h-screen md:min-h-0 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Screen reader heading for accessibility */}
      <h1 className="sr-only">Map &amp; Discovery</h1>
      <div className="relative min-h-0 overflow-hidden lg:border-r lg:border-border">
        <DiscoveryLeafletMap
          places={discoveryPlaces}
          highlightedIds={markerHighlightIds}
          command={mapCommand}
        />

        {/* Floating search bar */}
        <MapDiscoverySearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search places..."
        />

        {/* Floating filter chips */}
        <MapDiscoveryFilterChips
          chips={filterChips}
          selectedId={selectedFilterId}
          onSelect={handleFilterSelect}
        />

        {/* Zoom controls */}
        <MapDiscoveryControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
        />
      </div>

      {/* Bottom sheet with place rows */}
      <PlacesBottomSheet
        title="Discover places"
        count={filteredPlaces.length}
        footer={bottomSheetFooter}
      >
        {filteredPlaces.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted font-sans">
              No matching places found.
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <PlaceRow
              key={place.id}
              place={{
                ...place,
                isBookmarked: Boolean(board?.savedPlaces[place.id]) || place.isBookmarked,
              }}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))
        )}
      </PlacesBottomSheet>
    </div>
    <MoriChat
      placeholder="Ask Mori to suggest places..."
      emptyHint="Ask Mori for nearby spots, hidden gems, or restaurants in your destination."
    />
    </>
  );
}
