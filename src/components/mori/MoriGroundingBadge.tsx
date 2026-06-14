"use client";

import { GroundingStatus } from "@/components/shared/grounding-status";

interface MoriGroundingBadgeProps {
  status: "grounded" | "partially_grounded" | "no_results" | "unavailable";
  sources: Array<{
    id?: string;
    title: string;
    url?: string;
    excerpt?: string;
    lastReviewed?: string;
  }>;
}

export default function MoriGroundingBadge({ status, sources }: MoriGroundingBadgeProps) {
  // Adapt to the existing GroundingStatus component's expected format
  const adaptedSources = sources.length > 0
    ? { status: "grounded" as const, sources }
    : status === "partially_grounded"
      ? { status: "no_results" as const, sources: [] }
      : status === "no_results"
        ? { status: "no_results" as const, sources: [] }
        : { status: "unavailable" as const, sources: [] };

  if (status === "partially_grounded" && sources.length > 0) {
    // Partially grounded with some sources — show them
    return <GroundingStatus grounding={{ status: "grounded", sources }} />;
  }

  return <GroundingStatus grounding={adaptedSources} />;
}
