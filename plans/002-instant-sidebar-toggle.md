# 002 — Make sidebar toggles instant

- **Status**: TODO
- **Commit**: 34c99f7
- **Severity**: HIGH
- **Category**: Purpose, performance, accessibility
- **Estimated scope**: 2 files, about 20 lines

## Problem

Cmd/Ctrl+B animates layout properties and related sidebar elements for 200ms.

```tsx
// src/components/ui/sidebar.tsx:96 — current
if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
  event.preventDefault()
  toggleSidebar()
}

// src/components/ui/sidebar.tsx:221-232 — current
"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear"
"... w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear ..."
```

`width`, `left`, `right`, margin, height, and padding are recomputed across frames, and there is no reduced-motion branch.

## Target

Sidebar collapse/expand becomes an instantaneous state change for every input method. This guarantees the keyboard shortcut never waits and prevents transition-time relayout.

## Repo conventions to follow

- Sidebar state remains driven by `data-state` and `data-collapsible` in `src/components/ui/sidebar.tsx:209-215`.
- Preserve the existing cookie and mobile Sheet behavior.

## Steps

1. Remove `transition-[width] duration-200 ease-linear` from the sidebar gap at `src/components/ui/sidebar.tsx:221`.
2. Remove `transition-[left,right,width] duration-200 ease-linear` from the desktop container at line 232.
3. Remove collapse-related layout transitions from the group label and menu button at lines 410 and 479; retain focus/color transitions only if they do not animate layout.
4. Remove the 200ms collapse chevron rotation in `src/components/app-sidebar.tsx:204`; set its orientation directly from state.
5. Leave the mobile sidebar's Sheet motion to plan 005.

## Boundaries

- Do NOT change sidebar dimensions, breakpoints, persistence, navigation, or the Cmd/Ctrl+B binding.
- Do NOT replace the layout with absolute positioning in this plan.
- Do NOT add dependencies.

## Verification

- **Mechanical**: run `npx tsc --noEmit -p tsconfig.app.json`; expect exit code 0. Search `src/components/ui/sidebar.tsx` and confirm collapse state no longer transitions width, height, padding, margin, left, or right.
- **Feel check**: throttle the CPU 6×, press Cmd/Ctrl+B repeatedly, and confirm every element snaps to its final state together without a trailing label or chevron. Repeat with reduced motion enabled.
- **Done when**: one state update produces one layout change and no sidebar collapse animation.

