"use client";

import Image from "next/image";
import { MapPin, Clock, ArrowLeftRight, Route } from "lucide-react";

interface MoriInfoPanelProps {
  hasSavedPlaces: boolean;
}

const CAPABILITIES = [
  { icon: MapPin, label: "Group nearby places" },
  { icon: Clock, label: "Check opening hours" },
  { icon: ArrowLeftRight, label: "Balance travel time" },
  { icon: Route, label: "Suggest a smooth flow" },
];

export default function MoriInfoPanel({ hasSavedPlaces }: MoriInfoPanelProps) {
  return (
    <aside
      aria-label="Mori assistance"
      className="rounded-2xl border p-[18px]"
      style={{
        background: "#EEF2EB",
        borderColor: "rgba(22, 59, 44, 0.14)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/mori.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-full"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-[color:var(--wb-ink)]">Mori</h3>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--wb-ink)]" style={{ opacity: 0.8 }}>
        {hasSavedPlaces
          ? "I can help balance this day once you have places saved."
          : "I can help once you have places saved."}
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-[color:var(--wb-muted)]">Mori can:</p>
        <ul className="space-y-1.5">
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm text-[color:var(--wb-ink)]"
              style={{ opacity: 0.75 }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--wb-moss)]" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
