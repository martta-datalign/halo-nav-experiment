import { cn } from "@/lib/utils"

/**
 * Halo's avatar — a living bluish gradient orb that represents the assistant.
 * Purely decorative (the surrounding context carries the label), so it's
 * aria-hidden. Size it with a utility class via `className` (e.g. "size-6").
 * Pass `active` while Halo is thinking to speed the motion up.
 */
export function HaloAvatar({
  className,
  active = false,
}: {
  className?: string
  active?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("halo-orb inline-block shrink-0 size-6", active && "is-active", className)}
    />
  )
}
