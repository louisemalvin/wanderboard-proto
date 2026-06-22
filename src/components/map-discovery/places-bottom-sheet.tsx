"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Desktop side panel (visible at lg+) */}
      <div
        className="hidden min-h-0 lg:flex lg:flex-col lg:overflow-hidden"
        role="region"
        aria-label={`${title}, ${count} places`}
        style={{
          background: "#FAF8F3",
          borderLeft: "1px solid rgba(31, 42, 34, 0.12)",
          width: 340,
        }}
      >
        {/* Header */}
        <div className="shrink-0 px-4 pt-5">
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

      {/* Mobile bottom sheet (hidden at lg+) */}
      <div
        className="fixed left-0 right-0 z-[60] bg-surface rounded-t-2xl border-t border-border shadow-surface overflow-hidden lg:hidden transition-[height] duration-300 ease-out"
        style={{ bottom: "64px", height: isOpen ? "40vh" : "60px" }}
        role="region"
        aria-label={`${title}, ${count} places`}
      >
        {/* Toggle header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-1 rounded-full bg-border" />
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            <span className="text-xs text-muted">({count})</span>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse places list" : "Expand places list"}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-[44px] h-[44px] rounded-lg hover:bg-app-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <ChevronUp
              className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Content */}
        {isOpen && (
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(40vh - 48px)" }}
          >
            {children}
            {footer && (
              <div className="border-t border-border/50">{footer}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
