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
    <div className="w-72 animate-in slide-in-from-bottom-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          AI Suggestion
        </span>
      </div>

      {/* Explanation */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {suggestion.explanation}
      </p>

      {/* Mutation summary */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {suggestion.mutations.addPlaces &&
          suggestion.mutations.addPlaces.length > 0 && (
            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              +{suggestion.mutations.addPlaces.length} new place
              {suggestion.mutations.addPlaces.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.assign &&
          suggestion.mutations.assign.length > 0 && (
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {suggestion.mutations.assign.length} assign
              {suggestion.mutations.assign.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.unassign &&
          suggestion.mutations.unassign.length > 0 && (
            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {suggestion.mutations.unassign.length} unassign
              {suggestion.mutations.unassign.length !== 1 ? "s" : ""}
            </span>
          )}
        {suggestion.mutations.editPlaces &&
          suggestion.mutations.editPlaces.length > 0 && (
            <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
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
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="flex items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <X className="h-3.5 w-3.5" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
