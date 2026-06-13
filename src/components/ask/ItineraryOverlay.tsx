"use client";

// ------------------------------------------------------------------
// ItineraryOverlay — full-screen overlay that replaces the side drawer.
// Covers the entire viewport with a backdrop and scrollable content.
// No mobile-specific overrides — uniform across all breakpoints.
// ------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Clock,
  ExternalLink,
  Loader2,
  MapPinned,
  Navigation,
  X,
} from "lucide-react";
import {
  buildMockItineraryAnalysis,
  itineraryAnalysisSteps,
  type ItineraryAnalysisLeg,
  type ItineraryAnalysisDay,
  type TransitMode,
} from "@/data/mock-itinerary-analysis";
import { useTripStore } from "@/stores/trip-store";
import type { Place } from "@/lib/trip-types";
import { formatDuration, formatMoneyRange } from "@/lib/format";

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
  const board = useTripStore((s) => s.board);
  const analysis = useMemo(() => buildMockItineraryAnalysis(board), [board]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedModes, setSelectedModes] = useState<Record<string, TransitMode>>({});

  const handleClose = useCallback(() => {
    setIsAnalyzing(true);
    setStepIndex(0);
    setSelectedModes({});
    onClose();
  }, [onClose]);

  const handleSelectMode = useCallback((legId: string, mode: TransitMode) => {
    setSelectedModes((current) => ({ ...current, [legId]: mode }));
  }, []);

  // ---- Mock analysis sequence ----
  useEffect(() => {
    if (!isOpen) return;

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) =>
        Math.min(current + 1, itineraryAnalysisSteps.length - 1),
      );
    }, 560);
    const readyTimer = window.setTimeout(() => {
      setIsAnalyzing(false);
      window.clearInterval(stepTimer);
    }, 2900);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(readyTimer);
    };
  }, [isOpen]);

  // ---- Escape key handler ----
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

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
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
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
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Preview Itinerary
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Mock route intelligence from your current board
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close itinerary overlay"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            {isAnalyzing ? (
              <AnalysisLoading stepIndex={stepIndex} />
            ) : (
              <AnalysisPreview
                analysis={analysis}
                selectedModes={selectedModes}
                onSelectMode={handleSelectMode}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AnalysisLoading({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/70">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <Loader2 className="h-5 w-5 motion-safe:animate-spin motion-reduce:animate-none" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Building itinerary intelligence
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Prototype estimates only. No live route, weather, or hours API yet.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {itineraryAnalysisSteps.map((step, index) => {
            const isDone = index < stepIndex;
            const isActive = index === stepIndex;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isActive
                    ? "border-blue-200 bg-white text-zinc-900 dark:border-blue-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                )}
                <span className="text-sm">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnalysisPreview({
  analysis,
  selectedModes,
  onSelectMode,
}: {
  analysis: ReturnType<typeof buildMockItineraryAnalysis>;
  selectedModes: Record<string, TransitMode>;
  onSelectMode: (legId: string, mode: TransitMode) => void;
}) {
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        No trip loaded. Create or open a board to preview itinerary intelligence.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Estimated itinerary preview
            </p>
            <h3 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {analysis.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {analysis.destination}
            </p>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Estimated preview
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {analysis.overview}
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{analysis.assumption}</span>
        </div>
      </section>

      {analysis.days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
          Add days and assign places to see route legs, pacing, and map links.
        </div>
      ) : (
        <div className="space-y-5">
          {analysis.days.map((day) => (
            <DayAnalysisCard
              key={day.id}
              day={day}
              selectedModes={selectedModes}
              onSelectMode={onSelectMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DayAnalysisCard({
  day,
  selectedModes,
  onSelectMode,
}: {
  day: ItineraryAnalysisDay;
  selectedModes: Record<string, TransitMode>;
  onSelectMode: (legId: string, mode: TransitMode) => void;
}) {
  const selectedTravelMinutes = day.legs.reduce((total, leg) => {
    const option = getSelectedTransitOption(leg, selectedModes[leg.id]);
    return total + option.durationMinutes;
  }, 0);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            {day.title}
          </h4>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {day.summary}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center lg:w-80">
          <Metric label="Stops" value={String(day.stopCount)} />
          <Metric label="Travel" value={formatMinutes(selectedTravelMinutes)} />
          <Metric label="Pace" value={day.pacing} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Route Timeline
          </h5>
          <div className="mt-3 space-y-0">
            {day.stops.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                Assign places to this day to build a route timeline.
              </div>
            ) : (
              day.stops.map((place, index) => (
                <div key={place.id}>
                  <DestinationBlock place={place} index={index} />
                  {day.legs[index] && (
                    <TransitBlock
                      leg={day.legs[index]}
                      selectedMode={selectedModes[day.legs[index].id]}
                      onSelectMode={onSelectMode}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60 lg:sticky lg:top-6 lg:self-start">
          <h5 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Route Summary
          </h5>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Best start" value={day.bestWindow.replace("Start ", "")} />
            <Metric label="Travel" value={formatMinutes(selectedTravelMinutes)} />
          </div>
          <div className="mt-4 space-y-3">
            <Insight icon={<CloudSun className="h-4 w-4" />} label="Weather" value={day.weatherNote} />
            <Insight icon={<Clock className="h-4 w-4" />} label="Hours" value={day.openingHoursNote} />
            <Insight icon={<MapPinned className="h-4 w-4" />} label="Route" value="Transit is selected by default. Switch to taxi when time matters more than cost." />
          </div>
        </aside>
      </div>
    </section>
  );
}

function DestinationBlock({ place, index }: { place: Place; index: number }) {
  return (
    <div className="relative pl-9">
      <div className="absolute left-2 top-0 flex h-full flex-col items-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-[10px] font-semibold text-blue-700 dark:bg-zinc-900 dark:text-blue-300">
          {index + 1}
        </span>
        <span className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <article className="mb-3 rounded-2xl border border-zinc-300 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Destination
            </p>
            <h6 className="mt-1 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {place.name}
            </h6>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {[place.type, place.area || place.city, place.country].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {place.estimatedDurationMinutes && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {formatDuration(place.estimatedDurationMinutes)} visit
              </span>
            )}
            {place.estimatedCost && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {formatMoneyRange(place.estimatedCost.min, place.estimatedCost.max, place.estimatedCost.currency)}
              </span>
            )}
          </div>
        </div>
        {place.description && (
          <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {place.description}
          </p>
        )}
      </article>
    </div>
  );
}

function TransitBlock({
  leg,
  selectedMode,
  onSelectMode,
}: {
  leg: ItineraryAnalysisLeg;
  selectedMode: TransitMode | undefined;
  onSelectMode: (legId: string, mode: TransitMode) => void;
}) {
  const selectedOption = getSelectedTransitOption(leg, selectedMode);

  return (
    <div className="relative pl-9">
      <div className="absolute left-2 top-0 flex h-full flex-col items-center">
        <span className="mt-2 h-3 w-3 rounded-full border border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-950" />
        <span className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <article className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200">
              Transit options
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              <span className="truncate">{leg.from}</span>
              <Navigation className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span className="truncate">{leg.to}</span>
            </div>
          </div>
          <a
            href={selectedOption.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 rounded-full border border-blue-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-200 dark:hover:bg-blue-950 dark:focus:ring-offset-zinc-900"
          >
            Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {leg.options.map((option) => {
            const isSelected = option.mode === selectedOption.mode;
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => onSelectMode(leg.id, option.mode)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                  isSelected
                    ? "bg-blue-700 text-white shadow-sm dark:bg-blue-500 dark:text-zinc-950"
                    : "bg-white text-blue-900 hover:bg-blue-100 dark:bg-zinc-900 dark:text-blue-200 dark:hover:bg-blue-900/50"
                }`}
              >
                {option.mode} {option.durationMinutes}m
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_1fr] sm:items-center">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {selectedOption.distance}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {selectedOption.cost}
          </span>
          <p className="text-xs leading-5 text-blue-950 dark:text-blue-100">
            {selectedOption.note}
          </p>
        </div>
      </article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

function Insight({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-700 dark:text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function getSelectedTransitOption(leg: ItineraryAnalysisLeg, selectedMode?: TransitMode) {
  return (
    leg.options.find((option) => option.mode === selectedMode) ??
    leg.options.find((option) => option.recommended) ??
    leg.options[0]
  );
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
