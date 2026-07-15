import * as React from "react"
import { RiRefreshLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SiteHeader } from "@/components/site-header"
import { EmptyResult } from "@/components/calculators/fields"
import { CALCULATORS, type CalcEntry, type CalcId } from "@/components/calculators/registry"

export default function Calculators() {
  // Draft inputs, edited live and persisted so reopening restores prior edits.
  const [inputs, setInputs] = React.useState<Record<CalcId, unknown>>(() =>
    Object.fromEntries(CALCULATORS.map((c) => [c.id, c.blanks])) as Record<CalcId, unknown>
  )
  // Snapshot of the inputs at the last "Calculate" press — null until first run.
  // Results (dialog + card) are derived from this, never from the live draft, so
  // nothing computes until the user explicitly calculates.
  const [calculated, setCalculated] = React.useState<Record<CalcId, unknown | null>>(
    () => Object.fromEntries(CALCULATORS.map((c) => [c.id, null])) as Record<CalcId, unknown | null>
  )
  const [openId, setOpenId] = React.useState<CalcId | null>(null)

  const openCalc = CALCULATORS.find((c) => c.id === openId) ?? null

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[1440px]">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Calculators</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Model a purchase or plan for the future. Open a calculator, run the numbers,
            and your result stays on the card.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {CALCULATORS.map((calc) => (
            <CalculatorCard
              key={calc.id}
              calc={calc}
              result={calculated[calc.id] != null ? calc.headline(calculated[calc.id]) : null}
              onOpen={() => setOpenId(calc.id)}
            />
          ))}
        </div>
      </div>

      <Dialog open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        {openCalc && (
          <CalculatorDialog
            key={openCalc.id}
            calc={openCalc}
            inputs={inputs[openCalc.id]}
            calculated={calculated[openCalc.id]}
            onChange={(next) => setInputs((prev) => ({ ...prev, [openCalc.id]: next }))}
            onCalculate={() =>
              // Snapshot the current draft; keep the dialog open so results show inline.
              setCalculated((prev) => ({ ...prev, [openCalc.id]: inputs[openCalc.id] }))
            }
            onReset={() => {
              setInputs((prev) => ({ ...prev, [openCalc.id]: openCalc.blanks }))
              setCalculated((prev) => ({ ...prev, [openCalc.id]: null }))
            }}
          />
        )}
      </Dialog>
    </>
  )
}

function CalculatorCard({
  calc,
  result,
  onOpen,
}: {
  calc: CalcEntry
  result: string | null
  onOpen: () => void
}) {
  const Icon = calc.icon
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        "group cursor-pointer gap-0 p-5 outline-none transition-all",
        "hover:-translate-y-0.5 hover:border-halo-border hover:bg-halo-subtle/30 hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-halo-subtle text-halo">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">
            {calc.title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {calc.description}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">{calc.headlineLabel}</p>
        {result !== null ? (
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.01em] text-foreground">
            {result}
          </p>
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground/40">
            —
          </p>
        )}
      </div>
    </Card>
  )
}

function CalculatorDialog({
  calc,
  inputs,
  calculated,
  onChange,
  onCalculate,
  onReset,
}: {
  calc: CalcEntry
  inputs: unknown
  /** Snapshot from the last Calculate, or null if not calculated yet. */
  calculated: unknown | null
  onChange: (next: unknown) => void
  onCalculate: () => void
  onReset: () => void
}) {
  const Icon = calc.icon
  const hasResult = calculated != null

  return (
    <DialogContent
      className="h-[92dvh] max-h-[92dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl lg:h-auto lg:max-h-[92vh] lg:max-w-6xl lg:!w-[min(94vw,1200px)]"
      showCloseButton
    >
      <div className="flex items-start gap-3 border-b border-border px-6 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-halo-subtle text-halo">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 pr-8">
          <DialogTitle className="text-lg tracking-[-0.01em]">{calc.title}</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">{calc.description}</p>
        </div>
      </div>

      {/* On desktop the form column stays put and only the results scroll; on
          mobile the whole body scrolls as one. */}
      <div className="flex min-h-0 flex-col overflow-y-auto lg:max-h-[calc(92vh-9.5rem)] lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 px-6 pt-6 pb-4 lg:w-1/2 lg:shrink-0 lg:self-stretch lg:overflow-y-auto">
          <calc.Form inputs={inputs} onChange={onChange} />
        </div>
        <div className="min-w-0 px-6 pb-4 lg:w-1/2 lg:self-stretch lg:overflow-y-auto lg:border-l lg:border-border lg:pt-6">
          <div
            key={hasResult ? "calculated" : "empty"}
            className="calculator-result-disclosure h-full"
          >
            {hasResult ? (
              <>
                {/* Results render from the calculated snapshot, not the live draft. */}
                <calc.Result inputs={calculated} />
              </>
            ) : (
              <EmptyResult
                cta={calc.cta}
                preview={<calc.Result inputs={calc.defaults} />}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
        <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onReset}>
          <RiRefreshLine className="size-4" />
          Reset
        </Button>
        <Button onClick={onCalculate}>{calc.cta}</Button>
      </div>
    </DialogContent>
  )
}
