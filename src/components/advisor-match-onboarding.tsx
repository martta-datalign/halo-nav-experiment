import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
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

type Step = "match" | "schedule" | "next"

const STEP_LABELS: Array<{ id: Step; label: string }> = [
  { id: "match", label: "Firm" },
  { id: "schedule", label: "Schedule" },
  { id: "next", label: "Next steps" },
]

function createVelocityTrails(
  start: { x: number; y: number },
  delta: { x: number; y: number }
) {
  const distance = Math.hypot(delta.x, delta.y) || 1
  const perpendicular = { x: -delta.y / distance, y: delta.x / distance }
  const offsets = [-12, 0, 12]

  return offsets.map((offset, index) => {
    const node = document.createElement("span")
    const length = 54 - index * 10
    Object.assign(node.style, {
      position: "fixed",
      left: `${start.x - length / 2 + perpendicular.x * offset}px`,
      top: `${start.y - 1 + perpendicular.y * offset}px`,
      width: `${length}px`,
      height: index === 1 ? "2px" : "1px",
      borderRadius: "999px",
      background: "var(--foreground)",
      pointerEvents: "none",
      zIndex: "60",
      transformOrigin: "right center",
    })
    document.body.appendChild(node)

    const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI)
    const animation = node.animate(
      [
        {
          transform: `translate3d(0, 0, 0) rotate(${angle}deg) scaleX(0.12)`,
          opacity: 0,
        },
        {
          offset: 0.2,
          transform: `translate3d(${delta.x * 0.16}px, ${delta.y * 0.16}px, 0) rotate(${angle}deg) scaleX(1)`,
          opacity: 0.18 - index * 0.035,
        },
        {
          transform: `translate3d(${delta.x * 0.92}px, ${delta.y * 0.92}px, 0) rotate(${angle}deg) scaleX(0.15)`,
          opacity: 0,
        },
      ],
      {
        delay: 72 + index * 24,
        duration: 320,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
        fill: "forwards",
      }
    )
    void animation.finished.then(
      () => node.remove(),
      () => node.remove()
    )
    return node
  })
}

