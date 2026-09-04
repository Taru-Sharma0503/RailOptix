/*
# Create id_counters Table

1. Purpose
Provides atomic, race-safe sequential ID generation for prefixed IDs
(AST-, MT-, BLK-, CON-, OPT-, SIM-, SIMR-, HF-, MH-, MP-) via a single
INSERT ... ON CONFLICT ... RETURNING statement, replacing the previous
"SELECT COUNT(*) + 1" pattern which was subject to race conditions
under concurrent requests.

2. New Tables
- `id_counters`
  - prefix (text, primary key) — e.g. "AST", "MT"
  - next_value (integer, not null, default 1)

3. Security
- Enable RLS. Allow anon + authenticated full CRUD (matches the rest
  of this prototype's permissive policy).
*/

CREATE TABLE IF NOT EXISTS id_counters (
  prefix text PRIMARY KEY,
  next_value integer NOT NULL DEFAULT 1
);

ALTER TABLE id_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_id_counters" ON id_counters;
CREATE POLICY "anon_select_id_counters" ON id_counters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_id_counters" ON id_counters;
CREATE POLICY "anon_insert_id_counters" ON id_counters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_id_counters" ON id_counters;
CREATE POLICY "anon_update_id_counters" ON id_counters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);