# 017 — Celebrate a newly completed goal

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 45 lines

## Problem

```tsx
// src/routes/goals.tsx:101-118 — current
setGoals((prev) => existing
  ? prev.map((g) => (g.id === existing.id ? clean : g))
  : [...prev, clean])
toast.success(existing ? `${clean.name} updated` : `${clean.name} added`, ...)
```

Crossing from below 100% to fully funded receives the same toast and static “Fully funded 🎉” text as any edit. This rare financial milestone has no distinct feedback.

## Target

Only when an existing or new goal crosses from below 100% to at least 100%, animate its card from `scale(0.98)` and opacity `0.92` to its final state over 480ms with `var(--ease-out)`. A non-layout pseudo-element halo ring expands from `scale(0.96)` to `1.04` and fades over 600ms. Reduced motion uses a 200ms opacity-only highlight. The effect runs once per crossing, not on every render of an already complete goal.

## Repo conventions to follow

- Completion is derived with the existing `goalPct` helper.
- Use plan 013's `--ease-out` token and existing `--halo`/`--halo-border` colors.
- Keep the success toast; the card effect supplements it.

## Steps

1. In `saveGoal`, compare the previous goal percentage with `clean`; set `justCompletedId` only for a crossing from `< 100` to `>= 100`. Treat a new goal saved at 100% as a crossing.
2. Pass `justCompleted` to `GoalCard` and add a positioned class hook without changing card layout.
3. Define card and `::after` ring keyframes in `src/index.css`, animating only transform and opacity. Never use `scale(0)`.
4. Clear `justCompletedId` on `animationend`, not a timeout, and guard against bubbling from child animations.
5. Add a reduced-motion rule that removes scale/ring movement but retains a 200ms opacity/color highlight.
6. Confirm editing an already complete goal does not replay the celebration unless it first drops below 100% and later crosses again.

## Boundaries

- Do NOT add confetti, sound, haptics, dependencies, or blocking delays.
- Do NOT change goal calculations, persistence, sorting, copy, or toast duration.
- Do NOT animate box-shadow or layout properties.

## Verification

- **Mechanical**: run the typecheck.
- **Feel check**: test 99%→100%, 100%→110%, 80%→90%, a new 100% goal, and 100%→90%→100%. Confirm only genuine crossings animate once. At 10% playback, the ring must not affect layout. Reduced motion should show no scale.
- **Done when**: goal completion receives restrained one-time delight with correct threshold logic.

