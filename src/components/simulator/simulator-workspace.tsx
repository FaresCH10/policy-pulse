"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, CircleAlert, Info, Layers } from "lucide-react";
import type { Policy, SimulationScenarioId } from "@/lib/types";
import { SCENARIO_META, runSimulation } from "@/lib/simulation";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/form";
import { Callout, EmptyState, PageSkeleton, SectionHeading } from "@/components/ui/misc";
import { PolicyStatusBadge } from "@/components/policy/status-badge";
import { ScenarioControls } from "./controls";
import { SimulatorResults, type Period } from "./results";

const SCENARIOS: SimulationScenarioId[] = ["bag-fee", "composting", "recycling-incentive"];

/**
 * The Impact Simulator — the central feature.
 *
 * The visitor picks a policy, moves a control, and the numbers, chart, narrative
 * and formula trace all update from the same pure function. No result is ever
 * cached or hard-coded; there is exactly one source of truth for the arithmetic.
 */
export function SimulatorWorkspace({
  policies,
  initialPolicyId,
}: {
  policies: Policy[];
  initialPolicyId?: string;
}) {
  const { profile, assumptions, hydrated } = useAppStore();

  const initialPolicy = useMemo(
    () => policies.find((p) => p.id === initialPolicyId) ?? null,
    [policies, initialPolicyId],
  );

  const [scenario, setScenario] = useState<SimulationScenarioId>(
    () => initialPolicy?.scenario ?? "bag-fee",
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => initialPolicy?.id,
  );
  const [period, setPeriod] = useState<Period>("monthly");

  const scenarioPolicies = useMemo(
    () => policies.filter((p) => p.scenario === scenario),
    [policies, scenario],
  );

  // Keep the selected policy inside the active scenario.
  useEffect(() => {
    if (!scenarioPolicies.some((p) => p.id === selectedId)) {
      setSelectedId(scenarioPolicies[0]?.id);
    }
  }, [scenarioPolicies, selectedId]);

  const selected = scenarioPolicies.find((p) => p.id === selectedId) ?? null;

  if (!hydrated) {
    return <PageSkeleton label="Loading the impact simulator" />;
  }

  if (policies.length === 0) {
    return (
      <EmptyState
        icon={<Calculator className="h-5 w-5" />}
        title="Nothing to simulate"
        description="No policies are available for this location, so there is no scenario to model. PolicyPulse will not invent one."
        action={
          <Link href="/policies" className="pp-link text-sm">
            Back to the Policy Explorer
          </Link>
        }
      />
    );
  }

  const result = selected ? runSimulation(selected, profile, assumptions) : null;

  return (
    <div className="space-y-6">
      <SectionHeading
        level="h1"
        eyebrow="Impact Simulator"
        title="Move a slider, see the maths"
        description="Pick a policy, adjust your household facts and your own what-if settings, and every number updates immediately. Nothing is hidden: the full formula and every assumption sit under the result."
      />

      {initialPolicyId && !initialPolicy ? (
        <Callout tone="warning" compact title="That policy is not in this build">
          We could not find a policy with the id “{initialPolicyId}”, so the simulator
          opened with the default scenario instead.
        </Callout>
      ) : null}

      <Card>
        <CardHeader
          icon={<Layers className="h-4 w-4" />}
          eyebrow="Step 1"
          title="Choose a policy to simulate"
          description="Each policy runs through one of three documented scenarios."
        />
        <CardBody className="space-y-4 pt-4">
          <SegmentedControl<SimulationScenarioId>
            legend="Policy scenario"
            name="scenario"
            value={scenario}
            onChange={setScenario}
            options={SCENARIOS.map((id) => ({
              value: id,
              label: SCENARIO_META[id].short,
            }))}
          />

          <p className="text-xs leading-relaxed text-ink-soft">
            {SCENARIO_META[scenario].description}
          </p>

          {scenarioPolicies.length > 1 ? (
            <div>
              <p className="pp-eyebrow mb-2">Policies using this scenario</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {scenarioPolicies.map((policy) => {
                  const active = policy.id === selectedId;
                  return (
                    <li key={policy.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(policy.id)}
                        aria-pressed={active}
                        className={
                          "flex w-full items-start justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 " +
                          (active
                            ? "border-forest-400 bg-forest-50"
                            : "border-paper-line bg-paper-raised hover:border-forest-200 hover:bg-forest-50/40")
                        }
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink">
                            {policy.shortTitle}
                          </span>
                          <span className="mt-0.5 block text-2xs text-ink-faint">
                            {policy.title}
                          </span>
                        </span>
                        <PolicyStatusBadge status={policy.status} compact />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {selected && result ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card className="border-forest-200">
              <CardBody className="pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <PolicyStatusBadge status={selected.status} compact />
                  <Badge tone="outline" compact>
                    {SCENARIO_META[selected.scenario].short} scenario
                  </Badge>
                </div>
                <h2 className="pp-display mt-2.5 text-lg font-semibold text-ink">
                  {selected.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {selected.summary}
                </p>
                <Link
                  href={`/policies/${selected.id}`}
                  className="pp-link mt-2 inline-block text-xs"
                >
                  Read the full policy
                </Link>
              </CardBody>
            </Card>

            <ScenarioControls policy={selected} />

            <Callout tone="info" compact title="Two kinds of input, kept apart">
              <p>
                <span className="font-semibold">Your household</span> fields are facts
                you can look up.{" "}
                <span className="font-semibold">What-if</span> fields are hypothetical
                levers. Changing a what-if value never alters the policy — it only
                changes the estimate on the right.
              </p>
            </Callout>
          </div>

          <div className="min-w-0">
            <SimulatorResults
              result={result}
              policy={selected}
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<CircleAlert className="h-5 w-5" />}
          title="No policy selected"
          description="Choose a scenario above to load its controls."
        />
      )}

      <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
        <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          Your settings are saved in this browser as you change them, so the Overview
          page stays in step. Nothing is uploaded, and there is no account.
        </span>
      </p>
    </div>
  );
}
