import * as React from "react"
import {
  RiAddLine,
  RiBankLine,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiFileTextLine,
  RiLineChartLine,
  RiMore2Line,
  RiShieldCheckLine,
} from "@remixicon/react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts"

import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatUSD } from "@/lib/format"
import { intakeAllocation } from "@/lib/data"

type Side = "asset" | "liability"
type Source = "connected" | "form" | "manual"

type BalanceItem = {
  id: string
  name: string
  category: string
  side: Side
  amount: number
  source: Source
  type?: string
  detail?: string
}

type CompositionDatum = {
  name: string
  value: number
  items: BalanceItem[]
}

function FormField({
  label,
  optional = false,
  required = false,
  children,
}: {
  label: string
  optional?: boolean
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium">
      <span className="block">
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

const MANUAL_CATEGORIES: Record<Side, { group: string; types: string[] }[]> = {
  asset: [
    {
      group: "Cash & Banking",
      types: [
        "Checking Account",
        "Savings Account",
        "Money Market",
        "Certificate of Deposit (CD)",
        "Cash Management",
      ],
    },
    {
      group: "Investment Accounts",
      types: ["Brokerage Account", "Stocks", "Bonds", "Mutual Funds", "ETFs", "Private Equity"],
    },
    {
      group: "Retirement Accounts",
      types: ["401(k)", "403(b)", "Traditional IRA", "Roth IRA", "Pension", "Other Retirement"],
    },
    {
      group: "Real Estate",
      types: ["Primary Residence", "Rental Property", "Vacant Property"],
    },
    {
      group: "Other Assets",
      types: ["Vehicle", "Collectibles", "Cryptocurrency"],
    },
  ],
  liability: [
    { group: "Credit Cards", types: ["Credit Card"] },
    {
      group: "Loans",
      types: [
        "Mortgage",
        "Home Equity Loan",
        "Auto Loan",
        "Student Loan",
        "Personal Loan",
        "Business Loan",
        "Line of Credit",
      ],
    },
  ],
}

const INITIAL_ITEMS: BalanceItem[] = [
  ...intakeAllocation.map((item) => ({
    ...item,
    id: `form-${item.side}-${item.category}`,
    name: item.type ?? item.category,
    source: "form" as const,
    detail: "Submitted May 18, 2026",
  })),
  {
    id: "checking",
    name: "Checking",
    category: "Cash & Banking",
    type: "Checking Account",
    side: "asset",
    amount: 12_480,
    source: "connected",
    detail: "•••• 4821 · Updated today",
  },
  {
    id: "savings",
    name: "Savings",
    category: "Cash & Banking",
    type: "Savings Account",
    side: "asset",
    amount: 34_200,
    source: "connected",
    detail: "•••• 5679 · Updated today",
  },
  {
    id: "investments",
    name: "Investments",
    category: "Investment Accounts",
    type: "Brokerage Account",
    side: "asset",
    amount: 587_741,
    source: "connected",
    detail: "•••• 0092 · Updated today",
  },
  {
    id: "hsa",
    name: "HSA",
    category: "Retirement Accounts",
    type: "Other Retirement",
    side: "asset",
    amount: 8_000,
    source: "connected",
    detail: "•••• 7112 · Updated today",
  },
  {
    id: "credit-card",
    name: "Credit Card",
    category: "Credit Cards",
    type: "Credit Card",
    side: "liability",
    amount: 8_000,
    source: "connected",
    detail: "•••• 3310 · Updated today",
  },
]

const ASSET_COLORS = ["#2453d4", "#3478e5", "#4f9be8", "#75b4ec", "#a2ccf2", "#d2e5fa"]
const DEBT_COLORS = ["#8f4c08", "#b56c00", "#dd9700", "#f1ba00", "#f6d65d", "#fae8a7"]

function sum(items: BalanceItem[], side: Side) {
  return items.filter((item) => item.side === side).reduce((total, item) => total + item.amount, 0)
}

function effectiveItems(items: BalanceItem[]) {
  const confirmedItems = items.filter((item) => item.source !== "form")

  return items.filter(
    (item) =>
      item.source !== "form" ||
      !confirmedItems.some(
        (confirmed) =>
          confirmed.side === item.side &&
          (item.type
            ? confirmed.type === item.type
            : confirmed.category === item.category)
      )
  )
}

function groupItems(items: BalanceItem[], side: Side) {
  const grouped = new Map<string, { value: number; items: BalanceItem[] }>()
  for (const item of items) {
    if (item.side !== side) continue
    const current = grouped.get(item.category) ?? {
      value: 0,
      items: [],
    }
    current.value += item.amount
    current.items.push(item)
    grouped.set(item.category, current)
  }
  return Array.from(grouped, ([name, entry]) => ({
    name,
    value: entry.value,
    items: entry.items,
  })).sort(
    (a, b) => b.value - a.value
  )
}

export function AssetsLiabilities() {
  const [items, setItems] = React.useState<BalanceItem[]>(INITIAL_ITEMS)
  const [adding, setAdding] = React.useState<Side | null>(null)
  const [editing, setEditing] = React.useState<BalanceItem | null>(null)
  const includedItems = effectiveItems(items)

  const totalAssets = sum(includedItems, "asset")
  const totalLiabilities = sum(includedItems, "liability")
  const connectedCount = includedItems.filter((item) => item.source === "connected").length
  const estimatedCount = includedItems.filter((item) => item.source === "form").length
  const manualCount = includedItems.filter((item) => item.source === "manual").length

  const removeEditableItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id || item.source === "connected"))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>As of Jul 15, 2026</span>
        <span aria-hidden="true">·</span>
        <span>{connectedCount} connected</span>
        {estimatedCount > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{estimatedCount} estimated from form</span>
          </>
        )}
        {manualCount > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{manualCount} manual</span>
          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total assets" value={totalAssets} />
        <Summary label="Total liabilities" value={totalLiabilities} />
        <Summary label="Net worth" value={totalAssets - totalLiabilities} emphasis />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <CompositionCard
          title="Asset composition"
          side="asset"
          total={totalAssets}
          data={groupItems(includedItems, "asset")}
          colors={ASSET_COLORS}
        />
        <CompositionCard
          title="Debt composition"
          side="liability"
          total={totalLiabilities}
          data={groupItems(includedItems, "liability")}
          colors={DEBT_COLORS}
        />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold">Balance details</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Connected balances replace matching form estimates. Unconnected categories continue using estimated form values.
          </p>
        </div>
        <BalanceSection
          title="Assets"
          side="asset"
          items={includedItems}
          onAdd={() => setAdding("asset")}
          onEdit={setEditing}
          onRemove={removeEditableItem}
        />
        <BalanceSection
          title="Liabilities"
          side="liability"
          items={includedItems}
          onAdd={() => setAdding("liability")}
          onEdit={setEditing}
          onRemove={removeEditableItem}
          last
        />
      </Card>

      <AddBalanceDialog
        side={adding}
        onOpenChange={(open) => !open && setAdding(null)}
        onAdd={(item) => {
          setItems((current) => [...current, item])
          setAdding(null)
        }}
      />
      <EditValueDialog
        item={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(id, amount) => {
          setItems((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    amount,
                    source: item.source === "form" ? "manual" : item.source,
                    detail: "Updated just now",
                  }
                : item
            )
          )
          setEditing(null)
        }}
      />
    </div>
  )
}

