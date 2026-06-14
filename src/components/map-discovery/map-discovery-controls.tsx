"use client";

// ------------------------------------------------------------------
// Floating map controls: zoom in (+), zoom out (-), re-center
// Renders on the right side of the map
// ------------------------------------------------------------------

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
    <div className="absolute right-4 top-1/2 z-[700] flex -translate-y-1/2 flex-col items-center gap-1 md:right-5">
      {/* Zoom in */}
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-surface border border-border shadow-surface text-ink hover:bg-app-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <Plus className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Zoom out */}
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-surface border border-border shadow-surface text-ink hover:bg-app-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <Minus className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Separator line */}
      <div className="w-6 h-px bg-border my-1" />

      {/* Re-center */}
      <button
        type="button"
        aria-label="Re-center map"
        onClick={onRecenter}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-lg bg-surface border border-border shadow-surface text-ink hover:bg-app-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <Crosshair className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
