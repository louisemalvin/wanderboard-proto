"use client";

// ------------------------------------------------------------------
// Leaflet map with CircleMarkers for all saved places
// Default export required for next/dynamic import
// ------------------------------------------------------------------

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { useTripStore } from "@/stores/trip-store";
import type { Place } from "@/lib/trip-types";

// ==================================================================
// Window guard — belt-and-suspenders even though this is
// dynamically imported with ssr:false
// ==================================================================

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ==================================================================
// MapController — programmatic pan/zoom when previewPlaceId changes
// ==================================================================

function MapController() {
  const map = useMap();
  const previewPlaceId = useTripStore((s) => s.previewPlaceId);
  const board = useTripStore((s) => s.board);

  useEffect(() => {
    if (!previewPlaceId || !board) return;
    const place = board.savedPlaces[previewPlaceId];
    if (!place) return;
    map.flyTo([place.location.lat, place.location.lng], 15, {
      duration: 1,
    });
  }, [previewPlaceId, board, map]);

  return null;
}

// ==================================================================
// Helpers
// ==================================================================

function getMapCenter(board: import("@/lib/trip-types").TripBoard | null): [number, number] {
  if (!board) return [20, 0];
  const places = Object.values(board.savedPlaces);
  if (places.length === 0) return [20, 0];
  const lat =
    places.reduce((s, p) => s + p.location.lat, 0) / places.length;
  const lng =
    places.reduce((s, p) => s + p.location.lng, 0) / places.length;
  return [lat, lng];
}

function getMapZoom(
  board: import("@/lib/trip-types").TripBoard | null
): number {
  if (!board) return 2;
  return Object.keys(board.savedPlaces).length > 0 ? 12 : 2;
}

// ==================================================================
// Marker component
// ==================================================================

interface PlaceMarkerProps {
  place: Place;
  isHighlighted: boolean;
}

function PlaceMarker({ place, isHighlighted }: PlaceMarkerProps) {
  return (
    <CircleMarker
      center={[place.location.lat, place.location.lng]}
      radius={isHighlighted ? 12 : 8}
      pathOptions={
        isHighlighted
          ? { color: "#c47a3d", fillColor: "#c47a3d", fillOpacity: 0.9 }
          : { color: "#2e6f40", fillColor: "#2e6f40", fillOpacity: 0.7 }
      }
    >
      <Popup>
        <div className="text-sm">
          <strong>{place.name}</strong>
          <br />
          <span className="text-xs text-[#667066]">{place.type}</span>
        </div>
      </Popup>
    </CircleMarker>
  );
}

// ==================================================================
// Main component (default export)
// ==================================================================

export default function DayMap() {
  // Window guard
  if (!isBrowser()) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const board = useTripStore((s) => s.board);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const previewPlaceId = useTripStore((s) => s.previewPlaceId);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const center = useMemo(() => getMapCenter(board), [board]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const zoom = useMemo(() => getMapZoom(board), [board]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapController />

      {board &&
        Object.values(board.savedPlaces).map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            isHighlighted={previewPlaceId === place.id}
          />
        ))}
    </MapContainer>
  );
}
