"use client";

// ------------------------------------------------------------------
// Planner client orchestrator — state handling + layout
// ------------------------------------------------------------------

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTripStore } from "@/stores/trip-store";
import type { RecentTrip } from "@/lib/trip-types";
import { PlannerTopBar } from "@/components/planner/planner-top-bar";
import { LayerTabs } from "@/components/planner/layer-tabs";
import { PlacesPanel } from "@/components/planner/places-panel";
import { DayPanel } from "@/components/planner/day-panel";
import { AllPanel } from "@/components/planner/all-panel";

// ------------------------------------------------------------------
// Dynamic map import (SSR disabled — Leaflet needs browser APIs)
// ------------------------------------------------------------------

const DayMap = dynamic(
  () => import("@/components/planner/day-map"),
  { ssr: false }
);

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const RECENT_TRIPS_KEY = "wanderboard-recent-trips";

// ------------------------------------------------------------------
// State types
// ------------------------------------------------------------------

type PageState = "loading" | "empty" | "error" | "ready";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function PlannerClient() {
  const board = useTripStore((s) => s.board);
  const loadTrip = useTripStore((s) => s.loadTrip);
  const activeTab = useTripStore((s) => s.activeTab);

  const [hydrated, setHydrated] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  // ---- Hydrate persisted store state ----
  useEffect(() => {
    const unsubFinish = useTripStore.persist.onFinishHydration(() => {
      // setState inside subscription callback is safe (not direct effect body)
      setHydrated(true);
    });
    useTripStore.persist.rehydrate();
    return () => {
      unsubFinish();
    };
  }, []);

  // ---- After hydration, try loading most recent trip if no board ----
  // All setState calls are deferred via requestAnimationFrame (async, not
  // direct effect body) to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!hydrated || board || hasAttemptedLoad) return;

    const raf = requestAnimationFrame(() => {
      setHasAttemptedLoad(true);
      try {
        const trips = readRecentTrips();
        if (trips.length === 0) {
          setLoadError("empty");
          return;
        }
        const loaded = loadTrip(trips[0].id);
        if (!loaded) {
          setLoadError("error");
        }
      } catch {
        setLoadError("error");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [hydrated, board, hasAttemptedLoad, loadTrip]);

  // ---- Derive page state during render ----
  let pageState: PageState;
  if (!hydrated || (!board && !hasAttemptedLoad && !loadError)) {
    pageState = "loading";
  } else if (board) {
    pageState = "ready";
  } else if (loadError === "empty") {
    pageState = "empty";
  } else {
    pageState = "error";
  }

  // ---- Render states ----

  if (pageState === "loading") {
    return <LoadingSkeleton />;
  }

  if (pageState === "empty") {
    return <EmptyState />;
  }

  if (pageState === "error") {
    return <ErrorState />;
  }

  // ---- Normal (ready) state ----

  function renderPanel() {
    switch (activeTab) {
      case "places":
        return <PlacesPanel />;
      case "all":
        return <AllPanel />;
      default:
        if (activeTab.startsWith("day:")) return <DayPanel />;
        return null;
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PlannerTopBar
        onTogglePanel={() => setPanelOpen((v) => !v)}
        panelOpen={panelOpen}
      />
      <LayerTabs />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`${
            panelOpen ? "w-72" : "w-0"
          } flex-shrink-0 overflow-y-auto border-r border-zinc-200 bg-white transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900 md:w-72`}
        >
          <div className={`${panelOpen ? "block" : "hidden"} md:block`}>
            {renderPanel()}
          </div>
        </aside>
        <main className="flex-1">
          <DayMap />
        </main>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// State sub-components
// ------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Loading your trip…
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-sm text-center">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No trip selected
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Go back to create or select a trip.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-sm text-center">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Could not load your trip data. It may have been deleted or corrupted.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
