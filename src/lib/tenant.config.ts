import type { TenantTheme } from "@/lib/theme"

/**
 * Per-firm branding config.
 *
 * In production this is where the backend plugs in: resolve the current firm
 * (by subdomain, auth claim, or a bootstrap fetch) and return its saved theme.
 * The admin "one-click" branding form writes exactly these few values.
 *
 * For now we ship a small local table and select from it. The DEFAULT tenant
 * has no accent override, so the app falls back to the neutral graphite baked
 * into src/index.css.
 */

/** The unbranded default — neutral graphite (defined in index.css). */
export const DEFAULT_TENANT: TenantTheme = {
  name: "Halo",
  // No `accent` override → index.css graphite default is used as-is.
}

/**
 * Example branded firms — illustrate the one-value swap. Delete or replace with
 * real backend-served configs. Each firm sets a single accent (and optionally a
 * font once more are registered in FONT_REGISTRY).
 */
export const EXAMPLE_TENANTS: Record<string, TenantTheme> = {
  // Deep teal — a calm, "trust" green-blue.
  meridian: { name: "Meridian Wealth", accent: { l: 0.5, c: 0.1, h: 195 } },
  // Warm bronze/gold — traditional, premium.
  hartwell: { name: "Hartwell Advisors", accent: { l: 0.62, c: 0.11, h: 75 } },
  // Classic navy — conservative financial brand.
  keystone: { name: "Keystone Capital", accent: { l: 0.45, c: 0.13, h: 260 } },
}

/**
 * Resolve which tenant theme to apply.
 *
 * TODO(backend): replace this stub with real resolution, e.g.
 *   - subdomain:  meridian.app.com → EXAMPLE_TENANTS.meridian
 *   - or fetch:   GET /api/tenant-theme  →  { accent, font }
 * Keep it synchronous (or resolve before render) to avoid a theme flash.
 *
 * Dev override: append `?tenant=meridian` to the URL to preview a firm locally.
 */
export function resolveTenant(): TenantTheme {
  if (typeof window !== "undefined") {
    const key = new URLSearchParams(window.location.search).get("tenant")
    if (key && EXAMPLE_TENANTS[key]) return EXAMPLE_TENANTS[key]
  }
  return DEFAULT_TENANT
}
