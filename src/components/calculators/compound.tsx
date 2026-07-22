import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  COMPOUND_FREQUENCIES,
  compoundDefaults,
  computeCompound,
  resolveInputs,
  type CompoundInputs,
  type CompoundResult,
  type CompoundYearPoint,
} from "@/lib/calculators"
import { formatCompactUSD, formatUSD } from "@/lib/format"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Field, NumberInput, placeholderText, ResultPanel, SelectInput, Stat } from "./fields"

const ph = placeholderText
const D = compoundDefaults

const SERIES = [
  { key: "starting", label: "Starting amount", color: "var(--chart-1)" },
  { key: "contributions", label: "Contributions", color: "var(--chart-5)" },
  { key: "interest", label: "Interest", color: "var(--chart-2)" },
] as const

/** Keep at most ~11 bars so long horizons stay legible (endpoints preserved). */
function sampleSeries(series: CompoundYearPoint[]): CompoundYearPoint[] {
  if (series.length <= 11) return series
  const step = Math.ceil((series.length - 1) / 10)
  const out = series.filter((_, i) => i % step === 0)
  const last = series[series.length - 1]
  if (out[out.length - 1]?.year !== last.year) out.push(last)
  return out
}

export function CompoundForm({
  inputs,
  onChange,
}: {
  inputs: CompoundInputs
  onChange: (next: CompoundInputs) => void
}) {
  const set = <K extends keyof CompoundInputs>(key: K, value: CompoundInputs[K]) =>
    onChange({ ...inputs, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      <Field label="Starting amount" required htmlFor="c-start">
        <NumberInput
          id="c-start"
          format="money"
          prefix="$"
          placeholder={ph(D.startingAmount, "money")}
          value={inputs.startingAmount}
          onValueChange={(v) => set("startingAmount", v)}
        />
      </Field>

      <Field label="Additional contribution" htmlFor="c-contrib">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <NumberInput
            id="c-contrib"
            format="money"
            prefix="$"
            placeholder={ph(D.contribution, "money")}
            value={inputs.contribution}
            onValueChange={(v) => set("contribution", v)}
          />
          <SelectInput
            className="w-32"
            value={inputs.contribPeriod}
            onValueChange={(v) => set("contribPeriod", v as CompoundInputs["contribPeriod"])}
            options={[
              { value: "month", label: "/month" },
              { value: "year", label: "/year" },
            ]}
          />
        </div>
      </Field>

      <Field
        label="Compounding frequency"
        hint="How often returns are added back to the balance and start earning too."
        htmlFor="c-freq"
      >
        <SelectInput
          id="c-freq"
          value={inputs.frequencyKey}
          onValueChange={(v) => set("frequencyKey", v)}
          options={COMPOUND_FREQUENCIES.map((f) => ({ value: f.key, label: f.label }))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Rate of return (Annual %)"
          required
          hint="Expected average annual growth before inflation."
          htmlFor="c-rate"
        >
          <NumberInput
            id="c-rate"
            suffix="%"
            placeholder={ph(D.rateOfReturn)}
            value={inputs.rateOfReturn}
            onValueChange={(v) => set("rateOfReturn", v)}
          />
        </Field>
        <Field label="Years to grow" required htmlFor="c-years">
          <NumberInput
            id="c-years"
            placeholder={ph(D.years)}
            value={inputs.years}
            onValueChange={(v) => set("years", v)}
          />
        </Field>
      </div>
    </div>
  )
}

export function CompoundResultView({ result }: { result: CompoundResult }) {
  const reducedMotion = useReducedMotion()
  const data = sampleSeries(result.series)

  return (
    <div className="flex flex-col gap-4">
      <ResultPanel>
        <p className="text-[13px] text-muted-foreground">Final value</p>
        <p className="mt-1 text-[28px] font-semibold leading-none tabular-nums text-foreground">
          {formatUSD(result.finalValue)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
          <Stat label="Total contribution" value={formatUSD(result.totalContribution)} />
          <Stat label="Total interest" value={formatUSD(result.totalInterest)} />
        </div>
      </ResultPanel>

      <ResultPanel>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 4" stroke="var(--border)" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(y) => `Yr ${y}`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatCompactUSD(v as number)}
              />
              <RechartsTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<CompoundTip />} />
              {SERIES.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId="a"
                  fill={s.color}
                  isAnimationActive={!reducedMotion}
                  animationBegin={180}
                  animationDuration={720}
                  animationEasing="ease-out"
                  radius={i === SERIES.length - 1 ? [3, 3, 0, 0] : 0}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ResultPanel>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CompoundTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as CompoundYearPoint
  return (
    <div className="min-w-[180px] rounded-lg border border-border bg-popover p-3 shadow-md">
      <div className="text-[11px] font-medium text-muted-foreground">Year {label}</div>
      <div className="mt-2 space-y-1.5">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-[3px]" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-[13px] font-semibold tabular-nums">
              {formatUSD(point[s.key])}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-1.5">
          <span className="text-xs font-medium">Total</span>
          <span className="text-[13px] font-semibold tabular-nums">
            {formatUSD(point.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CompoundResultLive({ inputs }: { inputs: CompoundInputs }) {
  return <CompoundResultView result={computeCompound(resolveInputs(inputs, D))} />
}
