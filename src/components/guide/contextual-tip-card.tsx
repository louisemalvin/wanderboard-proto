"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ContextualTipCardProps {
  tip: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ContextualTipCard({
  tip,
  actionLabel,
  onAction,
}: ContextualTipCardProps) {
  return (
    <aside
      className="rounded-2xl border p-[18px]"
      style={{
        background: "#EEF2EB",
        borderColor: "rgba(22, 59, 44, 0.14)",
      }}
    >
      <div className="flex items-start gap-3">
        <Image
          src="/mori.png"
          alt=""
          width={28}
          height={28}
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--wb-moss)" }}
          >
            Mori
          </p>
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--wb-ink)", opacity: 0.8 }}
          >
            {tip}
          </p>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--wb-forest)] transition-colors hover:text-[color:var(--wb-forest-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--wb-forest)" }}
            >
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
