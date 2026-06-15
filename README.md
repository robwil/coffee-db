# Coffee DB

Community espresso and pourover recipes for every bean. A public web app for tracking brew recipes tied to specific coffee beans — no login required to browse or submit.

## Development

```sh
npm install

# Start the local database server (serves data/coffee.db over HTTP)
turso dev --db-file data/coffee.db

# In another terminal
npm run dev
```

Install the Turso CLI with `brew install tursodatabase/tap/turso` if you don't have it.

The local dev server uses the SQLite file at `data/coffee.db`. Schema and seed data are applied automatically on startup. To connect to a remote Turso database instead, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in `.env`.

## Deployment

See [docs/infrastructure.md](docs/infrastructure.md) for full Cloudflare Pages + Turso setup instructions.

## Tech Stack

- **Framework:** SvelteKit
- **Database:** Turso (libSQL/SQLite)
- **Hosting:** Cloudflare Pages
- **Bot protection:** Cloudflare Turnstile (planned)
