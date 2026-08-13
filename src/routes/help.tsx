import * as React from "react"
import {
  RiSearchLine,
  RiRocketLine,
  RiBankLine,
  RiSparkling2Line,
  RiToolsLine,
  RiShieldCheckLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"

type Article = { title: string; excerpt: string; mins: number }
type Topic = {
  id: string
  title: string
  icon: React.ElementType
  blurb: string
  articles: Article[]
}

const TOPICS: Topic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: RiRocketLine,
    blurb: "Set up your workspace and find your footing.",
    articles: [
      { title: "Welcome to Halo", excerpt: "A quick tour of the dashboard, Ask Halo, and the tools that help you plan.", mins: 3 },
      { title: "Simple mode vs Deep mode", excerpt: "When Halo answers from general knowledge versus your own connected data.", mins: 4 },
      { title: "Your first financial analysis", excerpt: "How Halo turns your accounts into an advisor-ready summary.", mins: 5 },
    ],
  },
  {
    id: "accounts",
    title: "Accounts & connections",
    icon: RiBankLine,
    blurb: "Connect institutions or add balances by hand.",
    articles: [
      { title: "Connect an account with Plaid", excerpt: "Securely link a bank or brokerage in read-only mode.", mins: 3 },
      { title: "Add a manual account", excerpt: "Track balances Halo can't pull automatically.", mins: 2 },
      { title: "Disconnect or remove an account", excerpt: "Revoke access and clean up your account list.", mins: 2 },
    ],
  },
  {
    id: "ask-halo",
    title: "Using Halo AI",
    icon: RiSparkling2Line,
    blurb: "Get sharper answers from the assistant.",
    articles: [
      { title: "Ask better questions", excerpt: "Prompts and follow-ups that get you to a decision faster.", mins: 4 },
      { title: "How Halo uses your data", excerpt: "What the assistant can see, and how it stays read-only.", mins: 3 },
      { title: "Sharing documents with the Vault", excerpt: "Upload statements and forms so answers reflect the full picture.", mins: 3 },
    ],
  },
  {
    id: "planning",
    title: "Planning & tools",
    icon: RiToolsLine,
    blurb: "Goals, calculators, and reading your trends.",
    articles: [
      { title: "Set and track a goal", excerpt: "Create a target, fund it, and watch progress update.", mins: 4 },
      { title: "Using the calculators", excerpt: "Model a mortgage, retirement, or compound-growth scenario.", mins: 5 },
      { title: "Reading your net-worth trend", excerpt: "What the chart, ranges, and deltas are telling you.", mins: 4 },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & security",
    icon: RiShieldCheckLine,
    blurb: "How your information is protected and shared.",
    articles: [
      { title: "How your data is protected", excerpt: "Encryption, Plaid, and Halo's read-only access model.", mins: 3 },
      { title: "What your advisor can see", excerpt: "Control what's shared when you're matched with an advisor.", mins: 4 },
      { title: "Managing permissions", excerpt: "Review and revoke access at any time.", mins: 2 },
    ],
  },
]

const FAQS = [
  {
    question: "Is Halo a financial advisor?",
    answer:
      "No. Halo is not a licensed financial advisor and does not provide investment advice. It's a platform for financial education, guided analysis, and advisor support — it helps you understand your situation and prepare for conversations with a human advisor.",
  },
  {
    question: "Do I have to share my financial information?",
    answer:
      "No. Simple mode requires no personal financial data. Sharing data — via a profile or linked accounts — is only needed for the personalized responses in Deep mode.",
  },
  {
    question: "Does Halo store my bank login credentials?",
    answer:
      "No. Halo never stores your bank username or password. Linking uses Plaid's secure authentication, where you log in directly through Plaid. Halo receives only read-only data — not your credentials.",
  },
  {
    question: "Can Halo execute trades or move my money?",
    answer:
      "No. Halo has no ability to execute trades, transfer funds, or take any financial action. All account access is strictly read-only.",
  },
  {
    question: "Can Halo help me find a financial advisor?",
    answer:
      "Halo is part of the Datalign platform, which matches individuals with registered investment advisors. Datalign may be working to find an appropriate match for you in the background.",
  },
] as const

