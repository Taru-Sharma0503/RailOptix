/*
# Create Users, Stations, and Corridors Tables

1. New Tables
- `users` — Application users (operators, planners, admins).
  - id (text, primary key) — e.g., "USR-001"
  - name (text, not null)
  - email (text, unique, not null)
  - password_hash (text, not null) — bcrypt hash, never returned in API responses
  - role (text, not null) — "operator" | "planner" | "admin" | "viewer"
  - department_id (text, FK to departments.id)
  - created_at (timestamptz, default now())

- `stations` — Railway stations with geographic coordinates.
  - id (text, primary key) — e.g., "ST-001"
  - name (text, not null)
  - latitude (double precision, not null)
  - longitude (double precision, not null)
  - corridor_id (text) — optional link to corridor
  - location (geography(Point, 4326)) — PostGIS point derived from lat/lng
  - created_at (timestamptz, default now())

- `corridors` — Railway corridors connecting stations.
  - id (text, primary key) — e.g., "COR-001"
  - name (text, not null)
  - status (text, not null, default 'active') — "active" | "inactive" | "maintenance"
  - length_km (integer, not null)
  - created_at (timestamptz, default now())

2. Indexes
- users: email (unique index already from constraint)
- stations: corridor_id
- corridors: status

3. Security
- Enable RLS on all three tables.
- Allow anon + authenticated full CRUD (prototype with shared data).
*/

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'operator',
  department_id text REFERENCES departments(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS corridors (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  length_km integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE corridors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_corridors" ON corridors;
CREATE POLICY "anon_select_corridors" ON corridors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_corridors" ON corridors;
CREATE POLICY "anon_insert_corridors" ON corridors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_corridors" ON corridors;
CREATE POLICY "anon_update_corridors" ON corridors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_corridors" ON corridors;
CREATE POLICY "anon_delete_corridors" ON corridors FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS stations (
  id text PRIMARY KEY,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  corridor_id text REFERENCES corridors(id),
  location geography(Point, 4326),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stations" ON stations;
CREATE POLICY "anon_select_stations" ON stations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stations" ON stations;
CREATE POLICY "anon_insert_stations" ON stations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stations" ON stations;
CREATE POLICY "anon_update_stations" ON stations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stations" ON stations;
CREATE POLICY "anon_delete_stations" ON stations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_stations_corridor_id ON stations(corridor_id);
CREATE INDEX IF NOT EXISTS idx_corridors_status ON corridors(status);
