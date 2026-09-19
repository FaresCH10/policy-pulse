"use client";

import { FlaskConical, ListOrdered, Sigma } from "lucide-react";
import type { AssumptionNote, SimulationResult } from "@/lib/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/accordion";
import { Callout } from "@/components/ui/misc";

const SOURCE_META: Record<AssumptionNote["source"], { label: string; tone: BadgeTone; help: string }> = {
  policy: {
    label: "From the policy",
    tone: "forest",
    help: "This number comes from the policy text itself. Changing a what-if control does not change it.",
  },
  household: {
    label: "From your household",
    tone: "teal",
    help: "This number comes from the details you entered about your household.",
  },
  illustrative: {
    label: "Illustrative default",
    tone: "amber",
    help: "An illustrative modelling assumption, not a measured household value. Review it before relying on an estimate.",
  },
  "what-if": {
    label: "Your what-if setting",
    tone: "clay",
    help: "You set this in the simulator. It is hypothetical and has no effect on any real policy.",
  },
};

/**
 * "How this is calculated" — the full trace.
 *
 * Every step of the formula is shown with the visitor's own numbers substituted,
 * followed by a tagged list of every assumption that fed the result. This is the
 * section that makes the estimate auditable rather than a black box.
 */
export function CalculationNotes({ result }: { result: SimulationResult }) {
  return (
    <Card>
      <CardHeader
        icon={<Sigma className="h-4 w-4" />}
        eyebrow="Transparency"
        title="How this is calculated"
        description="Every formula and every assumption behind the numbers above, in the order they are applied."
      />
      <CardBody className="space-y-4 pt-4">
        <Disclosure
          summary="Show the calculation steps"
          icon={<ListOrdered className="h-4 w-4" />}
          defaultOpen={false}
        >
          <ol className="space-y-3">
            {result.steps.map((step, index) => (
              <li
                key={step.id}
                className="rounded-xl border border-paper-line bg-paper-sunken/40 px-3.5 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-800 text-2xs font-semibold text-paper-raised"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-ink">
                      {step.expression}
                    </p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-ink-soft">
                      {step.substituted}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold tabular-nums text-forest-800">
                      = {step.result}
                    </p>
                    {step.note ? (
                      <p className="mt-1.5 text-2xs leading-relaxed text-ink-faint">
                        {step.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Disclosure>

        <Disclosure summary="Show the assumptions used" icon={<FlaskConical className="h-4 w-4" />}>
          <ul className="space-y-3">
            {result.assumptionsUsed.map((assumption) => {
              const meta = SOURCE_META[assumption.source];
              return (
                <li
                  key={assumption.label}
                  className="rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{assumption.label}</p>
                    <Badge tone={meta.tone} compact title={meta.help}>
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-ink-soft">{assumption.value}</p>
                  {assumption.note ? (
                    <p className="mt-1.5 text-2xs leading-relaxed text-ink-faint">
                      {assumption.note}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Callout tone="demo" className="mt-4" title="What is deliberately not modelled">
            No emissions, air quality, health, temperature or landfill-tonnage effects
            are calculated anywhere in PolicyPulse. Waste is reported in pounds and
            counts in whole units; the two are never converted into each other without
            a documented factor, and none is supplied here.
          </Callout>
        </Disclosure>

        <Disclosure summary="Why fractional bags and pounds appear">
          <p>
            Applying a rate — such as a 60% adoption rate — to a whole number of bags
            produces a fractional result. That is a property of the arithmetic, not a
            claim that someone carries 0.6 of a bag. Read these figures as averages
            over a month, not as a count of physical objects.
          </p>
        </Disclosure>
      </CardBody>
    </Card>
  );
}
