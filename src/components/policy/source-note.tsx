import { ExternalLink, FileText, Info } from "lucide-react";
import type { Policy, Source } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<Source["contentRole"], { label: string; tone: "forest" | "teal" | "amber" }> = {
  "legal-text": { label: "Legal text", tone: "forest" },
  "explanatory-summary": { label: "Explanatory summary", tone: "teal" },
  illustrative: { label: "Illustrative data", tone: "amber" },
};

/**
 * Provenance for a single source.
 *
 * The distinction between binding legal text and PolicyPulse's own explanatory
 * summary is rendered explicitly, and a real source always shows its
 * jurisdiction and the date it was retrieved.
 */
export function SourceItem({ source }: { source: Source }) {
  const role = ROLE_LABELS[source.contentRole];

  return (
    <li className="rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={role.tone} compact>
          {role.label}
        </Badge>
        {source.isDemo ? (
          <Badge tone="outline" compact>
            Fictional
          </Badge>
        ) : null}
      </div>

      <p className="mt-2 text-sm font-semibold text-ink">{source.title}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{source.publisher}</p>

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-ink-faint">
        {source.publishedAt ? (
          <div className="flex gap-1">
            <dt className="font-semibold">Published:</dt>
            <dd>{formatDate(source.publishedAt)}</dd>
          </div>
        ) : null}
        {source.retrievedAt ? (
          <div className="flex gap-1">
            <dt className="font-semibold">Retrieved:</dt>
            <dd>{formatDate(source.retrievedAt)}</dd>
          </div>
        ) : (
          <div className="flex gap-1">
            <dt className="font-semibold">Retrieved:</dt>
            <dd>not applicable — no external source</dd>
          </div>
        )}
      </dl>

      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{source.note}</p>

      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="pp-link mt-2 inline-flex items-center gap-1 text-xs"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Open the official document
          <span className="pp-sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-800">
          <FileText className="h-3 w-3" aria-hidden="true" />
          No external document to link — this record does not exist outside the demo.
        </p>
      )}
    </li>
  );
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-xs text-ink-faint">
        No sources are attached to this record.
      </p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {sources.map((source) => (
        <SourceItem key={source.id} source={source} />
      ))}
    </ul>
  );
}

/**
 * The one-line provenance strip shown on every policy card and detail page.
 */
export function SourceNote({
  policy,
  className,
  compact = false,
}: {
  policy: Policy;
  className?: string;
  compact?: boolean;
}) {
  if (policy.isDemo) {
    return (
      <p
        className={cn(
          "flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-2xs font-medium leading-relaxed text-amber-900",
          className,
        )}
      >
        <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span>{policy.provenanceLabel}</span>
      </p>
    );
  }

  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-2xs font-medium leading-relaxed text-ink-faint",
        className,
      )}
    >
      <FileText className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        {compact ? "Verified source attached." : policy.provenanceLabel}
      </span>
    </p>
  );
}
