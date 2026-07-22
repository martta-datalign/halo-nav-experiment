import { RiSparkling2Line, RiCloseLine } from "@remixicon/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AskHaloAction } from "@/components/ask-halo-action"
import { insights, type Insight } from "@/lib/data"

const TONE_DOT: Record<Insight["tone"], string> = {
  positive: "bg-positive",
  attention: "bg-warning",
  neutral: "bg-muted-foreground/45",
}

export function InsightsCard({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-halo-subtle text-halo">
          <RiSparkling2Line className="size-3.5" />
        </span>
        <h2 className="text-[15px] font-semibold tracking-[-0.005em]">
          Halo insights
        </h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Updated today</span>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="-mr-1.5 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RiCloseLine className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Insights are read-only takeaways; one prompt below discusses them all. */}
      <ul className="divide-y divide-border">
        {insights.map((it) => (
          <li key={it.id} className="flex items-start gap-3 px-5 py-4">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[it.tone])} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium leading-snug">{it.title}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {it.detail}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-border px-5 py-3.5">
        <AskHaloAction
          text="Ask Halo what to focus on"
          prompt="Walk me through my latest insights and tell me what I should prioritize right now — my net-worth trend, my emergency fund, and my idle savings."
        />
      </div>
    </Card>
  )
}
