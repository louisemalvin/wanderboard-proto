"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import HomeHeader from "@/components/home/home-header";
import MoriCard from "@/components/home/mori-card";
import BoardCard from "@/components/home/board-card";
import { useTripStore } from "@/stores/trip-store";
import { createSampleTrip } from "@/lib/sample-trip";
import type { RecentTrip, TripBoard, TripPace } from "@/lib/trip-types";

const RECENT_TRIPS_KEY = "wanderboard-recent-trips";
const TRIP_KEY_PREFIX = "wanderboard-trip-v1-";

function readRecentTrips(): RecentTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TRIPS_KEY);
    return raw ? (JSON.parse(raw) as RecentTrip[]) : [];
  } catch {
    return [];
  }
}

function seedTokyoTrip(): RecentTrip[] {
  if (typeof window === "undefined") return [];

  const trips = readRecentTrips();
  const sampleTrip = createSampleTrip();
  const existingIndex = trips.findIndex((trip) => trip.id === sampleTrip.id);

  try {
    localStorage.setItem(`${TRIP_KEY_PREFIX}${sampleTrip.id}`, JSON.stringify(sampleTrip));

    if (existingIndex >= 0) {
      return trips;
    }

    const recentTrip: RecentTrip = {
      id: sampleTrip.id,
      title: sampleTrip.title,
      destinationText: sampleTrip.destinationText,
      durationDays: sampleTrip.durationDays,
      pace: sampleTrip.pace,
      placeCount: Object.keys(sampleTrip.savedPlaces).length,
      updatedAt: sampleTrip.updatedAt,
    };
    const seededTrips = [recentTrip, ...trips].slice(0, 10);
    localStorage.setItem(RECENT_TRIPS_KEY, JSON.stringify(seededTrips));
    return seededTrips;
  } catch {
    return trips;
  }
}

function createBoard(destinationText: string, durationDays: number, pace: TripPace): TripBoard {
  const now = new Date().toISOString();
  const safeDestination = destinationText.trim();
  return {
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: safeDestination ? `${safeDestination} trip` : "Untitled trip",
    destinationText: safeDestination,
    durationDays,
    pace,
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

export default function HomePage() {
  const router = useRouter();
  const createTrip = useTripStore((s) => s.createTrip);
  const loadTrip = useTripStore((s) => s.loadTrip);
  const [mounted, setMounted] = useState(false);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [destinationText, setDestinationText] = useState("");
  const [durationDays, setDurationDays] = useState(5);
  const [pace, setPace] = useState<TripPace>("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useTripStore.persist.rehydrate();
    queueMicrotask(() => setRecentTrips(seedTokyoTrip()));
    setMounted(true);
  }, []);

  const openBoard = (tripId: string) => {
    const board = loadTrip(tripId);
    if (!board) {
      setError("We could not find that saved board on this device.");
      setRecentTrips(readRecentTrips());
      return;
    }
    router.push("/map");
  };

  const openBlankBoard = () => {
    setError(null);
    const name = destinationText.trim().slice(0, 40) || "Untitled trip";
    const board = createBoard(name, Math.max(1, durationDays), pace);
    const didCreate = createTrip(board);
    if (!didCreate) {
      setError("This browser could not save the board. Check local storage permissions and try again.");
      return;
    }
    router.push("/map");
  };

  const generateTrip = async () => {
    const prompt = destinationText.trim();
    if (!prompt) {
      setError("Describe the trip you want Wanderboard to generate.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, durationDays: Math.max(1, durationDays), pace }),
      });
      const payload = (await response.json()) as { board?: TripBoard; error?: { code?: string; message?: string } };
      if (!response.ok || !payload.board) {
        if (payload.error?.code === "not_configured") {
          throw new Error("AI trip generation is not configured yet. Open a blank board to build manually.");
        }
        throw new Error(payload.error?.message ?? "Wanderboard could not generate this trip. Please try again.");
      }
      const didCreate = createTrip(payload.board);
      if (!didCreate) {
        throw new Error("This browser could not save the board. Check local storage permissions and try again.");
      }
      router.push("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wanderboard could not generate this trip. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const recentTripsSlice = recentTrips.slice(0, 6);

  return (
    <div className="min-h-screen bg-[color:var(--wb-bg)]">
      <HomeHeader />

      <div className="mx-auto max-w-[1120px] px-5 pt-10 pb-16 sm:px-10">
        <section className="mb-10">
          <h1 className="font-display text-[44px] leading-[1.08] tracking-[-0.03em] text-[color:var(--wb-ink)]"
            style={{ fontSize: "clamp(32px, 5vw, 44px)" }}>
            Where are you wandering next?
          </h1>
          <p className="mt-3 text-base text-[color:var(--wb-muted)]">
            Describe the trip you have in mind and Mori will shape the first draft.
          </p>
        </section>

        <MoriCard
          destinationText={destinationText}
          durationDays={durationDays}
          pace={pace}
          isGenerating={isGenerating}
          onDestinationChange={setDestinationText}
          onDurationChange={setDurationDays}
          onPaceChange={setPace}
          onGenerate={() => void generateTrip()}
          onBlankBoard={openBlankBoard}
        />

        {error ? (
          <p
            className="mt-5 rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-3 text-sm text-[color:var(--wb-ink)]"
            role="status"
          >
            {error}
          </p>
        ) : null}

        {mounted && recentTripsSlice.length > 0 ? (
          <section className="mt-14" aria-labelledby="continue-planning-title">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="continue-planning-title" className="text-lg font-semibold text-[color:var(--wb-ink)]">
                Continue planning
              </h2>
              <span className="text-sm text-[color:var(--wb-muted)]">
                View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentTripsSlice.map((trip) => (
                <BoardCard key={trip.id} trip={trip} onOpen={openBoard} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
