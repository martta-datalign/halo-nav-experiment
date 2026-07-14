import type { ElementType } from "react"
import { CreditCard, Landmark, LineChart } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CardPromptFooter } from "@/components/ask-halo-action"
import { accounts, type AccountKind } from "@/lib/data"
import { formatUSD } from "@/lib/format"

const ICONS: Record<AccountKind, ElementType> = {
  bank: Landmark,
  investment: LineChart,
  card: CreditCard,
}

export function AccountsCard() {
  return (
    <Card className="gap-0 p-5 sm:p-6">
      <CardTitleRow title="Accounts" caption={`${accounts.length} connected`} />
      <ul className="mt-1">
        {accounts.map((a) => {
          const Icon = ICONS[a.kind]
          const negative = a.balance < 0
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 border-b border-border py-3 last:border-none last:pb-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  •••• {a.mask}
                </div>
              </div>
              <div
                className={cn(
                  "text-[13.5px] font-semibold tabular-nums",
                  negative ? "text-negative" : "text-foreground"
                )}
              >
                {formatUSD(a.balance, { sign: negative })}
              </div>
            </li>
          )
        })}
      </ul>
      <CardPromptFooter
        text="Break down my balances"
        prompt="Give me a breakdown of my accounts and balances."
      />
    </Card>
  )
}

/** Shared card header row (title + optional caption). */
export function CardTitleRow({
  title,
  caption,
}: {
  title: string
  caption?: string
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold tracking-[-0.005em]">{title}</h2>
      {caption && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </div>
  )
}
