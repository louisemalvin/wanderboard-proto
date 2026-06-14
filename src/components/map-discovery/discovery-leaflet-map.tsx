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
  type: "zoom-in" | "zoom-out" | "recenter";
};

interface DiscoveryLeafletMapProps {
  places: DiscoveryPlace[];
  highlightedIds: string[] | null;
  command: MapCommand | null;
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
  }, [command, map, places]);

  return null;
}

export default function DiscoveryLeafletMap({
  places,
  highlightedIds,
  command,
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
        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={isHighlighted ? 11 : 7}
            pathOptions={
              isHighlighted
                ? {
                    color: "#2E6F40",
                    fillColor: "#2E6F40",
                    fillOpacity: 0.85,
                    weight: 2,
                  }
                : {
                    color: "#667066",
                    fillColor: "#667066",
                    fillOpacity: 0.35,
                    weight: 1,
                  }
            }
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
