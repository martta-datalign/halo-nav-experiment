import * as React from "react"
import {
  RiArrowLeftLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBankCardLine,
  RiBankLine,
  RiFileList3Line,
  RiHandCoinLine,
  RiHome4Line,
  RiLineChartLine,
  RiPencilLine,
  RiShapesLine,
  RiShieldCheckLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Account, AccountKind } from "@/lib/data"
import { cn } from "@/lib/utils"

type Mode = "choose" | "plaid" | "manual"

/**
 * Account-connection prompt. Opens on a chooser offering two paths — add an
 * account manually, or connect an institution through Plaid. Shared by the
 * accounts page and the global "Connect accounts" header shortcut so both open
 * the same flow in place, without a navigation to /accounts.
 */
export function ConnectAccountDialog({
  open,
  onOpenChange,
  onAccountAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountAdded: (account: Account) => void
}) {
  const [mode, setMode] = React.useState<Mode>("choose")

  // Reset to the chooser whenever the dialog reopens.
  function handleOpenChange(next: boolean) {
    if (!next) setMode("choose")
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "choose" && <ChooseStep onSelect={setMode} />}
        {mode === "plaid" && (
          <PlaidStep
            onBack={() => setMode("choose")}
            onDone={() => handleOpenChange(false)}
          />
        )}
        {mode === "manual" && (
          <ManualStep
            onBack={() => setMode("choose")}
            onDone={(account) => {
              onAccountAdded(account)
              handleOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ChooseStep({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <>
      <DialogHeader>
        <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <RiBankLine className="size-5" />
        </span>
        <DialogTitle>Connect accounts</DialogTitle>
        <DialogDescription>
          Add an account manually, or connect an institution through Plaid to
          sync balances automatically.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2.5">
        <OptionRow
          icon={RiPencilLine}
          title="Add manually"
          description="Enter an account and balance yourself. Best for assets Plaid can’t reach."
          onClick={() => onSelect("manual")}
        />
        <OptionRow
          icon={RiShieldCheckLine}
          title="Connect with Plaid"
          description="Securely link an institution and sync eligible balances automatically."
          onClick={() => onSelect("plaid")}
        />
      </div>
    </>
  )
}

function OptionRow({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-[color,background-color,border-color,transform] duration-150 ease-out hover:border-input hover:bg-secondary/40 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <RiArrowRightSLine className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

function PlaidStep({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: () => void
}) {
  return (
    <>
      <DialogHeader>
        <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <RiShieldCheckLine className="size-5" />
        </span>
        <DialogTitle>Connect with Plaid</DialogTitle>
        <DialogDescription>
          Connect a financial institution through Plaid to sync eligible account
          balances automatically.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border border-border bg-muted/35 p-3 text-xs leading-relaxed text-muted-foreground">
        You’ll sign in securely with Plaid and choose which accounts to share;
        Halo receives read-only account data, never your login credentials.
      </div>
      <DialogFooter>
        <Button variant="outline" className="gap-1.5" onClick={onBack}>
          <RiArrowLeftLine className="size-4" />
          Back
        </Button>
        <Button
          onClick={() => {
            onDone()
            toast.success("Plaid connection flow started")
          }}
        >
          Continue to Plaid
        </Button>
      </DialogFooter>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  Manual entry — field taxonomy                                             */
/*                                                                            */
/*  Category → account type → fields, mirroring the manual-entry spec.        */
/*  Copy rules: required fields get an asterisk in the UI; optional fields    */
/*  carry "(optional)" in the label itself. Value vocabulary is deliberate:   */
/*  Balance (cash/debts), Value (investments/CDs), Estimated value (things    */
/*  the user estimates), Amount/Balance owed (liabilities).                   */
/* -------------------------------------------------------------------------- */

type FieldKind = "text" | "money" | "select"

type ManualField = {
  label: string
  required: boolean
  placeholder: string
  kind: FieldKind
  options?: string[]
}

type ManualCategory = {
  category: string
  /** Short label shown under the category icon tile. */
  short: string
  icon: React.ElementType
  types: { type: string; fields: ManualField[] }[]
}

/** Required free-text field (name/institution). */
const t = (label: string, placeholder: string, required = true): ManualField => ({
  label,
  placeholder,
  required,
  kind: "text",
})

/** Money field. Required unless the label already carries "(optional)". */
const m = (label: string, required = true): ManualField => ({
  label,
  placeholder: "$0.00",
  required,
  kind: "money",
})

const PAYOUT_OPTIONS = ["Lump sum", "Monthly annuity"]

const MANUAL_TAXONOMY: ManualCategory[] = [
  {
    category: "Assets — Cash & Banking",
    short: "Cash",
    icon: RiBankLine,
    types: [
      { type: "Checking Account", fields: [t("Account name", "e.g. Chase Checking"), t("Bank (optional)", "e.g. Chase", false), m("Balance")] },
      { type: "Savings Account", fields: [t("Account name", "e.g. Ally Savings"), t("Bank (optional)", "e.g. Ally", false), m("Balance")] },
      { type: "Money Market", fields: [t("Account name", "e.g. Fidelity Money Market"), t("Bank (optional)", "e.g. Fidelity", false), m("Balance")] },
      { type: "Certificate of Deposit (CD)", fields: [t("Account name", "e.g. 12-month CD"), t("Bank (optional)", "e.g. Marcus", false), m("Value")] },
      { type: "Cash Management", fields: [t("Account name", "e.g. Wealthfront Cash"), t("Provider (optional)", "e.g. Wealthfront", false), m("Balance")] },
    ],
  },
  {
    category: "Assets — Investment",
    short: "Investment",
    icon: RiLineChartLine,
    types: [
      { type: "Brokerage Account", fields: [t("Account name", "e.g. Schwab Brokerage"), t("Brokerage (optional)", "e.g. Schwab", false), m("Value")] },
      { type: "Stocks", fields: [t("Name", "e.g. Apple shares"), m("Value")] },
      { type: "Bonds", fields: [t("Name", "e.g. Treasury bonds"), m("Value")] },
      { type: "Mutual Funds", fields: [t("Name", "e.g. Vanguard 500 fund"), m("Value")] },
      { type: "ETFs", fields: [t("Name", "e.g. VTI holding"), m("Value")] },
      { type: "Private Equity", fields: [t("Name", "e.g. Startup investment"), m("Estimated value")] },
    ],
  },
  {
    category: "Assets — Retirement",
    short: "Retirement",
    icon: RiHandCoinLine,
    types: [
      { type: "401(k)", fields: [t("Account name", "e.g. Employer 401(k)"), t("Provider (optional)", "e.g. Fidelity", false), m("Balance")] },
      { type: "403(b)", fields: [t("Account name", "e.g. University 403(b)"), t("Provider (optional)", "e.g. TIAA", false), m("Balance")] },
      { type: "Traditional IRA", fields: [t("Account name", "e.g. Rollover IRA"), t("Provider (optional)", "e.g. Vanguard", false), m("Balance")] },
      { type: "Roth IRA", fields: [t("Account name", "e.g. Roth IRA"), t("Provider (optional)", "e.g. Vanguard", false), m("Balance")] },
      {
        type: "Pension",
        fields: [
          t("Plan name", "e.g. State pension"),
          t("Provider (optional)", "e.g. CalPERS", false),
          { label: "Payout type (optional)", required: false, placeholder: "Select", kind: "select", options: PAYOUT_OPTIONS },
          m("Value"),
        ],
      },
      { type: "Other Retirement", fields: [t("Account name", "e.g. SEP IRA"), t("Provider (optional)", "e.g. Fidelity", false), m("Balance")] },
    ],
  },
  {
    category: "Assets — Real Estate",
    short: "Real Estate",
    icon: RiHome4Line,
    types: [
      { type: "Primary Residence", fields: [t("Property name", "e.g. Main home"), m("Estimated value"), m("Mortgage owed (optional)", false)] },
      { type: "Rental Property", fields: [t("Property name", "e.g. Rental condo"), m("Estimated value"), m("Mortgage owed (optional)", false)] },
      { type: "Vacant Property / Land", fields: [t("Property name", "e.g. Lot on Oak St"), m("Estimated value"), m("Loan owed (optional)", false)] },
    ],
  },
  {
    category: "Liabilities — Credit Cards",
    short: "Credit Cards",
    icon: RiBankCardLine,
    types: [
      { type: "Credit Card", fields: [t("Card name", "e.g. Amex Gold"), t("Issuer (optional)", "e.g. American Express", false), m("Balance owed"), m("Monthly payment (optional)", false)] },
    ],
  },
  {
    category: "Liabilities — Loans",
    short: "Loans",
    icon: RiFileList3Line,
    types: [
      { type: "Mortgage", fields: [t("Loan name", "e.g. Home mortgage"), t("Lender (optional)", "e.g. Wells Fargo", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Home Equity Loan / HELOC", fields: [t("Loan name", "e.g. Home equity line"), t("Lender (optional)", "e.g. Citi", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Auto Loan", fields: [t("Loan name", "e.g. Car loan"), t("Lender (optional)", "e.g. Toyota Financial", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Student Loan", fields: [t("Loan name", "e.g. Student loans"), t("Lender (optional)", "e.g. Sallie Mae", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Personal Loan", fields: [t("Loan name", "e.g. Personal loan"), t("Lender (optional)", "e.g. SoFi", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Business Loan", fields: [t("Loan name", "e.g. Business loan"), t("Lender (optional)", "e.g. Chase Business", false), m("Amount owed"), m("Monthly payment (optional)", false)] },
      { type: "Line of Credit", fields: [t("Loan name", "e.g. Line of credit"), t("Lender (optional)", "e.g. PNC", false), m("Amount owed"), m("Credit limit (optional)", false)] },
    ],
  },
  {
    category: "Assets — Other",
    short: "Other",
    icon: RiShapesLine,
    types: [
      { type: "Vehicle", fields: [t("Vehicle name", "e.g. Honda Civic"), m("Estimated value"), m("Loan owed (optional)", false)] },
      { type: "Collectibles", fields: [t("Item name", "e.g. Art collection"), m("Estimated value")] },
      { type: "Cryptocurrency", fields: [t("Name", "e.g. Bitcoin wallet"), m("Value")] },
    ],
  },
]

function AnimatedHeight({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState(0)

  React.useEffect(() => {
    const content = contentRef.current
    if (!content || !open) {
      setHeight(0)
      return
    }

    const updateHeight = () => setHeight(content.scrollHeight)
    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(content)
    return () => observer.disconnect()
  }, [open])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "overflow-hidden transition-[height,opacity] duration-[260ms] [transition-timing-function:var(--motion-ease-out)] motion-reduce:transition-none",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      style={{ height: open ? height : 0 }}
    >
      <div ref={contentRef} className="p-1">
        {children}
      </div>
    </div>
  )
}

function ManualStep({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: (account: Account) => void
}) {
  const [categoryIndex, setCategoryIndex] = React.useState<number | null>(null)
  const [type, setType] = React.useState("")
  const [values, setValues] = React.useState<Record<string, string>>({})

  const category = categoryIndex === null ? null : MANUAL_TAXONOMY[categoryIndex]
  const fields = category?.types.find((entry) => entry.type === type)?.fields ?? []

  const canSubmit = type !== "" && fields.every((field) => {
    const value = (values[field.label] ?? "").trim()
    if (field.required && value === "") return false
    if (field.kind !== "money" || value === "") return true
    return Number.isFinite(Number(value.replace(/[$,\s]/g, "")))
  })

  function selectCategory(index: number) {
    setCategoryIndex(index)
    setValues({})
    // Auto-select the type when a category has a single one (e.g. Credit Card).
    const cat = MANUAL_TAXONOMY[index]
    setType(cat.types.length === 1 ? cat.types[0].type : "")
  }

  function selectType(next: string) {
    setType(next)
    setValues({}) // fields differ per type; start clean
  }

  function setValue(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || !category) return
    // The first field is always the account/property/loan name.
    const displayName = (values[fields[0].label] ?? "").trim()
    const balanceField = fields.find((field) => field.kind === "money" && field.required)
    const rawBalance = balanceField ? values[balanceField.label] ?? "0" : "0"
    const amount = Number(rawBalance.replace(/[$,\s]/g, ""))
    const liability = category.category.startsWith("Liabilities")
    const kind: AccountKind = category.category.includes("Investment") ||
      category.category.includes("Retirement")
      ? "investment"
      : category.category.includes("Credit Cards")
        ? "card"
        : "bank"

    onDone({
      id: `manual-${globalThis.crypto.randomUUID()}`,
      name: displayName,
      kind,
      source: "manual",
      institution: "Manually added",
      typeLabel: type,
      mask: "",
      balance: liability ? -Math.abs(amount) : Math.abs(amount),
      updatedAt: "Just now",
    })
    toast.success(`${displayName} added`, {
      description: "Manual account balances won’t sync automatically.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <RiPencilLine className="size-5" />
        </span>
        <DialogTitle>Add account manually</DialogTitle>
        <DialogDescription className="sr-only">
          Add an account manually.
        </DialogDescription>
      </DialogHeader>

      <div className="grid max-h-[52vh] gap-4 overflow-y-auto px-0.5 py-0.5">
        <div className="grid gap-1.5">
          <FieldLabel text="Category" required />
          <div className="grid grid-cols-3 gap-2">
            {MANUAL_TAXONOMY.map((cat, index) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => selectCategory(index)}
                aria-pressed={categoryIndex === index}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center text-xs font-medium leading-tight transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                  categoryIndex === index
                    ? "border-foreground bg-secondary text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                )}
              >
                <cat.icon className="size-[18px]" />
                {cat.short}
              </button>
            ))}
          </div>
        </div>

        <AnimatedHeight open={category !== null}>
          <div className="grid gap-4">
            {category && category.types.length > 1 && (
              <div className="grid gap-1.5">
                <FieldLabel htmlFor="manual-type" text="Account type" required />
                <div className="relative">
                  <select
                    id="manual-type"
                    value={type}
                    onChange={(event) => selectType(event.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Select an account type
                    </option>
                    {category.types.map((entry) => (
                      <option key={entry.type} value={entry.type}>
                        {entry.type}
                      </option>
                    ))}
                  </select>
                  <RiArrowDownSLine className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}

            {fields.length > 0 && (
              <div
                key={`${category?.category}:${type}`}
                className="grid gap-4 animate-in fade-in-0 duration-200 [animation-timing-function:var(--motion-ease-out)] motion-reduce:animate-none"
              >
                {fields.map((field, index) => {
                  const id = `manual-field-${index}`
                  return (
                    <div key={field.label} className="grid gap-1.5">
                      <FieldLabel htmlFor={id} text={field.label} required={field.required} />
                      {field.kind === "money" ? (
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={id}
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pl-6"
                            value={values[field.label] ?? ""}
                            onChange={(event) => setValue(field.label, event.target.value)}
                          />
                        </div>
                      ) : field.kind === "select" ? (
                        <div className="relative">
                          <select
                            id={id}
                            value={values[field.label] ?? ""}
                            onChange={(event) => setValue(field.label, event.target.value)}
                            className={SELECT_CLASS}
                          >
                            <option value="" disabled>
                              {field.placeholder}
                            </option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <RiArrowDownSLine className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      ) : (
                        <Input
                          id={id}
                          placeholder={field.placeholder}
                          value={values[field.label] ?? ""}
                          onChange={(event) => setValue(field.label, event.target.value)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </AnimatedHeight>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" className="gap-1.5" onClick={onBack}>
          <RiArrowLeftLine className="size-4" />
          Back
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          Add account
        </Button>
      </DialogFooter>
    </form>
  )
}

const SELECT_CLASS =
  "h-9 w-full appearance-none rounded-md border border-input bg-transparent py-1 pl-3 pr-9 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"

function FieldLabel({
  htmlFor,
  text,
  required,
}: {
  htmlFor?: string
  text: string
  required: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
      {text}
      {required && <span className="text-destructive"> *</span>}
    </label>
  )
}
