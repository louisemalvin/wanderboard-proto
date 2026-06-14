"use client";

import type { GuideActivity } from "@/components/guide/guide-types";
import { Clock, MapPin, UtensilsCrossed, Footprints, Info } from "lucide-react";

const typeIcons: Record<GuideActivity["type"], typeof Footprints> = {
  activity: Footprints,
  food: UtensilsCrossed,
  transit: Clock,
  note: Info,
};

const statusLabels: Record<GuideActivity["status"], string> = {
  current: "In progress",
  upcoming: "Upcoming",
  completed: "Done",
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
      className={`relative pl-9 pb-5 last:pb-0 ${
        isCompleted ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-[6px] flex h-4 w-4 items-center justify-center rounded-full"
        aria-hidden="true"
        style={{
          ...(isCurrent
            ? {
                background: "#163B2C",
                border: "2px solid #163B2C",
                boxShadow: "0 0 0 4px rgba(22, 59, 44, 0.12)",
              }
            : isCompleted
              ? {
                  background: "var(--wb-sage)",
                  border: "2px solid rgba(31, 42, 34, 0.15)",
                }
              : {
                  background: "#FAF8F3",
                  border: "2px solid #2E6F40",
                }),
        }}
      />

      {/* Card */}
      <div
        className="rounded-xl border p-3.5"
        style={{
          ...(isCurrent
            ? {
                background: "#EEF2EB",
                borderColor: "rgba(22, 59, 44, 0.22)",
              }
            : {
                background: "#FAF8F3",
                borderColor: "rgba(31, 42, 34, 0.1)",
              }),
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color: isCurrent ? "var(--wb-forest)" : "var(--wb-muted)",
                }}
              >
                {activity.time}
                {activity.duration ? ` \u00b7 ${activity.duration}` : ""}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  background: isCurrent
                    ? "rgba(22, 59, 44, 0.1)"
                    : "rgba(31, 42, 34, 0.05)",
                  color: isCurrent ? "var(--wb-forest)" : "var(--wb-muted)",
                }}
              >
                <TypeIcon className="h-3 w-3" strokeWidth={1.5} />
                {activity.type === "activity"
                  ? "Activity"
                  : activity.type === "food"
                    ? "Food"
                    : activity.type === "transit"
                      ? "Transit"
                      : "Note"}
              </span>
            </div>

            <h3
              className="mt-1 text-sm font-semibold"
              style={{ color: "var(--wb-ink)" }}
            >
              {activity.title}
            </h3>

            <p
              className="mt-0.5 text-xs leading-relaxed"
              style={{
                color: "var(--wb-ink)",
                opacity: 0.7,
              }}
            >
              {activity.description}
            </p>

            {activity.location && (
              <div
                className="mt-1.5 flex items-center gap-1 text-xs"
                style={{ color: "var(--wb-muted)" }}
              >
                <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              ...(isCurrent
                ? {
                    background: "var(--wb-forest)",
                    color: "#FFFFFF",
                  }
                : isCompleted
                  ? {
                      background: "rgba(31, 42, 34, 0.06)",
                      color: "var(--wb-muted)",
                    }
                  : {
                      background: "rgba(31, 42, 34, 0.05)",
                      color: "var(--wb-muted)",
                    }),
            }}
          >
            {statusLabels[activity.status]}
          </span>
        </div>
      </div>
    </div>
  );
}
