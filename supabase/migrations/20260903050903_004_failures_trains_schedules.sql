/*
# Create Historical Failures, Trains, and Train Schedules Tables

1. New Tables
- `historical_failures` — Past asset failure records for risk calculation.
  - id (text, primary key) — e.g., "HF-001"
  - asset_id (text, FK to assets.id, not null)
  - failure_type (text, not null)
  - failure_date (date, not null)
  - downtime_hours (integer, not null)
  - root_cause (text)
  - resolution (text)
  - created_at (timestamptz, default now())

- `trains` — Train definitions.
  - id (text, primary key) — e.g., "TR-001"
  - name (text, not null)
  - number (text, unique, not null) — train number
  - type (text, not null) — "express" | "passenger" | "freight" | "superfast"
  - priority (integer, not null, default 5) — 1-10, higher = more important
  - corridor_id (text, FK to corridors.id)
  - created_at (timestamptz, default now())

- `train_schedules` — Scheduled train runs on specific dates.
  - id (text, primary key) — e.g., "TS-001"
  - train_id (text, FK to trains.id, not null)
  - corridor_id (text, FK to corridors.id)
  - schedule_date (date, not null)
  - arrival_time (text, not null) — "HH:MM" format
  - departure_time (text, not null) — "HH:MM" format
  - direction (text, not null) — "up" | "down"
  - created_at (timestamptz, default now())

2. Indexes
- historical_failures: asset_id, failure_date
- trains: corridor_id, type
- train_schedules: train_id, corridor_id, schedule_date

3. Security
- Enable RLS on all tables. Allow anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS historical_failures (
  id text PRIMARY KEY,
  asset_id text NOT NULL REFERENCES assets(id),
  failure_type text NOT NULL,
  failure_date date NOT NULL,
  downtime_hours integer NOT NULL DEFAULT 0,
  root_cause text,
  resolution text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historical_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_historical_failures" ON historical_failures;
CREATE POLICY "anon_select_historical_failures" ON historical_failures FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_historical_failures" ON historical_failures;
CREATE POLICY "anon_insert_historical_failures" ON historical_failures FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_historical_failures" ON historical_failures;
CREATE POLICY "anon_update_historical_failures" ON historical_failures FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_historical_failures" ON historical_failures;
CREATE POLICY "anon_delete_historical_failures" ON historical_failures FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hf_asset_id ON historical_failures(asset_id);
CREATE INDEX IF NOT EXISTS idx_hf_failure_date ON historical_failures(failure_date);

CREATE TABLE IF NOT EXISTS trains (
  id text PRIMARY KEY,
  name text NOT NULL,
  number text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'passenger',
  priority integer NOT NULL DEFAULT 5,
  corridor_id text REFERENCES corridors(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_trains" ON trains;
CREATE POLICY "anon_select_trains" ON trains FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_trains" ON trains;
CREATE POLICY "anon_insert_trains" ON trains FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_trains" ON trains;
CREATE POLICY "anon_update_trains" ON trains FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_trains" ON trains;
CREATE POLICY "anon_delete_trains" ON trains FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_trains_corridor_id ON trains(corridor_id);
CREATE INDEX IF NOT EXISTS idx_trains_type ON trains(type);

CREATE TABLE IF NOT EXISTS train_schedules (
  id text PRIMARY KEY,
  train_id text NOT NULL REFERENCES trains(id),
  corridor_id text REFERENCES corridors(id),
  schedule_date date NOT NULL,
  arrival_time text NOT NULL,
  departure_time text NOT NULL,
  direction text NOT NULL DEFAULT 'up',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE train_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_train_schedules" ON train_schedules;
CREATE POLICY "anon_select_train_schedules" ON train_schedules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_train_schedules" ON train_schedules;
CREATE POLICY "anon_insert_train_schedules" ON train_schedules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_train_schedules" ON train_schedules;
CREATE POLICY "anon_update_train_schedules" ON train_schedules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_train_schedules" ON train_schedules;
CREATE POLICY "anon_delete_train_schedules" ON train_schedules FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ts_train_id ON train_schedules(train_id);
CREATE INDEX IF NOT EXISTS idx_ts_corridor_id ON train_schedules(corridor_id);
CREATE INDEX IF NOT EXISTS idx_ts_schedule_date ON train_schedules(schedule_date);
