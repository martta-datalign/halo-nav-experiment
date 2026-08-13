import * as React from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"

/**
 * A container whose direct children animate in, out, and into place when the
 * list changes — so adding, removing, or toggling an item eases the layout
 * rather than snapping it. Drop it in wherever a mapped list or grid can gain
 * or lose children. Respects prefers-reduced-motion automatically.
 */
export function AutoAnimated({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [ref] = useAutoAnimate<HTMLDivElement>()
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
}
