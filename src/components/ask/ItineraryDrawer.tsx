"use client";

// ------------------------------------------------------------------
// ItineraryDrawer — slide-out panel from the right edge.
// On mobile (<768px), renders as a full-screen bottom sheet.
// Animated with Tailwind CSS transitions (no animation library).
// ------------------------------------------------------------------

import { useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { ItineraryReadout } from "./ItineraryReadout";

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

export interface ItineraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function ItineraryDrawer({ isOpen, onClose }: ItineraryDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ---- Escape key handler ----
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ---- Body scroll lock ----
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ---- Backdrop click ----
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if the backdrop itself was clicked, not the drawer
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ---- Render ----
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } bottom-0 right-0 top-0 w-full max-w-md border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 md:w-96`}
        role="dialog"
        aria-modal="true"
        aria-label="Itinerary preview"
      >
        {/* Close button */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Preview Itinerary
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close itinerary drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 py-4" style={{ height: "calc(100% - 49px)" }}>
          <ItineraryReadout />
        </div>
      </div>

      {/* Mobile bottom-sheet (overrides side panel on <768px) */}
      <style jsx>{`
        @media (max-width: 767px) {
          div[role="dialog"] {
            max-width: 100%;
            width: 100%;
            transform: translateY(${isOpen ? "0" : "100%"});
            translate: none;
            top: auto;
            bottom: 0;
            height: 90vh;
            border-radius: 16px 16px 0 0;
            border-left: none;
          }
        }
      `}</style>
    </>
  );
}
