import * as React from "react"
import type { ElementType } from "react"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiFlag2Line,
  RiHeart3Line,
  RiMore2Line,
  RiPencilLine,
  RiPlaneLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Field, NumberInput, SelectInput } from "@/components/calculators/fields"
import {
  goalCategoryMeta,
  goalPct,
  goals as seedGoals,
  GOAL_CATEGORY_ORDER,
  type Goal,
  type GoalCategory,
} from "@/lib/data"
import { formatUSD } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Per-category icon + accent colour (accent drives the icon tint + progress bar). */
const CATEGORY_STYLE: Record<GoalCategory, { icon: ElementType; accent: string }> = {
  "financial-security": { icon: RiShieldCheckLine, accent: "var(--chart-2)" },
  "life-milestone": { icon: RiFlag2Line, accent: "var(--chart-1)" },
  lifestyle: { icon: RiHeart3Line, accent: "var(--chart-5)" },
  experience: { icon: RiPlaneLine, accent: "var(--chart-4)" },
  other: { icon: RiPriceTag3Line, accent: "var(--chart-3)" },
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

export default function Goals() {
  const [goals, setGoals] = React.useState<Goal[]>(seedGoals)
  // `null` = closed, "new" = adding, or the goal being edited.
  const [editing, setEditing] = React.useState<Goal | "new" | null>(null)
  const [deleting, setDeleting] = React.useState<Goal | null>(null)

  const totalSaved = goals.reduce((sum, g) => sum + (g.current || 0), 0)
  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0)
  const overallPct = goalPct({ current: totalSaved, target: totalTarget })

  const byCategory = GOAL_CATEGORY_ORDER.map((category) => ({
    category,
    goals: goals.filter((g) => g.category === category),
  })).filter((group) => group.goals.length > 0)

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
      <SiteHeader
        actions={
          <Button
            className="gap-1.5 max-sm:size-9 max-sm:px-0"
            aria-label="Add goal"
            onClick={() => setEditing("new")}
          >
            <RiAddLine className="size-4" />
            <span className="max-sm:hidden">Add goal</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[1440px]">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Goals</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Set what you're saving toward, track how far you've come, and keep the
            amount you've saved so far up to date.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total saved" value={formatUSD(totalSaved)} />
          <SummaryCard label="Total target" value={formatUSD(totalTarget)} />
          <SummaryCard
            label="Overall progress"
            value={`${overallPct}%`}
            hint={`${goals.length} active goal${goals.length === 1 ? "" : "s"}`}
          />
        </div>

        {byCategory.length === 0 ? (
          <EmptyState onAdd={() => setEditing("new")} />
        ) : (
          <div className="mt-8 space-y-8">
            {byCategory.map((group) => (
              <CategorySection
                key={group.category}
                category={group.category}
                goals={group.goals}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
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

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card className="gap-1 p-5">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}

function CategorySection({
  category,
  goals,
  onEdit,
  onDelete,
}: {
  category: GoalCategory
  goals: Goal[]
  onEdit: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}) {
  const meta = goalCategoryMeta[category]
  const { icon: Icon, accent } = CATEGORY_STYLE[category]
  const saved = goals.reduce((sum, g) => sum + (g.current || 0), 0)
  const target = goals.reduce((sum, g) => sum + (g.target || 0), 0)

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary"
          style={{ color: accent }}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{meta.label}</h2>
            <span className="text-xs text-muted-foreground">
              {goals.length} goal{goals.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <p className="hidden shrink-0 text-right text-xs text-muted-foreground tabular-nums sm:block">
          {formatUSD(saved)} of {formatUSD(target)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            accent={accent}
            onEdit={() => onEdit(goal)}
            onDelete={() => onDelete(goal)}
          />
        ))}
      </div>
    </section>
  )
}

function GoalCard({
  goal,
  accent,
  onEdit,
  onDelete,
}: {
  goal: Goal
  accent: string
  onEdit: () => void
  onDelete: () => void
}) {
  const pct = goalPct(goal)
  const remaining = Math.max(0, (goal.target || 0) - (goal.current || 0))
  const complete = pct >= 100

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
        "group cursor-pointer gap-0 p-5 outline-none transition-all",
        "hover:-translate-y-0.5 hover:border-halo-border hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug tracking-[-0.01em]">
            {goal.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {goal.targetDate ? `Target ${goal.targetDate}` : "No target date"}
          </p>
        </div>
        <GoalMenu onEdit={onEdit} onDelete={onDelete} name={goal.name} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold tabular-nums tracking-[-0.01em]">
          {formatUSD(goal.current)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          of {formatUSD(goal.target)}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums" style={{ color: accent }}>
          {pct}% funded
        </span>
        <span className="text-muted-foreground tabular-nums">
          {complete ? "Fully funded 🎉" : `${formatUSD(remaining)} to go`}
        </span>
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
  const accent = CATEGORY_STYLE[draft.category].accent
  const canSave = draft.name.trim().length > 0 && Number.isFinite(draft.target) && draft.target > 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:h-auto sm:max-w-md">
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
            hint="Optional — a month/year you'd like to reach this by."
            htmlFor="goal-date"
          >
            <Input
              id="goal-date"
              placeholder="e.g. Jun 2028"
              value={draft.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
            />
          </Field>

          {/* Live progress preview — reflects the current inputs. */}
          <div className="rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-muted-foreground">Progress</span>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: accent }}>
                {previewPct}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${previewPct}%`, background: accent }}
              />
            </div>
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
      <span className="flex size-11 items-center justify-center rounded-xl bg-halo-subtle text-halo">
        <RiFlag2Line className="size-5" />
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
