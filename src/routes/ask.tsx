import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { RiArrowUpLine, RiCheckLine, RiFileCopyLine, RiAddLine, RiSparkling2Line, RiThumbDownLine, RiThumbUpLine, RiSafe2Line } from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { suggestedPrompts } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { SEED_VAULT_DOCS, VaultDialog, type VaultDoc } from "@/components/ask/vault"

type Role = "user" | "halo"
type Message = { id: number; role: Role; text: string }
type Chat = { id: string; title: string; when: string; messages: Message[] }

type Mode = "simple" | "deep"

// Canned replies — this pass ships the conversation shell, not a live model.
// Simple gives the short answer; Deep shows the reasoning.
const REPLIES: Record<Mode, string> = {
  simple:
    "Short version: you're on track and nothing needs action today. (Prototype — in Simple mode Halo gives the direct, one-paragraph answer.)",
  deep:
    "Let's go deeper. First, what's driving this; second, the trade-offs to weigh; and third, the concrete next step to take. (Prototype — in Deep mode Halo shows its reasoning and walks through drivers, trade-offs, and next steps. The live model's detailed analysis plugs in here.)",
}

// Mock history so the panel has something to show.
const SEED_CHATS: Chat[] = [
  {
    id: "h1",
    title: "What's driving my net worth?",
    when: "Today",
    messages: [
      { id: 1, role: "user", text: "What's driving my net worth this quarter?" },
      {
        id: 2,
        role: "halo",
        text: "Your net worth is up 10.4% (+$61,421) over the last 3 months — most of it from investment gains, with ~$600/mo added to savings. Housing and healthcare held flat, so the growth is real rather than timing.",
      },
    ],
  },
  {
    id: "h2",
    title: "Finish my emergency fund faster",
    when: "Yesterday",
    messages: [
      { id: 1, role: "user", text: "How can I finish funding my emergency fund faster?" },
      {
        id: 2,
        role: "halo",
        text: "You're at $18,000 of $25,000 (72%). At ~$600/mo you'll get there in about 12 months. Redirecting the ~$300/mo you currently over-save in checking would cut that to ~7 months without touching your lifestyle.",
      },
    ],
  },
  {
    id: "h3",
    title: "Where can I cut back?",
    when: "Jul 8",
    messages: [
      { id: 1, role: "user", text: "Where am I overspending?" },
      {
        id: 2,
        role: "halo",
        text: "Nothing alarming. Shopping and entertainment crept up ~15% vs your 3-month average; dining is in line with peers. If you wanted one lever, trimming shopping by a third frees ~$170/mo toward your home down payment.",
      },
    ],
  },
  {
    id: "h4",
    title: "Roth IRA vs 401(k)",
    when: "Jul 2",
    messages: [
      { id: 1, role: "user", text: "Should I prioritize my Roth IRA or 401(k)?" },
      {
        id: 2,
        role: "halo",
        text: "Capture the full employer 401(k) match first — that's an instant 100% return. After the match, a Roth IRA gives tax-free growth and more flexibility at your bracket. Then circle back to max the 401(k) if you have room.",
      },
    ],
  },
]

