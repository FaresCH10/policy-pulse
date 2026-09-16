"use client";

import { useState } from "react";
import { Info, Send, TriangleAlert } from "lucide-react";
import type {
  CircumstanceTag,
  CommunityStory,
  PerspectiveKind,
  Policy,
  Tenure,
} from "@/lib/types";
import { CIRCUMSTANCE_LABELS, PERSPECTIVE_LABELS } from "@/lib/data/community";
import { DISCLAIMERS } from "@/lib/constants";
import { TENURE_LABELS } from "@/lib/labels";
import { wordCount } from "@/lib/format";
import { storySubmissionSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  Field,
  RadioCards,
  Select,
  TextInput,
  Textarea,
} from "@/components/ui/form";
import { Callout } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const PERSPECTIVES: PerspectiveKind[] = ["positive", "challenge", "suggestion"];
const CIRCUMSTANCES = Object.keys(CIRCUMSTANCE_LABELS) as CircumstanceTag[];

/**
 * Story submission.
 *
 * Everything is validated before it is stored, and the stored record is clearly
 * marked as the visitor's own and device-local. The submitted text is never
 * rendered as HTML anywhere in the app.
 */
export function StoryForm({ policies }: { policies: Policy[] }) {
  const { addStory, hydrated } = useAppStore();

  const [policyId, setPolicyId] = useState(policies[0]?.id ?? "");
  const [contextLabel, setContextLabel] = useState("");
  const [perspective, setPerspective] = useState<PerspectiveKind>("challenge");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [tenure, setTenure] = useState<Tenure | "">("");
  const [circumstances, setCircumstances] = useState<CircumstanceTag[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setContextLabel("");
    setHeadline("");
    setBody("");
    setHouseholdSize("");
    setTenure("");
    setCircumstances([]);
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = storySubmissionSchema.safeParse({
      policyId,
      contextLabel,
      perspective,
      headline,
      body,
      householdSize: householdSize === "" ? undefined : householdSize,
      tenure: tenure === "" ? undefined : tenure,
      circumstances,
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      setSubmitted(false);
      return;
    }

    const data = result.data;
    const story: CommunityStory = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      policyId: data.policyId,
      contextLabel: data.contextLabel,
      contextTags: (data.circumstances ?? []) as CircumstanceTag[],
      headline: data.headline,
      body: data.body,
      perspective: data.perspective,
      householdSize: data.householdSize,
      tenure: data.tenure,
      createdAt: new Date().toISOString().slice(0, 10),
      isDemo: false,
      isUserSubmitted: true,
      authorLabel: "You · saved on this device",
    };

    addStory(story);
    resetForm();
    setSubmitted(true);
  };

  const toggleCircumstance = (tag: CircumstanceTag) => {
    setCircumstances((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 6
          ? prev
          : [...prev, tag],
    );
  };

  return (
    <Card>
      <CardHeader
        icon={<Send className="h-4 w-4" />}
        eyebrow="Add your perspective"
        title="Share how this policy would land for you"
        description="A short note about your situation, what would work, and what would not."
      />
      <CardBody className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field
            label="Which policy is this about?"
            help="Pick the policy your perspective relates to."
            error={errors.policyId}
            required
          >
            {(props) => (
              <Select
                {...props}
                value={policyId}
                invalid={Boolean(errors.policyId)}
                onChange={(event) => setPolicyId(event.target.value)}
              >
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Your household context"
            hint="For example: “Renter, 2 people, third-floor flat, no outdoor space”."
            help="Practical circumstances only — please do not include your address or anything that identifies you."
            error={errors.contextLabel}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                value={contextLabel}
                maxLength={80}
                placeholder="Renter, 2 people, no outdoor space"
                invalid={Boolean(errors.contextLabel)}
                onChange={(event) => setContextLabel(event.target.value)}
              />
            )}
          </Field>

          <Field
            label="What kind of note is this?"
            error={errors.perspective}
            required
          >
            {() => (
              <RadioCards<PerspectiveKind>
                legend="What kind of note is this?"
                name="perspective"
                columns={3}
                value={perspective}
                onChange={setPerspective}
                options={PERSPECTIVES.map((value) => ({
                  value,
                  label: PERSPECTIVE_LABELS[value].label,
                }))}
              />
            )}
          </Field>

          <Field
            label="Headline"
            help="A short summary of your point."
            error={errors.headline}
            required
          >
            {(props) => (
              <TextInput
                {...props}
                value={headline}
                maxLength={90}
                placeholder="Nowhere to keep reusable bags"
                invalid={Boolean(errors.headline)}
                onChange={(event) => setHeadline(event.target.value)}
              />
            )}
          </Field>

          <Field
            label="Your note"
            help={`${wordCount(body)} words · ${body.length} of 1200 characters`}
            error={errors.body}
            required
          >
            {(props) => (
              <Textarea
                {...props}
                value={body}
                maxLength={1200}
                rows={6}
                placeholder="What would work for you, what would be hard, and what would you change?"
                invalid={Boolean(errors.body)}
                onChange={(event) => setBody(event.target.value)}
              />
            )}
          </Field>

          <details className="rounded-xl border border-paper-line bg-paper-sunken/40 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Optional details
            </summary>
            <div className="mt-4 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="People in your household"
                  error={errors.householdSize}
                >
                  {(props) => (
                    <TextInput
                      {...props}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={12}
                      value={householdSize}
                      invalid={Boolean(errors.householdSize)}
                      onChange={(event) => setHouseholdSize(event.target.value)}
                    />
                  )}
                </Field>

                <Field
                  label="Renting or owning"
                  hint="Optional — leave as “Prefer not to say” if you would rather not."
                  error={errors.tenure}
                >
                  {(props) => (
                    <Select
                      {...props}
                      value={tenure}
                      onChange={(event) => setTenure(event.target.value as Tenure | "")}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="renter">{TENURE_LABELS.renter}</option>
                      <option value="homeowner">{TENURE_LABELS.homeowner}</option>
                    </Select>
                  )}
                </Field>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-ink">
                  Circumstances that matter (up to 6)
                </legend>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                  These become tags on your note so others can find perspectives like
                  theirs.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {CIRCUMSTANCES.map((tag) => {
                    const active = circumstances.includes(tag);
                    return (
                      <li key={tag}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleCircumstance(tag)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                            active
                              ? "border-forest-400 bg-forest-800 text-paper-raised"
                              : "border-paper-line bg-paper-raised text-ink-soft hover:border-forest-300 hover:text-ink",
                          )}
                        >
                          {CIRCUMSTANCE_LABELS[tag]}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            </div>
          </details>

          <p className="rounded-xl border border-paper-line bg-paper-sunken/40 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              This is a demonstration, not a real community platform.
            </span>{" "}
            {DISCLAIMERS.community}
          </p>

          {errors._form ? (
            <Callout tone="warning" compact title="Check the highlighted fields">
              {errors._form}
            </Callout>
          ) : null}

          {submitted ? (
            <Callout tone="success" compact title="Saved on this device">
              Your perspective now appears above, labelled as yours. It was not sent
              anywhere and is not published to any real community.
            </Callout>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-paper-line pt-4">
            <Button type="submit" icon={<Send className="h-4 w-4" />} disabled={!hydrated}>
              Add my perspective
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Clear the form
            </Button>
            {!hydrated ? (
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Waiting for local storage…
              </span>
            ) : null}
          </div>
        </form>

        <p className="mt-4 flex items-start gap-1.5 text-2xs leading-relaxed text-ink-faint">
          <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            Your text is stored as plain text and rendered as plain text. It is never
            interpreted as markup, and there is no server that receives it.
          </span>
        </p>
      </CardBody>
    </Card>
  );
}
