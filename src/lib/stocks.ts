export type StockRange = "1D" | "1W" | "1M" | "1Y"

export type StockPoint = {
  label: string
  value: number
}

export type StockSeries = {
  points: StockPoint[]
  price: number
  exchange: string
  currency: string
  asOf: string
}

export type Stock = {
  symbol: string
  name: string
  exchange: string
  price: number
  previousClose: number
  currency: "USD"
  ranges: Record<StockRange, StockPoint[]>
}

const RANGE_LABELS: Record<StockRange, string[]> = {
  "1D": [
    "9:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "1:00",
    "1:30",
    "2:00",
    "2:30",
    "3:00",
    "3:30",
    "4:00",
  ],
  "1W": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "1M": [
    "Jun 23",
    "Jun 27",
    "Jul 1",
    "Jul 5",
    "Jul 9",
    "Jul 13",
    "Jul 17",
    "Jul 21",
  ],
  "1Y": [
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ],
}

const SHAPES: Record<StockRange, number[]> = {
  "1D": [
    -1.2, -0.7, -0.9, -0.1, 0.3, 0.1, 0.8, 0.5, 1.2, 1.5, 1.1, 1.8, 2.1,
    2.4,
  ],
  "1W": [-1.8, -0.4, 1.1, 0.5, 2.4],
  "1M": [-4.2, -2.8, -3.4, -0.7, 1.5, 0.8, 3.2, 4.6],
  "1Y": [-13, -9, -16, -11, -5, -8, 1, 7, 4, 13, 18, 24],
}

function makeRanges(
  price: number,
  direction = 1
): Record<StockRange, StockPoint[]> {
  return Object.fromEntries(
    (Object.keys(RANGE_LABELS) as StockRange[]).map((range) => {
      const values = SHAPES[range]
      const last = values[values.length - 1] * direction
      return [
        range,
        RANGE_LABELS[range].map((label, index) => ({
          label,
          value: Number(
            (price * (1 + (values[index] * direction - last) / 100)).toFixed(2)
          ),
        })),
      ]
    })
  ) as Record<StockRange, StockPoint[]>
}

function stock(
  symbol: string,
  name: string,
  exchange: string,
  price: number,
  previousClose: number,
  direction = 1
): Stock {
  return {
    symbol,
    name,
    exchange,
    price,
    previousClose,
    currency: "USD",
    ranges: makeRanges(price, direction),
  }
}

// Illustrative values for the prototype. Replace this catalog with a market-data
// adapter when the app has a backend and provider credentials.
export const STOCKS = {
  AAPL: stock("AAPL", "Apple Inc.", "NASDAQ", 211.18, 206.23),
  MSFT: stock("MSFT", "Microsoft Corp.", "NASDAQ", 502.04, 497.91),
  NVDA: stock("NVDA", "NVIDIA Corp.", "NASDAQ", 172.41, 168.32),
  TSLA: stock("TSLA", "Tesla Inc.", "NASDAQ", 328.49, 334.12, -1),
  AMZN: stock("AMZN", "Amazon.com Inc.", "NASDAQ", 226.13, 222.48),
} satisfies Record<string, Stock>

export type StockSymbol = keyof typeof STOCKS

const TWELVE_DATA_RANGES: Record<
  StockRange,
  { interval: string; outputsize: number }
> = {
  "1D": { interval: "15min", outputsize: 27 },
  "1W": { interval: "1h", outputsize: 40 },
  "1M": { interval: "1day", outputsize: 30 },
  "1Y": { interval: "1week", outputsize: 53 },
}

type TwelveDataResponse = {
  meta?: {
    currency?: string
    exchange?: string
  }
  values?: Array<{
    datetime: string
    close: string
  }>
  status?: string
  message?: string
}

const seriesCache = new Map<string, StockSeries>()

export async function fetchStockSeries(
  symbol: StockSymbol,
  range: StockRange,
  signal?: AbortSignal
): Promise<StockSeries> {
  const cacheKey = `${symbol}:${range}`
  const cached = seriesCache.get(cacheKey)
  if (cached) return cached

  const { interval, outputsize } = TWELVE_DATA_RANGES[range]
  const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY || "demo"
  const params = new URLSearchParams({
    symbol,
    interval,
    outputsize: String(outputsize),
    apikey: apiKey,
  })
  const response = await fetch(`https://api.twelvedata.com/time_series?${params}`, {
    signal,
  })
  if (!response.ok) throw new Error(`Market data request failed (${response.status})`)

  const payload = (await response.json()) as TwelveDataResponse
  if (payload.status === "error" || !payload.values?.length) {
    throw new Error(payload.message || "Market data is unavailable")
  }

  const values = [...payload.values].reverse()
  const points = values
    .map((item) => ({
      label: formatMarketLabel(item.datetime, range),
      value: Number(item.close),
    }))
    .filter((item) => Number.isFinite(item.value))

  if (points.length < 2) throw new Error("Not enough market data to chart")

  const latest = values[values.length - 1]
  const series: StockSeries = {
    points,
    price: points[points.length - 1].value,
    exchange: payload.meta?.exchange || STOCKS[symbol].exchange,
    currency: payload.meta?.currency || STOCKS[symbol].currency,
    asOf: latest.datetime,
  }
  seriesCache.set(cacheKey, series)
  return series
}

function formatMarketLabel(datetime: string, range: StockRange) {
  const [datePart, timePart] = datetime.split(" ")
  if (range === "1D" && timePart) {
    const [hours, minutes] = timePart.split(":").map(Number)
    const suffix = hours >= 12 ? "PM" : "AM"
    const hour = hours % 12 || 12
    return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`
  }

  const date = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(date.getTime())) return datePart
  if (range === "1W") {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: range === "1Y" ? undefined : "numeric",
  })
}

const COMPANY_ALIASES: Record<StockSymbol, string[]> = {
  AAPL: ["apple"],
  MSFT: ["microsoft"],
  NVDA: ["nvidia"],
  TSLA: ["tesla"],
  AMZN: ["amazon"],
}

export function detectStockQuery(query: string): StockSymbol | null {
  const lower = query.toLowerCase()
  const marketIntent =
    /\b(stock|share|shares|ticker|price|quote|chart|graph|market)\b/i.test(query)

  for (const symbol of Object.keys(STOCKS) as StockSymbol[]) {
    const explicitTicker = new RegExp(`(?:\\$|\\b)${symbol}(?:\\b)`, "i").test(query)
    const company = COMPANY_ALIASES[symbol].some((alias) => lower.includes(alias))
    if (explicitTicker || (company && marketIntent)) return symbol
  }

  return null
}