export default function AskHalo() {
  const [params, setParams] = useSearchParams()

  const [chats, setChats] = React.useState<Chat[]>(() => [
    { id: "new", title: "New chat", when: "Now", messages: [] },
    ...SEED_CHATS,
  ])
  const [activeId, setActiveId] = React.useState("new")
  const [draft, setDraft] = React.useState("")
  const [vaultOpen, setVaultOpen] = React.useState(false)
  const [mode, setMode] = React.useState<Mode>("deep")
  const modeRef = React.useRef(mode)
  React.useEffect(() => {
    modeRef.current = mode
  }, [mode])
  const [docs, setDocs] = React.useState<VaultDoc[]>(SEED_VAULT_DOCS)
  const docId = React.useRef(0)

  const addDocs = React.useCallback((names: string[]) => {
    const added: VaultDoc[] = names.map((name) => ({
      id: `up-${docId.current++}`,
      name,
      kind: (name.split(".").pop() || "FILE").toUpperCase(),
      size: "—",
      when: "Just now",
    }))
    setDocs((prev) => [...added, ...prev])
    toast.success(
      `Added ${names.length} document${names.length > 1 ? "s" : ""} to your vault`,
      { description: "Halo will use these to tailor its guidance." }
    )
  }, [])

  const deleteDoc = React.useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const activeIdRef = React.useRef(activeId)
  React.useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  const msgId = React.useRef(100)
  const newChatCount = React.useRef(0)
  const lastSeed = React.useRef<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const active = chats.find((c) => c.id === activeId) ?? chats[0]
  const messages = active.messages

  const send = React.useCallback((text: string) => {
    const value = text.trim()
    if (!value) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeIdRef.current
          ? {
              ...c,
              title: c.messages.length === 0 ? truncate(value) : c.title,
              messages: [
                ...c.messages,
                { id: msgId.current++, role: "user", text: value },
                { id: msgId.current++, role: "halo", text: REPLIES[modeRef.current] },
              ],
            }
          : c
      )
    )
    setDraft("")
  }, [])

  function newChat() {
    const id = `new-${newChatCount.current++}`
    setChats((prev) => [{ id, title: "New chat", when: "Now", messages: [] }, ...prev])
    setActiveId(id)
  }

  // Consume the ?q= deep-link into the active chat (dedupes StrictMode).
  const seeded = params.get("q")
  React.useEffect(() => {
    if (seeded && seeded !== lastSeed.current) {
      lastSeed.current = seeded
      send(seeded)
      setParams({}, { replace: true })
    }
  }, [seeded, send, setParams])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Auto-grow the input as the user types (capped, then it scrolls internally).
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  const empty = messages.length === 0

  return (
    <>
      <SiteHeader title={active.title} showSearch={false} />
      <div className="flex h-[calc(100svh-3.5rem)]">
        {/* Chat history */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border md:flex">
          <div className="p-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={newChat}>
              <RiAddLine className="size-4" />
              New chat
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
              Recent
            </div>
            {chats
              .filter((c) => c.messages.length > 0 || c.id === activeId)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                    c.id === activeId ? "bg-secondary" : "hover:bg-secondary/60"
                  )}
                >
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {c.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{c.when}</span>
                </button>
              ))}
          </div>
          {/* Vault lives one level down from chat — a utility, not a peer view. */}
          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={() => setVaultOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-halo-subtle text-halo">
                <RiSafe2Line className="size-4" />
              </span>
              <span className="flex-1 text-[13px] font-medium text-foreground">My Vault</span>
              <span className="text-[11px] text-muted-foreground">{docs.length}</span>
            </button>
          </div>
        </aside>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
              {empty ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-halo-subtle text-halo">
                    <RiSparkling2Line className="size-6" />
                  </span>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Ask anything about your money — your goals, cash flow, or what to do
                    next. Halo sees the full picture from your connected accounts.
                  </p>
                  <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                    {suggestedPrompts.slice(0, 4).map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-[13px] text-foreground transition-colors hover:border-halo-border hover:bg-halo-subtle/40"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {messages.map((m) => (
                    <MessageRow key={m.id} message={m} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-md">
            <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-2 sm:px-6">
              <div className="mb-2 flex w-fit rounded-lg bg-secondary p-0.5 text-[12px]">
                {(["simple", "deep"] as const).map((m) => (
                  <Tooltip key={m} delayDuration={500}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                          "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                          mode === m
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {m}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {m === "simple"
                        ? "Short, direct answers"
                        : "Detailed reasoning & next steps"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(draft)
                }}
              >
                <div className="flex items-end gap-2 rounded-xl border border-border bg-card py-1.5 pl-4 pr-1.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        send(draft)
                      }
                    }}
                    rows={1}
                    placeholder="Ask me anything about your finances"
                    className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="size-8 shrink-0 rounded-lg"
                    disabled={!draft.trim()}
                  >
                    <RiArrowUpLine className="size-4" />
                  </Button>
                </div>
              </form>

              <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
                AI can make mistakes. Please consult with your financial advisor before
                taking any actions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <VaultDialog
        open={vaultOpen}
        onOpenChange={setVaultOpen}
        docs={docs}
        onUpload={addDocs}
        onDelete={deleteDoc}
      />
    </>
  )
}

function truncate(text: string, max = 32) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

const DISLIKE_TAGS = ["Not what I asked", "Inaccurate", "Too verbose", "Tone was off"]

function MessageRow({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {message.text}
        </div>
      </div>
    )
  }
  return <HaloMessage text={message.text} />
}

// Halo replies are plain (no bubble) and carry copy + feedback actions.
function HaloMessage({ text }: { text: string }) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [reasonSent, setReasonSent] = React.useState(false)

  function copy() {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function setVoteTo(v: "up" | "down") {
    setVote((prev) => {
      const next = prev === v ? null : v
      if (next !== "down") setReasonSent(false)
      return next
    })
  }

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-halo text-halo-foreground">
        <RiSparkling2Line className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="pt-1 text-sm leading-relaxed text-foreground">{text}</div>

        <div className="mt-2 flex items-center gap-0.5">
          <ActionButton label={copied ? "Copied" : "Copy"} onClick={copy}>
            {copied ? (
              <RiCheckLine className="size-3.5 text-positive" />
            ) : (
              <RiFileCopyLine className="size-3.5" />
            )}
          </ActionButton>
          <ActionButton label="Good response" active={vote === "up"} onClick={() => setVoteTo("up")}>
            <RiThumbUpLine className="size-3.5" />
          </ActionButton>
          <ActionButton label="Needs work" active={vote === "down"} onClick={() => setVoteTo("down")}>
            <RiThumbDownLine className="size-3.5" />
          </ActionButton>
        </div>

        {vote === "down" && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 duration-200 animate-in fade-in-0 slide-in-from-top-1">
            {reasonSent ? (
              <span className="text-[12px] text-muted-foreground">
                Thanks — this helps Halo improve.
              </span>
            ) : (
              <>
                <span className="mr-0.5 text-[12px] text-muted-foreground">
                  What went wrong?
                </span>
                {DISLIKE_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReasonSent(true)}
                    className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-secondary hover:text-foreground",
        active ? "bg-secondary text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  )
}
