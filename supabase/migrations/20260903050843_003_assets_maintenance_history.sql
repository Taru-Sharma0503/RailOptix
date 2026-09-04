/*
# Create Assets, Maintenance Tasks, and Maintenance History Tables

1. New Tables
- `assets` — Railway infrastructure assets (tracks, signals, OHE, bridges, turnouts).
  - id (text, primary key) — e.g., "AST-001"
  - name (text, not null)
  - type (text, not null) — "track" | "signal" | "ohe" | "bridge" | "turnout"
  - corridor_id (text, FK to corridors.id)
  - criticality (integer, not null, 1-10 scale)
  - condition (text, not null) — "healthy" | "warning" | "critical"
  - defect_severity (integer, default 0, 0-10 scale)
  - installation_date (date) — for age calculation
  - latitude (double precision)
  - longitude (double precision)
  - location (geography(Point, 4326)) — PostGIS point
  - created_at (timestamptz, default now())

- `maintenance_tasks` — Scheduled and pending maintenance work.
  - id (text, primary key) — e.g., "MT-001"
  - asset_id (text, FK to assets.id, not null)
  - department_id (text, FK to departments.id)
  - description (text, not null)
  - severity (integer, not null, 1-10 scale)
  - estimated_duration (integer, not null) — minutes
  - deadline (date)
  - safety_risk (integer, default 5, 1-10 scale)
  - status (text, not null, default 'pending') — "pending" | "scheduled" | "in_progress" | "completed" | "cancelled"
  - priority_score (double precision, default 0) — calculated by priority service
  - failure_risk (double precision, default 0) — calculated risk 0-1
  - external_id (text) — for imported tasks
  - source (text) — import source system, e.g., "SMMS"
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

- `maintenance_history` — Completed maintenance records.
  - id (text, primary key) — e.g., "MH-001"
  - asset_id (text, FK to assets.id, not null)
  - task_id (text, FK to maintenance_tasks.id)
  - department_id (text, FK to departments.id)
  - description (text, not null)
  - type (text, not null) — "maintenance" | "inspection" | "failure" | "repair"
  - status (text, not null, default 'completed')
  - performed_at (timestamptz, not null)
  - duration_minutes (integer)
  - cost (numeric)
  - notes (text)
  - created_at (timestamptz, default now())

2. Indexes
- assets: corridor_id, type, condition
- maintenance_tasks: asset_id, department_id, status, deadline
- maintenance_history: asset_id, task_id, performed_at

3. Security
- Enable RLS on all tables. Allow anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  corridor_id text REFERENCES corridors(id),
  criticality integer NOT NULL DEFAULT 5,
  condition text NOT NULL DEFAULT 'healthy',
  defect_severity integer NOT NULL DEFAULT 0,
  installation_date date,
  latitude double precision,
  longitude double precision,
  location geography(Point, 4326),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assets" ON assets;
CREATE POLICY "anon_select_assets" ON assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assets" ON assets;
CREATE POLICY "anon_insert_assets" ON assets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assets" ON assets;
CREATE POLICY "anon_update_assets" ON assets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assets" ON assets;
CREATE POLICY "anon_delete_assets" ON assets FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_assets_corridor_id ON assets(corridor_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON assets(condition);

CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id text PRIMARY KEY,
  asset_id text NOT NULL REFERENCES assets(id),
  department_id text REFERENCES departments(id),
  description text NOT NULL,
  severity integer NOT NULL DEFAULT 5,
  estimated_duration integer NOT NULL DEFAULT 60,
  deadline date,
  safety_risk integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'pending',
  priority_score double precision NOT NULL DEFAULT 0,
  failure_risk double precision NOT NULL DEFAULT 0,
  external_id text,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "anon_select_maintenance_tasks" ON maintenance_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "anon_insert_maintenance_tasks" ON maintenance_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "anon_update_maintenance_tasks" ON maintenance_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "anon_delete_maintenance_tasks" ON maintenance_tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_mt_asset_id ON maintenance_tasks(asset_id);
CREATE INDEX IF NOT EXISTS idx_mt_department_id ON maintenance_tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_mt_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mt_deadline ON maintenance_tasks(deadline);

CREATE TABLE IF NOT EXISTS maintenance_history (
  id text PRIMARY KEY,
  asset_id text NOT NULL REFERENCES assets(id),
  task_id text REFERENCES maintenance_tasks(id),
  department_id text REFERENCES departments(id),
  description text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  performed_at timestamptz NOT NULL,
  duration_minutes integer,
  cost numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_maintenance_history" ON maintenance_history;
CREATE POLICY "anon_select_maintenance_history" ON maintenance_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_maintenance_history" ON maintenance_history;
CREATE POLICY "anon_insert_maintenance_history" ON maintenance_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_maintenance_history" ON maintenance_history;
CREATE POLICY "anon_update_maintenance_history" ON maintenance_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_maintenance_history" ON maintenance_history;
CREATE POLICY "anon_delete_maintenance_history" ON maintenance_history FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_mh_asset_id ON maintenance_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_mh_task_id ON maintenance_history(task_id);
CREATE INDEX IF NOT EXISTS idx_mh_performed_at ON maintenance_history(performed_at);
