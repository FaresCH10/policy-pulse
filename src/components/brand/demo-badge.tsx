"use client";

import { Database, ShieldAlert } from "lucide-react";
import { DISCLAIMERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The persistent "Demo data" indicator.
 *
 * It is always visible in the app chrome, but deliberately small. Clicking it
 * opens the full explanation, so the disclosure is available without shouting.
 */
export function DemoBadge({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "inline";
}) {
  return (
    <details className={cn("group relative", className)}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 font-semibold text-amber-900",
          "transition-colors duration-200 ease-editorial hover:border-amber-400 hover:bg-amber-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          "[&::-webkit-details-marker]:hidden",
          variant === "pill" ? "px-2.5 py-1 text-2xs uppercase tracking-wide" : "px-3 py-1.5 text-xs",
        )}
        aria-label="Demo data — open the explanation"
      >
        <Database className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Demo data</span>
      </summary>

      <div
        role="note"
        className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-amber-200 bg-paper-raised p-3.5 text-xs leading-relaxed text-ink-soft shadow-raised sm:w-80"
      >
        <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Everything here is illustrative
        </p>
        <p className="mt-2">{DISCLAIMERS.global}</p>
        <p className="mt-2">
          No live policy feed is connected. The demonstration city and its
          programmes are fictional, and no deadline shown is a real deadline.
        </p>
      </div>
    </details>
  );
}
