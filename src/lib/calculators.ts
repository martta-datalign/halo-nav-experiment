/**
 * Pure financial math for the four calculators. No React, no JSX — just inputs
 * in, results out, so the same functions drive both the dialog's live result
 * panel and the headline shown on each calculator card.
 *
 * The reference screenshots use an orange/green/purple palette; that's only the
 * *logic* reference. Presentation uses Halo's own tokens (see components).
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Fixed monthly payment that amortizes `principal` over `n` months at monthly rate `r`. */
export function amortizedPayment(principal: number, r: number, n: number): number {
  if (n <= 0) return 0
  if (r === 0) return principal / n
  const g = Math.pow(1 + r, n)
  return (principal * r * g) / (g - 1)
}

/** Level payment that draws `pv` down to zero over `n` periods at per-period rate `r`. */
function depletionPayment(pv: number, r: number, n: number): number {
  if (n <= 0) return 0
  if (r === 0) return pv / n
  return (pv * r) / (1 - Math.pow(1 + r, -n))
}

const clampNonNeg = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

/**
 * Numeric fields left blank in the form arrive as NaN. Before computing, fall
 * back to the calculator's default for any such field so the result panel still
 * previews sensible numbers (the blank shows the same value as a placeholder).
 */
export function resolveInputs<T extends object>(inputs: T, defaults: T): T {
  const out = { ...inputs } as Record<string, unknown>
  const def = defaults as Record<string, unknown>
  for (const key in def) {
    const v = out[key]
    if (typeof v === "number" && Number.isNaN(v)) out[key] = def[key]
  }
  return out as T
}

/** Blank variant of a defaults object: every numeric field becomes NaN (unset). */
export function makeBlanks<T extends object>(defaults: T): T {
  const out = { ...defaults } as Record<string, unknown>
  for (const key in out) {
    if (typeof out[key] === "number") out[key] = NaN
  }
  return out as T
}

// ---------------------------------------------------------------------------
// 1. Mortgage
// ---------------------------------------------------------------------------

export type HoaPeriod = "month" | "year"

export interface MortgageInputs {
  housePrice: number
  downPayment: number
  loanTermYears: number
  interestRate: number // annual %
  propertyTaxPct: number // %/year of house price
  insurancePerYear: number
  hoaFee: number
  hoaPeriod: HoaPeriod
}

export interface MortgageResult {
  loanAmount: number
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyHOA: number
  totalMonthly: number
}

export const mortgageDefaults: MortgageInputs = {
  housePrice: 1_000_000,
  downPayment: 20_000,
  loanTermYears: 30,
  interestRate: 6.5,
  propertyTaxPct: 1.5,
  insurancePerYear: 1_200,
  hoaFee: 100,
  hoaPeriod: "month",
}

export function computeMortgage(i: MortgageInputs): MortgageResult {
  const loanAmount = clampNonNeg(i.housePrice - i.downPayment)
  const r = i.interestRate / 100 / 12
  const n = i.loanTermYears * 12
  const monthlyPI = amortizedPayment(loanAmount, r, n)
  const monthlyTax = (i.housePrice * (i.propertyTaxPct / 100)) / 12
  const monthlyInsurance = i.insurancePerYear / 12
  const monthlyHOA = i.hoaPeriod === "month" ? i.hoaFee : i.hoaFee / 12
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA
  return { loanAmount, monthlyPI, monthlyTax, monthlyInsurance, monthlyHOA, totalMonthly }
}

// ---------------------------------------------------------------------------
// 2. Home affordability
// ---------------------------------------------------------------------------

export interface DtiRule {
  key: string
  label: string
  frontEnd: number // fraction of gross monthly income for housing
  backEnd: number // fraction for housing + other debt
}

export const DTI_RULES: DtiRule[] = [
  { key: "conventional", label: "Conventional (28% front-end / 36% back-end)", frontEnd: 0.28, backEnd: 0.36 },
  { key: "fha", label: "FHA (31% front-end / 43% back-end)", frontEnd: 0.31, backEnd: 0.43 },
  { key: "conservative", label: "Conservative (25% front-end / 33% back-end)", frontEnd: 0.25, backEnd: 0.33 },
]

