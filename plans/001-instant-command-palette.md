# 001 — Make the command palette instant

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 2 files, about 15 lines

## Problem

The global Cmd/Ctrl+K launcher is keyboard-initiated but inherits the shared dialog's 200ms fade-and-zoom animation.

```tsx
// src/components/ask-halo.tsx:60 — current
// Global ⌘K / Ctrl+K.
if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
  e.preventDefault()
  setOpen((v) => !v)
}

// src/components/ui/dialog.tsx:64 — current
"... duration-200 ... data-[state=closed]:animate-out ... data-[state=open]:animate-in ..."
```

## Target

Cmd/Ctrl+K opens and closes without content or overlay animation. Other dialogs keep their normal motion.

## Repo conventions to follow

- Variants are passed through `className` and merged by `cn`, as in `src/components/ui/command.tsx:49-52`.
- Do not change the global shortcut or focus behavior.

## Steps

1. Add an `instant?: boolean` prop to `CommandDialog` in `src/components/ui/command.tsx`, defaulting to `false`.
2. When `instant` is true, pass `motion-reduce:animate-none`-equivalent unconditional overrides to both the dialog content and overlay. Add an `overlayClassName` escape hatch to `DialogContent` if necessary; do not change defaults for ordinary dialogs.
3. Set `instant` on the `CommandDialog` in `src/components/ask-halo.tsx`.
4. Ensure the instant classes neutralize both open and closed keyframes, not only their duration.

## Boundaries

- Do NOT change Cmd/Ctrl+K behavior, command filtering, navigation, or focus management.
- Do NOT remove animation from ordinary dialogs.
- Do NOT add dependencies.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0.
- **Feel check**: press Cmd/Ctrl+K repeatedly and confirm the launcher is fully present or absent on the next painted frame, with no zoom, fade, or delayed overlay. Confirm a normal Add Goal dialog still animates.
- **Done when**: command-palette motion is zero for keyboard and pointer invocation while other dialogs are unchanged.
