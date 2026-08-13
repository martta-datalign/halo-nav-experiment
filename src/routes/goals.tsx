import * as React from "react"
import type { ElementType } from "react"
import {
  RiAddLine,
  RiArrowUpDownLine,
  RiCalendar2Line,
  RiCloseLine,
  RiDeleteBinLine,
  RiFlag2Line,
  RiFocus3Line,
  RiHeart3Line,
  RiMore2Line,
  RiPencilLine,
  RiPlaneLine,
  RiPriceTag3Line,
  RiSafe2Line,
} from "@remixicon/react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AutoAnimated } from "@/components/ui/auto-animated"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, NumberInput, SelectInput } from "@/components/calculators/fields"
import {
  goalCategoryMeta,
  goalPct,
  goals as seedGoals,
  GOAL_CATEGORY_ORDER,
  type Goal,
  type GoalCategory,
} from "@/lib/data"
import {
  formatGoalDate,
  formatUSD,
  isoToMDY,
  mdyToISO,
  parseISODate,
  toISODate,
} from "@/lib/format"
import { cn } from "@/lib/utils"

/** Per-category icon + slot in the shared categorical/chart palette (Oreo's only
 *  categorical set). `chart` is the 1–5 index → solid is `--chart-N`, pill tints
 *  are `--cat-N-bg` / `--cat-N-fg` (see index.css). Charts and Goals share it. */
const CATEGORY_STYLE: Record<GoalCategory, { icon: ElementType; chart: number }> = {
  "financial-security": { icon: RiSafe2Line, chart: 1 },
  "life-milestone": { icon: RiFlag2Line, chart: 2 },
  lifestyle: { icon: RiHeart3Line, chart: 3 },
  experience: { icon: RiPlaneLine, chart: 4 },
  other: { icon: RiPriceTag3Line, chart: 5 },
}

/** Compact dollar label for dense legends, e.g. $61.7k / $32k / $950. */
function compactUSDk(v: number): string {
  if (v < 1000) return formatUSD(v)
  const k = v / 1000
  return `$${k >= 100 ? Math.round(k) : Math.round(k * 10) / 10}k`
}

const AVG_DAYS_PER_MONTH = 30.44

/** Months from today until an ISO target date (negative if already past,
 *  `null` when there's no parseable date). */
function monthsUntil(iso?: string): number | null {
  if (!iso) return null
  const target = parseISODate(iso)
  if (!target) return null
  const days = (target.getTime() - Date.now()) / 86_400_000
  return days / AVG_DAYS_PER_MONTH
}

/** Compact "time remaining" label from a month count. */
function formatTimeLeft(months: number): string {
  if (months < 0) return "Past due"
  const whole = Math.round(months)
  if (whole <= 0) return "Due this month"
  if (whole < 12) return `${whole} mo left`
  const years = Math.floor(whole / 12)
  const rem = whole % 12
  return rem ? `${years} yr ${rem} mo left` : `${years} yr left`
}

/** Contribution needed each month to reach the target by its date, rounded to a
 *  clean figure. `null` when there's nothing left to save or no future date. */
function requiredMonthly(remaining: number, months: number | null): number | null {
  if (remaining <= 0 || months == null || months <= 0) return null
  const raw = remaining / Math.max(1, months)
  return Math.max(10, Math.round(raw / 10) * 10)
}

type SortKey = "date" | "progress" | "amount"

const SORT_ORDER: SortKey[] = ["date", "progress", "amount"]

const SORT_LABELS: Record<SortKey, string> = {
  date: "Target date",
  progress: "Progress",
  amount: "Target amount",
}

/** Sort a flat goal list by the chosen key (undated goals sink to the bottom). */
function sortGoals(list: Goal[], key: SortKey): Goal[] {
  const time = (g: Goal) =>
    g.targetDate ? parseISODate(g.targetDate)?.getTime() ?? Infinity : Infinity
  return [...list].sort((a, b) => {
    if (key === "date") return time(a) - time(b)
    if (key === "progress") return goalPct(b) - goalPct(a)
    return (b.target || 0) - (a.target || 0)
  })
}

