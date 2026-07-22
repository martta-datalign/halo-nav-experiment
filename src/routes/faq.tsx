import * as React from "react"

import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

const FAQ_CATEGORIES = [
  {
    title: "About Halo",
    questions: [
      {
        question: "What is Halo?",
        answer:
          "Halo is a digital financial planning platform that helps users explore their finances, understand their situation, and prepare for conversations with a financial advisor. It combines AI-powered chat with structured financial tools, calculators, and reports. Halo is designed to make financial understanding more accessible — not to replace a licensed advisor, but to support a more productive relationship with one.",
      },
      {
        question: "Who is Halo designed for?",
        answer:
          "Halo is designed for two main audiences: individuals (clients) who want to understand their financial situation and explore options, and registered investment advisors (RIAs) who want organized client context and structured planning outputs. Individuals may encounter Halo through Datalign's advisor match process.",
      },
      {
        question: "Is Halo a financial advisor?",
        answer:
          "No. Halo is not a licensed financial advisor and does not provide investment advice. It is a platform for financial education, guided analysis, and advisor support. Halo helps users understand their situation and prepare for conversations with a human advisor — it is not a substitute for one.",
      },
    ],
  },
  {
    title: "Chat Modes",
    questions: [
      {
        question: "What is the difference between Simple Mode and Deep Mode?",
        answer:
          "Simple mode is for general financial education and questions. It does not access any personal financial data and is available to any user. Deep mode is for personalized analysis and uses a user's actual financial profile and linked account data to provide tailored insights. Deep mode requires either a completed financial profile or linked accounts via Plaid.",
      },
      {
        question: "Do I have to share my financial information to use Halo?",
        answer:
          "No. Simple mode requires no personal financial data. You can ask financial questions and get plain-language explanations without sharing anything about your situation. Sharing financial data (via a profile or linked accounts) is only required to access personalized responses offered via Deep mode.",
      },
      {
        question: "What kinds of questions can I ask Halo?",
        answer:
          "In Simple mode, Halo can help with financial education topics such as budgeting, investing basics, debt and credit, insurance, retirement planning, taxes, and estate planning. In Deep mode, Halo can analyze your specific situation — including cash-flow reviews, retirement projections, debt payoff comparisons, and portfolio diagnostics — using your actual data.",
      },
    ],
  },
  {
    title: "Account Linking",
    questions: [
      {
        question: "Can Halo see my bank accounts?",
        answer:
          "Only if you choose to link them. Halo uses Plaid, a regulated third-party service, to securely connect to financial accounts. If you link accounts, Halo receives read-only access to balances, account details, and transaction history. You can remove linked accounts at any time. Halo cannot make changes to your accounts.",
      },
      {
        question: "What happens after I link my accounts?",
        answer:
          "After linking, Halo can use your real account data to power Deep mode analysis. This means cash-flow reviews, retirement projections, and other analyses will use your actual balances and transaction history rather than estimates you provide manually. Your linked account data is used only for analysis within Halo.",
      },
      {
        question: "Does Halo store my bank login credentials?",
        answer:
          "No. Halo never stores your bank username or password. Account linking uses Plaid's secure authentication flow, where you log into your bank directly through Plaid's interface. Halo receives only the resulting read-only data — not your credentials.",
      },
      {
        question: "Can I disconnect my linked accounts?",
        answer:
          "Yes. You can disconnect linked accounts at any time from within Halo. Once disconnected, Halo will no longer have access to that account's data, and Deep mode analysis will lose access to that account's data.",
      },
    ],
  },
  {
    title: "Data and Privacy",
    questions: [
      {
        question: "How does Halo protect my data?",
        answer:
          "Halo uses secure, encrypted connections for all data transmission. Account linking is handled through Plaid, which is a regulated, widely trusted financial data service. Halo does not sell user data.",
      },
    ],
  },
  {
    title: "Reports and Features",
    questions: [
      {
        question: "What is a Financial Analysis Report (FAR)?",
        answer:
          "A Financial Analysis Report is a structured summary document that organizes a user's financial situation, insights, and key findings into an advisor-ready format. A FAR is designed to help you arrive at an advisor meeting prepared, with your situation clearly summarized.",
      },
      {
        question: "Can Halo execute trades or move my money?",
        answer:
          "No. Halo has no ability to execute trades, transfer funds, or take any financial action on your behalf. All account access is strictly read-only. Halo is an analysis and guidance tool only.",
      },
    ],
  },
  {
    title: "Advisors",
    questions: [
      {
        question: "Can Halo help me find a financial advisor?",
        answer:
          "Halo is part of the Datalign platform, which matches individuals with registered investment advisors. If you are using Halo, Datalign may be actively working to find an appropriate advisor match for you in the background. Halo itself does not directly search for or recommend specific advisors.",
      },
    ],
  },
] as const

export default function FAQ() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeCategory = FAQ_CATEGORIES[activeIndex]

  return (
    <>
      <SiteHeader />
      <main className="app-page">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Frequently Asked Questions
        </h1>

        <nav
          aria-label="FAQ categories"
          className="mt-5 flex flex-wrap gap-2"
        >
          {FAQ_CATEGORIES.map((category, index) => (
            <button
              key={category.title}
              type="button"
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeIndex === index
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-input hover:bg-secondary/45 hover:text-foreground"
              }`}
            >
              {category.title}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <section
            key={activeCategory.title}
            aria-label={activeCategory.title}
            className="animate-in fade-in-0 duration-150 motion-reduce:animate-none"
          >
            <div>
              {activeCategory.questions.map((item, index) => (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function FAQItem({
  question,
  answer,
  defaultOpen,
}: {
  question: string
  answer: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const contentId = React.useId()

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-6 text-left text-sm font-medium transition-[padding] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          open ? "py-4" : "py-5"
        )}
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
