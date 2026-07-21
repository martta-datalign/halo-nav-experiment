# 010 — Gate and restrain hover motion

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Accessibility and cohesion
- **Estimated scope**: 5 files, about 25 lines

## Problem

```tsx
// src/components/ask-halo-action.tsx:31 — current
<RiSparkling2Line className="... duration-300 ease-out group-hover/ask:rotate-180" />

// src/routes/calculators.tsx:96-98 — current
"... transition-all",
"hover:-translate-y-0.5 hover:border-halo-border ..."
```

Goal cards, calculator cards, Ask Halo sparkles, and arrow nudges apply movement on any hover-capable state. Touch browsers can synthesize sticky hover, and the 180° sparkle contradicts the component's “tilts slightly” comment.

## Target

Motion-only hover rules apply through Tailwind's fine-pointer arbitrary media variant `[@media(hover:hover)_and_(pointer:fine)]:...`. Remove card lift entirely because these frequently scanned cards do not need decorative movement. Change the sparkle to `rotate-12` over 160ms `var(--ease-out)`. Keep arrow nudges to `translate-x-0.5` over 160ms, gated to fine pointers.

## Repo conventions to follow

- Keep color-only hover feedback on all pointer types.
- Use plan 013's strong ease-out token.

## Steps

1. Remove `hover:-translate-y-0.5` from goal and calculator cards; preserve border/background/shadow feedback with explicit properties from plan 004.
2. Change the Ask Halo sparkle from 180°/300ms to 12°/160ms and gate it to fine pointers.
3. Gate connect-account and home-goal arrow translations to fine pointers; retain their color feedback.
4. Add `motion-reduce:transform-none` as a defensive override wherever hover transforms remain.

## Boundaries

- Do NOT remove hover color, border, or shadow feedback.
- Do NOT change click targets, navigation, or component text.
- Do NOT add dependencies.

## Verification

- **Mechanical**: search for `group-hover.*translate`, `group-hover.*rotate`, and `hover:-translate` and confirm every remaining movement is fine-pointer gated. Run the typecheck.
- **Feel check**: test mouse, touch emulation, and reduced motion. Mouse arrows and sparkle should move subtly; cards should stay planted; touch and reduced motion should show no movement.
- **Done when**: no ungated hover transform remains in the audited surfaces.

