"use client";

// ------------------------------------------------------------------
// Horizontally scrollable row of filter chips
// Selected chip: sage background (#E7F1E8) with forest text (#2E6F40), bold
// Unselected chip: off-white (#F7F4EF) with ink text
// ------------------------------------------------------------------

interface FilterChipItem {
  id: string;
  label: string;
}

interface MapDiscoveryFilterChipsProps {
  chips: FilterChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function MapDiscoveryFilterChips({
  chips,
  selectedId,
  onSelect,
}: MapDiscoveryFilterChipsProps) {
  return (
    <div className="absolute top-[72px] left-0 right-0 z-[700] overflow-x-auto scrollbar-none md:left-5 md:right-5 md:top-[84px]">
      <div className="flex items-center gap-2 px-4 pb-2 min-w-max md:px-0">
        {chips.map((chip) => {
          const isSelected = chip.id === selectedId;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(chip.id)}
              className={`
                inline-flex items-center rounded-full px-4 py-2
                text-sm font-sans min-h-[44px]
                transition-all duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
                ${
                  isSelected
                    ? "bg-[#E7F1E8] text-[#2E6F40] font-semibold"
                    : "bg-[#F7F4EF] text-[#1F2A22] font-medium hover:bg-surface"
                }
              `}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
