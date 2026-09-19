"use client";

import type { Jurisdiction } from "@/lib/types";
import { useAppMode } from "@/state/runtime-context";
import { useState } from "react";
import { Building2, Check, MapPin, Search, TriangleAlert } from "lucide-react";
import { DEMO_CITY, DISCLAIMERS } from "@/lib/constants";
import { resolveDemoLocation, unsupportedLocationNote } from "@/lib/data/jurisdictions";
import { locationQuerySchema, toFieldErrors } from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { Callout } from "@/components/ui/misc";

/**
 * Location entry.
 *
 * The core rule: a real place is never silently replaced with the demo city.
 * If the query does not resolve, the user is told coverage is unavailable and
 * offered the demonstration city as an explicit, separately-labelled choice.
 */
export function LocationSetup({ onResolved, jurisdictions = [] }: { onResolved?: () => void; jurisdictions?: Jurisdiction[] }) {
  const mode = useAppMode();
  const { location, setLocation, hydrated } = useAppStore();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [justResolved, setJustResolved] = useState<"demo" | "unsupported" | null>(null);

  const useDemoCity = () => {
    setError(undefined);
    setLocation({
      status: "demo",
      query: DEMO_CITY.name,
      jurisdictionId: "cedar-hollow",
    });
    setJustResolved("demo");
    onResolved?.();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = locationQuerySchema.safeParse({ query });
    if (!parsed.success) {
      setError(toFieldErrors(parsed.error).query);
      return;
    }
    setError(undefined);

    if (mode === "live") {
      const q = parsed.data.query.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = jurisdictions.find(j => [j.name, j.id, j.region, ...j.postalCodes].some(v => v.toLowerCase().replace(/[^a-z0-9]/g, "") === q));
      setLocation(match ? { status: "live", query: match.name, jurisdictionId: match.id } : { status: "unsupported", query: parsed.data.query, coverageNote: "This location is not in our current coverage. Select an available jurisdiction below." });
      onResolved?.();
      return;
    }
    const match = resolveDemoLocation(parsed.data.query);
    if (match) {
      setLocation({
        status: "demo",
        query: parsed.data.query,
        jurisdictionId: match.id,
      });
      setJustResolved("demo");
    } else {
      // Explicitly not substituting demo policies for a real location.
      setLocation({
        status: "unsupported",
        query: parsed.data.query,
        coverageNote: unsupportedLocationNote(parsed.data.query),
      });
      setJustResolved("unsupported");
    }
    onResolved?.();
  };

  const unsupported = location.status === "unsupported" ? location : null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <Field
          label="Where do you want to explore policies?"
          help={mode === "demo" ? "Try the demonstration city, or check a city or ZIP code." : "Search an exact covered jurisdiction name or a supported postal code."}
          error={error}
          hint={mode === "demo" ? `Demo city: ${DEMO_CITY.name} (postal code ${DEMO_CITY.postalCode})` : "Coverage is limited to the jurisdictions listed below."}
        >
          {(fieldProps) => (
            <div className="flex flex-col gap-2 sm:flex-row">
              <TextInput
                {...fieldProps}
                type="text"
                name="location"
                autoComplete="postal-code"
                placeholder="City name or ZIP code"
                value={query}
                invalid={Boolean(error)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (error) setError(undefined);
                }}
              />
              <Button type="submit" icon={<Search className="h-4 w-4" />} className="sm:w-auto">
                Check coverage
              </Button>
            </div>
          )}
        </Field>
      </form>

      {mode === "demo" ? <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useDemoCity}
          icon={<Building2 className="h-3.5 w-3.5" />}
          disabled={!hydrated}
        >
          Use the demonstration city
        </Button>
        <span className="text-2xs text-ink-faint">
          Labelled as illustrative wherever it appears.
        </span>
      </div> : <div className="space-y-3">{jurisdictions.map(j => <div key={j.id} className="rounded-xl border border-paper-line p-3"><Button disabled={!hydrated} variant="outline" size="sm" onClick={() => { setLocation({ status: "live", query: j.name, jurisdictionId: j.id }); onResolved?.(); }}>Explore {j.name}</Button><p className="mt-2 text-xs text-ink-soft">{j.coverageNote}</p></div>)}</div>}

      {justResolved === "demo" ? (
        <Callout tone="success" compact title="Demonstration city selected">
          You are exploring {DEMO_CITY.label}. {DISCLAIMERS.policies}
        </Callout>
      ) : null}

      {unsupported ? (
        <Callout tone="warning" title="Coverage unavailable for that location">
          <p>{unsupported.coverageNote}</p>
          {mode === "demo" ? <><div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={useDemoCity}
              icon={<Check className="h-3.5 w-3.5" />}
            >
              Explore the demonstration city instead
            </Button>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-xs">
            <TriangleAlert className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              Choosing the demo city is a deliberate switch, not a substitution —
              the data status will keep saying “demo” for as long as you use it.
            </span>
          </p></> : null}
        </Callout>
      ) : null}

      <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
        <MapPin className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span>
          Your location is stored only in this browser. PolicyPulse does not send
          it anywhere, and there is no account to sign in to.
        </span>
      </p>
    </div>
  );
}
