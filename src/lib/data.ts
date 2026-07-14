/*
  Mock data for the Halo AI prototype, ported from the halo-nav.html reference.
  Kept free of JSX so it can be shared across cards; icon glyphs are resolved
  in the components by the string keys below.
*/

export const user = {
  name: "Martta",
  fullName: "Martta Xu",
  initials: "MX",
  email: "martta@datalign.com",
}

/** Headline net worth is a single fact "as of today"; only the trailing
 *  history + delta change with the selected range. Every series ends on the
 *  same figure ($649,421). */
export const NET_WORTH = 649421
export const NET_WORTH_AS_OF = "Jul 1, 2026"

export type RangeKey = "1W" | "1M" | "3M" | "YTD" | "ALL"

export type SeriesPoint = {
  label: string
  value: number
  /** Present only on notable moves — drives the tooltip's "key driver" line. */
  driver?: string
}

// Gentle undulation: an overall upward trend with small, realistic dips — a
// little up-and-down, never drastic. Every series still ends on NET_WORTH.
export const netWorthSeries: Record<
  RangeKey,
  { period: string; points: SeriesPoint[] }
> = {
  "1W": {
    period: "past week",
    points: [
      { label: "Jun 24", value: 645800 },
      { label: "Jun 25", value: 647200 },
      { label: "Jun 26", value: 646500 },
      { label: "Jun 27", value: 648100 },
      { label: "Jun 28", value: 647400 },
      { label: "Jun 29", value: 649000 },
      { label: "Jun 30", value: 648300 },
      { label: "Jul 1", value: 649421 },
    ],
  },
  "1M": {
    period: "past month",
    points: [
      { label: "Jun 3", value: 634200 },
      { label: "Jun 8", value: 638900 },
      { label: "Jun 13", value: 636100 },
      { label: "Jun 18", value: 642800 },
      { label: "Jun 23", value: 640300 },
      { label: "Jun 28", value: 646500 },
      { label: "Jul 1", value: 649421 },
    ],
  },
  "3M": {
    period: "past 3 months",
    points: [
      { label: "Apr 8", value: 588000 },
      { label: "Apr 15", value: 594200 },
      { label: "Apr 22", value: 591500 },
      { label: "Apr 29", value: 599800 },
      { label: "May 6", value: 604300 },
      { label: "May 13", value: 600100, driver: "Brief tech pullback in your holdings" },
      { label: "May 20", value: 611700, driver: "Broad equity rally across your portfolio" },
      { label: "May 27", value: 617900 },
      { label: "Jun 3", value: 614200 },
      { label: "Jun 10", value: 623800, driver: "Dividends reinvested + market gains" },
      { label: "Jun 17", value: 632500 },
      { label: "Jun 24", value: 640100 },
      { label: "Jul 1", value: 649421, driver: "Payroll deposit + investment gains" },
    ],
  },
  YTD: {
    period: "year to date",
    points: [
      { label: "Jan 1", value: 542000 },
      { label: "Feb 1", value: 557000 },
      { label: "Mar 1", value: 551000, driver: "Spring market dip" },
      { label: "Apr 1", value: 578000, driver: "Annual bonus + market gains" },
      { label: "May 1", value: 571500 },
      { label: "Jun 1", value: 612000, driver: "Strong quarter in equities" },
      { label: "Jul 1", value: 649421, driver: "Continued market gains + savings" },
    ],
  },
  ALL: {
    period: "all time",
    points: [
      { label: "Jul 2024", value: 398000 },
      { label: "Oct 2024", value: 423000 },
      { label: "Jan 2025", value: 416500, driver: "Early-year market correction" },
      { label: "Apr 2025", value: 452000, driver: "Portfolio rebalance paid off" },
      { label: "Jul 2025", value: 489000 },
      { label: "Oct 2025", value: 481000, driver: "Market correction" },
      { label: "Jan 2026", value: 537000, driver: "Bull market + new contributions" },
      { label: "Apr 2026", value: 598000, driver: "Best quarter yet — equities + bonus" },
      { label: "Jul 2026", value: 649421, driver: "Steady gains + higher savings rate" },
    ],
  },
}

export type AccountKind = "bank" | "investment" | "card"

export type Account = {
  id: string
  name: string
  kind: AccountKind
  mask: string
  balance: number
}

/** Balances reconcile to NET_WORTH: 12,480 + 34,200 + 602,741 + 8,000 − 8,000 = 649,421. */
export const accounts: Account[] = [
  { id: "checking", name: "Checking", kind: "bank", mask: "4821", balance: 12480 },
  { id: "savings", name: "Savings", kind: "bank", mask: "5679", balance: 34200 },
  { id: "investments", name: "Investments", kind: "investment", mask: "0092", balance: 602741 },
  { id: "hsa", name: "HSA", kind: "investment", mask: "7112", balance: 8000 },
  { id: "card", name: "Credit Card", kind: "card", mask: "3310", balance: -8000 },
]

export type Goal = {
  id: string
  name: string
  current: number
  target: number
}

export const goals: Goal[] = [
  { id: "emergency", name: "Emergency fund", current: 18000, target: 25000 },
  { id: "home", name: "Home down payment", current: 49200, target: 120000 },
]

export type Activity = {
  id: string
  name: string
  date: string
  amount: number
}

export const activity: Activity[] = [
  { id: "a1", name: "Whole Foods", date: "Jul 1", amount: -86.42 },
  { id: "a2", name: "Payroll Deposit", date: "Jun 29", amount: 4200 },
  { id: "a3", name: "Netflix", date: "Jun 28", amount: -15.99 },
  { id: "a4", name: "Amazon", date: "Jun 27", amount: -142.1 },
]

/** AI-native insights — Halo's proactive read on the same underlying data.
 *  `tone` drives the accent; `prompt` seeds the Ask Halo launcher. */
export type Insight = {
  id: string
  title: string
  detail: string
  tone: "positive" | "attention" | "neutral"
  prompt: string
}

export const insights: Insight[] = [
  {
    id: "growth",
    title: "Net worth is up 10.4% this quarter",
    detail:
      "You've added $61,421 in the past 3 months, mostly from investment gains. You're ahead of your plan.",
    tone: "positive",
    prompt: "What's driving my net worth growth this quarter?",
  },
  {
    id: "emergency",
    title: "Emergency fund is 72% funded",
    detail:
      "At your current pace of ~$600/mo you'll hit your $25,000 target in about 12 months. Bumping to $850/mo gets you there by spring.",
    tone: "attention",
    prompt: "How can I finish funding my emergency fund faster?",
  },
  {
    id: "cash",
    title: "$34,200 in savings is earning below market",
    detail:
      "Your savings balance is larger than your 3-month emergency need. Moving the excess to a higher-yield account could earn ~$900 more a year.",
    tone: "neutral",
    prompt: "Should I move my extra savings into a higher-yield account?",
  },
]

/** Suggested prompts for the Ask Halo ⌘K launcher. */
export const suggestedPrompts: string[] = [
  "How am I tracking against my goals?",
  "Where is most of my money going?",
  "Am I saving enough for retirement?",
  "What should I do with my extra cash?",
  "How would a $120k home purchase affect my plan?",
]

/** Percent helper for goals. */
export function goalPct(goal: Goal) {
  return Math.round((goal.current / goal.target) * 100)
}
