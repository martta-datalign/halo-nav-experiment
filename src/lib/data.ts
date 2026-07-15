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
  institution: string
  typeLabel: string
  mask: string
  balance: number
  updatedAt: string
}

export type IntakeBalance = {
  side: "asset" | "liability"
  category: string
  type?: string
  amount: number
}

/**
 * Original lead-form allocation. Categories with a connected balance are used
 * only for comparison; unconnected categories remain included as estimates.
 */
export const intakeAllocation: IntakeBalance[] = [
  { side: "asset", category: "Cash & Banking", amount: 50_000 },
  { side: "asset", category: "Investment Accounts", amount: 590_000 },
  { side: "asset", category: "Retirement Accounts", amount: 30_000 },
  { side: "asset", category: "Other Assets", type: "Cryptocurrency", amount: 15_000 },
  { side: "liability", category: "Credit Cards", amount: 10_000 },
]

export const unconnectedFormBalances = intakeAllocation.filter(
  (item) => item.category === "Other Assets"
)

/** Connected balances net to $634,421; $15,000 of unconnected form assets brings total net worth to $649,421. */
export const accounts: Account[] = [
  {
    id: "checking",
    name: "Checking",
    kind: "bank",
    institution: "Chase",
    typeLabel: "Checking account",
    mask: "4821",
    balance: 12480,
    updatedAt: "Today at 9:42 AM",
  },
  {
    id: "savings",
    name: "Savings",
    kind: "bank",
    institution: "Chase",
    typeLabel: "Savings account",
    mask: "5679",
    balance: 34200,
    updatedAt: "Today at 9:42 AM",
  },
  {
    id: "investments",
    name: "Investments",
    kind: "investment",
    institution: "Fidelity",
    typeLabel: "Brokerage account",
    mask: "0092",
    balance: 587741,
    updatedAt: "Today at 9:40 AM",
  },
  {
    id: "hsa",
    name: "HSA",
    kind: "investment",
    institution: "Fidelity",
    typeLabel: "Health savings account",
    mask: "7112",
    balance: 8000,
    updatedAt: "Today at 9:40 AM",
  },
  {
    id: "card",
    name: "Credit Card",
    kind: "card",
    institution: "Chase",
    typeLabel: "Credit card",
    mask: "3310",
    balance: -8000,
    updatedAt: "Today at 9:42 AM",
  },
]

/**
 * Every goal belongs to one of five categories. The union is the source of
 * truth for the category picker and the grouped sections on the Goals page.
 */
export type GoalCategory =
  | "lifestyle"
  | "financial-security"
  | "life-milestone"
  | "experience"
  | "other"

export type Goal = {
  id: string
  name: string
  category: GoalCategory
  /** Amount saved toward the goal so far — user-editable. */
  current: number
  target: number
  /** Optional freeform target, e.g. "Dec 2027". */
  targetDate?: string
}

/** Display order for the grouped sections; also drives the category picker. */
export const GOAL_CATEGORY_ORDER: GoalCategory[] = [
  "financial-security",
  "life-milestone",
  "lifestyle",
  "experience",
  "other",
]

/** Label + one-line description per category (icons resolved in components). */
export const goalCategoryMeta: Record<
  GoalCategory,
  { label: string; description: string }
> = {
  "financial-security": {
    label: "Financial security",
    description: "Safety nets and freedom from debt.",
  },
  "life-milestone": {
    label: "Life milestone",
    description: "Major moments — a home, a wedding, a family.",
  },
  lifestyle: {
    label: "Lifestyle",
    description: "Upgrades and purchases for your day-to-day.",
  },
  experience: {
    label: "Experience",
    description: "Travel and once-in-a-lifetime adventures.",
  },
  other: {
    label: "Other",
    description: "Everything else you're setting money aside for.",
  },
}

export const goals: Goal[] = [
  {
    id: "emergency",
    name: "Emergency fund",
    category: "financial-security",
    current: 18000,
    target: 25000,
    targetDate: "Mar 2027",
  },
  {
    id: "loans",
    name: "Pay off student loans",
    category: "financial-security",
    current: 14000,
    target: 22000,
    targetDate: "Dec 2027",
  },
  {
    id: "home",
    name: "Home down payment",
    category: "life-milestone",
    current: 49200,
    target: 120000,
    targetDate: "Jun 2028",
  },
  {
    id: "wedding",
    name: "Wedding",
    category: "life-milestone",
    current: 12500,
    target: 40000,
    targetDate: "Sep 2027",
  },
  {
    id: "car",
    name: "New car",
    category: "lifestyle",
    current: 8500,
    target: 32000,
  },
  {
    id: "japan",
    name: "Trip to Japan",
    category: "experience",
    current: 3200,
    target: 9000,
    targetDate: "Apr 2027",
  },
  {
    id: "giving",
    name: "Charitable giving fund",
    category: "other",
    current: 2000,
    target: 10000,
  },
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

/** Percent funded for a goal, clamped to 0–100 and safe when target is 0. */
export function goalPct(goal: Pick<Goal, "current" | "target">) {
  if (!(goal.target > 0)) return 0
  const pct = Math.round((goal.current / goal.target) * 100)
  return Math.max(0, Math.min(100, pct))
}
