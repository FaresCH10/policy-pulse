"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                               */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  label: ReactNode;
  /** Explains *why* this input exists. Shown under the control. */
  help?: ReactNode;
  error?: string;
  required?: boolean;
  /** Extra guidance rendered above the control. */
  hint?: ReactNode;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
  className?: string;
  /** Renders the label inline with a compact control. */
  dense?: boolean;
}

/**
 * Label + help + error wiring in one place, so every control in the app gets
 * a real `<label for>`, an `aria-describedby` chain, and an announced error.
 */
export function Field({
  label,
  help,
  error,
  required,
  hint,
  children,
  className,
  dense = false,
}: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(dense ? "space-y-1.5" : "space-y-2", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-1.5 text-sm font-semibold text-ink"
      >
        {label}
        {required ? (
          <span className="text-clay" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="pp-sr-only">(required)</span> : null}
      </label>

      {hint ? <p className="text-xs leading-relaxed text-ink-faint">{hint}</p> : null}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-clay"
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      ) : null}

      {help ? (
        <p id={helpId} className="text-xs leading-relaxed text-ink-faint">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text inputs                                                                 */
/* -------------------------------------------------------------------------- */

const controlBase =
  "w-full rounded-xl border bg-paper-raised px-3 text-sm text-ink placeholder:text-ink-faint " +
  "transition-colors duration-200 ease-editorial hover:border-paper-line-strong " +
  "focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 " +
  "disabled:cursor-not-allowed disabled:bg-paper-sunken disabled:text-ink-faint";

const controlError = "border-clay/60 focus:border-clay focus:ring-clay/25";
const controlNormal = "border-paper-line";

export function TextInput({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        controlBase,
        "h-10",
        invalid ? controlError : controlNormal,
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        "min-h-[7rem] resize-y py-2.5 leading-relaxed",
        invalid ? controlError : controlNormal,
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        controlBase,
        "h-10 appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9",
        invalid ? controlError : controlNormal,
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%234d5347' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6.5 8 10.5 12 6.5'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                    */
/* -------------------------------------------------------------------------- */

export function Checkbox({
  label,
  help,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { label: ReactNode; help?: ReactNode }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = help ? `${inputId}-help` : undefined;

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={inputId}
        type="checkbox"
        aria-describedby={helpId}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-paper-line-strong text-forest-700 accent-forest-700 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        {...props}
      />
      <div className="min-w-0">
        <label htmlFor={inputId} className="cursor-pointer text-sm text-ink">
          {label}
        </label>
        {help ? (
          <p id={helpId} className="mt-0.5 text-xs leading-relaxed text-ink-faint">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Range control with a synced numeric input                                   */
/* -------------------------------------------------------------------------- */

export interface RangeControlProps {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Appended to the numeric input, e.g. "%" or "lb". */
  suffix?: string;
  /** Converts the stored value to the displayed number (e.g. 0.6 → 60). */
  displayScale?: number;
  help?: ReactNode;
  error?: string;
  /** Marks a control as a hypothetical override rather than a real rule. */
  whatIf?: boolean;
  disabled?: boolean;
  id?: string;
  /** Renders the numeric field read-only, for pure sliders. */
  hideNumberInput?: boolean;
}

/**
 * A slider paired with a numeric input.
 *
 * Both controls write to the same value, so a keyboard user can type an exact
 * figure and a pointer user can drag. The numeric input is the accessible
 * source of truth; the range is labelled as well, so either can be used alone.
 */
export function RangeControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  displayScale = 1,
  help,
  error,
  whatIf = false,
  disabled = false,
  id,
  hideNumberInput = false,
}: RangeControlProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const rangeId = `${baseId}-range`;
  const numberId = `${baseId}-number`;
  const helpId = help ? `${baseId}-help` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const displayValue = Number.isFinite(value) ? value * displayScale : 0;

  const handleDisplayChange = (next: number) => {
    if (!Number.isFinite(next)) return;
    const clamped = Math.min(Math.max(next, min), max);
    onChange(clamped / displayScale);
  };

  /** Ignore a cleared field rather than coercing "" into 0. */
  const handleTypedChange = (raw: string) => {
    if (raw.trim() === "") return;
    handleDisplayChange(Number(raw));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={rangeId} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {whatIf ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-amber-800">
            What-if
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <input
          id={rangeId}
          type="range"
          className="pp-range flex-1"
          min={min}
          max={max}
          step={step}
          value={Math.min(Math.max(displayValue, min), max)}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-valuetext={`${formatNumber(displayValue, displayScale === 1 ? 1 : 0)}${suffix}`}
          onChange={(event) => handleDisplayChange(Number(event.target.value))}
        />

        {hideNumberInput ? (
          <output
            htmlFor={rangeId}
            className="min-w-[4.5rem] shrink-0 rounded-lg border border-paper-line bg-paper-sunken px-2 py-1 text-center text-sm font-semibold tabular-nums text-ink"
          >
            {formatNumber(displayValue, displayScale === 1 ? 1 : 0)}
            {suffix}
          </output>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <input
              id={numberId}
              type="number"
              inputMode="decimal"
              className={cn(
                controlBase,
                "h-9 w-20 px-2 text-center tabular-nums",
                error ? controlError : controlNormal,
              )}
              min={min}
              max={max}
              step={step}
              value={Number.isFinite(displayValue) ? Math.round(displayValue * 100) / 100 : ""}
              disabled={disabled}
              aria-label={`${typeof label === "string" ? label : "Value"} (type an exact value)`}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              onChange={(event) => handleTypedChange(event.target.value)}
            />
            {suffix ? (
              <span className="text-xs font-medium text-ink-faint">{suffix}</span>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-clay">
          ⚠ {error}
        </p>
      ) : null}
      {help ? (
        <p id={helpId} className="text-xs leading-relaxed text-ink-faint">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented control (radio group)                                             */
/* -------------------------------------------------------------------------- */

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
  className,
  size = "md",
}: {
  legend: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="pp-sr-only">{legend}</legend>
      <div
        className={cn(
          "inline-flex w-full flex-wrap gap-1 rounded-full border border-paper-line bg-paper-sunken p-1",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-center font-medium transition-colors duration-200 ease-editorial",
                size === "sm" ? "py-1" : "py-1.5",
                selected
                  ? "bg-paper-raised text-forest-800 shadow-sm"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="pp-sr-only"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Radio card group (for multi-option choices with descriptions)               */
/* -------------------------------------------------------------------------- */

export function RadioCards<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
  columns = 1,
}: {
  legend: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="pp-sr-only">{legend}</legend>
      <div
        className={cn(
          "grid gap-2",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 sm:grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors duration-200 ease-editorial",
                selected
                  ? "border-forest-400 bg-forest-50"
                  : "border-paper-line bg-paper-raised hover:border-forest-200 hover:bg-forest-50/50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-forest-700"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
