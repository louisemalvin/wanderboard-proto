"use client";

// ------------------------------------------------------------------
// Floating search card pinned at top of the map
// ------------------------------------------------------------------

import { Search } from "lucide-react";
import { useRef } from "react";

interface MapDiscoverySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MapDiscoverySearch({
  value,
  onChange,
  placeholder = "Search places...",
}: MapDiscoverySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute top-4 left-4 right-4 z-[700] max-w-[calc(100%-32px)] mx-auto md:left-5 md:right-auto md:top-5 md:mx-0 md:w-[min(420px,calc(100%-40px))] md:max-w-none">
      <div className="flex items-center gap-3 rounded-xl bg-surface border border-border px-4 py-3 shadow-surface">
        <Search className="w-5 h-5 text-muted shrink-0" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-ink text-sm font-sans placeholder:text-muted/60 focus:outline-none"
          aria-label="Search places"
        />
      </div>
    </div>
  );
}
