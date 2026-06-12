// ------------------------------------------------------------------
// wanderboard-proto — Zustand trip store with localStorage persistence
// ------------------------------------------------------------------
// Phase 3: trip state management backed by localStorage.
//
// localStorage keys:
//   wanderboard-recent-trips  — RecentTrip[]  (max 10)
//   wanderboard-trip-v1-{id}  — TripBoard     (one per trip)
//   wanderboard-store          — persist middleware session key  (internal)
// ------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TripBoard, RecentTrip, Place } from "../../lib/trip-types";

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const RECENT_TRIPS_KEY = "wanderboard-recent-trips";
const TRIP_KEY_PREFIX = "wanderboard-trip-v1-";
const MAX_RECENT_TRIPS = 10;

// ------------------------------------------------------------------
// State shape
// ------------------------------------------------------------------

export interface TripState {
  currentTripId: string | null;
  board: TripBoard | null;
  activeTab: "places" | `day:${string}` | "all";
  previewPlaceId: string | null;
}

// ------------------------------------------------------------------
// Actions
// ------------------------------------------------------------------

export interface TripActions {
  /** Create a new trip. If board is omitted, generates an empty one. */
  createTrip: (board?: TripBoard) => void;
  /** Load a trip from localStorage by id. Returns undefined if not found. */
  loadTrip: (tripId: string) => TripBoard | undefined;
  /** Merge partial fields into an existing trip. */
  updateTrip: (tripId: string, partial: Partial<TripBoard>) => void;
  /** Add a saved place to a trip. */
  savePlace: (tripId: string, place: Place) => void;
  /** Remove a saved place from a trip (also unassigns from all days). */
  unsavePlace: (tripId: string, placeId: string) => void;
  /** Assign a saved place to a day. No-op if dayId/placeId are invalid. */
  assignPlaceToDay: (tripId: string, dayId: string, placeId: string) => void;
  /** Remove a place from a day's assignments. */
  unassignPlaceFromDay: (tripId: string, dayId: string, placeId: string) => void;
  /** Move a day from one index to another within the trip. */
  reorderDays: (tripId: string, fromIndex: number, toIndex: number) => void;
  /** Move a place within a day's assignment list. */
  reorderPlaces: (tripId: string, dayId: string, fromIndex: number, toIndex: number) => void;
  /** Set the active UI tab (not persisted). */
  setActiveTab: (tab: "places" | `day:${string}` | "all") => void;
  /** Set the currently previewed place id (not persisted). */
  previewPlace: (placeId: string | null) => void;
}

export type TripStore = TripState & TripActions;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getTripKey(tripId: string): string {
  return `${TRIP_KEY_PREFIX}${tripId}`;
}

function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string): T | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): boolean {
  if (!isClient()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn(`[trip-store] localStorage quota exceeded for key "${key}"`);
    } else {
      console.warn(`[trip-store] failed to write localStorage key "${key}"`, e);
    }
    return false;
  }
}

function persistBoard(board: TripBoard): void {
  writeStorage(getTripKey(board.id), board);
}

function upsertRecentTrip(board: TripBoard): void {
  const trips = readStorage<RecentTrip[]>(RECENT_TRIPS_KEY) ?? [];
  const existingIdx = trips.findIndex((t) => t.id === board.id);
  const header: RecentTrip = {
    id: board.id,
    title: board.title,
    destinationText: board.destinationText,
    durationDays: board.durationDays,
    pace: board.pace,
    placeCount: Object.keys(board.savedPlaces).length,
    updatedAt: board.updatedAt,
  };
  if (existingIdx >= 0) {
    trips.splice(existingIdx, 1);
  }
  trips.unshift(header);
  writeStorage(RECENT_TRIPS_KEY, trips.slice(0, MAX_RECENT_TRIPS));
}

