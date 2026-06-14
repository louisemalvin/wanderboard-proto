"use client";

import { useState } from "react";
import Image from "next/image";
import { Send, Loader2, X } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";
import { GroundingStatus } from "@/components/shared/grounding-status";

interface ChatResponsePayload {
  explanation: string;
  mutations: Record<string, unknown>;
  grounding?: {
    status: "grounded" | "no_results" | "unavailable";
    sources: Array<{
      id?: string;
      title: string;
      url?: string;
      excerpt?: string;
      lastReviewed?: string;
    }>;
  };
  warnings?: string[];
}

interface MoriComposerProps {
  placeholder?: string;
}

export default function MoriComposer({
  placeholder = "Ask Mori about this itinerary…",
}: MoriComposerProps) {
  const board = useTripStore((s) => s.board);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grounding, setGrounding] = useState<ChatResponsePayload["grounding"] | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setMessage("");
    setError(null);
    setFeedback(null);
    setGrounding(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, board }),
      });

      const payload = (await response.json()) as ChatResponsePayload & {
        error?: { code?: string; message?: string };
      };

      if (!response.ok) {
        const msg =
          payload?.error?.message ?? "Mori could not respond. Please try again.";
        if (payload?.error?.code === "not_configured") {
          throw new Error(
            "Azure OpenAI is not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT to .env.local.",
          );
        }
        throw new Error(msg);
      }

      setFeedback(
        payload.explanation ?? "I processed your request.",
      );
      setGrounding(payload.grounding ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pointer-events-auto flex flex-col items-center">
      {feedback && (
        <div className="mb-2 w-full max-w-[640px] space-y-2">
          <div className="relative rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setGrounding(null);
              }}
              className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--wb-ink)]"
              aria-label="Dismiss reply"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="pr-5 text-sm leading-relaxed text-[color:var(--wb-ink)]">
              {feedback}
            </p>
          </div>
          <GroundingStatus grounding={grounding ?? undefined} />
        </div>
      )}
      {error && (
        <div className="relative mb-2 max-w-[640px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5">
          <button
            type="button"
            onClick={() => setError(null)}
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--wb-ink)]"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="pr-5 text-sm text-[#ef4444]">
            {error}
          </p>
        </div>
      )}

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
          placeholder={placeholder}
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
