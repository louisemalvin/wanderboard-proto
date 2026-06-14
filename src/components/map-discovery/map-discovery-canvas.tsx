"use client";

// ------------------------------------------------------------------
// CSS mock map canvas with muted natural colors
// Cream land, sage parks, blue-green water, soft roads
// Positions markers and an SVG dashed route line
// ------------------------------------------------------------------

import type { ReactNode } from "react";

export interface MarkerPosition {
  id: string;
  top: number; // percentage
  left: number; // percentage
}

interface MapDiscoveryCanvasProps {
  children: ReactNode;
  markerPositions: MarkerPosition[];
  zoom: number;
}

export default function MapDiscoveryCanvas({
  children,
  markerPositions,
  zoom,
}: MapDiscoveryCanvasProps) {
  // Build SVG polyline path from marker positions
  const points = markerPositions
    .map((m) => `${m.left},${m.top}`)
    .join(" ");

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F7F4EF]">
      {/* Scaled container for zoom */}
      <div
        className="w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* Base land - cream */}
        <div className="absolute inset-0 bg-[#F7F4EF]" />

        {/* Water area - blue-green (river/stripe shape) */}
        <div className="absolute top-0 right-[15%] w-[18%] h-full bg-[#A3C9BC]/40 rounded-bl-[40%]" />
        <div className="absolute bottom-0 left-[10%] w-[12%] h-[45%] bg-[#A3C9BC]/30 rounded-tr-[50%]" />

        {/* Park area 1 - sage green (upper left) */}
        <div className="absolute top-[12%] left-[8%] w-[28%] h-[24%] rounded-[50%] bg-[#DDE8DA]/60" />

        {/* Park area 2 - sage green (center right) */}
        <div className="absolute top-[38%] right-[8%] w-[22%] h-[30%] rounded-[50%] bg-[#DDE8DA]/50" />

        {/* Park area 3 - sage green (bottom center) */}
        <div className="absolute bottom-[18%] left-[30%] w-[20%] h-[18%] rounded-[50%] bg-[#DDE8DA]/40" />

        {/* Soft roads */}
        <div className="absolute top-[20%] left-0 w-[55%] h-[3px] bg-[#DED6CC]/60 rounded-full" />
        <div className="absolute top-[50%] left-[30%] w-[45%] h-[3px] bg-[#DED6CC]/60 rounded-full" />
        <div className="absolute top-[70%] left-[10%] w-[35%] h-[3px] bg-[#DED6CC]/60 rounded-full" />

        {/* Cross roads */}
        <div className="absolute top-0 left-[50%] w-[3px] h-[40%] bg-[#DED6CC]/40 rounded-full" />
        <div className="absolute top-[55%] left-[65%] w-[3px] h-[30%] bg-[#DED6CC]/40 rounded-full" />

        {/* Route line SVG - dashed forest-green path connecting markers */}
        {markerPositions.length >= 2 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              stroke="#2E6F40"
              strokeWidth="0.6"
              strokeDasharray="1.5, 1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6}
            />
            {/* Route dots at each vertex */}
            {markerPositions.map((m) => (
              <circle
                key={m.id}
                cx={m.left}
                cy={m.top}
                r="2.5"
                fill="#2E6F40"
                opacity={0.3}
              />
            ))}
          </svg>
        )}

        {/* Markers rendered on top */}
        {children}
      </div>
    </div>
  );
}
