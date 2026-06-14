"use client";

import type { PlaceSuggestion } from "@/lib/ai/mori-schemas";
import { MapPin, Clock, Tag, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const categoryLabels: Record<string, string> = {
  attraction: "Attraction",
  food: "Food & Drink",
  nature: "Nature",
  culture: "Culture",
  shopping: "Shopping",
  activity: "Activity",
  accommodation: "Accommodation",
  transport: "Transport",
  custom: "Custom",
};

const confidenceLabels: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified location", className: "text-emerald-700 bg-emerald-50" },
  approximate: { label: "Approximate location", className: "text-amber-700 bg-amber-50" },
  missing: { label: "No coordinates", className: "text-stone-500 bg-stone-100" },
};

interface PlaceSuggestionCardProps {
  suggestion: PlaceSuggestion;
  onPreviewOnMap?: (suggestion: PlaceSuggestion) => void;
  onSave?: (suggestion: PlaceSuggestion) => void;
  onDismiss?: (suggestion: PlaceSuggestion) => void;
  onAssignToDay?: (suggestion: PlaceSuggestion, dayId: string) => void;
  dayOptions?: Array<{ id: string; label: string }>;
}

export default function PlaceSuggestionCard({
  suggestion,
  onPreviewOnMap,
  onSave,
  onDismiss,
  onAssignToDay,
  dayOptions,
}: PlaceSuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [assignDayId, setAssignDayId] = useState(dayOptions?.[0]?.id ?? "");

  const confidence = confidenceLabels[suggestion.coordinateConfidence] ?? confidenceLabels.missing;
  const canPreviewMap =
    (suggestion.latitude != null && suggestion.longitude != null) ||
    suggestion.coordinateConfidence === "approximate";

  return (
    <div className="rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--wb-sage-light)] text-[color:var(--wb-moss)]">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-[color:var(--wb-ink)]">
              {suggestion.name}
            </h4>
            <span className="shrink-0 rounded-full bg-[color:var(--wb-sage-light)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--wb-muted)]">
              {categoryLabels[suggestion.category] ?? suggestion.category}
            </span>
          </div>

          {suggestion.estimatedDurationMinutes && (
            <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--wb-muted)]">
              <Clock className="h-3 w-3" />
              <span>Around {suggestion.estimatedDurationMinutes} minutes</span>
            </div>
          )}

          <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--wb-muted)]">
            {suggestion.description}
          </p>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--wb-forest)] hover:underline"
          >
            {expanded ? "Less detail" : "More detail"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5 rounded-lg bg-[color:var(--wb-bg)] p-2.5">
              <p className="text-xs text-[color:var(--wb-muted)]">
                <span className="font-medium text-[color:var(--wb-ink)]">Why it fits:</span>{" "}
                {suggestion.reason}
              </p>
              {suggestion.neighbourhood && (
                <p className="text-xs text-[color:var(--wb-muted)]">
                  <span className="font-medium text-[color:var(--wb-ink)]">Area:</span>{" "}
                  {suggestion.neighbourhood}
                  {suggestion.destination ? `, ${suggestion.destination}` : ""}
                </p>
              )}
              {suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-0.5 rounded-md bg-[color:var(--wb-sage-light)] px-1.5 py-0.5 text-[10px] text-[color:var(--wb-muted)]"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {suggestion.estimatedCost && (
                <p className="text-xs text-[color:var(--wb-muted)]">
                  <span className="font-medium text-[color:var(--wb-ink)]">Estimated cost:</span>{" "}
                  {suggestion.estimatedCost.currency
                    ? `${suggestion.estimatedCost.currency} `
                    : ""}
                  {suggestion.estimatedCost.min != null && suggestion.estimatedCost.max != null
                    ? `${suggestion.estimatedCost.min}–${suggestion.estimatedCost.max}`
                    : suggestion.estimatedCost.min != null
                      ? `from ${suggestion.estimatedCost.min}`
                      : suggestion.estimatedCost.max != null
                        ? `up to ${suggestion.estimatedCost.max}`
                        : ""}
                </p>
              )}
              {suggestion.warnings.length > 0 && (
                <div className="mt-1 space-y-1">
                  {suggestion.warnings.map((w, i) => (
                    <p
                      key={i}
                      className="flex items-start gap-1 text-xs text-amber-700"
                    >
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Coordinate confidence badge */}
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${confidence.className}`}
        >
          <MapPin className="h-2.5 w-2.5" />
          {confidence.label}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {canPreviewMap && onPreviewOnMap && (
          <button
            type="button"
            onClick={() => onPreviewOnMap(suggestion)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-2.5 text-xs font-medium text-[color:var(--wb-ink)] transition-colors hover:bg-[color:var(--wb-bg)]"
          >
            <MapPin className="h-3 w-3" />
            Preview on map
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(suggestion)}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[color:var(--wb-forest)] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)]"
          >
            Save place
          </button>
        )}
        {dayOptions && dayOptions.length > 0 && onAssignToDay && (
          <div className="flex items-center gap-1">
            <select
              aria-label="Assign to day"
              value={assignDayId}
              onChange={(e) => setAssignDayId(e.target.value)}
              className="h-8 rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-2 text-xs text-[color:var(--wb-ink)]"
            >
              {dayOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onAssignToDay(suggestion, assignDayId)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[color:var(--wb-forest)] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--wb-forest-hover)]"
            >
              Assign
            </button>
          </div>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(suggestion)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[color:var(--wb-border)] bg-transparent px-2.5 text-xs font-medium text-[color:var(--wb-muted)] transition-colors hover:bg-black/5"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
