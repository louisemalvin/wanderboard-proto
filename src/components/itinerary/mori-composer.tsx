"use client";

import { useState } from "react";
import Image from "next/image";
import { Send, Loader2 } from "lucide-react";
import { useTripStore } from "@/stores/trip-store";

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setMessage("");
    setError(null);
    setFeedback(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, board }),
      });

      const payload = await response.json();

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {feedback && (
        <p className="mb-2 max-w-[640px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5 text-sm leading-relaxed text-[color:var(--wb-ink)]">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mb-2 max-w-[640px] rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5 text-sm text-[#ef4444]">
          {error}
        </p>
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
