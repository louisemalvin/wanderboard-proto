"use client";

import { useState } from "react";
import BottomNavigation from "@/components/shared/bottom-navigation";

interface AppShellProps {
  activeRoute: "home" | "itinerary" | "map" | "guide";
  showTripNav: boolean;
  children: React.ReactNode;
}

export default function AppShell({ activeRoute, showTripNav, children }: AppShellProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const contentPadding = showTripNav
    ? isSidebarExpanded
      ? "pb-16 transition-[padding] duration-200 md:pb-0 md:pl-64"
      : "pb-16 transition-[padding] duration-200 md:pb-0 md:pl-20"
    : "";

  return (
    <div className="min-h-screen bg-app-bg">
      <div className={contentPadding}>{children}</div>
      {showTripNav ? (
        <BottomNavigation
          activeRoute={activeRoute}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarExpandedChange={setIsSidebarExpanded}
        />
      ) : null}
    </div>
  );
}
