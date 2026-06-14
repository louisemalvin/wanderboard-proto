"use client";

import { Plus, Minus, Crosshair } from "lucide-react";

interface MapDiscoveryControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export default function MapDiscoveryControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapDiscoveryControlsProps) {
  return (
    <div className="absolute bottom-24 right-4 z-[700] flex flex-col items-center gap-1 md:bottom-36 md:right-5">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-[10px] border text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "#FAF8F3",
          borderColor: "rgba(31, 42, 34, 0.12)",
          boxShadow: "0 1px 2px rgba(31, 42, 34, 0.04)",
          outlineColor: "var(--wb-forest)",
        }}
      >
        <Plus className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-[10px] border text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "#FAF8F3",
          borderColor: "rgba(31, 42, 34, 0.12)",
          boxShadow: "0 1px 2px rgba(31, 42, 34, 0.04)",
          outlineColor: "var(--wb-forest)",
        }}
      >
        <Minus className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <div className="w-6 h-px my-0.5" style={{ background: "rgba(31, 42, 34, 0.12)" }} />

      <button
        type="button"
        aria-label="Re-center map"
        onClick={onRecenter}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-[10px] border text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "#FAF8F3",
          borderColor: "rgba(31, 42, 34, 0.12)",
          boxShadow: "0 1px 2px rgba(31, 42, 34, 0.04)",
          outlineColor: "var(--wb-forest)",
        }}
      >
        <Crosshair className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
