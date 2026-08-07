import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  RiArrowDownSLine,
  RiFileTextLine,
  RiHome5Line,
  RiQuestionLine,
  RiSparkling2Line,
  RiTeamLine,
  RiToolsLine,
} from "@remixicon/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavNode = {
  title: string
  to: string
  icon: React.ElementType
  children?: { title: string; to: string }[]
}

const NAV: NavNode[] = [
  { title: "Dashboard", to: "/", icon: RiHome5Line },
  { title: "Ask Halo", to: "/ask", icon: RiSparkling2Line },
  {
    title: "Financial Tools",
    to: "/tools",
    icon: RiToolsLine,
    children: [
      { title: "Calculators", to: "/tools/calculators" },
      { title: "Goals", to: "/tools/goals" },
    ],
  },
  { title: "Advisor Match", to: "/advisors", icon: RiTeamLine },
]

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(to + "/")
}

/** On mobile the sidebar is an overlay sheet — close it after navigating. */
function useCloseMobile() {
  const { isMobile, setOpenMobile } = useSidebar()
  return React.useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const closeMobile = useCloseMobile()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-14 flex-row items-center gap-1 border-b border-sidebar-border px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <button
          type="button"
          aria-label="Halo AI workspace"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-hover group-data-[collapsible=icon]:hidden"
        >
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[14px] font-semibold tracking-[-0.01em]">
              Halo AI
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              Powered by Datalign
            </span>
          </span>
        </button>
        <SidebarTrigger className="size-8 shrink-0 text-muted-foreground" />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map((item) =>
              item.children ? (
                <NavGroup
                  key={item.to}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeMobile}
                />
              ) : (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.to)}
                    tooltip={item.title}
                  >
                    <Link to={item.to} onClick={closeMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive(pathname, "/faq")}
              tooltip="FAQ"
            >
              <Link to="/faq" onClick={closeMobile}>
                <RiQuestionLine />
                <span>FAQ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive(pathname, "/disclosures")}
              tooltip="Disclosures"
            >
              <Link to="/disclosures" onClick={closeMobile}>
                <RiFileTextLine />
                <span>Disclosures</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

/**
 * A collapsible nav group with a chevron affordance (Grok-style): the row
 * toggles its sub-menu open/closed and the chevron flips down→up. It opens
 * automatically when you're inside the section. When the rail is collapsed to
 * icons there's no room for a sub-menu, so a click navigates to the section
 * landing instead of toggling a hidden panel.
 */
function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavNode
  pathname: string
  onNavigate: () => void
}) {
  const { state, isMobile } = useSidebar()
  const navigate = useNavigate()
  const sectionActive = isActive(pathname, item.to)
  const [open, setOpen] = React.useState(true)
  const iconCollapsed = state === "collapsed" && !isMobile

  // Keep the group open whenever the current route lives inside it.
  React.useEffect(() => {
    if (sectionActive) setOpen(true)
  }, [sectionActive])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={pathname === item.to}
        aria-expanded={iconCollapsed ? undefined : open}
        onClick={() => {
          if (iconCollapsed) {
            navigate(item.to)
            onNavigate()
          } else {
            setOpen((v) => !v)
          }
        }}
      >
        <item.icon />
        <span>{item.title}</span>
        <RiArrowDownSLine
          className={cn(
            "ml-auto size-4 text-sidebar-foreground/50 transition-transform duration-200 [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none group-data-[collapsible=icon]:hidden",
            open && "rotate-180"
          )}
        />
      </SidebarMenuButton>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 [transition-timing-function:var(--motion-ease-standard)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.to}>
              <SidebarMenuSubButton asChild isActive={pathname === child.to}>
                <Link to={child.to} onClick={onNavigate}>
                  <span>{child.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  )
}
