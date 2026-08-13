import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  RiBankLine,
  RiCalculatorLine,
  RiFileTextLine,
  RiFocus3Line,
  RiHome5Line,
  RiQuestionLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiSparkling2Line,
  RiTeamLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Item = { title: string; to: string; icon: React.ElementType }
type Section = { label?: string; items: Item[] }

/** Primary navigation — sectioned, reference-style. Lives in the side rail. */
const SECTIONS: Section[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", to: "/", icon: RiHome5Line },
      { title: "Ask Halo", to: "/ask", icon: RiSparkling2Line },
      { title: "Advisor Match", to: "/advisors", icon: RiTeamLine },
      { title: "Accounts", to: "/accounts", icon: RiBankLine },
    ],
  },
  {
    label: "Financial Tools",
    items: [
      { title: "Calculators", to: "/tools/calculators", icon: RiCalculatorLine },
      { title: "Goals", to: "/tools/goals", icon: RiFocus3Line },
    ],
  },
]

const FOOTER: Item[] = [
  { title: "Help", to: "/help", icon: RiQuestionLine },
  { title: "Disclosures", to: "/disclosures", icon: RiFileTextLine },
]

const INSTITUTIONS = [
  { src: "/chase.ico", alt: "Chase" },
  { src: "/fidelity.ico", alt: "Fidelity" },
]

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(to + "/")
}

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: Item
  pathname: string
  collapsed: boolean
}) {
  const active = isActive(pathname, item.to)
  const link = (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center rounded-lg text-[13px] transition-colors",
        collapsed ? "w-9 justify-center" : "gap-2.5 px-2.5",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
      )}
    >
      <item.icon className="size-3.5 shrink-0" />
      {!collapsed && <span className="nav-label truncate">{item.title}</span>}
    </Link>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean
  onToggle?: () => void
}) {
  const { pathname } = useLocation()

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-[var(--motion-base)] [transition-timing-function:var(--motion-ease-out)] md:flex",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <div className={cn("min-h-0 flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
        {SECTIONS.map((section, i) => (
          <div key={i} className="mb-5">
            {collapsed ? (
              // Collapsed: the first section carries the toggle at the top; later
              // sections get a divider (labels are hidden in this state).
              i === 0 ? (
                <div className="mb-2 flex justify-center">
                  <CollapseToggle collapsed onToggle={onToggle} />
                </div>
              ) : (
                <div className="mx-2 mb-2 border-t border-sidebar-border" />
              )
            ) : (
              section.label && (
                <div
                  className={cn(
                    "flex items-center pb-1.5",
                    i === 0 ? "justify-between pl-2 pr-1" : "px-2"
                  )}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">
                    {section.label}
                  </span>
                  {i === 0 && <CollapseToggle collapsed={false} onToggle={onToggle} />}
                </div>
              )
            )}
            <nav className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
              {section.items.map((item) => (
                <NavLink key={item.to} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer: connect prompt + help links */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "px-2 py-3" : "p-3")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/accounts"
                aria-label="Connect accounts"
                className="mx-auto flex size-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
              >
                <RiBankLine className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Connect accounts</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            to="/accounts"
            className="block rounded-xl border border-sidebar-border bg-card p-3 transition-colors hover:bg-sidebar-hover"
          >
            <p className="text-[13px] font-medium text-foreground">Connect accounts</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Connect banks and brokerages to see your full picture.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              {INSTITUTIONS.map((inst) => (
                <img
                  key={inst.alt}
                  src={inst.src}
                  alt={inst.alt}
                  className="size-5 rounded-full ring-1 ring-sidebar-border"
                />
              ))}
              <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
                +
              </span>
            </div>
          </Link>
        )}

        <nav className={cn("mt-2 flex flex-col gap-0.5", collapsed && "items-center")}>
          {FOOTER.map((item) => (
            <NavLink key={item.to} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

/**
 * Icon-only collapse control. Sits inline on the first section's label row when
 * expanded (compact, so it doesn't grow the row); centers at the top of the
 * rail when collapsed.
 */
function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle?: () => void
}) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-pressed={collapsed}
          className={cn(
            "flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground",
            collapsed ? "size-9" : "size-6"
          )}
        >
          {collapsed ? (
            <RiSidebarUnfoldLine className="size-4 shrink-0" />
          ) : (
            <RiSidebarFoldLine className="size-3.5 shrink-0" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side={collapsed ? "right" : "bottom"}>{label}</TooltipContent>
    </Tooltip>
  )
}
