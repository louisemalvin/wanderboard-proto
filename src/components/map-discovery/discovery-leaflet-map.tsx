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

interface DiscoveryLeafletMapProps {
  places: DiscoveryPlace[];
  highlightedIds: string[] | null;
  command: MapCommand | null;
  savedIds: Set<string>;
  selectedId: string | null;
  onSelectPlace: (id: string | null) => void;
}

const PORTLAND_CENTER: [number, number] = [45.522, -122.711];

function DiscoveryMapController({
  places,
  command,
}: {
  places: DiscoveryPlace[];
  command: MapCommand | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    const bounds = places.map((place) => [place.lat, place.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [72, 72], maxZoom: 13 });
  }, [places, map]);

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

export default function DiscoveryLeafletMap({
  places,
  highlightedIds,
  command,
  savedIds,
  selectedId,
  onSelectPlace,
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
      <DiscoveryMapController places={places} command={command} />
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
    </MapContainer>
  );
}
