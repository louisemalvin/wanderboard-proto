"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";
import type { Place, TripBoard } from "@/lib/trip-types";
import type { GuideActivity } from "@/components/guide/guide-types";
import TripRequiredState from "@/components/shared/trip-required-state";
import NextActivityCard from "@/components/guide/next-activity-card";
import GuideTimeline from "@/components/guide/guide-timeline";
import ContextualTipCard from "@/components/guide/contextual-tip-card";
import MoriComposer from "@/components/itinerary/mori-composer";

const SEGMENT_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "live", label: "Live" },
  { value: "done", label: "Done" },
];

function getFirstAssignedDay(board: TripBoard) {
  return board.days.find((day) => {
    const plan = board.dayPlans.find((item) => item.dayId === day.id);
    return Boolean(plan?.assignedPlaceIds.length);
  });
}

function getDayPlaceCount(board: TripBoard, dayId: string) {
  return board.dayPlans.find((p) => p.dayId === dayId)?.assignedPlaceIds.length ?? 0;
}

function totalAssignedCount(board: TripBoard) {
  return board.dayPlans.reduce((sum, p) => sum + p.assignedPlaceIds.length, 0);
}

function placeToGuideActivity(place: Place, index: number): GuideActivity {
  const hour = 9 + index * 2;
  const time = `${String(Math.min(hour, 21)).padStart(2, "0")}:00`;
  const durationMinutes = place.estimatedDurationMinutes ?? 75;
  const duration = durationMinutes >= 60
    ? `${Math.round((durationMinutes / 60) * 10) / 10}h`
    : `${durationMinutes}m`;

  return {
    id: place.id,
    time,
    title: place.name,
    description: place.description || "Follow your saved notes and check opening details before you go.",
    type: place.type === "food" || place.type === "cafe" ? "food" : "activity",
    status: index === 0 ? "current" : "upcoming",
    duration,
    location: place.area || place.city,
  };
}

