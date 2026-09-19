"use client";
import { Button, LinkButton } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section role="alert" className="pp-card mx-auto max-w-xl space-y-4 p-6">
    <p className="pp-eyebrow">Temporarily unavailable</p>
    <h1 className="pp-display text-2xl font-semibold">We couldn’t load this page</h1>
    <p className="text-sm text-ink-soft">Policy data may be unavailable or could not be validated. Your saved household settings are still on this device. Please try again.</p>
    <div className="flex gap-3"><Button onClick={reset}>Try again</Button><LinkButton href="/" variant="outline">Go to overview</LinkButton></div>
  </section>;
}
