# 016 — Animate dashboard card customization

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 45 lines

## Problem

```tsx
// src/routes/home.tsx:78-79 — current
const toggle = (key: CardKey) =>
  setVisible((v) => ({ ...v, [key]: !v[key] }))
```

Toggling customization immediately removes or inserts a card, causing several downstream grid cards to jump.

## Target

Use the View Transitions API when available to animate card reflow for 240ms with `var(--ease-in-out)`, with a fully functional immediate fallback. Assign stable `view-transition-name` values per card. Removed/inserted cards fade and scale between `0.97` and `1`; moved cards interpolate position through the browser snapshot. Reduced motion disables the view-transition animation.

## Repo conventions to follow

- Keep visibility state and conditional rendering in `src/routes/home.tsx`.
- Use feature detection: `if (document.startViewTransition) ... else ...`.
- Use `flushSync` from `react-dom` only inside the transition update so React commits within the snapshot boundary.

## Steps

1. Add a typed feature-detection helper for `document.startViewTransition`; do not change global TypeScript settings if a local interface suffices.
2. Wrap the visibility state update in `startViewTransition(() => flushSync(...))`, with the current immediate update as fallback.
3. Assign stable, unique transition names to each customizable card wrapper; never reuse one name for two mounted elements.
4. Add global `::view-transition-old(...)` and `::view-transition-new(...)` rules using 240ms transform/opacity motion and `var(--ease-in-out)`.
5. Under `prefers-reduced-motion: reduce`, set view-transition animation duration to `0.001ms`.
6. Ensure rapid checkbox changes either join the active transition safely or fall back to an immediate update without throwing.

## Boundaries

- Do NOT add a layout-animation dependency.
- Do NOT change grid breakpoints, card ordering, customization options, or persisted state.
- Do NOT animate `top`, `left`, width, or height manually.

## Verification

- **Mechanical**: run the typecheck and build. Test once with `startViewTransition` temporarily unavailable to verify the fallback.
- **Feel check**: toggle every card individually and several rapidly at desktop and mobile widths. Cards should reflow coherently without double images. Reduced motion and unsupported browsers must update instantly.
- **Done when**: supported browsers explain the reflow and all fallbacks remain correct.