function matches(query: string, ...fields: string[]) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return fields.some((f) => f.toLowerCase().includes(q))
}

export default function Help() {
  const [query, setQuery] = React.useState("")
  const searching = query.trim().length > 0

  const topicResults = TOPICS.map((topic) => ({
    topic,
    articles: topic.articles.filter((a) => matches(query, a.title, a.excerpt, topic.title)),
  })).filter((t) => t.articles.length > 0)

  const faqResults = FAQS.filter((f) => matches(query, f.question, f.answer))
  const noResults = searching && topicResults.length === 0 && faqResults.length === 0

  // Single-open accordion: opening one FAQ closes the others. Re-anchor to the
  // first visible result whenever the query changes so search always shows one.
  const [openFaq, setOpenFaq] = React.useState<string | null>(FAQS[0].question)
  React.useEffect(() => {
    setOpenFaq(searching ? (faqResults[0]?.question ?? null) : FAQS[0].question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <main className="app-page">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">Help</h1>

      {/* Global search */}
      <div className="relative mt-5">
        <RiSearchLine className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles and FAQs…"
          aria-label="Search help"
          className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      {noResults ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No results for “{query.trim()}”. Try a different term.
        </p>
      ) : (
        <>
          {/* FAQ — first */}
          {faqResults.length > 0 && (
            <section className="mt-8" aria-label="Frequently asked questions">
              <div>
                {faqResults.map((item) => (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    open={openFaq === item.question}
                    onToggle={() =>
                      setOpenFaq((current) =>
                        current === item.question ? null : item.question
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Articles by topic */}
          {topicResults.length > 0 && (
            <section className="mt-10" aria-label="Articles by topic">
              {!searching && (
                <h2 className="text-sm font-semibold">Browse by topic</h2>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topicResults.map(({ topic, articles }) => (
                  <div
                    key={topic.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-4"
                  >
                    <TopicThumb topic={topic} />
                    <ul className="mt-4 flex flex-col">
                      {articles.map((a) => (
                        <li key={a.title}>
                          <a
                            href="#"
                            className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary/60"
                          >
                            <span className="truncate">{a.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#"
                      aria-label={`View all ${topic.title} articles`}
                      className="mt-1.5 w-fit rounded-sm py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View all
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

/**
 * Cover art for a topic card — a neutral gray "frame" holding a document-style
 * preview: the topic icon, the topic title (a real <h3>, so it labels the card
 * for assistive tech), and a couple of skeleton body lines. The icon and
 * skeletons are decorative (aria-hidden); the heading carries the meaning.
 */
function TopicThumb({ topic }: { topic: Topic }) {
  return (
    <div className="relative h-32 overflow-hidden rounded-xl bg-linear-to-b from-secondary to-muted/50">
      {/* Inset "document" that bleeds off the bottom edge for a preview feel. */}
      <div className="absolute inset-x-4 -bottom-3 top-4 rounded-t-lg border border-b-0 border-border/70 bg-card p-4">
        <topic.icon aria-hidden="true" className="size-5 text-muted-foreground" />
        <h3 className="mt-2.5 truncate text-sm font-semibold text-foreground">
          {topic.title}
        </h3>
        <div aria-hidden="true" className="mt-2.5 h-1.5 w-full rounded-full bg-foreground/[0.06]" />
        <div aria-hidden="true" className="mt-2 h-1.5 w-4/5 rounded-full bg-foreground/[0.06]" />
      </div>
    </div>
  )
}

function FAQItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string
  answer: string
  open: boolean
  onToggle: () => void
}) {
  const contentId = React.useId()

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-4 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{question}</span>
        <span className="relative size-4 shrink-0 text-muted-foreground" aria-hidden="true">
          <span className="absolute left-0.5 right-0.5 top-1/2 h-px -translate-y-1/2 bg-current" />
          <span
            className={cn(
              "absolute bottom-0.5 left-1/2 top-0.5 w-px -translate-x-1/2 bg-current transition-transform duration-150 ease-out motion-reduce:transition-none",
              open && "scale-y-0"
            )}
          />
        </span>
      </button>
      <div
        id={contentId}
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
