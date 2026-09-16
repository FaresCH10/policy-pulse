"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Minus,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Policy, SimulationResult } from "@/lib/types";
import {
  formatByUnit,
  formatCurrency,
  formatSignedCurrency,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout } from "@/components/ui/misc";
import { ComparisonChart } from "./comparison-chart";
import { CalculationNotes } from "./calculation-notes";
import { BookmarkButton } from "@/components/policy/bookmark-button";
import { cn } from "@/lib/utils";

export type Period = "monthly" | "annual";

/**
 * The results panel.
 *
 * The headline answers the judge's question in one glance — what changes for
 * this household — and everything below it exists to justify that number:
 * the narrative, the warnings, the chart, and finally the full formula trace.
 */
export function SimulatorResults({
  result,
  policy,
  period,
  onPeriodChange,
}: {
  result: SimulationResult;
  policy: Policy;
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const cost = period === "monthly" ? result.headline.monthlyCostChange : result.headline.annualCostChange;
  const impact =
    period === "monthly"
      ? result.headline.primaryImpactMonthly
      : result.headline.primaryImpactAnnual;

  const isSaving = cost < -0.005;
  const isCosting = cost > 0.005;
  const CostIcon = isSaving ? TrendingDown : isCosting ? TrendingUp : Minus;

  const periodLabel = period === "monthly" ? "per month" : "per year";

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardHeader
          icon={<Sparkles className="h-4 w-4" />}
          eyebrow="Result"
          title={`What this means for your household, ${periodLabel}`}
          description="Based on the policy rules, your household facts, and your what-if settings."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {result.usesWhatIf ? (
                <Badge tone="amber">Includes a what-if value</Badge>
              ) : null}
              <BookmarkButton
                policyId={policy.id}
                policyTitle={policy.shortTitle}
                variant="full"
              />
            </div>
          }
        />
        <CardBody className="space-y-5 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-paper-line bg-paper-sunken/40 px-4 py-3.5">
              <p className="pp-eyebrow">Cost change</p>
              <p
                className={cn(
                  "pp-display mt-1.5 flex items-baseline gap-1.5 text-3xl font-semibold tabular-nums",
                  isSaving ? "text-forest-700" : isCosting ? "text-clay" : "text-ink-faint",
                )}
              >
                <CostIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {formatSignedCurrency(cost)}
              </p>
              <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                {isSaving
                  ? "Your household pays less than the baseline."
                  : isCosting
                    ? "Your household pays more than the baseline."
                    : "No difference from the baseline."}
              </p>
            </div>

            <div className="rounded-xl border border-forest-200 bg-forest-50/60 px-4 py-3.5">
              <p className="pp-eyebrow">{result.headline.primaryImpactLabel}</p>
              <p className="pp-display mt-1.5 text-3xl font-semibold tabular-nums text-forest-800">
                {formatByUnit(impact, result.headline.primaryImpactUnit, 1)}
              </p>
              <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                {result.headline.primaryImpactIsReduction
                  ? "A reduction is the intended effect of this policy."
                  : "The additional amount this policy would produce."}
              </p>
            </div>
          </div>

          {result.oneTimeCost > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-paper-line bg-paper-raised px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Net change over the first year
                </p>
                <p className="mt-0.5 text-2xs leading-relaxed text-ink-faint">
                  Annual cost change {formatSignedCurrency(result.headline.annualCostChange, { whole: true })}{" "}
                  plus one-time costs {formatCurrency(result.oneTimeCost)}.
                </p>
              </div>
              <p
                className={cn(
                  "text-xl font-semibold tabular-nums",
                  result.netFirstYear < 0 ? "text-forest-700" : "text-clay",
                )}
              >
                {formatSignedCurrency(result.netFirstYear, { whole: true })}
              </p>
            </div>
          ) : null}

          <p className="text-sm leading-relaxed text-ink">{result.narrative}</p>

          {result.warnings.length > 0 ? (
            <Callout tone="warning" title="Boundaries and caveats in this estimate">
              <ul className="list-disc space-y-1 pl-4">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </Callout>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon={<TrendingUp className="h-4 w-4" />}
          eyebrow="Comparison"
          title="Baseline versus simulated"
          description="The baseline is what happens with no behaviour change. The simulated bar is your settings."
        />
        <CardBody className="pt-4">
          <ComparisonChart result={result} period={period} onPeriodChange={onPeriodChange} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          eyebrow="All metrics"
          title="Everything this scenario calculates"
          description="No other quantity is derived anywhere in the model."
        />
        <CardBody className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <caption className="pp-sr-only">
                Baseline and simulated values for every metric in this scenario
              </caption>
              <thead>
                <tr className="border-b border-paper-line text-2xs uppercase tracking-wide text-ink-faint">
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Metric
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Baseline / month
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Simulated / month
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Simulated / year
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((metric) => (
                  <tr key={metric.key} className="border-b border-paper-line last:border-0">
                    <th scope="row" className="px-3 py-2.5 font-medium text-ink">
                      {metric.label}
                      <span className="mt-0.5 block text-2xs font-normal text-ink-faint">
                        {metric.lowerIsBetter ? "Lower is better" : "Higher is better"}
                      </span>
                    </th>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                      {formatByUnit(metric.baselineMonthly, metric.unit, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-ink">
                      {formatByUnit(metric.simulatedMonthly, metric.unit, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                      {formatByUnit(metric.simulatedAnnual, metric.unit, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <CalculationNotes result={result} />

      <div className="pp-no-print flex flex-wrap items-center gap-2">
        <LinkButton
          href={`/impact-summary?policy=${policy.id}`}
          icon={<Printer className="h-4 w-4" />}
        >
          Printable impact summary
        </LinkButton>
        <LinkButton
          href={`/policies/${policy.id}`}
          variant="outline"
          iconRight={<ArrowRight className="h-4 w-4" />}
        >
          Read the full policy
        </LinkButton>
        <Link
          href={`/actions?policy=${policy.id}`}
          className="pp-link inline-flex items-center gap-1 text-sm"
        >
          Take action on this policy
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
        <CircleAlert className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          This is an arithmetic estimate built from the formulas shown above. It is not
          a prediction, a forecast, or advice. PolicyPulse does not model emissions,
          health, or environmental outcomes of any kind.
        </span>
      </p>
    </div>
  );
}
