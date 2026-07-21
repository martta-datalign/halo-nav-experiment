# 009 — Respect reduced motion in composition charts

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, about 5 lines

## Problem

```tsx
// src/components/home/assets-liabilities.tsx:400-406 — current
<ResponsiveContainer ...>
  <PieChart>
    <Pie data={data} dataKey="value" innerRadius={70} outerRadius={98} ...>
```

Recharts Pie defaults `isAnimationActive` to `"auto"`, and this component does not read the existing motion preference.

## Target

Both assets and liabilities composition charts pass `isAnimationActive={!reducedMotion}`.

## Repo conventions to follow

- Import and call `useReducedMotion` exactly as in `src/components/calculators/mortgage.tsx:4,123`.
- Do not change the chart's normal animation values in this plan.

## Steps

1. Import `useReducedMotion` from `@/hooks/use-reduced-motion`.
2. Call it once inside `CompositionCard`.
3. Pass `isAnimationActive={!reducedMotion}` to `<Pie>`.

## Boundaries

- Do NOT change data, geometry, colors, tooltip behavior, or chart duration.
- Do NOT duplicate the media-query hook.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: load Assets & liabilities normally and confirm the chart still enters. Reload with reduced motion enabled and confirm slices render at final geometry on the first frame.
- **Done when**: Recharts receives an explicit Boolean preference.

