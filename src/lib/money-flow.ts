/*
  Money flow for the Sankey on the Dashboard's "Money flow" tab.
  income sources → budget → spending categories, per selectable period.
  Spending sums stay below income; the remainder becomes Surplus, so the
  middle node always balances. Each period has its own realistic mix
  (e.g., a bigger vacation shows up over 3 months).
*/

export type FlowStage = "income" | "budget" | "expense"

export type FlowNode = { name: string; stage: FlowStage; emoji: string }

export type FlowLink = { source: number; target: number; value: number }

export type MoneyRange = "1W" | "1M" | "3M" | "YTD"

export const MONEY_RANGES: MoneyRange[] = ["1W", "1M", "3M", "YTD"]

/** Fixed node list. income 0–4 · budget 5 · spending 6–17 (last is Surplus). */
export const flowNodes: FlowNode[] = [
  { name: "Paycheck", stage: "income", emoji: "🧾" },
  { name: "Side Gig", stage: "income", emoji: "💰" },
  { name: "Interest", stage: "income", emoji: "🤑" },
  { name: "Dividends", stage: "income", emoji: "📈" },
  { name: "Card Cashback", stage: "income", emoji: "💳" },
  { name: "Budget", stage: "budget", emoji: "🗂️" },
  { name: "Housing", stage: "expense", emoji: "🏠" },
  { name: "Food", stage: "expense", emoji: "🍔" },
  { name: "Healthcare", stage: "expense", emoji: "🏥" },
  { name: "Transportation", stage: "expense", emoji: "🚗" },
  { name: "Education", stage: "expense", emoji: "🎓" },
  { name: "Vacation", stage: "expense", emoji: "🏝️" },
  { name: "Utilities", stage: "expense", emoji: "💡" },
  { name: "Shopping", stage: "expense", emoji: "🛍️" },
  { name: "Entertainment", stage: "expense", emoji: "🎭" },
  { name: "Gifts", stage: "expense", emoji: "🎁" },
  { name: "Charity", stage: "expense", emoji: "🎗️" },
  { name: "Surplus", stage: "expense", emoji: "✨" },
]

const BUDGET = 5
export const INCOME_COUNT = 5

// income: [Paycheck, Side Gig, Interest, Dividends, Cashback]
// expense: [Housing, Food, Healthcare, Transportation, Education, Vacation,
//           Utilities, Shopping, Entertainment, Gifts, Charity]  (Surplus derived)
const SPEC: Record<
  MoneyRange,
  { period: string; income: number[]; expense: number[] }
> = {
  "1W": {
    period: "this week",
    income: [2077, 185, 20, 12, 6],
    expense: [646, 360, 130, 230, 40, 30, 161, 240, 130, 46, 46],
  },
  "1M": {
    period: "this month",
    income: [9000, 800, 100, 70, 30],
    expense: [2800, 1400, 1300, 900, 800, 800, 700, 500, 200, 200, 200],
  },
  "3M": {
    period: "past 3 months",
    income: [27000, 2400, 300, 210, 90],
    expense: [8400, 4000, 3400, 2700, 2400, 3200, 2100, 1400, 600, 600, 500],
  },
  YTD: {
    period: "year to date",
    income: [61000, 5600, 700, 490, 210],
    expense: [19600, 9600, 8500, 6300, 5600, 5200, 4900, 3600, 1500, 1400, 1300],
  },
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function buildFlow(range: MoneyRange) {
  const spec = SPEC[range]
  const total = sum(spec.income)
  const surplus = Math.max(0, total - sum(spec.expense))
  const expenses = [...spec.expense, surplus] // 12 values → nodes 6–17

  const links: FlowLink[] = [
    ...spec.income.map((value, i) => ({ source: i, target: BUDGET, value })),
    ...expenses.map((value, i) => ({ source: BUDGET, target: 6 + i, value })),
  ]
  return { nodes: flowNodes, links, total, period: spec.period }
}

export function flowPct(value: number, total: number) {
  const pct = (value / total) * 100
  if (pct <= 0) return "0%"
  if (pct < 1) return "<1%"
  return `${Math.round(pct)}%`
}
