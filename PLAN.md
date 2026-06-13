# Coffee DB — Web App Plan

## Context

A public web app for tracking espresso and pourover recipes tied to specific coffee beans. Inspired by a community Reddit espresso spreadsheet with ~250 entries. The app is **public by design** — no login required to browse or submit. Spam prevention via Cloudflare Turnstile. Auth (Google OAuth) is a future addition, not MVP.

**Primary use case:** "Find all beans that people have used with my machine" — the app is a discovery tool, not just a recipe log. Users pick their machine, see what beans others have brewed on it, then drill into specific recipes.

---

## UX Flow

### Discovery path (primary)
1. **Landing page** — dual entry: search by bean OR browse by machine
2. **Machine view** — select a machine (e.g. "La Marzocco Linea Micra") → see all beans brewed on it, with brew count and avg rating. Optionally filter by roaster country (for availability — AU vs US).
3. **Bean page** — shows bean details + all brew recipes for it. Recipes grouped by espresso / pourover tabs. Each recipe card shows dose/yield/time/rating prominently, with grinder + setting as secondary info.
4. **Add brew** — from the bean page, pick espresso or pourover, fill out recipe form.

### Submission path
1. **Search for a bean** — autocomplete against existing beans
2. **Bean not found?** → "Add this bean" form (core fields: name, roaster, origin, roast level)
3. **From bean page** → "Add espresso recipe" or "Add pourover recipe"
4. **Recipe form** — core fields visible, advanced behind toggle, Turnstile on submit

---

## Tech Stack (decided)

- **Framework:** SvelteKit
- **Hosting:** Cloudflare Pages
- **Database:** Turso (libSQL/SQLite)
- **Bot protection:** Cloudflare Turnstile
- **Auth (post-MVP):** Auth.js or Lucia (Google OAuth)

---

## Database Schema

### `beans` — shared across brew types

