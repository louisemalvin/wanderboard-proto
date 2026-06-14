"use client";

import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";

interface NextActivityCardProps {
  title: string;
  time: string;
  duration: string;
  location: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  onStart?: () => void;
}

export default function NextActivityCard({
  title,
  time,
  duration,
  location,
  description,
  imageUrl,
  imageAlt = title,
  onStart,
}: NextActivityCardProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "#FAF8F3",
        borderColor: "rgba(31, 42, 34, 0.12)",
        boxShadow:
          "0 1px 2px rgba(31, 42, 34, 0.04), 0 8px 24px rgba(31, 42, 34, 0.04)",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Visual */}
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-[240px] lg:w-[280px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 280px"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "var(--color-wb-bg)" }}>
              <div
                className="absolute -left-4 top-6 h-24 w-36 rounded-[45%] opacity-70"
                style={{ background: "var(--wb-sage)" }}
              />
              <div
                className="absolute bottom-[-20px] right-[-8px] h-28 w-40 rounded-[50%] opacity-30"
                style={{ background: "var(--wb-moss)" }}
              />
              <div
                className="absolute left-1/4 top-1/4 h-[2px] w-[60%] -rotate-[12deg] rounded-full"
                style={{ background: "rgba(31, 42, 34, 0.1)" }}
              />
              <div
                className="absolute left-[55%] top-0 h-[70%] w-[2px] rotate-[8deg] rounded-full"
                style={{ background: "rgba(31, 42, 34, 0.1)" }}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    background: "#FAF8F3",
                    borderColor: "var(--wb-forest)",
                  }}
                >
                  <MapPin
                    className="h-5 w-5"
                    strokeWidth={2}
                    style={{ color: "var(--wb-forest)" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--wb-moss)" }}
            >
              Next stop
            </span>

            <h2
              className="mt-1 font-display text-xl leading-tight tracking-tight"
              style={{ color: "var(--wb-ink)" }}
            >
              {title}
            </h2>

            <div
              className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm"
              style={{ color: "var(--wb-muted)" }}
            >
              <span>{time}</span>
              <span>{duration}</span>
              <span>{location}</span>
            </div>

            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--wb-ink)", opacity: 0.75 }}
            >
              {description}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "var(--wb-forest)",
                outlineColor: "var(--wb-forest)",
              }}
            >
              Start visit
              <ArrowRight className="h-4 w-4" />
            </button>
            <span
              className="text-xs"
              style={{ color: "var(--wb-muted)" }}
            >
              Starts in 5 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
