"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Loader2, ChevronDown, Sparkles } from "lucide-react";
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

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "mori"; content: string; grounding?: ChatResponsePayload["grounding"] };

interface MoriChatProps {
  placeholder?: string;
  emptyHint?: string;
}

export default function MoriChat({
  placeholder = "Ask Mori about your day...",
  emptyHint = "Get help with your day plan, ask for suggestions, or reorder stops.",
}: MoriChatProps) {
  const board = useTripStore((s) => s.board);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setError(null);
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

      const explanation: string =
        payload.explanation ?? "I processed your request.";
      setMessages((prev) => [
        ...prev,
        { role: "mori", content: explanation, grounding: payload.grounding },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          expanded
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setExpanded(false)}
        aria-hidden="true"
      />

      {/* Chat panel — fixed to bottom, grows upward via max-height */}
      <div
        className="fixed bottom-16 left-0 right-0 z-[65] md:bottom-0"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className={`mx-auto w-full max-w-2xl overflow-hidden rounded-t-xl border-x border-t border-border bg-surface shadow-2xl transition-all duration-300 ease-out ${
            expanded
              ? "max-h-[calc(100vh-8rem)] rounded-t-2xl"
              : "max-h-20"
          }`}
        >
          {/* Header — visible only when expanded */}
          {expanded && (
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/mori.png"
                  alt="Mori"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full"
                />
                <div>
                  <h2 className="text-sm font-semibold text-ink">Mori</h2>
                  <p className="text-[11px] text-muted">Your travel companion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-app-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark"
                aria-label="Collapse chat"
              >
                <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* Messages */}
          <div
            ref={listRef}
            className={`overflow-y-auto transition-all duration-300 ${
              expanded
                ? "h-full px-4 py-4"
                : "h-0 overflow-hidden"
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Empty state */}
              {expanded && messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                    <Sparkles className="h-6 w-6 text-forest" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-ink">Ask Mori anything</p>
                  <p className="mt-1 max-w-xs text-xs text-muted">
                    {emptyHint}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "mori" && (
                    <Image
                      src="/mori.png"
                      alt="Mori"
                      width={28}
                      height={28}
                      className="mt-0.5 h-7 w-7 shrink-0 rounded-full"
                    />
                  )}
                  <div className="flex max-w-[80%] flex-col gap-1.5">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md bg-forest-dark text-white"
                          : "rounded-bl-md border border-border bg-app-bg text-ink"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "mori" && msg.grounding && (
                      <GroundingStatus grounding={msg.grounding} />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-muted/40" />
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <Image
                    src="/mori.png"
                    alt="Mori"
                    width={28}
                    height={28}
                    className="mt-0.5 h-7 w-7 shrink-0 rounded-full"
                  />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-app-bg px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted" />
                    <span className="text-sm text-muted">Mori is thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-error/20 bg-error/5 px-3.5 py-2.5 text-sm text-error">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Input */}
          <div
            className={`shrink-0 border-t border-border bg-surface px-4 py-3 ${
              !expanded && "shadow-[0_-1px_2px_rgba(0,0,0,0.04)]"
            }`}
          >
            <form
              className="flex items-center gap-2"
              onSubmit={handleSubmit}
            >
              <label className="flex min-h-[44px] flex-1 items-center gap-2.5 rounded-xl border border-border bg-app-bg px-3.5 transition-all duration-200 focus-within:border-forest focus-within:bg-surface focus-within:shadow-[0_0_0_3px_rgba(22,59,44,0.1)]">
                <Image
                  src="/mori.png"
                  alt="Mori"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] shrink-0 rounded-full"
                />
                <span className="sr-only">Ask Mori about your day</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onFocus={() => setExpanded(true)}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={expanded ? "Type a message..." : placeholder}
                  disabled={isLoading}
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
                />
              </label>
              <button
                type="submit"
                aria-label="Send question"
                disabled={!message.trim() || isLoading}
                className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-forest-dark text-white transition-all duration-200 hover:bg-forest-dark-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
