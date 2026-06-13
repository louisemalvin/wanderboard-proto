"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/stores/trip-store";
import { createSampleTrip } from "@/lib/sample-trip";
import type { RecentTrip, TripBoard, TripPace } from "@/lib/trip-types";

import { PromptCard, DEFAULT_DETAILS } from "@/components/start/prompt-card";
import type { OptionalDetails } from "@/components/start/prompt-card";
import { CreateBoardButton } from "@/components/start/create-board-button";
import { SampleTripCard } from "@/components/start/sample-trip-card";
import { RecentTripsList } from "@/components/start/recent-trips-list";
import { ErrorCard } from "@/components/start/error-card";
import { Disclaimer } from "@/components/start/disclaimer";

// ------------------------------------------------------------------
// Error state type
// ------------------------------------------------------------------

interface ErrorState {
  message: string;
}

interface GenerateBoardErrorResponse {
  error?: {
    message?: string;
  };
}

interface GenerateBoardSuccessResponse {
  board?: unknown;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const RECENT_TRIPS_KEY = "wanderboard-recent-trips";

function readRecentTrips(): RecentTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TRIPS_KEY);
    if (raw === null) return [];
    return JSON.parse(raw) as RecentTrip[];
  } catch {
    return [];
  }
}

function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createEmptyBoard(): TripBoard {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "",
    destinationText: "",
    durationDays: 1,
    pace: "balanced" as TripPace,
    interests: [],
    assumptions: [],
    warnings: [],
    days: [],
    savedPlaces: {},
    dayPlans: [],
    createdAt: now,
    updatedAt: now,
  };
}

function getPersistenceFailureMessage(boardType: string): string {
  return `Could not save ${boardType}. Please free up browser storage or enable localStorage, then try again.`;
}

function isTripBoard(value: unknown): value is TripBoard {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as TripBoard).id === "string" &&
    typeof (value as TripBoard).title === "string" &&
    typeof (value as TripBoard).destinationText === "string" &&
    typeof (value as TripBoard).durationDays === "number" &&
    Array.isArray((value as TripBoard).days) &&
    typeof (value as TripBoard).savedPlaces === "object" &&
    (value as TripBoard).savedPlaces !== null &&
    Array.isArray((value as TripBoard).dayPlans)
  );
}

async function readGenerateBoardJson(
  response: Response,
): Promise<GenerateBoardSuccessResponse & GenerateBoardErrorResponse> {
  try {
    return (await response.json()) as GenerateBoardSuccessResponse &
      GenerateBoardErrorResponse;
  } catch {
    return {};
  }
}

