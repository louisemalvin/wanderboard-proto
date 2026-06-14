"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export type SheetState = "collapsed" | "half" | "expanded";

interface PlacesBottomSheetProps {
  children: React.ReactNode;
  title: string;
  count: number;
  savedCount: number;
  activeTab: "all" | "saved";
  onTabChange: (tab: "all" | "saved") => void;
  footer?: React.ReactNode;
}

const SHEET_HEIGHTS: Record<SheetState, string> = {
  collapsed: "64px",
  half: "40vh",
  expanded: "75vh",
};

const STATE_LABELS: Record<SheetState, string> = {
  collapsed: "collapsed",
  half: "half open",
  expanded: "expanded",
};

const STATE_ORDER: SheetState[] = ["collapsed", "half", "expanded"];

export default function PlacesBottomSheet({
  children,
  title,
  count,
  savedCount,
  activeTab,
  onTabChange,
  footer,
}: PlacesBottomSheetProps) {
  const [state, setState] = useState<SheetState>("half");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Bottom sheet ${STATE_LABELS[state]}`;
    }
  }, [state]);

  const cycleState = useCallback(() => {
    setState((prev) => {
      const idx = STATE_ORDER.indexOf(prev);
      return STATE_ORDER[(idx + 1) % STATE_ORDER.length];
    });
    setDragOffset(0);
  }, []);

  const snapToState = useCallback((targetState: SheetState) => {
    setState(targetState);
    setDragOffset(0);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startYRef.current = e.clientY;
      setIsDragging(true);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientY - startYRef.current;
      setDragOffset(delta);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(
    () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (dragOffset < -30) {
        if (state === "collapsed") snapToState("half");
        else snapToState("expanded");
      } else if (dragOffset > 30) {
        if (state === "expanded") snapToState("half");
        else snapToState("collapsed");
      } else {
        snapToState(state);
      }
      setDragOffset(0);
    },
    [isDragging, state, dragOffset, snapToState],
  );

  const getBaseHeight = (s: SheetState): number => {
    if (typeof window === "undefined") return s === "collapsed" ? 64 : 400;
    switch (s) {
      case "collapsed":
        return 64;
      case "half":
        return window.innerHeight * 0.4;
      case "expanded":
        return window.innerHeight * 0.75;
    }
  };

  const baseHeight = getBaseHeight(state);
  const displayHeight = isDragging
    ? Math.max(64, Math.min(window.innerHeight * 0.85, baseHeight + dragOffset))
    : baseHeight;

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
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-surface rounded-t-2xl border-t border-border shadow-surface transition-[height] duration-300 ease-out overflow-hidden lg:hidden"
        style={{
          height: isDragging ? `${displayHeight}px` : SHEET_HEIGHTS[state],
        }}
        role="region"
        aria-label={`${title}, ${count} places`}
      >
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="w-9 h-1 rounded-full bg-border mb-2" />
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">
                {title}
              </h2>
              <span className="text-xs text-muted">({count})</span>
            </div>
            <button
              type="button"
              aria-expanded={state !== "collapsed"}
              aria-label={`Bottom sheet is ${STATE_LABELS[state]}. Click to ${
                state === "expanded" ? "collapse" : "expand"
              }.`}
              onClick={cycleState}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-lg hover:bg-app-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <ChevronUp
                className={`w-5 h-5 text-muted transition-transform duration-300 ${
                  state === "expanded" ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <div
          className={`overflow-y-auto pb-16 ${
            state === "collapsed" ? "hidden" : "block"
          }`}
          style={{
            maxHeight:
              state !== "collapsed"
                ? `calc(${SHEET_HEIGHTS[state]} - 80px)`
                : "0",
          }}
        >
          {children}
          {footer && state !== "collapsed" && (
            <div className="border-t border-border/50">{footer}</div>
          )}
        </div>

        <div
          ref={liveRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </>
  );
}
