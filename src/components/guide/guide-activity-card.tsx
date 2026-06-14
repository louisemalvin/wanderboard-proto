"use client";

import type { GuideActivity } from "@/components/guide/guide-types";
import { Clock, MapPin, UtensilsCrossed, Footprints, Info } from "lucide-react";

const typeIcons: Record<GuideActivity["type"], typeof Footprints> = {
  activity: Footprints,
  food: UtensilsCrossed,
  transit: Clock,
  note: Info,
};

interface GuideActivityCardProps {
  activity: GuideActivity;
}

export default function GuideActivityCard({
  activity,
}: GuideActivityCardProps) {
  const isCurrent = activity.status === "current";
  const isCompleted = activity.status === "completed";
  const TypeIcon = typeIcons[activity.type];

  return (
    <div
      className={`relative pl-10 pb-6 last:pb-0 ${
        isCurrent ? "opacity-100" : isCompleted ? "opacity-55" : "opacity-85"
      }`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${
          isCurrent
            ? "bg-forest border-forest shadow-[0_0_0_3px_#E7F1E8]"
            : isCompleted
              ? "bg-border border-border"
              : "bg-surface border-forest"
        }`}
        aria-hidden="true"
      />

      {/* Content card */}
      <div
        className={`rounded-xl border ${
          isCurrent
            ? "bg-forest-surface/40 border-forest/20"
            : "bg-surface border-border"
        } p-3 transition-colors`}
      >
        {/* Header row: time + type badge */}
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-xs font-medium tabular-nums ${
              isCurrent ? "text-forest" : "text-muted"
            }`}
          >
            {activity.time}
            {activity.duration ? ` · ${activity.duration}` : ""}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isCurrent
                ? "bg-forest/10 text-forest"
                : "bg-app-bg text-muted"
            }`}
          >
            <TypeIcon className="w-3 h-3" strokeWidth={1.5} />
            {activity.type === "activity"
              ? "Activity"
              : activity.type === "food"
                ? "Food"
                : activity.type === "transit"
                  ? "Transit"
                  : "Note"}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-sm font-semibold ${
            isCurrent ? "text-ink" : "text-ink"
          }`}
        >
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          {activity.description}
        </p>

        {/* Location */}
        {activity.location && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted">
            <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
            <span>{activity.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
