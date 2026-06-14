# Coffee DB

Community espresso and pourover recipes for every bean. A public web app for tracking brew recipes tied to specific coffee beans — no login required to browse or submit.

## Development

```sh
npm install
npm run dev
```

The app uses a local SQLite database at `data/coffee.db`, created and seeded automatically on first run.

## Tech Stack

- **Framework:** SvelteKit
- **Database:** SQLite (better-sqlite3 for local dev, Turso for production)
- **Hosting:** Cloudflare Pages (planned)
- **Bot protection:** Cloudflare Turnstile (planned)
