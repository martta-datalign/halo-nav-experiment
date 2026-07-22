import * as React from "react"
import type { ElementType } from "react"
import {
  RiAddLine,
  RiBankCardLine,
  RiBankLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiLineChartLine,
  RiMore2Line,
  RiRefreshLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { ConnectAccountDialog } from "@/components/connect-account-dialog"
import { useAccounts } from "@/components/accounts-provider"
import { SiteHeader } from "@/components/site-header"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type Account, type AccountKind } from "@/lib/data"
import { formatUSD } from "@/lib/format"
import { cn } from "@/lib/utils"

const ACCOUNT_ICONS: Record<AccountKind, ElementType> = {
  bank: RiBankLine,
  investment: RiLineChartLine,
  card: RiBankCardLine,
}

const INSTITUTION_LOGOS: Record<string, string> = {
  Chase: "/chase.ico",
  Fidelity: "/fidelity.ico",
}

function groupByInstitution(accountList: Account[]) {
  const grouped = new Map<string, Account[]>()
  for (const account of accountList) {
    const institutionAccounts = grouped.get(account.institution) ?? []
    institutionAccounts.push(account)
    grouped.set(account.institution, institutionAccounts)
  }
  return Array.from(grouped, ([institution, institutionAccounts]) => ({
    institution,
    accounts: institutionAccounts,
  }))
}

export default function Accounts() {
  const [connectOpen, setConnectOpen] = React.useState(false)
  const { accounts: connectedAccounts, addAccount, removeAccount } = useAccounts()
  const [disconnecting, setDisconnecting] = React.useState<Account | null>(null)
  const institutions = groupByInstitution(connectedAccounts)

  return (
    <>
      <SiteHeader
        hideAddAccounts
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="header-responsive-action gap-1.5 max-sm:size-9 max-sm:px-0"
                aria-label="Connect accounts"
                onClick={() => setConnectOpen(true)}
              >
                <RiAddLine className="size-4" />
                <span className="header-action-label max-sm:sr-only">Connect accounts</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent portalled={false} side="bottom" sideOffset={8} className="header-action-tooltip">
              Connect accounts
            </TooltipContent>
          </Tooltip>
        }
      />

      <div className="app-page max-w-[1100px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">My Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage connected institutions and manually added accounts.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Last synced today at 9:42 AM</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Institutions" value={String(institutions.length)} />
          <SummaryCard label="Accounts" value={String(connectedAccounts.length)} />
          <SummaryCard label="Sync status" value="Up to date" positive />
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Accounts</h2>
            <span className="text-xs text-muted-foreground">
              Connected balances sync through Plaid; manual balances update here
            </span>
          </div>

          <div className="space-y-4">
            {institutions.map((institution) => (
              <InstitutionCard
                key={institution.institution}
                institution={institution.institution}
                accounts={institution.accounts}
                onDisconnectAccount={setDisconnecting}
              />
            ))}
          </div>
        </section>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Halo uses Plaid for secure, read-only access to connected balances. Manually added accounts stay under your control and do not sync automatically.
        </p>
      </div>

      <ConnectAccountDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onAccountAdded={addAccount}
      />
      <DisconnectAccountDialog
        account={disconnecting}
        onOpenChange={(open) => !open && setDisconnecting(null)}
        onConfirm={(account) => {
          const otherInstitutionAccounts = connectedAccounts.filter(
            (item) => item.institution === account.institution && item.id !== account.id
          ).length
          removeAccount(account.id)
          setDisconnecting(null)
          const manual = account.source === "manual"
          toast.success(`${account.name} ${manual ? "removed" : "disconnected"}`, {
            description:
              manual
                ? "The manual account was removed from Halo."
                : otherInstitutionAccounts > 0
                ? `${account.institution}'s other accounts remain connected.`
                : `${account.institution} has no remaining connected accounts.`,
          })
        }}
      />
    </>
  )
}

