import { cn } from "@/lib/utils";

/**
 * The PolicyPulse mark: a leaf whose central vein is a heartbeat trace.
 * Environmental subject matter plus the "pulse" of changing policy, in one
 * shape that stays legible down to 20px.
 */
export function PolicyPulseMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" fill="var(--pp-forest)" />
      <path
        d="M20 7.5c5.6 3.6 8.4 7.9 8.4 12.8 0 5.1-3.8 8.9-8.4 8.9s-8.4-3.8-8.4-8.9C11.6 15.4 14.4 11.1 20 7.5Z"
        fill="var(--pp-forest-bright)"
      />
      <path
        d="M13.4 20.4h3.1l1.6-4.3 2.5 7.6 1.8-4.9 1.2 1.6h2.9"
        fill="none"
        stroke="#aee1de"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The wordmark. "Policy" is set in the display serif, "Pulse" in the sans —
 * the same contrast the product uses between editorial explanation and
 * interface chrome.
 */
export function Wordmark({
  className,
  size = "md",
  showMark = true,
  subtitle,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
  subtitle?: string;
}) {
  const markSize = size === "lg" ? 40 : size === "sm" ? 26 : 32;
  const textSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {showMark ? <PolicyPulseMark size={markSize} /> : null}
      <span className="min-w-0">
        <span
          className={cn(
            "block leading-none tracking-[-0.02em]",
            textSize,
          )}
        >
          <span className="pp-display font-semibold text-forest-900">Policy</span>
          <span className="font-semibold text-teal-700">Pulse</span>
        </span>
        {subtitle ? (
          <span className="mt-1 block text-2xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
