import * as React from "react"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiInformationLine,
} from "@remixicon/react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  STOCKS,
  fetchStockSeries,
  type StockRange,
  type StockSeries,
  type StockSymbol,
} from "@/lib/stocks"
import { cn } from "@/lib/utils"

const RANGES: StockRange[] = ["1D", "1W", "1M", "1Y"]
const chartConfig = {
  value: { label: "Price", color: "var(--positive)" },
} satisfies ChartConfig

export function StockWidget({ symbol }: { symbol: StockSymbol }) {
  const stock = STOCKS[symbol]
  const [range, setRange] = React.useState<StockRange>("1D")
  const [series, setSeries] = React.useState<StockSeries | null>(null)
  const [source, setSource] = React.useState<"loading" | "live" | "fallback">(
    "loading"
  )

  React.useEffect(() => {
    const controller = new AbortController()
    setSeries(null)
    setSource("loading")
    fetchStockSeries(symbol, range, controller.signal)
      .then((result) => {
        setSeries(result)
        setSource("live")
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setSeries(null)
        setSource("fallback")
      })
    return () => controller.abort()
  }, [range, symbol])

  const fallbackPoints = stock.ranges[range]
  const points = series?.points ?? fallbackPoints
  const price = series?.price ?? stock.price
  const first = points[0].value
  const change = price - first
  const percent = (change / first) * 100
  const positive = change >= 0
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.25, price * 0.005)
  const domain: [number, number] = [min - pad, max + pad]
  const color = positive ? "var(--positive)" : "var(--negative)"

  return (
    <section
      className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-xs"
      aria-label={`${stock.name} stock quote`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 pt-4 sm:px-5">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-semibold tracking-[-0.01em]">
              {stock.symbol}
            </h3>
            <span className="text-xs text-muted-foreground">{stock.name}</span>
          </div>
          <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
            ${price.toFixed(2)}
          </p>
          <p
            className={cn(
              "mt-2 flex items-center text-xs font-medium tabular-nums",
              positive ? "text-positive" : "text-negative"
            )}
          >
            {positive ? (
              <RiArrowUpSLine className="size-4" />
            ) : (
              <RiArrowDownSLine className="size-4" />
            )}
            {positive ? "+" : "−"}${Math.abs(change).toFixed(2)} ({positive
              ? "+"
              : "−"}
            {Math.abs(percent).toFixed(2)}%)
            <span className="ml-1 font-normal text-muted-foreground">
              {range === "1D" ? "today" : range}
            </span>
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {series?.exchange || stock.exchange} · {series?.currency || stock.currency}
        </span>
      </div>

      <ChartContainer
        config={{ value: { ...chartConfig.value, color } }}
        className="mt-4 h-48 w-full aspect-auto"
        initialDimension={{ width: 680, height: 192 }}
      >
        <AreaChart
          data={points}
          margin={{ left: 4, right: 10, top: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`stock-fill-${symbol}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 4"
            stroke="var(--border)"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={9}
            minTickGap={24}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            orientation="right"
            domain={domain}
            tickLine={false}
            axisLine={false}
            width={48}
            tickCount={4}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
          />
          <RechartsTooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "2 3" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">
                    ${Number(payload[0].value).toFixed(2)}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2.25}
            fill={`url(#stock-fill-${symbol})`}
            dot={false}
            activeDot={{ r: 3.5, stroke: "var(--card)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1" aria-label="Chart range">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              aria-pressed={range === item}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
                range === item
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>
            {source === "live"
              ? "Twelve Data"
              : source === "loading"
                ? "Updating…"
                : "Demo fallback"}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="About this market data"
                className="transition-colors hover:text-foreground"
              >
                <RiInformationLine className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64">
              <DataSourceNote source={source} asOf={series?.asOf} symbol={symbol} />
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  )
}

function DataSourceNote({
  source,
  asOf,
  symbol,
}: {
  source: "loading" | "live" | "fallback"
  asOf?: string
  symbol: StockSymbol
}) {
  if (source === "loading") return <>Updating from Twelve Data…</>
  if (source === "live") {
    return (
      <>
        Market data from Twelve Data{asOf ? ` · Last point ${asOf}` : ""}. Quotes may
        be delayed.
      </>
    )
  }
  return (
    <>
      Illustrative fallback data. The public demo API only supports AAPL; add a free
      Twelve Data key to load {symbol}.
    </>
  )
}
