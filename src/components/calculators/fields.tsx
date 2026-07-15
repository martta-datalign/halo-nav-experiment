import * as React from "react"
import { RiBarChart2Line, RiInformationLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** Field label with an optional required marker and info tooltip. */
export function FieldLabel({
  children,
  required,
  hint,
  htmlFor,
}: {
  children: React.ReactNode
  required?: boolean
  hint?: string
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1 text-[13px] font-medium text-foreground"
    >
      {children}
      {required && <span className="text-halo">*</span>}
      {hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
              aria-label="More info"
            >
              <RiInformationLine className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
            {hint}
          </TooltipContent>
        </Tooltip>
      )}
    </label>
  )
}

/** Full form row: label above an input (or any control). */
export function Field({
  label,
  required,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel required={required} hint={hint} htmlFor={htmlFor}>
        {label}
      </FieldLabel>
      {children}
    </div>
  )
}

// The input surface, replicated from ui/input so we can inline $ / % / period
// affixes while keeping the same border, height, and focus ring.
const affixSurface =
  "flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30"

function toText(value: number, format: "money" | "decimal") {
  // NaN / non-finite means "unset" — render blank so the placeholder shows.
  if (!Number.isFinite(value)) return ""
  return format === "money" ? value.toLocaleString("en-US") : String(value)
}

/** Format a default value the same way the input would, for use as a placeholder. */
export function placeholderText(value: number, format: "money" | "decimal" = "decimal") {
  return toText(value, format)
}

/**
 * Numeric input with a live string buffer so decimals ("6.", "0.05") and
 * comma-grouped money read naturally while the parent still holds a number.
 */
export function NumberInput({
  value,
  onValueChange,
  format = "decimal",
  prefix,
  suffix,
  id,
  className,
  ...rest
}: {
  value: number
  onValueChange: (v: number) => void
  format?: "money" | "decimal"
  prefix?: React.ReactNode
  suffix?: React.ReactNode
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "prefix">) {
  const [text, setText] = React.useState(() => toText(value, format))
  const focused = React.useRef(false)

  // Reflect external changes (defaults, resets) unless the user is mid-edit.
  React.useEffect(() => {
    if (!focused.current) setText(toText(value, format))
  }, [value, format])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (format === "money") {
      const digits = raw.replace(/[^0-9]/g, "")
      const num = digits === "" ? NaN : parseInt(digits, 10)
      setText(digits === "" ? "" : num.toLocaleString("en-US"))
      onValueChange(num)
    } else {
      const cleaned = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
      setText(cleaned)
      const num = cleaned === "" || cleaned === "." ? NaN : parseFloat(cleaned)
      onValueChange(Number.isFinite(num) ? num : NaN)
    }
  }

  return (
    <div className={cn(affixSurface, className)}>
      {prefix != null && (
        <span className="pl-3 pr-1.5 text-muted-foreground select-none">{prefix}</span>
      )}
      <input
        id={id}
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false
          setText(toText(value, format))
        }}
        className={cn(
          "h-full w-full min-w-0 bg-transparent py-1 tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground/45",
          prefix != null ? "px-0" : "pl-3",
          suffix != null ? "pr-1.5" : "pr-3"
        )}
        {...rest}
      />
      {suffix != null && (
        <span className="pr-3 pl-1.5 text-muted-foreground select-none whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  )
}

/** Native select styled to match the input surface. */
export function SelectInput({
  value,
  onValueChange,
  options,
  id,
  className,
}: {
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  id?: string
  className?: string
}) {
  return (
    <div className={cn(affixSurface, "relative", className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-full w-full appearance-none bg-transparent px-3 pr-8 text-sm outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// --- Result panel primitives ------------------------------------------------

/** A single label/value stat, used across all result panels. */
export function Stat({
  label,
  value,
  accent,
  large,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  accent?: boolean
  large?: boolean
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums tracking-[-0.01em]",
          large ? "text-[28px] leading-none" : "text-lg",
          accent ? "text-halo" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}

/** Grey rounded container that groups a result section. */
export function ResultPanel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-xl bg-muted/50 p-5", className)}>{children}</div>
  )
}

/**
 * Placeholder shown in the results area before the user runs the numbers.
 * `preview` is a blurred, non-interactive glimpse of the real result (computed
 * from example values) that sits behind the prompt — a subtle nudge to fill the
 * form in — while reserving the vertical space so nothing jumps on Calculate.
 */
export function EmptyResult({
  cta,
  preview,
}: {
  cta: string
  preview?: React.ReactNode
}) {
  return (
    // No filled surface — a blurred glimpse of the metrics sits directly on the
    // dialog background, fading at the edges, with the prompt centered on top.
    <div className="relative flex h-full min-h-[380px] items-center justify-center overflow-hidden rounded-xl px-6 py-10">
      {/* Live SVG/DOM glimpse (not a raster image). Panel chrome is stripped so
          it reads as a single faint backdrop; chart rows are centered. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden px-6 opacity-40 blur-[1.5px]",
          // Fade the top/bottom edges so the glimpse dissolves instead of
          // hard-cutting through a number.
          "[-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_24%,#000_76%,transparent)]",
          "[mask-image:linear-gradient(to_bottom,transparent,#000_24%,#000_76%,transparent)]"
        )}
      >
        {/* Overrides live here so `&>div>*` resolves to the result's panels
            (strip their chrome) rather than the result root. */}
        <div
          className={cn(
            "w-full max-w-[420px]",
            "[&>div>*]:!border-0 [&>div>*]:!bg-transparent [&>div>*]:!p-0",
            "[&_[class~='sm:flex-row']]:!flex-col [&_[class~='sm:flex-row']]:!items-center"
          )}
        >
          {preview}
        </div>
      </div>

      {/* Soft scrim (page background) so the centered prompt stays legible. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_center,var(--color-background)_0%,var(--color-background)_36%,transparent_76%)]" />

      {/* Prompt — centered horizontally and vertically. */}
      <div className="relative flex max-w-[300px] flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border">
          <RiBarChart2Line className="size-5" />
        </span>
        <p className="mt-4 text-sm font-medium text-foreground">Your results will appear here</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Fill in your details, then press{" "}
          <span className="font-medium text-foreground">{cta}</span> to see the breakdown.
        </p>
      </div>
    </div>
  )
}
