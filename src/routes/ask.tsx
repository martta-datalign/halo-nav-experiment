import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowUp, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { suggestedPrompts, user } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"

type Message = { id: number; role: "user" | "halo"; text: string }

// Canned reply — this pass ships the conversation shell, not a live model.
const CANNED =
  "Here's a quick read on that. (This is a prototype — Halo's live analysis of your accounts, goals, and cash flow plugs in here. The point of this screen is the full-height, side-nav layout that finally gives the conversation room to breathe.)"

export default function AskHalo() {
  const [params, setParams] = useSearchParams()

  const [messages, setMessages] = React.useState<Message[]>([])
  const [draft, setDraft] = React.useState("")
  const nextId = React.useRef(1)
  const lastSeed = React.useRef<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const send = React.useCallback((text: string) => {
    const value = text.trim()
    if (!value) return
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: value },
      { id: nextId.current++, role: "halo", text: CANNED },
    ])
    setDraft("")
  }, [])

  // Consume the ?q= deep-link as a message. Runs whenever the param changes, so
  // asking a *new* question (via ⌘K) while already on this screen still lands.
  // `lastSeed` dedupes React StrictMode's double-invoked effect on the same value.
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

  const empty = messages.length === 0

  return (
    <>
      <SiteHeader />
      <div className="flex h-[calc(100svh-3.5rem)] flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {empty ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-halo-subtle text-halo">
                <Sparkles className="size-6" />
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
                Ask Halo, {user.name}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Ask anything about your money — your goals, cash flow, or what to do
                next. Halo sees the full picture from your connected accounts.
              </p>
              <div className="mt-6 flex w-full max-w-lg flex-col gap-2">
                {suggestedPrompts.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-halo-border hover:bg-halo-subtle/40"
                  >
                    <Sparkles className="size-4 shrink-0 text-halo" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3 sm:px-6"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-1 shadow-xs focus-within:border-halo-border focus-within:ring-2 focus-within:ring-halo/20">
            <Sparkles className="size-4 shrink-0 text-halo" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Halo anything about your money…"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={!draft.trim()}>
            <ArrowUp className="size-4" />
          </Button>
        </form>
        </div>
      </div>
    </>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-halo text-halo-foreground">
          <Sparkles className="size-4" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground ring-1 ring-border"
        )}
      >
        {message.text}
      </div>
    </div>
  )
}
