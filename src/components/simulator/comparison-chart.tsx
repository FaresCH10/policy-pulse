"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationResult } from "@/lib/types";
import { formatAxisValue, formatByUnit } from "@/lib/format";
import { SegmentedControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Period = "monthly" | "annual";

const BASELINE_COLOR = "#b9ad95";
const SIMULATED_COLOR = "#2a663e";
const SIMULATED_WORSE_COLOR = "#b4553f";

/**
 * Baseline-vs-simulated comparison.
 *
 * One metric is charted at a time, because plotting pounds against dollars on a
 * shared axis would be misleading. Every charted figure is also printed as text
 * below, so the information is available without reading the graphic.
 */
export function ComparisonChart({
  result,
  period,
  onPeriodChange,
}: {
  result: SimulationResult;
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const chartable = useMemo(
    () => result.metrics.filter((metric) => metric.chartable),
    [result.metrics],
  );

  const [metricKey, setMetricKey] = useState(chartable[0]?.key ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Keep the selection valid when the scenario changes.
  useEffect(() => {
    if (!chartable.some((m) => m.key === metricKey)) {
      setMetricKey(chartable[0]?.key ?? "");
    }
  }, [chartable, metricKey]);

  const metric = chartable.find((m) => m.key === metricKey) ?? chartable[0];

  if (!metric) {
    return (
      <p className="text-sm text-ink-faint">
        This scenario has no chartable metrics.
      </p>
    );
  }

  const baseline =
    period === "monthly" ? metric.baselineMonthly : metric.baselineAnnual;
  const simulated =
    period === "monthly" ? metric.simulatedMonthly : metric.simulatedAnnual;

  const direction = metric.lowerIsBetter
    ? simulated <= baseline
      ? "better"
      : "worse"
    : simulated >= baseline
      ? "better"
      : "worse";

  const data = [
    { name: "Baseline", value: round(baseline), fill: BASELINE_COLOR },
    {
      name: "Simulated",
      value: round(simulated),
      fill: direction === "worse" ? SIMULATED_WORSE_COLOR : SIMULATED_COLOR,
    },
  ];

  const delta = simulated - baseline;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl<Period>
          legend="Time period"
          name="chart-period"
          size="sm"
          value={period}
          onChange={onPeriodChange}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual" },
          ]}
        />

        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="font-semibold">Metric</span>
          <select
            value={metric.key}
            onChange={(event) => setMetricKey(event.target.value)}
            className="h-8 rounded-lg border border-paper-line bg-paper-raised px-2 text-xs text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25"
          >
            {chartable.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="h-56 w-full sm:h-64">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid stroke="#e3dac9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#4d5347", fontSize: 12 }}
                axisLine={{ stroke: "#e3dac9" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) => formatAxisValue(value, metric.unit)}
                tick={{ fill: "#7c8373", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "rgba(27, 65, 42, 0.05)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e3dac9",
                  background: "#fffdf9",
                  fontSize: 12,
                  color: "#1b1f1a",
                }}
                formatter={(value: number) => [
                  formatByUnit(value, metric.unit, 2),
                  metric.label,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                formatter={(value: string) => (
                  <span style={{ color: "#4d5347", fontSize: 12 }}>{value}</span>
                )}
              />
              <Bar dataKey="value" name={metric.label} radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="pp-skeleton h-full w-full rounded-xl" />
        )}
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">{metric.description}</p>

      {/* Text equivalent of the chart, so the information is never chart-only. */}
      <div className="overflow-x-auto rounded-xl border border-paper-line">
        <table className="w-full min-w-[22rem] border-collapse text-left text-xs">
          <caption className="pp-sr-only">
            {metric.label}, baseline compared with simulated, per {period === "monthly" ? "month" : "year"}
          </caption>
          <thead className="bg-paper-sunken/60">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold text-ink">
                Metric
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-ink">
                Baseline
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-ink">
                Simulated
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-ink">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-paper-line">
              <th scope="row" className="px-3 py-2 font-medium text-ink-soft">
                {metric.label}
              </th>
              <td className="px-3 py-2 text-right tabular-nums text-ink-soft">
                {formatByUnit(baseline, metric.unit, 2)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">
                {formatByUnit(simulated, metric.unit, 2)}
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right tabular-nums font-semibold",
                  direction === "better" ? "text-forest-700" : "text-clay",
                )}
              >
                {delta > 0 ? "+" : delta < 0 ? "\u2212" : ""}
                {formatByUnit(Math.abs(delta), metric.unit, 2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-2xs text-ink-faint">
        {direction === "better"
          ? `In this scenario the simulated outcome is the better one for ${metric.label.toLowerCase()}.`
          : `In this scenario the simulated outcome is worse for ${metric.label.toLowerCase()} than the baseline.`}
      </p>
    </div>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
