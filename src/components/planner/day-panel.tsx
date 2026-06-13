"use client";

// ------------------------------------------------------------------
// Day tab — assigned places list with reorder + unassign
// ------------------------------------------------------------------

import { ArrowUp, ArrowDown, X } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";
import { PlaceCard } from "@/components/planner/place-card";

export function DayPanel() {
  const board = useTripStore((s) => s.board);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const activeTab = useTripStore((s) => s.activeTab);
  const previewPlace = useTripStore((s) => s.previewPlace);
  const previewPlaceId = useTripStore((s) => s.previewPlaceId);
  const reorderPlaces = useTripStore((s) => s.reorderPlaces);
  const unassignPlaceFromDay = useTripStore((s) => s.unassignPlaceFromDay);

  if (!board || !currentTripId) return null;
  if (!activeTab.startsWith("day:")) return null;

  // ------------------------------------------------------------------
  // Extract day id from active tab
  // ------------------------------------------------------------------

  const dayId = activeTab.slice("day:".length);
  const day = board.days.find((d) => d.id === dayId);
  const dayPlan = board.dayPlans.find((p) => p.dayId === dayId);

  if (!day) return null;

  const assignedPlaceIds = dayPlan?.assignedPlaceIds ?? [];
  const assignedPlaces = assignedPlaceIds
    .map((id) => board.savedPlaces[id])
    .filter(Boolean);

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  function handleReorder(index: number, direction: "up" | "down") {
    if (!currentTripId) return;
    const toIndex = direction === "up" ? index - 1 : index + 1;
    if (toIndex < 0 || toIndex >= assignedPlaceIds.length) return;
    reorderPlaces(currentTripId, dayId, index, toIndex);
  }

  function handleUnassign(placeId: string) {
    if (!currentTripId) return;
    unassignPlaceFromDay(currentTripId, dayId, placeId);
  }

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------

  if (assignedPlaces.length === 0) {
    return (
      <div className="p-4">
        <h3 className="mb-1 text-sm font-semibold text-[#1F2A22]">
          {day.title || `Day ${day.dayNumber}`}
        </h3>
        <p className="text-xs text-[#667066]">
          {day.summary}
        </p>
        <p className="mt-6 text-center text-sm text-[#667066]">
          No places assigned to this day yet. Switch to Places to find and
          assign destinations.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Day header */}
      <div>
        <h3 className="text-sm font-semibold text-[#1F2A22]">
          {day.title || `Day ${day.dayNumber}`}
        </h3>
        {day.summary && (
          <p className="text-xs text-[#667066]">
            {day.summary}
          </p>
        )}
        <p className="mt-1 text-[10px] text-[#667066]/80">
          {assignedPlaces.length}{" "}
          {assignedPlaces.length === 1 ? "place" : "places"} assigned
        </p>
      </div>

      {/* Place cards */}
      <div className="flex flex-col gap-2">
        {assignedPlaces.map((place, index) => (
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
              <div className="flex items-center gap-1">
                {/* Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleReorder(index, "up")}
                  className="rounded p-1 text-[#667066] transition-colors hover:bg-[#E7F1E8] hover:text-[#2E6F40] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>

                {/* Down */}
                <button
                  type="button"
                  disabled={index === assignedPlaces.length - 1}
                  onClick={() => handleReorder(index, "down")}
                  className="rounded p-1 text-[#667066] transition-colors hover:bg-[#E7F1E8] hover:text-[#2E6F40] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>

                {/* Unassign */}
                <button
                  type="button"
                  onClick={() => handleUnassign(place.id)}
                  className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                  aria-label="Unassign place"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
