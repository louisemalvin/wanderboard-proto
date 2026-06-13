"use client";

// ------------------------------------------------------------------
// SuggestionCard — displays an AI proposal with Apply / Dismiss
// ------------------------------------------------------------------

import { Sparkles, Check, X } from "lucide-react";
import type { Place } from "@/lib/trip-types";

// ------------------------------------------------------------------
// Shared types (mirrors POST /api/ai/chat response)
// ------------------------------------------------------------------

export interface ChatMutation {
  addPlaces?: Place[];
  assign?: Array<{ placeId: string; dayId: string }>;
  unassign?: Array<{ placeId: string; dayId: string }>;
  editPlaces?: Array<{ placeId: string; updates: Record<string, unknown> }>;
}

export interface ChatSuggestion {
  explanation: string;
  mutations: ChatMutation;
}

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

export interface SuggestionCardProps {
  suggestion: ChatSuggestion;
  onApply: () => void;
  onDismiss: () => void;
  isApplying?: boolean;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
  isApplying = false,
}: SuggestionCardProps) {
  const mutationCount =
    (suggestion.mutations.addPlaces?.length ?? 0) +
    (suggestion.mutations.assign?.length ?? 0) +
    (suggestion.mutations.unassign?.length ?? 0) +
    (suggestion.mutations.editPlaces?.length ?? 0);

  return (
    <div className="w-72 animate-in slide-in-from-bottom-2 rounded-xl border border-[#DED6CC] bg-[#FFFDFC] p-4 shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#2E6F40]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#2E6F40]">
          AI Suggestion
        </span>
      </div>

      {/* Explanation */}
      <p className="mb-3 text-sm leading-relaxed text-[#1F2A22]">
        {suggestion.explanation}
      </p>

      {/* Mutation summary */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {suggestion.mutations.addPlaces &&
          suggestion.mutations.addPlaces.length > 0 && (
            <span className="inline-block rounded-full bg-[#E7F1E8] px-2 py-0.5 text-[10px] font-medium text-[#2E6F40]">
              +{suggestion.mutations.addPlaces.length} new place
              {suggestion.mutations.addPlaces.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.assign &&
          suggestion.mutations.assign.length > 0 && (
            <span className="inline-block rounded-full bg-[#E7F1E8] px-2 py-0.5 text-[10px] font-medium text-[#2E6F40]">
              {suggestion.mutations.assign.length} assign
              {suggestion.mutations.assign.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.unassign &&
          suggestion.mutations.unassign.length > 0 && (
            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              {suggestion.mutations.unassign.length} unassign
              {suggestion.mutations.unassign.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.editPlaces &&
          suggestion.mutations.editPlaces.length > 0 && (
            <span className="inline-block rounded-full bg-[#F0DAD5] px-2 py-0.5 text-[10px] font-medium text-[#6F493B]">
              {suggestion.mutations.editPlaces.length} edit
              {suggestion.mutations.editPlaces.length !== 1 ? "s" : ""}
            </span>
          )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#2E6F40] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#245A34] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Applying…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Apply ({mutationCount})
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isApplying}
          className="flex items-center justify-center gap-1 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-3 py-2 text-xs font-medium text-[#667066] transition-colors hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
