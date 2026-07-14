import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { CardTitleRow } from "@/components/home/accounts-card"
import { CardPromptFooter } from "@/components/ask-halo-action"
import { goalPct, goals } from "@/lib/data"
import { formatUSD } from "@/lib/format"

export function GoalsCard() {
  return (
    <Card className="gap-0 p-5 sm:p-6">
      <CardTitleRow title="Goals" caption={`${goals.length} active`} />
      {/* Each goal links to the Goals page, where it can be edited. */}
      <div className="mt-1 flex flex-col gap-1">
        {goals.map((g) => {
          const pct = goalPct(g)
          return (
            <Link
              key={g.id}
              to="/tools/goals"
              className="group -mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-medium">{g.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold tabular-nums">{pct}%</span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                {formatUSD(g.current)} of {formatUSD(g.target)}
              </div>
            </Link>
          )
        })}
      </div>
      <CardPromptFooter
        text="How am I tracking to my goals?"
        prompt="How am I tracking against my financial goals?"
      />
    </Card>
  )
}
