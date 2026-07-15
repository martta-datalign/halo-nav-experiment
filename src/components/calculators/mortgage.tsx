import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { formatUSD } from "@/lib/format"
import {
  computeMortgage,
  mortgageDefaults,
  resolveInputs,
  type MortgageInputs,
  type MortgageResult,
} from "@/lib/calculators"
import { Field, NumberInput, placeholderText, ResultPanel, SelectInput } from "./fields"

const ph = placeholderText

const SLICE_COLORS = ["var(--chart-1)", "var(--chart-5)", "var(--chart-4)", "var(--chart-3)"]

export function MortgageForm({
  inputs,
  onChange,
}: {
  inputs: MortgageInputs
  onChange: (next: MortgageInputs) => void
}) {
  const set = <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) =>
    onChange({ ...inputs, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      <Field label="House price" required htmlFor="m-price">
        <NumberInput
          id="m-price"
          format="money"
          prefix="$"
          placeholder={ph(mortgageDefaults.housePrice, "money")}
          value={inputs.housePrice}
          onValueChange={(v) => set("housePrice", v)}
        />
      </Field>

      <Field label="Down payment" required htmlFor="m-down">
        <NumberInput
          id="m-down"
          format="money"
          prefix="$"
          placeholder={ph(mortgageDefaults.downPayment, "money")}
          value={inputs.downPayment}
          onValueChange={(v) => set("downPayment", v)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Loan term" required htmlFor="m-term">
          <SelectInput
            id="m-term"
            value={String(inputs.loanTermYears)}
            onValueChange={(v) => set("loanTermYears", Number(v))}
            options={[
              { value: "30", label: "30 years" },
              { value: "20", label: "20 years" },
              { value: "15", label: "15 years" },
              { value: "10", label: "10 years" },
            ]}
          />
        </Field>
        <Field label="Interest rate (%)" required htmlFor="m-rate">
          <NumberInput
            id="m-rate"
            placeholder={ph(mortgageDefaults.interestRate)}
            value={inputs.interestRate}
            onValueChange={(v) => set("interestRate", v)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Property tax (%/year)" required htmlFor="m-tax">
          <NumberInput
            id="m-tax"
            placeholder={ph(mortgageDefaults.propertyTaxPct)}
            value={inputs.propertyTaxPct}
            onValueChange={(v) => set("propertyTaxPct", v)}
          />
        </Field>
        <Field label="Insurance ($/year)" htmlFor="m-ins">
          <NumberInput
            id="m-ins"
            format="money"
            prefix="$"
            placeholder={ph(mortgageDefaults.insurancePerYear, "money")}
            value={inputs.insurancePerYear}
            onValueChange={(v) => set("insurancePerYear", v)}
          />
        </Field>
      </div>

      <Field label="HOA fee" htmlFor="m-hoa">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <NumberInput
            id="m-hoa"
            format="money"
            prefix="$"
            placeholder={ph(mortgageDefaults.hoaFee, "money")}
            value={inputs.hoaFee}
            onValueChange={(v) => set("hoaFee", v)}
          />
          <SelectInput
            className="w-32"
            value={inputs.hoaPeriod}
            onValueChange={(v) => set("hoaPeriod", v as MortgageInputs["hoaPeriod"])}
            options={[
              { value: "month", label: "/month" },
              { value: "year", label: "/year" },
            ]}
          />
        </div>
      </Field>
    </div>
  )
}

export function MortgageResultView({ result }: { result: MortgageResult }) {
  const slices = [
    { name: "Principal & Interest", value: result.monthlyPI },
    { name: "Property tax", value: result.monthlyTax },
    { name: "Insurance", value: result.monthlyInsurance },
    { name: "HOA fee", value: result.monthlyHOA },
  ].filter((s) => s.value > 0)

  const total = result.totalMonthly || 1

  return (
    <div className="flex flex-col gap-4">
      <ResultPanel className="text-center">
        <p className="text-[13px] font-medium text-muted-foreground">Total monthly payment</p>
        <p className="mt-1.5 text-[32px] font-semibold leading-none tabular-nums text-halo">
          {formatUSD(result.totalMonthly)}
        </p>
      </ResultPanel>

      <ResultPanel>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={1.5}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((_, i) => (
                    <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-muted-foreground">Loan amount</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatUSD(result.loanAmount)}
              </span>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-2.5">
            {slices.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                  {s.name} — {((s.value / total) * 100).toFixed(1)}%
                </span>
                <span className="text-[13px] font-semibold tabular-nums">
                  {formatUSD(s.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </ResultPanel>
    </div>
  )
}

export function MortgageResultLive({ inputs }: { inputs: MortgageInputs }) {
  return <MortgageResultView result={computeMortgage(resolveInputs(inputs, mortgageDefaults))} />
}
