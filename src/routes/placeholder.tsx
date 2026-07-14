import { RiSparkling2Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { useAskHalo } from "@/components/ask-halo"
import { SiteHeader } from "@/components/site-header"

export default function Placeholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const { ask } = useAskHalo()
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-halo-subtle text-halo">
        <RiSparkling2Line className="size-5" />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-[-0.01em]">{title}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button variant="outline" className="mt-5 gap-2" onClick={() => ask()}>
        <RiSparkling2Line className="size-4 text-halo" />
        Ask Halo instead
      </Button>
      </div>
    </>
  )
}
