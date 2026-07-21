# 013 — Establish a shared motion token system

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: LOW
- **Category**: Cohesion and tokens
- **Estimated scope**: 1 file plus consumers, about 25 lines

## Problem

The root token block contains color, radius, and typography but no motion scale. Curves and durations are hand-typed in `src/index.css:274-311` and utility classes throughout components.

## Target

Add these exact tokens under `:root`:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--duration-press: 140ms;
--duration-fast: 160ms;
--duration-ui: 200ms;
--duration-emphasis: 240ms;
```

Expose matching Tailwind theme values in `@theme inline` using unambiguous names such as `--ease-halo-out` and `--duration-halo-ui` if Tailwind requires them. CSS consumers may use the root variables directly.

## Repo conventions to follow

- Design tokens live in `src/index.css:11-151`.
- Preserve the product's crisp financial-dashboard personality; do not introduce bounce tokens.

## Steps

1. Add the exact root tokens above, grouped under a `/* Motion */` comment.
2. Expose Tailwind aliases only where they compile cleanly under Tailwind 4.
3. Replace repeated `cubic-bezier(0.22, 1, 0.36, 1)` values in product-owned CSS with `var(--ease-out)` as their consuming plans are executed.
4. Migrate selected plans' hard-coded durations to the closest named token only when the exact target matches; keep 280ms drawer open and 220ms close explicit.
5. Do not override Tailwind's global built-in `ease-out` name.

## Boundaries

- Do NOT alter colors, radii, typography, or third-party package CSS.
- Do NOT create spring or bounce tokens.
- Do NOT change behavior merely to maximize token use.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json` and `npx vite build`; expect success. Inspect compiled styles and confirm token references resolve.
- **Feel check**: compare Dialog, Sheet, Button, Halo glow, and calculator disclosure after dependent plans. They should share a decisive initial response without identical durations everywhere.
- **Done when**: exact curves and core durations have one source of truth.

