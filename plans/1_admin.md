# Plan: Auth.js Google OAuth + Admin Page for Brew Management

## Context

The Coffee DB app is publicly deployed with no auth. We need a way for admin users to edit and delete brews. Auth.js (`@auth/sveltekit`) with the Google provider gives near-drop-in OAuth. Admin access is restricted to an env-driven email allowlist. The admin UI is a dedicated `/admin` route, separate from the public-facing site.

## 1. Install dependencies

```
npm install @auth/sveltekit @auth/core
```

## 2. Environment setup

**New file: `.env.example`**
```
AUTH_SECRET=           # openssl rand -base64 33
AUTH_GOOGLE_ID=        # Google OAuth client ID
AUTH_GOOGLE_SECRET=    # Google OAuth client secret
ADMIN_EMAILS=rwilliams@spotify.com   # comma-separated allowlist
```

Add `.env` to `.gitignore` — already covered by existing `.env` / `.env.*` rules.

## 3. Auth.js integration

**`src/auth.ts`** — Auth.js config (central module):
- Google provider using `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` env vars (auto-read by Auth.js)
- `AUTH_SECRET` env var for session signing (auto-read)
- `callbacks.signIn` — reject users whose email is not in `ADMIN_EMAILS`
- `callbacks.session` — expose `user.email` on the session object
- Trust the host header via `trustHost: true` (needed for deployed environments behind a proxy)

**`src/hooks.server.ts`** — update to compose Auth.js handle with existing DB init:
- Import `{ handle as authHandle }` from `src/auth.ts`
- Use `sequence()` from `@sveltejs/kit/hooks` if needed, or just chain
- Keep existing `getDb()` / `seedDb()` calls

**`src/app.d.ts`** — extend with Auth.js session types:
```ts
declare module '@auth/sveltekit' {
  // no changes needed if using default session shape
}
```

## 4. Session in layouts

**`src/routes/+layout.server.ts`** (new file):
- Load the session via Auth.js and return it so all pages have access to auth state

**`src/routes/+layout.svelte`** — add a login/logout link in the nav:
- If session exists: show user email + "Admin" link + Sign Out
- If no session: show "Sign In" link
- Keep existing nav links unchanged

## 5. Admin page — `/admin`

**`src/routes/admin/+page.server.ts`**:
- `load`: check session, redirect to `/` if not authenticated
- Query all espresso_brews and pourover_brews (with bean name joined) ordered by created_at DESC
- Return both lists to the page

**`src/routes/admin/+page.svelte`**:
- Two-tab layout (espresso / pourover) similar to bean detail page
- Each brew shows: bean name, key params (dose, yield/water), rating, date
- Each row has Edit and Delete buttons
- Delete triggers a form action with confirmation
- Edit navigates to `/admin/espresso/[id]/edit` or `/admin/pourover/[id]/edit`

## 6. Delete actions

**`src/routes/admin/+page.server.ts`** actions:
- `deleteEspresso`: delete from `espresso_brews` by id
- `deletePourover`: delete from `pourover_brews` by id
- Both verify session before executing

## 7. Edit pages

**`src/routes/admin/espresso/[id]/edit/+page.server.ts`** and **`+page.svelte`**:
- `load`: verify session, fetch the brew + bean info, return pre-populated form data
- Form action: update the espresso_brews row, redirect back to `/admin`
- Reuse the same form structure as the espresso/new page (shared styles from `app.css`)

**`src/routes/admin/pourover/[id]/edit/+page.server.ts`** and **`+page.svelte`**:
- Same pattern for pourover brews

## 8. Auth guard helper

**`src/lib/server/auth.ts`** — small helper:
```ts
export async function requireAdmin(locals) { ... }
```
- Gets session from locals, checks if user email is in ADMIN_EMAILS
- Throws `redirect(303, '/')` if not authorized
- Used by all admin `load` functions and actions to avoid duplication

## File summary

| File | Action |
|------|--------|
| `.env.example` | Create |
| `src/auth.ts` | Create — Auth.js config |
| `src/hooks.server.ts` | Modify — add Auth.js handle |
| `src/app.d.ts` | Modify — Auth.js types |
| `src/routes/+layout.server.ts` | Create — expose session |
| `src/routes/+layout.svelte` | Modify — login/logout nav |
| `src/lib/server/auth.ts` | Create — `requireAdmin` helper |
| `src/routes/admin/+page.server.ts` | Create — list + delete actions |
| `src/routes/admin/+page.svelte` | Create — admin dashboard |
| `src/routes/admin/espresso/[id]/edit/+page.server.ts` | Create |
| `src/routes/admin/espresso/[id]/edit/+page.svelte` | Create |
| `src/routes/admin/pourover/[id]/edit/+page.server.ts` | Create |
| `src/routes/admin/pourover/[id]/edit/+page.svelte` | Create |

## Verification

1. `npm run dev` — app starts without errors
2. Visit `/admin` while logged out — redirects to `/`
3. Sign in with Google (allowed email) — redirected to `/admin`, brews listed
4. Sign in with non-allowed Google account — rejected at sign-in
5. Delete a brew — row removed, page refreshes
6. Edit a brew — form pre-populated, save updates the record
7. `npm run check` — no TypeScript errors
