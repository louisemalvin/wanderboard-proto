"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { DiscoveryPlace } from "@/data/mock-discovery-places";

type MapCommand = {
  id: number;
  type: "zoom-in" | "zoom-out" | "recenter" | "focus";
  placeId?: string;
};

export type SuggestionMarker = {
  clientId: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  confidence: "verified" | "approximate" | "missing";
  reason: string;
};

interface DiscoveryLeafletMapProps {
  places: DiscoveryPlace[];
  highlightedIds: string[] | null;
  command: MapCommand | null;
  savedIds: Set<string>;
  selectedId: string | null;
  onSelectPlace: (id: string | null) => void;
  suggestionMarkers?: SuggestionMarker[];
  onSelectSuggestion?: (clientId: string) => void;
}

const PORTLAND_CENTER: [number, number] = [45.522, -122.711];

function DiscoveryMapController({
  places,
  command,
  suggestionMarkers,
}: {
  places: DiscoveryPlace[];
  command: MapCommand | null;
  suggestionMarkers?: SuggestionMarker[];
}) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    const bounds = places.map((place) => [place.lat, place.lng] as [number, number]);
    // Include suggestion markers in bounds
    const suggestBounds =
      suggestionMarkers
        ?.filter((s) => s.lat != null && s.lng != null)
        .map((s) => [s.lat, s.lng] as [number, number]) ?? [];
    const allBounds = [...bounds, ...suggestBounds];
    if (allBounds.length > 0) {
      map.fitBounds(allBounds, { padding: [72, 72], maxZoom: 13 });
    }
  }, [places, map, suggestionMarkers]);

  useEffect(() => {
    if (!command) return;
    if (command.type === "zoom-in") map.zoomIn();
    if (command.type === "zoom-out") map.zoomOut();
    if (command.type === "recenter") {
      const bounds = places.map((place) => [place.lat, place.lng] as [number, number]);
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [72, 72], maxZoom: 13 });
      else map.flyTo(PORTLAND_CENTER, 12);
    }
    if (command.type === "focus" && command.placeId) {
      const place = places.find((p) => p.id === command.placeId);
      if (place) {
        map.flyTo([place.lat, place.lng], 15, { duration: 0.5 });
      }
    }
  }, [command, map, places]);

  return null;
}

function markerStyle(saved: boolean, selected: boolean) {
  if (selected) {
    return {
      color: "#163B2C",
      fillColor: saved ? "#163B2C" : "#FAF8F3",
      fillOpacity: saved ? 1 : 1,
      weight: 3,
      radius: 12,
    };
  }
  if (saved) {
    return {
      color: "#163B2C",
      fillColor: "#163B2C",
      fillOpacity: 1,
      weight: 2.5,
      radius: 9,
    };
  }
  return {
    color: "#163B2C",
    fillColor: "#FAF8F3",
    fillOpacity: 1,
    weight: 2,
    radius: 8,
  };
}

function suggestionMarkerStyle(confidence: string) {
  switch (confidence) {
    case "verified":
      return { color: "#2563EB", fillColor: "#DBEAFE", fillOpacity: 1, weight: 2.5, radius: 8, dashArray: "" };
    case "approximate":
      return { color: "#D97706", fillColor: "#FEF3C7", fillOpacity: 0.9, weight: 2.5, radius: 8, dashArray: "4 3" };
    default:
      return { color: "#78716C", fillColor: "#E7E5E4", fillOpacity: 0.7, weight: 2, radius: 8, dashArray: "4 3" };
  }
}

export default function DiscoveryLeafletMap({
  places,
  highlightedIds,
  command,
  savedIds,
  selectedId,
  onSelectPlace,
  suggestionMarkers,
  onSelectSuggestion,
}: DiscoveryLeafletMapProps) {
  return (
    <MapContainer
      center={PORTLAND_CENTER}
      zoom={12}
      zoomControl={false}
      scrollWheelZoom
      className="relative z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <DiscoveryMapController places={places} command={command} suggestionMarkers={suggestionMarkers} />

      {/* Existing discovery places */}
      {places.map((place) => {
        const isHighlighted =
          highlightedIds === null || highlightedIds.includes(place.id);
        const isSaved = savedIds.has(place.id);
        const isSelected = selectedId === place.id;
        const style = markerStyle(
          isHighlighted && isSaved,
          isHighlighted && isSelected,
        );

        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={isHighlighted ? style.radius : 4}
            pathOptions={
              isHighlighted
                ? style
                : {
                    color: "#435047",
                    fillColor: "#435047",
                    fillOpacity: 0.25,
                    weight: 1,
                    radius: 4,
                  }
            }
            eventHandlers={{
              click: () => {
                onSelectPlace(place.id);
              },
            }}
          >
            <Popup>
              <div className="min-w-40 text-sm">
                <strong>{place.name}</strong>
                <br />
                <span className="text-xs text-[#667066]">{place.city}</span>
                <p className="mt-1 text-xs text-[#1F2A22]">{place.description}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Temporary suggestion markers */}
      {suggestionMarkers?.map((marker) => {
        if (marker.lat == null || marker.lng == null) return null;
        const style = suggestionMarkerStyle(marker.confidence);
        return (
          <CircleMarker
            key={`suggestion-${marker.clientId}`}
            center={[marker.lat, marker.lng]}
            radius={style.radius}
            pathOptions={{
              color: style.color,
              fillColor: style.fillColor,
              fillOpacity: style.fillOpacity,
              weight: style.weight,
              ...(style.dashArray ? { dashArray: style.dashArray } : {}),
            }}
            eventHandlers={{
              click: () => {
                onSelectSuggestion?.(marker.clientId);
              },
            }}
          >
            <Popup>
              <div className="min-w-40 text-sm">
                <strong>{marker.name}</strong>
                <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-700">
                  {marker.confidence === "verified" ? "Suggestion" : "Approx. suggestion"}
                </span>
                <br />
                <span className="text-xs text-[#667066]">{marker.category}</span>
                <p className="mt-1 text-xs text-[#1F2A22]">{marker.reason}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
