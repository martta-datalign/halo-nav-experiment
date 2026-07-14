import { RiShieldCheckLine, RiCloseLine } from "@remixicon/react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * An action item, not a form. Sharing with an advisor is a decision you take:
 * a primary button that, on success, raises a confirmation banner and closes
 * the card. The sharing setting then lives in Settings, where it can be changed.
 */
export function ActionableCard({ onDismiss }: { onDismiss?: () => void }) {
  function share() {
    toast.success("Shared with your advisor", {
      description: "They can now build your plan. Manage sharing anytime in Settings.",
    })
    onDismiss?.()
  }

  return (
    <Card className="relative gap-0 p-5 sm:p-6">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RiCloseLine className="size-4" />
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2 pr-7">
        <h2 className="text-[15px] font-semibold tracking-[-0.005em]">
          Make it actionable
        </h2>
        <Badge variant="secondary" className="bg-halo-subtle text-halo">
          Recommended
        </Badge>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Share your dashboard so your advisor can build a plan around it. They're a
        fiduciary — obligated to protect your interests — and you can revoke access
        anytime.
      </p>
      <Button className="mt-4 w-full gap-1.5" onClick={share}>
        <RiShieldCheckLine className="size-4" />
        Share with my advisor
      </Button>
    </Card>
  )
}
