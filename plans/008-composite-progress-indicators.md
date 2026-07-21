# 008 — Composite progress and carousel indicators

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 2 files, about 35 lines

## Problem

```tsx
// src/routes/goals.tsx:277-281 — current
<div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
  <div className="h-full rounded-full transition-[width]"
    style={{ width: `${pct}%`, background: accent }} />
</div>

// src/components/home/opportunities-card.tsx:160-162 — current
"h-1.5 rounded-full transition-all",
index === current ? "w-5 bg-foreground" : "w-1.5 bg-border ..."
```

The live goal preview transitions layout width as inputs change; carousel dots also tween width.

## Target

Goal bars occupy full track width and animate `transform: scaleX(progress / 100)` from the left over 200ms with `var(--ease-in-out)`. Under reduced motion, set transform immediately. Carousel dots keep a fixed 20px hit/visual track and animate a nested pill using transform, not width.

## Repo conventions to follow

- Dynamic values are already passed with inline styles in `src/routes/goals.tsx`.
- Use plan 013's `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for on-screen morphing.

## Steps

1. Replace both goal progress-bar width styles with full-width elements using `origin-left scale-x-*` semantics and inline `transform: scaleX(${pct / 100})`.
2. Transition only transform for 200ms with `var(--ease-in-out)`.
3. Add `motion-reduce:transition-none` so edits update immediately for reduced-motion users.
4. Give each opportunity dot a fixed width and place a nested pill inside; represent active/inactive states through a transform scale or translation without changing the parent's width.
5. Preserve `aria-current`, labels, click targets, colors, and rounded geometry.

## Boundaries

- Do NOT alter goal calculations, percentages, carousel state, or navigation.
- Do NOT use animated CSS variables on a parent.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `rg -n 'transition-\[width\]|transition-all' src/routes/goals.tsx src/components/home/opportunities-card.tsx` should find neither audited pattern. Run the typecheck.
- **Feel check**: type rapidly in the goal current/target fields while recording the Performance panel. Confirm the bar stays anchored left and no repeated layout is attributed to its animation. Toggle carousel dots and inspect at 10% playback.
- **Done when**: all three indicators animate only transform.

