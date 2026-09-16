"use client";

import { useState } from "react";
import {
  Database,
  HardDrive,
  RotateCcw,
  Server,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { DISCLAIMERS } from "@/lib/constants";
import { useAppStore } from "@/state/app-store";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/misc";
import { Disclosure, DisclosureGroup } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

/**
 * Data status, provenance model, and the visitor's own data controls.
 *
 * This panel is the honest answer to "where does this come from?" — it names the
 * active provider, explains the provenance fields, states what is *not* covered,
 * and gives one-click ways to undo everything stored locally.
 */
export function DataStatusPanel({
  providerId,
  providerLabel,
  isDemoProvider,
  policyCount,
  jurisdictionCount,
}: {
  providerId: string;
  providerLabel: string;
  isDemoProvider: boolean;
  policyCount: number;
  jurisdictionCount: number;
}) {
  const {
    storageStatus,
    resetProfile,
    resetAllAssumptions,
    clearChecklist,
    resetEverything,
    hydrated,
  } = useAppStore();
  const [confirming, setConfirming] = useState(false);

  return (
    <Card>
      <CardHeader
        icon={<Database className="h-4 w-4" />}
        eyebrow="Data & privacy"
        title="Where this information comes from"
        description="PolicyPulse is explicit about the difference between verified policy data and illustrative demonstration content."
      />
      <CardBody className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isDemoProvider ? "amber" : "forest"} icon={<Server className="h-3 w-3" />}>
            Provider: {providerId}
          </Badge>
          <Badge tone="outline">{policyCount} policy records</Badge>
          <Badge tone="outline">{jurisdictionCount} jurisdictions</Badge>
          <Badge tone={storageStatus === "ok" ? "forest" : "clay"} icon={<HardDrive className="h-3 w-3" />}>
            {storageStatus === "ok"
              ? "Local storage available"
              : storageStatus === "quota"
                ? "Local storage full"
                : "Local storage unavailable"}
          </Badge>
        </div>

        <Callout tone={isDemoProvider ? "demo" : "info"} title={providerLabel}>
          {isDemoProvider ? (
            <p>
              {DISCLAIMERS.global} The demonstration city, its programmes, dates,
              costs and contacts are all fictional.
            </p>
          ) : (
            <p>
              A verified feed is configured. PolicyPulse still shows the retrieval
              date and jurisdiction for every record, and still separates legal text
              from its own explanatory summaries.
            </p>
          )}
        </Callout>

        <DisclosureGroup>
          <Disclosure
            summary="How provenance is recorded"
            icon={<ShieldCheck className="h-4 w-4" />}
          >
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-mono text-xs text-ink">isDemo</span> — true
                whenever a record is fictional. Every record that carries it is
                labelled in the interface.
              </li>
              <li>
                <span className="font-mono text-xs text-ink">sourceUrl</span> and{" "}
                <span className="font-mono text-xs text-ink">retrievedAt</span> — only
                populated for real, checkable documents, together with the
                jurisdiction that issued them.
              </li>
              <li>
                <span className="font-mono text-xs text-ink">effectiveDate</span> and
                the other key dates — shown as dates with an explicit label, never as
                a vague “coming soon”.
              </li>
              <li>
                <span className="font-mono text-xs text-ink">assumptions</span> and{" "}
                <span className="font-mono text-xs text-ink">methodology</span> — every
                number used by a calculation is listed in the simulator’s “How this is
                calculated” section with its source tagged as policy, household,
                illustrative, or what-if.
              </li>
            </ul>
          </Disclosure>

          <Disclosure summary="What this build does not cover">
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              <li>No live or verified policy feed is connected.</li>
              <li>
                No real city is covered. Entering one returns “coverage unavailable”
                rather than demo policies.
              </li>
              <li>
                No emissions, health, temperature or tonnage effects are modelled.
                Only the formulas shown in the simulator are used.
              </li>
              <li>No accounts, no server-side storage, no analytics.</li>
            </ul>
          </Disclosure>

          <Disclosure summary="Adding verified policies later">
            <p className="text-sm">
              Set <span className="font-mono text-xs text-ink">POLICY_FEED_URL</span>{" "}
              and{" "}
              <span className="font-mono text-xs text-ink">
                POLICY_FEED_JURISDICTION_ID
              </span>{" "}
              to point at a JSON feed matching the{" "}
              <span className="font-mono text-xs text-ink">PolicyProvider</span>{" "}
              schema. The HTTP adapter validates every record before it is rendered,
              and falls back to the bundled demo provider if the feed is
              misconfigured or unreachable. No component needs to change.
            </p>
          </Disclosure>

          <Disclosure summary="Optional AI summaries" icon={<ShieldCheck className="h-4 w-4" />}>
            <p className="text-sm">
              Server-side summarisation is supported but not enabled here. When no key
              is configured the feature is hidden entirely rather than showing a button
              that fails. If enabled, it would run only on the server, be grounded in
              the supplied source text, always keep the original source link, and fall
              back to the raw text when unavailable. The demo never depends on it.
            </p>
          </Disclosure>
        </DisclosureGroup>

        <div className="rounded-xl border border-paper-line bg-paper-sunken/50 p-3.5">
          <p className="text-sm font-semibold text-ink">Your data on this device</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Household details, simulator settings, saved policies, checklists and any
            demo stories live only in this browser. There is no account and nothing is
            uploaded. Resetting is immediate and cannot be undone.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetProfile}
              disabled={!hydrated}
            >
              Reset household profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetAllAssumptions}
              disabled={!hydrated}
            >
              Reset simulator settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={clearChecklist}
              disabled={!hydrated}
            >
              Clear checklists
            </Button>
            {confirming ? (
              <span className="flex flex-wrap items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => {
                    resetEverything();
                    setConfirming(false);
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => setConfirming(true)}
                disabled={!hydrated}
              >
                Delete all my demo data
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
