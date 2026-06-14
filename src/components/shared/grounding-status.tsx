"use client";

import { useState } from "react";
import { Globe, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface GroundingSource {
  id?: string;
  title: string;
  url?: string;
  excerpt?: string;
  lastReviewed?: string;
}

interface GroundingStatusProps {
  grounding?: {
    status: "grounded" | "no_results" | "unavailable";
    sources: GroundingSource[];
  };
}

export function GroundingStatus({ grounding }: GroundingStatusProps) {
  const [expanded, setExpanded] = useState(false);

  if (!grounding) return null;

  const { status, sources } = grounding;

  return (
    <div className="rounded-lg border border-[color:var(--wb-border)] bg-[color:var(--wb-sage-light)] px-3 py-2">
      {status === "grounded" && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center gap-1.5 text-xs font-medium text-[color:var(--wb-forest)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: "var(--wb-forest)" }}
            aria-expanded={expanded}
          >
            <Globe className="h-3 w-3" />
            <span>Grounded with destination knowledge</span>
            {sources.length > 0 && (
              <span className="text-[color:var(--wb-muted)]">
                &middot; Sources ({sources.length})
              </span>
            )}
            <span className="ml-auto">
              {expanded ? (
                <ChevronUp className="h-3 w-3 text-[color:var(--wb-muted)]" />
              ) : (
                <ChevronDown className="h-3 w-3 text-[color:var(--wb-muted)]" />
              )}
            </span>
          </button>

          {expanded && sources.length > 0 && (
            <ul className="mt-2 space-y-1.5" role="list">
              {sources.map((source, i) => (
                <li
                  key={source.id || i}
                  className="rounded-md bg-white/60 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="mt-px shrink-0 text-[color:var(--wb-muted)]">
                      &bull;
                    </span>
                    <div className="min-w-0">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[color:var(--wb-ink)] hover:underline inline-flex items-center gap-0.5"
                        >
                          {source.title}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium text-[color:var(--wb-ink)]">
                          {source.title}
                        </span>
                      )}
                      {source.excerpt && (
                        <p className="mt-0.5 leading-relaxed text-[color:var(--wb-muted)] line-clamp-2">
                          {source.excerpt}
                        </p>
                      )}
                      {source.lastReviewed && (
                        <span className="mt-0.5 block text-[10px] text-[color:var(--wb-muted)]">
                          Last reviewed: {source.lastReviewed}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {status === "no_results" && (
        <p className="flex items-center gap-1.5 text-xs text-[color:var(--wb-muted)]">
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--wb-sage)] text-[10px]">
            i
          </span>
          Planning suggestion based on your board and model reasoning. Verify current local details.
        </p>
      )}

      {status === "unavailable" && (
        <p className="flex items-center gap-1.5 text-xs text-[color:var(--wb-muted)]">
          <AlertCircle className="h-3 w-3 shrink-0" />
          Destination knowledge is temporarily unavailable. This suggestion has not been source-grounded.
        </p>
      )}
    </div>
  );
}
