"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Send, Loader2, X } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";
import { useMoriProposalStore } from "@/stores/mori-proposal-store";
import type { MoriSurface } from "@/lib/ai/prompts";
import type {
  MoriApiResponse,
  PlaceSuggestion,
  ItineraryProposal,
  GuideAction,
} from "@/lib/ai/mori-schemas";
import MoriMessage from "@/components/mori/MoriMessage";
import MoriGroundingBadge from "@/components/mori/MoriGroundingBadge";
import MoriWarning from "@/components/mori/MoriWarning";
import MoriFollowUpChips from "@/components/mori/MoriFollowUpChips";
import PlaceSuggestionCard from "@/components/mori/PlaceSuggestionCard";
import ItineraryProposalCard from "@/components/mori/ItineraryProposalCard";
import GuideActionCard from "@/components/mori/GuideActionCard";

const loadingLabels: Record<MoriSurface, string> = {
  plan_discover: "Looking for places that fit your trip...",
  day_itinerary: "Checking how this day fits together...",
  guide: "Let me look at what still works nearby...",
};

const placeholderLabels: Record<MoriSurface, string> = {
  plan_discover: "Ask Mori to suggest places...",
  day_itinerary: "Ask Mori about this itinerary...",
  guide: "Ask Mori about your day...",
};

interface MoriComposerProps {
  surface: MoriSurface;
  placeholder?: string;
  /** Called when the user wants to preview a place on the map */
  onPreviewPlaceOnMap?: (suggestion: PlaceSuggestion) => void;
  /** Called when the user wants to save a place suggestion */
  onSavePlace?: (suggestion: PlaceSuggestion) => void;
  /** Called when the user wants to assign a place to a day */
  onAssignPlaceToDay?: (suggestion: PlaceSuggestion, dayId: string) => void;
  /** Called when the user wants to dismiss a place suggestion */
  onDismissPlace?: (suggestion: PlaceSuggestion) => void;
  /** Called when the user wants to apply an itinerary proposal */
  onApplyProposal?: (proposal: ItineraryProposal) => void;
  /** Called when the user wants to dismiss an itinerary proposal */
  onDismissProposal?: (proposal: ItineraryProposal) => void;
  /** Called when the user wants to trigger a guide action */
  onGuideAction?: (action: GuideAction) => void;
  /** Called when the user selects a follow-up suggestion */
  onFollowUpSelect?: (suggestion: string) => void;
  /** Day options for assign-to-day dropdown */
  dayOptions?: Array<{ id: string; label: string }>;
  /** Label for current day (shown on itinerary proposals) */
  currentDayLabel?: string;
}

type FeedbackState = {
  message: string;
  grounding: MoriApiResponse["grounding"];
  warnings: MoriApiResponse["warnings"];
  followUpSuggestions: string[];
};

