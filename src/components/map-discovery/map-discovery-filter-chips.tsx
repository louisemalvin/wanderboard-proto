"use client";

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
    <div className="absolute top-[76px] left-0 right-0 z-[700] overflow-x-auto scrollbar-none md:left-5 md:right-auto md:top-[84px]">
      <div className="flex items-center gap-2 px-4 pb-2 min-w-max md:px-0">
        {chips.map((chip) => {
          const isSelected = chip.id === selectedId;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(chip.id)}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm min-h-[44px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                ...(isSelected
                  ? {
                      background: "#163B2C",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      borderColor: "#163B2C",
                    }
                  : {
                      background: "#FAF8F3",
                      color: "#435047",
                      fontWeight: 500,
                      border: "1px solid rgba(31, 42, 34, 0.12)",
                    }),
                outlineColor: "var(--wb-forest)",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
