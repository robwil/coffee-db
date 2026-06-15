# Follow-Up Items Plan

## Context

The initial build of Coffee DB left 9 follow-up items (see `0_initial.md`). After review, 3 are already done (#3 Turso migration, #4 CF Pages adapter, #8 responsive fixes) and 1 is a simple version bump (#9). The remaining 5 are the real work: FTS5 search, Turnstile bot protection, bean dedup UX, form error display, and loading states.

## Items to address (in implementation order)

### 1. FTS5 Search
**Why:** Currently using `LIKE %q%` which won't scale. Turso/libSQL supports FTS5.

- Add `beans_fts` virtual table to `schema.sql` (as already spec'd in the plan)
- Add SQL triggers (INSERT/UPDATE/DELETE on `beans`) to keep `beans_fts` in sync — avoids manual sync in app code
- Update `/src/routes/api/beans/search/+server.ts` to use `beans_fts MATCH ?` instead of three LIKE clauses
- Backfill: add a one-time INSERT INTO beans_fts SELECT from beans for existing data (can be run in db.ts init or as a migration script)
- **Reuse:** Existing search endpoint structure stays the same, just swap the query

### 2. Cloudflare Turnstile
**Why:** Public submission forms need bot protection before production.

- Add `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to `.env.example`
- Create a reusable `Turnstile.svelte` component that renders the `cf-turnstile` widget and exposes the token
- Add the component to all 3 submission forms: `/beans/new`, `/beans/[id]/espresso/new`, `/beans/[id]/pourover/new`
- Create a server-side `verifyTurnstile(token, secret)` utility in `src/lib/server/turnstile.ts`
- Call it in each form's `+page.server.ts` action before processing the submission; return `fail(400, { error: '...' })` on failure
- Use Cloudflare's test keys for local dev (always-passes sitekey)

### 3. Bean Dedup UX
**Why:** Users can create duplicate beans without seeing existing matches.

- Add a `BeanSuggestions.svelte` component to the add-bean form (`/beans/new/+page.svelte`)
- As the user types in the bean name field, debounce-query `/api/beans/search?q=...` (same pattern as `EquipmentAutocomplete.svelte`)
- Show matching beans below the name field with roaster + origin — "Did you mean one of these?"
- Each suggestion links to the existing bean's page (so the user can add a brew there instead)
- If user proceeds with "Add new bean", the form submits as normal
- **Reuse:** `EquipmentAutocomplete.svelte` for the debounce/search pattern; existing `/api/beans/search` endpoint

### 4. Form Error Display
**Why:** Server-side `fail()` responses are silently swallowed — `use:enhance` is wired but the `form` prop is never read.

- In each of the 3 form pages, destructure the `form` prop from the page data
- Add an error banner component (or inline `{#if form?.error}` block) at the top of each form
- Style consistently with the app's existing design
- Forms affected: `/beans/new/+page.svelte`, `/beans/[id]/espresso/new/+page.svelte`, `/beans/[id]/pourover/new/+page.svelte`

### 5. Loading States
**Why:** No visual feedback during autocomplete searches, form submissions, or page transitions.

- **Autocomplete search** (`EquipmentAutocomplete.svelte`, home page bean search, new `BeanSuggestions`): Add a `loading` state variable, show a spinner or "Searching..." text while the fetch is in-flight
- **Form submissions**: Use `use:enhance` callback to set a `submitting` state; disable the submit button and show a spinner during POST
- **Page transitions**: Use SvelteKit's `navigating` store to show a top-of-page progress bar or similar indicator
- **Reuse:** Create a small `Spinner.svelte` component for consistent loading indicators across the app

### 6. Node Version Upgrade
**Why:** Currently pinned to Node 22 in `.nvmrc`. Upgrading to Node 24 satisfies the scaffold's `>=24` requirement cleanly.

- Update `.nvmrc` from `22` to `24`
- Run `npm install` with Node 24 to regenerate `package-lock.json`
- Verify `npm run dev` and `npm run build` work

## Verification

- Run `npm run dev` and test FTS5 search — results should match on partial bean name, roaster, origin
- Test Turnstile: use test sitekey in dev, verify forms submit with valid token and reject without
- Test bean dedup: type a known bean name on the add-bean page, verify suggestions appear
- Test error display: bypass client validation (e.g. via DevTools), verify server error banner shows
- Test loading states: throttle network in DevTools, verify spinners appear on autocomplete and form submit
- Take Playwright screenshots at mobile and desktop widths to verify no regressions
