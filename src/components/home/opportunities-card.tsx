import * as React from "react"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const OPPORTUNITIES = [
  {
    eyebrow: "Matched to your profile",
    title: "Bundle home + auto with GEICO",
    detail:
      "Your home and auto profile may qualify for a multi-policy discount.",
    value: "$840",
    valueLabel: "Estimated annual savings",
    action: "Get a GEICO quote",
    image: "/geico-logo.png",
    imageAlt: "GEICO",
    imageClassName: "max-h-12 max-w-[150px]",
  },
  {
    eyebrow: "Highest rewards potential",
    title: "Earn more with Prime Visa",
    detail:
      "Based on your shopping activity, earning 5% back at Amazon and Whole Foods could increase your annual rewards.",
    value: "$438",
    valueLabel: "Estimated annual rewards",
    action: "Check eligibility",
    image: "/prime-visa.png",
    imageAlt: "Prime Visa credit card",
    imageClassName: "max-h-16 max-w-[130px]",
  },
  {
    eyebrow: "Low-effort switch",
    title: "Switch to the Disney Bundle",
    detail:
      "Combine Disney+, Hulu, and ESPN+ instead of paying for eligible services separately.",
    value: "$145",
    valueLabel: "Estimated annual savings",
    action: "View bundle options",
    image: "/disney-bundle.jpeg",
    imageAlt: "Disney Bundle with Hulu, Disney Plus, and ESPN Plus",
    imageClassName: "max-h-16 max-w-[160px] rounded-md",
  },
] as const

export function OpportunitiesCard() {
  const [opportunities, setOpportunities] = React.useState(() => [...OPPORTUNITIES])
  const [current, setCurrent] = React.useState(0)
  const touchStartX = React.useRef<number | null>(null)
  const opportunity = opportunities[current]

  const goTo = (index: number) => {
    if (opportunities.length === 0) return
    setCurrent((index + opportunities.length) % opportunities.length)
  }

  if (!opportunity) return null

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div
        className="flex h-[410px] flex-col px-5 py-5"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current == null) return
          const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
          const distance = endX - touchStartX.current
          touchStartX.current = null
          if (Math.abs(distance) < 40) return
          goTo(current + (distance < 0 ? 1 : -1))
        }}
      >
        <div className="text-xs font-medium text-muted-foreground">
          {opportunity.eyebrow}
        </div>

        <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-0.015em] text-foreground">
          {opportunity.title}
        </h3>

        <div className="mt-3 flex h-16 items-center">
          <img
            src={opportunity.image}
            alt={opportunity.imageAlt}
            className={cn("object-contain object-left", opportunity.imageClassName)}
          />
        </div>

        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {opportunity.detail}
        </p>

        <div className="mt-auto rounded-xl bg-secondary/55 p-3.5">
          <p className="text-xs font-medium text-muted-foreground">
            {opportunity.valueLabel}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[30px] font-semibold leading-none tracking-[-0.025em] text-foreground">
              {opportunity.value}
            </span>
            <span className="text-sm font-medium text-muted-foreground">per year</span>
          </div>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => toast.info(`${opportunity.action} selected`)}
        >
          {opportunity.action}
        </Button>
        <button
          type="button"
          className="mt-2 self-center px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          onClick={() => {
            const remaining = opportunities.filter((_, index) => index !== current)
            setOpportunities(remaining)
            setCurrent(current >= remaining.length ? 0 : current)
            toast.info("Offer removed from your opportunities")
          }}
        >
          Not interested in this offer
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Previous opportunity"
          onClick={() => goTo(current - 1)}
        >
          <RiArrowLeftSLine />
        </Button>

        <div className="flex items-center gap-1.5" aria-label={`Opportunity ${current + 1} of ${opportunities.length}`}>
          {opportunities.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show opportunity ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
                index === current ? "w-5 bg-foreground" : "w-1.5 bg-border hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Next opportunity"
          onClick={() => goTo(current + 1)}
        >
          <RiArrowRightSLine />
        </Button>
      </div>
    </Card>
  )
}
