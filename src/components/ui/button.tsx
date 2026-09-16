"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared styles                                                               */
/* -------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 ease-editorial " +
  "disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-800 text-paper-raised hover:bg-forest-900 active:bg-forest-900 shadow-sm",
  secondary:
    "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm",
  outline:
    "border border-paper-line bg-paper-raised text-ink hover:border-forest-300 hover:bg-forest-50",
  ghost: "text-ink-soft hover:bg-paper-sunken hover:text-ink",
  danger: "border border-clay/40 bg-clay-soft text-clay hover:border-clay/70",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  /** Renders a leading icon; decorative icons are hidden from screen readers. */
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconRight, className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props}>
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span aria-hidden="true" className="shrink-0">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* Link button                                                                 */
/* -------------------------------------------------------------------------- */

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span aria-hidden="true" className="shrink-0">
          {iconRight}
        </span>
      ) : null}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Icon button                                                                 */
/* -------------------------------------------------------------------------- */

export interface IconButtonProps extends ComponentProps<"button"> {
  /** Required: icon-only buttons have no visible text. */
  label: string;
  variant?: Variant;
  size?: Size;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, variant = "ghost", size = "md", className, children, ...props }, ref) {
    const dimension = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          base,
          variants[variant],
          dimension,
          "p-0",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true">{children}</span>
      </button>
    );
  },
);
