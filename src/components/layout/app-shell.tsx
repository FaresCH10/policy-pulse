"use client";

import { useAppMode } from "@/state/runtime-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Calculator,
  LayoutDashboard,
  ListChecks,
  MapPin,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { NAV_ITEMS, DEMO_CITY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/wordmark";
import { DemoBadge } from "@/components/brand/demo-badge";
import { useAppStore } from "@/state/app-store";

const ICONS: Record<string, ReactNode> = {
  overview: <LayoutDashboard className="h-[18px] w-[18px]" aria-hidden="true" />,
  policies: <ScrollText className="h-[18px] w-[18px]" aria-hidden="true" />,
  simulator: <Calculator className="h-[18px] w-[18px]" aria-hidden="true" />,
  community: <Users className="h-[18px] w-[18px]" aria-hidden="true" />,
  actions: <ListChecks className="h-[18px] w-[18px]" aria-hidden="true" />,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* -------------------------------------------------------------------------- */
/* Location + data status                                                      */
/* -------------------------------------------------------------------------- */

function LocationStatus({ compact = false }: { compact?: boolean }) {
  const mode = useAppMode();
  const { location, hydrated } = useAppStore();

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-paper-line bg-paper-sunken/60 px-3 py-2.5">
        <span className="pp-skeleton block h-3 w-20 rounded" />
        <span className="pp-skeleton mt-2 block h-3 w-full rounded" />
      </div>
    );
  }

  const isDemo = location.status === "demo";
  const isUnsupported = location.status === "unsupported";

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        isDemo
          ? "border-forest-200 bg-forest-50"
          : isUnsupported
            ? "border-clay/30 bg-clay-soft"
            : "border-paper-line bg-paper-sunken/60",
      )}
    >
      <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
        <MapPin className="h-3 w-3" aria-hidden="true" />
        Location
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-ink">
        {isDemo
          ? DEMO_CITY.name
          : isUnsupported
            ? "Not covered"
            : location.status === "live" ? location.query : "Not set yet"}
      </p>
      <p className="mt-0.5 text-2xs leading-relaxed text-ink-faint">
        {isDemo
          ? "Illustrative demo policies · not live data"
          : isUnsupported
            ? (mode === "demo" ? "No coverage · demo available" : "Outside current coverage")
            : location.status === "live" ? "Sourced policy data · check review dates" : "Choose a location to see policies"}
      </p>
      {!compact && location.status === "unsupported" ? (
        <p className="mt-1.5 truncate text-2xs text-clay">“{location.query}”</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar (desktop)                                                           */
/* -------------------------------------------------------------------------- */

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="pp-no-print hidden border-r border-paper-line bg-paper-raised/70 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="border-b border-paper-line px-5 py-5">
        <Link href="/" className="inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600">
          <Wordmark size="md" subtitle="Policy, made personal" />
        </Link>
      </div>

      {/* Distinct labels: this sidebar and the mobile bottom bar are two separate
          navigation landmarks, so they must not share one accessible name.
          Identical labels make the regions indistinguishable to screen readers. */}
      <nav aria-label="Sections" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 ease-editorial",
                    active
                      ? "bg-forest-800 text-paper-raised"
                      : "text-ink-soft hover:bg-paper-sunken hover:text-ink",
                  )}
                >
                  <span className={cn("mt-0.5", active ? "text-teal-200" : "text-forest-600")}>
                    {ICONS[item.icon]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-2xs leading-relaxed",
                        active ? "text-paper-raised/70" : "text-ink-faint",
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-paper-line px-4 py-4">
        <LocationStatus />
        <div className="flex items-center justify-between gap-2">
          <DemoBadge />
          <span className="flex items-center gap-1 text-2xs font-medium text-ink-faint">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            No account needed
          </span>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Top bar (mobile + desktop context)                                          */
/* -------------------------------------------------------------------------- */

function TopBar() {
  const mode = useAppMode();
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  return (
    <header className="pp-no-print sticky top-0 z-40 border-b border-paper-line bg-paper/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="lg:hidden rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <Wordmark size="sm" />
          </Link>
          <div className="hidden min-w-0 lg:block">
            <p className="pp-eyebrow">{current?.description ?? "Overview"}</p>
            {/* Deliberately not a heading — the page content owns the single h1. */}
            <p className="pp-display truncate text-lg font-semibold text-ink">
              {current?.label ?? "Overview"}
            </p>
          </div>
          <span className="min-w-0 truncate text-sm font-semibold text-ink lg:hidden">
            {current?.label ?? "Overview"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DemoBadge align="end" />
          <span className="hidden text-xs font-medium text-ink-faint sm:inline">
            {mode === "demo" ? `${DEMO_CITY.name} · fictional` : "Sourced policy data"}
          </span>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile bottom navigation                                                    */
/* -------------------------------------------------------------------------- */

function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary sections"
      className="pp-no-print fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper-raised/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const shortLabel = item.label.split(" ")[0];
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2 text-2xs font-semibold transition-colors",
                  active ? "text-forest-800" : "text-ink-faint hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-9 items-center justify-center rounded-full transition-colors",
                    active ? "bg-forest-50 text-forest-700" : "",
                  )}
                >
                  {ICONS[item.icon]}
                </span>
                <span className="truncate">{shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                      */
/* -------------------------------------------------------------------------- */

function SiteFooter() {
  const mode = useAppMode();
  return (
    <footer className="pp-no-print border-t border-paper-line px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-xs leading-relaxed text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          {mode === "demo" ? "PolicyPulse · demonstration with fictional policy data." : "PolicyPulse · source-linked policies and household estimates."}
        </p>
        <p className="shrink-0">
          Not legal advice. Check official sources before acting.
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <a
        href="#main"
        className="pp-no-print pp-sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper-raised"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col">
        <TopBar />
        <main
          id="main"
          className="pp-print-page flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <SiteFooter />
      </div>

      <MobileNav />
    </div>
  );
}
