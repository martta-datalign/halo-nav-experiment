# Animation improvement plans

All plans were audited against commit `34c99f7`. Source files may contain newer local work; each executor must stop if a cited excerpt has drifted materially instead of improvising.

| Plan | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Make the command palette instant | HIGH | TODO |
| 002 | Make sidebar toggles instant | HIGH | TODO |
| 003 | Honor reduced motion across overlays | HIGH | TODO |
| 004 | Replace broad transitions with explicit properties | HIGH | TODO |
| 005 | Retune sheet entrances and exits | MEDIUM | TODO |
| 006 | Make reversible overlays interruptible | MEDIUM | TODO |
| 007 | Make the Halo thinking glow responsive and cheap | MEDIUM | TODO |
| 008 | Composite progress and carousel indicators | MEDIUM | TODO |
| 009 | Respect reduced motion in composition charts | MEDIUM | TODO |
| 010 | Gate and restrain hover motion | MEDIUM | TODO |
| 011 | Retune calculator result disclosure | MEDIUM | TODO |
| 012 | Add tactile button press feedback | MEDIUM | TODO |
| 013 | Establish a shared motion token system | LOW | TODO |
| 014 | Animate opportunity navigation directionally | LOW | TODO |
| 015 | Animate connect-account steps | LOW | TODO |
| 016 | Animate dashboard card customization | LOW | TODO |
| 017 | Celebrate a newly completed goal | LOW | TODO |

## Recommended execution order

1. **013** — establish exact shared curves and durations.
2. **004**, **001**, **002** — remove systemic broad and keyboard motion first.
3. **006**, then **003**, then **005** — transition architecture before reduced-motion overrides and final sheet timing.
4. **007**, **008**, **009**, **010**, **011**, **012** — isolated corrective improvements; 010 should follow 004 and 012 should consume 004's explicit Button transition list.
5. **014**, **015**, **016**, **017** — additive motion after the corrective foundation is stable.

## Dependencies

- Plans 003, 005, 007, 010, 011, 012, 014, 015, 016, and 017 consume tokens from plan 013.
- Plan 003 must be reconciled after plan 006 because overlay animation mechanics change.
- Plan 005 builds on the Sheet portion of plan 006 if 006 executes first.
- Plan 010 assumes plan 004 has replaced card `transition-all`.
- Plan 012 assumes plan 004's Button transition list includes transform.
- Plan 014 shares the opportunity indicator with plan 008; execute 008 first.

## Execution rule

Run one plan at a time and complete its mechanical and feel checks before starting dependents. If source code differs materially from the commit-stamped excerpt, stop and refresh the plan rather than guessing.

