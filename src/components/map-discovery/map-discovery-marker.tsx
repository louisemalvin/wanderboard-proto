"use client";

// ------------------------------------------------------------------
// Numbered forest-green route marker positioned on the map canvas
// ------------------------------------------------------------------

interface MapDiscoveryMarkerProps {
  number: number;
  top: number; // percentage
  left: number; // percentage
  highlighted?: boolean;
  dimmed?: boolean;
  label: string;
}

export default function MapDiscoveryMarker({
  number,
  top,
  left,
  highlighted = false,
  dimmed = false,
  label,
}: MapDiscoveryMarkerProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ top: `${top}%`, left: `${left}%` }}
      role="img"
      aria-label={`Marker ${number}: ${label}`}
    >
      <div
        className={`
          flex items-center justify-center
          w-8 h-8 rounded-full
          font-sans text-xs font-bold text-white
          border-2 border-white
          shadow-[0_2px_6px_rgba(0,0,0,0.15)]
          transition-all duration-300
          ${
            dimmed
              ? "bg-muted/50 scale-90 opacity-50"
              : highlighted
                ? "bg-forest scale-110 ring-2 ring-forest/30"
                : "bg-forest"
          }
        `}
      >
        {number}
      </div>
    </div>
  );
}