```sql
CREATE TABLE beans (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  roaster         TEXT,
  origin          TEXT,
  roast_level     INTEGER,           -- 1 (lightest) to 5 (darkest)
  caffeine        TEXT DEFAULT 'full', -- 'full', 'decaf', 'half-caf'
  roast_date      TEXT,              -- ISO YYYY-MM-DD
  roaster_city    TEXT,
  roaster_country TEXT,
  weight_grams    REAL,
  price           REAL,
  currency        TEXT,              -- ISO 4217: USD, EUR, CAD, etc.
  product_url     TEXT,
  tasting_notes   TEXT,              -- free-text
  submitted_by    TEXT,              -- optional display name
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields (always visible):** `name`, `roaster`, `origin`, `roast_level`
**Advanced fields (behind toggle):** everything else

### `espresso_brews`

```sql
CREATE TABLE espresso_brews (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bean_id           TEXT NOT NULL REFERENCES beans(id),
  dose_grams        REAL NOT NULL,
  yield_grams       REAL NOT NULL,
  shot_time_seconds REAL,
  grind_setting     TEXT,
  rating            REAL CHECK (rating >= 1 AND rating <= 10),
  tasting_notes     TEXT,
  days_rested       INTEGER,
  espresso_machine  TEXT,
  grinder           TEXT,
  burr_set          TEXT,
  water_temp_c      REAL,
  basket            TEXT,
  pressure_profile  TEXT,
  brew_ratio        TEXT,            -- "1:2.5" (auto-computed, user-overridable)
  additional_notes  TEXT,
  submitted_by      TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields:** `espresso_machine`, `dose_grams`, `yield_grams`, `shot_time_seconds`, `grinder`, `grind_setting`, `rating`, `tasting_notes`
**Advanced fields:** `days_rested`, `burr_set`, `water_temp_c`, `basket`, `pressure_profile`, `brew_ratio`, `additional_notes`, `submitted_by`

Note: `espresso_machine` is the primary search/filter dimension — prominent in the form and in browse views. `grinder` + `grind_setting` are core but displayed as secondary info beneath the main recipe parameters.

### `pourover_brews`

```sql
CREATE TABLE pourover_brews (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bean_id             TEXT NOT NULL REFERENCES beans(id),
  dose_grams          REAL NOT NULL,
  water_grams         REAL,
  total_time_seconds  REAL,
  grind_setting       TEXT,
  dripper             TEXT,           -- "V60 02", "Chemex", "Kalita Wave 185"
  rating              REAL CHECK (rating >= 1 AND rating <= 10),
  tasting_notes       TEXT,
  days_rested         INTEGER,
  filter_type         TEXT,           -- "paper", "metal", "cloth"
  grinder             TEXT,
  burr_set            TEXT,
  kettle              TEXT,
  water_temp_c        REAL,
  bloom_time_seconds  REAL,
  bloom_water_grams   REAL,
  pour_count          INTEGER,
  pour_technique      TEXT,           -- "4:6 method", "Hoffmann", etc.
  brew_ratio          TEXT,           -- "1:15"
  additional_notes    TEXT,
  submitted_by        TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields:** `dripper`, `dose_grams`, `water_grams`, `total_time_seconds`, `grinder`, `grind_setting`, `rating`, `tasting_notes`
**Advanced fields:** everything else

Note: For pourover, `dripper` is the equivalent of espresso machine — the primary equipment dimension.

### Indexes

```sql
-- Bean search and dedup
CREATE INDEX idx_beans_name_roaster ON beans (name COLLATE NOCASE, roaster COLLATE NOCASE);
CREATE INDEX idx_beans_roaster ON beans (roaster COLLATE NOCASE);

-- Browse brews by bean
CREATE INDEX idx_espresso_brews_bean ON espresso_brews (bean_id);
CREATE INDEX idx_pourover_brews_bean ON pourover_brews (bean_id);

-- Browse recent
CREATE INDEX idx_espresso_brews_created ON espresso_brews (created_at DESC);
CREATE INDEX idx_pourover_brews_created ON pourover_brews (created_at DESC);

-- Top rated
CREATE INDEX idx_espresso_brews_rating ON espresso_brews (rating DESC);
CREATE INDEX idx_pourover_brews_rating ON pourover_brews (rating DESC);

-- Browse by machine/dripper (primary discovery use case)
CREATE INDEX idx_espresso_brews_machine ON espresso_brews (espresso_machine COLLATE NOCASE);
CREATE INDEX idx_pourover_brews_dripper ON pourover_brews (dripper COLLATE NOCASE);
```

### Full-Text Search (beans)

```sql
CREATE VIRTUAL TABLE beans_fts USING fts5(
  bean_id,
  name,
  roaster,
  origin,
  tasting_notes
);
```

Kept as a standalone FTS table (not external-content mode) to avoid rowid issues with Turso's TEXT primary keys. App code inserts into `beans_fts` alongside `beans`.

### Bean Dedup Strategy

- **On submission:** As user types a bean name, fuzzy-match against `beans_fts`. Show suggestions: "Did you mean one of these?"
- **If they pick an existing bean:** Link directly, no new row.
- **If they add new:** Allow it even if similar exists.
- **Post-MVP:** Admin merge tool — just `UPDATE brew SET bean_id = :canonical WHERE bean_id = :dupe`.

---

## Seed Data

5 diverse espresso brews from the community spreadsheet, covering different roasters, origins, equipment, and roast levels. See `src/lib/server/seed.sql` — beans created first, then espresso_brews linking to them.

| Bean | Roaster | Origin | Machine | Rating |
|---|---|---|---|---|
| Jairo Arcila Espresso | Monogram (Calgary, CA) | Colombia | ECM Synchronika | 9 |
| Honduras Comsa | Red Rooster (US) | Honduras | La Marzocco Linea Micra | 10 |
| 74158 Wollega Natural | Home Roast (Ukraine) | Ethiopia | La Marzocco Leva X | 8 |
| Berry Blues | DAK Coffee Roasters (Amsterdam, NL) | Ethiopia | Lelit Bianca | 10 |
| Chelchele | PERC (Savannah GA, US) | Ethiopia | Bambino Plus | 10 |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Separate espresso/pourover tables | Yes | Explicit fork — separate forms, separate browsing, separate search |
| Shared beans table | Yes | Bridge between brew types; same bean can have both espresso and pourover recipes |
| Machine as primary discovery dimension | Yes | Primary use case: "find beans for my machine" |
| Rating scale | 1-10 (REAL) | Matches community spreadsheet; allows half-points (7.5) |
| Equipment as inline TEXT | Yes | No user accounts in MVP = no equipment entity management. Simpler. |
| `grind_setting` as TEXT | Yes | Settings are incomparable across grinders ("1.75", "10", "3 clicks") |
| `brew_ratio` as TEXT | Yes | Auto-computed from dose/yield but user-overridable; preserves intent |
| TEXT primary keys (hex UUIDs) | Yes | Safe for distributed Turso replicas; no sequential ID enumeration |
| No auth in MVP | Yes | Public-first. Turnstile for spam. Auth adds later as optional "my brews" |

---

## Route Structure

```
src/routes/
  +page.svelte                    -- Landing: bean search + machine browse
  +page.server.ts                 -- Search action (FTS query), popular machines list
  machines/
    [name]/
      +page.svelte                -- Machine view: all beans brewed on this machine
      +page.server.ts             -- Query espresso_brews grouped by bean, with counts/avg ratings
  drippers/
    [name]/
      +page.svelte                -- Dripper view: all beans brewed with this dripper
      +page.server.ts             -- Query pourover_brews grouped by bean
  beans/
    new/
      +page.svelte                -- Add new bean form
      +page.server.ts             -- Insert bean + FTS sync
    [id]/
      +page.svelte                -- Bean detail: info + espresso/pourover brew lists
      +page.server.ts             -- Load bean + brews
      espresso/
        new/
          +page.svelte            -- Espresso brew form (core + advanced toggle)
          +page.server.ts         -- Turnstile verify + insert
      pourover/
        new/
          +page.svelte            -- Pourover brew form (core + advanced toggle)
          +page.server.ts         -- Turnstile verify + insert
  api/
    beans/
      search/
        +server.ts                -- GET: live search suggestions for bean autocomplete
    machines/
      +server.ts                  -- GET: distinct machine names for autocomplete
    drippers/
      +server.ts                  -- GET: distinct dripper names for autocomplete
```

## File Structure

```
src/
  lib/
    server/
      db.ts                       -- Turso client init (@libsql/client)
      schema.sql                  -- All CREATE TABLE / INDEX / FTS
      seed.sql                    -- Seed data INSERTs
    types.ts                      -- TS types: Bean, EspressoBrew, PouroverBrew
    components/
      BeanSearch.svelte           -- Search input with autocomplete
      BeanCard.svelte             -- Bean summary card (for search results)
      BrewForm.svelte             -- Shared form shell with core/advanced toggle
      EspressoFields.svelte       -- Espresso-specific form fields
      PouroverFields.svelte       -- Pourover-specific form fields
      RatingInput.svelte          -- 1-10 rating widget
      AdvancedToggle.svelte       -- "Show advanced fields" toggle
```

---

## Implementation Order

1. **Project scaffold** — `npm create svelte@latest`, Turso client setup, env vars
2. **Database** — schema.sql, seed.sql, db.ts, run migrations via Turso CLI
3. **Bean search + detail pages** — landing page search, bean detail view
4. **Machine/dripper browse** — machine view showing beans + brew counts
5. **Add bean flow** — "not found → add this bean" form
6. **Espresso brew form** — core/advanced toggle, Turnstile integration
7. **Pourover brew form** — same pattern, different fields
8. **Browse/filter** — recent brews, top rated, filter by roaster country
9. **Polish** — responsive design, loading states, error handling

---

## Verification

- Run `npm run dev` and test the full flow: search → bean page → add brew → see it listed
- Test machine browse: pick a machine → see beans → drill into recipes
- Submit with Turnstile in dev mode (test keys)
- Verify FTS search returns relevant results
- Confirm seed data displays correctly
- Test core/advanced toggle shows/hides correct fields
- Deploy to Cloudflare Pages and verify Turso connection works at the edge
