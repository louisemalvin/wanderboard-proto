"use client";

import type { GuideActivity } from "@/components/guide/guide-types";
import GuideActivityCard from "@/components/guide/guide-activity-card";

interface GuideTimelineProps {
  activities: GuideActivity[];
  title?: string;
  description?: string;
}

export default function GuideTimeline({
  activities,
  title = "Your Day",
  description,
}: GuideTimelineProps) {
  return (
    <section aria-label="Daily itinerary timeline">
      <div className="mb-3">
        <h2 className="text-lg font-semibold font-sans text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      <div className="relative">
        {/* Continuous vertical rail line */}
        <div
          className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-border"
          aria-hidden="true"
        />
        {activities.map((activity) => (
          <GuideActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
