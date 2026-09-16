"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, Quote, SearchX, Users } from "lucide-react";
import type { CommunityStory, PerspectiveKind, Policy } from "@/lib/types";
import { PERSPECTIVE_LABELS } from "@/lib/data/community";
import { DISCLAIMERS } from "@/lib/constants";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { Callout, EmptyState, PageSkeleton, SectionHeading } from "@/components/ui/misc";
import { StoryCard } from "./story-card";
import { StoryForm } from "./story-form";
import { ScenarioCompare } from "./scenario-compare";
import { cn } from "@/lib/utils";

const PERSPECTIVES: PerspectiveKind[] = ["positive", "challenge", "suggestion"];

export function CommunityWorkspace({
  policies,
  seedStories,
  initialPolicyId,
}: {
  policies: Policy[];
  seedStories: CommunityStory[];
  initialPolicyId?: string;
}) {
  const { stories: userStories, removeStory, hydrated } = useAppStore();

  const [policyFilter, setPolicyFilter] = useState<string>(initialPolicyId ?? "all");
  const [perspectiveFilter, setPerspectiveFilter] = useState<PerspectiveKind | "all">("all");
  const [mineOnly, setMineOnly] = useState(false);

  const policyTitles = useMemo(
    () => Object.fromEntries(policies.map((p) => [p.id, p.shortTitle])),
    [policies],
  );

  const allStories = useMemo(
    () => [...userStories, ...seedStories],
    [userStories, seedStories],
  );

  const filtered = useMemo(
    () =>
      allStories.filter((story) => {
        if (policyFilter !== "all" && story.policyId !== policyFilter) return false;
        if (perspectiveFilter !== "all" && story.perspective !== perspectiveFilter) return false;
        if (mineOnly && !story.isUserSubmitted) return false;
        return true;
      }),
    [allStories, policyFilter, perspectiveFilter, mineOnly],
  );

  if (!hydrated) {
    return <PageSkeleton label="Loading community perspectives" />;
  }

  const filtersActive =
    policyFilter !== "all" || perspectiveFilter !== "all" || mineOnly;

  return (
    <div className="space-y-8">
      <SectionHeading
        level="h1"
        eyebrow="Community"
        title="How a policy lands depends on the household"
        description="Storage space, building type, household size and available services all change the outcome. These comparisons run the same formulas with different inputs, so you can see the arithmetic rather than an opinion."
      />

      <Callout tone="demo" title="Everything on this page is illustrative">
        {DISCLAIMERS.stories} Any note you add is stored only in this browser and is
        never published.
      </Callout>

      <ScenarioCompare policies={policies} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="stories-heading" className="space-y-4">
          <SectionHeading
            id="stories-heading"
            eyebrow="Perspectives"
            title={`${allStories.length} notes from this demonstration`}
            description="Seeded examples are marked “Fictional example”. Notes you add are marked as yours."
          />

          <div className="pp-card space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-ink">Filter by policy</span>
                <Select
                  value={policyFilter}
                  onChange={(event) => setPolicyFilter(event.target.value)}
                >
                  <option value="all">All policies</option>
                  {policies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.title}
                    </option>
                  ))}
                </Select>
              </label>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink">Filter by type</p>
                <div className="flex flex-wrap gap-1.5">
                  <FilterPill
                    active={perspectiveFilter === "all"}
                    onClick={() => setPerspectiveFilter("all")}
                    label="All"
                  />
                  {PERSPECTIVES.map((value) => (
                    <FilterPill
                      key={value}
                      active={perspectiveFilter === value}
                      onClick={() => setPerspectiveFilter(value)}
                      label={PERSPECTIVE_LABELS[value].label}
                      count={allStories.filter((s) => s.perspective === value).length}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper-line pt-3">
              <FilterPill
                active={mineOnly}
                onClick={() => setMineOnly((v) => !v)}
                label="Only my notes"
                count={userStories.length}
              />
              <p className="text-xs text-ink-soft" aria-live="polite">
                Showing <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
                {allStories.length} notes
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            allStories.length === 0 ? (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="No perspectives yet"
                description="No notes are attached to these policies. Add the first one using the form."
              />
            ) : (
              <EmptyState
                tone="filtered"
                icon={<SearchX className="h-5 w-5" />}
                title="No notes match those filters"
                description={
                  mineOnly && userStories.length === 0
                    ? "You have not added a note yet. Use the form to add your perspective."
                    : "Try a different policy or note type."
                }
                action={
                  filtersActive ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPolicyFilter("all");
                        setPerspectiveFilter("all");
                        setMineOnly(false);
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            )
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filtered.map((story) => (
                <li key={story.id} className="flex">
                  <StoryCard
                    story={story}
                    policyTitle={policyTitles[story.policyId]}
                    onRemove={removeStory}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <StoryForm policies={policies} />

          <Card>
            <CardHeader
              icon={<Quote className="h-4 w-4" />}
              eyebrow="How to read this page"
              title="Comparisons, not claims"
            />
            <CardBody className="space-y-3 pt-4 text-sm leading-relaxed text-ink-soft">
              <p>
                The comparison table at the top runs the real formulas with different
                household inputs. It shows what the arithmetic does when, say, someone
                has no outdoor space — not what people in that situation are like.
              </p>
              <p>
                The notes below are written examples. They describe individual
                experiences with practical constraints such as storage, building type
                and available services. They are not evidence about any group.
              </p>
              <p className="text-xs text-ink-faint">
                In a real deployment this page would carry verified submissions with
                moderation and consent handling. None of that exists in this demo.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        active
          ? "border-forest-400 bg-forest-800 text-paper-raised"
          : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink",
      )}
    >
      <MessageSquarePlus className="h-3 w-3" aria-hidden="true" />
      {label}
      {typeof count === "number" ? (
        <span className="ml-0.5 tabular-nums opacity-70">{count}</span>
      ) : null}
    </button>
  );
}
