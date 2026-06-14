"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";
import type { Place, TripBoard } from "@/lib/trip-types";
import type { GuideActivity } from "@/components/guide/guide-types";
import TripRequiredState from "@/components/shared/trip-required-state";
import TripWorkflowHeader from "@/components/shared/trip-workflow-header";
import SegmentedControl from "@/components/shared/segmented-control";
import NextActivityCard from "@/components/guide/next-activity-card";
import GuideTimeline from "@/components/guide/guide-timeline";
import ContextualTipCard from "@/components/guide/contextual-tip-card";
import MoriChat from "@/components/guide/mori-chat";

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
  const guideStatus = nextActivity ? `Live now · Next: ${nextActivity.title}` : "Live now";
  const guideTip = nextActivity
    ? `You are on track. Start with ${nextActivity.title}, then follow the remaining stops in order.`
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
        : "Your Day";

  const segmentDescription =
    segment === "planned"
      ? "The remaining stops for today, without completed items in the way."
      : segment === "done"
        ? "A quick record of what has already been finished."
        : "Your current stop and the next decisions for the day.";

  const visibleActivities =
    segment === "planned"
      ? plannedActivities
      : segment === "done"
        ? completedActivities
        : liveActivities;

  // --- Guard: no trip selected ---
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
    <div className="flex flex-1 flex-col bg-app-bg font-sans">
      <TripWorkflowHeader
        title="Guide mode"
        meta={`${board.destinationText || "Current trip"} · ${dateLabel} · ${guideStatus}`}
      >
        <Link
          href="/itinerary"
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-forest-dark transition-colors hover:bg-forest-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Edit plan
        </Link>
      </TripWorkflowHeader>

      {/* Day selector tabs */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 lg:px-6">
        <div className="mb-2 flex gap-2 overflow-x-auto" role="tablist" aria-label="Guide days">
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
                className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${
                  isActive
                    ? "border-forest/30 bg-forest-surface text-forest-dark"
                    : "border-border bg-surface text-muted hover:border-forest/30 hover:text-ink"
                }`}
              >
                <span className="block font-semibold">Day {day.dayNumber}</span>
                <span className="block text-xs opacity-75">{count} places</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main scrollable content ── */}
      <main className="flex-1 overflow-y-auto px-4 pb-36 lg:px-6 lg:pb-28 w-full">
        {!nextActivity ? (
          <div className="mx-auto max-w-7xl py-12 text-center">
            <p className="text-muted text-sm">No activities planned for this day.</p>
            <Link
              href="/itinerary"
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg bg-forest-dark px-3 text-sm font-semibold text-white transition-colors hover:bg-forest-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Open itinerary
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto w-full max-w-7xl py-3">
              <div className="max-w-xl rounded-xl border border-border bg-app-bg p-1">
                <SegmentedControl
                  options={SEGMENT_OPTIONS}
                  value={segment}
                  onChange={handleSegmentChange}
                  fullWidth
                />
              </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              {segment === "live" ? (
                <>
                  {/* Next Activity Card */}
                  <div className="lg:col-span-2">
                      <NextActivityCard
                      title={nextActivity.title}
                      time={nextActivity.time}
                      duration={nextActivity.duration ?? "1h"}
                      location={nextActivity.location ?? board.destinationText ?? "Next stop"}
                      description={nextActivity.description}
                    />
                  </div>

                  {/* Timeline */}
                  <GuideTimeline
                    activities={visibleActivities}
                    title={segmentTitle}
                    description={segmentDescription}
                  />

                  {/* Contextual Tip */}
                  <ContextualTipCard tip={guideTip} />
                </>
              ) : (
                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-border bg-surface p-4 shadow-surface">
                    <GuideTimeline
                      activities={visibleActivities}
                      title={segmentTitle}
                      description={segmentDescription}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Mori chat (above bottom nav) ── */}
      <MoriChat
        placeholder="Ask Mori about your day..."
        emptyHint="Get live tips, adjust your timeline, or ask about your next stop."
      />
    </div>
  );
}