// ------------------------------------------------------------------
// Page component
// ------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();
  const createTrip = useTripStore((s) => s.createTrip);
  const loadTrip = useTripStore((s) => s.loadTrip);

  // ---- UI state ----
  const [prompt, setPrompt] = useState("");
  const [details, setDetails] = useState<OptionalDetails>(DEFAULT_DETAILS);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // ---- Store hydration ----
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const markHydrated = () => {
      if (!cancelled) setHydrated(true);
    };
    const unsubFinish = useTripStore.persist.onFinishHydration(() =>
      markHydrated()
    );
    Promise.resolve(useTripStore.persist.rehydrate()).finally(markHydrated);
    return () => {
      cancelled = true;
      unsubFinish();
    };
  }, []);

  // ---- Recent trips (initialized synchronously from localStorage) ----
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>(() => {
    try {
      return readRecentTrips();
    } catch {
      return [];
    }
  });
  const [recentTripsError, setRecentTripsError] = useState<string | null>(null);

  // Refresh recent trips after creation
  const refreshRecentTrips = useCallback(() => {
    try {
      setRecentTrips(readRecentTrips());
    } catch {
      // Silently fail — already known state
    }
  }, []);

  // ---- Create board ----
  const handleCreateBoard = useCallback(async () => {
    if (isCreating) return;

    setErrorState(null);
    setIsCreating(true);

    const trimmedDestination = details.destination.trim();
    const interests = details.interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    const requestBody: {
      prompt: string;
      destination?: string;
      durationDays: number;
      pace: OptionalDetails["pace"];
      budgetLevel: OptionalDetails["budgetLevel"];
      interests?: string[];
    } = {
      prompt,
      durationDays: details.durationDays,
      pace: details.pace,
      budgetLevel: details.budgetLevel,
    };

    if (trimmedDestination) {
      requestBody.destination = trimmedDestination;
    }

    if (interests.length > 0) {
      requestBody.interests = interests;
    }

    try {
      const response = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await readGenerateBoardJson(response);

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "The board generator is unavailable right now. Please try again, create a sample trip, or start with an empty board.",
        );
      }

      if (!isTripBoard(data.board)) {
        throw new Error(
          "We couldn't read the generated board. Please try again, create a sample trip, or start with an empty board.",
        );
      }

      const didCreateTrip = createTrip(data.board);
      if (!didCreateTrip) {
        throw new Error(getPersistenceFailureMessage("your board"));
      }

      refreshRecentTrips();
      router.push("/planner");
    } catch (error) {
      setErrorState({
        message:
          error instanceof Error
            ? error.message
            : "Couldn't generate your board. Please try again, create a sample trip, or start with an empty board.",
      });
    } finally {
      setIsCreating(false);
    }
  }, [
    createTrip,
    details.budgetLevel,
    details.destination,
    details.durationDays,
    details.interests,
    details.pace,
    isCreating,
    prompt,
    refreshRecentTrips,
    router,
  ]);

  // ---- Retry (same as Create Board) ----
  const handleRetry = useCallback(() => {
    handleCreateBoard();
  }, [handleCreateBoard]);

  // ---- Sample trip ----
  const handleSampleTrip = useCallback(() => {
    setErrorState(null);
    try {
      const board = createSampleTrip();
      const didCreateTrip = createTrip(board);
      if (!didCreateTrip) {
        throw new Error(getPersistenceFailureMessage("sample trip"));
      }

      refreshRecentTrips();
      router.push("/planner");
    } catch (error) {
      setErrorState({
        message:
          error instanceof Error
            ? error.message
            : "Could not create sample trip. Please try again.",
      });
    }
  }, [createTrip, refreshRecentTrips, router]);

  // ---- Start empty ----
  const handleStartEmpty = useCallback(() => {
    setErrorState(null);
    try {
      const board = createEmptyBoard();
      const didCreateTrip = createTrip(board);
      if (!didCreateTrip) {
        throw new Error(getPersistenceFailureMessage("empty board"));
      }

      refreshRecentTrips();
      router.push("/planner");
    } catch (error) {
      setErrorState({
        message:
          error instanceof Error
            ? error.message
            : "Could not create empty board. Please try again.",
      });
    }
  }, [createTrip, refreshRecentTrips, router]);

  // ---- Select recent trip ----
  const handleSelectTrip = useCallback(
    (tripId: string) => {
      try {
        const board = loadTrip(tripId);
        if (!board) {
          setRecentTripsError("Trip data could not be loaded.");
          return;
        }
        router.push("/planner");
      } catch {
        setRecentTripsError("Trip data could not be loaded.");
      }
    },
    [loadTrip, router]
  );

  // ---- Render ----
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F4EF] font-sans text-[#1F2A22]">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1F2A22]">
            Wanderboard
          </h1>
          <p className="mt-1 text-sm text-[#667066]">
            Your travel board, organized.
          </p>
        </div>

        {/* Prompt input */}
        <PromptCard
          prompt={prompt}
          onPromptChange={setPrompt}
          details={details}
          onDetailsChange={setDetails}
        />

        {/* Create Board button */}
        <CreateBoardButton
          onCreate={handleCreateBoard}
          isLoading={isCreating}
          disabled={!hydrated}
        />

        {/* Sample trip card */}
        <SampleTripCard onSampleTrip={handleSampleTrip} />

        {/* Error card */}
        {errorState && (
          <ErrorCard
            message={errorState.message}
            onRetry={handleRetry}
            onSampleTrip={handleSampleTrip}
            onStartEmpty={handleStartEmpty}
          />
        )}

        {/* Recent trips */}
        <RecentTripsList
          trips={recentTrips}
          onSelect={handleSelectTrip}
          isLoading={false}
          error={recentTripsError}
        />

        {/* Disclaimer */}
        <div className="pt-4">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}
