/*
# Enable PostGIS and Create Departments Table

1. Extensions
- Enable PostGIS extension for spatial/geography data support.

2. New Tables
- `departments` — Railway maintenance departments (Engineering, S&T, Traction).
  - id (text, primary key) — e.g., "DEP-ENG"
  - name (text, not null) — display name
  - code (text, unique, not null) — short code
  - created_at (timestamptz, default now())

3. Security
- Enable RLS on `departments`.
- Allow anon + authenticated full CRUD (prototype app with shared reference data).
*/

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_departments" ON departments;
CREATE POLICY "anon_select_departments" ON departments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_departments" ON departments;
CREATE POLICY "anon_insert_departments" ON departments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_departments" ON departments;
CREATE POLICY "anon_update_departments" ON departments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_departments" ON departments;
CREATE POLICY "anon_delete_departments" ON departments FOR DELETE
  TO anon, authenticated USING (true);
