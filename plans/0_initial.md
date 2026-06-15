# Coffee DB — Web App Plan

## Context

A public web app for tracking espresso and pourover recipes tied to specific coffee beans. Inspired by a community Reddit espresso spreadsheet with ~250 entries. The app is **public by design** — no login required to browse or submit. Spam prevention via Cloudflare Turnstile. Auth (Google OAuth) is a future addition, not MVP.

See @USE_CASES.md for important use cases.

---

## UX Flow

### Discovery path (primary)
1. **Landing page** — search by bean, or jump to the browse page
2. **Browse page** — single filterable view of all brews. Filters: machine, dripper, grinder, roaster, origin, roaster country. Filters are combinable (e.g. "La Marzocco Linea Micra" + "Ethiopia" → all Ethiopian beans brewed on that machine). Shows beans with brew count and avg rating. Each use case maps to a filter combination:
   - *Home Barista:* filter by machine → see what beans others brew on it
   - *Roaster Fanboy:* filter by roaster → see recipes across machines, compare approaches
   - *Single Origin Snob:* filter by origin → see only beans from their preferred country
   
   **Espresso vs pourover scoping:** No explicit brew type toggle. Filtering by machine implicitly returns espresso brews; filtering by dripper implicitly returns pourover brews. Cross-type filters (roaster, origin, country, grinder) return both brew types — result cards indicate which type each brew is. Combining machine + dripper returns empty results (expected, since no brew has both).
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

### `machines`

