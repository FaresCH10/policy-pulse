"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  Copy,
  ListChecks,
  Mail,
  MessageCircleQuestion,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type {
  ActionItem,
  EmailTemplate,
  OfficialContact,
  Policy,
} from "@/lib/types";
import { DEMO_CITY, DISCLAIMERS } from "@/lib/constants";
import { CHECKLIST_CONTENT, QUESTION_CONTENT } from "@/lib/data/actions";
import { COMPOSTING_AVAILABILITY_LABELS, TENURE_LABELS } from "@/lib/labels";
import { copyText } from "@/lib/clipboard";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/state/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, TextInput, Textarea } from "@/components/ui/form";
import { Callout, EmptyState, PageSkeleton, ProgressBar, SectionHeading } from "@/components/ui/misc";
import { Disclosure } from "@/components/ui/accordion";
import { BookmarkButton } from "@/components/policy/bookmark-button";
import { PolicyStatusBadge } from "@/components/policy/status-badge";
import { cn } from "@/lib/utils";

export function ActionCenter({
  policies,
  actionItems,
  contacts,
  initialPolicyId,
}: {
  policies: Policy[];
  actionItems: ActionItem[];
  contacts: OfficialContact[];
  initialPolicyId?: string;
}) {
  const { checklist, toggleChecklistItem, hydrated } = useAppStore();
  const [selectedId, setSelectedId] = useState(
    initialPolicyId && policies.some((p) => p.id === initialPolicyId)
      ? initialPolicyId
      : (policies[0]?.id ?? ""),
  );

  const policy = policies.find((p) => p.id === selectedId) ?? null;

  const items = useMemo(
    () => actionItems.filter((item) => item.policyId === selectedId),
    [actionItems, selectedId],
  );

  const checklistAction = items.find((item) => item.kind === "checklist");
  const questionsAction = items.find((item) => item.kind === "question");
  const guideActions = items.filter((item) => item.kind === "guide");
  const emailAction = items.find((item) => item.kind === "email-draft");

  const lines = checklistAction ? (CHECKLIST_CONTENT[checklistAction.id] ?? []) : (policy?.whatYouCanDo.map((text, i) => ({ id: `step-${i}`, label: text, help: "Suggested preparation; check the policy source." })) ?? []);
  const questions = questionsAction ? (QUESTION_CONTENT[questionsAction.id] ?? []) : [
    "Does this policy apply to the places where I shop or the services I use?",
    "Which exemptions or eligibility rules should I check?",
    "Has the policy changed since the source review date shown here?",
  ];

  const doneCount = lines.filter((line) => checklist[`${selectedId}:${line.id}`]).length;
  const policyContacts = contacts.filter(
    (contact) => contact.policyId === selectedId || contact.policyId === "all",
  );

  if (!hydrated) {
    return <PageSkeleton label="Loading the Action Center" />;
  }

  if (!policy) {
    return (
      <EmptyState
        icon={<ListChecks className="h-5 w-5" />}
        title="No actions available"
        description="There are no policies for this location, so there is nothing to prepare for yet."
        action={
          <Link href="/policies" className="pp-link text-sm">
            Browse policies
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        level="h1"
        eyebrow="Action Center"
        title="What you can actually do next"
        description="A preparation checklist, questions worth asking, getting-started guides, and a comment draft you edit and copy yourself. Nothing is sent for you."
      />

      <div className="pp-card p-4">
        <p className="pp-eyebrow mb-2">Choose a policy</p>
        <ul className="flex flex-wrap gap-2">
          {policies.map((option) => {
            const active = option.id === selectedId;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                    active
                      ? "border-forest-400 bg-forest-800 text-paper-raised"
                      : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink",
                  )}
                >
                  {option.shortTitle}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          {/* Checklist -------------------------------------------------- */}
          <Card>
            <CardHeader
              icon={<ListChecks className="h-4 w-4" />}
              eyebrow={policy.shortTitle}
              title={checklistAction?.title ?? "Preparation checklist"}
              description={checklistAction?.detail}
              actions={<PolicyStatusBadge status={policy.status} compact />}
            />
            <CardBody className="space-y-4 pt-4">
              {lines.length === 0 ? (
                <p className="text-sm text-ink-faint">
                  No checklist has been written for this policy yet.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-ink-soft">
                      <span>
                        {doneCount} of {lines.length} done
                      </span>
                      <span className="tabular-nums">
                        {Math.round((doneCount / lines.length) * 100)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={doneCount}
                      max={lines.length}
                      label={`Checklist progress: ${doneCount} of ${lines.length} items complete`}
                    />
                  </div>

                  <ul className="space-y-1">
                    {lines.map((line) => {
                      const key = `${selectedId}:${line.id}`;
                      const done = Boolean(checklist[key]);
                      return (
                        <li
                          key={line.id}
                          className={cn(
                            "rounded-xl px-3 py-2.5 transition-colors",
                            done ? "bg-forest-50/60" : "hover:bg-paper-sunken/50",
                          )}
                        >
                          <Checkbox
                            label={
                              <span
                                className={cn(
                                  done && "text-ink-faint line-through decoration-forest-400",
                                )}
                              >
                                {line.label}
                              </span>
                            }
                            help={line.help}
                            checked={done}
                            onChange={() => toggleChecklistItem(key)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>

          {/* Questions -------------------------------------------------- */}
          <Card>
            <CardHeader
              icon={<MessageCircleQuestion className="h-4 w-4" />}
              eyebrow="Ask"
              title={questionsAction?.title ?? "Questions to ask"}
              description={questionsAction?.detail}
            />
            <CardBody className="space-y-4 pt-4">
              {questions.length === 0 ? (
                <p className="text-sm text-ink-faint">
                  No questions have been written for this policy yet.
                </p>
              ) : (
                <>
                  <ol className="space-y-2.5">
                    {questions.map((question, index) => (
                      <li
                        key={question}
                        className="flex gap-2.5 rounded-xl border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-2xs font-semibold text-teal-800"
                        >
                          {index + 1}
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ol>
                  <CopyButton
                    text={questions.map((q) => `• ${q}`).join("\n")}
                    label="Copy all questions"
                  />
                </>
              )}
            </CardBody>
          </Card>

          {/* Guides ----------------------------------------------------- */}
          {guideActions.map((guide) => (
            <Card key={guide.id}>
              <CardHeader
                icon={<Sparkles className="h-4 w-4" />}
                eyebrow="Getting started"
                title={guide.title}
                description={guide.detail}
              />
              <CardBody className="pt-4">
                <ol className="space-y-3">
                  {(guide.steps ?? []).map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-3 rounded-xl border border-paper-line bg-paper-raised px-3.5 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-800 text-2xs font-semibold text-paper-raised"
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {/* Email draft ------------------------------------------------ */}
          {emailAction?.emailTemplate ? (
            <EmailDraftCard
              key={emailAction.id}
              template={emailAction.emailTemplate}
              title={emailAction.title}
              detail={emailAction.detail}
              policyTitle={policy.title}
            />
          ) : null}

          {/* Contacts --------------------------------------------------- */}
          <Card>
            <CardHeader
              icon={<ShieldAlert className="h-4 w-4" />}
              eyebrow="Who to contact"
              title="Contacts for this policy"
              description={policy.isDemo ? DISCLAIMERS.contacts : "Original policy sources and agency guidance."}
            />
            <CardBody className="space-y-3 pt-4">
              <ul className="space-y-2">
                {policyContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className="rounded-xl border border-paper-line bg-paper-raised px-3.5 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{contact.label}</p>
                      <Badge tone={contact.verified ? "forest" : "amber"} compact>
                        {contact.verified ? "Verified" : "Example only"}
                      </Badge>
                    </div>
                    <p className="mt-1 break-all text-xs text-ink-soft">{contact.verified && contact.channel === "web" ? <a href={contact.value} className="pp-link" target="_blank" rel="noopener noreferrer">Open official source ↗</a> : contact.value}</p>
                    <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                      {contact.note}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-2xs leading-relaxed text-ink-faint">
                {policy.isDemo ? "Contacts in demo mode are fictional placeholders." : "Check official sources for up-to-date contact details."}
              </p>
            </CardBody>
          </Card>

          {/* Next steps ------------------------------------------------- */}
          <Card>
            <CardHeader eyebrow="Keep going" title="Related steps" />
            <CardBody className="space-y-3 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <BookmarkButton
                  policyId={policy.id}
                  policyTitle={policy.shortTitle}
                  variant="full"
                />
                <Link
                  href={`/simulator?policy=${policy.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper-raised px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-forest-300 hover:text-ink"
                >
                  Open the simulator
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href={`/policies/${policy.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
                >
                  Read the policy
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <Callout tone="info" compact title="Your progress is saved locally">
                Checklist ticks and saved policies live in this browser only. Nothing is
                uploaded, and there is no account.
              </Callout>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Email draft                                                                 */
/* -------------------------------------------------------------------------- */

function EmailDraftCard({
  template,
  title,
  detail,
  policyTitle,
}: {
  template: EmailTemplate;
  title: string;
  detail: string;
  policyTitle: string;
}) {
  const { profile } = useAppStore();

  const initialBody = useMemo(() => {
    const context = [
      `${formatNumber(profile.householdSize, 0)} people`,
      TENURE_LABELS[profile.tenure].toLowerCase(),
      `${formatNumber(profile.groceryTripsPerWeek, 1)} grocery trips a week`,
      `about ${formatNumber(profile.weeklyFoodWasteLb, 0)} lb of food waste a week`,
      `composting ${COMPOSTING_AVAILABILITY_LABELS[profile.compostingAvailable].toLowerCase()}`,
    ].join(", ");

    const values: Record<string, string> = {
      jurisdictionName: DEMO_CITY.fullName,
      householdContext: context,
      myPerspective:
        "[Write what you have noticed, and what you would change. Keep it in your own words — this draft is only a starting point.]",
      questionTopic: `[the part you want explained — for example how this applies to ${
        policyTitle.toLowerCase().includes("bag") ? "delivery orders" : "your building"
      }]`,
      signature: "[Your name]",
    };

    let body = template.body;
    for (const key of template.placeholders) {
      body = body.split(`{{${key}}}`).join(values[key] ?? `[${key}]`);
    }
    return body;
  }, [template, profile, policyTitle]);

  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(initialBody);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  // Rebuild the draft if the household profile changes, unless the user has
  // already edited it — an edited draft is the user's, not ours.
  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (!edited) setBody(initialBody);
  }, [initialBody, edited]);

  const handleCopy = async () => {
    const ok = await copyText(`Subject: ${subject}\n\n${body}`);
    setCopied(ok ? "done" : "failed");
    window.setTimeout(() => setCopied("idle"), 4000);
  };

  return (
    <Card className="border-teal-200">
      <CardHeader
        icon={<Mail className="h-4 w-4" />}
        eyebrow="Draft"
        title={title}
        description={detail}
        actions={
          <Badge tone="amber" icon={<ShieldAlert className="h-3 w-3" />}>
            Never sent automatically
          </Badge>
        }
      />
      <CardBody className="space-y-4 pt-4">
        <Field label="Subject line" help="Edit this to match what you want to say.">
          {(props) => (
            <TextInput
              {...props}
              value={subject}
              maxLength={140}
              onChange={(event) => {
                setSubject(event.target.value);
                setEdited(true);
              }}
            />
          )}
        </Field>

        <Field
          label="Message"
          help="Written in the first person and deliberately neutral. Replace every [bracketed] section with your own words before you send it anywhere."
        >
          {(props) => (
            <Textarea
              {...props}
              value={body}
              rows={12}
              className="font-mono text-xs leading-relaxed"
              onChange={(event) => {
                setBody(event.target.value);
                setEdited(true);
              }}
            />
          )}
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCopy} icon={<ClipboardCopy className="h-4 w-4" />}>
            Copy draft
          </Button>
          <Button
            variant="outline"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setBody(initialBody);
              setSubject(template.subject);
              setEdited(false);
              setCopied("idle");
            }}
          >
            Rebuild from template
          </Button>
          {copied === "done" ? (
            <span
              role="status"
              className="flex items-center gap-1.5 text-xs font-medium text-forest-700"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied to your clipboard
            </span>
          ) : null}
          {copied === "failed" ? (
            <span role="status" className="text-xs font-medium text-clay">
              Copying is blocked in this browser — select the text above and copy it
              manually.
            </span>
          ) : null}
        </div>

        <Disclosure summary="Preview as plain text">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-ink-soft">
            {`Subject: ${subject}\n\n${body}`}
          </pre>
        </Disclosure>

        <Callout tone="demo" compact title="What happens when you press copy">
          Nothing leaves this device. PolicyPulse has no send capability, no mail
          integration, and no server that receives this text. You decide where it goes.
        </Callout>
      </CardBody>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Copy button                                                                 */
/* -------------------------------------------------------------------------- */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        icon={<Copy className="h-3.5 w-3.5" />}
        onClick={async () => {
          const ok = await copyText(text);
          setState(ok ? "done" : "failed");
          window.setTimeout(() => setState("idle"), 4000);
        }}
      >
        {label}
      </Button>
      {state === "done" ? (
        <span role="status" className="text-xs font-medium text-forest-700">
          Copied
        </span>
      ) : null}
      {state === "failed" ? (
        <span role="status" className="text-xs font-medium text-clay">
          Copying is blocked — select the list and copy manually.
        </span>
      ) : null}
    </div>
  );
}
