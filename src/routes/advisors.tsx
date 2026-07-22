import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiGlobalLine,
  RiPhoneLine,
} from "@remixicon/react"

import { SiteHeader } from "@/components/site-header"
import { DatalignAdvisorDisclosure } from "@/components/datalign-advisor-disclosure"
import { Button } from "@/components/ui/button"
import { advisorMatch } from "@/lib/advisor-match"
import type { AdvisorAppointment } from "@/lib/advisor-match"

export default function Advisors({
  appointment,
  onOpenMatch,
}: {
  appointment: AdvisorAppointment | null
  onOpenMatch: () => void
}) {
  const appointmentDate = appointment
    ? new Date(`${appointment.date}T12:00:00`)
    : null
  const appointmentMonth = appointmentDate
    ? appointmentDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : ""
  const appointmentDay = appointmentDate?.getDate()
  const appointmentWeekday = appointmentDate?.toLocaleDateString("en-US", {
    weekday: "long",
  })

  return (
    <>
      <SiteHeader />
      <main className="app-page max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
              Your matched firm
            </h1>
          </div>
          <Button onClick={onOpenMatch} className="gap-1.5">
            {appointment ? "Review appointment" : "Schedule an introduction"}
            <RiArrowRightLine className="size-4" />
          </Button>
        </div>

        {appointment && (
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-positive-border bg-positive-subtle p-4">
            <div className="w-14 shrink-0 overflow-hidden rounded-lg border border-positive-border bg-background text-center shadow-xs">
              <div className="bg-positive px-1 py-1 text-[10px] font-semibold tracking-[0.08em] text-white">
                {appointmentMonth}
              </div>
              <div className="py-1.5 text-xl font-semibold leading-none tabular-nums text-foreground">
                {appointmentDay}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Your introduction is scheduled</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {appointmentWeekday} at {appointment.time} · 30-minute video call
              </p>
            </div>
          </div>
        )}

        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18.5rem] md:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-36 shrink-0 items-center">
                <img
                  src={advisorMatch.logo}
                  alt="Carson Wealth"
                  className="h-auto w-full"
                />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.01em]">
                  {advisorMatch.firm}
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <a
                    href={advisorMatch.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <RiGlobalLine className="size-4" />
                    {advisorMatch.website}
                  </a>
                  <a
                    href={`tel:${advisorMatch.phone.replace(/[^+\d]/g, "")}`}
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <RiPhoneLine className="size-4" />
                    {advisorMatch.phone}
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full md:justify-self-end">
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

          <div className="mt-10 rounded-lg bg-secondary/40 p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
              From {advisorMatch.firm}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/85">
              {advisorMatch.note}
            </p>
          </div>
        </section>

        <DatalignAdvisorDisclosure className="mt-8 border-t border-border pt-7" />
      </main>
    </>
  )
}
