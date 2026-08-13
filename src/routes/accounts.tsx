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
  RiPencilLine,
  RiRefreshLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { ConnectAccountDialog } from "@/components/connect-account-dialog"
import { useAccounts } from "@/components/accounts-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AutoAnimated } from "@/components/ui/auto-animated"
import { BrandLogo } from "@/components/ui/brand-logo"
import { SourceBadge } from "@/components/source-badge"
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
  const { accounts: connectedAccounts, addAccount, removeAccount, renameAccount } =
    useAccounts()
  const [disconnecting, setDisconnecting] = React.useState<Account | null>(null)
  const [renaming, setRenaming] = React.useState<Account | null>(null)
  const institutions = groupByInstitution(connectedAccounts)
  const hasAccounts = connectedAccounts.length > 0

  return (
    <>
      <div className="app-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Accounts</h1>
          </div>
          <div className="flex items-center gap-3">
            {hasAccounts && (
              <Button
                className="gap-1.5"
                aria-label="Connect accounts"
                onClick={() => setConnectOpen(true)}
              >
                <RiAddLine className="size-4" />
                Connect accounts
              </Button>
            )}
          </div>
        </div>

        {hasAccounts ? (
          <>
            <div className="mt-6">
              <div className="grid grid-cols-[28px_minmax(0,1fr)_120px_130px_44px] items-center gap-4 border-b border-border/55 px-5 py-2.5 sm:grid-cols-[28px_minmax(0,1.4fr)_minmax(112px,1fr)_minmax(0,1.2fr)_150px_44px] sm:px-6">
                <span className="text-xs font-medium text-muted-foreground">#</span>
                <span className="text-xs font-medium text-muted-foreground">Account</span>
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                  Type
                </span>
                <span className="text-right text-xs font-medium text-muted-foreground">Balance</span>
                <span className="sr-only">Actions</span>
              </div>

              <AutoAnimated>
              {institutions.map((institution, groupIndex) => (
                <InstitutionGroup
                  key={institution.institution}
                  institution={institution.institution}
                  accounts={institution.accounts}
                  startIndex={institutions
                    .slice(0, groupIndex)
                    .reduce((sum, group) => sum + group.accounts.length, 0)}
                  onDisconnectAccount={setDisconnecting}
                  onRenameAccount={setRenaming}
                />
              ))}
              </AutoAnimated>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Last synced today at 9:42 AM</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Halo uses Plaid for secure, read-only access to connected balances. Manually added accounts stay under your control and do not sync automatically.
            </p>
          </>
        ) : (
          <section className="mt-10 flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <RiBankLine className="size-5" />
              </span>
              <h2 className="mt-4 text-sm font-semibold">No accounts yet</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Connect an institution or add an account manually to build your
                financial picture.
              </p>
              <Button className="mt-5 gap-1.5" onClick={() => setConnectOpen(true)}>
                <RiAddLine className="size-4" />
                Connect accounts
              </Button>
            </div>
          </section>
        )}
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
          toast.success(`${account.nickname || account.name} ${manual ? "removed" : "disconnected"}`, {
            description:
              manual
                ? "The manual account was removed from Halo."
                : otherInstitutionAccounts > 0
                ? `${account.institution}'s other accounts remain connected.`
                : `${account.institution} has no remaining connected accounts.`,
          })
        }}
      />
      <RenameAccountDialog
        account={renaming}
        onOpenChange={(open) => !open && setRenaming(null)}
        onConfirm={(account, nickname) => {
          renameAccount(account.id, nickname)
          setRenaming(null)
          const trimmed = nickname.trim()
          const reverted = !trimmed || trimmed === account.name
          toast.success(reverted ? "Name reset" : "Account renamed", {
            description: reverted
              ? `Now showing as ${account.name}.`
              : `${account.name} now shows as ${trimmed}.`,
          })
        }}
      />
    </>
  )
}

