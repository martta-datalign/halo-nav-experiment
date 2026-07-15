import {
  affordabilityDefaults,
  computeAffordability,
  DTI_RULES,
  resolveInputs,
  type AffordabilityInputs,
  type AffordabilityResult,
} from "@/lib/calculators"
import { formatUSD } from "@/lib/format"
import { Field, NumberInput, placeholderText, ResultPanel, SelectInput, Stat } from "./fields"

const ph = placeholderText
const D = affordabilityDefaults

export function AffordabilityForm({
  inputs,
  onChange,
}: {
  inputs: AffordabilityInputs
  onChange: (next: AffordabilityInputs) => void
}) {
  const set = <K extends keyof AffordabilityInputs>(
    key: K,
    value: AffordabilityInputs[K]
  ) => onChange({ ...inputs, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      <Field label="Annual household income (before taxes)" required htmlFor="a-income">
        <NumberInput
          id="a-income"
          format="money"
          prefix="$"
          placeholder={ph(D.annualIncome, "money")}
          value={inputs.annualIncome}
          onValueChange={(v) => set("annualIncome", v)}
        />
      </Field>

      <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-3">
        <Field label="Mortgage loan term" required htmlFor="a-term">
          <SelectInput
            id="a-term"
            value={String(inputs.loanTermYears)}
            onValueChange={(v) => set("loanTermYears", Number(v))}
            options={[
              { value: "30", label: "30 year" },
              { value: "20", label: "20 year" },
              { value: "15", label: "15 year" },
              { value: "10", label: "10 year" },
            ]}
          />
        </Field>
        <Field label="Interest rate (APR %)" required htmlFor="a-rate">
          <NumberInput
            id="a-rate"
            suffix="%"
            placeholder={ph(D.interestRate)}
            value={inputs.interestRate}
            onValueChange={(v) => set("interestRate", v)}
          />
        </Field>
        <Field
          label="Current debt payments"
          hint="Recurring monthly debt (car, student loans, credit cards). Counts toward the back-end DTI limit."
          htmlFor="a-debt"
          className="col-span-2 sm:col-span-1"
        >
          <NumberInput
            id="a-debt"
            format="money"
            prefix="$"
            suffix="/month"
            placeholder={ph(D.currentDebtMonthly, "money")}
            value={inputs.currentDebtMonthly}
            onValueChange={(v) => set("currentDebtMonthly", v)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Annual property tax (%)" required htmlFor="a-tax">
          <NumberInput
            id="a-tax"
            suffix="%"
            placeholder={ph(D.propertyTaxPct)}
            value={inputs.propertyTaxPct}
            onValueChange={(v) => set("propertyTaxPct", v)}
          />
        </Field>
        <Field label="Down payment (%)" required htmlFor="a-down">
          <NumberInput
            id="a-down"
            suffix="%"
            placeholder={ph(D.downPaymentPct)}
            value={inputs.downPaymentPct}
            onValueChange={(v) => set("downPaymentPct", v)}
          />
        </Field>
      </div>

      <Field label="HOA fee" htmlFor="a-hoa">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <NumberInput
            id="a-hoa"
            format="money"
            prefix="$"
            placeholder={ph(D.hoaFee, "money")}
            value={inputs.hoaFee}
            onValueChange={(v) => set("hoaFee", v)}
          />
          <SelectInput
            className="w-32"
            value={inputs.hoaPeriod}
            onValueChange={(v) => set("hoaPeriod", v as AffordabilityInputs["hoaPeriod"])}
            options={[
              { value: "month", label: "/month" },
              { value: "year", label: "/year" },
            ]}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Home insurance" htmlFor="a-ins">
          <NumberInput
            id="a-ins"
            format="money"
            prefix="$"
            suffix="/year"
            placeholder={ph(D.insurancePerYear, "money")}
            value={inputs.insurancePerYear}
            onValueChange={(v) => set("insurancePerYear", v)}
          />
        </Field>
        <Field
          label="PMI rate (annual % of loan)"
          hint="Private mortgage insurance. Applies while the down payment is under 20%."
          htmlFor="a-pmi"
        >
          <NumberInput
            id="a-pmi"
            suffix="%"
            placeholder={ph(D.pmiRatePct)}
            value={inputs.pmiRatePct}
            onValueChange={(v) => set("pmiRatePct", v)}
          />
        </Field>
      </div>

      <Field
        label="Debt-to-income rule"
        hint="How much of your gross income can go to housing (front-end) and total debt (back-end)."
        htmlFor="a-dti"
      >
        <SelectInput
          id="a-dti"
          value={inputs.dtiRuleKey}
          onValueChange={(v) => set("dtiRuleKey", v)}
          options={DTI_RULES.map((r) => ({ value: r.key, label: r.label }))}
        />
      </Field>
    </div>
  )
}

export function AffordabilityResultView({ result }: { result: AffordabilityResult }) {
  return (
    <div className="flex flex-col gap-4">
      <ResultPanel>
        <p className="text-sm font-semibold">Affordability summary</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
          <Stat label="You can borrow" value={formatUSD(result.borrow)} accent large />
          <Stat label="Total house price" value={formatUSD(result.housePrice)} large />
          <Stat label="Down payment" value={formatUSD(result.downPayment)} />
          <Stat
            label="Estimated closing costs (3%)"
            value={formatUSD(result.closingCosts)}
          />
        </div>
      </ResultPanel>

      <ResultPanel>
        <p className="text-sm font-semibold">Monthly cost breakdown</p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
          <Stat label="Monthly mortgage (PI)" value={formatUSD(result.monthlyPI)} />
          <Stat label="Monthly PMI" value={formatUSD(result.monthlyPMI)} />
          <Stat label="Property tax" value={formatUSD(result.monthlyTax)} />
          <Stat label="Home insurance" value={formatUSD(result.monthlyInsurance)} />
          <Stat label="HOA" value={formatUSD(result.monthlyHOA)} />
          <Stat
            label="Annual maintenance (est.)"
            value={formatUSD(result.annualMaintenance)}
          />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-semibold">Total monthly payment</span>
          <span className="text-[22px] font-semibold tabular-nums">
            {formatUSD(result.totalMonthly)}
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          PMI applies while down payment &lt; 20%. Illustrative only — not credit or
          lending advice.
        </p>
      </ResultPanel>
    </div>
  )
}

export function AffordabilityResultLive({ inputs }: { inputs: AffordabilityInputs }) {
  return (
    <AffordabilityResultView result={computeAffordability(resolveInputs(inputs, D))} />
  )
}
