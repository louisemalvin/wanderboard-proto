"use client";

// ------------------------------------------------------------------
// Inline itinerary companion view for Planner Guide Mode.
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageCircle,
  MapPinned,
} from "lucide-react";
import {
  buildMockItineraryAnalysis,
  buildEstimatedDayFlow,
  type ItineraryAnalysisDay,
  type EstimatedDayFlowStopItem,
  type EstimatedDayFlowMovementItem,
} from "@/data/mock-itinerary-analysis";
import { useTripStore } from "@/stores/trip-store";
import {
  formatMoneyRange,
  formatTimeFromMinutes,
  parseTimeToMinutes,
} from "@/lib/format";

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
                Guide mode
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
              Based on your current plan
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
              <SelectedDayView key={selectedDay.id} day={selectedDay} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SelectedDayView({ day }: { day: ItineraryAnalysisDay }) {
  const [dayStartTime, setDayStartTime] = useState(() =>
    formatTimeFromMinutes(day.estimatedFlow.dayStartMinutes),
  );

  const estimatedFlow = useMemo(
    () => buildEstimatedDayFlow(day.stops, day.legs, dayStartTime),
    [day.stops, day.legs, dayStartTime],
  );

  const hasFoodStops = estimatedFlow.items.some(
    (item) => item.kind === "stop" && item.isFoodRelated,
  );

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (parseTimeToMinutes(value) !== null) {
      setDayStartTime(value);
    }
  };

  const estimatedTravelMinutes = estimatedFlow.items
    .filter((item) => item.kind === "movement")
    .reduce((sum, item) => sum + (item as EstimatedDayFlowMovementItem).durationMinutes, 0);

  const stopCount = estimatedFlow.items.filter((item) => item.kind === "stop").length;

  // Compute food-anchor time: after the last stop's estimated duration
  const lastStopItem = [...estimatedFlow.items].reverse().find(
    (item) => item.kind === "stop",
  ) as EstimatedDayFlowStopItem | undefined;
  const anchorStartMinutes = lastStopItem
    ? lastStopItem.startMinutes + lastStopItem.durationMinutes
    : 0;

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Main column — estimated day flow */}
      <div className="flex flex-col gap-5">
        {/* Day start control */}
        <div className="rounded-2xl border border-[#DED6CC] bg-[#FFFDFC] p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="guide-day-start-time"
                className="text-sm font-semibold text-[#1F2A22]"
              >
                Day start
              </label>
              <input
                id="guide-day-start-time"
                type="time"
                value={dayStartTime}
                onChange={handleStartTimeChange}
                className="rounded-lg border border-[#DED6CC] bg-[#F7F4EF] px-3 py-1.5 text-sm font-medium text-[#1F2A22] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-2 focus:ring-offset-[#FFFDFC]"
              />
            </div>
            <p className="text-xs leading-5 text-[#667066]">
              Shifting the start time updates all stop times below — no need to set
              each one individually.
            </p>
          </div>
        </div>

        {/* Estimated day flow section */}
        <section className="rounded-2xl border border-[#DED6CC] bg-[#FFFDFC] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#1F2A22]">
                Estimated day flow
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#667066]">
                Approximate timing based on your current plan. Confirm details
                before you go.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#E7F1E8] px-2.5 py-0.5 text-[11px] font-medium text-[#2E6F40]">
              {stopCount} {stopCount === 1 ? "stop" : "stops"}
            </span>
          </div>

          {estimatedFlow.items.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#667066]">
              No stops assigned to this day yet — switch to Edit mode to add
              places.
            </p>
          ) : (
            <div className="rail-flow">
              {estimatedFlow.items.map((item) => {
                if (item.kind === "stop") {
                  return (
                    <StopRailRow
                      key={item.id}
                      stop={item}
                    />
                  );
                }
                return (
                  <TransitRailRow
                    key={item.id}
                    movement={item}
                  />
                );
              })}

              {/* End-of-day terminal marker */}
              <div className="rail-end-row" aria-hidden="true">
                <div />
                <div className="rail-track">
                  <div className="rail-line" />
                </div>
                <div className="rail-end-label">
                  <span className="text-[11px] leading-tight text-[#667066]">
                    End of day
                  </span>
                </div>
              </div>

              {/* Optional food / break anchor */}
              {!hasFoodStops && (
                <FoodAnchorRailRow startMinutes={anchorStartMinutes} />
              )}
            </div>
          )}

          {/* Text hint when no food stops AND flow is empty (no anchor row rendered) */}
          {!hasFoodStops && estimatedFlow.items.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-[#BFCDBF] bg-[#F7F4EF] p-3 text-xs leading-5 text-[#667066]">
              No food or break stops on this day — entirely optional. You can add
              one in Edit mode if that helps round out the day.
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="rounded-2xl border border-[#DED6CC] bg-[#FFFDFC] p-5 shadow-sm lg:sticky lg:top-16 lg:self-start">
        <h2 className="text-sm font-semibold text-[#1F2A22]">Day guide</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center lg:grid-cols-1 lg:text-left">
          <Metric label="Stops" value={String(stopCount)} />
          <Metric
            label="Travel"
            value={formatMinutes(estimatedTravelMinutes)}
          />
          <Metric label="Pace" value={day.pacing} />
        </div>
        <div className="mt-4 space-y-3">
          <Insight
            icon={<Clock className="h-4 w-4" />}
            label="Worth checking"
            value={day.openingHoursNote}
          />
          <Insight
            icon={<MapPinned className="h-4 w-4" />}
            label="Day shape"
            value={day.weatherNote}
          />
        </div>
        <div className="mt-4 border-t border-[#DED6CC] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#667066]">
            Practical notes for this day
          </h3>
          <ul className="mt-3 space-y-2">
            {day.guideNotes.map((note) => (
              <li
                key={note}
                className="rounded-xl border border-[#DED6CC] bg-[#F7F4EF] p-3 text-xs leading-5 text-[#1F2A22]"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
        <GuideAssistantPanel />
      </aside>
    </section>
  );
}

// ------------------------------------------------------------------
// Rail row sub-components
// ------------------------------------------------------------------

function StopRailRow({
  stop,
}: {
  stop: EstimatedDayFlowStopItem;
}) {
  const place = stop.place;
  const timeLabel = formatTimeFromMinutes(stop.startMinutes);

  return (
    <div className="rail-row">
      {/* Time column */}
      <div className="rail-time-cell">
        <span className="rail-time-label">{timeLabel}</span>
      </div>

      {/* Rail column */}
      <div className="rail-track">
        <div className="rail-line" />
        <div className="rail-dot rail-dot-filled" />
        <div className="rail-line" />
      </div>

      {/* Content column */}
      <div className="rail-content">
        <div className="rounded-xl border border-[#DED6CC] bg-[#F7F4EF] p-3">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-medium text-[#667066]">
              {stop.order}.
            </span>
            <h3 className="text-sm font-semibold text-[#1F2A22]">
              {place.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#667066]">
            <span>
              {[place.type, place.area || place.city]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <span aria-hidden="true">·</span>
            <span>{stop.durationLabel}</span>
            {place.estimatedCost && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {formatMoneyRange(
                    place.estimatedCost.min,
                    place.estimatedCost.max,
                    place.estimatedCost.currency,
                  )}
                </span>
              </>
            )}
            {stop.isFoodRelated && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                Food
              </span>
            )}
          </div>

          {place.description && (
            <p className="mt-1.5 text-xs leading-5 text-[#1F2A22] line-clamp-2">
              {place.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TransitRailRow({
  movement,
}: {
  movement: EstimatedDayFlowMovementItem;
}) {
  const timeLabel = formatTimeFromMinutes(movement.startMinutes);

  return (
    <div className="rail-row rail-row-transit">
      {/* Time column */}
      <div className="rail-time-cell">
        <span className="rail-time-label rail-time-label-transit">
          {timeLabel}
        </span>
      </div>

      {/* Rail column */}
      <div className="rail-track">
        <div className="rail-line" />
        <div className="rail-dot rail-dot-open" />
        <div className="rail-line" />
      </div>

      {/* Content column */}
      <div className="rail-content rail-content-transit">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#667066]">
          <span className="font-medium text-[#1F2A22]">
            {movement.durationLabel}
          </span>
          <span>{movement.recommendedOption.mode}</span>
          {movement.recommendedOption.mapUrl && (
            <a
              href={movement.recommendedOption.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto shrink-0 rounded-full border border-[#DED6CC] bg-[#F7F4EF] px-2 py-0.5 text-[11px] font-medium text-[#2E6F40] transition-colors hover:bg-[#E7F1E8] focus:outline-none focus:ring-2 focus:ring-[#2E6F40] focus:ring-offset-1"
            >
              Route
              <ExternalLink className="ml-1 inline h-2.5 w-2.5" />
            </a>
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-4 text-[#667066]">
          {movement.routeCheckReminder}
        </p>
      </div>
    </div>
  );
}

function FoodAnchorRailRow({
  startMinutes,
}: {
  startMinutes: number;
}) {
  const timeLabel = formatTimeFromMinutes(startMinutes);

  return (
    <div className="rail-row rail-row-anchor">
      {/* Time column */}
      <div className="rail-time-cell">
        <span className="rail-time-label rail-time-label-anchor">
          {timeLabel}
        </span>
      </div>

      {/* Rail column */}
      <div className="rail-track">
        <div className="rail-line" />
        <div className="rail-dot rail-dot-anchor" />
        <div className="rail-line" />
      </div>

      {/* Content column */}
      <div className="rail-content rail-content-anchor">
        <p className="rounded-lg border border-dashed border-[#BFCDBF] bg-[#F7F4EF] px-3 py-2 text-xs leading-5 text-[#667066]">
          Optional: add a food or break stop in Edit mode if that helps round
          out the day.
        </p>
      </div>
    </div>
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

function GuideAssistantPanel() {
  const prompts = [
    "What should I check before leaving?",
    "How should I use this day if plans change?",
    "What is the easiest next step?",
  ];

  return (
    <section className="mt-4 rounded-xl border border-[#BFCDBF] bg-[#E7F1E8] p-4" aria-label="Ask Wanderboard in Guide Mode">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-[#FFFDFC] p-1.5 text-[#2E6F40]">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#1F2A22]">
            Ask Wanderboard
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#1F2A22]">
            Guide Mode is for understanding and following this plan. Use Edit mode when you want Wanderboard to change the board.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <span key={prompt} className="rounded-full border border-[#BFCDBF] bg-[#FFFDFC] px-3 py-1.5 text-xs font-medium text-[#2E6F40]">
            {prompt}
          </span>
        ))}
      </div>
    </section>
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

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
