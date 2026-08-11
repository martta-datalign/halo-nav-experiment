/**
 * Tenant theming (white-label).
 *
 * The app ships with a neutral graphite default baked into src/index.css. At
 * runtime we let a firm ("tenant") override ONLY the brand layer — the accent
 * color and the typeface — by injecting a <style id="tenant-theme"> block that
 * redefines the brand tokens for both light (:root) and dark (.dark) themes.
 *
 * Everything else (neutrals, spacing, radius, motion, status colors, charts)
 * is locked chassis and is never touched here. See the header comment in
 * src/index.css for the full brand-vs-chassis split.
 *
 * Design goals:
 *   - "One-click" for the firm: they pick ONE accent color and ONE font.
 *   - Robust: we derive the -subtle / -border / -foreground variants and the
 *     dark-mode variants from the single accent, so a firm can't produce an
 *     inconsistent or illegible accent family.
 *   - Structured for the future: fonts are modeled as a registry so adding a
 *     new selectable font later is a one-line change, not a refactor.
 */

/** An accent expressed in OKLCH — matches how index.css defines every color. */
export interface Oklch {
  /** Lightness 0–1 */
  l: number
  /** Chroma (roughly 0–0.37); 0 = gray */
  c: number
  /** Hue 0–360 */
  h: number
}

/** Keys of FONT_REGISTRY. Kept as a plain string so the config stays simple. */
export type FontId = keyof typeof FONT_REGISTRY

/** The values a firm is allowed to override. Nothing else is exposed. */
export interface TenantTheme {
  /** Human-readable firm name (not applied to the UI yet — reserved). */
  name?: string
  /** Brand accent color for the "Halo"/AI affordances. Omit to keep the
   *  neutral graphite default baked into index.css. */
  accent?: Oklch
  /** Selected typeface. Must be a key of FONT_REGISTRY. Defaults to the built-in. */
  font?: FontId
}

/**
 * Registry of selectable typefaces.
 *
 * TODAY: only the bundled default is registered — font *loading* is not wired
 * up yet (by design). The injection path below already reads `theme.font` and
 * resolves it through this map, so the plumbing is complete end-to-end.
 *
 * TO ADD A FONT LATER:
 *   1. Install it (e.g. `npm i @fontsource-variable/inter`).
 *   2. Import it in src/main.tsx so it's loaded:  import "@fontsource-variable/inter"
 *   3. Add an entry here, e.g.  inter: { family: '"Inter Variable"' }
 * That's it — it becomes a valid `font` value with no other changes.
 */
export const FONT_REGISTRY = {
  // Default — SF Pro via the Apple system stack (no web-font files needed).
  "sf-pro": {
    family:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Pro"',
  },
  // Bundled fallback / alternative (loaded in main.tsx).
  "instrument-sans": { family: '"Instrument Sans Variable"' },
} as const

const DEFAULT_FONT: FontId = "sf-pro"

const STYLE_EL_ID = "tenant-theme"

function oklch({ l, c, h }: Oklch): string {
  // Round to keep the emitted CSS tidy and deterministic.
  const r = (n: number, p: number) => Number(n.toFixed(p))
  return `oklch(${r(l, 4)} ${r(c, 4)} ${r(h, 2)})`
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * Derive the full four-variable --halo family (for one theme) from a single
 * accent. `mode` shapes the derivation so the accent reads correctly on a light
 * vs. a dark chassis.
 */
function haloFamily(accent: Oklch, mode: "light" | "dark") {
  if (mode === "light") {
    const base: Oklch = { l: clamp(accent.l, 0.32, 0.68), c: accent.c, h: accent.h }
    return {
      halo: base,
      // White text on the accent unless the accent is very light, then go dark.
      foreground: base.l > 0.72 ? { l: 0.22, c: 0, h: 0 } : { l: 1, c: 0, h: 0 },
      // Faint wash for backgrounds, and a slightly stronger hairline.
      subtle: { l: 0.96, c: clamp(accent.c * 0.12, 0, 0.03), h: accent.h },
      border: { l: 0.88, c: clamp(accent.c * 0.22, 0, 0.06), h: accent.h },
    }
  }
  // Dark: lift lightness so the accent stays vivid against a dark surface.
  const base: Oklch = { l: clamp(accent.l + 0.16, 0.6, 0.82), c: accent.c, h: accent.h }
  return {
    halo: base,
    foreground: { l: 0.18, c: 0, h: 0 },
    subtle: { l: 0.27, c: clamp(accent.c * 0.22, 0, 0.05), h: accent.h },
    border: { l: 0.4, c: clamp(accent.c * 0.3, 0, 0.08), h: accent.h },
  }
}

function haloVars(accent: Oklch, mode: "light" | "dark"): string {
  const f = haloFamily(accent, mode)
  return [
    `--halo: ${oklch(f.halo)};`,
    `--halo-foreground: ${oklch(f.foreground)};`,
    `--halo-subtle: ${oklch(f.subtle)};`,
    `--halo-border: ${oklch(f.border)};`,
  ].join(" ")
}

/** Build the full CSS text for the injected <style> block. */
export function buildTenantThemeCss(theme: TenantTheme): string {
  const fontId = theme.font ?? DEFAULT_FONT
  const family = (FONT_REGISTRY[fontId] ?? FONT_REGISTRY[DEFAULT_FONT]).family
  const fontDecl = `--brand-font-family: ${family};`

  // With no accent override, only the font is themed — the graphite --halo
  // family in index.css is left untouched.
  if (!theme.accent) return `:root { ${fontDecl} }`

  // Font is theme-independent; accent is derived per theme. We must emit a
  // .dark rule (not an inline element style) so the dark-mode accent survives.
  return [
    `:root { ${fontDecl} ${haloVars(theme.accent, "light")} }`,
    `.dark { ${haloVars(theme.accent, "dark")} }`,
  ].join("\n")
}

/**
 * Apply a tenant theme by injecting (or replacing) the <style id="tenant-theme">
 * block in <head>. Idempotent — safe to call more than once. Call before the
 * app renders (see src/main.tsx) to avoid a flash of the default theme.
 */
export function applyTenantTheme(theme: TenantTheme): void {
  if (typeof document === "undefined") return
  let el = document.getElementById(STYLE_EL_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = STYLE_EL_ID
    document.head.appendChild(el)
  }
  el.textContent = buildTenantThemeCss(theme)
}
