import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * The single, canonical way to show an account/holding's data source. Use this
 * everywhere a "Plaid / Manual / Estimated" status appears so the badge
 * reads identically across the app (dot + label, consistent color per source).
 */
export type AccountSource = "connected" | "manual" | "form"

const CONFIG: Record<AccountSource, { label: string; dot: string; className: string }> = {
  connected: {
    label: "Plaid",
    dot: "bg-positive",
    className: "border-positive-border bg-positive-subtle text-positive",
  },
  manual: {
    label: "Manual",
    dot: "bg-muted-foreground",
    className: "border-border bg-secondary text-muted-foreground",
  },
  form: {
    label: "Estimated",
    dot: "bg-info",
    className: "border-info/25 bg-info/10 text-info",
  },
}

export function SourceBadge({
  source,
  className,
}: {
  source: AccountSource
  className?: string
}) {
  const config = CONFIG[source]
  return (
    <Badge variant="outline" className={cn("gap-1", config.className, className)}>
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  )
}
