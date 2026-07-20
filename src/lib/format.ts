export function formatUSD(v: number, opts?: { sign?: boolean; cents?: boolean }) {
  const abs = Math.abs(v)
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  })
  const sign = opts?.sign ? (v >= 0 ? "+" : "−") : v < 0 ? "−" : ""
  return `${sign}$${body}`
}

/** Compact axis label, e.g. $649K. */
export function formatCompactUSD(v: number) {
  return "$" + Math.round(v / 1000) + "K"
}

/** Parse an ISO `YYYY-MM-DD` string to a local Date (no timezone shift). */
export function parseISODate(iso: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return undefined
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Serialize a Date to an ISO `YYYY-MM-DD` string in local time. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Format an ISO date as `mm/dd/yyyy` for an editable input ("" if unset/invalid). */
export function isoToMDY(iso: string): string {
  const date = parseISODate(iso)
  if (!date) return ""
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${mm}/${dd}/${date.getFullYear()}`
}

/** Parse a `mm/dd/yyyy` string to ISO, validating it's a real calendar date. */
export function mdyToISO(text: string): string | undefined {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!m) return undefined
  const month = Number(m[1])
  const day = Number(m[2])
  const year = Number(m[3])
  const date = new Date(year, month - 1, day)
  // Reject overflow (e.g. 02/31 rolling into March).
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
  return toISODate(date)
}

/** Human-readable goal target date, e.g. "Jun 1, 2028". Falls back to the raw
 *  string for any value that isn't ISO (older freeform entries). */
export function formatGoalDate(value: string): string {
  const date = parseISODate(value)
  if (!date) return value
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
