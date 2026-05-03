# AGENTS.md — The Watch Resource (twr-main)

Handoff document for AI coding agents. Read this before making any changes.

---

## Project Overview

**The Watch Resource** (`https://www.thewatchresource.com`) is an independent watch review site founded in 2021. It publishes in-depth watch reviews, brand reviews, buyer's guides, watch comparisons, and alternatives articles.

This repo is a full WordPress-to-Astro migration. The site is fully static, deployed on Vercel, with no server-side runtime.

**Owner:** Máté Dyékiss (GitHub: MateTWR)
**GitHub repo:** `MateTWR/twr-main`
**Branch:** `main` (only branch — push directly)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Astro 6 (static output) |
| Content | Astro Content Collections (MD + MDX) |
| Styling | Scoped `<style>` per component, no CSS framework |
| Search | Pagefind v1.5.0 (static index built at deploy time) |
| MDX processing | `@astrojs/mdx` |
| Sitemap | `@astrojs/sitemap` |
| Images | Cloudflare Images (`imagedelivery.net/X-EqW8t9MkEGniKrzeQMdA/`) |
| Hosting | Vercel (static) |
| Analytics | Google Tag Manager (`GTM-T859CMW`) → GA4 (`G-TF4DXGH4V0`) |
| CRM | HubSpot (portal `39792346`) |
| Fonts | Google Fonts: Roboto (body), DM Sans (headings/nav) |

---

## Commands

```bash
npm run dev        # local dev server
npm run build      # astro build && pagefind --site dist
npm run preview    # preview built output
npx astro sync     # regenerate content collection types (run after editing src/content.config.ts)
```

> **Important:** `npm run build` runs both Astro and Pagefind. Never run `astro build` alone — the search index won't be generated.

---

## Folder Architecture

```
twr-main/
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ArticlePage.astro      # Shared layout for all article types
│   │   ├── CookieBanner.astro     # GDPR/CCPA consent banner
│   │   ├── Footer.astro           # Site footer + newsletter form + opt-out
│   │   ├── Header.astro           # Sticky nav with dropdowns + search icon
│   │   ├── RatingBox.astro        # Star rating display component
│   │   └── WatchCard.astro        # (exists, uncertain if actively used)
│   ├── content/
│   │   ├── alternatives/          # Alternatives articles (8 articles)
│   │   ├── comparisons/           # Comparison articles (10 articles)
│   │   ├── guides/                # Buyer's guides (~40 articles)
│   │   ├── pages/                 # Static pages (collections, comparisons index, etc.)
│   │   └── reviews/               # Watch + brand reviews (~80 articles, mix of .md/.mdx)
│   ├── layouts/
│   │   └── Layout.astro           # Root HTML shell (head, GTM, fonts, cookie banner)
│   ├── pages/
│   │   ├── index.astro            # Homepage
│   │   ├── search.astro           # Pagefind search page
│   │   ├── alternatives/[slug].astro
│   │   ├── comparisons/[slug].astro
│   │   ├── guides/[slug].astro
│   │   ├── pages/
│   │   │   ├── [slug].astro       # Generic pages dynamic route
│   │   │   └── watch-comparisons.astro  # Dedicated override (lists all comparisons)
│   │   └── reviews/
│   │       ├── [slug].astro
│   │       ├── brand-reviews/[...page].astro
│   │       └── in-depth-watch-reviews/[...page].astro
│   ├── plugins/
│   │   └── rehype-watch-cards.mjs # Rehype plugin: transforms MD into watch card UI
│   └── content.config.ts          # Zod schemas for all collections
├── astro.config.mjs               # Astro config: integrations, redirects (100+ 301s)
├── vercel.json                    # Forces Vercel to use `npm run build` (not just astro build)
└── package.json
```

---

## Key Routes & Components