export default function MoriComposer({
  surface,
  placeholder,
  onPreviewPlaceOnMap,
  onSavePlace,
  onAssignPlaceToDay,
  onDismissPlace,
  onApplyProposal,
  onDismissProposal,
  onGuideAction,
  onFollowUpSelect,
  dayOptions,
  currentDayLabel,
}: MoriComposerProps) {
  const board = useTripStore((s) => s.board);
  const setMoriResponse = useMoriProposalStore((s) => s.setMoriResponse);
  const placeSuggestions = useMoriProposalStore((s) => s.placeSuggestions);
  const itineraryProposals = useMoriProposalStore((s) => s.itineraryProposals);
  const guideActions = useMoriProposalStore((s) => s.guideActions);
  const clearProposals = useMoriProposalStore((s) => s.clearProposals);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const dismissFeedback = useCallback(() => {
    setFeedback(null);
    clearProposals();
    setApplyError(null);
  }, [clearProposals]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setMessage("");
    setError(null);
    setFeedback(null);
    clearProposals();
    setApplyError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          board,
          surface,
        }),
      });

      const payload = (await response.json()) as MoriApiResponse & {
        error?: { code?: string; message?: string };
      };

      if (!response.ok) {
        const errorCode = payload?.error?.code;
        const msg =
          payload?.error?.message ??
          "Mori could not respond. Please try again.";
        if (payload?.error?.code === "not_configured") {
          throw new Error(
            "Azure OpenAI is not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT to .env.local.",
          );
        }
        if (errorCode === "rate_limited") {
          throw new Error(
            "Mori is busy right now. Please wait a moment and try again.",
          );
        }
        throw new Error(msg);
      }

      // Store structured proposals
      setMoriResponse({
        surface,
        placeSuggestions: payload.placeSuggestions,
        itineraryProposals: payload.itineraryProposals,
        guideActions: payload.guideActions,
      });

      setFeedback({
        message: payload.message,
        grounding: payload.grounding,
        warnings: payload.warnings,
        followUpSuggestions: payload.followUpSuggestions,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleDismissPlace = useCallback(
    (suggestion: PlaceSuggestion) => {
      useMoriProposalStore.getState().removePlaceSuggestion(suggestion.clientId);
      onDismissPlace?.(suggestion);
    },
    [onDismissPlace],
  );

  const handleSavePlace = useCallback(
    (suggestion: PlaceSuggestion) => {
      useMoriProposalStore.getState().savePlaceSuggestion(suggestion.clientId);
      onSavePlace?.(suggestion);
    },
    [onSavePlace],
  );

  const handleApplyProposal = useCallback(
    async (proposal: ItineraryProposal) => {
      setApplyLoading(proposal.proposalId);
      setApplyError(null);
      try {
        await onApplyProposal?.(proposal);
        useMoriProposalStore.getState().markProposalApplied(
          proposal.proposalId,
          "applied",
        );
      } catch (e) {
        setApplyError(
          e instanceof Error
            ? e.message
            : "Could not apply changes. Please try again.",
        );
      } finally {
        setApplyLoading(null);
      }
    },
    [onApplyProposal],
  );

  const handleDismissProposal = useCallback(
    (proposal: ItineraryProposal) => {
      useMoriProposalStore.getState().removeItineraryProposal(
        proposal.proposalId,
      );
      onDismissProposal?.(proposal);
    },
    [onDismissProposal],
  );

  return (
    <div className="pointer-events-auto flex flex-col items-center">
      {/* Feedback bubble */}
      {feedback && (
        <div className="mb-2 w-full max-w-[640px] space-y-3">
          {/* Dismiss button row */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={dismissFeedback}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--wb-ink)]"
              aria-label="Dismiss reply"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mori message */}
          <MoriMessage message={feedback.message} />

          {/* Warnings */}
          {feedback.warnings.length > 0 && (
            <div className="space-y-1">
              {feedback.warnings.map((w, i) => (
                <MoriWarning key={i} warning={w} />
              ))}
            </div>
          )}

          {/* Place suggestions */}
          {placeSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[color:var(--wb-muted)]">
                Suggested places
              </p>
              {placeSuggestions.map((suggestion) => (
                <PlaceSuggestionCard
                  key={suggestion.clientId}
                  suggestion={suggestion}
                  onPreviewOnMap={onPreviewPlaceOnMap}
                  onSave={handleSavePlace}
                  onAssignToDay={onAssignPlaceToDay}
                  onDismiss={handleDismissPlace}
                  dayOptions={dayOptions}
                />
              ))}
            </div>
          )}

          {/* Itinerary proposals */}
          {itineraryProposals.length > 0 && (
            <div className="space-y-3">
              {itineraryProposals.map((proposal) => (
                <ItineraryProposalCard
                  key={proposal.proposalId}
                  proposal={proposal}
                  dayLabel={currentDayLabel}
                  onApply={onApplyProposal ? handleApplyProposal : undefined}
                  onDismiss={onDismissProposal ? handleDismissProposal : undefined}
                  isLoading={applyLoading === proposal.proposalId}
                  error={
                    applyError && applyLoading === proposal.proposalId
                      ? applyError
                      : null
                  }
                />
              ))}
            </div>
          )}

          {/* Guide actions */}
          {guideActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {guideActions.map((action, i) => (
                <GuideActionCard
                  key={i}
                  action={action}
                  onNavigate={() => onGuideAction?.(action)}
                  onShowOnMap={() => onGuideAction?.(action)}
                  onSkip={() => onGuideAction?.(action)}
                  onMoveToLater={() => onGuideAction?.(action)}
                  onOpenDayPlan={() => onGuideAction?.(action)}
                  onPreviewAdjustment={(a) => onGuideAction?.(a)}
                />
              ))}
            </div>
          )}

          {/* Grounding badge */}
          {feedback.grounding && (
            <MoriGroundingBadge
              status={feedback.grounding.status}
              sources={feedback.grounding.sources}
            />
          )}

          {/* Follow-up chips */}
          {feedback.followUpSuggestions.length > 0 && onFollowUpSelect && (
            <MoriFollowUpChips
              suggestions={feedback.followUpSuggestions}
              onSelect={(s) => {
                setMessage(s);
                onFollowUpSelect(s);
              }}
            />
          )}
        </div>
      )}

      {/* Error bubble */}
      {error && (
        <div className="relative mb-2 w-full max-w-[640px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5">
          <button
            type="button"
            onClick={() => setError(null)}
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--wb-ink)]"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="pr-5 text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2 rounded-2xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-3 py-2.5"
        style={{
          boxShadow:
            "0 1px 2px rgba(31, 42, 34, 0.04), 0 8px 24px rgba(31, 42, 34, 0.06)",
        }}
      >
        <Image
          src="/mori.png"
          alt="Mori"
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 rounded-full"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError(null);
          }}
          placeholder={
            isLoading
              ? loadingLabels[surface]
              : (placeholder ?? placeholderLabels[surface])
          }
          disabled={isLoading}
          className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--wb-ink)] placeholder:text-[color:var(--wb-muted)] focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={!message.trim() || isLoading}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--wb-forest)] text-white transition-colors hover:bg-[color:var(--wb-forest-hover)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: "var(--wb-forest)" }}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </form>
    </div>
  );
}
