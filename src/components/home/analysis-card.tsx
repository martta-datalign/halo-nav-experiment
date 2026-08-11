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
  ready = true,
  onConnectAccounts,
}: {
  className?: string
  onDismiss?: () => void
  ready?: boolean
  onConnectAccounts?: () => void
}) {
  const { ask } = useAskHalo()
  return (
    <div
      className={cn(
        "gradient-aurora relative overflow-hidden rounded-2xl p-6 text-white",
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
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.01em]">
          {ready
            ? "Your financial analysis is ready"
            : "Connect accounts to unlock your analysis"}
        </h2>
        <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-primary-foreground/70">
          {ready
            ? "A complimentary, in-depth look at your money, where you stand, and where to focus next."
            : "Add at least one account so Halo can prepare your financial analysis."}
        </p>

        <div className="mt-5 grid w-fit max-w-full gap-2.5">
          <button
            onClick={() => !ready && onConnectAccounts?.()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <RiFileTextLine className="size-4" />
            {ready ? "Open full report" : "Connect accounts"}
            <RiArrowRightLine className="size-3.5" />
          </button>
          {ready && (
            <button
              onClick={() => ask("Walk me through my financial analysis report.")}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/25 px-4 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Talk it through with Halo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
