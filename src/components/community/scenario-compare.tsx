"use client";

import { useMemo, useState } from "react";
import { Info, Users } from "lucide-react";
import type { AssumptionOverrides, Policy, SimulationAssumptionsByScenario, SimulationScenarioId } from "@/lib/types";
import { DEFAULT_ASSUMPTIONS } from "@/lib/constants";
import { CIRCUMSTANCE_LABELS, HOUSEHOLD_ARCHETYPES } from "@/lib/data/community";
import { pickLeadingPolicy, runSimulation, SCENARIO_META } from "@/lib/simulation";
import { formatByUnit, formatSignedCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/form";
import { Callout } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const SCENARIOS: SimulationScenarioId[] = ["bag-fee", "composting", "recycling-incentive"];

/**
 * Scenario comparison.
 *
 * This is the honest way to show how circumstances change a policy's effect:
 * each row is a *set of inputs* run through the same formulas as the simulator,
 * not an assertion about how a group of people behaves. The constraint line says
 * which practical factor the row is testing.
 */
export function ScenarioCompare({ policies }: { policies: Policy[] }) {
  const [scenario, setScenario] = useState<SimulationScenarioId>("composting");

  const policy = useMemo(
    () => pickLeadingPolicy(policies, scenario),
    [policies, scenario],
  );

  const rows = useMemo(() => {
    if (!policy) return [];
    return HOUSEHOLD_ARCHETYPES.filter((a) => a.scenarios.includes(scenario)).map(
      (archetype) => ({
        archetype,
        result: runSimulation(
          policy,
          archetype.profile,
          mergeAssumptions(archetype.assumptionOverrides),
        ),
      }),
    );
  }, [policy, scenario]);

  return (
    <Card>
      <CardHeader
        icon={<Users className="h-4 w-4" />}
        eyebrow="Scenario comparison"
        title="How practical circumstances change the outcome"
        description="Each row is a different set of household inputs run through the same formulas as the simulator. It compares arithmetic, not people."
      />
      <CardBody className="space-y-4 pt-4">
        <SegmentedControl<SimulationScenarioId>
          legend="Scenario to compare"
          name="compare-scenario"
          size="sm"
          value={scenario}
          onChange={setScenario}
          options={SCENARIOS.map((id) => ({
            value: id,
            label: SCENARIO_META[id].short,
          }))}
        />

        {!policy || rows.length === 0 ? (
          <Callout tone="warning" compact>
            No comparison households are defined for this scenario in this build.
          </Callout>
        ) : (
          <>
            <p className="text-xs leading-relaxed text-ink-soft">
              Comparing against{" "}
              <span className="font-semibold text-ink">{policy.title}</span> — the most
              binding policy for this scenario.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                <caption className="pp-sr-only">
                  Household circumstances compared for the{" "}
                  {SCENARIO_META[scenario].title} scenario
                </caption>
                <thead>
                  <tr className="border-b border-paper-line text-2xs uppercase tracking-wide text-ink-faint">
                    <th scope="col" className="px-3 py-2 font-semibold">
                      Household circumstance
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      {SCENARIO_META[scenario].short} impact / month
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      Cost change / month
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ archetype, result }) => {
                    const cost = result.headline.monthlyCostChange;
                    return (
                      <tr
                        key={archetype.id}
                        className="border-b border-paper-line last:border-0"
                      >
                        <th scope="row" className="px-3 py-3 align-top font-medium text-ink">
                          <span className="block font-semibold">{archetype.label}</span>
                          <span className="mt-1 block text-2xs font-normal leading-relaxed text-ink-soft">
                            {archetype.constraint}
                          </span>
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {archetype.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} tone="outline" compact>
                                {CIRCUMSTANCE_LABELS[tag]}
                              </Badge>
                            ))}
                          </span>
                        </th>
                        <td className="px-3 py-3 text-right align-top tabular-nums text-ink">
                          {formatByUnit(
                            result.headline.primaryImpactMonthly,
                            result.headline.primaryImpactUnit,
                            1,
                          )}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-3 text-right align-top font-semibold tabular-nums",
                            cost < -0.005
                              ? "text-forest-700"
                              : cost > 0.005
                                ? "text-clay"
                                : "text-ink-faint",
                          )}
                        >
                          {formatSignedCurrency(cost)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
          <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            These households are illustrative inputs written for the demo. They are not
            survey data, they do not represent any real group, and no conclusion about
            people should be drawn from them — only about the arithmetic.
          </span>
        </p>
      </CardBody>
    </Card>
  );
}

function mergeAssumptions(
  overrides: AssumptionOverrides,
): SimulationAssumptionsByScenario {
  return {
    "bag-fee": { ...DEFAULT_ASSUMPTIONS["bag-fee"], ...(overrides["bag-fee"] ?? {}) },
    composting: { ...DEFAULT_ASSUMPTIONS.composting, ...(overrides.composting ?? {}) },
    "recycling-incentive": {
      ...DEFAULT_ASSUMPTIONS["recycling-incentive"],
      ...(overrides["recycling-incentive"] ?? {}),
    },
  };
}
