# 015 — Animate connect-account steps

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 65 lines

## Problem

```tsx
// src/components/connect-account-dialog.tsx:44-67 — current
{mode === "choose" && <ChooseStep onSelect={setMode} />}
{mode === "plaid" && <PlaidStep onBack={() => setMode("choose")} ... />}
{mode === "manual" && <ManualStep onBack={() => setMode("choose")} ... />}
```

Forward and back actions replace mutually exclusive dialog trees immediately, even though the steps form a spatial sequence.

## Target

Forward navigation enters from `translateX(16px)` while the outgoing step exits to `-16px`; Back reverses those directions. Use opacity and transform over 200ms with `var(--ease-in-out)`. Animate the dialog body's height only if it can be done without per-frame layout; otherwise let height snap and keep content motion. Reduced motion uses an opacity-only 160ms crossfade.

## Repo conventions to follow

- Preserve the existing `Mode` state and Radix Dialog shell.
- Use plan 013's `--ease-in-out` token.

## Steps

1. Replace direct `setMode` calls with a `navigateMode(next, direction)` helper that records forward/back direction and outgoing mode.
2. Render outgoing and incoming steps in an overflow-hidden relative stage, with both layers present only during transition.
3. Transition transform and opacity for exactly 200ms; clean up outgoing content on `transitionend`.
4. Prevent outgoing form controls from receiving focus or pointer events and mark the outgoing layer `aria-hidden="true"`.
5. Autofocus the intended field only after the incoming layer becomes current; do not steal focus mid-transition.
6. Under reduced motion, set X offsets to zero and crossfade over 160ms.

## Boundaries

- Do NOT change field taxonomy, validation, Plaid copy, submission, or Dialog open/close motion.
- Do NOT add timers or dependencies.
- Do NOT leave duplicate field IDs active during overlap; outgoing content must be inert.

## Verification

- **Mechanical**: run the typecheck and inspect for duplicate IDs during the transition.
- **Feel check**: move Choose → Manual → Back and Choose → Plaid → Back at 10% playback. Confirm direction reverses, focus lands correctly, rapid Back does not restart from zero, and reduced motion only fades.
- **Done when**: the dialog communicates step direction without accessibility or focus regressions.

