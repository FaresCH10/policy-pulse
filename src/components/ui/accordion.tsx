"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Disclosure built on native `<details>` / `<summary>`.
 *
 * Using the platform element means keyboard support, screen-reader semantics,
 * and find-in-page behaviour all work without JavaScript or custom ARIA.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  icon,
  className,
  tone = "default",
  id,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  className?: string;
  tone?: "default" | "quiet";
  id?: string;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cn(
        "group rounded-xl border border-paper-line",
        tone === "quiet" ? "bg-transparent" : "bg-paper-raised",
        className,
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-semibold text-ink",
          "transition-colors duration-200 ease-editorial hover:bg-paper-sunken/60",
          "rounded-xl [&::-webkit-details-marker]:hidden",
        )}
      >
        {icon ? (
          <span aria-hidden="true" className="shrink-0 text-forest-600">
            {icon}
          </span>
        ) : null}
        <span className="flex-1">{summary}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-editorial group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-paper-line px-4 py-4 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </details>
  );
}

/** A stack of disclosures with consistent spacing. */
export function DisclosureGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}
