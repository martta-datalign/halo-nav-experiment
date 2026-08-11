import { useState } from "react"
import { Link } from "react-router-dom"
import { RiNotification3Line, RiAddLine, RiSparkling2Line } from "@remixicon/react"

import { ConnectAccountDialog } from "@/components/connect-account-dialog"
import { useAccounts } from "@/components/accounts-provider"
import { useAskHalo } from "@/components/ask-halo"
import { Button } from "@/components/ui/button"
import { HaloAvatar } from "@/components/halo-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { user } from "@/lib/data"

/**
 * Global top bar: brand + centered command bar + right cluster. Primary
 * navigation lives in the side rail (see app-sidebar.tsx).
 */
export function TopNav() {
  const { ask } = useAskHalo()
  const { addAccount } = useAccounts()
  const [connectOpen, setConnectOpen] = useState(false)

  return (
    <header className="site-header sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:px-4">
      {/* Brand */}
      <Link
        to="/"
        aria-label="Halo AI home"
        className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-secondary"
      >
        <HaloAvatar className="size-5" />
        <span className="hidden text-sm font-semibold tracking-[-0.01em] sm:inline">
          Halo AI
        </span>
      </Link>

      {/* Centered command bar */}
      <div className="flex min-w-0 flex-1 justify-center px-2">
        <button
          type="button"
          onClick={() => ask()}
          className="group hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-left text-muted-foreground shadow-xs transition-colors hover:border-halo-border hover:bg-halo-subtle/40 lg:flex"
        >
          <RiSparkling2Line className="size-4 shrink-0 text-halo" />
          <span className="truncate text-[13px]">Ask Halo anything…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="secondary"
          className="gap-1.5 max-sm:size-9 max-sm:px-0"
          size="sm"
          aria-label="Connect accounts"
          onClick={() => setConnectOpen(true)}
        >
          <RiAddLine className="size-4" />
          <span className="max-sm:sr-only">Connect accounts</span>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="relative size-9 text-muted-foreground"
          aria-label="Notifications"
        >
          <RiNotification3Line className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-negative ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-muted-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{user.fullName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/accounts">Accounts</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConnectAccountDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onAccountAdded={addAccount}
      />
    </header>
  )
}
