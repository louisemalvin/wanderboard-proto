"use client";

import { Search, X } from "lucide-react";
import { useRef } from "react";

interface MapDiscoverySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MapDiscoverySearch({
  value,
  onChange,
  placeholder = "Search places…",
}: MapDiscoverySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute top-4 left-4 right-4 z-[700] md:left-5 md:right-auto md:top-5 md:mx-0 md:w-[min(360px,calc(100%-40px))] md:max-w-none">
      <div
        className="flex items-center gap-2.5 rounded-xl border bg-[#FAF8F3] px-3.5 py-3"
        style={{
          borderColor: "rgba(31, 42, 34, 0.12)",
          boxShadow:
            "0 1px 2px rgba(31, 42, 34, 0.04), 0 8px 24px rgba(31, 42, 34, 0.08)",
          height: 44,
        }}
      >
        <Search className="h-4 w-4 shrink-0 text-[color:var(--wb-muted)]" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--wb-ink)] placeholder:text-[color:var(--wb-muted)] focus:outline-none"
          aria-label="Search places"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[color:var(--wb-muted)] transition-colors hover:bg-[color:var(--wb-sage-light)] hover:text-[color:var(--wb-ink)]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}
