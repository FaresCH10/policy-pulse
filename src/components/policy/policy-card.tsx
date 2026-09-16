"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Calculator,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import type { Jurisdiction, Policy } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { primaryDate } from "@/lib/policy-utils";
import { buildImpactStatement } from "@/lib/simulation";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { PolicyStatusBadge } from "./status-badge";
import { SourceNote } from "./source-note";
import { BookmarkButton } from "./bookmark-button";
import { cn } from "@/lib/utils";

/**
 * The policy card.
 *
 * Every card answers the same four questions in the same order: what is it,
 * where does it apply, when does something happen, and what would it mean for
 * *this* household. The personalised line is the only part that depends on the
 * visitor's own data.
 */
export function PolicyCard({
  policy,
  jurisdiction,
  className,
  showCategory = true,
}: {
  policy: Policy;
  jurisdiction: Jurisdiction | null;
  className?: string;
  showCategory?: boolean;
}) {
  const { profile, assumptions, hydrated } = useAppStore();
  const date = primaryDate(policy);
  const impact = hydrated
    ? buildImpactStatement(policy, profile, assumptions)
    : "";

  return (
    <article
      className={cn(
        "pp-card flex h-full flex-col transition-shadow duration-200 ease-editorial hover:shadow-raised",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <PolicyStatusBadge status={policy.status} compact />
        {showCategory ? (
          <Badge tone="outline" compact>
            {CATEGORY_LABELS[policy.category]}
          </Badge>
        ) : null}
        <span className="ml-auto">
          <BookmarkButton policyId={policy.id} policyTitle={policy.shortTitle} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3">
        <h3 className="pp-display text-base font-semibold leading-snug text-ink">
          <Link
            href={`/policies/${policy.id}`}
            className="rounded transition-colors hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            {policy.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{policy.summary}</p>

        <dl className="mt-3 space-y-1.5 text-2xs text-ink-faint">
          <div className="flex items-start gap-1.5">
            <dt className="flex items-center gap-1.5 font-semibold">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              Jurisdiction:
            </dt>
            <dd className="min-w-0">
              {jurisdiction?.name ?? "Unknown"}{" "}
              <span className="text-ink-faint">
                ({jurisdiction?.level ?? "—"}
                {jurisdiction?.region ? `, ${jurisdiction.region}` : ""})
              </span>
            </dd>
          </div>

          {date ? (
            <div className="flex items-start gap-1.5">
              <dt className="flex items-center gap-1.5 font-semibold">
                <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
                {date.label}:
              </dt>
              <dd>{formatDate(date.date)}</dd>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <dt className="font-semibold">Date:</dt>
              <dd>Not stated in the record</dd>
            </div>
          )}

          <div className="flex items-start gap-1.5">
            <dt className="flex items-center gap-1.5 font-semibold">
              <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
              Who is affected:
            </dt>
            <dd className="min-w-0">{policy.whoIsAffected[0]}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/70 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-teal-800">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            For your household
          </p>
          {!hydrated ? (
            <span className="pp-skeleton mt-2 block h-3 w-full rounded" />
          ) : impact ? (
            <p className="mt-1 text-xs leading-relaxed text-teal-900">{impact}</p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-teal-900">
              Add your household details to see a personalised estimate.{" "}
              <Link href="/" className="font-semibold underline underline-offset-2">
                Set up your profile
              </Link>
              .
            </p>
          )}
        </div>

        <div className="mt-auto pt-4">
          <SourceNote policy={policy} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-paper-line px-5 py-3">
        <Link
          href={`/policies/${policy.id}`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:bg-forest-50 focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          View details
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <Link
          href={`/simulator?policy=${policy.id}`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Simulate this
          <span className="pp-sr-only">policy in the impact simulator</span>
        </Link>
        <span className="ml-auto flex items-center gap-1 text-2xs text-ink-faint">
          <Building2 className="h-3 w-3" aria-hidden="true" />
          {STATUS_LABELS[policy.status]}
        </span>
      </div>
    </article>
  );
}
