"use client";

// ------------------------------------------------------------------
// ItineraryOverlay — full-screen overlay that replaces the side drawer.
// Covers the entire viewport with a backdrop and scrollable content.
// No mobile-specific overrides — uniform across all breakpoints.
// ------------------------------------------------------------------

import { useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { ItineraryReadout } from "./ItineraryReadout";

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

export interface ItineraryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function ItineraryOverlay({ isOpen, onClose }: ItineraryOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ---- Render ----
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1090] bg-black/30"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Overlay panel */}
      <div
        ref={panelRef}
        className="fixed inset-0 z-[1100] flex flex-col bg-white dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-label="Itinerary preview"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Preview Itinerary
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close itinerary overlay"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <ItineraryReadout />
          </div>
        </div>
      </div>
    </>
  );
}
