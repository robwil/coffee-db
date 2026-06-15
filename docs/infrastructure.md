# Infrastructure Setup

Coffee DB runs on **Cloudflare Pages** (hosting) with **Turso** (database). Turso is a hosted libSQL service — libSQL is a fork of SQLite that adds HTTP access and edge replication. Your existing SQLite schema works unchanged.

## Prerequisites

- Node.js 20+ (check with `node -v`)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- A [Turso account](https://turso.tech) (free tier: 500 databases, 9 GB storage, 25M row reads/month)

## 1. Install the CLIs

```fish
# Turso CLI
brew install tursodatabase/tap/turso

# Wrangler (Cloudflare CLI) — already a dev dependency, but useful globally too
npm install -g wrangler
```

Authenticate both:

```fish
turso auth login          # opens browser
wrangler login            # opens browser
```

## 2. Create the Turso database

```fish
# Create a database (pick a region close to your users)
# Run `turso db locations` to see available regions
turso db create coffee-db --location aws-ap-northeast-1    # Tokyo — closest to Brisbane

# Get the connection URL
turso db show coffee-db --url
# Output: libsql://coffee-db-<your-username>.turso.io

# Create an auth token
turso db tokens create coffee-db
# Output: a long JWT string — save this
```

## 3. Create Google OAuth credentials

Admin features (edit/delete brews) require Google sign-in, restricted to an email allowlist.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**
4. Application type: **Web application**
5. Add **Authorized JavaScript origins**:
   - Local dev: `http://localhost:5173`
   - Production: `https://your-domain.com`
6. Add **Authorized redirect URIs**:
   - Local dev: `http://localhost:5173/auth/callback/google`
   - Production: `https://your-domain.com/auth/callback/google`
7. Copy the **Client ID** and **Client secret**

## 4. Set up environment variables

Create a `.env` file for local development:

```fish
cp .env.example .env
```

Then fill in the values:

```
TURSO_DATABASE_URL=libsql://coffee-db-<your-username>.turso.io
TURSO_AUTH_TOKEN=<your-token-from-step-2>

AUTH_SECRET=<run: openssl rand -base64 33>
AUTH_GOOGLE_ID=<client-id-from-step-3>
AUTH_GOOGLE_SECRET=<client-secret-from-step-3>
ADMIN_EMAILS=you@example.com
```

`ADMIN_EMAILS` is a comma-separated list of Google emails allowed to sign in. Users not on the list are rejected at login.

For **local-only development** without a remote database, you can use Turso's local dev server instead:

```fish
turso dev --db-file data/coffee.db
# Starts a local HTTP server at http://127.0.0.1:8080
```

Then set your `.env` to:

```
TURSO_DATABASE_URL=http://127.0.0.1:8080
```

(No auth token needed for the local dev server.)

## 5. Initialize the remote database schema

Push your schema and seed data to the remote Turso database:

```fish
turso db shell coffee-db < src/lib/server/schema.sql
turso db shell coffee-db < src/lib/server/seed.sql
```

To export your existing local data instead of using seed data:

```fish
# Dump your local SQLite data
sqlite3 data/coffee.db .dump > /tmp/coffee-dump.sql

# Import into Turso (schema is included in the dump)
turso db shell coffee-db < /tmp/coffee-dump.sql
```

## 6. Install dependencies

The migration from `better-sqlite3` to `@libsql/client` has already been done in the codebase. Install the updated dependencies:

```fish
npm install
```

Key dependency changes:
- **Removed:** `better-sqlite3`, `@types/better-sqlite3` (Node.js native bindings — incompatible with Cloudflare Workers)
- **Added:** `@libsql/client` (works in both Node.js and Cloudflare Workers)
- **Added:** `@sveltejs/adapter-cloudflare` (replaces `adapter-auto`)

## 7. Run locally

```fish
npm run dev
```

The app connects to whatever `TURSO_DATABASE_URL` points to in your `.env`. For local development, either:
- Point at the remote Turso database (simplest — shared state, needs internet)
- Run `turso dev --db-file data/coffee.db` and point at `http://127.0.0.1:8080` (offline-capable, uses your local data)

## 8. Deploy to Cloudflare Pages

### First-time setup

```fish
# Create the Pages project (connects to your Git repo)
wrangler pages project create coffee-db

# Or deploy directly from the build output
npm run build
wrangler pages deploy .svelte-kit/cloudflare
```

Alternatively, connect via the Cloudflare dashboard:
1. Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
2. Select your repository
3. Set build command: `npm run build`
4. Set build output directory: `.svelte-kit/cloudflare`

### Set environment variables in Cloudflare

`TURSO_DATABASE_URL` is set in `wrangler.toml` under `[vars]` — update the placeholder with your actual Turso URL.

Secrets must be set via the dashboard (Settings > Environment variables > Add secret) or CLI. These are encrypted and not committed to source:

```fish
wrangler pages secret put TURSO_AUTH_TOKEN
wrangler pages secret put AUTH_SECRET
wrangler pages secret put AUTH_GOOGLE_ID
wrangler pages secret put AUTH_GOOGLE_SECRET
wrangler pages secret put ADMIN_EMAILS
```

Each command prompts for the value interactively. This sets the secret for all environments (production and preview) at once.

### Subsequent deploys

If connected to Git, pushes to `main` trigger automatic deploys. For manual deploys:

```fish
npm run build && npm run deploy
```

## 9. Custom domain (optional)

In the Cloudflare dashboard, go to your Pages project > **Custom domains** > **Set up a custom domain**. If the domain is already on Cloudflare DNS, it provisions automatically.

---

## Architecture overview

```
Browser
  │
  ▼
Cloudflare Pages (edge)
  │  SvelteKit app (SSR on Cloudflare Workers)
  │
  ▼
Turso (libSQL)
  │  Primary database (single region)
  │  Optional: read replicas at the edge
```

- **Cloudflare Pages** serves the SvelteKit app. Server-side code runs on Cloudflare Workers (V8 isolates, not Node.js).
- **Turso** hosts the SQLite database over HTTP. The `@libsql/client` library handles the connection, including automatic retries and connection pooling.
- For local dev, `@libsql/client` can connect to either a remote Turso database or a local dev server via HTTP.

## Key files

| File | Purpose |
|---|---|
| `wrangler.toml` | Cloudflare Pages configuration (compatibility flags, public vars) |
| `.env.example` | Template for local environment variables |
| `src/lib/server/db.ts` | Database client — creates a `@libsql/client` instance from env vars |
| `src/auth.ts` | Auth.js configuration — Google provider, email allowlist callback |
| `src/lib/server/auth.ts` | `requireAdmin()` helper — guards admin routes |
| `vite.config.ts` | Uses `@sveltejs/adapter-cloudflare` for production builds |

## Turso CLI cheat sheet

```fish
turso db list                          # List databases
turso db show coffee-db                # Show details + URL
turso db show coffee-db --url          # Just the URL
turso db shell coffee-db               # Interactive SQL shell
turso db tokens create coffee-db       # Create auth token
turso db inspect coffee-db             # Storage stats
turso db destroy coffee-db             # Delete (irreversible!)
turso dev --db-file data/coffee.db     # Local dev server
```

## Troubleshooting

**"SQLITE_ERROR: no such table"** — The remote database hasn't been initialized. Run `turso db shell coffee-db < src/lib/server/schema.sql`.

**Connection refused on local dev** — Make sure `turso dev` is running if your `.env` points to `http://127.0.0.1:8080`.

**Build fails with native module errors** — You may still have `better-sqlite3` in `node_modules`. Run `rm -rf node_modules && npm install`.

**Deploy fails with "compatibility" errors** — Check that `wrangler.toml` has `compatibility_flags = ["nodejs_compat"]`. The `@libsql/client` library needs this flag on Cloudflare Workers.
