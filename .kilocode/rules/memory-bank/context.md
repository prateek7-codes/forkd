# Active Context: Forkd — Group Restaurant Chooser

## Current State

**App Status**: ✅ Fully built with all requested features

Forkd is a social group restaurant-chooser app with a warm terracotta/amber editorial aesthetic. Full dark mode support, Google Places integration, and calendar export.

## Recently Completed

### Latest Improvements (Current Session)
- [x] **Auto-fetch area coordinates** — Uses Nominatim API to auto-fetch coordinates for any area (no manual mapping required), with fallback to cached areas
- [x] **Smarter Best Pick** — Now uses weighted scoring: group-friendly tags (+25/+20), rating, review count, budget balance, badges (Popular/Featured)
- [x] **Premium Airbnb-like UI** — Softer shadows, smoother 300ms animations, backdrop-blur on badges, rounded-xl buttons, refined spacing, hover scale effects

### Launch Polish (Latest)
- [x] **Loading state** — button shows spinner + "Finding..." text while searching
- [x] **Filters visibility** — now hidden until results exist (clarity fix)
- [x] **Autofocus** — city input autofocuses on page load
- [x] **Context header** — "📍 Showing results for {area}, {city}" after search
- [x] **Best Pick section** — prominent golden banner with restaurant name, rating, cuisine, budget, and reasons (Great for groups, Balanced pricing, Highly rated)
- [x] **Card images** — added Unsplash cuisine-specific fallback images, increased height (h-48)
- [x] **Hover animation** — cards lift on hover (-translate-y-1, shadow-xl)
- [x] **Empty state** — "Find the perfect place for your group" + "✨ Smart picks tailored for your group"
- [x] **Image prominence** — larger image area (h-48), stronger gradient fallback, better overlay
- [x] **AI fallback** — auto-generates 15 realistic restaurants for unsupported cities (no more empty states)
- [x] **Fallback message** — "We could not find exact matches, showing great picks instead"
- [x] **Smart picks text** — "✨ Smart picks tailored for your group" below results header
- [x] **Input normalization** — parses "Bandra Mumbai" → city=Mumbai, area=Bandra
- [x] **Strict city matching** — exact match required (with fallback for short cities)
- [x] **Validation layer** — filters out results not matching searched city
- [x] **AI prompt** — updated with STRICT rules: ALL restaurants must be ONLY in requested city
- [x] **Yelp-like data** — city-specific restaurant databases for Paris, Tokyo, New York, London, Mumbai, Delhi, Bangalore
- [x] **Smart fallback** — generates contextually accurate results per city with local cuisine/area names
- [x] **Autocomplete** — OpenStreetMap Nominatim API integration for location suggestions with 300ms debounce
- [x] **Yelp-style ranking** — (rating * 0.35) + (logReviews * 0.25) + (aiScore * 0.25) + (voteScore * 0.15) with boosts for rating > 4.4 and reviews > 1000
- [x] **Location-specific fallbacks** — Added Hyderabad, Chennai, Pune to city-specific restaurant databases
- [x] **Pseudo-random generation** — Deterministic unique results per city using seeded hash function
- [x] **Debug logging** — Added console logs for city, area, cacheKey in fallback generation and API calls
- [x] **Strict AI prompts** — Enhanced prompt with "results must be UNIQUE and DIFFERENT each time"
- [x] **Real restaurant data** — New /api/restaurants endpoint using OpenStreetMap Overpass API
- [x] **OSM + AI hybrid** — Fetches real restaurants from OSM, enriches with AI for ratings/dishes
- [x] **1-hour caching** — Caches results per city_area location
- [x] **UX source labels** — Shows "📍 Real places + smart insights" / "⚡ Cached results" / "✨ AI-powered"
- [x] **Area-based filtering** — Coordinates mapping for 100+ neighborhoods, radius-based OSM queries, distance filtering within 5km

### Core Features
- [x] Warm terracotta/amber theme (Tailwind CSS 4 @theme variables)
- [x] Playfair Display (display) + Inter (body) font pair
- [x] 20 pre-loaded restaurants across Mumbai, Delhi, Bangalore, London
- [x] Discover tab — city, cuisine, budget & tag filters + search bar
- [x] AI discovery — `/api/suggest` calls Claude claude-3-5-haiku-20241022
- [x] Shortlist tab — add/remove restaurants, live vote preview, member avatar stacks
- [x] Vote & Time tab — time slot picker, animated vote bars, per-member named votes, winner highlight
- [x] Spin-the-wheel tiebreaker — canvas-based wheel with easing animation
- [x] Restaurant Detail Modal — full info, Google-style reviews, shortlist CTA
- [x] Manual Add tab — full form with cuisine picker, dishes, tags, budget
- [x] Group Sidebar — switch between 5 pre-seeded members, edit group name
- [x] Share Modal — copy link, native share, WhatsApp share
- [x] Session persistence via sessionStorage

