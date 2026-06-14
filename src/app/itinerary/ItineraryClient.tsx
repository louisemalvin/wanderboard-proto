"use client";

// ------------------------------------------------------------------
// Itinerary client orchestrator
// Uses the active trip board, manages day assignment and section reorder
// ------------------------------------------------------------------

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bookmark, Plus } from "lucide-react";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";
import type { TripBoard, Place } from "@/lib/trip-types";
import TripRequiredState from "@/components/shared/trip-required-state";
import TripWorkflowHeader from "@/components/shared/trip-workflow-header";
import ItinerarySection from "@/components/itinerary/itinerary-section";
import type { SectionInfo } from "@/components/itinerary/itinerary-section";
import MoriRefinementPanel from "@/components/itinerary/ai-refinement-panel";
import MoriChat from "@/components/guide/mori-chat";

const SECTIONS: SectionInfo[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

// ------------------------------------------------------------------
// Helpers — get places for a section in day-plan order
// ------------------------------------------------------------------

function getDayPlaceIds(board: TripBoard, dayId: string): string[] {
  const plan = board.dayPlans.find((p) => p.dayId === dayId);
  return plan?.assignedPlaceIds ?? [];
}

function getSectionPlaceIds(dayPlaceIds: string[], sectionIndex: number): string[] {
  if (sectionIndex === 0) return dayPlaceIds.slice(0, 2);
  if (sectionIndex === 1) return dayPlaceIds.slice(2, 4);
  return dayPlaceIds.slice(4);
}

function getPlaces(board: TripBoard, placeIds: string[]): Place[] {
  return placeIds
    .map((id) => board.savedPlaces[id])
    .filter((place): place is Place => Boolean(place));
}

function ensurePlanningDays(board: TripBoard): TripBoard {
  const targetDayCount = Math.max(1, board.durationDays, board.days.length);
  const days = [...board.days];
  for (let index = days.length; index < targetDayCount; index++) {
    days.push({
      id: `day-${board.id}-${index + 1}`,
      dayNumber: index + 1,
      title: index === 0 ? "First day" : "Open day",
      summary: "Assign saved places here as the plan evolves.",
    });
  }

  const existingPlanIds = new Set(board.dayPlans.map((plan) => plan.dayId));
  const dayPlans = [
    ...board.dayPlans,
    ...days
      .filter((day) => !existingPlanIds.has(day.id))
      .map((day) => ({ dayId: day.id, assignedPlaceIds: [] })),
  ];

  const normalized: TripBoard = {
    ...board,
    durationDays: Math.max(1, board.durationDays),
    days,
    dayPlans,
  };

  const changed = days.length !== board.days.length || dayPlans.length !== board.dayPlans.length;
  return changed ? { ...normalized, updatedAt: new Date().toISOString() } : board;
}

function hasAssignedPlaces(board: TripBoard) {
  return board.dayPlans.some((plan) => plan.assignedPlaceIds.length > 0);
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ItineraryClient() {
  const reorderPlaces = useTripStore((s) => s.reorderPlaces);
  const assignPlaceToDay = useTripStore((s) => s.assignPlaceToDay);
  const unassignPlaceFromDay = useTripStore((s) => s.unassignPlaceFromDay);
  const updateTrip = useTripStore((s) => s.updateTrip);

  const [hydrated, setHydrated] = useState(false);
  const [storeHasTrip, setStoreHasTrip] = useState(false);
  const [board, setBoard] = useState<TripBoard | null>(null);
  const [activeDayId, setActiveDayId] = useState("");
  const [assignmentTargets, setAssignmentTargets] = useState<Record<string, string>>({});

  // Handle store hydration. Require a trip in the store.
  useEffect(() => {
    const onHydrated = () => {
      setHydrated(true);
      const storeBoard = useTripStore.getState().board;
        if (storeBoard) {
          setStoreHasTrip(true);
          const normalizedBoard = ensurePlanningDays(storeBoard);
          if (normalizedBoard !== storeBoard) {
            useTripStore.getState().updateTrip(storeBoard.id, normalizedBoard);
          }
        setBoard({ ...normalizedBoard });
        setActiveDayId((current) =>
          normalizedBoard.days.some((day) => day.id === current)
            ? current
            : (normalizedBoard.days[0]?.id ?? ""),
        );
      } else {
        setStoreHasTrip(false);
      }
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

  // Sync board from store when it changes
  useEffect(() => {
    const unsub = useTripStore.subscribe((state) => {
      if (state.board) {
        setStoreHasTrip(true);
        const normalizedBoard = ensurePlanningDays(state.board);
        setBoard({ ...normalizedBoard });
        setActiveDayId((current) =>
          normalizedBoard.days.some((day) => day.id === current)
            ? current
            : (normalizedBoard.days[0]?.id ?? ""),
        );
      } else {
        setStoreHasTrip(false);
        setBoard(null);
      }
    });
    return unsub;
  }, []);

  // -- Reorder handler --
  const handleReorder = useCallback(
    (sectionId: string, fromIndex: number, toIndex: number) => {
      if (!board) return;
      const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionId);
      if (sectionIndex < 0) return;

      const plan = board.dayPlans.find((p) => p.dayId === activeDayId);
      if (!plan) return;

      // Map section-local indices to day-plan-wide absolute indices
      const sectionPlaceIdsSet = new Set(
        getSectionPlaceIds(plan.assignedPlaceIds, sectionIndex),
      );
      const sectionIndicesInPlan: number[] = [];
      plan.assignedPlaceIds.forEach((id, idx) => {
        if (sectionPlaceIdsSet.has(id)) {
          sectionIndicesInPlan.push(idx);
        }
      });

      const fromAbsolute = sectionIndicesInPlan[fromIndex];
      const toAbsolute = sectionIndicesInPlan[toIndex];
      if (fromAbsolute === undefined || toAbsolute === undefined) return;

      reorderPlaces(board.id, activeDayId, fromAbsolute, toAbsolute);
    },
    [activeDayId, board, reorderPlaces],
  );

  const activeDay = board
    ? (board.days.find((day) => day.id === activeDayId) ?? board.days[0])
    : undefined;
  const activeDayPlaceIds = useMemo(
    () => (board ? getDayPlaceIds(board, activeDay?.id ?? "") : []),
    [activeDay?.id, board],
  );
  const assignedPlaceIds = useMemo(
    () => new Set(board?.dayPlans.flatMap((plan) => plan.assignedPlaceIds) ?? []),
    [board?.dayPlans],
  );
  const savedPlacesCount = Object.keys(board?.savedPlaces ?? {}).length;
  const placePool = useMemo(() => {
    return Object.values(board?.savedPlaces ?? {}).filter((place) => !assignedPlaceIds.has(place.id));
  }, [assignedPlaceIds, board?.savedPlaces]);

  const handleAssignPlace = useCallback(
    (place: Place, dayId: string) => {
      if (!board || !dayId) return;
      assignPlaceToDay(board.id, dayId, place.id);
    },
    [assignPlaceToDay, board],
  );

  const handleAutoArrange = useCallback(() => {
    if (!board || board.days.length === 0 || placePool.length === 0) return;
    const nextDayPlans = board.dayPlans.map((plan) => ({
      ...plan,
      assignedPlaceIds: [...plan.assignedPlaceIds],
    }));

    placePool.forEach((place, index) => {
      const day = board.days[index % board.days.length];
      const plan = nextDayPlans.find((item) => item.dayId === day.id);
      if (plan && !plan.assignedPlaceIds.includes(place.id)) {
        plan.assignedPlaceIds.push(place.id);
      }
    });

    updateTrip(board.id, { dayPlans: nextDayPlans });
  }, [board, placePool, updateTrip]);

  const handleMoveToDay = useCallback(
    (placeId: string, nextDayId: string) => {
      if (!board || !activeDay || nextDayId === activeDay.id) return;
      unassignPlaceFromDay(board.id, activeDay.id, placeId);
      assignPlaceToDay(board.id, nextDayId, placeId);
    },
    [activeDay, assignPlaceToDay, board, unassignPlaceFromDay],
  );

  const handleRemoveFromDay = useCallback(
    (placeId: string) => {
      if (!board || !activeDay) return;
      unassignPlaceFromDay(board.id, activeDay.id, placeId);
    },
    [activeDay, board, unassignPlaceFromDay],
  );

  // -- Render --
  if (hydrated && !storeHasTrip) {
    return (
      <TripRequiredState
        title="Choose or create a trip first"
        description="The itinerary board organizes saved destinations from an active trip. Start from the project hub before planning days."
        primaryHref="/home"
        primaryLabel="Go to home"
      />
    );
  }

  if (!board) return null;

  return (
    <div className="flex flex-1 flex-col bg-[#F7F4EF]">
      <TripWorkflowHeader
        title="Plan your itinerary"
        meta={`${board.destinationText || "Current trip"} · ${board.durationDays} ${board.durationDays === 1 ? "day" : "days"} · ${savedPlacesCount} saved ${savedPlacesCount === 1 ? "place" : "places"}`}
      >
        <Link
          href="/map"
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-white/10 px-3 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Add places
        </Link>
        <button
          type="button"
          disabled={placePool.length === 0}
          onClick={handleAutoArrange}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-forest-dark transition-colors hover:bg-forest-surface disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Auto arrange
        </button>
      </TripWorkflowHeader>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-36 lg:px-6 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            {/* Day selector tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto" role="tablist" aria-label="Itinerary days">
              {board.days.map((day) => {
                const count = getDayPlaceIds(board, day.id).length;
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

            {/* Day header */}
            <div className="mb-5 space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#1F2A22]">
                  Day {activeDay?.dayNumber ?? 1}: {activeDay?.title ?? "Trip day"}
                </h2>
                <p className="mt-0.5 text-xs text-[#667066]">
                  {activeDay?.summary ?? "Assign places to start shaping this day."}
                </p>
              </div>

            </div>

            {/* Desktop: two-column layout (sections + refinement panel) */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6">
              {/* Sections */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {activeDayPlaceIds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#BFCDBF] bg-[#FFFDFC] p-5 text-sm text-[#667066]">
                    Assign saved places from the pool to build this day.
                  </div>
                ) : (
                  SECTIONS.map((section, index) => {
                    const sectionPlaceIds = getSectionPlaceIds(activeDayPlaceIds, index);
                    return (
                      <ItinerarySection
                        key={section.id}
                        section={section}
                        places={getPlaces(board, sectionPlaceIds)}
                        days={board.days}
                        currentDayId={activeDay?.id}
                        onReorder={(fromIndex, toIndex) =>
                          handleReorder(section.id, fromIndex, toIndex)
                        }
                        onMoveToDay={handleMoveToDay}
                        onRemoveFromDay={handleRemoveFromDay}
                      />
                    );
                  })
                )}
              </div>

              {/* Place pool + Mori Refinement Panel — side panel on desktop */}
              <div className="space-y-4 lg:col-span-1">
                <section className="rounded-xl border border-[#DED6CC] bg-[#FFFDFC] p-4 shadow-sm" aria-labelledby="place-pool-title">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 id="place-pool-title" className="text-sm font-semibold text-[#1F2A22]">
                        Unscheduled places
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#667066]">
                         Saved map places that still need a day.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#F7F4EF] px-2 py-0.5 text-xs font-medium text-[#667066]">
                      {placePool.length}
                    </span>
                  </div>

                  {placePool.length === 0 ? (
                      Object.keys(board.savedPlaces).length === 0 ? (
                        <div className="rounded-lg bg-[#F7F4EF] px-3 py-3 text-xs leading-relaxed text-[#667066]">
                          <p>Add destinations before planning your days.</p>
                          <Link href="/map" className="mt-2 inline-flex font-semibold text-forest hover:underline">
                            Open map
                          </Link>
                        </div>
                      ) : (
                        <p className="rounded-lg bg-[#F7F4EF] px-3 py-3 text-xs leading-relaxed text-[#667066]">
                          Everything is assigned. Remove a place from a day to keep it here for later.
                        </p>
                      )
                  ) : (
                    <div className="space-y-2">
                      {placePool.map((place) => (
                        <div key={place.id} className="rounded-xl border border-[#DED6CC] bg-[#FFFDFC] p-3">
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7F1E8] text-[#2E6F40]">
                              <Bookmark className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[#1F2A22]">{place.name}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#667066]">
                                {place.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <select
                              aria-label={`Assign ${place.name} to a day`}
                              value={assignmentTargets[place.id] ?? activeDay?.id ?? board.days[0]?.id}
                              onChange={(event) =>
                                setAssignmentTargets((prev) => ({
                                  ...prev,
                                  [place.id]: event.target.value,
                                }))
                              }
                              className="min-w-0 flex-1 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-2 py-2 text-xs font-medium text-[#1F2A22] outline-none focus-visible:border-[#2E6F40] focus-visible:ring-2 focus-visible:ring-[#E7F1E8]"
                            >
                              {board.days.map((day) => (
                                <option key={day.id} value={day.id}>
                                  Day {day.dayNumber}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                handleAssignPlace(
                                  place,
                                  assignmentTargets[place.id] ?? activeDay?.id ?? board.days[0]?.id ?? "",
                                );
                              }}
                              className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#2E6F40] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#245A34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <MoriRefinementPanel
                  disabled={placePool.length === 0}
                  hasAssignedPlaces={hasAssignedPlaces(board)}
                  onAutoArrange={handleAutoArrange}
                />
              </div>
            </div>
          </div>
        </main>
      <MoriChat
        placeholder="Ask Mori to help arrange your day..."
        emptyHint="Ask Mori to distribute stops, reorder activities, or fill gaps in your itinerary."
      />
    </div>
  );
}
