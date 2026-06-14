"use client";

// ------------------------------------------------------------------
// Mori refinement panel — planning helper for arranging saved places
// ------------------------------------------------------------------

import { Wand2 } from "lucide-react";

interface MoriRefinementPanelProps {
  disabled?: boolean;
  hasAssignedPlaces?: boolean;
  onAutoArrange?: () => void;
}

export default function MoriRefinementPanel({
  disabled = false,
  hasAssignedPlaces = false,
  onAutoArrange,
}: MoriRefinementPanelProps) {
  return (
    <aside
      aria-label="Refinement suggestions"
      className="mt-6 rounded-xl border border-[#BFCDBF] bg-[#E7F1E8] p-4 lg:mt-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-[#2E6F40]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[#1F2A22]">Mori</h3>
      </div>

      {/* Suggestion text */}
      <p className="mt-2 text-sm leading-relaxed text-[#1F2A22]/80">
        {hasAssignedPlaces
          ? "Keep shaping the day manually, or auto arrange any remaining saved places across your trip days."
          : "Let Mori make a first pass by distributing your saved places across the available days."}
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onAutoArrange}
          className="
            inline-flex items-center justify-center rounded-lg
            bg-[#2E6F40] px-4 py-2 text-sm font-medium text-white
            transition-colors hover:bg-[#245A34] disabled:cursor-not-allowed disabled:opacity-55
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
          "
        >
          Auto arrange saved places
        </button>
        <button
          type="button"
          className="
            inline-flex items-center justify-center rounded-lg
            bg-transparent px-3 py-2 text-sm font-medium text-[#667066]
            transition-colors hover:bg-[#FFFDFC] hover:text-[#1F2A22]
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
          "
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
