# 012 — Add tactile button press feedback

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Physicality
- **Estimated scope**: 1 file, about 4 lines

## Problem

```tsx
// src/components/ui/button.tsx:7-8 — current
const buttonVariants = cva(
  "... transition-all outline-none ...",
```

The shared Button has hover and focus feedback but no physical press response.

## Target

All enabled, non-link buttons use `active:scale-[0.97]` with `transform 140ms var(--ease-out)`. Disabled buttons do not scale. Reduced-motion users receive color feedback with no scale.

## Repo conventions to follow

- Put shared behavior in the CVA base string, not at individual call sites.
- Use plan 013's `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- Coordinate the explicit transition list with plan 004.

## Steps

1. Add `enabled:active:scale-[0.97]`, `duration-150`, and `[transition-timing-function:var(--ease-out)]` to the Button base.
2. Ensure the explicit transition list includes transform.
3. Add `motion-reduce:active:scale-100`.
4. Exempt the `link` variant if scaling inline text creates visible reflow or baseline movement.

## Boundaries

- Do NOT use a scale below `0.95`.
- Do NOT change Button sizes, colors, focus rings, or disabled behavior.

## Verification

- **Mechanical**: run the typecheck.
- **Feel check**: press primary, outline, destructive, ghost, and icon buttons with mouse, keyboard, and touch. Pointer/touch presses should compress subtly and recover from the current state; keyboard activation should not leave a transform stuck. Reduced motion must not scale.
- **Done when**: shared buttons provide subtle, consistent tactile feedback.

