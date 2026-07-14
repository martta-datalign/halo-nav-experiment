import * as React from "react"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { user } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"

import { NetWorthCard } from "@/components/home/net-worth-card"
import { AccountsCard } from "@/components/home/accounts-card"
import { GoalsCard } from "@/components/home/goals-card"
import { ActivityCard } from "@/components/home/activity-card"
import { InsightsCard } from "@/components/home/insights-card"
import { ActionableCard } from "@/components/home/actionable-card"
import { AnalysisCard } from "@/components/home/analysis-card"
import { MoneyFlowCard } from "@/components/home/money-flow-card"

const SUBTABS = [
  "Overview",
  "Household",
  "Assets & liabilities",
  "Money flow",
  "Taxes",
  "Strategies",
] as const
type Subtab = (typeof SUBTABS)[number]

type CardKey =
  | "analysis"
  | "insights"
  | "actionable"
  | "accounts"
  | "goals"
  | "activity"
const CARD_LABELS: Record<CardKey, string> = {
  analysis: "Financial analysis",
  insights: "Halo insights",
  actionable: "Make it actionable",
  accounts: "Accounts",
  goals: "Goals",
  activity: "Recent activity",
}

function todayLabel() {
  try {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return "Monday, July 13, 2026"
  }
}

export default function Home() {
  const [subtab, setSubtab] = React.useState<Subtab>("Overview")
  const [visible, setVisible] = React.useState<Record<CardKey, boolean>>({
    analysis: true,
    insights: true,
    actionable: true,
    accounts: true,
    goals: true,
    activity: true,
  })

  const toggle = (key: CardKey) =>
    setVisible((v) => ({ ...v, [key]: !v[key] }))

  return (
    <>
      <SiteHeader actions={<CustomizeMenu visible={visible} toggle={toggle} />} />
      <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[1440px] 2xl:max-w-[1600px]">
        {/* Greeting */}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {todayLabel()}
          </p>
          <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em]">
            Welcome back, {user.name}
          </h1>
        </div>

      {/* Subtabs */}
      <div className="mt-5 flex items-center gap-1 overflow-x-auto border-b border-border pb-px">
        {SUBTABS.map((t) => (
          <button
            key={t}
            onClick={() => setSubtab(t)}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-[13.5px] font-medium transition-colors",
              t === subtab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
            {t === subtab && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {subtab === "Overview" ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <NetWorthCard />
            {(visible.accounts || visible.goals) && (
              <div className="grid gap-5 sm:grid-cols-2">
                {visible.accounts && <AccountsCard />}
                {visible.goals && <GoalsCard />}
              </div>
            )}
            {visible.activity && <ActivityCard />}
          </div>

          <div className="flex flex-col gap-5">
            {visible.analysis && <AnalysisCard onDismiss={() => toggle("analysis")} />}
            {visible.insights && <InsightsCard onDismiss={() => toggle("insights")} />}
            {visible.actionable && (
              <ActionableCard onDismiss={() => toggle("actionable")} />
            )}
          </div>
        </div>
      ) : subtab === "Money flow" ? (
        <div className="mt-6">
          <MoneyFlowCard />
        </div>
      ) : (
        <div className="mt-6 flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed border-border bg-card/40">
          <p className="text-sm text-muted-foreground">{subtab} — coming in a later pass</p>
        </div>
      )}
      </div>
    </>
  )
}

function CustomizeMenu({
  visible,
  toggle,
}: {
  visible: Record<CardKey, boolean>
  toggle: (key: CardKey) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Customize
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Show on Overview</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked disabled>
          Net worth
        </DropdownMenuCheckboxItem>
        {(Object.keys(CARD_LABELS) as CardKey[]).map((key) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={visible[key]}
            onCheckedChange={() => toggle(key)}
            onSelect={(e) => e.preventDefault()}
          >
            {CARD_LABELS[key]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
