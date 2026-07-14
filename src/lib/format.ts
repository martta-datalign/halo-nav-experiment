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
