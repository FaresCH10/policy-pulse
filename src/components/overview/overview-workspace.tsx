"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Compass,
  Info,
  MapPin,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { Jurisdiction, Policy } from "@/lib/types";
import type { UpcomingDate } from "@/lib/policy-utils";
import { DEMO_CITY } from "@/lib/constants";
import { COMPOSTING_AVAILABILITY_LABELS, TENURE_LABELS } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/accordion";
import { Callout, PageSkeleton, SectionHeading } from "@/components/ui/misc";
import { PolicyCard } from "@/components/policy/policy-card";
import { HouseholdForm } from "@/components/setup/household-form";
import { LocationSetup } from "@/components/setup/location-setup";
import {
  HouseholdSummaryStats,
  ScenarioImpactList,
} from "@/components/dashboard/scenario-impact";
import { UpcomingDates } from "@/components/dashboard/upcoming-dates";
import { DataStatusPanel } from "@/components/dashboard/data-status-panel";

export interface OverviewWorkspaceProps {
  policies: Policy[];
  jurisdictions: Record<string, Jurisdiction>;
  upcoming: UpcomingDate[];
  todayIso: string;
  providerId: string;
  providerLabel: string;
  isDemoProvider: boolean;
}

export function OverviewWorkspace(props: OverviewWorkspaceProps) {
  const { hydrated, location } = useAppStore();

  if (!hydrated) {
    return <PageSkeleton label="Loading your household snapshot" />;
  }

  if (!((location.status === "demo" && props.isDemoProvider) || (location.status === "live" && !props.isDemoProvider && props.jurisdictions[location.jurisdictionId]))) {
    return <SetupStage {...props} />;
  }

  return <DashboardStage {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Stage 1 — no location yet, or a location we do not cover                    */
/* -------------------------------------------------------------------------- */

function SetupStage({ policies, jurisdictions, isDemoProvider, providerLabel }: OverviewWorkspaceProps) {
  const { location } = useAppStore();
  const jurisdictionList = Object.values(jurisdictions);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="pp-eyebrow">Earth Forward · waste &amp; recycling</p>
        <h1 className="pp-display mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          See how a local environmental policy could land in your household
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Pick a place, add a few household details, and PolicyPulse will walk you
          through what a policy changes, what it could cost or save you, and what you
          can do next. No account, no credentials, and nothing you type leaves this
          browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            icon={<MapPin className="h-4 w-4" />}
            eyebrow="Step 1"
            title="Choose where to explore"
            description={isDemoProvider ? "The demonstration city is fictional and clearly labelled." : "Explore the available coverage. Policies apply where you shop or use a service."}
          />
          <CardBody className="pt-4">
            <LocationSetup jurisdictions={Object.values(jurisdictions)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={<Compass className="h-4 w-4" />}
            eyebrow={isDemoProvider ? "What is inside the demo" : "Available coverage"}
            title={`${policies.length} ${isDemoProvider ? "illustrative" : "sourced"} ${policies.length === 1 ? "policy" : "policies"} to explore`}
            description="Enough to complete the whole journey: understand a policy, personalise it, simulate it, and act on it."
          />
          <CardBody className="space-y-3 pt-4">
            <ul className="space-y-2">
              {policies.map((policy) => (
                <li key={policy.id}>
                  <Link
                    href={`/policies/${policy.id}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-paper-line bg-paper-raised px-3.5 py-2.5 transition-colors hover:border-forest-200 hover:bg-forest-50/40 focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {policy.shortTitle}
                      </span>
                      <span className="mt-0.5 block text-2xs text-ink-faint">
                        {jurisdictions[policy.jurisdictionId]?.name ?? "Unknown"}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-ink-faint"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <Callout tone="demo" compact>
              {isDemoProvider ? "Every policy, date and contact here is fictional." : providerLabel}
            </Callout>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone="outline">{jurisdictionList.length} {jurisdictionList.length === 1 ? "jurisdiction" : "jurisdictions"}</Badge>
              <Badge tone="outline">{new Set(policies.map(p => p.scenario)).size} {new Set(policies.map(p => p.scenario)).size === 1 ? "scenario" : "scenarios"}</Badge>
              <Badge tone="outline">No sign-in required</Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {location.status === "unsupported" && isDemoProvider ? (
        <Callout tone="warning" title="You are currently on an uncovered location">
          <p>
            PolicyPulse will not show {DEMO_CITY.name}’s policies as if they applied to
            “{location.query}”. Use the demonstration city button above to explore the
            demo deliberately.
          </p>
        </Callout>
      ) : null}

      <Card>
        <CardHeader
          icon={<Sparkles className="h-4 w-4" />}
          eyebrow="How it works"
          title="Four steps, all on this device"
        />
        <CardBody className="pt-4">
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                step: "1",
                title: "Understand",
                body: "Read each policy in plain language: what changes, who it affects, and what is still uncertain.",
              },
              {
                step: "2",
                title: "Personalise",
                body: "Six household details, each with a reason why it is needed. No account required.",
              },
              {
                step: "3",
                title: "Simulate",
                body: "Move a slider and see the maths update, with every formula and assumption visible.",
              },
              {
                step: "4",
                title: "Act",
                body: "Checklists, questions to ask, getting-started guides, and a comment draft you copy yourself.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-800 text-2xs font-semibold text-paper-raised">
                  {item.step}
                </span>
                <p className="mt-2 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — the personalised dashboard                                        */
/* -------------------------------------------------------------------------- */

function DashboardStage({
  policies,
  jurisdictions,
  upcoming,
  todayIso,
  providerId,
  providerLabel,
  isDemoProvider,
}: OverviewWorkspaceProps) {
  const { profile, bookmarks, hasAnyData, location } = useAppStore();
  const [showAllPolicies, setShowAllPolicies] = useState(false);

  const sortedForHousehold = useMemo(() => {
    // Bookmarked policies first, then the rest in their existing order.
    return [...policies].sort((a, b) => {
      const aSaved = bookmarks.includes(a.id) ? 0 : 1;
      const bSaved = bookmarks.includes(b.id) ? 0 : 1;
      return aSaved - bSaved;
    });
  }, [policies, bookmarks]);

  const visiblePolicies = showAllPolicies
    ? sortedForHousehold
    : sortedForHousehold.slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="pp-eyebrow">Overview</p>
            <h1 className="pp-display mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Your household snapshot
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Estimates use your household profile and your saved simulator settings.
              Every figure can be traced back to a formula in the simulator.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <LinkButton
              href="/simulator"
              variant="primary"
              icon={<Settings2 className="h-4 w-4" />}
            >
              Open simulator
            </LinkButton>
            <LinkButton href="/policies" variant="outline">
              All policies
            </LinkButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="forest" icon={<MapPin className="h-3 w-3" />}>
            {isDemoProvider ? `${DEMO_CITY.name} · fictional demonstration city` : location.status === "live" ? jurisdictions[location.jurisdictionId]?.name : "Covered location"}
          </Badge>
          <Badge tone="amber" icon={<Info className="h-3 w-3" />}>
            {isDemoProvider ? "Illustrative data · not a live feed" : "Official sources · see review dates"}
          </Badge>
          <Badge tone="outline" icon={<ShieldCheck className="h-3 w-3" />}>
            Stored on this device only
          </Badge>
          {bookmarks.length > 0 ? (
            <Badge tone="teal">{bookmarks.length} saved</Badge>
          ) : null}
        </div>

        {!hasAnyData ? (
          <Callout tone="info" compact title="Everything below is ready to explore">
            You can browse without setting anything up. Add household details whenever
            you want the numbers to reflect your own situation.
          </Callout>
        ) : null}
      </header>

      <section aria-labelledby="summary-heading" className="space-y-3">
        <SectionHeading
          id="summary-heading"
          eyebrow="At a glance"
          title="What this adds up to for you"
          description="Only in-effect and adopted policies are counted in the headline figures. Proposed policies are shown separately."
        />
        <HouseholdSummaryStats policies={policies} />
      </section>

      <section aria-labelledby="scenario-heading" className="space-y-3">
        <SectionHeading
          id="scenario-heading"
          eyebrow="By scenario"
          title="Impact of each policy area"
          description="Pick a scenario to open the simulator with your numbers already loaded."
        />
        <ScenarioImpactList policies={policies} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="policies-heading" className="space-y-3">
          <SectionHeading
            id="policies-heading"
            eyebrow="Policy Explorer"
            title={bookmarks.length > 0 ? "Your policies, saved first" : "Policies for your location"}
            action={
              <LinkButton href="/policies" variant="ghost" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
                View all
              </LinkButton>
            }
          />
          <div className="grid gap-4">
            {visiblePolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                jurisdiction={jurisdictions[policy.jurisdictionId] ?? null}
              />
            ))}
          </div>
          {!showAllPolicies && sortedForHousehold.length > 3 ? (
            <Button variant="outline" onClick={() => setShowAllPolicies(true)}>
              Show all {sortedForHousehold.length} policies
            </Button>
          ) : null}
        </section>

        <div className="space-y-6">
          <UpcomingDates upcoming={upcoming} todayIso={todayIso} />

          <Card>
            <CardHeader
              icon={<UserRound className="h-4 w-4" />}
              eyebrow="Personalisation"
              title="Your household details"
              description="These six values drive every personalised estimate in the app."
            />
            <CardBody className="pt-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <ProfileRow label="People" value={formatNumber(profile.householdSize, 0)} />
                <ProfileRow label="Tenure" value={TENURE_LABELS[profile.tenure]} />
                <ProfileRow
                  label="Grocery trips"
                  value={`${formatNumber(profile.groceryTripsPerWeek, 1)} / week`}
                />
                <ProfileRow
                  label="Bags per trip"
                  value={formatNumber(profile.bagsPerTrip, 1)}
                />
                <ProfileRow
                  label="Food waste"
                  value={`${formatNumber(profile.weeklyFoodWasteLb, 1)} lb / week`}
                />
                <ProfileRow
                  label="Composting"
                  value={COMPOSTING_AVAILABILITY_LABELS[profile.compostingAvailable]}
                />
              </dl>

              <div className="mt-4">
                <Disclosure summary="Edit household details" icon={<Settings2 className="h-4 w-4" />}>
                  <HouseholdForm />
                </Disclosure>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <DataStatusPanel
        providerId={providerId}
        providerLabel={providerLabel}
        isDemoProvider={isDemoProvider}
        policyCount={policies.length}
        jurisdictionCount={Object.keys(jurisdictions).length}
      />
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
