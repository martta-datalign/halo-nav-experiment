# 014 — Animate opportunity navigation directionally

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 80 lines

## Problem

```tsx
// src/components/home/opportunities-card.tsx:66-87 — current
const goTo = (index: number) => {
  if (opportunities.length === 0) return
  setCurrent((index + opportunities.length) % opportunities.length)
}
// touch end uses a 40px distance threshold, then swaps current immediately
```

Arrow, dot, and swipe navigation replace the full 410px offer with no continuity. The swipe gesture supplies direction but the content teleports.

## Target

Previous content exits 24px toward the navigation direction while fading; next content enters from the opposite 24px offset. Both phases use transform and opacity for 240ms with `var(--ease-in-out)`. Interruption starts from the current computed visual state. Reduced motion uses a 160ms opacity-only crossfade. Swipe dismissal considers velocity: dismiss when distance exceeds 40px or `Math.abs(distance) / elapsedMs > 0.11`.

## Repo conventions to follow

- Keep local interaction state in `OpportunitiesCard`.
- Use plan 013's `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`.
- Preserve the fixed card height, data, buttons, dots, and toast behavior.

## Steps

1. Track touch start time as well as X; calculate distance and velocity on end using the exact `0.11` threshold.
2. Track navigation direction (`-1 | 1`) and an outgoing opportunity snapshot so old and new content can overlap in the same fixed-height viewport during a transition.
3. Render outgoing and incoming offer bodies as absolute layers inside the current 410px region; keep navigation controls outside the animated layer.
4. Apply transform/opacity transitions for 240ms and remove the outgoing layer on `transitionend`, not a timer.
5. If another navigation arrives mid-transition, read/retain current state and retarget; do not reset both layers to their initial offsets.
6. Add an opacity-only reduced-motion branch and ensure all controls remain usable while layers animate.

## Boundaries

- Do NOT add a carousel dependency.
- Do NOT animate height, width, left, or right.
- Do NOT change opportunity ordering, dismissal, copy, images, or CTA behavior.

## Verification

- **Mechanical**: run the typecheck.
- **Feel check**: use arrows, dots, slow swipes, and short fast flicks on a real touch device. Confirm direction is correct, velocity flicks work, and rapid reversals do not jump. At 10% playback, layers must not double-expose after completion. Reduced motion must only crossfade.
- **Done when**: every navigation method communicates direction with interruptible transform/opacity motion.

