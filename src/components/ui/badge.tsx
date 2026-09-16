import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "forest"
  | "teal"
  | "amber"
  | "clay"
  | "outline"
  | "ink";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-paper-sunken text-ink-soft border-paper-line",
  forest: "bg-forest-50 text-forest-800 border-forest-200",
  teal: "bg-teal-50 text-teal-800 border-teal-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  clay: "bg-clay-soft text-clay border-clay/30",
  outline: "bg-transparent text-ink-soft border-paper-line",
  ink: "bg-forest-900 text-paper-raised border-forest-900",
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  /** Renders smaller, for dense card metadata rows. */
  compact?: boolean;
  title?: string;
}

/**
 * A small status label. Colour is never the only signal — every badge in this
 * app carries a word, so status survives greyscale printing and colour-vision
 * differences.
 */
export function Badge({
  children,
  tone = "neutral",
  icon,
  className,
  compact = false,
  title,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        compact ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