```sql
CREATE TABLE machines (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

### `grinders`

```sql
CREATE TABLE grinders (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

### `drippers`

```sql
CREATE TABLE drippers (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

### `beans` — shared across brew types

```sql
CREATE TABLE beans (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  roaster         TEXT,
  origin          TEXT,              -- dropdown: country name, "Blend", or "Other"
  roast_level     INTEGER,           -- 1 (lightest) to 5 (darkest)
  caffeine        TEXT DEFAULT 'full', -- 'full', 'decaf', 'half-caf'
  roaster_city    TEXT,
  roaster_country TEXT,
  weight_grams    REAL,              -- bag size in grams (250, 500, 1000, etc.)
  price           REAL,              -- price for the listed weight_grams
  currency        TEXT,              -- ISO 4217: USD, EUR, CAD, etc.
  product_url     TEXT,
  tasting_notes   TEXT,              -- free-text
  submitted_by    TEXT,              -- optional display name
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields (always visible):** `name`, `roaster`, `origin`, `roast_level`, `roaster_country`, `tasting_notes`
**Advanced fields (behind toggle):** everything else

Note: `origin` is presented as a dropdown of common coffee-producing countries (Ethiopia, Colombia, Brazil, Kenya, Guatemala, etc.) with "Blend" and "Other" options for data cleanliness. `weight_grams` and `price` reflect a single bag size chosen by the submitter — different bag sizes (250g, 500g, 1kg) at different price points are expected; submitters pick whichever they purchased.

### `espresso_brews`

```sql
CREATE TABLE espresso_brews (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bean_id           TEXT NOT NULL REFERENCES beans(id),
  machine_id        TEXT REFERENCES machines(id),
  grinder_id        TEXT REFERENCES grinders(id),
  dose_grams        REAL NOT NULL,
  yield_grams       REAL NOT NULL,
  total_time_seconds      REAL,        -- total brew time including pre-infusion
  preinfusion_time_seconds REAL,       -- optional; must be < total_time_seconds
  grind_setting     TEXT,
  rating            REAL CHECK (rating >= 1 AND rating <= 10),
  tasting_notes     TEXT,
  days_rested       INTEGER,
  burr_set          TEXT,
  water_temp_c      REAL,
  basket            TEXT,
  pressure_profile  TEXT,
  additional_notes  TEXT,
  submitted_by      TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields:** `machine_id`, `dose_grams`, `yield_grams`, `total_time_seconds`, `grinder_id`, `grind_setting`, `rating`, `tasting_notes`
**Advanced fields:** `preinfusion_time_seconds`, `days_rested`, `burr_set`, `water_temp_c`, `basket`, `pressure_profile`, `additional_notes`, `submitted_by`

Note: `machine_id` references the `machines` table and is the primary search/filter dimension — prominent in the form and in browse views. `grinder_id` references the `grinders` table; `grind_setting` remains free text since settings are incomparable across grinder models. Brew ratio is not stored — it's computed from dose/yield at display time. `total_time_seconds` is inclusive of pre-infusion; `preinfusion_time_seconds` is optional and shown below total time in the form. Post-infusion time (total minus pre-infusion) can be computed at display time.

### `pourover_brews`

```sql
CREATE TABLE pourover_brews (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bean_id             TEXT NOT NULL REFERENCES beans(id),
  dripper_id          TEXT REFERENCES drippers(id),
  grinder_id          TEXT REFERENCES grinders(id),
  dose_grams          REAL NOT NULL,
  water_grams         REAL,
  total_time_seconds  REAL,
  grind_setting       TEXT,
  rating              REAL CHECK (rating >= 1 AND rating <= 10),
  tasting_notes       TEXT,
  days_rested         INTEGER,
  filter_type         TEXT,           -- "paper", "metal", "cloth"
  burr_set            TEXT,
  kettle              TEXT,
  water_temp_c        REAL,
  bloom_time_seconds  REAL,
  bloom_water_grams   REAL,
  pour_count          INTEGER,
  pour_technique      TEXT,           -- "4:6 method", "Hoffmann", etc.
  additional_notes    TEXT,
  submitted_by        TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

**Core fields:** `dripper_id`, `dose_grams`, `water_grams`, `total_time_seconds`, `grinder_id`, `grind_setting`, `rating`, `tasting_notes`
**Advanced fields:** everything else

Note: `dripper_id` references the `drippers` table and is the primary equipment dimension for pourover (equivalent of machine for espresso). `grinder_id` references the `grinders` table. Brew ratio is not stored — it's computed from dose/water at display time.

### Indexes

```sql
-- Bean search and dedup
CREATE INDEX idx_beans_name_roaster ON beans (name COLLATE NOCASE, roaster COLLATE NOCASE);
CREATE INDEX idx_beans_roaster ON beans (roaster COLLATE NOCASE);
CREATE INDEX idx_beans_country ON beans (roaster_country COLLATE NOCASE);
CREATE INDEX idx_beans_origin ON beans (origin COLLATE NOCASE);

-- Browse brews by bean
CREATE INDEX idx_espresso_brews_bean ON espresso_brews (bean_id);
CREATE INDEX idx_pourover_brews_bean ON pourover_brews (bean_id);

-- Browse recent
CREATE INDEX idx_espresso_brews_created ON espresso_brews (created_at DESC);
CREATE INDEX idx_pourover_brews_created ON pourover_brews (created_at DESC);

-- Top rated
CREATE INDEX idx_espresso_brews_rating ON espresso_brews (rating DESC);
CREATE INDEX idx_pourover_brews_rating ON pourover_brews (rating DESC);

-- Browse by machine/dripper/grinder (primary discovery use case)
CREATE INDEX idx_espresso_brews_machine ON espresso_brews (machine_id);
CREATE INDEX idx_espresso_brews_grinder ON espresso_brews (grinder_id);
CREATE INDEX idx_pourover_brews_dripper ON pourover_brews (dripper_id);
CREATE INDEX idx_pourover_brews_grinder ON pourover_brews (grinder_id);

-- Equipment name lookups
CREATE INDEX idx_machines_name ON machines (name COLLATE NOCASE);
CREATE INDEX idx_grinders_name ON grinders (name COLLATE NOCASE);
CREATE INDEX idx_drippers_name ON drippers (name COLLATE NOCASE);
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

### Equipment Dedup Strategy

Same pattern as beans. When submitting a brew, equipment fields (machine, grinder, dripper) use autocomplete against existing entries. Fuzzy-match shows suggestions; if the user picks an existing one, link by FK. If not found, create a new row on-the-fly. Post-MVP admin merge applies here too.

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
| Single browse page with filters | Yes | Machine, roaster, origin, dripper, grinder as combinable filters on one page — covers all discovery use cases without duplicating routes |
| Equipment created on-the-fly | Yes | Same fuzzy-match-or-create pattern as beans — no separate equipment entry forms needed |
| Rating scale | 1-10 (REAL) | Matches community spreadsheet; allows half-points (7.5) |
| Separate equipment tables | Yes | `machines`, `grinders`, `drippers` as distinct tables — cleaner if fields diverge later, referenced by FK from brew tables |
| `grind_setting` as TEXT | Yes | Settings are incomparable across grinders ("1.75", "10", "3 clicks") |
| No stored `brew_ratio` | Yes | Computed from dose/yield (or dose/water for pourover) at display time — no risk of stale data |
| `origin` as constrained dropdown | Yes | Country dropdown (Ethiopia, Colombia, etc.) + "Blend" / "Other" for data cleanliness |
| TEXT primary keys (hex UUIDs) | Yes | Safe for distributed Turso replicas; no sequential ID enumeration |
| No auth in MVP | Yes | Public-first. Turnstile for spam. Auth adds later as optional "my brews" |

---

## Route Structure

```
src/routes/
  +page.svelte                    -- Landing: bean search + link to browse
  +page.server.ts                 -- Search action (FTS query)
  browse/
    +page.svelte                  -- Filterable browse: machine, dripper, grinder, roaster, origin, country
    +page.server.ts               -- Query brews with filters, grouped by bean, with counts/avg ratings
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
      +server.ts                  -- GET: machine search/autocomplete from machines table
    grinders/
      +server.ts                  -- GET: grinder search/autocomplete from grinders table
    drippers/
      +server.ts                  -- GET: dripper search/autocomplete from drippers table
```

## File Structure

```
src/
  lib/
    server/
      db.ts                       -- Turso client init (@libsql/client)
      schema.sql                  -- All CREATE TABLE / INDEX / FTS
      seed.sql                    -- Seed data INSERTs
    types.ts                      -- TS types: Bean, EspressoBrew, PouroverBrew, Machine, Grinder, Dripper
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

---

## Follow-Up Items

Items deferred during initial implementation — not blockers, but worth addressing before deployment.

1. **FTS search** — → Addressed in `2_follow_ups.md`
2. **Cloudflare Turnstile integration** — → Addressed in `2_follow_ups.md`
3. **Turso / libSQL migration** — ✅ Already done (using `@libsql/client`)
4. **Cloudflare Pages adapter** — ✅ Already done (using `adapter-cloudflare`)
5. **Bean dedup UX** — → Addressed in `2_follow_ups.md`
6. **Error handling on forms** — → Addressed in `2_follow_ups.md`
7. **Loading states** — → Addressed in `2_follow_ups.md`
8. **Responsive testing** — ✅ Already done (mobile fixes implemented)
9. **Node version compatibility** — → Addressed in `2_follow_ups.md`
