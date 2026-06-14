// ------------------------------------------------------------------
// Itinerary route page — server component with metadata
// Renders the client-side ItineraryClient
// ------------------------------------------------------------------

import type { Metadata } from "next";
import ItineraryClient from "./ItineraryClient";

export const metadata: Metadata = {
  title: "Itinerary — Wanderboard",
  description:
    "Day-by-day itinerary with activity cards, reorder controls, and smart suggestions.",
};

export default function ItineraryPage() {
  return <ItineraryClient />;
}
