"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import type { TripPace } from "@/lib/trip-types";

const EXAMPLE_CHIPS = [
  { label: "Portland · coffee and parks", value: "3 days in Portland with coffee, parks, and bookstores" },
  { label: "Sicily · beaches and food", value: "A relaxed Sicily road trip with beaches and food" },
  { label: "Tokyo · anime and easy transit", value: "Tokyo with a teen, anime stops, and easy transit" },
];

const PACE_OPTIONS: { value: TripPace; label: string }[] = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Full" },
];

interface MoriCardProps {
  destinationText: string;
  durationDays: number;
  pace: TripPace;
  isGenerating: boolean;
  onDestinationChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onPaceChange: (value: TripPace) => void;
  onGenerate: () => void;
  onBlankBoard: () => void;
}

export default function MoriCard({
  destinationText,
  durationDays,
  pace,
  isGenerating,
  onDestinationChange,
  onDurationChange,
  onPaceChange,
  onGenerate,
  onBlankBoard,
}: MoriCardProps) {
  return (
    <section
      className="rounded-[20px] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-7 shadow-[var(--shadow-card)]"
      aria-label="Plan with Mori"
      style={{ boxShadow: "0 1px 2px rgba(31, 42, 34, 0.04), 0 8px 24px rgba(31, 42, 34, 0.04)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--wb-sage-light)]">
          <img
            src="/mori.png"
            alt=""
            className="h-6 w-6 rounded-full object-cover"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--wb-ink)]">Mori</h2>
          <p className="text-xs text-[color:var(--wb-muted)]">AI travel companion</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-[color:var(--wb-ink)]" htmlFor="mori-textarea">
          Describe your trip
        </label>
        <textarea
          id="mori-textarea"
          value={destinationText}
          onChange={(e) => onDestinationChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              onGenerate();
            }
          }}
          placeholder="Five relaxed days in Japan with local food, nature, and minimal rushing"
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-4 py-3 text-sm leading-6 text-[color:var(--wb-ink)] placeholder:text-[color:var(--wb-muted)] focus:border-[color:var(--wb-forest)] focus:outline-none focus:ring-2 focus:ring-[color:var(--wb-sage)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onDestinationChange(chip.value)}
            className="rounded-full border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-3 py-1.5 text-left text-xs font-medium text-[color:var(--wb-muted)] transition-colors hover:border-[color:var(--wb-moss)] hover:text-[color:var(--wb-ink)] focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: "var(--wb-forest)" }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--wb-border)] pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:w-56">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--wb-ink)]">Days</span>
            <input
              type="number"
              min={1}
              max={14}
              value={durationDays}
              onChange={(e) => onDurationChange(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-3 py-2.5 text-sm text-[color:var(--wb-ink)] focus:border-[color:var(--wb-forest)] focus:outline-none focus:ring-2 focus:ring-[color:var(--wb-sage)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--wb-ink)]">Pace</span>
            <select
              value={pace}
              onChange={(e) => onPaceChange(e.target.value as TripPace)}
              className="mt-1 w-full rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-3 py-2.5 text-sm text-[color:var(--wb-ink)] focus:border-[color:var(--wb-forest)] focus:outline-none focus:ring-2 focus:ring-[color:var(--wb-sage)] appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236D776F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              {PACE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onBlankBoard}
            className="min-h-[44px] rounded-[10px] border border-[color:var(--wb-border)] px-4 text-sm font-semibold text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: "var(--wb-forest)" }}
          >
            Start blank
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[color:var(--wb-forest)] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ outlineColor: "var(--wb-forest)" }}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
            {isGenerating ? "Planning..." : "Plan with Mori"}
          </button>
        </div>
      </div>
    </section>
  );
}
