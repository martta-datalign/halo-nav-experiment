# Halo AI — side-nav rebuild

An AI-native rethink of Datalign's Halo AI, moving navigation from the top bar to a
persistent side nav so the Ask Halo conversation gets the full canvas. Same
functionality as the current product — a UX/IA enhancement.

**Design voice:** Mercury / Willow — refined, minimal, typographic. Warm off-white
surfaces, hairline borders, near-black primary buttons, and a violet "Halo" accent
reserved for AI affordances.

## Stack

Vite · React · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · React Router · lucide

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## What's built (this pass)

- **App shell** — collapsible side nav (icon rail), header with a global
  `⌘K` "Ask Halo" launcher, breadcrumb, account menu.
- **Home** — the dashboard + financial analysis merged into one landing:
  net-worth chart (range switching, hover tooltip), Accounts, Goals, Recent
  activity, the "financial analysis" hero, proactive **Halo insights**, and the
  advisor-share card. Cards are toggleable via **Customize**.
- **Ask Halo** — full-height chat shell; entry points (`⌘K`, per-card sparkles,
  insights) deep-link into it pre-seeded. Live model wiring is a later pass.
- Tools / Advisors / Disclosures are wired in the nav as light placeholders.

## Structure

```
src/
  App.tsx                  routes + providers
  components/
    app-sidebar.tsx        the side nav
    site-header.tsx        top header + ⌘K command bar
    ask-halo.tsx           Ask Halo provider + ⌘K command dialog
    ask-halo-action.tsx    reusable contextual "Ask Halo" affordance
    home/                  Home cards (net worth, accounts, goals, ...)
    ui/                    shadcn primitives
  routes/                  home, ask, placeholder
  lib/                     data.ts (mock), format.ts, utils.ts
```
