"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Info } from "lucide-react";
import type { UpcomingDate } from "@/lib/policy-utils";
import { formatDate, formatRelativeDays } from "@/lib/format";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { PolicyStatusBadge } from "@/components/policy/status-badge";

const KIND_LABELS: Record<UpcomingDate["kind"], string> = {
  effective: "Takes effect",
  decision: "Decision",
  comment: "Comment closes",
  enrollment: "Enrolment",
  review: "Review",
};

/**
 * Upcoming dates relevant to the selected policies.
 *
 * The server supplies a pre-computed list so the first paint has content. After
 * hydration the component re-filters against the visitor's own clock, so a page
 * left open across midnight does not keep showing a stale countdown.
 */
export function UpcomingDates({
  upcoming,
  todayIso,
}: {
  upcoming: UpcomingDate[];
  todayIso: string;
}) {
  const [today, setToday] = useState(todayIso);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const visible = useMemo(
    () => upcoming.filter((item) => item.date >= today),
    [upcoming, today],
  );

  return (
    <Card>
      <CardHeader
        icon={<CalendarClock className="h-4 w-4" />}
        eyebrow="Coming up"
        title="Dates that matter for your policies"
        description="Every date below belongs to the fictional demonstration city and is illustrative only."
      />
      <CardBody className="pt-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-5 w-5" />}
            title="No upcoming dates"
            description="The selected policies have no future dates recorded. Past effective dates are not counted as upcoming."
          />
        ) : (
          <ol className="space-y-2.5">
            {visible.map((item) => (
              <li
                key={`${item.policyId}-${item.date}-${item.label}`}
                className="flex flex-col gap-2 rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="outline" compact>
                      {KIND_LABELS[item.kind]}
                    </Badge>
                    <PolicyStatusBadge status={item.status} compact />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-ink">
                    <Link
                      href={`/policies/${item.policyId}`}
                      className="rounded transition-colors hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      {item.policyTitle}
                    </Link>
                  </p>
                  <p className="text-xs text-ink-faint">{item.label}</p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {formatDate(item.date)}
                  </p>
                  <p className="text-2xs text-ink-faint">{formatRelativeDays(item.date)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-4 flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
          <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            No deadline shown here is a real deadline, and no decision is actually
            scheduled. These dates exist to demonstrate how the app would present
            a verified policy calendar.
          </span>
        </p>
      </CardBody>
    </Card>
  );
}
