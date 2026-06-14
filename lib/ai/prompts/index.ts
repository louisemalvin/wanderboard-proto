// ------------------------------------------------------------------
// Mori Prompt Index — exports for route handlers
// ------------------------------------------------------------------

export { MORI_BASE_PROMPT } from "./mori-base";
export { MORI_OUTPUT_CONTRACT } from "./mori-output-contract";
import { MORI_PLAN_DISCOVER_PROMPT } from "./mori-plan-discover";
import { MORI_DAY_ITINERARY_PROMPT } from "./mori-day-itinerary";
import { MORI_GUIDE_PROMPT } from "./mori-guide";

export type MoriSurface = "plan_discover" | "day_itinerary" | "guide";

export function selectMoriPrompt(surface: MoriSurface): string {
  switch (surface) {
    case "plan_discover":
      return MORI_PLAN_DISCOVER_PROMPT;
    case "day_itinerary":
      return MORI_DAY_ITINERARY_PROMPT;
    case "guide":
      return MORI_GUIDE_PROMPT;
  }
}
