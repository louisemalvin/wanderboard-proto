"use client";

import { ArrowRight } from "lucide-react";

interface MoriFollowUpChipsProps {
  suggestions: string[];
  onSelect?: (suggestion: string) => void;
}

export default function MoriFollowUpChips({ suggestions, onSelect }: MoriFollowUpChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect?.(suggestion)}
          className="inline-flex items-center gap-1 rounded-full border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-2.5 py-1 text-xs text-[color:var(--wb-muted)] transition-colors hover:bg-[color:var(--wb-bg)] hover:text-[color:var(--wb-ink)]"
        >
          {suggestion}
          <ArrowRight className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