function createEmptyBoard(): TripBoard {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "",
    destinationText: "",
    durationDays: 1,
    pace: "balanced",
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

/** Read a board from its per-trip key, handling existence check. */
function loadBoardFromStorage(tripId: string): TripBoard | null {
  return readStorage<TripBoard>(getTripKey(tripId));
}

// ------------------------------------------------------------------
// Store
// ------------------------------------------------------------------

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      // ---- initial state ----
      currentTripId: null,
      board: null,
      activeTab: "places",
      previewPlaceId: null,

      // ---- trip lifecycle ----

      createTrip: (board?: TripBoard) => {
        const tripBoard = board ?? createEmptyBoard();
        persistBoard(tripBoard);
        upsertRecentTrip(tripBoard);
        set({ currentTripId: tripBoard.id, board: tripBoard });
      },

      loadTrip: (tripId: string): TripBoard | undefined => {
        const data = loadBoardFromStorage(tripId);
        if (data === null) {
          set({ currentTripId: null, board: null });
          return undefined;
        }
        set({ currentTripId: tripId, board: data });
        return data;
      },

      updateTrip: (tripId: string, partial: Partial<TripBoard>) => {
        const { currentTripId } = get();
        const existing = loadBoardFromStorage(tripId);
        if (existing === null) return;

        const updated: TripBoard = {
          ...existing,
          ...partial,
          days: partial.days ?? existing.days,
          dayPlans: partial.dayPlans ?? existing.dayPlans,
          savedPlaces: partial.savedPlaces ?? existing.savedPlaces,
          interests: partial.interests ?? existing.interests,
          assumptions: partial.assumptions ?? existing.assumptions,
          warnings: partial.warnings ?? existing.warnings,
          updatedAt: new Date().toISOString(),
        };

        persistBoard(updated);
        upsertRecentTrip(updated);

        if (tripId === currentTripId) {
          set({ board: updated });
        }
      },

      // ---- place management ----

      savePlace: (tripId: string, place: Place) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        board.savedPlaces[place.id] = { ...place };
        board.updatedAt = new Date().toISOString();

        persistBoard(board);
        upsertRecentTrip(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      unsavePlace: (tripId: string, placeId: string) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        delete board.savedPlaces[placeId];
        for (const plan of board.dayPlans) {
          plan.assignedPlaceIds = plan.assignedPlaceIds.filter((id) => id !== placeId);
        }
        board.updatedAt = new Date().toISOString();

        persistBoard(board);
        upsertRecentTrip(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      // ---- day assignment ----

      assignPlaceToDay: (tripId: string, dayId: string, placeId: string) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        const dayExists = board.days.some((d) => d.id === dayId);
        const placeExists = placeId in board.savedPlaces;
        if (!dayExists || !placeExists) return;

        const plan = board.dayPlans.find((p) => p.dayId === dayId);
        if (plan) {
          if (plan.assignedPlaceIds.includes(placeId)) return;
          plan.assignedPlaceIds = [...plan.assignedPlaceIds, placeId];
        } else {
          board.dayPlans = [...board.dayPlans, { dayId, assignedPlaceIds: [placeId] }];
        }
        board.updatedAt = new Date().toISOString();

        persistBoard(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      unassignPlaceFromDay: (tripId: string, dayId: string, placeId: string) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        const plan = board.dayPlans.find((p) => p.dayId === dayId);
        if (!plan) return;

        plan.assignedPlaceIds = plan.assignedPlaceIds.filter((id) => id !== placeId);
        board.updatedAt = new Date().toISOString();

        persistBoard(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      // ---- reorder ----

      reorderDays: (tripId: string, fromIndex: number, toIndex: number) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        const days = [...board.days];
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= days.length) return;
        if (toIndex < 0 || toIndex >= days.length) return;

        const [moved] = days.splice(fromIndex, 1);
        days.splice(toIndex, 0, moved);
        board.days = days;
        board.updatedAt = new Date().toISOString();

        persistBoard(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      reorderPlaces: (tripId: string, dayId: string, fromIndex: number, toIndex: number) => {
        const { currentTripId } = get();
        const board = loadBoardFromStorage(tripId);
        if (board === null) return;

        const plan = board.dayPlans.find((p) => p.dayId === dayId);
        if (!plan) return;

        const ids = [...plan.assignedPlaceIds];
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= ids.length) return;
        if (toIndex < 0 || toIndex >= ids.length) return;

        const [moved] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, moved);
        plan.assignedPlaceIds = ids;
        board.updatedAt = new Date().toISOString();

        persistBoard(board);

        if (tripId === currentTripId) {
          set({ board: { ...board } });
        }
      },

      // ---- UI state (not persisted) ----

      setActiveTab: (tab: "places" | `day:${string}` | "all") => {
        set({ activeTab: tab });
      },

      previewPlace: (placeId: string | null) => {
        set({ previewPlaceId: placeId });
      },
    }),
    {
      name: "wanderboard-store",
      partialize: (state) => ({
        currentTripId: state.currentTripId,
        board: state.board,
      }),
      skipHydration: true,
    }
  )
);
