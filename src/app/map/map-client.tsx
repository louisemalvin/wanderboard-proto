"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTripStore } from "@/stores/trip-store";
import type { Place } from "@/lib/trip-types";
import TripRequiredState from "@/components/shared/trip-required-state";
import MapDiscoverySearch from "@/components/map-discovery/map-discovery-search";
import MapDiscoveryFilterChips from "@/components/map-discovery/map-discovery-filter-chips";
import MapDiscoveryControls from "@/components/map-discovery/map-discovery-controls";
import PlacesBottomSheet from "@/components/map-discovery/places-bottom-sheet";
import PlaceRow from "@/components/map-discovery/place-row";
import MoriComposer from "@/components/itinerary/mori-composer";
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
  type: "zoom-in" | "zoom-out" | "recenter" | "focus";
  placeId?: string;
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

const typeLabels: Record<string, string> = {
  attraction: "Attraction",
  food: "Food & Drink",
  nature: "Nature",
  shopping: "Shopping",
  area: "Area",
};

export default function MapClient() {
  const currentTripId = useTripStore((s) => s.currentTripId);
  const board = useTripStore((s) => s.board);
  const savePlace = useTripStore((s) => s.savePlace);
  const unsavePlace = useTripStore((s) => s.unsavePlace);

  const [hydrated, setHydrated] = useState(false);
  const [storeHasTrip, setStoreHasTrip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterId, setSelectedFilterId] = useState("all");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
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

  const savedIds = useMemo(
    () => new Set(Object.keys(board?.savedPlaces ?? {})),
    [board?.savedPlaces],
  );
  const savedPlacesCount = savedIds.size;

  const filteredPlaces = useMemo(() => {
    const selectedChip = filterChips.find((c) => c.id === selectedFilterId);
    const filterType = selectedChip?.type || "all";

    let results = discoveryPlaces.filter((place) => {
      if (filterType !== "all" && place.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!place.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (activeTab === "saved") {
      results = results.filter((place) => savedIds.has(place.id));
    }

    return results;
  }, [selectedFilterId, searchQuery, activeTab, savedIds]);

  const markerHighlightIds = useMemo(() => {
    if (selectedFilterId === "all") return null;
    const selectedChip = filterChips.find((c) => c.id === selectedFilterId);
    if (!selectedChip || selectedChip.type === "all") return null;
    return discoveryPlaces
      .filter((p) => p.type === selectedChip.type)
      .map((p) => p.id);
  }, [selectedFilterId]);

  const selectedPlace = useMemo(
    () => discoveryPlaces.find((p) => p.id === selectedPlaceId) ?? null,
    [selectedPlaceId],
  );
  const isSelectedPlaceSaved = selectedPlaceId ? savedIds.has(selectedPlaceId) : false;

  const handleFilterSelect = useCallback((id: string) => {
    setSelectedFilterId(id);
    setActiveTab("all");
  }, []);

  const handleTabChange = useCallback((tab: "all" | "saved") => {
    setActiveTab(tab);
  }, []);

  const handleSelectPlace = useCallback((id: string | null) => {
    setSelectedPlaceId(id);
    if (id) {
      setMapCommand({ id: Date.now(), type: "focus", placeId: id });
    }
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
      <div className="relative h-[calc(100vh-7rem)] min-h-[620px] w-full bg-[color:var(--wb-bg)] md:h-screen md:min-h-0 lg:grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 340px" }}>
        <h1 className="sr-only">Map &amp; Discovery</h1>

        <div className="relative min-h-0 overflow-hidden">
          <DiscoveryLeafletMap
            places={discoveryPlaces}
            highlightedIds={markerHighlightIds}
            command={mapCommand}
            savedIds={savedIds}
            selectedId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />

          <MapDiscoverySearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search places…"
          />

          <MapDiscoveryFilterChips
            chips={filterChips}
            selectedId={selectedFilterId}
            onSelect={handleFilterSelect}
          />

          <MapDiscoveryControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRecenter={handleRecenter}
          />

          {/* Selected-place preview card */}
          {selectedPlace && (
            <div className="absolute bottom-32 left-1/2 z-[700] -translate-x-1/2 md:bottom-40">
              <div
                className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                style={{
                  width: "min(520px, calc(100vw - 48px))",
                  background: "#FAF8F3",
                  borderColor: "rgba(31, 42, 34, 0.12)",
                  boxShadow:
                    "0 1px 2px rgba(31, 42, 34, 0.04), 0 10px 30px rgba(31, 42, 34, 0.08)",
                }}
              >
                <div className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(31, 42, 34, 0.06)" }}>
                  <Image
                    src="/mori.png"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full opacity-40"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[color:var(--wb-ink)]">
                    {selectedPlace.name}
                  </p>
                  <p className="text-xs text-[color:var(--wb-muted)]">
                    {typeLabels[selectedPlace.type] || selectedPlace.type}
                    {selectedPlace.city ? ` \u00b7 ${selectedPlace.city}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {isSelectedPlaceSaved ? (
                    <button
                      type="button"
                      onClick={() => handleBookmarkToggle(selectedPlace.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[color:var(--wb-sage)] px-3 text-xs font-semibold text-[color:var(--wb-forest)] transition-colors hover:bg-[color:var(--wb-sage-light)] focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ outlineColor: "var(--wb-forest)" }}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                      Saved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBookmarkToggle(selectedPlace.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[color:var(--wb-forest)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ outlineColor: "var(--wb-forest)" }}
                    >
                      <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Save place
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mori composer on map */}
          <div className="absolute bottom-4 left-1/2 z-[700] hidden w-[min(620px,calc(100%-32px))] -translate-x-1/2 lg:block">
            <MoriComposer placeholder="Ask Mori to suggest places…" />
          </div>
        </div>

        {/* Right results panel */}
        <PlacesBottomSheet
          title="Discover places"
          count={filteredPlaces.length}
          savedCount={savedPlacesCount}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          footer={
            savedPlacesCount > 0 ? (
              <Link
                href="/itinerary"
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:brightness-[0.98]"
                style={{
                  background: "#EEF2EB",
                  borderTop: "1px solid rgba(22, 59, 44, 0.14)",
                }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(22, 59, 44, 0.1)" }}>
                  <Bookmark className="h-4 w-4" style={{ color: "var(--wb-forest)" }} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-[color:var(--wb-ink)]">
                    {savedPlacesCount} {savedPlacesCount === 1 ? "place" : "places"} saved
                  </span>
                  <p className="text-xs text-[color:var(--wb-muted)]">
                    Ready to add them to your itinerary.
                  </p>
                </div>
                <span className="text-sm font-semibold text-[color:var(--wb-forest)]">
                  Plan itinerary
                </span>
                <ArrowRight className="h-4 w-4 text-[color:var(--wb-forest)]" strokeWidth={1.5} />
              </Link>
            ) : undefined
          }
        >
          {filteredPlaces.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bookmark className="mx-auto mb-3 h-5 w-5 text-[color:var(--wb-muted)]" />
              <p className="text-sm text-[color:var(--wb-muted)]">
                {activeTab === "saved"
                  ? "No saved places yet."
                  : "No matching places found."}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <PlaceRow
                key={place.id}
                place={place}
                isBookmarked={savedIds.has(place.id)}
                isSelected={selectedPlaceId === place.id}
                onBookmarkToggle={handleBookmarkToggle}
                onSelect={handleSelectPlace}
              />
            ))
          )}
        </PlacesBottomSheet>
      </div>

      {/* Mori composer — mobile */}
      <div className="pointer-events-none fixed bottom-[64px] left-0 right-0 z-20 bg-transparent pb-3 pt-2 md:bottom-0 lg:hidden">
        <div className="mx-auto max-w-[1120px] px-5">
          <MoriComposer placeholder="Ask Mori to suggest places…" />
        </div>
      </div>
    </>
  );
}
