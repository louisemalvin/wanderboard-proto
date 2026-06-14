"use client";

import type { ItineraryProposal } from "@/lib/ai/mori-schemas";
import { AlertTriangle, Check, X, ChevronDown, ChevronUp, MoveRight, Trash2, Plus } from "lucide-react";
import { useState } from "react";

const confidenceColors: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-stone-100 text-stone-500 border-stone-200",
};

const operationLabels: Record<string, string> = {
  reorder_places: "Reorder",
  assign_place: "Add to day",
  unassign_place: "Remove from day",
  move_place: "Move to another day",
  add_suggested_place: "Add suggested place",
  update_day_summary: "Update day description",
  update_time_estimate: "Update time estimate",
};

interface ItineraryProposalCardProps {
  proposal: ItineraryProposal;
  dayLabel?: string;
  onApply?: (proposal: ItineraryProposal) => void;
  onDismiss?: (proposal: ItineraryProposal) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function ItineraryProposalCard({
  proposal,
  dayLabel,
  onApply,
  onDismiss,
  isLoading,
  error,
}: ItineraryProposalCardProps) {
  const [expandedOps, setExpandedOps] = useState(false);

  const confidence = confidenceColors[proposal.confidence] ?? confidenceColors.medium;

  return (
    <div className="rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[color:var(--wb-ink)]">
              {proposal.title}
            </h4>
            <span
              className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${confidence}`}
            >
              {proposal.confidence} confidence
            </span>
          </div>
          {dayLabel && (
            <p className="mt-0.5 text-xs text-[color:var(--wb-muted)]">{dayLabel}</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--wb-muted)]">
        {proposal.summary}
      </p>

      {/* Operations summary */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setExpandedOps(!expandedOps)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--wb-forest)] hover:underline"
        >
          {proposal.operations.length} change{proposal.operations.length !== 1 ? "s" : ""} proposed
          {expandedOps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {expandedOps && (
          <div className="mt-2 space-y-1.5">
            {proposal.operations.map((op, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-[color:var(--wb-bg)] px-2.5 py-1.5 text-xs"
              >
                <span className="shrink-0 text-[color:var(--wb-muted)]">
                  {op.type === "reorder_places" && <MoveRight className="h-3 w-3" />}
                  {op.type === "unassign_place" && <Trash2 className="h-3 w-3" />}
                  {op.type === "add_suggested_place" && <Plus className="h-3 w-3" />}
                  {op.type === "assign_place" && <Plus className="h-3 w-3" />}
                  {op.type === "move_place" && <MoveRight className="h-3 w-3" />}
                  {(op.type === "update_day_summary" || op.type === "update_time_estimate") && (
                    <Check className="h-3 w-3" />
                  )}
                </span>
                <span className="font-medium text-[color:var(--wb-ink)]">
                  {operationLabels[op.type] ?? op.type}
                </span>
                {"placeId" in op && (
                  <span className="text-[color:var(--wb-muted)] truncate">
                    Place: {op.placeId as string}
                  </span>
                )}
                {"orderedPlaceIds" in op && op.orderedPlaceIds && (
                  <span className="text-[color:var(--wb-muted)] truncate">
                    {op.orderedPlaceIds.length} places
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rationale */}
      {proposal.rationale.length > 0 && (
        <div className="mt-2 space-y-0.5">
          <p className="text-xs font-medium text-[color:var(--wb-ink)]">Why</p>
          <ul className="space-y-0.5">
            {proposal.rationale.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-[color:var(--wb-muted)]">
                <span className="mt-0.5 shrink-0">&bull;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {proposal.warnings.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          {proposal.warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {onApply && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onApply(proposal)}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[color:var(--wb-forest)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {isLoading ? "Applying..." : "Apply changes"}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onDismiss(proposal)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[color:var(--wb-border)] bg-transparent px-3 text-xs font-medium text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
