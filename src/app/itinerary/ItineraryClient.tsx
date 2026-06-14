"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bookmark, Plus, Wand2 } from "lucide-react";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";
import type { TripBoard, Place } from "@/lib/trip-types";
import type { ItineraryProposal } from "@/lib/ai/mori-schemas";
import TripRequiredState from "@/components/shared/trip-required-state";
import ItinerarySection from "@/components/itinerary/itinerary-section";
import type { SectionInfo } from "@/components/itinerary/itinerary-section";
import MoriInfoPanel from "@/components/itinerary/ai-refinement-panel";
import MoriComposer from "@/components/itinerary/mori-composer";

const SECTIONS: SectionInfo[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

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

  const handleReorder = useCallback(
    (sectionId: string, fromIndex: number, toIndex: number) => {
      if (!board) return;
      const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionId);
      if (sectionIndex < 0) return;

      const plan = board.dayPlans.find((p) => p.dayId === activeDayId);
      if (!plan) return;

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

  // AI proposal handlers
  const handleApplyProposal = useCallback(
    async (proposal: ItineraryProposal) => {
      if (!board) throw new Error("No active trip");

      const currentBoard = useTripStore.getState().board;
      if (!currentBoard) throw new Error("Board not found");

      // Validate all referenced entities exist
      const validDayIds = new Set(currentBoard.days.map((d) => d.id));
      const validPlaceIds = new Set(Object.keys(currentBoard.savedPlaces));

      for (const op of proposal.operations) {
        if ("dayId" in op && op.dayId && !validDayIds.has(op.dayId)) {
          throw new Error(
            `Referenced day no longer exists. Please regenerate the proposal.`,
          );
        }
        if ("placeId" in op && op.placeId && !validPlaceIds.has(op.placeId)) {
          throw new Error(
            `Referenced place no longer exists. Please regenerate the proposal.`,
          );
        }
        if ("fromDayId" in op && op.fromDayId && !validDayIds.has(op.fromDayId)) {
          throw new Error(
            `Referenced day no longer exists. Please regenerate the proposal.`,
          );
        }
        if ("toDayId" in op && op.toDayId && !validDayIds.has(op.toDayId)) {
          throw new Error(
            `Referenced day no longer exists. Please regenerate the proposal.`,
          );
        }
      }

      // Apply operations atomically
      const dayPlans = currentBoard.dayPlans.map((plan) => ({
        ...plan,
        assignedPlaceIds: [...plan.assignedPlaceIds],
      }));

      for (const op of proposal.operations) {
        switch (op.type) {
          case "reorder_places": {
            const plan = dayPlans.find((p) => p.dayId === op.dayId);
            if (plan && op.orderedPlaceIds) {
              // Only keep IDs that exist in both the plan and the proposal
              const existingIds = new Set(plan.assignedPlaceIds);
              plan.assignedPlaceIds = op.orderedPlaceIds.filter((id) =>
                existingIds.has(id),
              );
            }
            break;
          }
          case "assign_place": {
            const plan = dayPlans.find((p) => p.dayId === op.dayId);
            if (plan && op.placeId && !plan.assignedPlaceIds.includes(op.placeId)) {
              if (op.position != null && op.position < plan.assignedPlaceIds.length) {
                plan.assignedPlaceIds.splice(op.position, 0, op.placeId);
              } else {
                plan.assignedPlaceIds.push(op.placeId);
              }
            }
            break;
          }
          case "unassign_place": {
            const plan = dayPlans.find((p) => p.dayId === op.dayId);
            if (plan && op.placeId) {
              plan.assignedPlaceIds = plan.assignedPlaceIds.filter(
                (id) => id !== op.placeId,
              );
            }
            break;
          }
          case "move_place": {
            const fromPlan = dayPlans.find((p) => p.dayId === op.fromDayId);
            const toPlan = dayPlans.find((p) => p.dayId === op.toDayId);
            if (fromPlan && op.placeId) {
              fromPlan.assignedPlaceIds = fromPlan.assignedPlaceIds.filter(
                (id) => id !== op.placeId,
              );
            }
            if (toPlan && op.placeId && !toPlan.assignedPlaceIds.includes(op.placeId)) {
              if (op.position != null && op.position < toPlan.assignedPlaceIds.length) {
                toPlan.assignedPlaceIds.splice(op.position, 0, op.placeId);
              } else {
                toPlan.assignedPlaceIds.push(op.placeId);
              }
            }
            break;
          }
          case "update_day_summary": {
            const newSummary = op.summary;
            if (newSummary) {
              useTripStore.getState().updateTrip(currentBoard.id, {
                days: currentBoard.days.map((d) =>
                  d.id === op.dayId ? { ...d, summary: newSummary } : d,
                ),
              });
            }
            break;
          }
        }
      }

      // Commit all day plan changes
      useTripStore.getState().updateTrip(currentBoard.id, { dayPlans });
    },
    [board],
  );

  const handleDismissProposal = useCallback(() => {
    // Already handled by MoriComposer via proposal store
  }, []);

  const currentDayLabel = activeDay
    ? `Day ${activeDay.dayNumber}: ${activeDay.title}`
    : undefined;

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

  const isDayEmpty = activeDayPlaceIds.length === 0;

  return (
    <div className="flex flex-1 flex-col bg-[color:var(--wb-bg)]">
      {/* ── Workspace header ── */}
      <header className="border-b border-[color:var(--wb-border)] bg-[color:var(--wb-bg)]">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-lg tracking-tight text-[color:var(--wb-ink)]">
              Plan your itinerary
            </h1>
            <p className="mt-0.5 truncate text-sm text-[color:var(--wb-muted)]">
              {board.destinationText || "Current trip"} · {board.durationDays}{" "}
              {board.durationDays === 1 ? "day" : "days"} · {savedPlacesCount} saved{" "}
              {savedPlacesCount === 1 ? "place" : "places"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/map"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 text-sm font-medium text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--wb-forest)" }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add places
            </Link>
            <button
              type="button"
              disabled={placePool.length === 0}
              onClick={handleAutoArrange}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-[color:var(--wb-forest)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--wb-forest)" }}
            >
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Auto arrange
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-5">
        <div className="mx-auto max-w-[1120px] pb-24">
          {/* ── Day selector tabs ── */}
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

          {/* ── Day heading ── */}
          <div className="mb-7">
            <h2 className="font-display text-[28px] leading-[1.15] tracking-tight text-[color:var(--wb-ink)]">
              Day {activeDay?.dayNumber ?? 1}: {activeDay?.title ?? "Trip day"}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--wb-muted)]">
              {activeDay?.summary ?? "Assign saved places here as the plan evolves."}
            </p>
          </div>

          {/* ── Two-column workspace ── */}
          <div className="itinerary-grid">
            {/* ── Left: itinerary canvas ── */}
            <div>
              {isDayEmpty ? (
                <div
                  className="flex flex-col items-center justify-center rounded-[18px] border border-dashed p-12 text-center"
                  style={{
                    minHeight: 520,
                    borderColor: "rgba(31, 42, 34, 0.18)",
                    background: "rgba(250, 248, 243, 0.65)",
                  }}
                >
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-5"
                    aria-hidden="true"
                  >
                    <rect x="20" y="12" width="24" height="4" rx="2" fill="#DDE5D8" />
                    <rect x="12" y="22" width="8" height="8" rx="2" fill="#DDE5D8" />
                    <rect x="24" y="22" width="8" height="8" rx="2" fill="#DDE5D8" />
                    <rect x="36" y="22" width="16" height="8" rx="2" fill="#EEF2EB" />
                    <rect x="12" y="34" width="8" height="8" rx="2" fill="#DDE5D8" />
                    <rect x="24" y="34" width="8" height="8" rx="2" fill="#DDE5D8" />
                    <rect x="36" y="34" width="16" height="8" rx="2" fill="#EEF2EB" />
                    <circle cx="46" cy="28" r="12" fill="none" stroke="#DDE5D8" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="46" cy="28" r="4" fill="#C5D3C0" />
                    <path
                      d="M40 40 L44 34 L48 40 Z"
                      fill="#DDE5D8"
                    />
                  </svg>
                  <h3 className="font-display text-xl text-[color:var(--wb-ink)]">
                    This day is open
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[color:var(--wb-muted)]">
                    Add places from your saved pool,
                    <br />
                    or auto arrange when you&rsquo;re ready.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {SECTIONS.map((section, index) => {
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
                  })}
                </div>
              )}
            </div>

            {/* ── Right rail ── */}
            <div className="flex flex-col gap-4">
              {/* Unscheduled places */}
              <section
                className="rounded-2xl border p-4"
                style={{
                  background: "#FAF8F3",
                  borderColor: "rgba(31, 42, 34, 0.12)",
                }}
                aria-labelledby="place-pool-title"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 id="place-pool-title" className="text-sm font-semibold text-[color:var(--wb-ink)]">
                      Unscheduled places
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--wb-muted)]">
                      Saved map places that still need a day.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[color:var(--wb-bg)] px-2 py-0.5 text-xs font-medium text-[color:var(--wb-muted)]">
                    {placePool.length}
                  </span>
                </div>

                {placePool.length === 0 ? (
                  Object.keys(board.savedPlaces).length === 0 ? (
                    <div
                      className="rounded-xl px-3 py-4 text-center text-xs leading-relaxed"
                      style={{ background: "rgba(247, 244, 239, 0.6)" }}
                    >
                      <Bookmark className="mx-auto mb-2 h-5 w-5 text-[color:var(--wb-muted)]" aria-hidden="true" />
                      <p className="font-medium text-[color:var(--wb-ink)]">No saved places yet.</p>
                      <p className="mt-1 text-[color:var(--wb-muted)]">
                        Add places you like while exploring.
                      </p>
                      <Link
                        href="/map"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--wb-forest)] hover:underline"
                      >
                        Open map &rarr;
                      </Link>
                    </div>
                  ) : (
                    <p
                      className="rounded-xl px-3 py-3 text-center text-xs leading-relaxed text-[color:var(--wb-muted)]"
                      style={{ background: "rgba(247, 244, 239, 0.6)" }}
                    >
                      Everything is assigned. Remove a place from a day to keep it here for later.
                    </p>
                  )
                ) : (
                  <div className="space-y-2">
                    {placePool.map((place) => (
                      <div
                        key={place.id}
                        className="rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-3"
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--wb-sage-light)] text-[color:var(--wb-moss)]">
                            <Bookmark className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[color:var(--wb-ink)]">
                              {place.name}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[color:var(--wb-muted)]">
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
                            className="min-w-0 flex-1 rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-2 py-2 text-xs font-medium text-[color:var(--wb-ink)] outline-none focus:border-[color:var(--wb-forest)] focus:ring-2 focus:ring-[color:var(--wb-sage)]"
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
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[color:var(--wb-forest)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ outlineColor: "var(--wb-forest)" }}
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

              <MoriInfoPanel hasSavedPlaces={savedPlacesCount > 0} />
            </div>
          </div>

        </div>
      </main>

      <div className="pointer-events-none fixed bottom-[64px] left-0 right-0 z-20 bg-transparent pb-3 pt-2 md:bottom-0">
        <div className="mx-auto max-w-[1120px] px-5">
          <MoriComposer
            surface="day_itinerary"
            onApplyProposal={handleApplyProposal}
            onDismissProposal={handleDismissProposal}
            currentDayLabel={currentDayLabel}
          />
        </div>
      </div>
    </div>
  );
}
