"use client";

// ------------------------------------------------------------------
// AskPill — floating Ask Wanderboard pill with health check, chat
// submit, suggestion display, and stub fallback for development.
// ------------------------------------------------------------------
// STUB: The USE_STUB constant below can be set to true to bypass the
// Azure AI API and produce a hardcoded ChatSuggestion for UI testing.
// Default is false — the real phase 6 route is live.
// Remove or set to false before deployment.
// ------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef } from "react";
import { useTripStore } from "@/stores/trip-store";
import type { Place, TripBoard } from "@/lib/trip-types";
import { SuggestionCard, type ChatSuggestion, type ChatMutation } from "./SuggestionCard";

// ==================================================================
// STUB: Development fallback — set to true to bypass Azure AI
// ==================================================================
const USE_STUB = false;
// ==================================================================

// STUB: Hardcoded suggestion used when USE_STUB is true.
function buildStubSuggestion(board: TripBoard): ChatSuggestion {
  const stubPlaceId = `stub-place-${Date.now()}`;
  const stubPlace: Place = {
    id: stubPlaceId,
    name: "Sample Café",
    type: "cafe",
    location: { lat: 35.6762, lng: 139.6503 },
    city: "Tokyo",
    country: "Japan",
    description: "A cozy café with great matcha lattes.",
    estimatedCost: { currency: "USD", min: 5, max: 15 },
    estimatedDurationMinutes: 60,
  };

  const stubDayId = board.days[0]?.id ?? "day-1";
  const stubAssign = { placeId: stubPlaceId, dayId: stubDayId };

  return {
    explanation:
      "I found a great café near the city center. It's a short walk from your hotel and perfect for a morning break. I've added it to Day 1.",
    mutations: {
      addPlaces: [stubPlace],
      assign: [stubAssign],
      unassign: [],
      editPlaces: [],
    },
  };
}

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type PillState =
  | "idle"
  | "expanded"
  | "loading"
  | "suggestion"
  | "error"
  | "unavailable"
  | "checking";

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function AskPill() {
  const board = useTripStore((s) => s.board);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const savePlace = useTripStore((s) => s.savePlace);
  const assignPlaceToDay = useTripStore((s) => s.assignPlaceToDay);
  const unassignPlaceFromDay = useTripStore((s) => s.unassignPlaceFromDay);
  const updateTrip = useTripStore((s) => s.updateTrip);

  const [pillState, setPillState] = useState<PillState>("checking");
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState<ChatSuggestion | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageRef = useRef("");

  // ---- Health check on mount ----
  useEffect(() => {
    if (USE_STUB) {
      setPillState("idle");
      return;
    }

    let cancelled = false;
    fetch("/api/ai/health")
      .then((res) => res.json())
      .then((data: { configured: boolean }) => {
        if (cancelled) return;
        if (data.configured) {
          setPillState("idle");
        } else {
          setPillState("unavailable");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPillState("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Focus input when expanded ----
  useEffect(() => {
    if (pillState === "expanded" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [pillState]);

  // ---- Open pill ----
  const handleOpen = useCallback(() => {
    if (pillState === "unavailable") return;
    if (pillState === "idle") {
      setPillState("expanded");
    }
  }, [pillState]);

  // ---- Close pill (revert to idle) ----
  const handleClose = useCallback(() => {
    setPillState("idle");
    setMessage("");
    setErrorMessage(null);
    // Don't clear suggestion on close — user may want to see it
  }, []);

  // ---- Dismiss suggestion ----
  const handleDismiss = useCallback(() => {
    setSuggestion(null);
    setPillState("idle");
    setMessage("");
  }, []);

  // ---- Submit message ----
  const handleSubmit = useCallback(async () => {
    if (!message.trim() || !board || !currentTripId) return;

    setPillState("loading");
    setErrorMessage(null);
    prevMessageRef.current = message;

    // STUB: If USE_STUB is true, use hardcoded response
    if (USE_STUB) {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      const stub = buildStubSuggestion(board);
      setSuggestion(stub);
      setPillState("suggestion");
      return;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, board }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = body?.error?.code;
        const msg = body?.error?.message ?? "Something went wrong. Please try again.";

        // STUB: If route returns 404/501 (not live), fall back to stub
        if (res.status === 404 || res.status === 501) {
          // STUB: route not live — use hardcoded response for UI validation
          const stub = buildStubSuggestion(board);
          setSuggestion(stub);
          setPillState("suggestion");
          return;
        }

        setErrorMessage(msg);
        setPillState("error");
        return;
      }

      const data = await res.json();
      const chatSuggestion: ChatSuggestion = {
        explanation: data.explanation,
        mutations: data.mutations as ChatMutation,
      };
      setSuggestion(chatSuggestion);
      setPillState("suggestion");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setPillState("error");
    }
  }, [message, board, currentTripId]);

  // ---- Retry after error ----
  const handleRetry = useCallback(() => {
    setMessage(prevMessageRef.current);
    setPillState("expanded");
    setErrorMessage(null);
  }, []);

  // ---- Apply mutations ----
  const handleApply = useCallback(async () => {
    if (!suggestion || !currentTripId) return;
    setIsApplying(true);

    try {
      const { mutations } = suggestion;

      // addPlaces → savePlace
      if (mutations.addPlaces) {
        for (const place of mutations.addPlaces) {
          savePlace(currentTripId, place);
        }
      }

      // assign → assignPlaceToDay
      if (mutations.assign) {
        for (const a of mutations.assign) {
          assignPlaceToDay(currentTripId, a.dayId, a.placeId);
        }
      }

      // unassign → unassignPlaceFromDay
      if (mutations.unassign) {
        for (const u of mutations.unassign) {
          unassignPlaceFromDay(currentTripId, u.dayId, u.placeId);
        }
      }

      // editPlaces → updateTrip with merged updates
      if (mutations.editPlaces) {
        for (const edit of mutations.editPlaces) {
          // Read current board to merge updates
          const currentBoard = useTripStore.getState().board;
          if (currentBoard && currentBoard.savedPlaces[edit.placeId]) {
            const updatedPlace: Place = {
              ...currentBoard.savedPlaces[edit.placeId],
              ...(edit.updates as Partial<Place>),
            };
            const newSavedPlaces = { ...currentBoard.savedPlaces };
            newSavedPlaces[edit.placeId] = updatedPlace;
            updateTrip(currentTripId, { savedPlaces: newSavedPlaces });
          }
        }
      }

      // Clear suggestion and close
      setSuggestion(null);
      setPillState("idle");
      setMessage("");
    } finally {
      setIsApplying(false);
    }
  }, [suggestion, currentTripId, savePlace, assignPlaceToDay, unassignPlaceFromDay, updateTrip]);

  // ---- Key handlers ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleClose, handleSubmit],
  );

  // ---- Don't render if no board ----
  if (!board) return null;

  // ---- Render ----
  // Suggestion card shown above the pill when present
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {/* Suggestion card (if present) — pointer-events-auto to re-enable clicks */}
      {pillState === "suggestion" && suggestion && (
        <div className="pointer-events-auto">
          <SuggestionCard
            suggestion={suggestion}
            onApply={handleApply}
            onDismiss={handleDismiss}
            isApplying={isApplying}
          />
        </div>
      )}

      {/* AskPill */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* Error state */}
        {pillState === "error" && (
          <div className="w-72 rounded-xl border border-red-200 bg-red-50 p-3 shadow-lg dark:border-red-800 dark:bg-red-950">
            <p className="mb-2 text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Unavailable pill */}
        {pillState === "unavailable" && (
          <div className="group relative">
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-full bg-zinc-300 px-4 py-2 text-sm text-zinc-500 shadow dark:bg-zinc-700 dark:text-zinc-400"
            >
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              Ask Wanderboard
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-zinc-700">
              AI unavailable
              <div className="absolute right-3 top-full h-2 w-2 -translate-y-1 rotate-45 bg-zinc-800 dark:bg-zinc-700" />
            </div>
          </div>
        )}

        {/* Checking state */}
        {pillState === "checking" && (
          <button
            type="button"
            disabled
            className="flex cursor-wait items-center gap-2 rounded-full bg-zinc-200 px-4 py-2 text-sm text-zinc-400 shadow dark:bg-zinc-800 dark:text-zinc-500"
          >
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            Checking…
          </button>
        )}

        {/* Idle pill */}
        {pillState === "idle" && (
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            Ask Wanderboard
          </button>
        )}

        {/* Expanded state */}
        {pillState === "expanded" && (
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to change?"
              className="min-w-[200px] bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading state */}
        {pillState === "loading" && (
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Thinking…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
