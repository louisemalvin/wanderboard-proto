"use client";

// ------------------------------------------------------------------
// Inline read-only itinerary view for Planner View mode.
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CloudSun,
  Clock,
  ExternalLink,
  MapPinned,
  Navigation,
} from "lucide-react";
import {
  buildMockItineraryAnalysis,
  type ItineraryAnalysisDay,
  type ItineraryAnalysisLeg,
} from "@/data/mock-itinerary-analysis";
import { useTripStore } from "@/stores/trip-store";
import { formatDuration, formatMoneyRange } from "@/lib/format";

export interface ItineraryViewProps {
  onSwitchToEdit: () => void;
}

export function ItineraryView({ onSwitchToEdit }: ItineraryViewProps) {
  const board = useTripStore((s) => s.board);
  const analysis = useMemo(() => buildMockItineraryAnalysis(board), [board]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  if (!analysis) {
    return <EmptyItineraryView onSwitchToEdit={onSwitchToEdit} />;
  }

  const selectedDay = analysis.days.find((day) => day.id === selectedDayId) ?? analysis.days[0];
  const hasAnyStops = analysis.days.some((day) => day.stops.length > 0);

  return (
    <main className="flex-1 overflow-y-auto bg-[#F7F4EF]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#DED6CC] bg-[#FFFDFC] p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#2E6F40]">
                View mode
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#1F2A22]">
                {analysis.title}
              </h1>
              <p className="mt-1 text-sm text-[#667066]">
                {analysis.destination}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1F2A22]">
                {analysis.overview}
              </p>
            </div>
            <div className="rounded-full bg-[#E7F1E8] px-3 py-1 text-xs font-medium text-[#2E6F40]">
              Read-only itinerary
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{analysis.assumption}</span>
          </div>

        </section>

        {!hasAnyStops || !selectedDay ? (
          <EmptyItineraryView onSwitchToEdit={onSwitchToEdit} />
        ) : (
          <>
            <nav
              className="flex gap-2 overflow-x-auto rounded-xl border border-[#DED6CC] bg-[#FFFDFC] p-2"
              aria-label="Itinerary days"
            >
              {analysis.days.map((day) => {
                const isSelected = day.id === selectedDay.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#FFFDFC] ${
                      isSelected
                        ? "bg-[#2E6F40] text-white"
                        : "text-[#667066] hover:bg-[#E7F1E8] hover:text-[#1F2A22]"
                    }`}
                    aria-current={isSelected ? "page" : undefined}
                  >
                    {day.title.split(":")[0]}
                    <span className="ml-2 text-[11px] opacity-80">
                      {day.stopCount} {day.stopCount === 1 ? "stop" : "stops"}
                    </span>
                  </button>
                );
              })}
            </nav>

            {selectedDay.stops.length === 0 ? (
              <EmptyItineraryView onSwitchToEdit={onSwitchToEdit} />
            ) : (
              <SelectedDayView day={selectedDay} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SelectedDayView({ day }: { day: ItineraryAnalysisDay }) {
  const recommendedTravelMinutes = day.legs.reduce((total, leg) => {
    const option = getRecommendedTransitOption(leg);
    return total + option.durationMinutes;
  }, 0);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="wb-revamp-v2">
        <aside className="wb-r2-index-panel">
          <p className="wb-r2-label">Route index</p>
          <h2 className="wb-r2-title">{day.title}</h2>
          <p className="wb-r2-summary">{day.summary}</p>
          <div className="wb-r2-links" aria-label="Stops in this day">
            {day.stops.map((place, index) => (
              <div className="wb-r2-link" key={place.id}>
                <span className="wb-r2-dot" />
                <span>{index + 1}. {place.name}</span>
              </div>
            ))}
          </div>
        </aside>
        <div className="wb-r2-content" aria-label={`${day.title} timeline`}>
          {day.stops.map((place, index) => (
            <div key={place.id}>
              <article className="wb-r2-place">
                <div className="wb-r2-row">
                  <div className="min-w-0">
                    <h3 className="wb-r2-name">{place.name}</h3>
                    <p className="wb-r2-meta">{[place.type, place.area || place.city, place.country].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="wb-r2-pills">
                    {place.estimatedDurationMinutes && <span className="wb-r2-pill">{formatDuration(place.estimatedDurationMinutes)} visit</span>}
                    {place.estimatedCost && <span className="wb-r2-pill">{formatMoneyRange(place.estimatedCost.min, place.estimatedCost.max, place.estimatedCost.currency)}</span>}
                  </div>
                </div>
                {place.description && <p className="wb-r2-copy">{place.description}</p>}
              </article>
              {day.legs[index] && (
                <div className="wb-r2-travel">
                  <TransitBlock leg={day.legs[index]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-[#DED6CC] bg-[#FFFDFC] p-5 shadow-sm lg:sticky lg:top-16 lg:self-start">
        <h2 className="text-sm font-semibold text-[#1F2A22]">
          Day summary
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center lg:grid-cols-1 lg:text-left">
          <Metric label="Stops" value={String(day.stopCount)} />
          <Metric label="Travel" value={formatMinutes(recommendedTravelMinutes)} />
          <Metric label="Pace" value={day.pacing} />
        </div>
        <div className="mt-4 space-y-3">
          <Insight icon={<CloudSun className="h-4 w-4" />} label="Weather" value={day.weatherNote} />
          <Insight icon={<Clock className="h-4 w-4" />} label="Hours" value={day.openingHoursNote} />
          <Insight icon={<MapPinned className="h-4 w-4" />} label="Route" value="Predicted from available route data" />
        </div>
      </aside>
    </section>
  );
}

function EmptyItineraryView({ onSwitchToEdit }: ItineraryViewProps) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-[#BFCDBF] bg-[#FFFDFC] p-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-medium text-[#1F2A22]">
          No itinerary yet. Switch to Edit mode to assign places to days.
        </p>
        <button
          type="button"
          onClick={onSwitchToEdit}
          className="mt-4 rounded-lg bg-[#2E6F40] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245A34] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#FFFDFC]"
        >
          Edit mode
        </button>
      </div>
    </div>
  );
}

function TransitBlock({ leg }: { leg: ItineraryAnalysisLeg }) {
  const recommendedOption = getRecommendedTransitOption(leg);

  return (
    <div className="relative pl-9">
      <div className="absolute left-2 top-0 flex h-full flex-col items-center">
        <span className="mt-2 h-3 w-3 rounded-full border border-[#2E6F40]/40 bg-[#E7F1E8]" />
        <span className="mt-1 w-px flex-1 bg-[#DED6CC]" />
      </div>
      <article className="mb-3 rounded-xl border border-[#BFCDBF] bg-[#E7F1E8] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2E6F40]">
              Travel
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1F2A22]">
              <span className="truncate">{leg.from}</span>
              <Navigation className="h-3.5 w-3.5 shrink-0 text-[#2E6F40]" />
              <span className="truncate">{leg.to}</span>
            </div>
            <p className="mt-1 text-xs text-[#1F2A22]">
              Predicted from available route data
            </p>
          </div>
          <a
            href={recommendedOption.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 rounded-full border border-[#BFCDBF] bg-[#FFFDFC] px-2.5 py-1 text-xs font-medium text-[#2E6F40] transition-colors hover:bg-[#F7F4EF] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#E7F1E8]"
          >
            Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {leg.options.map((option) => {
            const isRecommended = option.mode === recommendedOption.mode;
            return (
              <span
                key={option.mode}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isRecommended
                    ? "bg-[#2E6F40] text-white shadow-sm"
                    : "bg-[#FFFDFC] text-[#2E6F40]"
                }`}
              >
                {option.mode} {option.durationMinutes}m
              </span>
            );
          })}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_1fr] sm:items-center">
          <span className="rounded-full bg-[#FFFDFC] px-2.5 py-1 text-xs font-medium text-[#1F2A22]">
            {recommendedOption.distance}
          </span>
          <span className="rounded-full bg-[#FFFDFC] px-2.5 py-1 text-xs font-medium text-[#1F2A22]">
            {recommendedOption.cost}
          </span>
          <p className="text-xs leading-5 text-[#1F2A22]">
            {recommendedOption.note}
          </p>
        </div>
      </article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F7F4EF] px-3 py-2">
      <p className="text-xs text-[#667066]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#1F2A22]">
        {value}
      </p>
    </div>
  );
}

function Insight({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#DED6CC] bg-[#F7F4EF] p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-[#667066]">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xs leading-5 text-[#1F2A22]">
        {value}
      </p>
    </div>
  );
}

function getRecommendedTransitOption(leg: ItineraryAnalysisLeg) {
  return leg.options.find((option) => option.recommended) ?? leg.options[0];
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
