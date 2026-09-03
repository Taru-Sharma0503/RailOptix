/*
# Create Blocks, Block Requests, and Conflicts Tables

1. New Tables
- `blocks` — Block requests/windows for maintenance corridor access.
  - id (text, primary key) — e.g., "BLK-001"
  - corridor_id (text, FK to corridors.id, not null)
  - department_id (text, FK to departments.id, not null)
  - date (date, not null) — block date
  - start_time (text, not null) — "HH:MM"
  - end_time (text, not null) — "HH:MM"
  - reason (text)
  - status (text, not null, default 'pending') — "pending" | "approved" | "rejected" | "active" | "completed"
  - maintenance_task_ids (text[]) — array of task IDs
  - duration_minutes (integer) — computed duration
  - created_at (timestamptz, default now())

- `conflicts` — Detected conflicts between block requests and/or train schedules.
  - id (text, primary key) — e.g., "CON-001"
  - corridor_id (text, FK to corridors.id)
  - date (date, not null)
  - type (text, not null) — "block_overlap" | "train_conflict" | "deadline_miss" | "resource_conflict"
  - severity (text, not null, default 'medium') — "low" | "medium" | "high"
  - status (text, not null, default 'open') — "open" | "negotiating" | "resolved" | "dismissed"
  - block_ids (text[]) — involved block IDs
  - department_ids (text[]) — involved departments
  - description (text)
  - resolution (jsonb) — stored resolution details
  - created_at (timestamptz, default now())
  - resolved_at (timestamptz)

2. Indexes
- blocks: corridor_id, department_id, date, status
- conflicts: corridor_id, date, status

3. Security
- Enable RLS on all tables. Allow anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS blocks (
  id text PRIMARY KEY,
  corridor_id text NOT NULL REFERENCES corridors(id),
  department_id text NOT NULL REFERENCES departments(id),
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  maintenance_task_ids text[] DEFAULT '{}',
  duration_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blocks" ON blocks;
CREATE POLICY "anon_select_blocks" ON blocks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blocks" ON blocks;
CREATE POLICY "anon_insert_blocks" ON blocks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blocks" ON blocks;
CREATE POLICY "anon_update_blocks" ON blocks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blocks" ON blocks;
CREATE POLICY "anon_delete_blocks" ON blocks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blocks_corridor_id ON blocks(corridor_id);
CREATE INDEX IF NOT EXISTS idx_blocks_department_id ON blocks(department_id);
CREATE INDEX IF NOT EXISTS idx_blocks_date ON blocks(date);
CREATE INDEX IF NOT EXISTS idx_blocks_status ON blocks(status);

CREATE TABLE IF NOT EXISTS conflicts (
  id text PRIMARY KEY,
  corridor_id text REFERENCES corridors(id),
  date date NOT NULL,
  type text NOT NULL DEFAULT 'block_overlap',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  block_ids text[] DEFAULT '{}',
  department_ids text[] DEFAULT '{}',
  description text,
  resolution jsonb,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conflicts" ON conflicts;
CREATE POLICY "anon_select_conflicts" ON conflicts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conflicts" ON conflicts;
CREATE POLICY "anon_insert_conflicts" ON conflicts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conflicts" ON conflicts;
CREATE POLICY "anon_update_conflicts" ON conflicts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conflicts" ON conflicts;
CREATE POLICY "anon_delete_conflicts" ON conflicts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_conflicts_corridor_id ON conflicts(corridor_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_date ON conflicts(date);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
