"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Calculator,
  CircleAlert,
  CircleHelp,
  Info,
  Landmark,
  ListChecks,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import type {
  CommunityStory,
  Jurisdiction,
  OfficialContact,
  Policy,
  Source,
} from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/labels";
import { DISCLAIMERS } from "@/lib/constants";
import { formatByUnit, formatDate, formatSignedCurrency } from "@/lib/format";
import { runSimulation, SCENARIO_META } from "@/lib/simulation";
import { primaryDate } from "@/lib/policy-utils";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout, EmptyState } from "@/components/ui/misc";
import { Disclosure } from "@/components/ui/accordion";
import { PolicyStatusBadge, STATUS_CONFIG } from "./status-badge";
import { SourceNote, SourceList } from "./source-note";
import { BookmarkButton } from "./bookmark-button";

export function PolicyDetail({
  policy,
  jurisdiction,
  sources,
  stories,
  contacts,
}: {
  policy: Policy;
  jurisdiction: Jurisdiction | null;
  sources: Source[];
  stories: CommunityStory[];
  contacts: OfficialContact[];
}) {
  const { profile, assumptions, hydrated } = useAppStore();
  const date = primaryDate(policy);
  const meta = SCENARIO_META[policy.scenario];

  const result = hydrated ? runSimulation(policy, profile, assumptions) : null;

  return (
    <div className="space-y-8">
      <div className="pp-no-print">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All policies
        </Link>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <PolicyStatusBadge status={policy.status} />
          <Badge tone="outline">{CATEGORY_LABELS[policy.category]}</Badge>
          <Badge tone="teal">{meta.short} scenario</Badge>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="pp-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {policy.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
              {policy.summary}
            </p>
          </div>
          <div className="pp-no-print flex shrink-0 flex-wrap gap-2">
            <BookmarkButton
              policyId={policy.id}
              policyTitle={policy.shortTitle}
              variant="full"
            />
            <LinkButton
              href={`/simulator?policy=${policy.id}`}
              icon={<Calculator className="h-4 w-4" />}
            >
              Simulate this
            </LinkButton>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-paper-line bg-paper-raised px-4 py-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem
            icon={<Landmark className="h-3.5 w-3.5" />}
            label="Jurisdiction"
            value={jurisdiction?.name ?? "Unknown"}
            hint={jurisdiction ? `${jurisdiction.level} · ${jurisdiction.region}` : undefined}
          />
          <MetaItem
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label={date?.label ?? "Key date"}
            value={date ? formatDate(date.date) : "Not stated"}
            hint={date?.note}
          />
          <MetaItem
            icon={<Users className="h-3.5 w-3.5" />}
            label="Who is affected"
            value={`${policy.whoIsAffected.length} groups listed`}
            hint={policy.whoIsAffected[0]}
          />
          <MetaItem
            icon={<Info className="h-3.5 w-3.5" />}
            label="Status"
            value={STATUS_CONFIG[policy.status].label}
            hint={STATUS_CONFIG[policy.status].explanation}
          />
        </div>

        <SourceNote policy={policy} />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Personalised impact                                               */}
      {/* ---------------------------------------------------------------- */}
      <Card className="border-teal-200 bg-teal-50/40">
        <CardHeader
          icon={<Sparkles className="h-4 w-4" />}
          eyebrow="How could this affect me?"
          title="Your household estimate"
          description="Computed from your profile and your saved simulator settings. Nothing here is a prediction about the real world."
        />
        <CardBody className="space-y-4 pt-4">
          {!hydrated || !result ? (
            <div className="space-y-2" role="status" aria-live="polite">
              <span className="pp-sr-only">Calculating your estimate</span>
              <span className="pp-skeleton block h-4 w-full rounded" />
              <span className="pp-skeleton block h-4 w-2/3 rounded" />
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink">{result.narrative}</p>

              <dl className="grid gap-3 sm:grid-cols-3">
                <MiniStat
                  label="Cost change / month"
                  value={formatSignedCurrency(result.headline.monthlyCostChange)}
                  tone={
                    result.headline.monthlyCostChange < -0.005
                      ? "positive"
                      : result.headline.monthlyCostChange > 0.005
                        ? "negative"
                        : "muted"
                  }
                />
                <MiniStat
                  label={result.headline.primaryImpactLabel}
                  value={formatByUnit(result.headline.primaryImpactMonthly, result.headline.primaryImpactUnit, 1)}
                />
                <MiniStat
                  label="Same, per year"
                  value={formatByUnit(result.headline.primaryImpactAnnual, result.headline.primaryImpactUnit, 1)}
                />
              </dl>

              {result.warnings.length > 0 ? (
                <Callout tone="warning" compact title="Things to keep in mind">
                  <ul className="list-disc space-y-1 pl-4">
                    {result.warnings.slice(0, 3).map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </Callout>
              ) : null}

              <div className="pp-no-print flex flex-wrap gap-2">
                <LinkButton
                  href={`/simulator?policy=${policy.id}`}
                  size="sm"
                  icon={<Calculator className="h-3.5 w-3.5" />}
                >
                  Change the inputs
                </LinkButton>
                <LinkButton
                  href={`/impact-summary?policy=${policy.id}`}
                  size="sm"
                  variant="outline"
                  iconRight={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Printable summary
                </LinkButton>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* What changes                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection
          icon={<Info className="h-4 w-4" />}
          title="What changes?"
          items={policy.whatChanges}
        />
        <DetailSection
          icon={<Users className="h-4 w-4" />}
          title="Who is affected?"
          items={policy.whoIsAffected}
        />
        <DetailSection
          icon={<ListChecks className="h-4 w-4" />}
          title="What can I do?"
          items={policy.whatYouCanDo}
          footer={
            <LinkButton
              href={`/actions?policy=${policy.id}`}
              size="sm"
              variant="outline"
              className="pp-no-print"
              iconRight={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Open the Action Center
            </LinkButton>
          }
        />
        <DetailSection
          icon={<CircleHelp className="h-4 w-4" />}
          title="What assumptions or uncertainties should I know?"
          items={policy.uncertainties}
          tone="amber"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Key dates                                                         */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader
          icon={<CalendarDays className="h-4 w-4" />}
          eyebrow="Timeline"
          title="Key dates"
          description={policy.isDemo ? "Illustrative dates, not real deadlines." : "Dates from the cited sources. Confirm any deadlines with the issuing authority."}
        />
        <CardBody className="pt-4">
          {policy.keyDates.length === 0 ? (
            <EmptyState
              title="No dates recorded"
              description="This record does not state any dates, so none are shown. PolicyPulse does not estimate dates it does not have."
            />
          ) : (
            <ol className="relative space-y-4 border-l border-paper-line pl-5">
              {policy.keyDates.map((entry) => (
                <li key={`${entry.label}-${entry.date}`} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper-raised bg-forest-600"
                  />
                  <p className="text-sm font-semibold text-ink">{entry.label}</p>
                  <p className="text-xs tabular-nums text-ink-soft">
                    {formatDate(entry.date)}
                  </p>
                  {entry.note ? (
                    <p className="mt-0.5 text-2xs text-ink-faint">{entry.note}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Community                                                         */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader
          icon={<Quote className="h-4 w-4" />}
          eyebrow="Community perspectives"
          title="How this lands for other households"
          description={policy.isDemo ? DISCLAIMERS.stories : "Your own perspectives stay private on your device."}
          actions={
            <LinkButton href={`/community?policy=${policy.id}`} variant="ghost" size="sm" className="pp-no-print">
              See all
            </LinkButton>
          }
        />
        <CardBody className="pt-4">
          {stories.length === 0 ? (
            <EmptyState
              title="No perspectives yet"
              description="No stories are attached to this policy. You can add your own on the Community page — it stays on this device."
              action={
                <LinkButton href="/community" size="sm" variant="outline" className="pp-no-print">
                  Add a perspective
                </LinkButton>
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {stories.slice(0, 4).map((story) => (
                <li
                  key={story.id}
                  className="rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="amber" compact>
                      Fictional example
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">{story.headline}</p>
                  <p className="text-2xs text-ink-faint">{story.contextLabel}</p>
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-ink-soft">
                    {story.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Contacts                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader
          icon={<Landmark className="h-4 w-4" />}
          eyebrow="Who to contact"
          title="Official contacts"
          description={policy.isDemo ? DISCLAIMERS.contacts : "Original policy sources and agency guidance."}
        />
        <CardBody className="pt-4">
          <ul className="space-y-2">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-paper-line bg-paper-raised px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{contact.label}</p>
                  <p className="break-all text-xs text-ink-soft">{contact.verified && contact.channel === "web" ? <a className="pp-link" href={contact.value} target="_blank" rel="noopener noreferrer">Open official source ↗</a> : contact.value}</p>
                </div>
                <Badge tone={contact.verified ? "forest" : "amber"} compact>
                  {contact.verified ? "Verified official link" : "Example only"}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
            <CircleAlert className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {policy.isDemo ? "Demo contacts are fictional and cannot reach a real person." : "Use the official source for current contact details and the full policy text."}
            </span>
          </p>
        </CardBody>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Sources                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader
          icon={<Landmark className="h-4 w-4" />}
          eyebrow="Provenance"
          title="Sources for this policy"
          description="Verified policies link straight to the official document, with its jurisdiction and retrieval date. Illustrative records say so plainly."
        />
        <CardBody className="pt-4">
          <SourceList sources={sources} />

          <div className="pp-no-print mt-4">
            <Disclosure summary="How to read these citations">
              <p>
                A verified record carries the official document title, the jurisdiction
                that issued it, a direct link, the publication date, and the date
                PolicyPulse retrieved it. Legal requirements are labelled{" "}
                <span className="font-semibold">Legal text</span>; PolicyPulse’s own
                plain-language rewording is labelled{" "}
                <span className="font-semibold">Explanatory summary</span>. The two are
                never merged into one unattributed block.
              </p>
            </Disclosure>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

function MetaItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-faint">
        <span aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 line-clamp-2 text-2xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
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
    <div className="rounded-xl border border-teal-100 bg-paper-raised px-3.5 py-2.5">
      <dt className="pp-eyebrow">{label}</dt>
      <dd className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  items,
  footer,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  footer?: React.ReactNode;
  tone?: "default" | "amber";
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader icon={icon} title={title} />
      <CardBody className="flex-1 pt-4">
        {items.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing recorded for this policy.</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                <span
                  aria-hidden="true"
                  className={
                    tone === "amber"
                      ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                      : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500"
                  }
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </CardBody>
    </Card>
  );
}
