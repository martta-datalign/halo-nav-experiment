import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { RiNotification3Line, RiAddLine, RiSparkling2Line } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAskHalo } from "@/components/ask-halo"
import { user } from "@/lib/data"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/ask": "Ask Halo",
  "/tools": "Financial Tools",
  "/tools/calculators": "Calculators",
  "/tools/goals": "Goals",
  "/advisors": "Advisor Match",
  "/disclosures": "Disclosures",
  "/settings": "Settings",
}

function useCrumbs() {
  const { pathname } = useLocation()
  if (pathname === "/") return [{ label: "Dashboard" }]
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: { label: string }[] = []
  let acc = ""
  for (const seg of segments) {
    acc += "/" + seg
    crumbs.push({ label: TITLES[acc] ?? seg })
  }
  return crumbs
}

/**
 * Per-page top bar. The shell (⌘K, Add accounts, notifications, account menu)
 * is shared, but each page renders its own header and can pass page-specific
 * controls via `actions` — so the top nav isn't global.
 */
export function SiteHeader({
  actions,
  title,
  showSearch = true,
}: {
  actions?: ReactNode
  /** Overrides the route breadcrumb with a specific label (e.g., a chat title). */
  title?: string
  /** Set false to drop the ⌘K command bar on pages that have their own input. */
  showSearch?: boolean
}) {
  const { ask } = useAskHalo()
  const crumbs = useCrumbs()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4">
      {/* Desktop collapses via the toggle inside the sidebar; on mobile the
          sidebar is an off-canvas sheet, so it still needs a trigger here. */}
      <SidebarTrigger className="text-muted-foreground md:hidden" />

      {title !== undefined ? (
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {title}
        </span>
      ) : (
        // Breadcrumb is desktop-only; on mobile the page owns its own title.
        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-1.5 text-sm md:flex"
        >
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border">/</span>}
              <span
                className={
                  i === crumbs.length - 1
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      {/* AI-native command bar — the product's spine, so it stays visible on
          mobile too (fills the row) instead of collapsing to an icon. */}
      {showSearch && (
        <button
          type="button"
          onClick={() => ask()}
          className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-left text-muted-foreground shadow-xs transition-colors hover:border-halo-border hover:bg-halo-subtle/40 md:ml-auto md:w-96 md:flex-none"
        >
          <RiSparkling2Line className="size-4 shrink-0 text-halo" />
          <span className="truncate text-[13px]">Ask Halo anything…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </button>
      )}

      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5",
          showSearch ? "md:ml-2" : "ml-auto"
        )}
      >
        {actions}
        <Button className="hidden gap-1.5 sm:flex">
          <RiAddLine className="size-4" />
          Add accounts
        </Button>

        <Button size="icon" variant="ghost" className="relative text-muted-foreground" aria-label="Notifications">
          <RiNotification3Line className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-negative ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-[12px] font-semibold text-muted-foreground">
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
            <DropdownMenuItem>My Accounts</DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
