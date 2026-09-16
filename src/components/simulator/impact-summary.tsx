"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Printer } from "lucide-react";
import type { Jurisdiction, Policy, Source } from "@/lib/types";
import { DEMO_CITY, DISCLAIMERS } from "@/lib/constants";
import {
  COMPOSTING_AVAILABILITY_LABELS,
  TENURE_LABELS,
} from "@/lib/labels";
import {
  formatByUnit,
  formatCurrency,
  formatDate,
  formatLongDate,
  formatNumber,
  formatSignedCurrency,
} from "@/lib/format";
import { runSimulation, SCENARIO_META } from "@/lib/simulation";
import { primaryDate } from "@/lib/policy-utils";
import { useAppStore } from "@/state/app-store";
import { Wordmark } from "@/components/brand/wordmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout, PageSkeleton } from "@/components/ui/misc";
import { PolicyStatusBadge } from "@/components/policy/status-badge";

const SOURCE_LABELS: Record<string, string> = {
  policy: "Policy",
  household: "Your household",
  illustrative: "Illustrative default",
  "what-if": "Your what-if setting",
};

/**
 * Printable impact summary.
 *
 * Designed to survive being printed to paper or PDF: no interactive controls in
 * the printed flow, no reliance on colour, and the demo disclaimer appears at
 * both the top and the bottom so a printed page can never be mistaken for an
 * official document.
 */