### Watch Database, Comparison Tool, And Quiz Planning
The watch database is currently maintained in Google Sheets:
`https://docs.google.com/spreadsheets/d/1x35yr_MZoNsrMha0zfMB-wdpdQH_fjFHbk4U1y870MI/edit`

Use [docs/watch-database-and-tools.md](/Users/matedyekiss/Desktop/The Watch Resource/twr-main/docs/watch-database-and-tools.md) as the durable handoff for this project area. It documents:
- The database schema and controlled values.
- The planned two-watch comparison picker/page.
- The planned "next watch" quiz/recommendation tool.
- Import rules for brand collection crawling.
- Completed imports and row ranges.

Current database import rules:
- Skip unavailable/out-of-stock watches unless the owner says otherwise.
- Include each product's source URL in `source_url`.
- Leave `positive_1` through `negative_5` blank unless there is editorial review context.
- Use brand/product pages for factual specs; normalize controlled dropdown columns to the sheet's allowed values.
- Keep `lug_to_lug_mm` blank when brands do not provide it directly.

### `src/layouts/Layout.astro`
Root HTML shell used by every page. Contains:
- Google Fonts
- GTM Consent Mode v2 default (`analytics_storage: denied`) — **must run before GTM script**
- GTM snippet (`GTM-T859CMW`)
- HubSpot tracking script (`39792346`)
- Structured data slot (`schema` prop)
- `<CookieBanner />` at bottom of body

### `src/components/ArticlePage.astro`
Used by all article routes. Accepts:
- `title`, `description`, `heroImage`, `date`, `author`, `Content`
- `related[]`, `relatedLabel`, `relatedBase`, `collection`
- `ratingTotal?`, `price?`, `priceCurrency?`

Generates `@graph` JSON-LD schema: `Article` + `BreadcrumbList`, and if `ratingTotal` is set, a `Product` with `aggregateRating` + optionally `offers`.

### `src/components/Header.astro`
Sticky header with full dropdown nav. Search icon links to `/search`. No JS search modal.

### `src/components/Footer.astro`
Three-column footer:
1. Logo + about + copyright + "Do Not Sell" CCPA opt-out button
2. Navigation links
3. Newsletter signup form (custom HTML, submits via HubSpot Forms API)

Newsletter form POSTs to:
`https://api.hsforms.com/submissions/v3/integration/submit/39792346/9a63b58c-5278-4ffd-be42-eb179aeb8fd7`

### `src/components/CookieBanner.astro`
Fixed bottom banner. Stores choice in `localStorage` key `twr_cookie_consent` (`accepted` | `declined`). On accept, fires `gtag('consent', 'update', { analytics_storage: 'granted', ... })`.

