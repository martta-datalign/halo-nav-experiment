import type { ReactNode } from "react"
import {
  RiHome4Line,
  RiLineChartLine,
  RiFundsLine,
  RiBankLine,
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
  /** Reference defaults — shown as placeholders and used when a field is blank. */
  defaults: unknown
  /** Blank initial inputs (numeric fields unset) so defaults show as placeholders. */
  blanks: unknown
  /** Label shown next to the headline figure on the card. */
  headlineLabel: string
  /** Formats the single figure surfaced on the card once calculated. */
  headline: (inputs: unknown) => string
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
    defaults: affordabilityDefaults,
    blanks: makeBlanks(affordabilityDefaults),
    headlineLabel: "You can afford up to",
    headline: (i) =>
      formatUSD(computeAffordability(resolveInputs(i as any, affordabilityDefaults)).housePrice),
    Form: (p) => <AffordabilityForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <AffordabilityResultLive inputs={p.inputs as any} />,
  },
  {
    id: "mortgage",
    title: "Mortgage calculator",
    description: "Calculate your monthly payment to see if a specific home fits your budget.",
    cta: "Calculate my monthly payment",
    icon: RiBankLine,
    defaults: mortgageDefaults,
    blanks: makeBlanks(mortgageDefaults),
    headlineLabel: "Total monthly payment",
    headline: (i) =>
      formatUSD(computeMortgage(resolveInputs(i as any, mortgageDefaults)).totalMonthly),
    Form: (p) => <MortgageForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <MortgageResultLive inputs={p.inputs as any} />,
  },
  {
    id: "compound",
    title: "Compound interest calculator",
    description: "See your future growth with a compound interest rate.",
    cta: "Calculate",
    icon: RiLineChartLine,
    defaults: compoundDefaults,
    blanks: makeBlanks(compoundDefaults),
    headlineLabel: "Final value",
    headline: (i) =>
      formatUSD(computeCompound(resolveInputs(i as any, compoundDefaults)).finalValue),
    Form: (p) => <CompoundForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <CompoundResultLive inputs={p.inputs as any} />,
  },
  {
    id: "retirement",
    title: "Retirement savings calculator",
    description: "Calculate the future value of your investments adjusted for inflation.",
    cta: "Calculate",
    icon: RiFundsLine,
    defaults: retirementDefaults,
    blanks: makeBlanks(retirementDefaults),
    headlineLabel: "Final balance (today's $)",
    headline: (i) =>
      formatUSD(computeRetirement(resolveInputs(i as any, retirementDefaults)).finalBalance),
    Form: (p) => <RetirementForm inputs={p.inputs as any} onChange={p.onChange as any} />,
    Result: (p) => <RetirementResultLive inputs={p.inputs as any} />,
  },
]
