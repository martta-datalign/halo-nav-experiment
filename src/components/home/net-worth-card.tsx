import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card } from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { CardPromptFooter } from "@/components/ask-halo-action"
import {
  NET_WORTH,
  NET_WORTH_AS_OF,
  netWorthSeries,
  type RangeKey,
} from "@/lib/data"
import { formatCompactUSD, formatUSD } from "@/lib/format"

const RANGES: RangeKey[] = ["1W", "1M", "3M", "YTD", "ALL"]

const chartConfig = {
  value: { label: "Net worth", color: "var(--chart-1)" },
} satisfies ChartConfig

export function NetWorthCard() {
  const [range, setRange] = React.useState<RangeKey>("3M")
  const { points, period } = netWorthSeries[range]

  const first = points[0].value
  const last = points[points.length - 1].value
  const delta = last - first
  const pct = (delta / first) * 100
  const up = delta >= 0

  // Padded domain so the line never hugs the top/bottom edges (mirrors the reference).
  const values = points.map((p) => p.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = (rawMax - rawMin) * 0.25 || rawMax * 0.05
  const domain: [number, number] = [rawMin - pad, rawMax + pad]

  // Rule: point-over-point change + key driver only make sense on the longer
  // ranges — daily/weekly noise on 1W/1M isn't worth annotating.
  const showAnalytics = range === "3M" || range === "YTD" || range === "ALL"
  const chartData = points.map((p, i) => ({
    ...p,
    change: i > 0 ? p.value - points[i - 1].value : null,
    prevLabel: i > 0 ? points[i - 1].label : null,
  }))

  return (
    <Card className="gap-0 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Net worth</h2>
          </div>
          <div className="mt-1.5 text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
            {formatUSD(NET_WORTH)}
          </div>
          <div
            className={cn(
              "mt-2 text-[13px] font-medium tabular-nums",
              up ? "text-positive" : "text-negative"
            )}
          >
            {formatUSD(delta, { sign: true })} ({up ? "+" : "−"}
            {Math.abs(pct).toFixed(2)}%) {period}
          </div>
        </div>
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          As of {NET_WORTH_AS_OF}
        </span>
      </div>

      <ChartContainer config={chartConfig} className="mt-5 aspect-[16/6] w-full">
        <AreaChart data={chartData} margin={{ left: 6, right: 8, top: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 4" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={28}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            orientation="right"
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={52}
            tickCount={5}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => formatCompactUSD(v as number)}
          />
          <ChartTooltipCustom showAnalytics={showAnalytics} />
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2.5}
            fill="url(#fillNetWorth)"
            isAnimationActive={false}
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2.5,
              stroke: "var(--card)",
              fill: "var(--color-value)",
            }}
          />
        </AreaChart>
      </ChartContainer>

      <div className="mt-4 flex items-center justify-center gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              r === range
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <CardPromptFooter
        text="What's driving my net worth?"
        prompt="What's driving my net worth, and how am I tracking against my plan?"
      />
    </Card>
  )
}

/**
 * Custom tooltip: always shows the value; on the longer ranges it adds the
 * point-over-point change, and a "key driver" line for notable moves only.
 */
function ChartTooltipCustom({ showAnalytics }: { showAnalytics: boolean }) {
  return (
    <RechartsTooltip
      cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "2 3" }}
      content={({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null
        const datum = payload[0].payload as {
          value: number
          change: number | null
          prevLabel: string | null
          driver?: string
        }
        const value = payload[0].value as number
        const change = datum.change
        const showChange = showAnalytics && change != null && change !== 0
        const showDriver = showAnalytics && Boolean(datum.driver)
        const up = (change ?? 0) >= 0

        return (
          <div className="min-w-[184px] max-w-[260px] rounded-lg border border-border bg-popover p-3 shadow-md">
            <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
            <div className="mt-1.5 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-[3px] bg-[var(--color-value)]" />
                Net worth
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {formatUSD(value)}
              </span>
            </div>

            {(showChange || showDriver) && (
              <div className="mt-2.5 space-y-1.5 border-t border-border pt-2.5">
                {showChange && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[11.5px] font-medium tabular-nums",
                      up ? "text-positive" : "text-negative"
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {formatUSD(change as number, { sign: true })}
                    <span className="font-normal text-muted-foreground">
                      since {datum.prevLabel}
                    </span>
                  </div>
                )}
                {showDriver && (
                  <div className="text-[11.5px] leading-snug text-muted-foreground">
                    <span className="font-medium text-foreground">Key driver</span>{" "}
                    {datum.driver}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