export interface AffordabilityInputs {
  annualIncome: number
  loanTermYears: number
  interestRate: number
  currentDebtMonthly: number
  propertyTaxPct: number
  downPaymentPct: number
  hoaFee: number
  hoaPeriod: HoaPeriod
  insurancePerYear: number
  pmiRatePct: number
  dtiRuleKey: string
}

export interface AffordabilityResult {
  borrow: number
  housePrice: number
  downPayment: number
  closingCosts: number
  maxMonthlyHousing: number
  monthlyPI: number
  monthlyPMI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyHOA: number
  annualMaintenance: number
  totalMonthly: number
}

export const affordabilityDefaults: AffordabilityInputs = {
  annualIncome: 1_000_000,
  loanTermYears: 30,
  interestRate: 6.5,
  currentDebtMonthly: 0,
  propertyTaxPct: 1.5,
  downPaymentPct: 20,
  hoaFee: 0,
  hoaPeriod: "month",
  insurancePerYear: 1_500,
  pmiRatePct: 0.5,
  dtiRuleKey: "conventional",
}

export function computeAffordability(i: AffordabilityInputs): AffordabilityResult {
  const rule = DTI_RULES.find((r) => r.key === i.dtiRuleKey) ?? DTI_RULES[0]
  const monthlyIncome = i.annualIncome / 12

  // Housing budget = the tighter of the two DTI limits.
  const frontCap = monthlyIncome * rule.frontEnd
  const backCap = monthlyIncome * rule.backEnd - i.currentDebtMonthly
  const maxMonthlyHousing = clampNonNeg(Math.min(frontCap, backCap))

  const d = i.downPaymentPct / 100
  const r = i.interestRate / 100 / 12
  const n = i.loanTermYears * 12
  // Per-dollar-of-loan monthly payment factor.
  const piFactor = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const pmiMoRate = i.downPaymentPct < 20 ? i.pmiRatePct / 100 / 12 : 0
  const taxMoRate = i.propertyTaxPct / 100 / 12
  const insuranceMo = i.insurancePerYear / 12
  const hoaMo = i.hoaPeriod === "month" ? i.hoaFee : i.hoaFee / 12
  const fixedMo = insuranceMo + hoaMo

  // maxHousing = price * [piFactor*(1-d) + taxMoRate + pmiMoRate*(1-d)] + fixedMo
  const priceCoeff = piFactor * (1 - d) + taxMoRate + pmiMoRate * (1 - d)
  const housePrice = priceCoeff > 0 ? clampNonNeg((maxMonthlyHousing - fixedMo) / priceCoeff) : 0

  const downPayment = housePrice * d
  const borrow = housePrice - downPayment
  const closingCosts = housePrice * 0.03
  const monthlyPI = piFactor * borrow
  const monthlyPMI = pmiMoRate * borrow
  const monthlyTax = taxMoRate * housePrice
  const annualMaintenance = housePrice * 0.01 // ~1%/yr, informational (not in DTI)
  const totalMonthly = monthlyPI + monthlyPMI + monthlyTax + insuranceMo + hoaMo

  return {
    borrow,
    housePrice,
    downPayment,
    closingCosts,
    maxMonthlyHousing,
    monthlyPI,
    monthlyPMI,
    monthlyTax,
    monthlyInsurance: insuranceMo,
    monthlyHOA: hoaMo,
    annualMaintenance,
    totalMonthly,
  }
}

// ---------------------------------------------------------------------------
// 3. Compound interest
// ---------------------------------------------------------------------------

export type ContribPeriod = "month" | "year"

export interface CompoundFrequency {
  key: string
  label: string
  perYear: number
}

export const COMPOUND_FREQUENCIES: CompoundFrequency[] = [
  { key: "annually", label: "Annually", perYear: 1 },
  { key: "semiannually", label: "Semiannually", perYear: 2 },
  { key: "quarterly", label: "Quarterly", perYear: 4 },
  { key: "monthly", label: "Monthly", perYear: 12 },
  { key: "daily", label: "Daily", perYear: 365 },
]

export interface CompoundInputs {
  startingAmount: number
  contribution: number
  contribPeriod: ContribPeriod
  frequencyKey: string
  rateOfReturn: number // annual %
  years: number
}

