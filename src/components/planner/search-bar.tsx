"use client";

// ------------------------------------------------------------------
// Debounced search input — shared across panels
// ------------------------------------------------------------------

import { useState, useRef } from "react";
import { Search } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  // Local input state for responsive typing; parent value used only for init
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange(raw);
    }, 200);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667066]" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#DED6CC] bg-[#FFFDFC] py-2 pl-9 pr-3 text-sm text-[#1F2A22] outline-none transition-colors placeholder:text-[#667066]/70 focus:border-[#2E6F40] focus:ring-1 focus:ring-[#2E6F40]"
      />
    </div>
  );
}
