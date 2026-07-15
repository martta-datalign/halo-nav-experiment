import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  computeRetirement,
  resolveInputs,
  retirementDefaults,
  type RetirementInputs,
  type RetirementResult,
  type RetirementYearPoint,
} from "@/lib/calculators"
import { formatCompactUSD, formatUSD } from "@/lib/format"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Field, NumberInput, placeholderText, ResultPanel, Stat } from "./fields"

const ph = placeholderText
const D = retirementDefaults

const INVESTMENT_COLOR = "var(--muted-foreground)"
const BALANCE_COLOR = "var(--chart-2)"

export function RetirementForm({
  inputs,
  onChange,
}: {
  inputs: RetirementInputs
  onChange: (next: RetirementInputs) => void
}) {
  const set = <K extends keyof RetirementInputs>(key: K, value: RetirementInputs[K]) =>
    onChange({ ...inputs, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current age" required htmlFor="r-age">
          <NumberInput
            id="r-age"
            placeholder={ph(D.currentAge)}
            value={inputs.currentAge}
            onValueChange={(v) => set("currentAge", v)}
          />
        </Field>
        <Field label="Retirement age" required htmlFor="r-retire">
          <NumberInput
            id="r-retire"
            placeholder={ph(D.retirementAge)}
            value={inputs.retirementAge}
            onValueChange={(v) => set("retirementAge", v)}
          />
        </Field>
      </div>

      <Field label="Current savings" required htmlFor="r-savings">
        <NumberInput
          id="r-savings"
          format="money"
          prefix="$"
          placeholder={ph(D.currentSavings, "money")}
          value={inputs.currentSavings}
          onValueChange={(v) => set("currentSavings", v)}
        />
      </Field>

      <Field label="Additional annual investment" htmlFor="r-invest">
        <NumberInput
          id="r-invest"
          format="money"
          prefix="$"
          placeholder={ph(D.additionalAnnualInvestment, "money")}
          value={inputs.additionalAnnualInvestment}
          onValueChange={(v) => set("additionalAnnualInvestment", v)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Expected return (annual %, nominal)"
          required
          hint="Average annual growth before inflation."
          htmlFor="r-return"
        >
          <NumberInput
            id="r-return"
            suffix="%"
            placeholder={ph(D.expectedReturn)}
            value={inputs.expectedReturn}
            onValueChange={(v) => set("expectedReturn", v)}
          />
        </Field>
        <Field
          label="Inflation (annual %, CPI)"
          required
          hint="Used to express all figures in today's dollars."
          htmlFor="r-infl"
        >
          <NumberInput
            id="r-infl"
            suffix="%"
            placeholder={ph(D.inflation)}
            value={inputs.inflation}
            onValueChange={(v) => set("inflation", v)}
          />
        </Field>
      </div>
    </div>
  )
}

export function RetirementResultView({ result }: { result: RetirementResult }) {
  const reducedMotion = useReducedMotion()
  return (
    <div className="flex flex-col gap-4">
      <ResultPanel>
        <p className="text-sm font-semibold">Summary</p>
        <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-5">
          <Stat label="Final balance" value={formatUSD(result.finalBalance)} accent />
          <Stat label="Total principal" value={formatUSD(result.totalPrincipal)} />
          <Stat label="Growth" value={formatUSD(result.growth)} />
        </div>
      </ResultPanel>

      <ResultPanel>
        <p className="text-sm font-semibold">
          How your savings accumulate over {result.years} years (today's $)
        </p>
        <div className="mt-2 mb-3 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: INVESTMENT_COLOR }} />
            Investment
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: BALANCE_COLOR }} />
            Balance
          </span>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={result.series} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRetireBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BALANCE_COLOR} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={BALANCE_COLOR} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 4" stroke="var(--border)" />
              <XAxis
                dataKey="age"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(a) => `Age ${a}`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatCompactUSD(v as number)}
              />
              <RechartsTooltip cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "2 3" }} content={<RetirementTip />} />
              <Area
                dataKey="balance"
                type="monotone"
                stroke={BALANCE_COLOR}
                strokeWidth={2.5}
                fill="url(#fillRetireBalance)"
                isAnimationActive={!reducedMotion}
                animationBegin={180}
                animationDuration={900}
                animationEasing="ease-out"
                dot={false}
              />
              <Area
                dataKey="investment"
                type="monotone"
                stroke={INVESTMENT_COLOR}
                strokeWidth={1.5}
                fill={INVESTMENT_COLOR}
                fillOpacity={0.18}
                isAnimationActive={!reducedMotion}
                animationBegin={260}
                animationDuration={820}
                animationEasing="ease-out"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ResultPanel>

      <div className="rounded-xl border border-halo-border bg-halo-subtle p-5">
        <p className="text-sm font-semibold text-halo">Safe withdrawal ideas</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Estimated level income that draws your balance to zero by age {result.untilAge}.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-5">
          <Stat label="Monthly withdrawal" value={formatUSD(result.monthlyWithdrawal)} />
          <Stat label="Annual withdrawal" value={formatUSD(result.annualWithdrawal)} />
          <Stat label="Until age" value={`${result.untilAge} years`} />
        </div>
      </div>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function RetirementTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as RetirementYearPoint
  return (
    <div className="min-w-[180px] rounded-lg border border-border bg-popover p-3 shadow-md">
      <div className="text-[11px] font-medium text-muted-foreground">Age {point.age}</div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-[3px]" style={{ background: BALANCE_COLOR }} />
            Balance
          </span>
          <span className="text-[13px] font-semibold tabular-nums">{formatUSD(point.balance)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-[3px]" style={{ background: INVESTMENT_COLOR }} />
            Investment
          </span>
          <span className="text-[13px] font-semibold tabular-nums">{formatUSD(point.investment)}</span>
        </div>
      </div>
    </div>
  )
}

export function RetirementResultLive({ inputs }: { inputs: RetirementInputs }) {
  return <RetirementResultView result={computeRetirement(resolveInputs(inputs, D))} />
}
