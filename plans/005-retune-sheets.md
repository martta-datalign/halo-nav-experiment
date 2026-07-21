# 005 — Retune sheet entrances and exits

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 2 files, about 12 lines

## Problem

```tsx
// src/components/ui/sheet.tsx:61 — current
"... transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500"
```

The mobile app sidebar and Ask Halo history drawer inherit a slow 500ms entrance and generic `ease-in-out`.

## Target

Use the repo token created by plan 013:

```css
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Sheet content enters in 280ms and exits in 220ms using `var(--ease-drawer)`. The overlay uses the same durations with opacity only.

## Repo conventions to follow

- State remains expressed by Radix `data-[state=open|closed]` selectors.
- Shared motion tokens belong in `src/index.css` under `:root` and `@theme inline` as specified by plan 013.

## Steps

1. Replace `ease-in-out`, `duration-500`, and `duration-300` in `src/components/ui/sheet.tsx` with 280ms open, 220ms close, and `[animation-timing-function:var(--ease-drawer)]`.
2. Apply matching open/close timing to `SheetOverlay` so overlay and panel finish together.
3. Verify all four sheet sides retain their existing directional transforms.
4. Keep plan 003's reduced-motion behavior authoritative.

## Boundaries

- Do NOT change sheet size, placement, markup, focus trapping, or close behavior.
- Do NOT retune Dialog in this plan.
- Do NOT add dependencies.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: open and close the main mobile sidebar and Ask chat history at normal speed and 10% playback. Confirm movement starts immediately, overlay and panel finish together, and reduced motion is opacity-only.
- **Done when**: sheets feel responsive and use the exact drawer curve.

