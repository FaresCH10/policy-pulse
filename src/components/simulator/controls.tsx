"use client";

import {
  BadgeCheck,
  Info,
  Landmark,
  RotateCcw,
  ShieldAlert,
  Sliders,
  UserRound,
} from "lucide-react";
import type { Policy } from "@/lib/types";
import { SLIDER_BOUNDS } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, RangeControl } from "@/components/ui/form";
import { Callout } from "@/components/ui/misc";

/**
 * Simulator controls.
 *
 * Three visually distinct groups, in this order:
 *
 *   1. Policy rules  — read-only, from the policy text.
 *   2. Your household — editable facts about you.
 *   3. What-if settings — hypothetical levers, clearly marked as not changing
 *      the policy.
 *
 * Keeping the real rule visually separate from the hypothetical value is the
 * point: changing a simulated fee must never look like amending an ordinance.
 */
export function ScenarioControls({ policy }: { policy: Policy }) {
  const {
    profile,
    assumptions,
    updateProfile,
    resetAssumptions,
    resetProfile,
    hydrated,
  } = useAppStore();

  const scenario = policy.scenario;

  return (
    <div className="space-y-5">
      <PolicyRulesCard policy={policy} />

      <Card>
        <CardHeader
          icon={<UserRound className="h-4 w-4" />}
          eyebrow="Group 1 · your household"
          title="Facts about you"
          description="These are stored in your household profile and reused everywhere in the app."
        />
        <CardBody className="space-y-5 pt-4">
          {scenario === "bag-fee" ? (
            <>
              <RangeControl
                label="Grocery trips per week"
                value={profile.groceryTripsPerWeek}
                onChange={(value) => updateProfile({ groceryTripsPerWeek: value })}
                min={SLIDER_BOUNDS.groceryTripsPerWeek.min}
                max={SLIDER_BOUNDS.groceryTripsPerWeek.max}
                help="Bag fees are charged per bag, so more trips means more chances to be charged."
                disabled={!hydrated}
              />
              <RangeControl
                label="Disposable bags per trip"
                value={profile.bagsPerTrip}
                onChange={(value) => updateProfile({ bagsPerTrip: value })}
                min={SLIDER_BOUNDS.bagsPerTrip.min}
                max={SLIDER_BOUNDS.bagsPerTrip.max}
                help="Your baseline habit before any change. The simulator compares against this."
                disabled={!hydrated}
              />
            </>
          ) : null}

          {scenario === "composting" ? (
            <>
              <RangeControl
                label="Food waste per week"
                value={profile.weeklyFoodWasteLb}
                onChange={(value) => updateProfile({ weeklyFoodWasteLb: value })}
                min={SLIDER_BOUNDS.weeklyFoodWasteLb.min}
                max={SLIDER_BOUNDS.weeklyFoodWasteLb.max}
                suffix="lb"
                help="A self-reported estimate. Weighing a week's scraps once gives a much better figure."
                disabled={!hydrated}
              />
              <div>
                <p className="pp-eyebrow mb-2">Is composting available to you?</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "unsure", label: "Not sure" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={profile.compostingAvailable === option.value}
                      onClick={() => updateProfile({ compostingAvailable: option.value })}
                      disabled={!hydrated}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-55 " +
                        (profile.compostingAvailable === option.value
                          ? "border-forest-400 bg-forest-800 text-paper-raised"
                          : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink")
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                  If you are not sure, the estimate stays neutral and a note appears in
                  the results.
                </p>
              </div>
            </>
          ) : null}

          {scenario === "recycling-incentive" ? (
            <RangeControl
              label="People in your household"
              value={profile.householdSize}
              onChange={(value) => updateProfile({ householdSize: Math.round(value) })}
              min={SLIDER_BOUNDS.householdSize.min}
              max={SLIDER_BOUNDS.householdSize.max}
              help="Recyclables are estimated per person, so household size scales the whole estimate."
              disabled={!hydrated}
            />
          ) : null}
        </CardBody>
      </Card>

      <Card className="border-amber-200">
        <CardHeader
          icon={<Sliders className="h-4 w-4" />}
          eyebrow="Group 2 · what-if settings"
          title="Hypothetical changes you control"
          description="Nothing here alters the policy. These are your own assumptions, used only for this estimate."
          actions={
            <Badge tone="amber" icon={<ShieldAlert className="h-3 w-3" />}>
              Does not change the policy
            </Badge>
          }
        />
        <CardBody className="space-y-5 pt-4">
          {scenario === "bag-fee" && assumptions["bag-fee"] ? (
            <BagFeeControls />
          ) : null}
          {scenario === "composting" && assumptions.composting ? (
            <CompostingControls />
          ) : null}
          {scenario === "recycling-incentive" && assumptions["recycling-incentive"] ? (
            <RecyclingControls />
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-paper-line pt-4">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => resetAssumptions(scenario)}
              disabled={!hydrated}
            >
              Reset these settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetProfile}
              disabled={!hydrated}
            >
              Reset household facts
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Group 0 — the actual rule, read-only                                        */
/* -------------------------------------------------------------------------- */

function PolicyRulesCard({ policy }: { policy: Policy }) {
  const params = policy.policyParameters;

  return (
    <Card className="border-forest-200 bg-forest-50/40">
      <CardHeader
        icon={<Landmark className="h-4 w-4" />}
        eyebrow="The policy itself"
        title="What the policy actually sets"
        description="Read-only. These values come from the policy text and cannot be changed here."
        actions={
          <Badge tone="forest" icon={<BadgeCheck className="h-3 w-3" />}>
            From the policy
          </Badge>
        }
      />
      <CardBody className="space-y-3 pt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          {params.scenario === "bag-fee" ? (
            <>
              <RuleItem
                label="Fee per bag"
                value={`${formatCurrency(params.feePerBag)} per bag`}
              />
              <RuleItem label="Applies to" value={params.appliesTo} />
              <RuleItem
                label="Exemptions"
                value={`${params.exemptions.length} listed`}
              />
              <RuleItem label="Where the money goes" value={params.revenueUse} />
            </>
          ) : null}

          {params.scenario === "composting" ? (
            <>
              <RuleItem
                label="Household charge"
                value={
                  params.programFeeMonthly === 0
                    ? "No household charge"
                    : `${formatCurrency(params.programFeeMonthly)} per month`
                }
              />
              <RuleItem
                label="Eligible share of food waste"
                value={`${formatPercent(params.eligibleShare)} — a PolicyPulse assumption, not from the policy text`}
              />
              <RuleItem label="Collection" value={params.collectionFrequency} />
              <RuleItem
                label="Accepted materials"
                value={`${params.acceptedMaterials.length} listed`}
              />
            </>
          ) : null}

          {params.scenario === "recycling-incentive" ? (
            <>
              <RuleItem
                label="Reward rate"
                value={`${formatCurrency(params.rewardPerPound)} per lb credited`}
              />
              <RuleItem
                label="Monthly cap per household"
                value={
                  params.maxRewardPerHouseholdMonthly === null
                    ? "No cap"
                    : formatCurrency(params.maxRewardPerHouseholdMonthly)
                }
              />
              <RuleItem
                label="Baseline capture assumption"
                value={`${formatPercent(params.baselineCaptureRate)} — the programme's own no-incentive figure`}
              />
              <RuleItem label="Contamination rule" value={params.contaminationRule} />
            </>
          ) : null}
        </dl>

        <Callout tone="demo" compact>
          {policy.provenanceLabel} Editing a what-if value below changes your estimate
          only — it does not edit the policy.
        </Callout>
      </CardBody>
    </Card>
  );
}

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="pp-eyebrow">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Per-scenario what-if controls                                               */
/* -------------------------------------------------------------------------- */

function BagFeeControls() {
  const { assumptions, updateAssumptions, hydrated } = useAppStore();
  const a = assumptions["bag-fee"];
  const usingWhatIf = a.whatIfFeePerBag !== null;

  return (
    <>
      <RangeControl
        label="Share of trips using reusable bags"
        value={a.reusableBagAdoptionRate}
        onChange={(value) => updateAssumptions("bag-fee", { reusableBagAdoptionRate: value })}
        min={SLIDER_BOUNDS.reusableBagAdoptionRate.min}
        max={SLIDER_BOUNDS.reusableBagAdoptionRate.max}
        displayScale={100}
        suffix="%"
        whatIf
        disabled={!hydrated}
        help="0% means you take a disposable bag every time. 100% means you never need one. Real households sit in between."
      />

      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
        <Checkbox
          label="Explore a hypothetical fee instead of the policy's rate"
          help="Useful for asking “what if the fee were higher?”. The policy's own fee stays untouched."
          checked={usingWhatIf}
          disabled={!hydrated}
          onChange={(event) =>
            updateAssumptions("bag-fee", {
              whatIfFeePerBag: event.target.checked ? 0.25 : null,
            })
          }
        />

        {usingWhatIf ? (
          <RangeControl
            label="What-if fee per bag"
            value={a.whatIfFeePerBag ?? 0.25}
            onChange={(value) => updateAssumptions("bag-fee", { whatIfFeePerBag: value })}
            min={SLIDER_BOUNDS.whatIfFeePerBag.min}
            max={SLIDER_BOUNDS.whatIfFeePerBag.max}
            displayScale={100}
            suffix="¢"
            whatIf
            disabled={!hydrated}
            help="Hypothetical only. This is not a proposal, and no rate you set here exists anywhere."
          />
        ) : (
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-amber-900">
            <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              Using the policy’s own fee. Tick the box to explore a different rate
              without changing the policy.
            </span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Checkbox
          label="Include a one-time reusable bag purchase"
          help="Kept separate from the monthly figures and added into the first-year total."
          checked={a.includeReusableBagPurchaseCost}
          disabled={!hydrated}
          onChange={(event) =>
            updateAssumptions("bag-fee", {
              includeReusableBagPurchaseCost: event.target.checked,
            })
          }
        />
        {a.includeReusableBagPurchaseCost ? (
          <RangeControl
            label="Cost of a reusable bag set"
            value={a.reusableBagSetCost}
            onChange={(value) => updateAssumptions("bag-fee", { reusableBagSetCost: value })}
            min={SLIDER_BOUNDS.reusableBagSetCost.min}
            max={SLIDER_BOUNDS.reusableBagSetCost.max}
            suffix="$"
            whatIf
            disabled={!hydrated}
            help="An illustrative default assumed to last a year. Edit it to match what you would actually buy."
          />
        ) : null}
      </div>
    </>
  );
}

function CompostingControls() {
  const { assumptions, updateAssumptions, hydrated } = useAppStore();
  const a = assumptions.composting;
  const usingWhatIf = a.whatIfEligibleShare !== null;

  return (
    <>
      <RangeControl
        label="Share of eligible food waste you separate"
        value={a.participationRate}
        onChange={(value) => updateAssumptions("composting", { participationRate: value })}
        min={SLIDER_BOUNDS.participationRate.min}
        max={SLIDER_BOUNDS.participationRate.max}
        displayScale={100}
        suffix="%"
        whatIf
        disabled={!hydrated}
        help="This is about your kitchen habit, not about the programme. 0% means nothing is diverted."
      />

      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
        <Checkbox
          label="Override the eligible share of food waste"
          help="The policy text does not publish an eligible share, so PolicyPulse assumes one. Change it if you have better information."
          checked={usingWhatIf}
          disabled={!hydrated}
          onChange={(event) =>
            updateAssumptions("composting", {
              whatIfEligibleShare: event.target.checked ? 0.65 : null,
            })
          }
        />
        {usingWhatIf ? (
          <RangeControl
            label="What-if eligible share"
            value={a.whatIfEligibleShare ?? 0.65}
            onChange={(value) => updateAssumptions("composting", { whatIfEligibleShare: value })}
            min={SLIDER_BOUNDS.whatIfEligibleShare.min}
            max={SLIDER_BOUNDS.whatIfEligibleShare.max}
            displayScale={100}
            suffix="%"
            whatIf
            disabled={!hydrated}
            help="Excludes material the programme does not accept, such as yard waste and packaging."
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <Checkbox
          label="Include a one-time kitchen caddy or bin"
          help="Kept out of the monthly figures and added to the first-year total."
          checked={a.includeBinCost}
          disabled={!hydrated}
          onChange={(event) =>
            updateAssumptions("composting", { includeBinCost: event.target.checked })
          }
        />
        {a.includeBinCost ? (
          <RangeControl
            label="Cost of a caddy or bin"
            value={a.binCost}
            onChange={(value) => updateAssumptions("composting", { binCost: value })}
            min={SLIDER_BOUNDS.binCost.min}
            max={SLIDER_BOUNDS.binCost.max}
            suffix="$"
            whatIf
            disabled={!hydrated}
            help="An illustrative default. Check whether your programme supplies a bin before including this cost."
          />
        ) : null}
      </div>
    </>
  );
}

function RecyclingControls() {
  const { assumptions, updateAssumptions, hydrated } = useAppStore();
  const a = assumptions["recycling-incentive"];
  const usingWhatIf = a.whatIfRewardPerPound !== null;

  return (
    <>
      <RangeControl
        label="Share of your recyclables that reach the recycling stream"
        value={a.captureRate}
        onChange={(value) => updateAssumptions("recycling-incentive", { captureRate: value })}
        min={SLIDER_BOUNDS.captureRate.min}
        max={SLIDER_BOUNDS.captureRate.max}
        displayScale={100}
        suffix="%"
        whatIf
        disabled={!hydrated}
        help="Everything you generate but put in the general waste bin is not collected and earns nothing."
      />

      <RangeControl
        label="Contamination rate"
        value={a.contaminationRate}
        onChange={(value) =>
          updateAssumptions("recycling-incentive", { contaminationRate: value })
        }
        min={SLIDER_BOUNDS.contaminationRate.min}
        max={SLIDER_BOUNDS.contaminationRate.max}
        displayScale={100}
        suffix="%"
        whatIf
        disabled={!hydrated}
        help="Contaminated material is collected but not credited, so it earns nothing."
      />

      <RangeControl
        label="Recyclables generated per person per week"
        value={a.weeklyRecyclablesPerPersonLb}
        onChange={(value) =>
          updateAssumptions("recycling-incentive", { weeklyRecyclablesPerPersonLb: value })
        }
        min={SLIDER_BOUNDS.weeklyRecyclablesPerPersonLb.min}
        max={SLIDER_BOUNDS.weeklyRecyclablesPerPersonLb.max}
        suffix="lb"
        whatIf
        disabled={!hydrated}
        help="An illustrative default with no measured basis. Replace it with your own estimate if you have one."
      />

      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
        <Checkbox
          label="Explore a hypothetical reward rate"
          help="The policy's own rate stays untouched; this only changes your estimate."
          checked={usingWhatIf}
          disabled={!hydrated}
          onChange={(event) =>
            updateAssumptions("recycling-incentive", {
              whatIfRewardPerPound: event.target.checked ? 0.1 : null,
            })
          }
        />
        {usingWhatIf ? (
          <RangeControl
            label="What-if reward per lb"
            value={a.whatIfRewardPerPound ?? 0.1}
            onChange={(value) =>
              updateAssumptions("recycling-incentive", { whatIfRewardPerPound: value })
            }
            min={SLIDER_BOUNDS.whatIfRewardPerPound.min}
            max={SLIDER_BOUNDS.whatIfRewardPerPound.max}
            displayScale={100}
            suffix="¢"
            whatIf
            disabled={!hydrated}
          />
        ) : null}
      </div>
    </>
  );
}
