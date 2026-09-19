import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("pp-card", className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  eyebrow,
  actions,
  icon,
  className,
  as: Heading = "h2",
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
  id?: string;
}) {
  return (
    // A plain div, not <header>: this is a reusable card slot, so using <header>
    // turned every card on a page into a banner landmark (pages with 11 cards
    // exposed 11 of them). The heading inside already carries the semantics.
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-paper-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 text-forest-700"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="pp-eyebrow mb-1">{eyebrow}</p> : null}
          <Heading
            id={id}
            className="pp-display text-lg font-semibold leading-snug text-ink"
          >
            {title}
          </Heading>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function CardBody({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("px-5 py-4 sm:px-6 sm:py-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-paper-line px-5 py-3 sm:px-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** A labelled group of content inside a card body. */
export function FieldGroup({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="pp-eyebrow mb-2">{label}</p>
      {children}
    </div>
  );
}
