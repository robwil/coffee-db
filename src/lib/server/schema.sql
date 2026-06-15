CREATE TABLE IF NOT EXISTS machines (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS grinders (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS drippers (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  manufacturer    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS beans (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name            TEXT NOT NULL,
  roaster         TEXT,
  origin          TEXT,
  roast_level     INTEGER,
  caffeine        TEXT DEFAULT 'full',
  roaster_city    TEXT,
  roaster_country TEXT,
  weight_grams    REAL,
  price           REAL,
  currency        TEXT,
  product_url     TEXT,
  tasting_notes   TEXT,
  submitted_by    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS espresso_brews (
  id                       TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  bean_id                  TEXT NOT NULL REFERENCES beans(id),
  machine_id               TEXT REFERENCES machines(id),
  grinder_id               TEXT REFERENCES grinders(id),
  dose_grams               REAL NOT NULL,
  yield_grams              REAL NOT NULL,
  total_time_seconds       REAL,
  preinfusion_time_seconds REAL,
  grind_setting            TEXT,
  rating                   REAL CHECK (rating >= 1 AND rating <= 10),
  tasting_notes            TEXT,
  days_rested              INTEGER,
  burr_set                 TEXT,
  water_temp_c             REAL,
  basket                   TEXT,
  pressure_profile         TEXT,
  additional_notes         TEXT,
  submitted_by             TEXT,
  created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS pourover_brews (
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
  filter_type         TEXT,
  burr_set            TEXT,
  kettle              TEXT,
  water_temp_c        REAL,
  bloom_time_seconds  REAL,
  bloom_water_grams   REAL,
  pour_count          INTEGER,
  pour_technique      TEXT,
  additional_notes    TEXT,
  submitted_by        TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beans_name_roaster ON beans (name COLLATE NOCASE, roaster COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_beans_roaster ON beans (roaster COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_beans_country ON beans (roaster_country COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_beans_origin ON beans (origin COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_espresso_brews_bean ON espresso_brews (bean_id);
CREATE INDEX IF NOT EXISTS idx_pourover_brews_bean ON pourover_brews (bean_id);

CREATE INDEX IF NOT EXISTS idx_espresso_brews_created ON espresso_brews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pourover_brews_created ON pourover_brews (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_espresso_brews_rating ON espresso_brews (rating DESC);
CREATE INDEX IF NOT EXISTS idx_pourover_brews_rating ON pourover_brews (rating DESC);

CREATE INDEX IF NOT EXISTS idx_espresso_brews_machine ON espresso_brews (machine_id);
CREATE INDEX IF NOT EXISTS idx_espresso_brews_grinder ON espresso_brews (grinder_id);
CREATE INDEX IF NOT EXISTS idx_pourover_brews_dripper ON pourover_brews (dripper_id);
CREATE INDEX IF NOT EXISTS idx_pourover_brews_grinder ON pourover_brews (grinder_id);

CREATE INDEX IF NOT EXISTS idx_machines_name ON machines (name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_grinders_name ON grinders (name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_drippers_name ON drippers (name COLLATE NOCASE);

-- FTS5 full-text search on beans
CREATE VIRTUAL TABLE IF NOT EXISTS beans_fts USING fts5(
  name,
  roaster,
  origin,
  tasting_notes,
  content='beans',
  content_rowid='rowid'
);

-- Triggers to keep beans_fts in sync with beans
CREATE TRIGGER IF NOT EXISTS beans_fts_insert AFTER INSERT ON beans BEGIN
  INSERT INTO beans_fts(rowid, name, roaster, origin, tasting_notes)
  VALUES (new.rowid, new.name, new.roaster, new.origin, new.tasting_notes);
END;

CREATE TRIGGER IF NOT EXISTS beans_fts_delete AFTER DELETE ON beans BEGIN
  INSERT INTO beans_fts(beans_fts, rowid, name, roaster, origin, tasting_notes)
  VALUES ('delete', old.rowid, old.name, old.roaster, old.origin, old.tasting_notes);
END;

CREATE TRIGGER IF NOT EXISTS beans_fts_update AFTER UPDATE ON beans BEGIN
  INSERT INTO beans_fts(beans_fts, rowid, name, roaster, origin, tasting_notes)
  VALUES ('delete', old.rowid, old.name, old.roaster, old.origin, old.tasting_notes);
  INSERT INTO beans_fts(rowid, name, roaster, origin, tasting_notes)
  VALUES (new.rowid, new.name, new.roaster, new.origin, new.tasting_notes);
END;
