"use client";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface SampleTripCardProps {
  onSampleTrip: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SampleTripCard({ onSampleTrip }: SampleTripCardProps) {
  return (
    <button
      type="button"
      onClick={onSampleTrip}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#BFCDBF] bg-[#FFFDFC] px-5 py-3 text-sm font-medium text-[#2E6F40] transition-colors hover:border-[#2E6F40] hover:bg-[#E7F1E8]"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      Try a sample trip
    </button>
  );
}