function InstitutionGroup({
  institution,
  accounts,
  startIndex,
  onDisconnectAccount,
  onRenameAccount,
}: {
  institution: string
  accounts: Account[]
  startIndex: number
  onDisconnectAccount: (account: Account) => void
  onRenameAccount: (account: Account) => void
}) {
  const netBalance = accounts.reduce((total, account) => total + account.balance, 0)
  const manualGroup = accounts.every((account) => account.source === "manual")
  const institutionLogo = INSTITUTION_LOGOS[institution]

  return (
    <div className="border-b border-border/55 last:border-b-0">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_120px_130px_44px] items-center gap-4 px-5 py-3.5 sm:grid-cols-[28px_minmax(0,1.4fr)_minmax(112px,1fr)_minmax(0,1.2fr)_150px_44px] sm:px-6">
        <span aria-hidden />
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            name={institution}
            src={institutionLogo}
            fallback={<RiBankLine className="size-4 text-muted-foreground" />}
          />
          <h3 className="truncate text-sm font-semibold">{institution}</h3>
        </div>
        <span aria-hidden />
        <span className="hidden sm:block" aria-hidden />
        <p className="text-right text-sm font-semibold tabular-nums">
          {formatUSD(netBalance)}
        </p>
        {!manualGroup ? (
          <InstitutionMenu institution={institution} />
        ) : (
          <span aria-hidden />
        )}
      </div>

      <AutoAnimated>
      {accounts.map((account, index) => {
        const Icon = ACCOUNT_ICONS[account.kind]
        return (
          <div
            key={account.id}
            className="grid grid-cols-[28px_minmax(0,1fr)_120px_130px_44px] items-center gap-4 border-t border-border/55 px-5 py-3.5 transition-colors hover:bg-secondary/40 sm:grid-cols-[28px_minmax(0,1.4fr)_minmax(112px,1fr)_minmax(0,1.2fr)_150px_44px] sm:px-6"
          >
            <span className="text-sm tabular-nums text-muted-foreground">
              {startIndex + index + 1}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {account.nickname || account.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {account.source === "manual" ? "Manual entry" : `•••• ${account.mask}`}
                </p>
              </div>
            </div>
            <div>
              <SourceBadge source={account.source === "manual" ? "manual" : "connected"} />
            </div>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              {account.typeLabel}
            </p>
            <p
              className={cn(
                "text-right text-sm font-medium tabular-nums",
                account.balance < 0 && "text-negative"
              )}
            >
              {formatUSD(account.balance)}
            </p>
            <AccountMenu
              account={account}
              onRename={() => onRenameAccount(account)}
              onDisconnect={() => onDisconnectAccount(account)}
            />
          </div>
        )
      })}
      </AutoAnimated>
    </div>
  )
}

function AccountMenu({
  account,
  onRename,
  onDisconnect,
}: {
  account: Account
  onRename: () => void
  onDisconnect: () => void
}) {
  const manual = account.source === "manual"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Actions for ${account.nickname || account.name}`}
        >
          <RiMore2Line />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onRename}>
          <RiPencilLine /> Rename account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
        <DropdownMenuItem onSelect={() => toast.info(`Opening connection settings for ${institution}`)}>
          <RiExternalLinkLine /> Manage connection
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => toast.info(`To disconnect ${institution}, remove its accounts below`)}
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

function RenameAccountDialog({
  account,
  onOpenChange,
  onConfirm,
}: {
  account: Account | null
  onOpenChange: (open: boolean) => void
  onConfirm: (account: Account, nickname: string) => void
}) {
  const [draft, setDraft] = React.useState("")

  React.useEffect(() => {
    if (account) setDraft(account.nickname ?? account.name)
  }, [account])

  const original = account?.name ?? ""
  const currentDisplay = account?.nickname || account?.name || ""
  const trimmed = draft.trim()
  const canSave = trimmed.length > 0 && trimmed !== currentDisplay

  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename account</DialogTitle>
          <DialogDescription>
            {account?.source === "manual"
              ? "Set how this account appears across Halo. Your original entry is kept."
              : `Set how this account appears across Halo. This is just a display name — it doesn't change anything at ${account?.institution}.`}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (account && canSave) onConfirm(account, draft)
          }}
        >
          <div className="grid gap-2">
            <label htmlFor="account-nickname" className="text-sm font-medium">
              Account name
            </label>
            <Input
              id="account-nickname"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={original}
              maxLength={40}
              autoFocus
            />
            {account?.nickname && (
              <button
                type="button"
                className="w-fit text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                onClick={() => onConfirm(account, "")}
              >
                Reset to original name ({original})
              </button>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