export default function GuideClient() {
  const [hydrated, setHydrated] = useState(false);
  const [storeHasTrip, setStoreHasTrip] = useState(false);
  const [board, setBoard] = useState<TripBoard | null>(null);
  const [segment, setSegment] = useState("live");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  useEffect(() => {
    const onHydrated = () => {
      setHydrated(true);
      const storeBoard = useTripStore.getState().board;
      setBoard(storeBoard);
      setStoreHasTrip(Boolean(storeBoard));
    };

    if (useTripStore.persist.hasHydrated()) {
      onHydrated();
    }

    const unsubFinish = useTripStore.persist.onFinishHydration(onHydrated);
    useTripStore.persist.rehydrate();
    return () => {
      unsubFinish();
    };
  }, []);

  useEffect(() => {
    const unsub = useTripStore.subscribe((state) => {
      setBoard(state.board);
      setStoreHasTrip(Boolean(state.board));
    });
    return unsub;
  }, []);

  const effectiveActiveDayId = activeDayId ?? (board ? getFirstAssignedDay(board)?.id ?? undefined : undefined);

  const activeDay = useMemo(() => {
    if (!board) return undefined;
    return board.days.find((d) => d.id === effectiveActiveDayId) ?? getFirstAssignedDay(board);
  }, [board, effectiveActiveDayId]);

  const activePlan = activeDay
    ? board?.dayPlans.find((plan) => plan.dayId === activeDay.id)
    : undefined;
  const allActivities = (activePlan?.assignedPlaceIds ?? [])
    .map((placeId) => board?.savedPlaces[placeId])
    .filter((place): place is Place => Boolean(place))
    .map(placeToGuideActivity);

  const plannedActivities = allActivities.filter(
    (activity) => activity.status === "upcoming",
  );
  const liveActivities = allActivities.filter(
    (activity) => activity.status !== "completed",
  );
  const completedActivities = allActivities.filter(
    (activity) => activity.status === "completed",
  );
  const nextActivity = allActivities[0];
  const dateLabel = activeDay ? `Day ${activeDay.dayNumber}` : "Guide";
  const nextLabel = nextActivity ? ` · Next: ${nextActivity.title}` : "";
  const guideStatus = nextActivity ? `Live now${nextLabel}` : "Live now";
  const guideTip = nextActivity
    ? `You are on track. Start with ${nextActivity.title}, then follow the remaining stops in order. You have enough travel time between both stops.`
    : "Plan at least one activity before switching into guide mode.";

  const overallCount = board ? totalAssignedCount(board) : 0;

  const handleSegmentChange = (value: string) => {
    setSegment(value);
  };

  const segmentTitle =
    segment === "planned"
      ? "Coming up"
      : segment === "done"
        ? "Completed"
        : "Your day";

  const segmentDescription =
    segment === "planned"
      ? "The remaining stops for today."
      : segment === "done"
        ? "A quick record of what has already been finished."
        : "Current and upcoming stops.";

  const visibleActivities =
    segment === "planned"
      ? plannedActivities
      : segment === "done"
        ? completedActivities
        : liveActivities;

  if (hydrated && !storeHasTrip) {
    return (
      <TripRequiredState
        title="Choose or create a trip first"
        description="Guide mode follows the itinerary for your active trip. Start from the project hub before using the day-of view."
        primaryHref="/home"
        primaryLabel="Go to home"
      />
    );
  }

  if (hydrated && storeHasTrip && overallCount === 0) {
    return (
      <TripRequiredState
        title="Plan your itinerary before using guide mode."
        description="Guide mode needs at least one saved place assigned to a day so it can build your timeline."
        primaryHref="/itinerary"
        primaryLabel="Open itinerary"
        secondaryHref="/map"
        secondaryLabel="Add places"
      />
    );
  }

  if (!board) return null;

  const dayTabs = board.days;

  return (
    <div className="flex flex-1 flex-col bg-[color:var(--wb-bg)] font-sans">
      {/* ── Workspace header ── */}
      <header className="border-b border-[color:var(--wb-border)] bg-[color:var(--wb-bg)]">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-lg tracking-tight text-[color:var(--wb-ink)]">
              Guide mode
            </h1>
            <p className="mt-0.5 truncate text-sm text-[color:var(--wb-muted)]">
              {board.destinationText || "Current trip"} · {dateLabel} · {guideStatus}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/itinerary"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 text-sm font-medium text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--wb-forest)" }}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit plan
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-28 lg:px-7">
        <div className="mx-auto max-w-[1120px]">
          {/* Day selector tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pt-4" role="tablist" aria-label="Guide days">
            {dayTabs.map((day) => {
              const count = getDayPlaceCount(board, day.id);
              const isActive = day.id === activeDay?.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveDayId(day.id)}
                  className="shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    ...(isActive
                      ? {
                          background: "#EEF2EB",
                          borderColor: "#163B2C",
                          borderWidth: "1.5px",
                          color: "#163B2C",
                        }
                      : {
                          background: "#FAF8F3",
                          borderColor: "rgba(31, 42, 34, 0.12)",
                          color: "var(--wb-muted)",
                        }),
                    outlineColor: "var(--wb-forest)",
                  }}
                >
                  <span className="block font-semibold">Day {day.dayNumber}</span>
                  <span className="block text-xs opacity-75">{count} places</span>
                </button>
              );
            })}
          </div>

          {!nextActivity ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[color:var(--wb-muted)]">
                Nothing planned for this day yet.
              </p>
              <p className="mt-1 text-xs text-[color:var(--wb-muted)]">
                Add activities in the itinerary before starting Guide Mode.
              </p>
              <Link
                href="/itinerary"
                className="mt-4 inline-flex min-h-[44px] items-center rounded-[10px] bg-[color:var(--wb-forest)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: "var(--wb-forest)" }}
              >
                Edit plan
              </Link>
            </div>
          ) : (
            <>
              {/* Planned / Live / Done */}
              <div className="mb-5">
                <div className="inline-flex rounded-lg bg-[color:var(--wb-bg)] p-0.5">
                  {SEGMENT_OPTIONS.map((option) => {
                    const isSelected = option.value === segment;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSegmentChange(option.value)}
                        className="min-h-[44px] min-w-0 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          ...(isSelected
                            ? {
                                background: "#163B2C",
                                color: "#FFFFFF",
                              }
                            : {
                                background: "transparent",
                                color: "var(--wb-ink)",
                              }),
                          outlineColor: "var(--wb-forest)",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {segment === "live" ? (
                <>
                  {/* Next Activity Hero */}
                  <div className="mb-6">
                    <NextActivityCard
                      title={nextActivity.title}
                      time={nextActivity.time}
                      duration={nextActivity.duration ?? "1h"}
                      location={nextActivity.location ?? board.destinationText ?? "Next stop"}
                      description={nextActivity.description}
                    />
                  </div>

                  {/* Two-column grid */}
                  <div className="guide-grid">
                    <div>
                      <GuideTimeline
                        activities={visibleActivities}
                        title={segmentTitle}
                        description={segmentDescription}
                      />
                    </div>

                    <div className="lg:sticky lg:top-4">
                      <ContextualTipCard tip={guideTip} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-w-2xl">
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      background: "#FAF8F3",
                      borderColor: "rgba(31, 42, 34, 0.12)",
                    }}
                  >
                    <GuideTimeline
                      activities={visibleActivities}
                      title={segmentTitle}
                      description={segmentDescription}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mori composer */}
      <div className="pointer-events-none fixed bottom-[64px] left-0 right-0 z-20 bg-transparent pb-3 pt-2 md:bottom-0">
        <div className="mx-auto max-w-[1120px] px-5">
          <MoriComposer placeholder="Ask Mori about your day..." />
        </div>
      </div>
    </div>
  );
}
