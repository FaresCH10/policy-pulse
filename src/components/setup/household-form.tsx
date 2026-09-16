"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save, TriangleAlert } from "lucide-react";
import type { HouseholdProfile, Tenure, TriState } from "@/lib/types";
import { DEFAULT_PROFILE, PROFILE_FIELDS, SLIDER_BOUNDS } from "@/lib/constants";
import { COMPOSTING_AVAILABILITY_LABELS, TENURE_LABELS } from "@/lib/labels";
import {
  householdProfileSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/button";
import { Field, RadioCards, TextInput } from "@/components/ui/form";
import { Callout } from "@/components/ui/misc";

/** String-shaped draft so a half-typed number is never coerced to NaN. */
interface Draft {
  householdSize: string;
  tenure: Tenure;
  groceryTripsPerWeek: string;
  bagsPerTrip: string;
  weeklyFoodWasteLb: string;
  compostingAvailable: TriState;
}

function toDraft(profile: HouseholdProfile): Draft {
  return {
    householdSize: String(profile.householdSize),
    tenure: profile.tenure,
    groceryTripsPerWeek: String(profile.groceryTripsPerWeek),
    bagsPerTrip: String(profile.bagsPerTrip),
    weeklyFoodWasteLb: String(profile.weeklyFoodWasteLb),
    compostingAvailable: profile.compostingAvailable,
  };
}

const FIELD_BY_KEY = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.key, f]));

/**
 * Household profile editor.
 *
 * Only the six fields that actually change a calculation are collected, and each
 * one states why it is needed. Nothing is saved until the values validate, so a
 * bad input can never reach the simulator.
 */
export function HouseholdForm({
  onSaved,
  submitLabel = "Save household details",
}: {
  onSaved?: () => void;
  submitLabel?: string;
}) {
  const { profile, updateProfile, resetProfile, hydrated } = useAppStore();
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Keep the draft in step when the store changes underneath us (e.g. a reset
  // triggered from the data & privacy panel).
  useEffect(() => {
    setDraft(toDraft(profile));
  }, [profile]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setSavedAt(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = householdProfileSchema.safeParse(draft);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    updateProfile(result.data as HouseholdProfile);
    setSavedAt(Date.now());
    onSaved?.();
  };

  const handleReset = () => {
    setDraft(toDraft(DEFAULT_PROFILE));
    setErrors({});
    resetProfile();
    setSavedAt(Date.now());
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(toDraft(profile));

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={FIELD_BY_KEY.householdSize.label}
          help={FIELD_BY_KEY.householdSize.help}
          error={errors.householdSize}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              type="number"
              inputMode="numeric"
              min={SLIDER_BOUNDS.householdSize.min}
              max={SLIDER_BOUNDS.householdSize.max}
              value={draft.householdSize}
              invalid={Boolean(errors.householdSize)}
              onChange={(e) => set("householdSize", e.target.value)}
            />
          )}
        </Field>

        <Field
          label={FIELD_BY_KEY.groceryTripsPerWeek.label}
          help={FIELD_BY_KEY.groceryTripsPerWeek.help}
          error={errors.groceryTripsPerWeek}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              type="number"
              inputMode="decimal"
              min={SLIDER_BOUNDS.groceryTripsPerWeek.min}
              max={SLIDER_BOUNDS.groceryTripsPerWeek.max}
              value={draft.groceryTripsPerWeek}
              invalid={Boolean(errors.groceryTripsPerWeek)}
              onChange={(e) => set("groceryTripsPerWeek", e.target.value)}
            />
          )}
        </Field>

        <Field
          label={FIELD_BY_KEY.bagsPerTrip.label}
          help={FIELD_BY_KEY.bagsPerTrip.help}
          error={errors.bagsPerTrip}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              type="number"
              inputMode="decimal"
              min={SLIDER_BOUNDS.bagsPerTrip.min}
              max={SLIDER_BOUNDS.bagsPerTrip.max}
              value={draft.bagsPerTrip}
              invalid={Boolean(errors.bagsPerTrip)}
              onChange={(e) => set("bagsPerTrip", e.target.value)}
            />
          )}
        </Field>

        <Field
          label={FIELD_BY_KEY.weeklyFoodWasteLb.label}
          help={FIELD_BY_KEY.weeklyFoodWasteLb.help}
          error={errors.weeklyFoodWasteLb}
          required
        >
          {(props) => (
            <TextInput
              {...props}
              type="number"
              inputMode="decimal"
              min={SLIDER_BOUNDS.weeklyFoodWasteLb.min}
              max={SLIDER_BOUNDS.weeklyFoodWasteLb.max}
              value={draft.weeklyFoodWasteLb}
              invalid={Boolean(errors.weeklyFoodWasteLb)}
              onChange={(e) => set("weeklyFoodWasteLb", e.target.value)}
            />
          )}
        </Field>

        <div className="sm:col-span-2">
          <Field
            label={FIELD_BY_KEY.tenure.label}
            help={FIELD_BY_KEY.tenure.help}
            error={errors.tenure}
            required
          >
            {() => (
              <RadioCards<Tenure>
                legend={FIELD_BY_KEY.tenure.label}
                name="tenure"
                columns={2}
                value={draft.tenure}
                onChange={(value) => set("tenure", value)}
                options={[
                  {
                    value: "renter",
                    label: TENURE_LABELS.renter,
                    description:
                      "You may need the property owner's agreement for outdoor changes.",
                  },
                  {
                    value: "homeowner",
                    label: TENURE_LABELS.homeowner,
                    description:
                      "You can usually install things like a compost bin yourself.",
                  },
                ]}
              />
            )}
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label={FIELD_BY_KEY.compostingAvailable.label}
            help={FIELD_BY_KEY.compostingAvailable.help}
            error={errors.compostingAvailable}
            required
          >
            {() => (
              <RadioCards<TriState>
                legend={FIELD_BY_KEY.compostingAvailable.label}
                name="compostingAvailable"
                columns={3}
                value={draft.compostingAvailable}
                onChange={(value) => set("compostingAvailable", value)}
                options={[
                  { value: "yes", label: COMPOSTING_AVAILABILITY_LABELS.yes },
                  { value: "no", label: COMPOSTING_AVAILABILITY_LABELS.no },
                  {
                    value: "unsure",
                    label: COMPOSTING_AVAILABILITY_LABELS.unsure,
                    description: "We will keep composting estimates neutral.",
                  },
                ]}
              />
            )}
          </Field>
        </div>
      </div>

      {errors._form ? (
        <Callout tone="warning" compact title="Check the highlighted fields">
          {errors._form}
        </Callout>
      ) : null}

      {savedAt ? (
        <Callout tone="success" compact title="Saved on this device">
          Your estimates across the app now use these numbers.
        </Callout>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-paper-line pt-4">
        <Button
          type="submit"
          icon={<Save className="h-4 w-4" />}
          disabled={!hydrated || (!isDirty && !savedAt)}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={handleReset}
          disabled={!hydrated}
        >
          Reset to defaults
        </Button>
        {isDirty ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Unsaved changes
          </span>
        ) : null}
      </div>
    </form>
  );
}
