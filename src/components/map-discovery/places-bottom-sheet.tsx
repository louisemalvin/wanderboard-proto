"use client";

interface PlacesBottomSheetProps {
  children: React.ReactNode;
  title: string;
  count: number;
  savedCount: number;
  activeTab: "all" | "saved";
  onTabChange: (tab: "all" | "saved") => void;
  footer?: React.ReactNode;
}

export default function PlacesBottomSheet({
  children,
  title,
  count,
  savedCount,
  activeTab,
  onTabChange,
  footer,
}: PlacesBottomSheetProps) {
  return (
    <div
      className="flex flex-col min-h-0 overflow-hidden border-t border-[color:var(--wb-border)] max-h-[50vh] lg:max-h-none lg:border-t-0 lg:border-l lg:w-[340px]"
      role="region"
      aria-label={`${title}, ${count} places`}
      style={{ background: "#FAF8F3" }}
    >
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 lg:pt-5">
        <h2 className="text-base font-semibold text-[color:var(--wb-ink)]">
          Discover places
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--wb-muted)]">
          Review candidates, save your picks,
          <br />
          then move them into the itinerary.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onTabChange("all")}
            className="rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              ...(activeTab === "all"
                ? {
                    background: "#163B2C",
                    color: "#FFFFFF",
                    fontWeight: 600,
                  }
                : {
                    background: "transparent",
                    color: "var(--wb-muted)",
                    fontWeight: 500,
                  }),
              outlineColor: "var(--wb-forest)",
            }}
          >
            All {count}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("saved")}
            className="rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              ...(activeTab === "saved"
                ? {
                    background: "#163B2C",
                    color: "#FFFFFF",
                    fontWeight: 600,
                  }
                : {
                    background: "transparent",
                    color: "var(--wb-muted)",
                    fontWeight: 500,
                  }),
              outlineColor: "var(--wb-forest)",
            }}
          >
            Saved {savedCount}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mt-3 h-px shrink-0" style={{ background: "rgba(31, 42, 34, 0.08)" }} />

      {/* Scrollable results */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="shrink-0">{footer}</div>
      )}
    </div>
  );
}
