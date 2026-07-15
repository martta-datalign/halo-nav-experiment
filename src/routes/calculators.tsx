import * as React from "react"
import { RiRefreshLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SiteHeader } from "@/components/site-header"
import { CALCULATORS, type CalcEntry, type CalcId } from "@/components/calculators/registry"

export default function Calculators() {
  // Inputs persist per calculator so reopening a dialog restores prior edits.
  const [inputs, setInputs] = React.useState<Record<CalcId, unknown>>(() =>
    Object.fromEntries(CALCULATORS.map((c) => [c.id, c.blanks])) as Record<CalcId, unknown>
  )
  // Headline captured at "Calculate" time — null until first run. This is what
  // the card shows, so an uncommitted edit doesn't silently change the card.
  const [results, setResults] = React.useState<Record<CalcId, string | null>>(
    () => Object.fromEntries(CALCULATORS.map((c) => [c.id, null])) as Record<CalcId, string | null>
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
              result={results[calc.id]}
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
            onChange={(next) => setInputs((prev) => ({ ...prev, [openCalc.id]: next }))}
            onCalculate={() => {
              setResults((prev) => ({
                ...prev,
                [openCalc.id]: openCalc.headline(inputs[openCalc.id]),
              }))
              setOpenId(null)
            }}
            onReset={() =>
              setInputs((prev) => ({ ...prev, [openCalc.id]: openCalc.blanks }))
            }
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
  onChange,
  onCalculate,
  onReset,
}: {
  calc: CalcEntry
  inputs: unknown
  onChange: (next: unknown) => void
  onCalculate: () => void
  onReset: () => void
}) {
  const Icon = calc.icon
  return (
    <DialogContent
      className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-6xl lg:!w-[min(94vw,1200px)]"
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

      <div className="grid max-h-[calc(92vh-9.5rem)] grid-cols-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-2">
        <div className="min-w-0">
          <calc.Form inputs={inputs} onChange={onChange} />
        </div>
        <div className="min-w-0">
          <calc.Result inputs={inputs} />
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