function SummaryCard({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <Card className="gap-1 p-5">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold tracking-[-0.02em]", positive && "text-positive")}>
        {value}
      </p>
    </Card>
  )
}

function InstitutionCard({
  institution,
  accounts,
  onDisconnectAccount,
}: {
  institution: string
  accounts: Account[]
  onDisconnectAccount: (account: Account) => void
}) {
  const lastUpdated = accounts[0]?.updatedAt
  const netBalance = accounts.reduce((total, account) => total + account.balance, 0)
  const manualGroup = accounts.every((account) => account.source === "manual")
  const institutionLogo = INSTITUTION_LOGOS[institution]

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5">
          {institutionLogo ? (
            <img src={institutionLogo} alt="" className="size-full object-contain" />
          ) : (
            <RiBankLine className="size-5 text-muted-foreground" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold">{institution}</h3>
            <Badge
              className={cn(
                manualGroup
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-positive-border bg-positive-subtle text-positive"
              )}
              variant="outline"
            >
              <span className={cn("size-1.5 rounded-full", manualGroup ? "bg-muted-foreground" : "bg-positive")} />
              {manualGroup ? "Manual" : "Connected"}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {accounts.length} account{accounts.length === 1 ? "" : "s"} · {manualGroup ? "Added" : "Last synced"} {lastUpdated?.toLowerCase()}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Net balance</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatUSD(netBalance)}</p>
        </div>
        {!manualGroup && <InstitutionMenu institution={institution} />}
      </div>

      <ul className="px-5 sm:px-6">
        {accounts.map((account) => {
          const Icon = ACCOUNT_ICONS[account.kind]
          return (
            <li
              key={account.id}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto_32px] items-center gap-3 border-b border-border py-3.5 last:border-0"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{account.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {account.typeLabel} · {account.source === "manual" ? "Manual entry" : `•••• ${account.mask}`}
                </p>
              </div>
              <p
                className={cn(
                  "text-right text-sm font-semibold tabular-nums",
                  account.balance < 0 && "text-negative"
                )}
              >
                {formatUSD(account.balance)}
              </p>
              <AccountMenu
                account={account}
                onDisconnect={() => onDisconnectAccount(account)}
              />
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function AccountMenu({
  account,
  onDisconnect,
}: {
  account: Account
  onDisconnect: () => void
}) {
  const manual = account.source === "manual"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${account.name}`}>
          <RiMore2Line />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          variant="destructive"
          onSelect={onDisconnect}
          className="whitespace-nowrap"
        >
          <RiDeleteBinLine /> {manual ? "Remove account" : "Disconnect account"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InstitutionMenu({ institution }: { institution: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label={`Actions for ${institution}`}>
          <RiMore2Line />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={() => toast.success(`${institution} balances refreshed`, { description: "Balances are up to date." })}
        >
          <RiRefreshLine /> Refresh balances
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info(`Opening ${institution} connection settings`)}>
          <RiExternalLinkLine /> Manage connection
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => toast.info(`Disconnect ${institution} from connection settings.`)}
          className="whitespace-nowrap"
        >
          <RiDeleteBinLine /> Disconnect institution
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DisconnectAccountDialog({
  account,
  onOpenChange,
  onConfirm,
}: {
  account: Account | null
  onOpenChange: (open: boolean) => void
  onConfirm: (account: Account) => void
}) {
  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account?.source === "manual" ? "Remove account?" : "Disconnect account?"}
          </DialogTitle>
          <DialogDescription>
            {account?.source === "manual"
              ? `${account.name} will be removed from Halo. This does not affect any external financial account.`
              : account
                ? `${account.name} •••• ${account.mask} will no longer sync in Halo. Other accounts connected through ${account.institution} won’t be affected.`
              : "This account will no longer sync in Halo."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!account}
            onClick={() => account && onConfirm(account)}
          >
            {account?.source === "manual" ? "Remove account" : "Disconnect account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
