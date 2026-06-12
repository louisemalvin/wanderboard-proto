"use client";

// ------------------------------------------------------------------
// Places tab — search + saved places list + assign to day
// ------------------------------------------------------------------

import { useState, useMemo } from "react";
import { useTripStore } from "@/stores/trip-store";
import { PlaceCard } from "@/components/planner/place-card";
import { SearchBar } from "@/components/planner/search-bar";

export function PlacesPanel() {
  const board = useTripStore((s) => s.board);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const previewPlace = useTripStore((s) => s.previewPlace);
  const previewPlaceId = useTripStore((s) => s.previewPlaceId);
  const assignPlaceToDay = useTripStore((s) => s.assignPlaceToDay);

  const [searchQuery, setSearchQuery] = useState("");
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});

  // ------------------------------------------------------------------
  // Filtered places (computed before any early return — hooks invariant)
  // ------------------------------------------------------------------

  const filteredPlaces = useMemo(() => {
    if (!board) return [];
    const places = Object.values(board.savedPlaces);
    if (!searchQuery.trim()) return places;
    const q = searchQuery.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [board, searchQuery]);

  // ---- Early guard ----

  if (!board || !currentTripId) return null;

  // Non-null aliases for closure type-narrowing
  const b = board;
  const tripId: string = currentTripId;

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  /** Find which day(s) a place is assigned to */
  function getAssignedDayNumbers(placeId: string): number[] {
    const dayNumbers: number[] = [];
    for (const plan of b.dayPlans) {
      if (plan.assignedPlaceIds.includes(placeId)) {
        const day = b.days.find((d) => d.id === plan.dayId);
        if (day) dayNumbers.push(day.dayNumber);
      }
    }
    return dayNumbers;
  }

  // ------------------------------------------------------------------
  // Assign handler
  // ------------------------------------------------------------------

  function handleAssign(placeId: string, dayId: string) {
    if (!dayId) return;
    assignPlaceToDay(tripId, dayId, placeId);
    setAssignTarget((prev) => {
      const next = { ...prev };
      delete next[placeId];
      return next;
    });
  }

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------

  if (Object.keys(board.savedPlaces).length === 0) {
    return (
      <div className="p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search places..."
        />
        <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No places saved yet. Search for places or ask Wanderboard to suggest
          some.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-3 p-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search places..."
      />

      <div className="flex flex-col gap-2">
        {filteredPlaces.map((place) => {
          const assignedDays = getAssignedDayNumbers(place.id);

          return (
            <PlaceCard
              key={place.id}
              place={place}
              isHighlighted={previewPlaceId === place.id}
              onClick={() =>
                previewPlace(
                  previewPlaceId === place.id ? null : place.id
                )
              }
              actions={
                assignedDays.length > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    Assigned to{" "}
                    {assignedDays
                      .sort((a, b) => a - b)
                      .map((d) => `Day ${d}`)
                      .join(", ")}
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <select
                      value={assignTarget[place.id] ?? ""}
                      onChange={(e) =>
                        setAssignTarget((prev) => ({
                          ...prev,
                          [place.id]: e.target.value,
                        }))
                      }
                      className="max-w-24 truncate rounded border border-zinc-300 bg-white px-1.5 py-1 text-[10px] outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                      aria-label="Assign to day"
                    >
                      <option value="">Day…</option>
                      {board.days.map((day) => (
                        <option key={day.id} value={day.id}>
                          Day {day.dayNumber}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!assignTarget[place.id]}
                      onClick={() =>
                        handleAssign(place.id, assignTarget[place.id])
                      }
                      className="rounded bg-blue-600 px-1.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Assign
                    </button>
                  </div>
                )
              }
            />
          );
        })}

        {filteredPlaces.length === 0 && searchQuery.trim() && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
            No places match &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
