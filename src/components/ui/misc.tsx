"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { AlertTriangle, HelpCircle, Info, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Callout                                                                     */
/* -------------------------------------------------------------------------- */

export type CalloutTone = "info" | "demo" | "warning" | "success";

const calloutTones: Record<CalloutTone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "border-teal-200 bg-teal-50 text-teal-900",
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
  },
  demo: {
    wrap: "border-amber-200 bg-amber-50 text-amber-900",
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
  },
  warning: {
    wrap: "border-clay/30 bg-clay-soft text-clay",
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  },
  success: {
    wrap: "border-forest-200 bg-forest-50 text-forest-900",
    icon: <Leaf className="h-4 w-4" aria-hidden="true" />,
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
  compact = false,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const config = calloutTones[tone];
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl border",
        compact ? "px-3 py-2" : "px-4 py-3",
        config.wrap,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0 text-xs leading-relaxed sm:text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                        */
/* -------------------------------------------------------------------------- */

export function Stat({
  label,
  value,
  unit,
  hint,
  tone = "default",
  size = "md",
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "positive" | "negative" | "muted";
  size?: "md" | "lg";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "positive"
      ? "text-forest-700"
      : tone === "negative"
        ? "text-clay"
        : tone === "muted"
          ? "text-ink-faint"
          : "text-ink";

  return (
    <div className="rounded-xl border border-paper-line bg-paper-raised px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        {icon ? (
          <span aria-hidden="true" className="text-ink-faint">
            {icon}
          </span>
        ) : null}
        <p className="pp-eyebrow">{label}</p>
      </div>
      <p
        className={cn(
          "pp-display mt-2 font-semibold tabular-nums",
          size === "lg" ? "text-3xl" : "text-2xl",
          toneClass,
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-medium text-ink-faint">{unit}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

export function Skeleton({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("pp-skeleton block rounded-lg", className)}
    />
  );
}

/** Standard page-level loading state: a heading, some lines, and cards. */
export function PageSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="pp-sr-only">{label}</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" label="" />
        <Skeleton className="h-9 w-2/3 max-w-md" label="" />
        <Skeleton className="h-4 w-full max-w-2xl" label="" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" label="" />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  tone = "default",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  tone?: "default" | "filtered";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-paper-line-strong bg-paper-raised/60 px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "mb-3 flex h-11 w-11 items-center justify-center rounded-full",
            tone === "filtered"
              ? "bg-teal-50 text-teal-700"
              : "bg-forest-50 text-forest-700",
          )}
        >
          {icon}
        </span>
      ) : null}
      <h3 className="pp-display text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* InfoTip — a keyboard-accessible "why does this matter?" disclosure          */
/* -------------------------------------------------------------------------- */

export function InfoTip({
  label = "More information",
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <details className={cn("group inline-block", className)}>
      <summary
        aria-label={label}
        title={label}
        className="inline-flex h-5 w-5 cursor-pointer list-none items-center justify-center rounded-full border border-paper-line-strong bg-paper-raised text-ink-faint transition-colors hover:border-teal-300 hover:text-teal-700 [&::-webkit-details-marker]:hidden"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </summary>
      <div
        id={id}
        className="mt-2 max-w-xs rounded-xl border border-paper-line bg-paper-raised px-3 py-2 text-xs leading-relaxed text-ink-soft shadow-card"
      >
        {children}
      </div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "forest",
}: {
  value: number;
  max?: number;
  label: string;
  tone?: "forest" | "teal";
}) {
  const pct = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-paper-sunken"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-editorial",
          tone === "forest" ? "bg-forest-600" : "bg-teal-600",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                             */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  className,
  level = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
  /** Use "h1" when this is the page's own title, so each page has exactly one. */
  level?: "h1" | "h2";
}) {
  const Heading = level;
  const size = level === "h1" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="pp-eyebrow mb-1.5">{eyebrow}</p> : null}
        <Heading id={id} className={cn("pp-display font-semibold text-ink", size)}>
          {title}
        </Heading>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </div>
  );
}
