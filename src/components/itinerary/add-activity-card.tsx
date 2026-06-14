"use client";

// ------------------------------------------------------------------
// Add Activity card — dashed-border placeholder at the bottom of each section
// Click is a no-op in this unit (future: opens place picker)
// ------------------------------------------------------------------

import { Plus } from "lucide-react";

export default function AddActivityCard() {
  return (
    <button
      type="button"
      aria-label="Add activity"
      className={`
        flex w-full items-center justify-center gap-2 rounded-xl
        border-2 border-dashed border-[#BFCDBF] bg-[#FFFDFC]
        px-4 py-3 text-sm font-medium text-[#667066]
        transition-colors
        hover:border-solid hover:border-[#2E6F40] hover:bg-[#E7F1E8] hover:text-[#2E6F40]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
      `}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      <span>Add activity</span>
    </button>
  );
}
