# 003 — Honor reduced motion across overlays

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file, about 35 lines

## Problem

The reduced-motion block only handles Halo and calculator selectors, while shared overlays still zoom and slide.

```css
/* src/index.css:344 — current */
@media (prefers-reduced-motion: reduce) {
  .calculator-result-disclosure,
  .calculator-result-disclosure-icon { animation: none; }
  /* Halo selectors only */
}
```

Affected slots are `dialog-overlay`, `dialog-content`, `sheet-overlay`, `sheet-content`, `dropdown-menu-content`, `dropdown-menu-sub-content`, `popover-content`, and `tooltip-content`.

## Target

Reduced-motion users retain a short opacity cue but receive no zoom, translation, or rotation. Use 200ms `ease` for opacity-only feedback.

```css
@media (prefers-reduced-motion: reduce) {
  [data-slot="dialog-content"],
  [data-slot="sheet-content"],
  [data-slot="dropdown-menu-content"],
  [data-slot="dropdown-menu-sub-content"],
  [data-slot="popover-content"],
  [data-slot="tooltip-content"] {
    --tw-enter-scale: 1;
    --tw-exit-scale: 1;
    --tw-enter-translate-x: 0;
    --tw-enter-translate-y: 0;
    --tw-exit-translate-x: 0;
    --tw-exit-translate-y: 0;
    animation-duration: 200ms;
    animation-timing-function: ease;
  }
}
```

## Repo conventions to follow

- Global media-query handling already lives in `src/index.css:344-364`.
- `tw-animate-css` exposes the custom properties shown above; neutralize movement without disabling opacity.

## Steps

1. Extend the existing reduced-motion media query with all affected `data-slot` selectors.
2. Neutralize enter/exit scale, translation, and rotation variables while leaving opacity variables intact.
3. Set opacity animation to 200ms `ease`.
4. Add `src/routes/ask.tsx:765` a `motion-reduce:slide-in-from-top-0` override so its dislike-reason disclosure also becomes opacity-only.
5. If plan 006 has already replaced keyframes with transitions, apply the same target through `transform: none` and `transition: opacity 200ms ease` instead.

## Boundaries

- Do NOT set `animation: none` globally.
- Do NOT remove color, opacity, focus, or state feedback.
- Do NOT alter overlay geometry or transform origins.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: emulate `prefers-reduced-motion: reduce`, then open a dialog, sheet, dropdown, popover, tooltip, and Ask Halo dislike reasons. Confirm each only fades and never moves or scales.
- **Done when**: every shared overlay has an opacity-only reduced-motion path.

