"use client";

// ------------------------------------------------------------------
// Itinerary tab bar — Plan / Guide / Notes
// Plan selected with warm white pill and forest text
// ------------------------------------------------------------------

export type ItineraryTab = "plan" | "guide" | "notes";

export interface ItineraryTabsProps {
  activeTab: ItineraryTab;
  onTabChange: (tab: ItineraryTab) => void;
}

const TABS: { id: ItineraryTab; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "guide", label: "Guide" },
  { id: "notes", label: "Notes" },
];

export default function ItineraryTabs({ activeTab, onTabChange }: ItineraryTabsProps) {
  return (
    <div className="border-b border-[#DED6CC] bg-[#FFFDFC]">
      <nav
        aria-label="Itinerary tabs"
        className="flex px-4 py-2"
        role="tablist"
      >
        <div className="flex gap-1.5">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`
                  rounded-lg px-4 py-1.5 text-sm font-medium transition-colors
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
                  ${
                    isActive
                      ? "bg-[#FFFDFC] text-[#2E6F40] font-semibold shadow-sm border border-[#DED6CC]"
                      : "text-[#667066] hover:text-[#1F2A22] hover:bg-[#F7F4EF]"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
