"use client";

// ------------------------------------------------------------------
// Activity card — place name, type indicator, drag handle, up/down controls
// Pointer-based drag via native pointer events
// Keyboard accessible via up/down arrow buttons
// ------------------------------------------------------------------

import { useCallback, useEffect, useRef } from "react";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Coffee,
  TreePine,
  UtensilsCrossed,
  BookOpen,
  Sun,
} from "lucide-react";
import type { Place, PlaceType } from "@/lib/trip-types";
import type { TripDay } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Type-to-style mapping (subtle icon colors)
// ------------------------------------------------------------------

interface TypeStyle {
  icon: typeof Coffee;
  color: string;
  label: string;
}

const TYPE_STYLES: Record<PlaceType, TypeStyle> = {
  cafe: { icon: Coffee, color: "#C47A3D", label: "Coffee" },
  nature: { icon: TreePine, color: "#2E6F40", label: "Nature" },
  food: { icon: UtensilsCrossed, color: "#B87C5D", label: "Food" },
  shopping: { icon: BookOpen, color: "#667066", label: "Shop" },
  attraction: { icon: Sun, color: "#2E6F40", label: "Attraction" },
  // fallback styles for types not expected in the Portland mock
  hotel: { icon: Sun, color: "#667066", label: "Hotel" },
  area: { icon: Sun, color: "#667066", label: "Area" },
  ticket: { icon: Sun, color: "#667066", label: "Ticket" },
  custom: { icon: Sun, color: "#667066", label: "Custom" },
};

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

export interface ItineraryCardProps {
  place: Place;
  days?: TripDay[];
  currentDayId?: string;
  /** Index within the current section (not day-plan-wide) */
  sectionIndex: number;
  /** Total cards in this section */
  sectionLength: number;
  /** Whether the card is currently being dragged */
  isDragging: boolean;
  /** Pixel offset while this card is following the pointer. */
  dragOffsetY?: number;
  /** Called when the user starts dragging this card */
  onDragStart: (sectionIndex: number, pointerY: number) => void;
  /** Called when the pointer moves while dragging */
  onDragMove: (pointerY: number) => void;
  /** Called when the drag ends */
  onDragEnd: () => void;
  /** Called when the up arrow is triggered */
  onMoveUp: (sectionIndex: number) => void;
  /** Called when the down arrow is triggered */
  onMoveDown: (sectionIndex: number) => void;
  /** Called when the place is moved to another day. */
  onMoveToDay?: (placeId: string, nextDayId: string) => void;
  /** Called when the place is removed from the current day. */
  onRemoveFromDay?: (placeId: string) => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ItineraryCard({
  place,
  days = [],
  currentDayId,
  sectionIndex,
  sectionLength,
  isDragging,
  dragOffsetY = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  onRemoveFromDay,
}: ItineraryCardProps) {
  const typeStyle = TYPE_STYLES[place.type] ?? TYPE_STYLES.custom;
  const IconComponent = typeStyle.icon;

  const handleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      // Only primary button
      if (e.button !== 0) return;
      e.preventDefault();
      const btn = handleRef.current;
      if (btn) {
        btn.setPointerCapture(e.pointerId);
      }
      onDragStart(sectionIndex, e.clientY);
    },
    [sectionIndex, onDragStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      onDragMove(e.clientY);
    },
    [isDragging, onDragMove],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      const btn = handleRef.current;
      if (btn) {
        btn.releasePointerCapture(e.pointerId);
      }
      onDragEnd();
    },
    [isDragging, onDragEnd],
  );

  return (
    <div
      className={`
        flex items-center gap-3 rounded-xl border bg-[#FFFDFC] px-3 py-3
        motion-reduce:transition-none
        ${isDragging ? "relative z-10 border-[#2E6F40] shadow-lg" : "border-[#DED6CC] transition-[border-color,box-shadow]"}
      `}
      style={
        isDragging
          ? { transform: `translate3d(0, ${dragOffsetY}px, 0) scale(1.01)` }
          : undefined
      }
      aria-dropeffect={isDragging ? "move" : undefined}
    >
      {/* Drag handle */}
      <button
        ref={handleRef}
        type="button"
        role="button"
        aria-label={`Drag to reorder ${place.name}`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`
          flex shrink-0 cursor-grab touch-none select-none items-center justify-center rounded p-1
          text-[#B6AA9F] transition-colors
          hover:bg-[#F7F4EF] hover:text-[#667066]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest
          active:cursor-grabbing
          ${isDragging ? "cursor-grabbing bg-[#E7F1E8] text-[#2E6F40]" : ""}
        `}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Type icon */}
      <div
        className="flex shrink-0 items-center justify-center rounded-full p-1.5"
        style={{ backgroundColor: `${typeStyle.color}1A` }} // 10% opacity
        aria-hidden="true"
      >
        <IconComponent
          className="h-4 w-4"
          style={{ color: typeStyle.color }}
        />
      </div>

      {/* Place info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-[#1F2A22]">
          {place.name}
        </span>
        <span className="truncate text-xs text-[#667066]">
          {typeStyle.label}
          {place.area ? ` · ${place.area}` : ""}
        </span>
      </div>

      {days.length > 1 && currentDayId && onMoveToDay && (
        <select
          aria-label={`Move ${place.name} to another day`}
          value={currentDayId}
          onChange={(event) => onMoveToDay(place.id, event.target.value)}
          className="hidden h-8 shrink-0 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-2 text-xs font-medium text-[#1F2A22] outline-none transition-colors hover:border-[#BFCDBF] focus-visible:border-[#2E6F40] focus-visible:ring-2 focus-visible:ring-[#E7F1E8] sm:block"
        >
          {days.map((day) => (
            <option key={day.id} value={day.id}>
              Day {day.dayNumber}
            </option>
          ))}
        </select>
      )}

      {/* Up / Down controls */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          aria-label={`Move ${place.name} up`}
          disabled={sectionIndex === 0}
          onClick={() => onMoveUp(sectionIndex)}
          className="flex items-center justify-center rounded p-1 text-[#B6AA9F] transition-colors hover:bg-[#F7F4EF] hover:text-[#2E6F40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Move ${place.name} down`}
          disabled={sectionIndex === sectionLength - 1}
          onClick={() => onMoveDown(sectionIndex)}
          className="flex items-center justify-center rounded p-1 text-[#B6AA9F] transition-colors hover:bg-[#F7F4EF] hover:text-[#2E6F40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {onRemoveFromDay && (
        <button
          type="button"
          aria-label={`Remove ${place.name} from this day`}
          onClick={() => onRemoveFromDay(place.id)}
          className="flex shrink-0 items-center justify-center rounded p-1 text-[#B6AA9F] transition-colors hover:bg-[#F7F4EF] hover:text-[#1F2A22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
