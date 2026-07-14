import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CardTitleRow } from "@/components/home/accounts-card"
import { CardPromptFooter } from "@/components/ask-halo-action"
import { activity } from "@/lib/data"
import { formatUSD } from "@/lib/format"

export function ActivityCard() {
  return (
    <Card className="gap-0 p-5 sm:p-6">
      <CardTitleRow title="Recent activity" caption="Last 7 days" />
      <ul className="mt-1">
        {activity.map((t) => {
          const positive = t.amount > 0
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 border-b border-border py-3 last:border-none last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.date}</div>
              </div>
              <div
                className={cn(
                  "text-[13.5px] font-semibold tabular-nums",
                  positive ? "text-positive" : "text-foreground"
                )}
              >
                {formatUSD(t.amount, { sign: true, cents: true })}
              </div>
            </li>
          )
        })}
      </ul>
      <CardPromptFooter
        text="Summarize last week's spending"
        prompt="Summarize my spending over the last week."
      />
    </Card>
  )
}
