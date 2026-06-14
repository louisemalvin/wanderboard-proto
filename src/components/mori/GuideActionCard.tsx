"use client";

import type { GuideAction } from "@/lib/ai/mori-schemas";
import { MapPin, Navigation, SkipForward, Clock, Calendar, ChevronRight } from "lucide-react";

const actionConfig: Record<
  string,
  { icon: typeof MapPin; label: string; variant: "primary" | "secondary" | "outline" }
> = {
  navigate_to_place: { icon: Navigation, label: "Navigate here", variant: "primary" },
  show_on_map: { icon: MapPin, label: "Show on map", variant: "secondary" },
  suggest_nearby_place: { icon: MapPin, label: "Show nearby options", variant: "secondary" },
  mark_place_skipped: { icon: SkipForward, label: "Skip this stop", variant: "outline" },
  move_to_later: { icon: Clock, label: "Move to later", variant: "outline" },
  open_day_plan: { icon: Calendar, label: "Open today's plan", variant: "secondary" },
  propose_day_adjustment: { icon: ChevronRight, label: "Preview adjustment", variant: "secondary" },
};

interface GuideActionCardProps {
  action: GuideAction;
  onNavigate?: (placeId: string) => void;
  onShowOnMap?: (placeId?: string, lat?: number, lng?: number) => void;
  onSkip?: (dayId: string, placeId: string) => void;
  onMoveToLater?: (dayId: string, placeId: string) => void;
  onOpenDayPlan?: (dayId: string) => void;
  onPreviewAdjustment?: (action: GuideAction & { type: "propose_day_adjustment" }) => void;
}

export default function GuideActionCard({
  action,
  onNavigate,
  onShowOnMap,
  onSkip,
  onMoveToLater,
  onOpenDayPlan,
  onPreviewAdjustment,
}: GuideActionCardProps) {
  const config = actionConfig[action.type];
  if (!config) return null;

  const { icon: Icon, label, variant } = config;

  const variantStyles = {
    primary:
      "bg-[color:var(--wb-forest)] text-white hover:bg-[color:var(--wb-forest-hover)]",
    secondary:
      "bg-[color:var(--wb-sage-light)] text-[color:var(--wb-forest)] hover:bg-[color:var(--wb-sage)]",
    outline:
      "border border-[color:var(--wb-border)] bg-transparent text-[color:var(--wb-ink)] hover:bg-black/5",
  };

  const handleClick = () => {
    switch (action.type) {
      case "navigate_to_place":
        if (action.placeId) onNavigate?.(action.placeId);
        break;
      case "show_on_map":
        onShowOnMap?.(action.placeId, action.latitude, action.longitude);
        break;
      case "mark_place_skipped":
        if (action.dayId && action.placeId) onSkip?.(action.dayId, action.placeId);
        break;
      case "move_to_later":
        if (action.dayId && action.placeId) onMoveToLater?.(action.dayId, action.placeId);
        break;
      case "open_day_plan":
        if (action.dayId) onOpenDayPlan?.(action.dayId);
        break;
      case "propose_day_adjustment":
        if (action.proposal) onPreviewAdjustment?.(action as GuideAction & { type: "propose_day_adjustment" });
        break;
      case "suggest_nearby_place":
        onShowOnMap?.();
        break;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${variantStyles[variant]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
