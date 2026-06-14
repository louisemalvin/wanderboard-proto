"use client";

import { BookOpen, ChevronLeft, ChevronRight, Home, ListChecks, Map } from "lucide-react";
import Link from "next/link";

interface BottomNavigationProps {
  activeRoute: "home" | "itinerary" | "map" | "guide";
  isSidebarExpanded: boolean;
  onSidebarExpandedChange: (isExpanded: boolean) => void;
}

const TABS = [
  { id: "map" as const, label: "Discover places", shortLabel: "Discover", icon: Map, href: "/map" },
  { id: "itinerary" as const, label: "Plan itinerary", shortLabel: "Plan", icon: ListChecks, href: "/itinerary" },
  { id: "guide" as const, label: "Guide mode", shortLabel: "Guide", icon: BookOpen, href: "/guide" },
];

export default function BottomNavigation({
  activeRoute,
  isSidebarExpanded,
  onSidebarExpandedChange,
}: BottomNavigationProps) {
  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {TABS.map((tab) => {
            const isActive = tab.id === activeRoute;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${
                  isActive ? "text-forest-dark" : "text-muted hover:text-ink"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-xs font-medium leading-tight">{tab.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-surface transition-[width] duration-200 md:flex ${
          isSidebarExpanded ? "w-64" : "w-20"
        }`}
      >
        <nav aria-label="Main navigation" className="flex w-full flex-col gap-2 px-2 py-4">
          <button
            type="button"
            onClick={() => onSidebarExpandedChange(!isSidebarExpanded)}
            className={`mb-2 inline-flex min-h-[44px] items-center rounded-xl text-sm font-medium text-muted transition-colors hover:bg-app-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${
              isSidebarExpanded ? "justify-between px-3" : "justify-center"
            }`}
            aria-label={isSidebarExpanded ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={isSidebarExpanded}
          >
            {isSidebarExpanded ? <span className="font-display text-lg tracking-tight text-ink">Wanderboard</span> : null}
            {isSidebarExpanded ? (
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>

          {TABS.map((tab) => {
            const isActive = tab.id === activeRoute;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex min-h-[48px] w-full items-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${
                  isActive
                    ? "bg-forest-surface text-forest-dark"
                    : "text-muted hover:bg-app-bg hover:text-ink"
                } ${
                  isSidebarExpanded ? "justify-start gap-3 px-3" : "justify-center"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                {isSidebarExpanded ? <span>{tab.label}</span> : <span className="sr-only">{tab.label}</span>}
              </Link>
            );
          })}

          <div className="mt-auto w-full border-t border-border pt-2">
            <Link
              href="/home"
              className={`flex min-h-[48px] w-full items-center rounded-xl text-sm font-medium text-muted transition-colors hover:bg-app-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${
                isSidebarExpanded ? "justify-start gap-3 px-3" : "justify-center"
              }`}
            >
              <Home className="h-5 w-5" strokeWidth={1.5} />
              {isSidebarExpanded ? <span>Home</span> : <span className="sr-only">Home</span>}
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
