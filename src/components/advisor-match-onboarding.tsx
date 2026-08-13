import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  RiArrowLeftLine,
  RiArrowRightUpLine,
  RiCalendarCheckLine,
  RiCheckLine,
  RiCloseLine,
  RiDownload2Line,
  RiGlobalLine,
  RiPhoneLine,
  RiTimeLine,
  RiVideoOnLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { useAccounts } from "@/components/accounts-provider"
import { ConnectAccountFlow } from "@/components/connect-account-dialog"
import { DatalignAdvisorDisclosure } from "@/components/datalign-advisor-disclosure"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import {
  advisorMatch,
  type AdvisorAppointment,
  appointmentDates,
  appointmentLabel,
  appointmentTimes,
  downloadAdvisorAppointment,
} from "@/lib/advisor-match"
import { cn } from "@/lib/utils"

type Step = "match" | "schedule" | "accounts" | "next"

const STEP_LABELS: Array<{ id: Step; label: string }> = [
  { id: "match", label: "Firm" },
  { id: "schedule", label: "Schedule" },
  { id: "next", label: "Next steps" },
  { id: "accounts", label: "Add account" },
]

export function AdvisorMatchOnboarding({
  open,
  appointment,
  onDismiss,
  onConfirm,
  onComplete,
  onAnalysisReady,
  onAccountsSkipped,
}: {
  open: boolean
  appointment: AdvisorAppointment | null
  onDismiss: () => void
  onConfirm: (appointment: AdvisorAppointment) => void
  onComplete: () => void
  onAnalysisReady: () => void
  onAccountsSkipped: () => void
}) {
  const navigate = useNavigate()
  const { addAccount } = useAccounts()
  const reducedMotion = useReducedMotion()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const panelAnimationRef = React.useRef<Animation | null>(null)
  const wasOpenRef = React.useRef(false)
  const [step, setStep] = React.useState<Step>("match")
  const [date, setDate] = React.useState<(typeof appointmentDates)[number]["id"]>(
    appointmentDates[0].id
  )
  const [time, setTime] = React.useState<(typeof appointmentTimes)[number]>(
    appointmentTimes[1]
  )
  const [transitioning, setTransitioning] = React.useState(false)
  const [accountsPrepared, setAccountsPrepared] = React.useState(false)

  React.useEffect(() => {
    return () => {
      panelAnimationRef.current?.cancel()
    }
  }, [])

  React.useEffect(() => {
    const opening = open && !wasOpenRef.current
    if (opening) {
      panelAnimationRef.current?.cancel()
      setTransitioning(false)
      if (appointment) {
        setDate(appointment.date)
        setTime(appointment.time)
        setStep(accountsPrepared ? "next" : "accounts")
      }
    } else {
      if (!open) setStep("match")
    }
    wasOpenRef.current = open
  }, [accountsPrepared, appointment, open])

  const confirmedAppointment = appointmentLabel(date, time)

  function confirmTime() {
    const nextAppointment = { date, time, label: confirmedAppointment }
    onConfirm(nextAppointment)
    setStep("next")
  }

  function finish(afterComplete?: () => void) {
    const complete = () => {
      navigate("/")
      onComplete()
      afterComplete?.()
    }

    if (reducedMotion) {
      complete()
      return
    }

    const panel = panelRef.current
    if (!panel) {
      complete()
      return
    }

    setTransitioning(true)

    const panelAnimation = panel.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
        {
          transform: "translate3d(0, -6px, 0) scale(0.985)",
          opacity: 0,
        },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        fill: "forwards",
      }
    )
    panelAnimationRef.current = panelAnimation

    void panelAnimation.finished.then(complete, () => {})
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !transitioning && onDismiss()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby="advisor-match-intro-description"
        className="h-[min(820px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">Your RIA match</DialogTitle>
        <DialogDescription id="advisor-match-intro-description" className="sr-only">
          Review your matched RIA firm, schedule an introduction, and see what happens next.
        </DialogDescription>

        <div
          ref={panelRef}
          className={cn(
            "flex size-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
            transitioning && "pointer-events-none"
          )}
        >
          <header className="shrink-0 border-b border-border px-5 py-4 sm:px-8">
            <div className="flex items-center gap-4">
              <StepRail step={step} />
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Close advisor match"
                className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-secondary hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {step === "match" ? (
              <MatchScreen
                appointmentLocked={appointment !== null}
                onContinue={() =>
                  setStep(
                    appointment
                      ? accountsPrepared
                        ? "next"
                        : "accounts"
                      : "schedule"
                  )
                }
              />
            ) : step === "schedule" ? (
              <ScheduleScreen
                date={date}
                time={time}
                onDateChange={setDate}
                onTimeChange={setTime}
                onBack={() => setStep("match")}
                onContinue={confirmTime}
              />
            ) : step === "accounts" ? (
              <AccountsScreen
                onBack={() => setStep("next")}
                onAccountAdded={addAccount}
                onSkip={() => finish(onAccountsSkipped)}
                onConnected={() => {
                  setAccountsPrepared(true)
                  finish(onAnalysisReady)
                }}
              />
            ) : (
              <NextScreen
                appointment={{ date, time, label: confirmedAppointment }}
                onBack={() => setStep("match")}
                onContinue={() => setStep("accounts")}
              />
            )}
            <div className="px-5 sm:px-8">
              <DatalignAdvisorDisclosure className="border-t border-border py-7" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AccountsScreen({
  onBack,
  onAccountAdded,
  onSkip,
  onConnected,
}: {
  onBack: () => void
  onAccountAdded: ReturnType<typeof useAccounts>["addAccount"]
  onSkip: () => void
  onConnected: () => void
}) {
  return (
    <div className="advisor-onboarding-step px-5 py-7 sm:px-8 sm:py-9">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-2xl">
            Build your financial analysis
          </h2>
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Connect accounts for a more complete financial analysis report.
        </p>

        <div className="mt-7">
          <ConnectAccountFlow
            embedded
            hideChooseHeader
            onBack={onBack}
            onAccountAdded={onAccountAdded}
            onComplete={onConnected}
          />
        </div>
      </div>
    </div>
  )
}

