# 006 — Make reversible overlays interruptible

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 5 files, about 90 lines

## Problem

Dialog, Sheet, Dropdown, Popover, and Tooltip use state-triggered `animate-in` and `animate-out` keyframes. Keyframes restart when users reverse state mid-flight.

```tsx
// src/components/ui/popover.tsx:34 — current
"data-[state=open]:animate-in data-[state=closed]:animate-out ..."
```

## Target

Use CSS transitions so opacity and transform retarget from the current computed state. Anchored surfaces use 150ms and `var(--ease-out)`; dialogs use 200ms; sheets retain plan 005's 280/220ms drawer timing. Preserve each Radix transform-origin variable.

For portalled Radix content that would otherwise unmount before a close transition, keep it mounted with the primitive's `forceMount` support, use `visibility: hidden` and `pointer-events: none` in the closed state, and delay `visibility` until the close transition completes. Open state must be visible and interactive immediately. Verify hidden content is absent from the accessibility tree.

## Repo conventions to follow

- Keep `data-slot` and Radix `data-state` as styling hooks.
- Use the exact tokens from plan 013: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
- Preserve trigger-relative origins already present in Dropdown, Popover, and Tooltip.

## Steps

1. In Dialog and Sheet wrappers, add narrowly scoped `forceMount` plumbing to Portal, Overlay, and Content. Do not expose it to call sites unless necessary.
2. Replace entry/exit keyframe utilities with closed/open opacity and transform states plus CSS transitions. Closed dialogs scale to `0.95`; anchored surfaces scale to `0.95` and keep their existing side offset; sheets retain full directional translation.
3. Add closed-state `pointer-events-none invisible` and open-state `pointer-events-auto visible`; delay the visibility change until the close transition completes.
4. Apply the same persistent-state pattern to Dropdown, Popover, and Tooltip only if Radix Presence unmounts before transition completion. Do not invent timers.
5. Spam each trigger while it is mid-transition and confirm computed transform/opacity reverse from the current value.
6. Reapply plan 003's opacity-only reduced-motion path after this conversion.

## Boundaries

- Do NOT replace Radix primitives or focus management.
- Do NOT use JS timers or animation event bookkeeping.
- Do NOT change geometry, z-index, collision handling, or transform origins.
- If `forceMount` leaves closed content exposed to assistive technology despite `visibility: hidden`, STOP and report rather than shipping an accessibility regression.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: at 10% playback, open and immediately close each surface, then reverse again. No surface may jump back to its initial keyframe. Inspect the accessibility tree and confirm closed overlays are absent.
- **Done when**: all five primitive families reverse smoothly from their current state without timers or accessibility leakage.

