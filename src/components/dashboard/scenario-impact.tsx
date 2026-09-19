"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Policy } from "@/lib/types";
import { buildHouseholdImpact, SCENARIO_META } from "@/lib/simulation";
import type { ScenarioImpactRow } from "@/lib/simulation";
import { formatByUnit, formatSignedCurrency } from "@/lib/format";
import { useAppStore } from "@/state/app-store";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PolicyStatusBadge } from "@/components/policy/status-badge";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/**
 * One row per policy scenario.
 *
 * Policies that act on the same activity are never summed — the leading policy
 * for each scenario is used and the constraint is stated, because two bag fees
 * would charge the same shopping trips twice.
 */
export function ScenarioImpactList({ policies }: { policies: Policy[] }) {
  const { profile, assumptions, hydrated } = useAppStore();

  if (!hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-3" role="status" aria-live="polite">
        <span className="pp-sr-only">Loading your household impact</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="pp-card h-44 p-5">
            <span className="pp-skeleton block h-3 w-24 rounded" />
            <span className="pp-skeleton mt-3 block h-5 w-3/4 rounded" />
            <span className="pp-skeleton mt-4 block h-8 w-1/2 rounded" />
            <span className="pp-skeleton mt-3 block h-3 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  const summary = buildHouseholdImpact(policies, profile, assumptions);

  if (summary.rows.length === 0) {
    return (
      <EmptyState
        icon={<Calculator className="h-5 w-5" />}
        title="No policies to simulate yet"
        description="Once a policy is available for your location, its household impact will be modelled here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {summary.rows.map((row) => (
          <ScenarioImpactCard key={row.scenario} row={row} />
        ))}
      </div>

      <p className="text-2xs leading-relaxed text-ink-faint">
        One policy per scenario is modelled. Policies acting on the same activity are
        not added together.{" "}
        {summary.potentialMonthlyCostChange !== 0 ? (
          <>
            If the proposed policies also pass, the monthly change would be{" "}
            <span className="font-semibold text-ink-soft">
              {formatSignedCurrency(summary.potentialMonthlyCostChange)}
            </span>{" "}
            across those scenarios.
          </>
        ) : null}
      </p>
    </div>
  );
}

function ScenarioImpactCard({ row }: { row: ScenarioImpactRow }) {
  const meta = SCENARIO_META[row.scenario];
  const cost = row.monthlyCostChange;
  const isSaving = cost < -0.005;
  const isCosting = cost > 0.005;

  const CostIcon = isSaving ? TrendingDown : isCosting ? TrendingUp : Minus;
  const costTone = isSaving
    ? "text-forest-700"
    : isCosting
      ? "text-clay"
      : "text-ink-faint";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        eyebrow={meta.short}
        title={meta.title}
        actions={<PolicyStatusBadge status={row.status} compact />}
        className="pb-3"
      />
      <CardBody className="flex flex-1 flex-col gap-4 pt-4">
        <div>
          <p className="pp-eyebrow">Cost change per month</p>
          <p
            className={cn(
              "pp-display mt-1 flex items-baseline gap-1.5 text-2xl font-semibold tabular-nums",
              costTone,
            )}
          >
            <CostIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {formatSignedCurrency(cost)}
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            {formatSignedCurrency(row.annualCostChange, { whole: true })} over a year
            {isSaving
              ? " · a saving, because your costs fall"
              : isCosting
                ? " · an extra cost to your household"
                : " · no change from the baseline"}
          </p>
        </div>

        <div className="rounded-xl border border-paper-line bg-paper-sunken/50 px-3 py-2.5">
          <p className="pp-eyebrow">{row.headlineLabel}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
            {formatByUnit(row.headlineMonthly, row.headlineUnit, 1)}
            <span className="ml-1 text-xs font-medium text-ink-faint">per month</span>
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            {formatByUnit(row.headlineAnnual, row.headlineUnit, 1)} per year
          </p>
        </div>

        <p className="text-xs leading-relaxed text-ink-soft">
          {row.isPotential
            ? "This policy is proposed, so nothing is charged today. The figures show what would happen if it were adopted unchanged."
            : "Based on your household profile and your current simulator settings."}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Link
            href={`/simulator?policy=${row.policyId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1.5 text-xs font-semibold text-paper-raised transition-colors hover:bg-forest-900 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            Open simulator
          </Link>
          <Link
            href={`/policies/${row.policyId}`}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Policy details
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

/** Compact headline strip used at the top of the overview. */
export function HouseholdSummaryStats({ policies }: { policies: Policy[] }) {
  const { profile, assumptions, hydrated } = useAppStore();

  if (!hydrated) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pp-card h-24 p-4">
            <span className="pp-skeleton block h-3 w-20 rounded" />
            <span className="pp-skeleton mt-3 block h-7 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const summary = buildHouseholdImpact(policies, profile, assumptions);
  const bindingRows = summary.rows.filter((r) => !r.isPotential);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryTile
        label="Policies for you"
        value={String(policies.length)}
        hint={`${summary.rows.length} scenarios modelled · ${bindingRows.length} binding · ${summary.rows.length - bindingRows.length} proposed`}
      />
      <SummaryTile
        label="Monthly cost change"
        value={formatSignedCurrency(summary.bindingMonthlyCostChange)}
        tone={
          summary.bindingMonthlyCostChange < -0.005
            ? "positive"
            : summary.bindingMonthlyCostChange > 0.005
              ? "negative"
              : "muted"
        }
        hint={`${formatSignedCurrency(summary.bindingAnnualCostChange, { whole: true })} over a year`}
      />
      <SummaryTile
        label="Bags avoided"
        value={policies.some(p => p.scenario === "bag-fee") ? summary.bagsAvoidedMonthly.toFixed(1) : "—"}
        unit="per month"
        hint={policies.some(p => p.scenario === "bag-fee") ? `${(summary.bagsAvoidedMonthly * 12).toFixed(0)} per year, if you keep to your settings` : "No bag-fee policy in this coverage"}
      />
      <SummaryTile
        label="Food waste diverted"
        value={policies.some(p => p.scenario === "composting") ? summary.wasteDivertedMonthlyLb.toFixed(1) : "—"}
        unit="lb / month"
        hint={policies.some(p => p.scenario === "composting") ? `${(summary.wasteDivertedMonthlyLb * 12).toFixed(0)} lb per year` : "No composting policy in this coverage"}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "muted";
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
    <div className="rounded-2xl border border-paper-line bg-paper-raised px-4 py-3.5 shadow-card">
      <p className="pp-eyebrow">{label}</p>
      <p className={cn("pp-display mt-1.5 text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-ink-faint">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-1 text-2xs leading-relaxed text-ink-faint">{hint}</p> : null}
    </div>
  );
}
