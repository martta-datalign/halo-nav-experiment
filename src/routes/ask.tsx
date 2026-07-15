import * as React from "react"
import { useSearchParams } from "react-router-dom"
import {
  RiAddLine,
  RiArrowUpLine,
  RiChatHistoryLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMore2Line,
  RiPencilLine,
  RiSafe2Line,
  RiSparkling2Line,
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
import { suggestedPrompts } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { SEED_VAULT_DOCS, VaultDialog, type VaultDoc } from "@/components/ask/vault"

type Role = "user" | "halo"
type HaloStatus = "thinking" | "streaming" | "complete"
type Message = { id: number; role: Role; text: string; status?: HaloStatus }
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
    const chatId = activeIdRef.current
    const userMessageId = msgId.current++
    const haloMessageId = msgId.current++
    const reply = REPLIES[modeRef.current]
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

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: haloIsThinking ? "auto" : "smooth",
    })
  }, [haloIsThinking, messages])

  // Auto-grow the input as the user types (capped, then it scrolls internally).
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

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
          <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Recent
          </div>
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
                    className="h-7 w-full min-w-0 rounded-md border border-ring bg-background px-2 text-[13px] outline-none ring-2 ring-ring/15"
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
                    <span className="text-[11px] text-muted-foreground">{c.when}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${c.title}`}
                        className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-100 outline-none transition-opacity hover:bg-background/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-background/80 data-[state=open]:text-foreground md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100 md:data-[state=open]:opacity-100"
                      >
                        <RiMore2Line className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-36">
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
            <span className="flex-1 text-[13px] font-medium text-foreground">My Vault</span>
            <span className="text-[11px] text-muted-foreground">{docs.length}</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <SiteHeader
        title={active.title}
        showSearch={false}
        // On mobile New chat + history live in the header; hide the avatar and
        // bell so the row doesn't crowd. Both stay reachable from other pages.
        hideAccountOnMobile
        hideNotificationsOnMobile
        actions={
          <>
            <Button
              size="icon"
              variant="ghost"
              // 40px touch target on mobile (36px is tight for fingers); the
              // glyph stays 16px. Desktop is hidden anyway.
              className="size-10 text-muted-foreground md:hidden"
              aria-label="New chat"
              onClick={newChat}
            >
              <RiAddLine className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-10 text-muted-foreground md:hidden"
              aria-label="Chat history"
              onClick={() => setHistoryOpen(true)}
            >
              <RiChatHistoryLine className="size-5" />
            </Button>
          </>
        }
      />
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
                        ? "Answers without referring to the financial information you provide"
                        : "Answers that refer to the financial information you provide"}
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
  return <HaloMessage text={message.text} status={message.status ?? "complete"} />
}

// Halo replies are plain (no bubble) and carry copy + feedback actions.
function HaloMessage({ text, status }: { text: string; status: HaloStatus }) {
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
        className="text-sm leading-relaxed text-foreground animate-in fade-in-0 duration-150 motion-reduce:animate-none"
        aria-busy={streaming}
      >
        <span aria-hidden={streaming || undefined}>
          {text}
          {streaming && <span className="halo-stream-caret" aria-hidden="true" />}
        </span>
        {streaming && <span className="sr-only">Halo is writing a response.</span>}
      </div>

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
