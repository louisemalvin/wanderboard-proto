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
    const unsubFinish = useTripStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    useTripStore.persist.rehydrate();
    return () => {
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

  // ---- Create board → Error flow ----
  const handleCreateBoard = useCallback(() => {
    setErrorState(null);
    setIsCreating(true);
    // Phase 4: no AI route — immediately show error.
    // Simulate a brief delay so the spinner is visible.
    setTimeout(() => {
      setIsCreating(false);
      setErrorState({
        message: "Couldn't generate your board right now.",
      });
    }, 800);
  }, []);

  // ---- Retry (same as Create Board) ----
  const handleRetry = useCallback(() => {
    handleCreateBoard();
  }, [handleCreateBoard]);

  // ---- Sample trip ----
  const handleSampleTrip = useCallback(() => {
    setErrorState(null);
    try {
      const board = createSampleTrip();
      createTrip(board);
      refreshRecentTrips();
      router.push("/planner");
    } catch {
      setErrorState({
        message: "Could not create sample trip. Please try again.",
      });
    }
  }, [createTrip, refreshRecentTrips, router]);

  // ---- Start empty ----
  const handleStartEmpty = useCallback(() => {
    setErrorState(null);
    try {
      const board = createEmptyBoard();
      createTrip(board);
      refreshRecentTrips();
      router.push("/planner");
    } catch {
      setErrorState({
        message: "Could not create empty board. Please try again.",
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
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Wanderboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