function Summary({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <Card className={cn("gap-1 p-5", emphasis && "border-halo-border bg-halo-subtle/30")}>
      <p className={cn("text-[13px] font-medium", emphasis ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </p>
      <p
        className={cn(
          "font-semibold leading-tight tracking-[-0.02em] tabular-nums",
          emphasis ? "text-[28px]" : "text-[26px]"
        )}
      >
        {formatUSD(value)}
      </p>
    </Card>
  )
}

function CompositionCard({
  title,
  side,
  total,
  data,
  colors,
}: {
  title: string
  side: Side
  total: number
  data: CompositionDatum[]
  colors: string[]
}) {
  return (
    <Card className="gap-4 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">Percentages are calculated from current balances</p>
      </div>
      <div className="grid items-center gap-4 sm:grid-cols-[220px_1fr]">
        <div className="relative mx-auto size-[220px]">
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground">
              {side === "asset" ? "Total assets" : "Total liabilities"}
            </span>
            <span className="mt-1 text-lg font-semibold tabular-nums">
              {formatUSD(total)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} className="relative z-10">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={70} outerRadius={98} paddingAngle={2} stroke="var(--card)" strokeWidth={3}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const slice = payload[0].payload as CompositionDatum
                  const percentage = total > 0 ? (slice.value / total) * 100 : 0
                  return (
                    <div className="min-w-[230px] max-w-[300px] rounded-lg border border-border bg-popover p-3 shadow-md">
                      <p className="text-xs font-medium text-muted-foreground">{slice.name}</p>
                      <div className="mt-1 flex items-baseline justify-between gap-4">
                        <p className="text-base font-semibold tabular-nums text-foreground">
                          {formatUSD(slice.value)}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="mt-2 space-y-2 border-t border-border pt-2">
                        {slice.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                            <span className="min-w-0 truncate text-xs font-medium text-foreground">
                              {item.name}
                            </span>
                            <span className="text-xs font-medium tabular-nums text-foreground">
                              {formatUSD(item.amount)}
                            </span>
                            <span className="col-span-2 text-[10.5px] text-muted-foreground">
                              {item.source === "connected"
                                ? "Connected"
                                : item.source === "form"
                                  ? "Estimated from form"
                                  : "Manual"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-3">
          {data.map((entry, index) => {
            const percentage = total > 0 ? (entry.value / total) * 100 : 0
            return (
              <li key={entry.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 text-[13px]">
                <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="min-w-0 truncate text-foreground">{entry.name}</span>
                <span className="font-medium tabular-nums">{percentage.toFixed(1)}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}

function BalanceSection({
  title,
  side,
  items,
  onAdd,
  onEdit,
  onRemove,
  last = false,
}: {
  title: string
  side: Side
  items: BalanceItem[]
  onAdd: () => void
  onEdit: (item: BalanceItem) => void
  onRemove: (id: string) => void
  last?: boolean
}) {
  const visible = items.filter((item) => item.side === side)
  return (
    <section className={cn("px-5 py-4 sm:px-6", !last && "border-b border-border")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <RiAddLine /> Add {side}
        </Button>
      </div>
      <ul>
        {visible.map((item) => {
          const Icon =
            item.source === "connected"
              ? RiBankLine
              : item.source === "form"
                ? RiFileTextLine
                : side === "asset"
                  ? RiLineChartLine
                  : RiExternalLinkLine
          const sourceLabel =
            item.source === "connected"
              ? "Connected"
              : item.source === "form"
                ? "Estimated from form"
                : "Manual"
          return (
            <li
              key={item.id}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto_32px] items-center gap-3 border-b border-border py-3 last:border-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {item.source === "connected" ? <RiShieldCheckLine /> : null}
                    {sourceLabel}
                  </Badge>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.type ? `${item.type} · ${item.category}` : item.category}
                  {item.detail ? ` · ${item.detail}` : ""}
                </div>
              </div>
              <span className="min-w-[88px] text-right text-sm font-semibold tabular-nums">
                {formatUSD(item.amount)}
              </span>
              {item.source !== "connected" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Actions for ${item.name}`}
                      className="text-muted-foreground"
                    >
                      <RiMore2Line />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onSelect={() => onEdit(item)}>
                      <RiEditLine /> Edit value
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onRemove(item.id)}
                    >
                      <RiDeleteBinLine /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="size-8 shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function AddBalanceDialog({
  side,
  onOpenChange,
  onAdd,
}: {
  side: Side | null
  onOpenChange: (open: boolean) => void
  onAdd: (item: BalanceItem) => void
}) {
  const [name, setName] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const groups = MANUAL_CATEGORIES[side ?? "asset"]
  const [category, setCategory] = React.useState(MANUAL_CATEGORIES.asset[0].group)
  const [balanceType, setBalanceType] = React.useState(MANUAL_CATEGORIES.asset[0].types[0])

  React.useEffect(() => {
    if (!side) return
    const firstGroup = MANUAL_CATEGORIES[side][0]
    setName("")
    setAmount("")
    setCategory(firstGroup.group)
    setBalanceType(firstGroup.types[0])
  }, [side])

  const parsedAmount = Number(amount.replace(/[$,\s]/g, ""))
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!side || !valid) return
    onAdd({
      id: `manual-${Date.now()}`,
      name: name.trim() || balanceType,
      category,
      type: balanceType,
      side,
      amount: parsedAmount,
      source: "manual",
      detail: "Updated just now",
    })
  }

  return (
    <Dialog open={side !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add {side === "asset" ? "asset" : "liability"}</DialogTitle>
          <DialogDescription>
            Enter an account manually. To keep its balance updated automatically,
            connect it through Plaid using Add accounts instead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Account name" optional>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. My primary account" autoFocus />
          </FormField>
          <FormField label={`${side === "asset" ? "Asset" : "Liability"} type`}>
            <select
              value={`${category}:::${balanceType}`}
              onChange={(event) => {
                const [nextCategory, nextType] = event.target.value.split(":::")
                setCategory(nextCategory)
                setBalanceType(nextType)
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              {groups.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.types.map((type) => (
                    <option key={type} value={`${group.group}:::${type}`}>{type}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </FormField>
          <FormField label="Account value" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input className="pl-7" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0" required />
            </div>
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditValueDialog({
  item,
  onOpenChange,
  onSave,
}: {
  item: BalanceItem | null
  onOpenChange: (open: boolean) => void
  onSave: (id: string, amount: number) => void
}) {
  const [amount, setAmount] = React.useState("")

  React.useEffect(() => {
    if (item) setAmount(String(item.amount))
  }, [item])

  const parsedAmount = Number(amount.replace(/[$,\s]/g, ""))
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!item || !valid) return
    onSave(item.id, parsedAmount)
  }

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit value</DialogTitle>
          <DialogDescription>
            Update the current value for {item?.name ?? "this item"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Account value" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                className="pl-7"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="0"
                autoFocus
                required
              />
            </div>
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