function StepRail({ step }: { step: Step }) {
  const activeIndex = STEP_LABELS.findIndex((item) => item.id === step)
  return (
    <div className="flex min-w-0 flex-1 items-center gap-6">
      <p className="shrink-0 text-sm font-semibold">Advisor Match</p>
      <ol className="hidden min-w-0 items-center gap-5 sm:flex">
        {STEP_LABELS.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "text-xs transition-colors duration-200",
              index === activeIndex
                ? "font-medium text-foreground"
                : index < activeIndex
                  ? "text-foreground/55"
                  : "text-muted-foreground/70"
            )}
            aria-current={item.id === step ? "step" : undefined}
          >
            {item.label}
          </li>
        ))}
      </ol>
      <p className="truncate text-xs text-muted-foreground sm:hidden">
        {activeIndex + 1} of {STEP_LABELS.length} · {STEP_LABELS[activeIndex].label}
      </p>
    </div>
  )
}

function MatchScreen({
  appointmentLocked,
  onContinue,
}: {
  appointmentLocked: boolean
  onContinue: () => void
}) {
  return (
    <div className="advisor-onboarding-step px-5 py-7 sm:px-8 sm:py-9">
      <div>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.03em] sm:text-2xl">
          We found your advisor match.
        </h2>
        <p className="mt-3 flex items-center gap-2 text-sm">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-positive text-positive">
            <RiCheckLine className="size-3.5" />
          </span>
          <span className="font-medium text-positive">Strong match</span>
          <span className="text-muted-foreground">based on your priorities</span>
        </p>

        <div className="mt-8 rounded-xl bg-secondary/30 p-5 sm:p-6">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_18.5rem] sm:items-start">
            <div className="min-w-0">
              <img
                src={advisorMatch.logo}
                alt="Carson Wealth"
                className="h-auto w-36"
              />
              <h3 className="mt-4 text-2xl font-semibold">{advisorMatch.firm}</h3>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <a
                  href={advisorMatch.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <RiGlobalLine className="size-4" /> {advisorMatch.website}
                </a>
                <a
                  href={`tel:${advisorMatch.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <RiPhoneLine className="size-4" /> {advisorMatch.phone}
                </a>
              </div>
            </div>
            <div className="w-full sm:justify-self-end">
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                  <a href={advisorMatch.advFormUrl} target="_blank" rel="noreferrer">
                    View ADV form <RiArrowRightUpLine className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                  <a href={advisorMatch.secProfileUrl} target="_blank" rel="noreferrer">
                    View SEC profile <RiArrowRightUpLine className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-7 sm:grid-cols-[minmax(0,1fr)_18.5rem] sm:gap-12">
            <MatchList title="Your priorities" items={advisorMatch.matchReasons} />
            <MatchList title="Relevant experience" items={advisorMatch.expertise} />
          </div>
        </div>

        <blockquote className="mt-6 rounded-xl bg-secondary/30 p-5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">
            From {advisorMatch.firm}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/85">
            {advisorMatch.note}
          </p>
        </blockquote>

        <div className="mt-7 flex justify-end">
          <Button size="lg" onClick={onContinue} className="gap-2">
            {appointmentLocked
              ? "Review appointment"
              : "Schedule an introduction"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MatchList({
  title,
  items,
}: {
  title: string
  items: readonly string[]
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <RiCheckLine className="mt-0.5 size-4 shrink-0 text-foreground/55" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScheduleScreen({
  date,
  time,
  onDateChange,
  onTimeChange,
  onBack,
  onContinue,
}: {
  date: string
  time: (typeof appointmentTimes)[number]
  onDateChange: (date: (typeof appointmentDates)[number]["id"]) => void
  onTimeChange: (time: (typeof appointmentTimes)[number]) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="advisor-onboarding-step px-5 py-7 sm:px-8 sm:py-9">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-2xl">
          Choose a time
        </h2>

        <div className="mt-8 rounded-xl bg-secondary/30 p-5 sm:p-6 lg:grid lg:grid-cols-[0.65fr_1.35fr] lg:gap-10">
          <aside className="pb-8 lg:pb-0">
            <img
              src={advisorMatch.logo}
              alt="Carson Wealth"
              className="h-auto w-36"
            />
            <p className="mt-4 text-sm text-muted-foreground">Introduction with</p>
            <h3 className="mt-1 text-2xl font-semibold">{advisorMatch.firm}</h3>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2.5">
                <RiTimeLine className="size-4" /> 30 minutes
              </p>
              <p className="flex items-center gap-2.5">
                <RiVideoOnLine className="size-4" /> Secure video call
              </p>
              <p className="flex items-center gap-2.5">
                <RiCalendarCheckLine className="size-4" /> Eastern Time
              </p>
            </div>
          </aside>

          <div>
            <div className="grid gap-7 sm:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm font-semibold">Date</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {appointmentDates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={date === item.id}
                      onClick={() => onDateChange(item.id)}
                      className={cn(
                        "flex min-h-20 flex-col items-center justify-center rounded-lg border text-sm transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                        date === item.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-input hover:bg-secondary/35"
                      )}
                    >
                      <span className="text-xs opacity-70">{item.weekday}</span>
                      <span className="mt-1 text-2xl font-semibold">{item.day}</span>
                      <span className="text-xs opacity-70">{item.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Time</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1">
                  {appointmentTimes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={time === item}
                      onClick={() => onTimeChange(item)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                        time === item
                          ? "border-foreground bg-secondary text-foreground"
                          : "border-border hover:border-input"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} className="gap-1.5">
            <RiArrowLeftLine className="size-4" /> Back
          </Button>
          <Button size="lg" onClick={onContinue} className="gap-2">
            Confirm {time}
          </Button>
        </div>
      </div>
    </div>
  )
}

function NextScreen({
  appointment,
  onBack,
  onContinue,
}: {
  appointment: AdvisorAppointment
  onBack: () => void
  onContinue: () => void
}) {
  const items = [
    {
      title: "Check your inbox",
      body: "We’ll send the secure video link and a reminder before your call.",
    },
    {
      title: "Review your priorities",
      body: "Note any goals, questions, or financial decisions you want to discuss.",
    },
    {
      title: "Complete your financial picture",
      body: "Add accounts in the next step to make your financial analysis more complete.",
    },
  ]

  return (
    <div className="advisor-onboarding-step px-5 py-7 sm:px-8 sm:py-9">
      <div className="w-full">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-2xl">
              What’s next
            </h2>
            <p className="mt-4 text-2xl font-medium">{appointment.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              30-minute video call with {advisorMatch.firm}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => downloadAdvisorAppointment(appointment)}
            className="shrink-0 gap-2 self-start"
          >
            <RiDownload2Line className="size-4" />
            Download calendar event
          </Button>
        </div>

        <div className="mt-8 space-y-6 rounded-xl bg-secondary/30 p-5 sm:p-6">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="grid gap-3 sm:grid-cols-[2.5rem_1fr] sm:gap-5"
            >
              <span className="font-mono text-xs text-muted-foreground">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-1.5 self-start">
            <RiArrowLeftLine className="size-4" />
            Back to your match
          </Button>
          <Button size="lg" onClick={onContinue} className="gap-2">
            Continue to accounts
          </Button>
        </div>
      </div>
    </div>
  )
}