### New Features (Latest)
- [x] **Dark Mode** — toggle in header, persists to localStorage, defaults to system preference
- [x] **Source Switcher** — AI Picks / Popular (Google) / Curated filter in Discover tab
- [x] **View Toggle** — grid/map view switcher in Discover tab
- [x] **Restaurant Badges** — AI Suggested, Popular, Featured, Trending badges on cards
- [x] **Google Places API** — `/api/google-restaurants` endpoint for real restaurant data
- [x] **Calendar Integration** — `/api/calendar-event` generates .ics files and Google Calendar links
- [x] **Selection Confirmation** — post-vote flow with save to calendar options
- [x] **Mobile Bottom Nav** — fixed bottom navigation on mobile devices
- [x] **Micro-interactions** — card hover scale, button press scale, animated transitions
- [x] **Deduplication** — fuzzy matching (Levenshtein) to remove duplicates between AI and Google results
- [x] **Smart Ranking** — scoring formula: score = (rating*0.4) + (log(reviews)*0.2) + (ai_score*0.3) + (votes*0.1)
- [x] **Reminder Option** — toggle for None/30min/1hour/1day before saving to calendar
- [x] **Improved Empty States** — friendly messages with suggested actions
- [x] **Google Place Photos** — uses Google Place Photos API with gradient fallback
- [x] **Map Memoization** — memoized marker data to optimize re-renders
- [x] **Discover UI Cleanup** — unified search system (city/area/restaurant), removed duplicate city pills and old AI search bar, improved source switcher labels, added "Showing results for X" context header, fixed empty state to show "Start by entering a city..."

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Root app shell — tab state, all shared state, dark mode | ✅ |
| `src/app/layout.tsx` | Root layout with Playfair + Inter fonts | ✅ |
| `src/app/globals.css` | Tailwind @theme + warm colour tokens + dark mode | ✅ |
| `src/app/api/suggest/route.ts` | AI restaurant suggestion (Claude) | ✅ |
| `src/app/api/google-restaurants/route.ts` | Google Places API integration | ✅ |
| `src/app/api/calendar-event/route.ts` | .ics + Google Calendar export | ✅ |
| `src/lib/data.ts` | Types (RestaurantType, badges), seed data | ✅ |
| `src/components/DiscoverTab.tsx` | Discover with filters, AI, source switcher, view toggle | ✅ |
| `src/components/RestaurantCard.tsx` | Card with badges, dark mode, hover effects | ✅ |
| `src/components/ShortlistTab.tsx` | Shortlist with vote preview, confirm winner | ✅ |
| `src/components/VoteTab.tsx` | Voting UI + wheel spinner, dark mode | ✅ |
| `src/components/ManualAddTab.tsx` | Add form with dark mode | ✅ |
| `src/components/RestaurantModal.tsx` | Full-detail modal with dark mode | ✅ |
| `src/components/GroupSidebar.tsx` | Member switcher, dark mode | ✅ |
| `src/components/ShareModal.tsx` | Copy link, WhatsApp, dark mode | ✅ |
| `src/components/SelectionConfirmModal.tsx` | Post-selection flow with calendar options | ✅ |

## Architecture

- **Single-page app** with tab navigation
- **All state** in `page.tsx` via `useState<AppState>`, passed as props
- **Dark mode** via CSS variables + localStorage
- **sessionStorage** for persistence
- **API routes**: `/api/suggest`, `/api/google-restaurants`, `/api/calendar-event`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/suggest` | POST | Claude AI restaurant suggestions |
| `/api/google-restaurants` | POST | Google Places API results |
| `/api/calendar-event` | GET | Generate .ics + Google Calendar links |

## Dark Mode

| Token | Light | Dark |
|-------|-------|------|
| Background | #fdf8f0 | #0f0f10 |
| Card | white | #1a1a1d |
| Text | #2d2420 | #f5f5f5 |
| Accent | #c44a20 | #ff8a3d |

## Seeded Group Members

| Name | Color |
|------|-------|
| Priya | #c44a20 |
| Arjun | #d97706 |
| Meera | #7c3aed |
| Rohan | #059669 |
| Zara | #db2777 |

## Session History

| Date | Changes |
|------|---------|
| 2026-03-24 | Full Forkd app built |
| 2026-03-24 | Added Google Places, dark mode, badges, calendar export, mobile nav |
| 2026-03-24 | Added deduplication, smart ranking, reminder option, empty states, photo API, map memoization |
| 2026-03-24 | Discover UI cleanup: unified search (city/area/name), removed duplicate UI, improved source labels, added search context header, fixed empty state |
| 2026-03-24 | UX refinements: source labels to Smart Picks/Top Rated/Editor's Picks, added "Great for groups" explanation for Best Pick, improved shortlist CTA with glow effect and larger icon |
| 2026-03-24 | Launch polish: loading spinner, filters hidden until results, autofocus, context header with 📍, Best Pick golden banner with reasons, Unsplash images, hover lift animation, empty state with "Smart picks tailored for your group", larger card images |
| 2026-03-24 | AI fallback: auto-generates 15 realistic restaurants for any city, removes dead-end states, "We could not find exact matches" message |
| 2026-03-24 | Global search accuracy: input normalization (Bandra Mumbai → Mumbai), strict city matching, validation layer, updated AI prompt with location strictness, Yelp-like city-specific restaurant databases |
| 2026-03-24 | Yelp-style search: OpenStreetMap Nominatim autocomplete, improved ranking formula with boosts, enhanced validation |
| 2026-03-24 | Fixed city duplication bug: added Hyderabad, Chennai, Pune to specific databases, pseudo-random generation for unique per-city results, debug logging |
| 2026-03-24 | Real restaurant system: /api/restaurants using OpenStreetMap Overpass API for real names, AI enrichment hybrid, 1-hour caching, source labels |
| 2026-03-24 | Area-based filtering: coordinates mapping for 100+ neighborhoods, radius-based OSM queries (5km), distance filtering for accurate area results |