export interface CompoundYearPoint {
  year: number
  starting: number
  contributions: number
  interest: number
  total: number
}

export interface CompoundResult {
  finalValue: number
  totalContribution: number // starting + contributions
  totalInterest: number
  series: CompoundYearPoint[]
}

export const compoundDefaults: CompoundInputs = {
  startingAmount: 10_000,
  contribution: 21,
  contribPeriod: "month",
  frequencyKey: "monthly",
  rateOfReturn: 3,
  years: 10,
}

export function computeCompound(i: CompoundInputs): CompoundResult {
  const freq = COMPOUND_FREQUENCIES.find((f) => f.key === i.frequencyKey) ?? COMPOUND_FREQUENCIES[3]
  const m = freq.perYear
  const iRate = i.rateOfReturn / 100 / m
  const contribPerYear = i.contribution * (i.contribPeriod === "month" ? 12 : 1)
  const perPeriodContribution = contribPerYear / m
  const years = Math.max(0, Math.round(i.years))

  const series: CompoundYearPoint[] = []
  let balance = i.startingAmount
  let contributedSoFar = 0

  // Snapshot at year 0, then step period-by-period, recording each year boundary.
  series.push({ year: 0, starting: i.startingAmount, contributions: 0, interest: 0, total: balance })
  for (let y = 1; y <= years; y++) {
    for (let p = 0; p < m; p++) {
      balance = balance * (1 + iRate) + perPeriodContribution
      contributedSoFar += perPeriodContribution
    }
    const interest = balance - i.startingAmount - contributedSoFar
    series.push({
      year: y,
      starting: i.startingAmount,
      contributions: contributedSoFar,
      interest: Math.max(0, interest),
      total: balance,
    })
  }

  const finalValue = balance
  const totalContribution = i.startingAmount + contributedSoFar
  return {
    finalValue,
    totalContribution,
    totalInterest: Math.max(0, finalValue - totalContribution),
    series,
  }
}

// ---------------------------------------------------------------------------
// 4. Retirement savings
// ---------------------------------------------------------------------------

/** Age we assume savings must last until, for the safe-withdrawal estimate. */
export const RETIREMENT_DEPLETION_AGE = 95

export interface RetirementInputs {
  currentAge: number
  currentSavings: number
  additionalAnnualInvestment: number
  retirementAge: number
  expectedReturn: number // nominal annual %
  inflation: number // annual %
}

export interface RetirementYearPoint {
  age: number
  investment: number // cumulative principal (today's $)
  balance: number // real balance (today's $)
}

export interface RetirementResult {
  finalBalance: number
  totalPrincipal: number
  growth: number
  years: number
  realReturn: number
  monthlyWithdrawal: number
  annualWithdrawal: number
  untilAge: number
  series: RetirementYearPoint[]
}

export const retirementDefaults: RetirementInputs = {
  currentAge: 23,
  currentSavings: 123_124,
  additionalAnnualInvestment: 10_000,
  retirementAge: 78,
  expectedReturn: 7,
  inflation: 3,
}

export function computeRetirement(i: RetirementInputs): RetirementResult {
  const years = Math.max(0, Math.round(i.retirementAge - i.currentAge))
  // Work entirely in today's dollars: use the inflation-adjusted (real) return.
  const realReturn = (1 + i.expectedReturn / 100) / (1 + i.inflation / 100) - 1

  const series: RetirementYearPoint[] = []
  let balance = i.currentSavings
  let principal = i.currentSavings
  series.push({ age: i.currentAge, investment: principal, balance })
  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + realReturn) + i.additionalAnnualInvestment
    principal += i.additionalAnnualInvestment
    series.push({ age: i.currentAge + y, investment: principal, balance })
  }

  const finalBalance = balance
  const totalPrincipal = principal
  const untilAge = Math.max(i.retirementAge + 1, RETIREMENT_DEPLETION_AGE)
  const drawYears = untilAge - i.retirementAge
  const annualWithdrawal = depletionPayment(finalBalance, realReturn, drawYears)

  return {
    finalBalance,
    totalPrincipal,
    growth: finalBalance - totalPrincipal,
    years,
    realReturn,
    annualWithdrawal,
    monthlyWithdrawal: annualWithdrawal / 12,
    untilAge,
    series,
  }
}
