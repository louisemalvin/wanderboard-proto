"use client";

import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import Button from "@/components/shared/button";

interface NextActivityCardProps {
  title: string;
  time: string;
  duration: string;
  location: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
}

export default function NextActivityCard({
  title,
  time,
  duration,
  location,
  description,
  imageUrl,
  imageAlt = title,
}: NextActivityCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-surface overflow-hidden">
      {/* Image / map preview */}
      <div className="relative h-48 overflow-hidden bg-app-bg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[#F7F4EF]" />
            <div className="absolute -left-8 top-8 h-28 w-44 rounded-[45%] bg-[#DDE8DA]/80" />
            <div className="absolute bottom-[-28px] right-[-10px] h-32 w-48 rounded-[50%] bg-[#A3C9BC]/35" />
            <div className="absolute left-0 top-11 h-[3px] w-[72%] rotate-[-8deg] rounded-full bg-border/70" />
            <div className="absolute left-[28%] top-24 h-[3px] w-[62%] rotate-[10deg] rounded-full bg-border/70" />
            <div className="absolute left-[58%] top-0 h-[80%] w-[3px] rotate-[7deg] rounded-full bg-border/50" />
          </>
        )}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-forest/20 bg-surface px-3 py-2 shadow-surface">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-white">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="max-w-[180px] truncate text-sm font-medium text-ink">
            {title}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="tabular-nums">{time}</span>
          <span>{duration}</span>
          <span>{location}</span>
        </div>

        <p className="text-sm text-ink/80 leading-relaxed">{description}</p>

        <Button variant="primary" size="md" icon={Navigation}>
          Start
        </Button>
      </div>
    </div>
  );
}
