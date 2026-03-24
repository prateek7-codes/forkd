# Active Context: Forkd — Group Restaurant Chooser

## Current State

**App Status**: ✅ Fully built and deployed

Forkd is a social group restaurant-chooser app with a warm terracotta/amber editorial aesthetic. All core features are implemented and working.

## Recently Completed

- [x] Warm terracotta/amber theme (Tailwind CSS 4 @theme variables)
- [x] Playfair Display (display) + Inter (body) font pair
- [x] 20 pre-loaded restaurants across Mumbai, Delhi, Bangalore, London
- [x] Discover tab — city, cuisine, budget & tag filters + search bar
- [x] AI discovery — `/api/suggest` calls Claude claude-3-5-haiku-20241022 to suggest restaurants for any city
- [x] Shortlist tab — add/remove restaurants, live vote preview, member avatar stacks
- [x] Vote & Time tab — time slot picker, animated vote bars, per-member named votes, winner highlight
- [x] Spin-the-wheel tiebreaker — canvas-based wheel with easing animation
- [x] Restaurant Detail Modal — full info, Google-style reviews, shortlist CTA
- [x] Manual Add tab — full form with cuisine picker, dishes, tags, budget
- [x] Group Sidebar — switch between 5 pre-seeded members (Priya, Arjun, Meera, Rohan, Zara), edit group name
- [x] Share Modal — copy link, native share, WhatsApp share
- [x] Session persistence via sessionStorage
- [x] TypeScript strict — 0 errors; ESLint — 0 errors

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Root app shell — tab state, all shared state | ✅ |
| `src/app/layout.tsx` | Root layout with Playfair + Inter fonts | ✅ |
| `src/app/globals.css` | Tailwind @theme + warm colour tokens | ✅ |
| `src/app/api/suggest/route.ts` | AI restaurant suggestion API (Claude) | ✅ |
| `src/lib/data.ts` | Types, seed data (20 restaurants + members) | ✅ |
| `src/components/DiscoverTab.tsx` | Discover tab with filters + AI search | ✅ |
| `src/components/RestaurantCard.tsx` | Reusable restaurant card | ✅ |
| `src/components/ShortlistTab.tsx` | Shortlist view with vote preview | ✅ |
| `src/components/VoteTab.tsx` | Voting UI + time picker + wheel spinner | ✅ |
| `src/components/ManualAddTab.tsx` | Manual restaurant add form | ✅ |
| `src/components/RestaurantModal.tsx` | Full-detail restaurant modal | ✅ |
| `src/components/GroupSidebar.tsx` | Group member switcher + name editor | ✅ |
| `src/components/ShareModal.tsx` | Copy link + WhatsApp share modal | ✅ |

## Architecture

- **Single-page app** with tab navigation (no routing needed)
- **All state** lives in `page.tsx` via `useState<AppState>`, passed down as props
- **sessionStorage** persistence via lazy initializer pattern (avoids setState-in-effect lint warning)
- **AI API route** at `/api/suggest` — POST `{ city: string }`, returns `{ restaurants: Restaurant[] }`
- **No database** — in-memory only (session storage for persistence within tab)

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#c44a20` (terracotta) |
| Secondary | `#d97706` (amber) |
| Background | `#fdf8f0` (warm cream) |
| Text | `#2d2420` (charcoal warm) |
| Gradient | `linear-gradient(135deg, #c44a20, #d97706)` |

## Seeded Group Members

| Name | Color |
|------|-------|
| Priya | `#c44a20` |
| Arjun | `#d97706` |
| Meera | `#7c3aed` |
| Rohan | `#059669` |
| Zara | `#db2777` |

## AI Integration

The `/api/suggest` endpoint requires `ANTHROPIC_API_KEY` environment variable. Without it, the endpoint returns a 503. The UI shows an appropriate error message and falls back to showing existing seeded results.

## Session History

| Date | Changes |
|------|---------|
| 2026-03-24 | Full Forkd app built from scratch — all tabs, modal, AI API, theming |
