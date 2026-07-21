# 011 — Retune calculator result disclosure

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Easing, duration, accessibility
- **Estimated scope**: 1 file, about 25 lines

## Problem

```css
/* src/index.css:306-311 — current */
.calculator-result-disclosure {
  animation: calculator-result-disclosure 480ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}
.calculator-result-disclosure-icon {
  animation: calculator-result-icon-disclosure 380ms cubic-bezier(0.22, 1, 0.36, 1) 260ms both;
}
```

Feedback remains in an entrance sequence for roughly 600–640ms. Reduced motion sets both animations to `none`, eliminating even useful opacity feedback.

## Target

Main result disclosure: opacity-only, 240ms `var(--ease-out)`, no delay. Empty-state icon: opacity plus scale from `0.94` to `1`, 200ms `var(--ease-out)`, 40ms delay. Reduced motion: both use opacity-only 200ms `ease`, with scale fixed at `1`.

## Repo conventions to follow

- Keep existing keyframe names and class hooks unless plan 006 establishes a reusable transition pattern.
- Use plan 013's `--ease-out` token.

## Steps

1. Change main disclosure to 240ms, no delay.
2. Change icon disclosure to 200ms with a 40ms delay; keep initial scale `0.94`, never `0`.
3. Replace reduced-motion `animation: none` with an opacity-only 200ms keyframe or transition and force transform to `scale(1)`.
4. Verify changing from empty to calculated does not double-expose content.

## Boundaries

- Do NOT change calculator calculations, chart animations, component keys, or result markup.
- Do NOT add movement to the main result panel.

## Verification

- **Mechanical**: run the typecheck.
- **Feel check**: press Calculate at 10% playback. Content must begin immediately and finish within 240ms; the icon may trail by only 40ms. With reduced motion, both should fade without scaling.
- **Done when**: action feedback is complete within 240ms and reduced motion retains comprehension.