export function AdvisorMatchOnboarding({
  open,
  appointment,
  onDismiss,
  onConfirm,
  onComplete,
}: {
  open: boolean
  appointment: AdvisorAppointment | null
  onDismiss: () => void
  onConfirm: (appointment: AdvisorAppointment) => void
  onComplete: () => void
}) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const panelAnimationRef = React.useRef<Animation | null>(null)
  const trailNodesRef = React.useRef<HTMLElement[]>([])
  const [step, setStep] = React.useState<Step>("match")
  const [date, setDate] = React.useState<(typeof appointmentDates)[number]["id"]>(
    appointmentDates[0].id
  )
  const [time, setTime] = React.useState<(typeof appointmentTimes)[number]>(
    appointmentTimes[1]
  )
  const [minimizing, setMinimizing] = React.useState(false)

  React.useEffect(() => {
    return () => {
      panelAnimationRef.current?.cancel()
      trailNodesRef.current.forEach((node) => node.remove())
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      panelAnimationRef.current?.cancel()
      trailNodesRef.current.forEach((node) => node.remove())
      trailNodesRef.current = []
      setMinimizing(false)
      if (appointment) {
        setDate(appointment.date)
        setTime(appointment.time)
        setStep("next")
      }
    } else {
      setStep("match")
    }
  }, [appointment, open])

  const confirmedAppointment = appointmentLabel(date, time)

  function confirmTime() {
    const nextAppointment = { date, time, label: confirmedAppointment }
    onConfirm(nextAppointment)
    setStep("next")
  }

  function finish() {
    const complete = () => {
      navigate("/advisors")
      onComplete()
    }

    if (reducedMotion) {
      complete()
      return
    }

    const panel = panelRef.current
    const destination = document.querySelector<HTMLElement>(
      "[data-advisor-match-nav]"
    )
    if (!panel || !destination || destination.offsetParent === null) {
      complete()
      return
    }

    const panelRect = panel.getBoundingClientRect()
    const destinationRect = destination.getBoundingClientRect()
    const panelCenter = {
      x: panelRect.left + panelRect.width / 2,
      y: panelRect.top + panelRect.height / 2,
    }
    const destinationCenter = {
      x: destinationRect.left + destinationRect.width / 2,
      y: destinationRect.top + destinationRect.height / 2,
    }
    const x = destinationCenter.x - panelCenter.x
    const y = destinationCenter.y - panelCenter.y
    const scale = Math.max(
      0.035,
      Math.min(
        0.12,
        destinationRect.width / panelRect.width,
        destinationRect.height / panelRect.height
      )
    )
    setMinimizing(true)

    trailNodesRef.current = createVelocityTrails(panelCenter, { x, y })
    const panelAnimation = panel.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
        {
          offset: 0.34,
          transform: `translate3d(${x * 0.16}px, ${y * 0.16}px, 0) scale(0.88)`,
          opacity: 1,
        },
        {
          offset: 0.72,
          transform: `translate3d(${x * 0.72}px, ${y * 0.72}px, 0) scale(0.28, 0.18)`,
          opacity: 0.78,
        },
        {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          opacity: 0,
        },
      ],
      {
        duration: 440,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
        fill: "forwards",
      }
    )
    panelAnimationRef.current = panelAnimation

    destination.animate(
      [
        { transform: "scale(1)" },
        { offset: 0.5, transform: "scale(0.96)" },
        { transform: "scale(1)" },
      ],
      {
        delay: 320,
        duration: 220,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      }
    )

    void panelAnimation.finished.then(complete, () => {})
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !minimizing && onDismiss()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby="advisor-match-intro-description"
        className="h-[min(820px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-5xl"
      >
        <DialogTitle className="sr-only">Your RIA match</DialogTitle>
        <DialogDescription id="advisor-match-intro-description" className="sr-only">
          Review your matched RIA firm, schedule an introduction, and see what happens next.
        </DialogDescription>

        <div
          ref={panelRef}
          className={cn(
            "flex size-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
            minimizing && "pointer-events-none"
          )}
        >
          <header className="flex shrink-0 items-center gap-4 border-b border-border px-5 py-4 sm:px-7">
            <StepRail step={step} />
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close advisor match"
              className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-secondary hover:text-foreground active:scale-90"
            >
              <RiCloseLine className="size-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {step === "match" ? (
              <MatchScreen
                appointmentLocked={appointment !== null}
                onContinue={() => setStep(appointment ? "next" : "schedule")}
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
            ) : (
              <NextScreen
                appointment={{ date, time, label: confirmedAppointment }}
                onBack={() => setStep("match")}
                onFinish={finish}
              />
            )}
            <DatalignAdvisorDisclosure className="mx-auto max-w-4xl border-t border-border px-5 py-7 sm:px-8" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      <div className="mx-auto max-w-4xl">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Great news! We found you a match.
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
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-32 shrink-0 items-center">
                <img
                  src={advisorMatch.logo}
                  alt="Carson Wealth"
                  className="h-auto w-full"
                />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{advisorMatch.firm}</h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
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
            </div>
            <div className="w-full sm:justify-self-end">
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary" size="sm" className="w-full gap-1.5">
                  <a href={advisorMatch.advFormUrl} target="_blank" rel="noreferrer">
                    View ADV Form <RiArrowRightUpLine className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" size="sm" className="w-full gap-1.5">
                  <a href={advisorMatch.secProfileUrl} target="_blank" rel="noreferrer">
                    View SEC Profile <RiArrowRightUpLine className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-7 sm:grid-cols-2 sm:gap-12">
            <MatchList title="Your priorities" items={advisorMatch.matchReasons} />
            <MatchList title="Relevant experience" items={advisorMatch.expertise} />
          </div>
        </div>

        <blockquote className="mt-6 rounded-xl bg-secondary/30 p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
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
            <RiArrowRightLine className="size-4" />
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
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">
          Choose a time.
        </h2>

        <div className="mt-8 rounded-xl bg-secondary/30 p-5 sm:p-6 lg:grid lg:grid-cols-[0.65fr_1.35fr] lg:gap-10">
          <aside className="pb-8 lg:pb-0">
            <img
              src={advisorMatch.logo}
              alt="Carson Wealth"
              className="h-auto w-36"
            />
            <p className="mt-4 text-sm text-muted-foreground">Introduction with</p>
            <h3 className="mt-1 text-xl font-semibold">{advisorMatch.firm}</h3>
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
                        "flex min-h-20 flex-col items-center justify-center rounded-lg border text-sm transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
                        date === item.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-input hover:bg-secondary/35"
                      )}
                    >
                      <span className="text-xs opacity-70">{item.weekday}</span>
                      <span className="mt-1 text-lg font-semibold">{item.day}</span>
                      <span className="text-[11px] opacity-70">{item.month}</span>
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
                        "rounded-lg border px-3 py-2.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]",
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
            <RiArrowRightLine className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function NextScreen({
  appointment,
  onBack,
  onFinish,
}: {
  appointment: AdvisorAppointment
  onBack: () => void
  onFinish: () => void
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
      title: "Keep your analysis handy",
      body: "Your Halo financial analysis will stay available here for the conversation.",
    },
  ]

  return (
    <div className="advisor-onboarding-step px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto w-full max-w-4xl">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          What’s next
        </h2>
        <p className="mt-4 text-lg font-medium">{appointment.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          30-minute video call with {advisorMatch.firm}
        </p>

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => downloadAdvisorAppointment(appointment)}
              className="gap-2"
            >
              <RiDownload2Line className="size-4" />
              Download calendar event
            </Button>
            <Button size="lg" onClick={onFinish} className="gap-2">
              Go to Advisor Match
              <RiArrowRightLine className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
