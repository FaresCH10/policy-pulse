import {
  CalendarCheck,
  CheckCircle2,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import type { PolicyStatus } from "@/lib/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";

interface StatusConfig {
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
  /** Long form used in tooltips and detail pages. */
  explanation: string;
}

export const STATUS_CONFIG: Record<PolicyStatus, StatusConfig> = {
  "in-effect": {
    label: "In effect",
    tone: "forest",
    icon: CheckCircle2,
    explanation:
      "This policy is described as currently applying in the demonstration city. In a real deployment this status would be verified against the official source.",
  },
  adopted: {
    label: "Adopted",
    tone: "teal",
    icon: CalendarCheck,
    explanation:
      "This policy is described as decided but not yet applying. Dates shown are illustrative.",
  },
  proposed: {
    label: "Proposed",
    tone: "amber",
    icon: FileEdit,
    explanation:
      "This policy is described as a draft. Nothing is required of anyone, and no decision is actually scheduled.",
  },
};

/**
 * Status is always rendered as a word plus an icon plus a colour — never colour
 * alone — so it survives greyscale printing and colour-vision differences.
 */
export function PolicyStatusBadge({
  status,
  compact = false,
}: {
  status: PolicyStatus;
  compact?: boolean;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge
      tone={config.tone}
      compact={compact}
      title={config.explanation}
      icon={<Icon className="h-3 w-3" />}
    >
      {config.label}
    </Badge>
  );
}
