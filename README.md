# Halo AI — side-nav rebuild

An AI-native rethink of Datalign's Halo AI, moving navigation from the top bar to a
persistent side nav so the Ask Halo conversation gets the full canvas. Same
functionality as the current product — a UX/IA enhancement.

**Design voice:**  refined, minimal, typographic. White content
surface with a faint-blue sidebar, hairline borders, near-black primary buttons, and
a restrained violet "Halo" accent reserved for AI affordances. Font: Instrument Sans.

## Stack

Vite · React · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · React Router · sonner · lucide

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck (tsc -b) + production build
```

## Features

- **App shell** — collapsible side nav (icon rail, hover-preview), a **per-page**
  top header (not global) with a global `⌘K` "Ask Halo" launcher and account menu.
  Financial Tools is an auto-open nav group.
- **Dashboard** (`/`) — dashboard + financial analysis merged, with subtabs
  (Overview built; others are placeholders):
  - Net-worth area chart — range switching (1W/1M/3M/YTD/ALL); tooltip shows the
    point-over-point change + a "key driver" on notable points.
  - Accounts (green/red balances), Goals (link through to the Goals page),
    Recent activity, **Halo insights**, a dark "financial analysis" card, and the
    advisor **"Make it actionable"** card (share → success toast).
  - Right-column action cards are dismissible; **Customize** (in the header) toggles
    every card and restores dismissed ones.
  - **Money flow** subtab — a Sankey (income → budget → spending) with a
    1W/1M/3M/YTD period toggle.
- **Ask Halo** (`/ask`) — full-height chat with a history panel, **New chat**,
  **Simple / Deep** answer modes, un-bubbled assistant replies, an auto-growing
  input, and an AI-mistakes disclaimer. A **My Vault** button opens a dialog to
  upload / browse / delete documents that feed Halo's knowledge base.
  ⌘K, per-card prompts, and insights deep-link in pre-seeded (`/ask?q=`).
- Tools · Advisor Match · Disclosures · Settings are wired in the nav / account menu
  as light placeholder pages.

> Data is mocked (`src/lib/*`) and AI replies are canned — the surfaces where the
> live model and real account/document data plug in are marked in the components.

## Structure

```
src/
  App.tsx                     routes + providers (Sidebar, Tooltip, AskHalo, Toaster)
  components/
    app-sidebar.tsx           the side nav
    site-header.tsx           per-page top header (title / showSearch / actions props)
    ask-halo.tsx              Ask Halo provider + ⌘K command dialog (ask() deep-links)
    ask-halo-action.tsx       contextual "Ask Halo" prompt + CardPromptFooter
    home/                     Dashboard cards (net-worth, accounts, goals, activity,
                              insights, analysis, actionable, money-flow)
    ask/vault.tsx             My Vault dialog (upload / browse / delete)
    ui/                       shadcn primitives
  routes/                     home, ask, placeholder
  lib/                        data.ts, money-flow.ts (mock data), format.ts, utils.ts
```

## Handoff notes

- Mock data + integration points: `src/lib/data.ts` (accounts, goals, activity,
  net-worth series, insights), `src/lib/money-flow.ts` (per-period flows). Swap these
  for API calls.
- Canned AI: `src/routes/ask.tsx` (`REPLIES`) and the seeded chat history — replace
  with the live model; `ask()` in `ask-halo.tsx` is the single entry to start/seed a
  chat from anywhere.
- Vault upload/delete is local state only (`ask.tsx`) — wire to storage + the
  knowledge-base ingestion.
- Design tokens live in `src/index.css` (`:root` light, `.dark` structured for later).
