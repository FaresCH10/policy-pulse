import Link from "next/link";
import { Compass, SearchX } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Callout } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700"
        >
          <SearchX className="h-5 w-5" />
        </span>
        <div>
          <p className="pp-eyebrow">Not found</p>
          <h1 className="pp-display text-2xl font-semibold text-ink">
            We could not find that page
          </h1>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-soft">
        The policy or page you asked for is not in this build. PolicyPulse only
        shows records it actually holds — it does not generate plausible-looking
        policies to fill the gap.
      </p>

      <Callout tone="demo" title="Looking for a real policy?">
        This is a demonstration build with one fictional city. No real city’s
        policies are included, and entering a real location returns “coverage
        unavailable” rather than substituting demo data.
      </Callout>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/" icon={<Compass className="h-4 w-4" />}>
          Back to the overview
        </LinkButton>
        <LinkButton href="/policies" variant="outline">
          Browse policies
        </LinkButton>
      </div>

      <p className="text-xs text-ink-faint">
        If you followed a link from inside the app, that is a bug worth reporting.
        Nothing else on this page failed to load — you can{" "}
        <Link href="/simulator" className="pp-link">
          open the simulator
        </Link>{" "}
        or{" "}
        <Link href="/community" className="pp-link">
          read community perspectives
        </Link>
        .
      </p>
    </div>
  );
}
