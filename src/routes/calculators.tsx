import * as React from "react"
import { RiRestartLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
      <div className="app-page">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Calculators</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Model a purchase or plan for the future. Open a calculator, run the numbers,
            and your result stays on the card.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <CalculatorCard
              key={calc.id}
              calc={calc}
              result={calculated[calc.id] != null ? calc.headline(calculated[calc.id]) : null}
              assumptions={
                calculated[calc.id] != null ? calc.assumptions(calculated[calc.id]) : null
              }
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
  assumptions,
  onOpen,
}: {
  calc: CalcEntry
  result: string | null
  assumptions: string[] | null
  onOpen: () => void
}) {
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
        "group cursor-pointer gap-0 p-4 outline-none transition-[transform,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-input active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <CalcThumb calc={calc} result={result} assumptions={assumptions} />

      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {calc.description}
      </p>
    </Card>
  )
}

/**
 * Cover art for a calculator card — mirrors the Help topic cards' framed preview,
 * but with a soft, airy, per-calculator gradient instead of Help's neutral gray. An
 * inset white panel holds the calculator's icon and name (a real <h2>, so it labels
 * the card for assistive tech). Below the name it shows either the computed result —
 * its label and figure, once the user has run the numbers — or, when nothing has been
 * calculated yet, a blank "worksheet" of skeleton line-items that bleeds off the
 * bottom. The panel stays light so the dark title and figure read cleanly.
 */
function CalcThumb({
  calc,
  result,
  assumptions,
}: {
  calc: CalcEntry
  result: string | null
  assumptions: string[] | null
}) {
  const Icon = calc.icon
  const { accent } = calc
  return (
    <div
      className="relative h-44 overflow-hidden rounded-xl"
      style={{ background: calc.gradient }}
    >
      {/* Crisp white "worksheet" floating on the gradient, bleeding off the bottom. */}
      <div
        className="absolute inset-x-4 -bottom-3 top-4 rounded-t-lg border border-b-0 bg-card p-4"
        style={{ borderColor: `color-mix(in oklab, ${accent} 22%, var(--border))` }}
      >
        <Icon aria-hidden="true" className="size-5" style={{ color: accent }} />
        <h2 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] text-foreground">
          {calc.title}
        </h2>
        {result !== null ? (
          /* The computed result, promoted into the illustration once calculated. */
          <div className="mt-2.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              {calc.headlineLabel}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight tracking-[-0.01em] text-foreground">
              {result}
            </p>
            {assumptions && assumptions.length > 0 && (
              <p className="mt-2 truncate text-[11px] text-muted-foreground">
                {assumptions.join(" · ")}
              </p>
            )}
          </div>
        ) : (
          /* Blank worksheet: a neutral label on the left, an accent value on the right. */
          <>
            <div aria-hidden="true" className="mt-2.5 flex items-center justify-between gap-4">
              <div className="h-1.5 w-3/5 rounded-full bg-foreground/[0.06]" />
              <div
                className="h-1.5 w-10 rounded-full"
                style={{ backgroundColor: `color-mix(in oklab, ${accent} 65%, transparent)` }}
              />
            </div>
            <div aria-hidden="true" className="mt-2 flex items-center justify-between gap-4">
              <div className="h-1.5 w-2/5 rounded-full bg-foreground/[0.06]" />
              <div
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: `color-mix(in oklab, ${accent} 45%, transparent)` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
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
      className="calculator-dialog-viewport grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl lg:h-auto lg:max-h-[92vh] lg:max-w-6xl lg:!w-[min(94vw,1200px)]"
      showCloseButton
    >
      <div className="flex items-start gap-3 border-b border-border px-6 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 pr-8">
          <DialogTitle className="text-2xl tracking-[-0.01em]">{calc.title}</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">{calc.description}</p>
        </div>
      </div>

      {/* On desktop the form column stays put and only the results scroll; on
          mobile the whole body scrolls as one. */}
      <div className="flex min-h-0 flex-col overflow-y-auto lg:max-h-[calc(92vh-6rem)] lg:flex-row lg:overflow-hidden">
        {/* Left: the form's blanks, with the actions pinned at its foot. */}
        <div className="flex min-w-0 flex-col lg:w-1/2 lg:shrink-0 lg:self-stretch lg:overflow-hidden">
          <div className="min-w-0 px-6 pt-6 pb-4 lg:flex-1 lg:overflow-y-auto">
            <calc.Form inputs={inputs} onChange={onChange} />
          </div>
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onReset}>
              <RiRestartLine className="size-4" />
              Reset
            </Button>
            <Button onClick={onCalculate}>{calc.cta}</Button>
          </div>
        </div>
        {/* Right: the calculated results. */}
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
    </DialogContent>
  )
}
