import * as React from "react"
import { cn } from "@/lib/utils"

/** The product's one logo source, so every brand mark resolves the same way. */
function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

/**
 * A brand mark in the product's standard treatment: a white, bordered rounded
 * square with the logo contained inside. Pass a `domain` (looked up as a logo)
 * or an explicit `src` (e.g. a local asset). Falls back to a monogram — or a
 * caller-supplied icon — when there's no logo or it fails to load, so a row
 * never loses its leading slot.
 */
export function BrandLogo({
  name,
  domain,
  src,
  bleed,
  color,
  fallback,
  className,
}: {
  name?: string
  domain?: string
  src?: string
  /**
   * Fill the tile edge-to-edge — for logos that are complete colored tiles
   * (e.g. app icons like Amazon). Marks that need breathing room stay padded,
   * which is the default; set this per-brand as the logo warrants.
   */
  bleed?: boolean
  /** Brand color for the monogram shown when there's no usable logo. */
  color?: string
  fallback?: React.ReactNode
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)
  const resolved = src ?? (domain ? faviconUrl(domain) : undefined)
  const showImage = resolved && !failed
  const fill = !!bleed

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white",
        className
      )}
    >
      {showImage ? (
        <img
          src={resolved}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("size-full", fill ? "object-cover" : "object-contain p-1.5")}
        />
      ) : (
        fallback ?? (
          <span
            className={cn("text-[13px] font-semibold", !color && "text-muted-foreground")}
            style={color ? { color } : undefined}
          >
            {(name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )
      )}
    </span>
  )
}
