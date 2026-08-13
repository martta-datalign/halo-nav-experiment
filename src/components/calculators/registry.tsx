import type { ReactNode } from "react"
import {
  RiHome4Line,
  RiPercentLine,
  RiFundsLine,
  RiBillLine,
  type RemixiconComponentType,
} from "@remixicon/react"

import { formatUSD } from "@/lib/format"
import {
  affordabilityDefaults,
  compoundDefaults,
  computeAffordability,
  computeCompound,
  computeMortgage,
  computeRetirement,
  makeBlanks,
  mortgageDefaults,
  resolveInputs,
  retirementDefaults,
} from "@/lib/calculators"
import { AffordabilityForm, AffordabilityResultLive } from "./affordability"
import { CompoundForm, CompoundResultLive } from "./compound"
import { MortgageForm, MortgageResultLive } from "./mortgage"
import { RetirementForm, RetirementResultLive } from "./retirement"

export type CalcId = "affordability" | "mortgage" | "compound" | "retirement"

export interface CalcEntry {
  id: CalcId
  title: string
  description: string
  cta: string
  icon: RemixiconComponentType
  /** Vivid accent for the thumbnail's icon + value bars. */
  accent: string
  /** Bright, saturated gradient painted behind the thumbnail's white panel. */
  gradient: string
  /** Reference defaults — shown as placeholders and used when a field is blank. */
  defaults: unknown
  /** Blank initial inputs (numeric fields unset) so defaults show as placeholders. */
  blanks: unknown
  /** Label shown next to the headline figure on the card. */
  headlineLabel: string
  /** Formats the single figure surfaced on the card once calculated. */
  headline: (inputs: unknown) => string
  /** A couple of the key assumptions behind that figure — not every input. */
  assumptions: (inputs: unknown) => string[]
  Form: (props: { inputs: unknown; onChange: (next: unknown) => void }) => ReactNode
  Result: (props: { inputs: unknown }) => ReactNode
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const CALCULATORS: CalcEntry[] = [
  {
    id: "affordability",
    title: "Home affordability calculator",
    description: "Find out how much house you can afford based on your income and expenses.",
    cta: "Show me my affordability",
    icon: RiHome4Line,
    accent: "oklch(0.6 0.1 250)",
    gradient:
      "linear-gradient(145deg, oklch(0.93 0.05 250) 0%, oklch(0.96 0.03 244) 55%, oklch(0.985 0.014 240) 100%)",
    defaults: affordabilityDefaults,
    blanks: makeBlanks(affordabilityDefaults),
    headlineLabel: "You can afford up to",
    headline: (i) =>
      formatUSD(computeAffordability(resolveInputs(i as any, affordabilityDefaults)).housePrice),
    assumptions: (i) => {
      const r = resolveInputs(i as any, affordabilityDefaults)
      return [`${r.interestRate}% APR`, `${r.downPaymentPct}% down`]
    },
    Form: (p) => <AffordabilityForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <AffordabilityResultLive inputs={p.inputs as any} />,
  },
  {
    id: "mortgage",
    title: "Mortgage calculator",
    description: "Calculate your monthly payment to see if a specific home fits your budget.",
    cta: "Calculate my monthly payment",
    icon: RiBillLine,
    accent: "oklch(0.66 0.1 68)",
    gradient:
      "linear-gradient(145deg, oklch(0.94 0.045 74) 0%, oklch(0.96 0.03 82) 55%, oklch(0.985 0.014 90) 100%)",
    defaults: mortgageDefaults,
    blanks: makeBlanks(mortgageDefaults),
    headlineLabel: "Total monthly payment",
    headline: (i) =>
      formatUSD(computeMortgage(resolveInputs(i as any, mortgageDefaults)).totalMonthly),
    assumptions: (i) => {
      const r = resolveInputs(i as any, mortgageDefaults)
      return [`${r.interestRate}% APR`, `${r.loanTermYears}-yr`]
    },
    Form: (p) => <MortgageForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <MortgageResultLive inputs={p.inputs as any} />,
  },
  {
    id: "compound",
    title: "Compound interest calculator",
    description: "See your future growth with a compound interest rate.",
    cta: "Calculate",
    icon: RiPercentLine,
    accent: "oklch(0.58 0.12 302)",
    gradient:
      "linear-gradient(145deg, oklch(0.93 0.05 305) 0%, oklch(0.96 0.03 314) 55%, oklch(0.985 0.015 320) 100%)",
    defaults: compoundDefaults,
    blanks: makeBlanks(compoundDefaults),
    headlineLabel: "Final value",
    headline: (i) =>
      formatUSD(computeCompound(resolveInputs(i as any, compoundDefaults)).finalValue),
    assumptions: (i) => {
      const r = resolveInputs(i as any, compoundDefaults)
      return [`${r.rateOfReturn}% return`, `${r.years} yr`]
    },
    Form: (p) => <CompoundForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <CompoundResultLive inputs={p.inputs as any} />,
  },
  {
    id: "retirement",
    title: "Retirement savings calculator",
    description: "Calculate the future value of your investments adjusted for inflation.",
    cta: "Calculate",
    icon: RiFundsLine,
    accent: "oklch(0.6 0.09 182)",
    gradient:
      "linear-gradient(145deg, oklch(0.93 0.05 180) 0%, oklch(0.96 0.032 170) 55%, oklch(0.985 0.015 164) 100%)",
    defaults: retirementDefaults,
    blanks: makeBlanks(retirementDefaults),
    headlineLabel: "Final balance (today's $)",
    headline: (i) =>
      formatUSD(computeRetirement(resolveInputs(i as any, retirementDefaults)).finalBalance),
    assumptions: (i) => {
      const r = resolveInputs(i as any, retirementDefaults)
      return [`${r.expectedReturn}% return`, `${r.inflation}% inflation`]
    },
    Form: (p) => <RetirementForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <RetirementResultLive inputs={p.inputs as any} />,
  },
]
