import * as React from "react"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Lightweight month calendar — no external date library. Renders a fixed 6×7
 * grid so its height never jumps between months; leading/trailing days from the
 * adjacent months are shown muted.
 */
export function Calendar({
  selected,
  onSelect,
  className,
}: {
  selected?: Date
  onSelect: (date: Date) => void
  className?: string
}) {
  const today = new Date()
  const [view, setView] = React.useState(() => {
    const base = selected ?? today
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const firstOfMonth = new Date(view.year, view.month, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  // Date of the first cell (may fall in the previous month).
  const gridStart = new Date(view.year, view.month, 1 - startOffset)

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })

  const step = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="flex items-center justify-between px-1 pb-2">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Previous month"
          onClick={() => step(-1)}
        >
          <RiArrowLeftSLine className="size-4" />
        </Button>
        <div className="text-sm font-medium">
          {MONTHS[view.month]} {view.year}
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Next month"
          onClick={() => step(1)}
        >
          <RiArrowRightSLine className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center text-[11px] font-medium text-muted-foreground"
          >
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          const inMonth = d.getMonth() === view.month
          const isSelected = selected && sameDay(d, selected)
          const isToday = sameDay(d, today)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-md text-[13px] tabular-nums outline-none transition-colors",
                "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
                !inMonth && "text-muted-foreground/40",
                inMonth && !isSelected && "text-foreground",
                isToday && !isSelected && "font-semibold text-foreground",
                isSelected && "bg-primary font-semibold text-primary-foreground hover:bg-primary"
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
