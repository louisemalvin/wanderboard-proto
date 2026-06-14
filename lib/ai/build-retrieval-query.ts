// ------------------------------------------------------------------
// Query Builder — constructs a focused retrieval query from board context.
// Deterministic, typed, server-side only.
// ------------------------------------------------------------------

import type { TripBoard } from "@/lib/trip-types";

export type QueryContext = {
  userInstruction: string;
  board: TripBoard;
  selectedDayId?: string;
};

/**
 * Build a deterministic retrieval query from the user's instruction
 * and the current TripBoard context.
 *
 * Only sends structural board data — never personal notes, raw localStorage
 * state, or unvalidated fields.
 */
export function buildRetrievalQuery(ctx: QueryContext): string {
  const parts: string[] = [];

  // Destination
  if (ctx.board.destinationText) {
    parts.push(`Destination: ${ctx.board.destinationText}`);
  }

  // Selected day context
  if (ctx.selectedDayId) {
    const day = ctx.board.days.find((d) => d.id === ctx.selectedDayId);
    if (day) {
      parts.push(`Day ${day.dayNumber}: ${day.title}`);

      // Places assigned to this day
      const plan = ctx.board.dayPlans.find((p) => p.dayId === ctx.selectedDayId);
      if (plan) {
        const placeNames = plan.assignedPlaceIds
          .map((pid) => ctx.board.savedPlaces[pid]?.name)
          .filter(Boolean);
        if (placeNames.length > 0) {
          parts.push(`Places on this day: ${placeNames.join(", ")}`);
        }
      }
    }
  }

  // Pace
  parts.push(`Current pace: ${ctx.board.pace}`);

  // Duration
  if (ctx.board.durationDays) {
    parts.push(`Trip duration: ${ctx.board.durationDays} days`);
  }

  // Interests
  if (ctx.board.interests.length > 0) {
    parts.push(`Interests: ${ctx.board.interests.join(", ")}`);
  }

  // Warnings (structural only, not personal notes)
  if (ctx.board.warnings.length > 0) {
    parts.push(`Noted warnings: ${ctx.board.warnings.join("; ")}`);
  }

  // User instruction — the actual planning request
  parts.push(`Planning request: ${ctx.userInstruction}`);

  // Hint to narrow retrieval
  parts.push(
    "Need: neighbourhood compatibility, visit duration, pacing, and practical transport considerations.",
  );

  return parts.join("\n");
}
