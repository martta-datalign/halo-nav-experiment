# 004 — Replace broad transitions with explicit properties

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 8 files, about 25 lines

## Problem

Foundational controls opt every changing property into animation.

```tsx
// src/components/ui/button.tsx:8 — current
"... transition-all outline-none ..."

// src/components/ui/tabs.tsx:65 — current
"... transition-all ..."

// src/components/ui/switch.tsx:20 — current
"... transition-all ..."
```

The same pattern appears in `src/routes/calculators.tsx:96`, `src/routes/goals.tsx:251`, `src/components/ask/vault.tsx:126`, `src/components/home/opportunities-card.tsx:160`, and `src/components/ui/sidebar.tsx:296`.

## Target

Every occurrence names only the properties intentionally animated. Use Tailwind arbitrary transition lists, for example `transition-[color,background-color,border-color,box-shadow,opacity,transform]`, and omit layout properties unless another selected plan explicitly replaces them.

## Repo conventions to follow

- Explicit lists already exist in `src/components/ui/input.tsx:11` as `transition-[color,box-shadow]`.
- Color-only controls use `transition-colors` throughout the repo.

## Steps

1. Replace the Button base with explicit color, border-color, background-color, box-shadow, opacity, and transform transitions.
2. Replace Tabs with only color, background-color, border-color, box-shadow, and opacity.
3. Replace Switch root with background-color, border-color, and box-shadow; retain `transition-transform` on the thumb.
4. Replace card `transition-all` with transform, border-color, background-color, and box-shadow only; plan 010 may later remove transform.
5. Replace Vault delete action with opacity, color, and background-color.
6. Defer opportunity indicator width removal to plan 008 and sidebar collapse cleanup to plan 002; do not preserve `transition-all` as a temporary workaround.

## Boundaries

- Do NOT change durations or visual states in this plan.
- Do NOT add layout properties to explicit transition lists.
- Do NOT add dependencies.

## Verification

- **Mechanical**: run `rg -n 'transition-all' src`; expect no application-owned occurrences. Run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: hover, focus, press, and disable each Button variant, a tab, switch, goal card, calculator card, and Vault delete action. Confirm intended feedback remains without unrelated interpolation.
- **Done when**: `transition-all` is absent and each transition documents its property scope.

