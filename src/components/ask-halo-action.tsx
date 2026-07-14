import { RiSparkling2Line } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { useAskHalo } from "@/components/ask-halo"

/**
 * A contextual Ask Halo prompt shown just under a card's title — a line of text
 * (the actual question you'd ask), not a lone icon. The sparkle tilts slightly
 * on hover. Clicking opens the seeded chat.
 */
export function AskHaloAction({
  prompt,
  text,
  className,
}: {
  prompt: string
  /** Short, human display of the question (the full `prompt` seeds the chat). */
  text: string
  className?: string
}) {
  const { ask } = useAskHalo()
  return (
    <button
      type="button"
      onClick={() => ask(prompt)}
      className={cn(
        "group/ask inline-flex max-w-full items-center gap-1.5 text-left text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-halo",
        className
      )}
    >
      <RiSparkling2Line className="size-3.5 shrink-0 transition-transform duration-300 ease-out group-hover/ask:rotate-180" />
      <span className="truncate">{text}</span>
    </button>
  )
}

/**
 * Consistent card footer for the Ask Halo prompt: a full-width, top-bordered
 * strip pinned to the bottom of a `p-5 sm:p-6` card. Every card uses this so the
 * AI prompt always lives at the foot.
 */
export function CardPromptFooter({
  prompt,
  text,
}: {
  prompt: string
  text: string
}) {
  return (
    // Outer pins to the card bottom (mt-auto) and breaks out of the card padding;
    // inner keeps a guaranteed gap above the divider so it never abuts content.
    <div className="-mx-5 -mb-5 mt-auto sm:-mx-6 sm:-mb-6">
      <div className="mt-5 border-t border-border px-5 py-3.5 sm:px-6">
        <AskHaloAction prompt={prompt} text={text} />
      </div>
    </div>
  )
}
