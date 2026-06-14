// ------------------------------------------------------------------
// Mori Proposal Store — temporary state for AI-generated proposals
// Uses a separate Zustand store to avoid polluting TripBoard state.
// ------------------------------------------------------------------

import { create } from "zustand";
import type {
  PlaceSuggestion,
  ItineraryProposal,
  GuideAction,
} from "@/lib/ai/mori-schemas";

export interface MoriProposalState {
  // Temporary place suggestions (rendered as cards and map markers)
  placeSuggestions: PlaceSuggestion[];
  // Temporary itinerary proposals (rendered as proposal cards)
  itineraryProposals: ItineraryProposal[];
  // Temporary guide actions (rendered as action buttons)
  guideActions: GuideAction[];

  // Current surface for context
  currentSurface: "plan_discover" | "day_itinerary" | "guide" | null;

  // Applied proposal tracking
  appliedProposals: Array<{
    proposalId: string;
    appliedAt: string;
    result: string;
  }>;
}

export interface MoriProposalActions {
  // Set all proposals from a Mori response
  setMoriResponse: (response: {
    surface: "plan_discover" | "day_itinerary" | "guide";
    placeSuggestions?: PlaceSuggestion[];
    itineraryProposals?: ItineraryProposal[];
    guideActions?: GuideAction[];
  }) => void;

  // Clear all temporary proposals
  clearProposals: () => void;

  // Place suggestion actions
  removePlaceSuggestion: (clientId: string) => void;
  savePlaceSuggestion: (clientId: string) => void;

  // Itinerary proposal actions
  removeItineraryProposal: (proposalId: string) => void;
  markProposalApplied: (proposalId: string, result: string) => void;

  // Guide action actions
  removeGuideAction: (index: number) => void;
  clearGuideActions: () => void;

  // Surface
  setCurrentSurface: (surface: "plan_discover" | "day_itinerary" | "guide" | null) => void;
}

export type MoriProposalStore = MoriProposalState & MoriProposalActions;

export const useMoriProposalStore = create<MoriProposalStore>()((set) => ({
  // Initial state
  placeSuggestions: [],
  itineraryProposals: [],
  guideActions: [],
  currentSurface: null,
  appliedProposals: [],

  // Actions
  setMoriResponse: (response) =>
    set({
      placeSuggestions: response.placeSuggestions ?? [],
      itineraryProposals: response.itineraryProposals ?? [],
      guideActions: response.guideActions ?? [],
      currentSurface: response.surface,
    }),

  clearProposals: () =>
    set({
      placeSuggestions: [],
      itineraryProposals: [],
      guideActions: [],
      currentSurface: null,
    }),

  removePlaceSuggestion: (clientId) =>
    set((state) => ({
      placeSuggestions: state.placeSuggestions.filter(
        (s) => s.clientId !== clientId,
      ),
    })),

  savePlaceSuggestion: (clientId) =>
    set((state) => ({
      placeSuggestions: state.placeSuggestions.filter(
        (s) => s.clientId !== clientId,
      ),
    })),

  removeItineraryProposal: (proposalId) =>
    set((state) => ({
      itineraryProposals: state.itineraryProposals.filter(
        (p) => p.proposalId !== proposalId,
      ),
    })),

  markProposalApplied: (proposalId, result) =>
    set((state) => ({
      itineraryProposals: state.itineraryProposals.filter(
        (p) => p.proposalId !== proposalId,
      ),
      appliedProposals: [
        ...state.appliedProposals,
        {
          proposalId,
          appliedAt: new Date().toISOString(),
          result,
        },
      ],
    })),

  removeGuideAction: (index) =>
    set((state) => ({
      guideActions: state.guideActions.filter((_, i) => i !== index),
    })),

  clearGuideActions: () =>
    set({ guideActions: [] }),

  setCurrentSurface: (surface) =>
    set({ currentSurface: surface }),
}));
