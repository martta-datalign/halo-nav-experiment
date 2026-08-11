# White-label branding

This product is built to be re-branded per advisor firm ("tenant"). A firm
overrides **only two things** — an accent color and a typeface. Everything else
(layout, neutrals, spacing, motion, status colors, charts) is fixed so every
firm's instance stays consistent and professional.

## What a firm can set

| Field    | Type                         | Required | Notes                                                        |
| -------- | ---------------------------- | -------- | ------------------------------------------------------------ |
| `name`   | string                       | no       | Firm name (reserved — not shown in the UI yet).              |
| `accent` | `{ l, c, h }` (OKLCH)        | no       | The one brand color. Omit → neutral graphite default.        |
| `font`   | font id (see FONT_REGISTRY)  | no       | Typeface. Only `instrument-sans` is available today.         |

That's the entire surface area of the "one-click" branding form.

### The accent color (`accent`)

Given as OKLCH — `l` lightness (0–1), `c` chroma (0 = gray, ~0.15 = vivid),
`h` hue (0–360). We derive the rest of the accent family (hover washes,
borders, foreground text, and the dark-mode variants) automatically, so a firm
can't produce an illegible or inconsistent result. Pick a mid-lightness,
moderate-chroma value, e.g.:

```ts
accent: { l: 0.5, c: 0.1, h: 195 }   // deep teal
accent: { l: 0.45, c: 0.13, h: 260 } // navy
accent: { l: 0.62, c: 0.11, h: 75 }  // bronze/gold
```

An accent only recolors the "Halo"/AI affordances (Ask Halo field, insight
badges). Primary buttons stay near-black by design.

### The font (`font`)

Currently the only registered value is `instrument-sans` (the default).
Font **selection** is fully wired; additional fonts just need to be registered.
To add one — see `FONT_REGISTRY` in [`src/lib/theme.ts`](src/lib/theme.ts):

1. `npm i @fontsource-variable/<font>`
2. `import "@fontsource-variable/<font>"` in [`src/main.tsx`](src/main.tsx)
3. Add an entry to `FONT_REGISTRY`, e.g. `inter: { family: '"Inter Variable"' }`

## How it works

- Defaults live as CSS variables in [`src/index.css`](src/index.css), split into
  a **BRAND** layer (the `--halo` accent family + `--brand-font-family`) and a
  locked **CHASSIS** layer (everything else).
- At startup, [`src/main.tsx`](src/main.tsx) calls `applyTenantTheme()`
  ([`src/lib/theme.ts`](src/lib/theme.ts)), which injects a
  `<style id="tenant-theme">` block redefining the brand variables for both
  light (`:root`) and dark (`.dark`) themes.
- No component code references brand colors directly — they all read the tokens,
  so a swap needs no component changes.

## Backend integration (TODO)

Resolution is currently stubbed in
[`src/lib/tenant.config.ts`](src/lib/tenant.config.ts) → `resolveTenant()`.
Replace it with real per-firm resolution:

- **Subdomain**: `meridian.app.com` → that firm's saved theme, or
- **Fetch**: `GET /api/tenant-theme` → `{ accent, font }`.

Resolve before first render (keep it synchronous or block render) to avoid a
flash of the default theme.

**Local preview:** append `?tenant=meridian` (or `hartwell`, `keystone`) to the
URL to preview the example firms defined in `tenant.config.ts`.