/** Draft shape for the add/edit form (amounts are strings so fields can be blank). */
type GoalDraft = {
  name: string
  category: GoalCategory
  current: number
  target: number
  targetDate: string
}

const EMPTY_DRAFT: GoalDraft = {
  name: "",
  category: "financial-security",
  current: NaN,
  target: NaN,
  targetDate: "",
}

let nextId = 0
function makeId() {
  nextId += 1
  return `goal-custom-${nextId}`
}

export default function Goals({ filled = true }: { filled?: boolean }) {
  const [goals, setGoals] = React.useState<Goal[]>(() =>
    filled ? seedGoals : []
  )
  // `null` = closed, "new" = adding, or the goal being edited.
  const [editing, setEditing] = React.useState<Goal | "new" | null>(null)
  const [deleting, setDeleting] = React.useState<Goal | null>(null)
  const [sort, setSort] = React.useState<SortKey>("date")

  React.useEffect(() => {
    setGoals(filled ? seedGoals : [])
    setEditing(null)
    setDeleting(null)
  }, [filled])

  const sortedGoals = React.useMemo(() => sortGoals(goals, sort), [goals, sort])

  function saveGoal(draft: GoalDraft, existing: Goal | null) {
    const clean: Goal = {
      id: existing?.id ?? makeId(),
      name: draft.name.trim() || "Untitled goal",
      category: draft.category,
      current: Number.isFinite(draft.current) ? Math.max(0, draft.current) : 0,
      target: Number.isFinite(draft.target) ? Math.max(0, draft.target) : 0,
      targetDate: draft.targetDate.trim() || undefined,
    }
    setGoals((prev) =>
      existing
        ? prev.map((g) => (g.id === existing.id ? clean : g))
        : [...prev, clean]
    )
    setEditing(null)
    toast.success(existing ? `${clean.name} updated` : `${clean.name} added`, {
      description: `Saved ${formatUSD(clean.current)} of ${formatUSD(clean.target)}.`,
    })
  }

  return (
    <>

      <div className="app-page">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Goals</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Set what you're saving toward, track how far you've come, and keep the
              amount you've saved so far up to date.
            </p>
          </div>
          {goals.length > 0 && (
            <div className="flex shrink-0 items-center gap-2">
              <SortMenu value={sort} onChange={setSort} />
              <Button
                className="gap-1.5 max-sm:size-9 max-sm:px-0"
                aria-label="Add goal"
                onClick={() => setEditing("new")}
              >
                <RiAddLine className="size-4" />
                <span className="max-sm:hidden">Add goal</span>
              </Button>
            </div>
          )}
        </div>

        {goals.length === 0 ? (
          <EmptyState onAdd={() => setEditing("new")} />
        ) : (
          <>
            <GoalsOverview goals={goals} className="mt-6" />
            <AutoAnimated className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditing(goal)}
                  onDelete={() => setDeleting(goal)}
                />
              ))}
            </AutoAnimated>
          </>
        )}
      </div>

      <GoalDialog
        open={editing !== null}
        goal={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSave={saveGoal}
      />

      <DeleteGoalDialog
        goal={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(goal) => {
          setGoals((prev) => prev.filter((g) => g.id !== goal.id))
          setDeleting(null)
          toast.success(`${goal.name} deleted`)
        }}
      />
    </>
  )
}