### `src/pages/search.astro`
Dedicated Pagefind search page. Loads `/pagefind/pagefind-ui.js` dynamically at runtime (NOT via `<script src is:inline>` — that fails because pagefind files don't exist at Astro build time). Initializes `new PagefindUI({ element: '#search' })` in the `onload` callback.

### `src/plugins/rehype-watch-cards.mjs`
Rehype plugin that transforms MD patterns into `.watch-card-md` card layouts. Triggers on: image link + `**Specs:**` list + a CTA paragraph where all non-whitespace children are `<a>` elements. Used in review articles.

### `src/pages/pages/watch-comparisons.astro`
Dedicated page that overrides `[slug].astro` for `/pages/watch-comparisons/`. Fetches all comparison articles and renders them as horizontal tiles (image + title + description + CTA) sorted newest first, above a "More Articles" section.

---

## Content Collection Schema (`src/content.config.ts`)

All five collections (`reviews`, `guides`, `comparisons`, `alternatives`, `pages`) share `postSchema`:

```ts
title:             string
date:              date (coerced)
categories:        string[]   default []
tags:              string[]   default []
description?:      string
heroImage?:        string     (Cloudflare Images URL)
author?:           string
draft?:            boolean    default false
ratingTotal?:      number     (used on review pages — triggers Product schema + RatingBox)
ratingDial?:       number
ratingCase?:       number
ratingWearability? number
ratingPrice?:      number
price?:            number     (USD, used in Product schema offers block)
priceCurrency?:    string     default 'USD'
```

After editing `content.config.ts`, always run `npx astro sync` to regenerate types.

---

## Design System

| Token | Value |
|---|---|
| Primary accent | `#EBA541` (gold/orange) |
| Accent hover | `#d4922e` |
| Dark text | `#101010` |
| Body text | `#374151` |
| Muted text | `#6b7280` / `#9ca3af` |
| Background | `#f9fafd` |
| Surface | `#ffffff` |
| Border | `#e5e7eb` |
| Font body | Roboto |
| Font heading/nav | DM Sans |
| Content max-width | `740px` (articles), `1200px` (nav/footer) |

No utility class framework. All styles are scoped `<style>` blocks per component, with `:global()` for styles that need to pierce into rendered markdown or third-party HTML.

---

## Image Hosting

All images are hosted on **Cloudflare Images**. Base URL:
```
https://imagedelivery.net/X-EqW8t9MkEGniKrzeQMdA/{image-id}/public
```
Never use WordPress CDN URLs (`wp-content/uploads/...`) — the old WP site is no longer the origin.

---

## Deployment

- **Platform:** Vercel
- **Build command (in vercel.json):** `npm run build` → runs `astro build && pagefind --site dist`
- **Output directory:** `dist`
- **`vercel.json` is required** — without it Vercel's Astro preset only runs `astro build`, skipping pagefind, and the search page breaks with a 404.
- Every push to `main` auto-deploys.
- DNS: `thewatchresource.com` A record → Vercel, `www` CNAME → Vercel.

---

## Tracking & Consent

### GTM Consent Mode v2
- Default consent state set in `Layout.astro` **before** the GTM snippet — do not reorder these scripts.
- Returning visitors who accepted: consent is granted before GTM loads (checked via `localStorage.getItem('twr_cookie_consent') === 'accepted'`).
- GTM container `GTM-T859CMW` contains: GA4 Configuration tag, GA4 affiliate click event tag.

### GA4 Affiliate Click Tracking (configured in GTM)
- Trigger: Click - Just Links where Click URL does not contain `thewatchresource.com`
- Event name: `affiliate_click`, parameter: `link_url`

### HubSpot
- Tracking script loaded in `Layout.astro` (page tracking only)
- Forms API used for newsletter — no HubSpot widget embedded

---

## Redirects

100+ 301 redirects are configured in `astro.config.mjs` under `redirects`. These cover the WordPress URL structure (flat slugs like `/rolex-submariner-alternatives/`) to the new Astro structure (e.g. `/alternatives/rolex-submariner-alternatives/`). Do not remove these.

---

## Known Issues & TODOs

- **Watch cards on Ball and Hamilton review articles** — the rehype-watch-cards plugin was fixed to handle multi-link CTA paragraphs, but the Ball article watch cards were reported as still not rendering correctly. Skipped by owner; may need further investigation.
- **Hamilton Intra-Matic hero image** — was reported missing after a content cleanup. May need to verify the `heroImage` frontmatter URL is correct.
- **No privacy policy page** — the cookie banner links to `/pages/privacy-policy/` which does not exist yet.
- **`price` frontmatter only on Circula review** — the `Product` schema `offers` block only appears on articles that have `price:` set in frontmatter. Other reviews only get `aggregateRating`. This is intentional but incomplete.
- **No test suite** — there are no automated tests. Verify changes visually on the live site after deploy.
- **`WatchCard.astro` component** — exists in components but it is uncertain whether it is actively used anywhere.

---

## Editing Conventions

- **Never edit `dist/`** — it is a build artifact and is gitignored.
- **Prefer editing existing files** over creating new ones.
- **Scoped styles** — use `<style>` blocks per component. Use `:global()` only when styles must reach rendered markdown or third-party output.
- **`is:inline` scripts** — use for scripts that must not be bundled (e.g. GTM, consent, HubSpot). Do not use `<script src="..." is:inline>` for files generated after Astro build (like pagefind) — use dynamic runtime injection instead.
- **Scripts before DOM** — any `<script is:inline>` that references DOM elements must be wrapped in `window.addEventListener('DOMContentLoaded', ...)` if the script appears before those elements in the HTML.
- **After editing `content.config.ts`** — always run `npx astro sync` to regenerate TypeScript types.
- **Committing** — always switch to `MateTWR` before pushing: `gh auth switch --user MateTWR`.
- **Do not add** docstrings, comments, or type annotations to code you didn't change.
- **Do not add** error handling for impossible cases or extra abstraction layers.

---

## Recent Work Log

### 1. Watch-comparisons listing page
**Files:** `src/pages/pages/watch-comparisons.astro` (new)
Dedicated static page overriding `[slug].astro` for `/pages/watch-comparisons/`. Fetches all 10 comparison articles, renders as horizontal tiles (image + title + description + "Read Comparison →") sorted newest first, above "More Articles".

### 2. Custom newsletter form via HubSpot API
**Files:** `src/components/Footer.astro`
Replaced HubSpot embedded widget (`hs-form-frame`) with a hand-coded form. On submit, POSTs JSON to HubSpot Forms API v3. Success/error shown inline. A `DOMContentLoaded` wrapper is required because the script tag is above the footer HTML in the component.

### 3. GDPR/CCPA cookie consent (self-built)
**Files:** `src/components/CookieBanner.astro` (new), `src/layouts/Layout.astro`, `src/components/Footer.astro`
GTM Consent Mode v2 defaults set before GTM loads. CookieBanner shown to new visitors; choice stored in localStorage. "Do Not Sell" button in footer for CCPA. No third-party consent tool used.

### 4. Product schema fix (aggregateRating + offers)
**Files:** `src/components/ArticlePage.astro`, `src/pages/reviews/[slug].astro`, `src/content.config.ts`, `src/content/reviews/circula-divesport-titanium-petrol-in-depth-review.mdx`
Previous schema used `Review > itemReviewed > Product` which failed Google's "Either offers, review, or aggregateRating should be specified" validation. Replaced with top-level `Product` with `aggregateRating` and optional `offers` (when `price` frontmatter is set). Added `price` and `priceCurrency` to the Zod schema. Only Circula review has `price` set so far.

### 5. GTM replacing direct GA4
**Files:** `src/layouts/Layout.astro`
Removed inline `gtag.js` snippet. Added GTM snippet (`GTM-T859CMW`). GA4 configuration and affiliate click event tracking are now managed inside GTM. GTM Consent Mode v2 default consent block added immediately before GTM script — order matters.

### 6. Pagefind search page (after multiple failed attempts)
**Files:** `src/pages/search.astro`, `src/components/Header.astro`, `vercel.json`
Modal approach abandoned (input not interactable — root cause never fully identified). Switched to dedicated `/search` page. Search icon in header navigates to `/search` instead of opening a modal. Root cause of original failure was `vercel.json` missing — Vercel's Astro preset ran `astro build` only, skipping `pagefind --site dist`, so `/pagefind/pagefind-ui.js` 404'd. Fixed by adding `vercel.json` with explicit `buildCommand: "npm run build"`.

### 7. Favicon update
**Files:** `public/favicon.ico`, `public/favicon.svg`
Owner replaced files directly in `public/`. Committed and pushed.

### 8. Watch database setup and brand imports
**Files:** `docs/watch-database-and-tools.md`, Google Sheet `TWR Watch Database`
Created a Google Sheet database to support future comparison and recommendation experiences. Added controlled dropdown columns for style, use case, budget, dial color, formality, brand tier, wrist-size fit, and enthusiast appeal. Imported Hamilton and Victorinox watches from brand collection/product pages, including product URLs and factual specs where available.
