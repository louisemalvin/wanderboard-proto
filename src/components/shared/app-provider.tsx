"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/shared/app-shell";
import { useTripStore } from "@/stores/trip-store";

interface AppProviderProps {
  children: React.ReactNode;
}

function getActiveRoute(pathname: string): "home" | "itinerary" | "map" | "guide" {
  if (pathname === "/" || pathname === "" || pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/itinerary")) return "itinerary";
  if (pathname.startsWith("/map")) return "map";
  if (pathname.startsWith("/guide")) return "guide";
  return "home";
}

export default function AppProvider({ children }: AppProviderProps) {
  const pathname = usePathname();
  const activeRoute = getActiveRoute(pathname);
  const hasActiveTrip = useTripStore((s) => Boolean(s.board && s.currentTripId));
  const isTripRoute = activeRoute === "map" || activeRoute === "itinerary" || activeRoute === "guide";

  return (
    <AppShell activeRoute={activeRoute} showTripNav={isTripRoute && hasActiveTrip}>
      {children}
    </AppShell>
  );
}
