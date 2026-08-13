import * as React from "react"
import { useSearchParams } from "react-router-dom"
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiChatHistoryLine,
  RiCheckLine,
  RiCornerDownLeftLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMore2Line,
  RiPencilLine,
  RiSafe2Line,
  RiThumbDownLine,
  RiThumbUpLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { AutoAnimated } from "@/components/ui/auto-animated"
import { suggestedPrompts } from "@/lib/data"
import { HaloAvatar } from "@/components/halo-avatar"
import { SEED_VAULT_DOCS, VaultDialog, type VaultDoc } from "@/components/ask/vault"
import { StockWidget } from "@/components/ask/stock-widget"
import { STOCKS, detectStockQuery, type StockSymbol } from "@/lib/stocks"

type Role = "user" | "halo"
type HaloStatus = "thinking" | "streaming" | "complete"
type Message = {
  id: number
  role: Role
  text: string
  status?: HaloStatus
  stock?: StockSymbol
}
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

// Suggested next questions offered beneath the most recent answer. Canned for
// this shell; a live model returns its own set with each reply.
const FOLLOW_UPS = [
  "How does this compare to last quarter?",
  "What should I focus on first?",
  "Show me the details behind this",
]

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
        text: `Your net worth is up 10.4% (+$61,421) over the last 3 months, reaching $651,204. Here's the full picture of what moved it — and what to watch from here.

Investments did most of the work. Your brokerage and retirement accounts gained $48,300, roughly 79% of the quarter's growth. A little over half of that is market appreciation; the rest is your ongoing contributions compounding. Your allocation held steady at 72% stocks / 28% bonds, so this wasn't a case of taking on more risk — the existing mix simply had a strong quarter.

Cash savings added $1,800. You moved about $600/month into your high-yield savings account, right on plan. Your emergency fund now sits at $18,000 — about 4.2 months of essential expenses, inside the recommended 3–6 month range but toward the lower end.

Debt paydown quietly helped too. You reduced total liabilities by $6,900: $4,100 off the mortgage principal, $1,900 off student loans, and $900 off credit cards. Every dollar of principal paid is a dollar of net worth, and it compounds by lowering future interest.

Housing and healthcare held flat. Your home's estimated value didn't change this quarter, and there were no large one-off medical or lifestyle expenses. That matters: it means the growth came from your own saving and investing, not from a paper gain on an asset you're not selling.

A few things to keep an eye on. First, 95% of your equity exposure is domestic — adding 15–20% international could reduce volatility without lowering expected return. Second, your credit card balance ($8,500) carries the highest interest of anything you hold; clearing it is the single best risk-adjusted move available to you. Third, you have $15,320 of unused 401(k) headroom this year — bumping your contribution from 8% to 10% would accelerate next quarter's momentum while trimming your tax bill.

Net takeaway: this was a healthy, broad-based quarter. The gains are real rather than a timing artifact, and the biggest lever from here is redirecting cash from low-interest savings toward the credit card and your 401(k).`,
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
  // Chat history is a desktop <aside>; on mobile it becomes this off-canvas drawer.
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [renamingId, setRenamingId] = React.useState<string | null>(null)
  const [renameDraft, setRenameDraft] = React.useState("")
  const cancelRenameRef = React.useRef(false)
  const [deleteCandidate, setDeleteCandidate] = React.useState<Chat | null>(null)
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
  const responseTimers = React.useRef<Set<number>>(new Set())
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const composerRef = React.useRef<HTMLDivElement>(null)
  // The composer floats over the message list (frosted fade), so the list
  // reserves matching space at its bottom — remeasured as the input grows.
  const [composerHeight, setComposerHeight] = React.useState(148)
  // Whether new content should keep the view pinned to the bottom. Flipped off
  // the moment the reader scrolls up, so a streaming reply never yanks them
  // back down; the jump-to-latest button lets them opt back in.
  const followRef = React.useRef(true)
  const [showJump, setShowJump] = React.useState(false)

  const active = chats.find((c) => c.id === activeId) ?? chats[0]
  const messages = active.messages
  const haloIsThinking = messages.some(
    (message) =>
      message.role === "halo" && message.status && message.status !== "complete"
  )

  React.useEffect(() => {
    const timers = responseTimers.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const updateHaloMessage = React.useCallback(
    (chatId: string, messageId: number, text: string, status: HaloStatus) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message.id === messageId ? { ...message, text, status } : message
                ),
              }
            : chat
        )
      )
    },
    []
  )

  const send = React.useCallback((text: string) => {
    const value = text.trim()
    if (!value) return
    // A new turn always follows the newest message, even if the reader had
    // scrolled up during the previous exchange.
    followRef.current = true
    const chatId = activeIdRef.current
    const userMessageId = msgId.current++
    const haloMessageId = msgId.current++
    const stockSymbol = detectStockQuery(value)
    const reply = stockSymbol
      ? `${STOCKS[stockSymbol].name} (${stockSymbol}) is shown below. You can switch the chart range to compare its recent direction. This prototype uses illustrative prices; a live market-data provider can plug into the same widget.`
      : REPLIES[modeRef.current]
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              title:
                c.messages.length === 0 && c.title === "New chat"
                  ? truncate(value)
                  : c.title,
              messages: [
                ...c.messages,
                { id: userMessageId, role: "user", text: value },
                {
                  id: haloMessageId,
                  role: "halo",
                  text: "",
                  status: "thinking",
                  stock: stockSymbol ?? undefined,
                },
              ],
            }
          : c
      )
    )
    setDraft("")

    // Give the thinking state enough time to register, then reveal the answer
    // in word-sized chunks like a live model stream. Reduced-motion users get
    // the same state feedback without the animated reveal.
    const thinkingTimer = window.setTimeout(() => {
      responseTimers.current.delete(thinkingTimer)
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduceMotion) {
        updateHaloMessage(chatId, haloMessageId, reply, "complete")
        return
      }

      const chunks = reply.match(/\S+\s*/g) ?? [reply]
      let chunkIndex = 0
      updateHaloMessage(chatId, haloMessageId, "", "streaming")

      const streamTimer = window.setInterval(() => {
        chunkIndex += 1
        const nextText = chunks.slice(0, chunkIndex).join("")
        const complete = chunkIndex >= chunks.length
        updateHaloMessage(
          chatId,
          haloMessageId,
          complete ? reply : nextText,
          complete ? "complete" : "streaming"
        )
        if (complete) {
          window.clearInterval(streamTimer)
          responseTimers.current.delete(streamTimer)
        }
      }, 32)
      responseTimers.current.add(streamTimer)
    }, 600)
    responseTimers.current.add(thinkingTimer)
  }, [updateHaloMessage])

  function newChat() {
    const id = `new-${newChatCount.current++}`
    setChats((prev) => [{ id, title: "New chat", when: "Now", messages: [] }, ...prev])
    setActiveId(id)
    setHistoryOpen(false)
  }

  function startRenaming(chat: Chat) {
    cancelRenameRef.current = false
    setRenamingId(chat.id)
    setRenameDraft(chat.title)
  }

  function finishRenaming() {
    const title = renameDraft.trim()
    if (renamingId && title) {
      setChats((prev) =>
        prev.map((chat) => (chat.id === renamingId ? { ...chat, title } : chat))
      )
    }
    setRenamingId(null)
    setRenameDraft("")
  }

  function deleteChat() {
    if (!deleteCandidate) return

    let remaining = chats.filter((chat) => chat.id !== deleteCandidate.id)
    if (remaining.length === 0) {
      const id = `new-${newChatCount.current++}`
      remaining = [{ id, title: "New chat", when: "Now", messages: [] }]
    }

    setChats(remaining)
    if (activeId === deleteCandidate.id) {
      activeIdRef.current = remaining[0].id
      setActiveId(remaining[0].id)
    }
    if (renamingId === deleteCandidate.id) setRenamingId(null)
    setDeleteCandidate(null)
    toast.success("Chat deleted")
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

  // Landing on a different chat starts pinned to its latest message.
  React.useEffect(() => {
    followRef.current = true
    setShowJump(false)
  }, [activeId])

  React.useEffect(() => {
    if (!followRef.current) return
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: haloIsThinking ? "auto" : "smooth",
    })
  }, [haloIsThinking, messages])

  // Track how far the reader is from the bottom. Past a small threshold they've
  // deliberately scrolled up: stop following and reveal the jump button.
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distanceFromBottom < 64
    followRef.current = atBottom
    setShowJump(!atBottom)
  }, [])

  const jumpToBottom = React.useCallback(() => {
    followRef.current = true
    setShowJump(false)
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [])

  // Auto-grow the input as the user types (capped, then it scrolls internally).
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  // Keep the list's reserved bottom space in sync with the floating composer.
  React.useEffect(() => {
    const el = composerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setComposerHeight(el.offsetHeight))
    observer.observe(el)
    setComposerHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  const empty = messages.length === 0

  // Shared body for both the desktop rail and the mobile drawer. Selecting a
  // chat (or the Vault) also dismisses the drawer; on desktop that's a no-op.
  // The drawer omits New chat — on mobile it lives in the header instead, so it
  // doesn't collide with the sheet's close button.
  function renderHistory({ showNewChat = true }: { showNewChat?: boolean } = {}) {
    return (
      <>
        {showNewChat && (
          <div className="p-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={newChat}>
              <RiAddLine className="size-4" />
              New chat
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Recent
          </div>
          <AutoAnimated>
            {chats
              .filter((c) => c.messages.length > 0 || c.id === activeId)
              .map((c) =>
              renamingId === c.id ? (
                <form
                  key={c.id}
                  onSubmit={(event) => {
                    event.preventDefault()
                    finishRenaming()
                  }}
                  className="rounded-lg bg-secondary px-2.5 py-2"
                >
                  <input
                    autoFocus
                    value={renameDraft}
                    onChange={(event) => setRenameDraft(event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    onBlur={() => {
                      if (cancelRenameRef.current) {
                        cancelRenameRef.current = false
                        return
                      }
                      finishRenaming()
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        event.currentTarget.blur()
                      }
                      if (event.key === "Escape") {
                        event.preventDefault()
                        cancelRenameRef.current = true
                        setRenamingId(null)
                        setRenameDraft("")
                      }
                    }}
                    aria-label="Chat title"
                    className="h-7 w-full min-w-0 rounded-md border border-ring bg-background px-2 text-sm outline-none ring-2 ring-ring/15 md:text-[13px]"
                  />
                </form>
              ) : (
                <div key={c.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      activeIdRef.current = c.id
                      setActiveId(c.id)
                      setHistoryOpen(false)
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-lg py-2 pl-2.5 pr-10 text-left transition-colors",
                      c.id === activeId ? "bg-secondary" : "hover:bg-secondary/60"
                    )}
                  >
                    <span className="w-full truncate text-[13px] font-medium text-foreground">
                      {c.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.when}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${c.title}`}
                        className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground opacity-100 outline-none transition hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 md:data-[state=open]:opacity-100"
                      >
                        <RiMore2Line className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                      <DropdownMenuItem onSelect={() => startRenaming(c)}>
                        <RiPencilLine />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="text-destructive focus:text-destructive [&_svg]:text-destructive!"
                        onSelect={() => setDeleteCandidate(c)}
                      >
                        <RiDeleteBinLine />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            )}
          </AutoAnimated>
        </div>
        {/* Vault lives one level down from chat — a utility, not a peer view. */}
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => {
              setVaultOpen(true)
              setHistoryOpen(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-halo-subtle text-halo">
              <RiSafe2Line className="size-4" />
            </span>
            <span className="flex-1 text-[13px] font-medium text-foreground">Vault</span>
            <span className="text-xs text-muted-foreground">{docs.length}</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex h-[calc(100svh-3.5rem)]">
        {/* Chat history — desktop rail. On mobile this collapses into the Sheet below. */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border md:flex">
          {renderHistory()}
        </aside>

        {/* Chat history — mobile off-canvas drawer, mirroring the main-nav sidebar pattern. */}
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          {/* pt clears the sheet's absolute close (✕) button so it doesn't
              overlap the first recent item. */}
          <SheetContent side="left" className="w-72 gap-0 p-0 pt-6 md:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Chat history</SheetTitle>
            </SheetHeader>
            {renderHistory({ showNewChat: false })}
          </SheetContent>
        </Sheet>

        {/* Conversation */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Mobile: New chat + history live here (the desktop rail is hidden). */}
          <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2 md:hidden">
            <Button
              size="icon"
              variant="ghost"
              className="size-9 text-muted-foreground"
              aria-label="New chat"
              onClick={newChat}
            >
              <RiAddLine className="size-5" />
            </Button>
            <span className="min-w-0 flex-1 truncate text-center text-sm font-medium">
              {active.title}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 text-muted-foreground"
              aria-label="Chat history"
              onClick={() => setHistoryOpen(true)}
            >
              <RiChatHistoryLine className="size-5" />
            </Button>
          </div>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            <div
              className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6"
              style={{ paddingBottom: composerHeight }}
            >
              {empty ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                  <HaloAvatar className="size-12 shadow-sm" />
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Ask anything about your money — your goals, cash flow, or what to do
                    next. Halo sees the full picture from your connected accounts.
                  </p>
                  <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                    {[...suggestedPrompts.slice(0, 3), "Show me Apple stock"].map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-[13px] text-foreground transition-[background-color,border-color,transform] duration-150 ease-out hover:border-halo-border hover:bg-halo-subtle/40 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {messages.map((m, i) => (
                    <MessageRow
                      key={m.id}
                      message={m}
                      isLast={i === messages.length - 1}
                      onFollowUp={send}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Composer floats over the list so messages scroll up behind it. The
              toggle row sits in a frosted fade that starts opaque at the top of the
              input box and dissolves upward into the conversation. */}
          <div
            ref={composerRef}
            className="pointer-events-none absolute inset-x-0 bottom-0"
          >
            {/* Jump to latest — appears only when the reader has scrolled up, so
                a streaming reply can advance without dragging their view. */}
            {showJump && (
              <button
                type="button"
                onClick={jumpToBottom}
                aria-label="Scroll to latest"
                className="pointer-events-auto absolute -top-12 left-1/2 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-[color,background-color,transform] duration-150 ease-out animate-in fade-in-0 zoom-in-95 hover:text-foreground active:scale-95 motion-reduce:animate-none"
              >
                <RiArrowDownLine className="size-5" />
              </button>
            )}
            <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 sm:px-6">
              {/* Progressive blur: stacked backdrop-blur layers, each a heavier
                  radius revealed lower down, so the blur ramps up toward the input
                  instead of switching on at a single hard edge. The wash on top goes
                  opaque at the input's top edge and clears upward. */}
              <div className="relative pt-8 pb-2">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {[
                    { blur: 0.5, stop: 92 },
                    { blur: 1.5, stop: 70 },
                    { blur: 3, stop: 48 },
                    { blur: 6, stop: 28 },
                  ].map(({ blur, stop }) => (
                    <div
                      key={blur}
                      className="absolute inset-0"
                      style={{
                        backdropFilter: `blur(${blur}px)`,
                        WebkitBackdropFilter: `blur(${blur}px)`,
                        maskImage: `linear-gradient(to top, #000, transparent ${stop}%)`,
                        WebkitMaskImage: `linear-gradient(to top, #000, transparent ${stop}%)`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>
                <div className="relative flex w-fit rounded-lg bg-secondary p-0.5 text-xs">
                {(["simple", "deep"] as const).map((m) => (
                  <Tooltip key={m} delayDuration={500}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                          "rounded-md px-2.5 py-1 font-medium capitalize transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
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
                        ? "Answers from general knowledge only"
                        : "Answers using your connected accounts and profile"}
                    </TooltipContent>
                  </Tooltip>
                ))}
                </div>
              </div>

              {/* Solid zone: from the input's top edge down, so the field and
                  disclaimer always sit on an opaque backing. */}
              <div className="bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(draft)
                }}
              >
                <div
                  className={cn(
                    "halo-composer-shell",
                    haloIsThinking && "is-thinking"
                  )}
                  data-thinking={haloIsThinking}
                >
                  <span className="halo-composer-gradient" aria-hidden="true" />
                  <div className="halo-composer-surface flex items-end gap-2 rounded-xl border border-border bg-card py-1.5 pl-4 pr-1.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15">
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
                      placeholder="Ask me anything about your money"
                      className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground md:text-sm"
                    />
                    <Button
                      type="submit"
                      size="icon-sm"
                      className="shrink-0"
                      disabled={!draft.trim()}
                      aria-label="Send message"
                    >
                      <RiArrowUpLine className="size-4" />
                    </Button>
                  </div>
                </div>
              </form>

              <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
                AI can make mistakes. Please consult with your financial advisor before
                taking any actions.
              </p>
              </div>
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

      <Dialog
        open={deleteCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              “{deleteCandidate?.title}” will be removed from your chat history. This
              can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteChat}>
              Delete chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function truncate(text: string, max = 32) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

const DISLIKE_TAGS = ["Not what I asked", "Inaccurate", "Too verbose", "Tone was off"]

function MessageRow({
  message,
  isLast,
  onFollowUp,
}: {
  message: Message
  isLast?: boolean
  onFollowUp?: (text: string) => void
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {message.text}
        </div>
      </div>
    )
  }
  return (
    <HaloMessage
      text={message.text}
      status={message.status ?? "complete"}
      stock={message.stock}
      // Only the latest answer offers follow-ups — older turns stay quiet.
      followUps={isLast ? FOLLOW_UPS : undefined}
      onFollowUp={onFollowUp}
    />
  )
}

// Halo replies are plain (no bubble) and carry copy + feedback actions.
function HaloMessage({
  text,
  status,
  stock,
  followUps,
  onFollowUp,
}: {
  text: string
  status: HaloStatus
  stock?: StockSymbol
  followUps?: string[]
  onFollowUp?: (text: string) => void
}) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [reasonSent, setReasonSent] = React.useState(false)

  function copy() {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    // Confirmation flips in instantly (a plain icon swap, no fade) and clears
    // quickly — long enough to register, short enough to feel snappy.
    window.setTimeout(() => setCopied(false), 1000)
  }

  function setVoteTo(v: "up" | "down") {
    setVote((prev) => {
      const next = prev === v ? null : v
      if (next !== "down") setReasonSent(false)
      return next
    })
  }

  if (status === "thinking") {
    return (
      <div
        className="flex min-h-8 items-center gap-2 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <span>Thinking</span>
        <span className="halo-thinking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    )
  }

  const streaming = status === "streaming"

  return (
    <div className="min-w-0">
      <div
        className="text-sm leading-relaxed whitespace-pre-line text-foreground animate-in fade-in-0 duration-150 motion-reduce:animate-none"
        aria-busy={streaming}
      >
        <span aria-hidden={streaming || undefined}>
          {text}
          {streaming && <span className="halo-stream-caret" aria-hidden="true" />}
        </span>
        {streaming && <span className="sr-only">Halo is writing a response.</span>}
      </div>

      {status === "complete" && stock && <StockWidget symbol={stock} />}

      {status === "complete" && (
        <div className="mt-2 flex items-center gap-0.5">
          <ActionButton label={copied ? "Copied" : "Copy"} onClick={copy}>
            {copied ? (
              <RiCheckLine className="size-3.5 text-foreground" />
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
      )}

      {status === "complete" && vote === "down" && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:slide-in-from-top-0">
          {reasonSent ? (
            <span className="text-xs text-muted-foreground">
              Thanks — this helps Halo improve.
            </span>
          ) : (
            <>
              <span className="mr-0.5 text-xs text-muted-foreground">
                What went wrong?
              </span>
              {DISLIKE_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReasonSent(true)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  {t}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {status === "complete" && followUps && followUps.length > 0 && (
        <div className="mt-4" role="group" aria-label="Follow-up questions">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Follow-ups
          </p>
          <div className="flex flex-col">
            {followUps.map((q, i) => (
              <button
                key={q}
                type="button"
                onClick={() => onFollowUp?.(q)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group flex items-center gap-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors duration-150 animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both hover:text-foreground motion-reduce:animate-none"
              >
                <RiCornerDownLeftLine className="size-3.5 shrink-0 transition-colors" />
                <span className="text-balance">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
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
