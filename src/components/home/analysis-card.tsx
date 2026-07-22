import { RiArrowRightLine, RiFileTextLine, RiLineChartLine, RiCloseLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { useAskHalo } from "@/components/ask-halo"

/**
 * The "free financial analysis" content from the old welcome page, folded into
 * Home as a dark focal card: the complimentary report + a direct line to Halo.
 */
export function AnalysisCard({
  className,
  onDismiss,
}: {
  className?: string
  onDismiss?: () => void
}) {
  const { ask } = useAskHalo()
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground",
        className
      )}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-md text-primary-foreground/50 transition-colors hover:bg-white/10 hover:text-primary-foreground"
        >
          <RiCloseLine className="size-4" />
        </button>
      )}
      <div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
          <RiLineChartLine className="size-4.5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em]">
          Your financial analysis is ready
        </h2>
        <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-primary-foreground/70">
          A complimentary, in-depth look at your money — where you stand, how today's
          choices shape your future, and where to focus next.
        </p>

        <div className="mt-5 grid w-fit max-w-full gap-2.5">
          <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-primary transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100">
            <RiFileTextLine className="size-4" />
            Open full report
            <RiArrowRightLine className="size-3.5" />
          </button>
          <button
            onClick={() => ask("Walk me through my financial analysis report.")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Talk it through with Halo
          </button>
        </div>
      </div>
    </div>
  )
}
