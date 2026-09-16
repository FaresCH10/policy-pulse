"use client";

import { Quote, Trash2 } from "lucide-react";
import type { CommunityStory } from "@/lib/types";
import { CIRCUMSTANCE_LABELS, PERSPECTIVE_LABELS } from "@/lib/data/community";
import { formatDate } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * A single perspective.
 *
 * Story text is rendered as React text nodes, never as HTML, so user input can
 * never inject markup. Seeded stories and user submissions carry different
 * provenance labels so the two are never confused.
 */
export function StoryCard({
  story,
  policyTitle,
  onRemove,
  className,
}: {
  story: CommunityStory;
  policyTitle?: string;
  onRemove?: (id: string) => void;
  className?: string;
}) {
  const perspective = PERSPECTIVE_LABELS[story.perspective];
  const tone: BadgeTone =
    perspective.tone === "forest" ? "forest" : perspective.tone === "clay" ? "clay" : "teal";

  return (
    <article
      className={cn(
        "pp-card flex h-full flex-col px-4 py-4",
        story.isUserSubmitted && "border-teal-300 bg-teal-50/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={tone} compact>
          {perspective.label}
        </Badge>
        {story.isUserSubmitted ? (
          <Badge tone="teal" compact>
            Yours · saved on this device
          </Badge>
        ) : (
          <Badge tone="amber" compact>
            {story.authorLabel}
          </Badge>
        )}
        {onRemove && story.isUserSubmitted ? (
          <button
            type="button"
            onClick={() => onRemove(story.id)}
            aria-label={`Delete your story “${story.headline}”`}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-clay-soft hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <h3 className="pp-display mt-2.5 text-base font-semibold leading-snug text-ink">
        <Quote className="mr-1 inline h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
        {story.headline}
      </h3>

      <p className="mt-1 text-2xs font-medium text-ink-faint">
        {story.contextLabel}
        {policyTitle ? ` · ${policyTitle}` : ""}
      </p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{story.body}</p>

      {story.contextTags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {story.contextTags.map((tag) => (
            <li key={tag}>
              <Badge tone="outline" compact>
                {CIRCUMSTANCE_LABELS[tag]}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-2xs text-ink-faint">
        {story.isUserSubmitted ? "Added by you on " : "Written for this demo · "}
        {formatDate(story.createdAt)}
      </p>
    </article>
  );
}