/** Sort control — mirrors the "Sort" affordance on list/board views. */
function SortMenu({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (value: SortKey) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-1.5 max-sm:size-9 max-sm:px-0"
          aria-label="Sort goals"
        >
          <RiArrowUpDownLine className="size-4" />
          <span className="max-sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onChange(v as SortKey)}
        >
          {SORT_ORDER.map((key) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {SORT_LABELS[key]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Roll-up across every goal. Instead of restating one percentage, the bar is
 *  a *composition* — how the total saved splits across categories — so the
 *  overview shows where the money is, not just how full it is. */
function GoalsOverview({
  goals,
  className,
}: {
  goals: Goal[]
  className?: string
}) {
  const totalCurrent = goals.reduce((sum, g) => sum + (g.current || 0), 0)
  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0)
  const remaining = Math.max(0, totalTarget - totalCurrent)
  const pct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  // Total you'd need to set aside each month to hit every dated goal on time —
  // the sum of each card's pace, and the most actionable number here.
  const monthlyNeeded = goals.reduce((sum, g) => {
    const need = requiredMonthly(
      Math.max(0, (g.target || 0) - (g.current || 0)),
      monthsUntil(g.targetDate)
    )
    return sum + (need ?? 0)
  }, 0)

  // Saved-so-far grouped by category, in display order — drives the bar + legend.
  const segments = GOAL_CATEGORY_ORDER.map((category) => ({
    category,
    chart: CATEGORY_STYLE[category].chart,
    label: goalCategoryMeta[category].label,
    saved: goals
      .filter((g) => g.category === category)
      .reduce((sum, g) => sum + (g.current || 0), 0),
  }))
    .filter((s) => s.saved > 0)
    .map((s) => ({ ...s, width: totalTarget > 0 ? (s.saved / totalTarget) * 100 : 0 }))

  return (
    <Card className={cn("gap-0 p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total saved
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-[-0.02em]">
            {formatUSD(totalCurrent)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {pct}% of {formatUSD(totalTarget)}
          </p>
        </div>
        <div className="text-right">
          {monthlyNeeded > 0 ? (
            <>
              <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">
                {formatUSD(monthlyNeeded)}
                <span className="text-base font-medium text-muted-foreground">/mo</span>
              </p>
              <p className="text-xs text-muted-foreground">to stay on track</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">
                {formatUSD(remaining)}
              </p>
              <p className="text-xs text-muted-foreground">to go</p>
            </>
          )}
        </div>
      </div>

      {/* Composition bar: coloured segments = saved per category, grey = remaining. */}
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-secondary">
        {segments.map((s) => (
          <div
            key={s.category}
            style={{ width: `${s.width}%`, backgroundColor: `var(--chart-${s.chart})` }}
            title={`${s.label}: ${formatUSD(s.saved)}`}
          />
        ))}
      </div>

      {/* Legend — where the saved money actually sits. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        {segments.map((s) => (
          <span
            key={s.category}
            className="inline-flex items-center gap-1.5 text-muted-foreground"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: `var(--chart-${s.chart})` }}
            />
            {s.label}
            <span className="font-medium tabular-nums text-foreground">
              {compactUSDk(s.saved)}
            </span>
          </span>
        ))}
      </div>
    </Card>
  )
}

/** Segmented tick gauge — thin vertical bars filled left-to-right to `pct`,
 *  echoing the reference card's histogram-style progress read. Filled ticks take
 *  the category colour; the rest are hairline. Value lives in adjacent text, so
 *  the gauge is decorative (aria-hidden). */
function TickGauge({
  pct,
  color = "var(--foreground)",
  className,
}: {
  pct: number
  color?: string
  className?: string
}) {
  const TICKS = 40
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * TICKS)
  return (
    <div className={cn("flex h-5 items-stretch gap-[3px]", className)} aria-hidden>
      {Array.from({ length: TICKS }, (_, i) => (
        <span
          key={i}
          className="flex-1 rounded-full transition-colors duration-300 [transition-timing-function:var(--motion-ease-out)] motion-reduce:transition-none"
          style={{
            backgroundColor: i < filled ? color : "var(--border)",
            transitionDelay: `${i * 8}ms`,
          }}
        />
      ))}
    </div>
  )
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
}) {
  const { chart } = CATEGORY_STYLE[goal.category]
  const label = goalCategoryMeta[goal.category].label
  const pct = goalPct(goal)
  const remaining = Math.max(0, (goal.target || 0) - (goal.current || 0))
  const complete = pct >= 100
  const months = monthsUntil(goal.targetDate)
  const perMonth = complete ? null : requiredMonthly(remaining, months)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onEdit()
        }
      }}
      className={cn(
        "group cursor-pointer gap-0 p-5 outline-none transition-[transform,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-input active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Light category label — the only spot of colour on the card. */}
        <Badge
          variant="secondary"
          className="border-transparent font-medium"
          style={{
            backgroundColor: `var(--cat-${chart}-bg)`,
            color: `var(--cat-${chart}-fg)`,
          }}
        >
          {label}
        </Badge>
        <GoalMenu onEdit={onEdit} onDelete={onDelete} name={goal.name} />
      </div>

      <h3 className="mt-3 truncate text-sm font-semibold leading-snug tracking-[-0.01em]">
        {goal.name}
      </h3>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-[-0.01em]">
          {formatUSD(goal.current)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          of {formatUSD(goal.target)}
        </span>
      </div>

      <TickGauge pct={pct} color={`var(--chart-${chart})`} className="mt-3" />

      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums text-foreground">{pct}% funded</span>
        <span
          className={cn(
            "tabular-nums",
            complete ? "font-medium text-positive" : "text-muted-foreground"
          )}
        >
          {complete ? "Fully funded" : `${formatUSD(remaining)} to go`}
        </span>
      </div>

      {/* Timeline + pace: the "will I make it?" line. */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <RiCalendar2Line className="size-3.5 shrink-0" />
          <span className="truncate">
            {goal.targetDate ? (
              <>
                {formatGoalDate(goal.targetDate)}
                {months != null && ` · ${formatTimeLeft(months)}`}
              </>
            ) : (
              "No target date"
            )}
          </span>
        </span>
        {perMonth != null && (
          <span className="shrink-0 font-medium tabular-nums text-foreground">
            {formatUSD(perMonth)}/mo
          </span>
        )}
      </div>
    </Card>
  )
}

function GoalMenu({
  onEdit,
  onDelete,
  name,
}: {
  onEdit: () => void
  onDelete: () => void
  name: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Actions for ${name}`}
          className="-mr-1.5 -mt-1 shrink-0 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <RiMore2Line />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onEdit}>
          <RiPencilLine /> Edit goal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <RiDeleteBinLine /> Delete goal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Auto-insert slashes as digits are typed → up to `mm/dd/yyyy`. */
function maskMDY(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/**
 * Target-date field: type a date directly as `mm/dd/yyyy`, or pick one from the
 * calendar popover. Both paths commit an ISO `YYYY-MM-DD` string (empty = unset).
 * A live text buffer lets partial input read naturally while typing; on blur it
 * snaps back to the committed value so invalid fragments never linger.
 */
function DateField({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState(() => isoToMDY(value))
  const inputRef = React.useRef<HTMLInputElement>(null)
  const focused = React.useRef(false)
  // Desired caret position expressed as "after N digits", restored post-render
  // so auto-inserted slashes don't scramble the caret while typing/editing.
  const caretDigits = React.useRef<number | null>(null)
  const selected = value ? parseISODate(value) : undefined

  // Reflect external changes (calendar pick, reset) unless mid-edit.
  React.useEffect(() => {
    if (!focused.current) setText(isoToMDY(value))
  }, [value])

  React.useLayoutEffect(() => {
    const target = caretDigits.current
    caretDigits.current = null
    const el = inputRef.current
    if (target == null || !el || !focused.current) return
    let seen = 0
    let idx = text.length
    if (target === 0) idx = 0
    else {
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57) {
          seen++
          if (seen === target) {
            idx = i + 1
            break
          }
        }
      }
    }
    el.setSelectionRange(idx, idx)
  }, [text])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const caret = e.target.selectionStart ?? raw.length
    caretDigits.current = raw.slice(0, caret).replace(/\D/g, "").length
    const masked = maskMDY(raw)
    setText(masked)
    if (masked === "") {
      onChange("")
      return
    }
    const iso = mdyToISO(masked)
    if (iso) onChange(iso)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30"
        )}
      >
        <input
          ref={inputRef}
          id="goal-date"
          inputMode="numeric"
          placeholder="mm/dd/yyyy"
          value={text}
          onChange={handleInput}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false
            caretDigits.current = null
            setText(isoToMDY(value))
          }}
          className="h-full min-w-0 flex-1 bg-transparent pl-3 py-1 tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground/45"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear date"
            className="px-1 text-muted-foreground/70 transition-colors hover:text-foreground"
            onClick={() => onChange("")}
          >
            <RiCloseLine className="size-3.5" />
          </button>
        )}
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open calendar"
            className="flex h-full items-center px-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RiCalendar2Line className="size-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="end" className="w-auto">
        <Calendar
          selected={selected}
          onSelect={(date) => {
            onChange(toISODate(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function GoalDialog({
  open,
  goal,
  onClose,
  onSave,
}: {
  open: boolean
  /** The goal being edited, or null when adding a new one. */
  goal: Goal | null
  onClose: () => void
  onSave: (draft: GoalDraft, existing: Goal | null) => void
}) {
  const [draft, setDraft] = React.useState<GoalDraft>(EMPTY_DRAFT)

  // Seed the form each time the dialog opens (fresh for "new", prefilled for edit).
  React.useEffect(() => {
    if (!open) return
    setDraft(
      goal
        ? {
            name: goal.name,
            category: goal.category,
            current: goal.current,
            target: goal.target,
            targetDate: goal.targetDate ?? "",
          }
        : EMPTY_DRAFT
    )
  }, [open, goal])

  const set = <K extends keyof GoalDraft>(key: K, value: GoalDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const previewPct = goalPct({
    current: Number.isFinite(draft.current) ? draft.current : 0,
    target: Number.isFinite(draft.target) ? draft.target : 0,
  })
  const canSave = draft.name.trim().length > 0 && Number.isFinite(draft.target) && draft.target > 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="goal-dialog-viewport grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:h-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit goal" : "Add a goal"}</DialogTitle>
          <DialogDescription>
            {goal
              ? "Update your target or the amount you've saved so far."
              : "Name your goal, choose a category, and set your target."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          <Field label="Goal name" required htmlFor="goal-name">
            <Input
              id="goal-name"
              placeholder="e.g. Emergency fund"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Category" htmlFor="goal-category">
            <SelectInput
              id="goal-category"
              value={draft.category}
              onValueChange={(v) => set("category", v as GoalCategory)}
              options={GOAL_CATEGORY_ORDER.map((c) => ({
                value: c,
                label: goalCategoryMeta[c].label,
              }))}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Amount saved so far"
              hint="How much you've already put toward this goal."
              htmlFor="goal-current"
            >
              <NumberInput
                id="goal-current"
                format="money"
                prefix="$"
                placeholder="0"
                value={draft.current}
                onValueChange={(v) => set("current", v)}
              />
            </Field>
            <Field label="Target amount" required htmlFor="goal-target">
              <NumberInput
                id="goal-target"
                format="money"
                prefix="$"
                placeholder="0"
                value={draft.target}
                onValueChange={(v) => set("target", v)}
              />
            </Field>
          </div>

          <Field
            label="Target date"
            hint="Optional — the date you'd like to reach this by."
            htmlFor="goal-date"
          >
            <DateField
              value={draft.targetDate}
              onChange={(v) => set("targetDate", v)}
            />
          </Field>

          {/* Live progress preview — reflects the current inputs. */}
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-muted-foreground">Progress</span>
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {previewPct}%
              </span>
            </div>
            <TickGauge
              pct={previewPct}
              color={`var(--chart-${CATEGORY_STYLE[draft.category].chart})`}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={() => onSave(draft, goal)}>
            {goal ? "Save changes" : "Add goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteGoalDialog({
  goal,
  onOpenChange,
  onConfirm,
}: {
  goal: Goal | null
  onOpenChange: (open: boolean) => void
  onConfirm: (goal: Goal) => void
}) {
  return (
    <Dialog open={goal !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete goal?</DialogTitle>
          <DialogDescription>
            {goal
              ? `"${goal.name}" and its saved progress will be removed. This can't be undone.`
              : "This goal will be removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!goal}
            onClick={() => goal && onConfirm(goal)}
          >
            Delete goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <RiFocus3Line className="size-5" />
      </span>
      <p className="mt-4 text-sm font-medium">No goals yet</p>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        Add your first goal to start tracking what you're saving toward.
      </p>
      <Button className="mt-5 gap-1.5" onClick={onAdd}>
        <RiAddLine className="size-4" />
        Add goal
      </Button>
    </div>
  )
}
