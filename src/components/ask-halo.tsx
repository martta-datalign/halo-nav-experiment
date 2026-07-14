import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowUpRight,
  House,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { suggestedPrompts } from "@/lib/data"

type AskHaloContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  /** Open the launcher, optionally seeded with a prompt. */
  ask: (prompt?: string) => void
}

const AskHaloContext = React.createContext<AskHaloContextValue | null>(null)

export function useAskHalo() {
  const ctx = React.useContext(AskHaloContext)
  if (!ctx) throw new Error("useAskHalo must be used within <AskHaloProvider>")
  return ctx
}

const NAV_ACTIONS = [
  { label: "Dashboard", to: "/", icon: House },
  { label: "Ask Halo", to: "/ask", icon: Sparkles },
  { label: "Tools", to: "/tools", icon: Wrench },
  { label: "Advisors", to: "/advisors", icon: Users },
]

export function AskHaloProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const navigate = useNavigate()

  const ask = React.useCallback((prompt?: string) => {
    if (prompt) {
      // Deep-link straight into the conversation, pre-seeded.
      setOpen(false)
      navigate(`/ask?q=${encodeURIComponent(prompt)}`)
      return
    }
    setQuery("")
    setOpen(true)
  }, [navigate])

  // Global ⌘K / Ctrl+K.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const submit = React.useCallback(
    (prompt: string) => {
      setOpen(false)
      navigate(`/ask?q=${encodeURIComponent(prompt)}`)
    },
    [navigate]
  )

  const trimmed = query.trim()

  return (
    <AskHaloContext.Provider value={{ open, setOpen, ask }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Ask Halo"
        description="Ask Halo anything about your money"
        className="top-[22%] translate-y-0 sm:max-w-2xl"
      >
        <CommandInput
          placeholder="Ask Halo anything about your money…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Press Enter to ask Halo.</CommandEmpty>

          {trimmed && (
            <>
              <CommandGroup heading="Ask">
                <CommandItem
                  value={`ask ${trimmed}`}
                  onSelect={() => submit(trimmed)}
                  className="gap-2.5"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-halo-subtle text-halo">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="truncate">
                    Ask Halo:{" "}
                    <span className="font-medium text-foreground">“{trimmed}”</span>
                  </span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Suggested">
            {suggestedPrompts.map((p) => (
              <CommandItem key={p} value={p} onSelect={() => submit(p)} className="gap-2.5">
                <Sparkles className="size-4 text-halo" />
                <span className="truncate">{p}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            {NAV_ACTIONS.map((a) => (
              <CommandItem
                key={a.to}
                value={`go ${a.label}`}
                onSelect={() => {
                  setOpen(false)
                  navigate(a.to)
                }}
                className="gap-2.5"
              >
                <a.icon className="size-4 text-muted-foreground" />
                <span>{a.label}</span>
                <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground/60" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </AskHaloContext.Provider>
  )
}
