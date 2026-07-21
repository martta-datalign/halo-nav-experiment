# 007 — Make the Halo thinking glow responsive and cheap

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: MEDIUM
- **Category**: Feedback and performance
- **Estimated scope**: 1 file, about 35 lines

## Problem

```css
/* src/index.css:198-208 — current */
@keyframes halo-composer-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* src/index.css:272-277 — current */
animation: halo-composer-flow 7s ease-in-out infinite;
transition:
  opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1),
  transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
will-change: background-position, opacity, transform;
```

The state indicator trails the thinking state by nearly a second and repaints an animated blurred gradient every frame.

## Target

Remove continuous `background-position` animation. Use a static gradient glow that transitions only opacity and transform over 240ms with `var(--ease-out)`. Remove permanent `will-change`; if profiling shows promotion is needed, use `will-change: opacity, transform` only while `.is-thinking` is present.

```css
.halo-composer-gradient {
  transition: opacity 240ms var(--ease-out), transform 240ms var(--ease-out);
}
```

## Repo conventions to follow

- Use plan 013's `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- The existing thinking dots remain the active/continuous status signal.

## Steps

1. Delete `@keyframes halo-composer-flow` and all animation/play-state declarations tied to it.
2. Change opacity and transform transitions to 240ms `var(--ease-out)`.
3. Remove `background-position` from `will-change`; prefer no `will-change` unless profiling demonstrates a need.
4. Keep the static gradient, blur, target opacity, and target scale unchanged.
5. Under reduced motion, retain a 200ms opacity-only transition and set transform directly to its final value.

## Boundaries

- Do NOT change Ask Halo response timing, streaming, colors, composer geometry, or thinking dots.
- Do NOT introduce canvas, rAF, or a motion dependency.

## Verification

- **Mechanical**: run `rg -n 'halo-composer-flow|background-position.*will-change' src/index.css`; expect no matches. Run `npx tsc --noEmit -p tsconfig.app.json`.
- **Feel check**: submit a prompt and confirm the glow registers immediately without an ambient moving texture. Record a Performance trace and confirm the waiting state does not continuously repaint the composer gradient.
- **Done when**: the glow settles within 240ms and only transform/opacity animate.

