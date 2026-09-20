"use client";

import { useMemo, useState } from "react";
import { Bookmark, Filter, Search, SearchX, X } from "lucide-react";
import type { Jurisdiction, Policy, PolicyCategory, PolicyStatus } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { PolicyCard } from "@/components/policy/policy-card";
import { cn } from "@/lib/utils";

const STATUSES: PolicyStatus[] = ["in-effect", "adopted", "proposed"];
const CATEGORIES: PolicyCategory[] = ["bags", "organics", "recycling"];

type SortKey = "relevance" | "soonest" | "recent";

/**
 * Policy Explorer.
 *
 * Filtering happens client-side over the records the server already loaded, so
 * the list responds instantly. Search matches title, summary, tags, and the
 * "what changes" and "who is affected" text — not just the headline.
 */
export function PolicyExplorer({
  policies,
  jurisdictions,
}: {
  policies: Policy[];
  jurisdictions: Record<string, Jurisdiction>;
}) {
  const { bookmarks, hydrated } = useAppStore();

  const [text, setText] = useState("");
  const [statuses, setStatuses] = useState<PolicyStatus[]>([]);
  const [categories, setCategories] = useState<PolicyCategory[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  const toggle = <T,>(list: T[], value: T, setter: (next: T[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filtered = useMemo(() => {
    const needle = text.trim().toLowerCase();

    const matches = policies.filter((policy) => {
      if (statuses.length && !statuses.includes(policy.status)) return false;
      if (categories.length && !categories.includes(policy.category)) return false;
      if (savedOnly && !bookmarks.includes(policy.id)) return false;
      if (!needle) return true;

      const haystack = [
        policy.title,
        policy.shortTitle,
        policy.summary,
        policy.tags.join(" "),
        policy.whatChanges.join(" "),
        policy.whoIsAffected.join(" "),
        policy.whatYouCanDo.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    const sorted = [...matches];
    if (sort === "soonest") {
      sorted.sort((a, b) => {
        const aDate = a.keyDates[0]?.date ?? "9999-99-99";
        const bDate = b.keyDates[0]?.date ?? "9999-99-99";
        return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
      });
    } else if (sort === "recent") {
      sorted.sort((a, b) => b.keyDates.length - a.keyDates.length);
    }
    return sorted;
  }, [policies, text, statuses, categories, savedOnly, bookmarks, sort]);

  const activeFilterCount =
    statuses.length + categories.length + (savedOnly ? 1 : 0) + (text.trim() ? 1 : 0);

  const clearAll = () => {
    setText("");
    setStatuses([]);
    setCategories([]);
    setSavedOnly(false);
    setSort("relevance");
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        level="h1"
        eyebrow="Policy Explorer"
        title={`${policies.length} policies to explore`}
        description="Filter by status and category, or search the plain-language summaries. Every record is labelled with its provenance."
      />

      <div className="pp-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Field label="Search policies" help="Matches titles, summaries, tags and the detail text.">
            {(props) => (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                  aria-hidden="true"
                />
                <TextInput
                  {...props}
                  type="search"
                  placeholder="Try “compost”, “bags”, “renter”…"
                  value={text}
                  className="pl-9 pr-9"
                  onChange={(event) => setText(event.target.value)}
                />
                {text ? (
                  <button
                    type="button"
                    onClick={() => setText("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-paper-sunken hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            )}
          </Field>

          <div className="space-y-3">
            <div>
              <p className="pp-eyebrow mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <FilterChip
                    key={status}
                    active={statuses.includes(status)}
                    onClick={() => toggle(statuses, status, setStatuses)}
                    label={STATUS_LABELS[status]}
                    count={policies.filter((p) => p.status === status).length}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="pp-eyebrow mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <FilterChip
                    key={category}
                    active={categories.includes(category)}
                    onClick={() => toggle(categories, category, setCategories)}
                    label={CATEGORY_LABELS[category]}
                    count={policies.filter((p) => p.category === category).length}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FilterChip
                active={savedOnly}
                onClick={() => setSavedOnly((v) => !v)}
                label="Saved only"
                icon={<Bookmark className="h-3 w-3" aria-hidden="true" />}
                count={hydrated ? bookmarks.length : undefined}
                disabled={!hydrated}
              />
              <label className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="font-semibold">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-8 rounded-lg border border-paper-line bg-paper-raised px-2 text-xs text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                >
                  <option value="relevance">Most binding first</option>
                  <option value="soonest">Earliest date</option>
                  <option value="recent">Most detail</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-paper-line pt-3">
          <p className="flex items-center gap-2 text-xs text-ink-soft" aria-live="polite">
            <Filter className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            <span>
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
              {policies.length} policies
              {activeFilterCount > 0
                ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active`
                : ""}
            </span>
          </p>
          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearAll} icon={<X className="h-3.5 w-3.5" />}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        policies.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-5 w-5" />}
            title="No policies available"
            description="No policy records were returned for this location. That is an honest empty state — PolicyPulse does not invent policies to fill the gap."
          />
        ) : (
          <EmptyState
            tone="filtered"
            icon={<SearchX className="h-5 w-5" />}
            title="No policies match those filters"
            description={
              savedOnly && bookmarks.length === 0
                ? "You have not saved any policies yet. Save one from a card, or clear the filter."
                : "Try removing a filter or searching for a different term."
            }
            action={
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            }
          />
        )
      ) : (
        <>
          {/* The page h1 is "N policies to explore"; each card below contributes an
              h3. Without a level-2 heading between them, heading navigation skipped
              straight from 1 to 3. This label closes the gap and names the list. */}
          <h2 className="pp-sr-only">Matching policies</h2>
          <ul className="grid gap-4 xl:grid-cols-2">
            {filtered.map((policy) => (
              <li key={policy.id} className="flex">
                <PolicyCard
                  policy={policy}
                  jurisdiction={jurisdictions[policy.jurisdictionId] ?? null}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-editorial",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        active
          ? "border-forest-400 bg-forest-800 text-paper-raised"
          : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink",
      )}
    >
      {icon}
      {label}
      {typeof count === "number" ? (
        <Badge tone={active ? "ink" : "neutral"} compact className="ml-0.5">
          {count}
        </Badge>
      ) : null}
    </button>
  );
}
