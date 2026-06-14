"use client";

// ------------------------------------------------------------------
// Itinerary section — time-of-day wrapper with editorial serif label
// Contains activity cards and an add-activity placeholder
// Uses places prop directly; drag reorder is handled via prop indices.
// Ref arrays are mutated only in callbacks (never in render body).
// ------------------------------------------------------------------

import { useState, useCallback, useRef } from "react";
import type { Place, TripDay } from "@/lib/trip-types";
import ItineraryCard from "./itinerary-card";
import AddActivityCard from "./add-activity-card";

// ------------------------------------------------------------------
// Section definition
// ------------------------------------------------------------------

export interface SectionInfo {
  id: string;
  label: string;
}

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

export interface ItinerarySectionProps {
  section: SectionInfo;
  places: Place[];
  days?: TripDay[];
  currentDayId?: string;
  /** Called when the user reorders places within this section. */
  onReorder: (fromIndex: number, toIndex: number) => void;
  onMoveToDay?: (placeId: string, nextDayId: string) => void;
  onRemoveFromDay?: (placeId: string) => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ItinerarySection({
  section,
  places,
  days,
  currentDayId,
  onReorder,
  onMoveToDay,
  onRemoveFromDay,
}: ItinerarySectionProps) {
  // Per-card element refs for hit-testing during drag.
  // Refs are only accessed inside pointer event callbacks, never during render.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track the currently dragged card and nearest drop slot.
  const dragStartIndex = useRef<number | null>(null);
  const dragTargetIndex = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const displayedPlaces = places;

  // -- Drag handlers --
  const handleDragStart = useCallback(
    (sectionIndex: number, pointerY: number) => {
      if (sectionIndex < 0 || sectionIndex >= displayedPlaces.length) return;

      dragStartIndex.current = sectionIndex;
      dragTargetIndex.current = sectionIndex;
      dragStartY.current = pointerY;
      setDraggingIndex(sectionIndex);
      setDragOffsetY(0);
    },
    [displayedPlaces.length],
  );

  const handleDragMove = useCallback(
    (pointerY: number) => {
      const startY = dragStartY.current;
      if (startY === null) return;

      setDragOffsetY(pointerY - startY);

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;

      // Find the visual slot the pointer is nearest (hit-test card midpoints)
      let targetIndex = cards.length - 1;
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (pointerY < midY) {
          targetIndex = i;
          break;
        }
      }

      dragTargetIndex.current = targetIndex;
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    const fromIndex = dragStartIndex.current;
    const toIndex = dragTargetIndex.current;

    dragStartIndex.current = null;
    dragTargetIndex.current = null;
    dragStartY.current = null;
    setDraggingIndex(null);
    setDragOffsetY(0);

    if (
      fromIndex !== null &&
      toIndex !== null &&
      fromIndex !== toIndex
    ) {
      onReorder(fromIndex, toIndex);
    }
  }, [onReorder]);

  // -- Keyboard reorder --
  const handleMoveUp = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex <= 0) return;
      onReorder(sectionIndex, sectionIndex - 1);
    },
    [onReorder],
  );

  const handleMoveDown = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex >= displayedPlaces.length - 1) return;
      onReorder(sectionIndex, sectionIndex + 1);
    },
    [displayedPlaces.length, onReorder],
  );

  // -- Set card refs (called by React during commit, not render) --
  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    [],
  );

  if (displayedPlaces.length === 0) return null;

  return (
    <section aria-labelledby={`section-${section.id}-label`}>
      {/* Section rail label */}
      <h2
        id={`section-${section.id}-label`}
        className="mb-3 text-base font-semibold tracking-tight text-[#1F2A22]"
      >
        {section.label}
      </h2>

      {/* Cards */}
      <div className="flex flex-col gap-3" role="list">
        {displayedPlaces.map((place, index) => (
          <div key={place.id} ref={setCardRef(index)} role="listitem">
              <ItineraryCard
                place={place}
                days={days}
                currentDayId={currentDayId}
                sectionIndex={index}
              sectionLength={displayedPlaces.length}
              isDragging={draggingIndex === index}
              dragOffsetY={draggingIndex === index ? dragOffsetY : 0}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onMoveToDay={onMoveToDay}
                onRemoveFromDay={onRemoveFromDay}
              />
          </div>
        ))}

        {/* Add activity placeholder */}
        <AddActivityCard />
      </div>
    </section>
  );
}
