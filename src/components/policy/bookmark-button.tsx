"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { cn } from "@/lib/utils";

/**
 * Bookmark toggle. Reads from the persisted store, so a saved policy survives a
 * reload without an account. Disabled until storage has been read, which keeps
 * the control from flickering on first paint.
 */
export function BookmarkButton({
  policyId,
  policyTitle,
  variant = "icon",
  className,
}: {
  policyId: string;
  policyTitle: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { bookmarks, toggleBookmark, hydrated } = useAppStore();
  const saved = bookmarks.includes(policyId);

  const label = saved ? `Remove ${policyTitle} from saved policies` : `Save ${policyTitle}`;
  // The full-width variant shows generic text ("Save policy"), so the accessible
  // name is extended with the policy title. It always begins with the visible
  // text, which keeps it compliant with the "label in name" requirement.
  const fullLabel = saved
    ? `Saved: ${policyTitle} — remove from saved policies`
    : `Save policy: ${policyTitle}`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggleBookmark(policyId)}
        disabled={!hydrated}
        aria-pressed={saved}
        aria-label={fullLabel}
        title={fullLabel}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ease-editorial",
          "disabled:cursor-not-allowed disabled:opacity-55",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          saved
            ? "border-forest-300 bg-forest-50 text-forest-800"
            : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink",
          className,
        )}
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden="true" />
        )}
        {saved ? "Saved" : "Save policy"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(policyId)}
      disabled={!hydrated}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200 ease-editorial",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        saved
          ? "border-forest-300 bg-forest-50 text-forest-700"
          : "border-paper-line bg-paper-raised text-ink-faint hover:border-forest-300 hover:text-forest-700",
        className,
      )}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