export function ImpactSummary({
  policy,
  jurisdiction,
  sources,
}: {
  policy: Policy;
  jurisdiction: Jurisdiction | null;
  sources: Source[];
}) {
  const { profile, assumptions, hydrated } = useAppStore();
  const [generatedOn, setGeneratedOn] = useState("");

  useEffect(() => {
    setGeneratedOn(new Date().toISOString().slice(0, 10));
  }, []);

  if (!hydrated) {
    return <PageSkeleton label="Preparing your impact summary" />;
  }

  const result = runSimulation(policy, profile, assumptions);
  const date = primaryDate(policy);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="pp-no-print flex flex-wrap items-center gap-2">
        <Link
          href={`/simulator?policy=${policy.id}`}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to the simulator
        </Link>
        <Button
          className="ml-auto"
          icon={<Printer className="h-4 w-4" />}
          onClick={() => window.print()}
        >
          Print or save as PDF
        </Button>
      </div>

      <Callout tone="demo" title="Illustrative demonstration — not an official document">
        {DISCLAIMERS.global} {DISCLAIMERS.projections}
      </Callout>

      <article className="pp-card space-y-6 px-6 py-6">
        <header className="space-y-3 border-b border-paper-line pb-5">
          <Wordmark size="md" subtitle="Household impact summary" />
          <div>
            {/* h2: the page itself owns the single h1 for this route. */}
            <h2 className="pp-display text-2xl font-semibold leading-tight text-ink">
              {policy.title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {SCENARIO_META[policy.scenario].title} scenario ·{" "}
              {jurisdiction?.name ?? "Unknown jurisdiction"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PolicyStatusBadge status={policy.status} />
            <Badge tone="amber">Illustrative data</Badge>
            <Badge tone="outline">
              Generated {generatedOn ? formatLongDate(generatedOn) : "on this device"}
            </Badge>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Policy at a glance</h2>
          <p className="text-sm leading-relaxed text-ink">{policy.summary}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <SummaryRow label="Jurisdiction" value={jurisdiction?.name ?? "Unknown"} />
            <SummaryRow
              label="Jurisdiction level"
              value={jurisdiction ? `${jurisdiction.level} · ${jurisdiction.region}` : "—"}
            />
            <SummaryRow label={date?.label ?? "Key date"} value={date ? formatDate(date.date) : "Not stated"} />
            <SummaryRow label="Data status" value={policy.provenanceLabel} />
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Household profile used</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <SummaryRow
              label="Household size"
              value={`${formatNumber(profile.householdSize, 0)} people`}
            />
            <SummaryRow label="Tenure" value={TENURE_LABELS[profile.tenure]} />
            <SummaryRow
              label="Grocery trips per week"
              value={formatNumber(profile.groceryTripsPerWeek, 1)}
            />
            <SummaryRow
              label="Disposable bags per trip"
              value={formatNumber(profile.bagsPerTrip, 1)}
            />
            <SummaryRow
              label="Food waste per week"
              value={`${formatNumber(profile.weeklyFoodWasteLb, 1)} lb`}
            />
            <SummaryRow
              label="Composting available"
              value={COMPOSTING_AVAILABILITY_LABELS[profile.compostingAvailable]}
            />
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Result</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <SummaryRow
              label="Cost change per month"
              value={formatSignedCurrency(result.headline.monthlyCostChange)}
            />
            <SummaryRow
              label="Cost change per year"
              value={formatSignedCurrency(result.headline.annualCostChange, { whole: true })}
            />
            <SummaryRow
              label={`${result.headline.primaryImpactLabel} per month`}
              value={formatByUnit(
                result.headline.primaryImpactMonthly,
                result.headline.primaryImpactUnit,
                1,
              )}
            />
            <SummaryRow
              label={`${result.headline.primaryImpactLabel} per year`}
              value={formatByUnit(
                result.headline.primaryImpactAnnual,
                result.headline.primaryImpactUnit,
                1,
              )}
            />
            {result.oneTimeCost > 0 ? (
              <>
                <SummaryRow
                  label="One-time costs"
                  value={formatCurrency(result.oneTimeCost)}
                />
                <SummaryRow
                  label="Net change, first year"
                  value={formatSignedCurrency(result.netFirstYear, { whole: true })}
                />
              </>
            ) : null}
          </dl>

          <p className="text-sm leading-relaxed text-ink">{result.narrative}</p>

          {result.warnings.length > 0 ? (
            <div>
              <p className="mt-2 text-sm font-semibold text-ink">Caveats</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Metrics</h2>
          <table className="w-full border-collapse text-left text-sm">
            <caption className="pp-sr-only">
              Baseline and simulated values for each metric
            </caption>
            <thead>
              <tr className="border-b border-paper-line text-2xs uppercase tracking-wide text-ink-faint">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Metric
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Baseline / month
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Simulated / month
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Simulated / year
                </th>
              </tr>
            </thead>
            <tbody>
              {result.metrics.map((metric) => (
                <tr key={metric.key} className="border-b border-paper-line last:border-0">
                  <th scope="row" className="py-2 pr-3 font-medium text-ink">
                    {metric.label}
                  </th>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink-soft">
                    {formatByUnit(metric.baselineMonthly, metric.unit, 2)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums font-semibold text-ink">
                    {formatByUnit(metric.simulatedMonthly, metric.unit, 2)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-ink-soft">
                    {formatByUnit(metric.simulatedAnnual, metric.unit, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Assumptions used</h2>
          <table className="w-full border-collapse text-left text-sm">
            <caption className="pp-sr-only">Every assumption behind the result</caption>
            <thead>
              <tr className="border-b border-paper-line text-2xs uppercase tracking-wide text-ink-faint">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Assumption
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Value
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {result.assumptionsUsed.map((assumption) => (
                <tr
                  key={assumption.label}
                  className="border-b border-paper-line align-top last:border-0"
                >
                  <th scope="row" className="py-2 pr-3 font-medium text-ink">
                    {assumption.label}
                    {assumption.note ? (
                      <span className="mt-0.5 block text-2xs font-normal text-ink-faint">
                        {assumption.note}
                      </span>
                    ) : null}
                  </th>
                  <td className="py-2 pr-3 text-ink-soft">{assumption.value}</td>
                  <td className="py-2 text-ink-soft">
                    {SOURCE_LABELS[assumption.source] ?? assumption.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Calculation steps</h2>
          <ol className="space-y-2 text-sm">
            {result.steps.map((step, index) => (
              <li key={step.id} className="border-b border-paper-line pb-2 last:border-0">
                <p className="font-medium text-ink">
                  {index + 1}. {step.expression}
                </p>
                <p className="font-mono text-xs text-ink-soft">{step.substituted}</p>
                <p className="text-sm font-semibold text-forest-800">= {step.result}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="pp-eyebrow">Sources</h2>
          <ul className="space-y-1.5 text-sm">
            {sources.map((source) => (
              <li key={source.id} className="text-ink-soft">
                <span className="font-medium text-ink">{source.title}</span> —{" "}
                {source.publisher}
                {source.url ? (
                  <>
                    {" "}
                    · <a href={source.url} className="pp-link break-all">{source.url}</a>
                  </>
                ) : (
                  <> · no external document (illustrative record)</>
                )}
                {source.retrievedAt ? ` · retrieved ${formatDate(source.retrievedAt)}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <footer className="space-y-2 border-t border-paper-line pt-5 text-xs leading-relaxed text-ink-faint">
          <p className="font-semibold text-ink-soft">
            Demonstration build — {DEMO_CITY.fullName} is a fictional place.
          </p>
          <p>{DISCLAIMERS.global}</p>
          <p>{DISCLAIMERS.projections}</p>
          <p>
            Not legal advice. This summary was generated in the browser from the
            formulas and assumptions printed above. No emissions, health, temperature
            or tonnage effects are modelled anywhere in PolicyPulse.
          </p>
        </footer>
      </article>

      <p className="pp-no-print flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
        <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          The print layout removes the app navigation and expands link addresses, so a
          printed copy is readable on its own.
        </span>
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
