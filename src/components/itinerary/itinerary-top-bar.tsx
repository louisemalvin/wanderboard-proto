"use client";

// ------------------------------------------------------------------
// Itinerary top bar — compact product toolbar
// Back link, trip title, share button placeholder
// Shared pattern with GuideClient header
// ------------------------------------------------------------------

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface ItineraryTopBarProps {
  destinationText: string;
}

export default function ItineraryTopBar({ destinationText }: ItineraryTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface text-ink">
      <div className="mx-auto flex h-12 w-full items-center justify-between px-3 sm:px-4">
        {/* Left — back link */}
        <Link
          href="/home"
          aria-label="Back to home"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-muted transition-colors hover:bg-app-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>

        {/* Center — trip destination */}
        <h1 className="sr-only">Itinerary</h1>
        <span className="min-w-0 truncate text-sm font-medium">
          {destinationText || "Itinerary"}
        </span>

        {/* Right — reserved for future actions */}
        <div className="w-10" aria-hidden="true" />
      </div>
    </header>
  );
}
