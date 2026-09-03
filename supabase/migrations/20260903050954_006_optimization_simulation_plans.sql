/*
# Create Optimization and Simulation Tables

1. New Tables
- `optimization_runs` — Optimization execution records.
  - id (text, primary key) — e.g., "OPT-001"
  - corridor_id (text, FK to corridors.id)
  - planning_date (date)
  - status (text, not null, default 'queued') — "queued" | "running" | "completed" | "failed"
  - progress (integer, default 0) — 0-100
  - message (text) — current status message
  - objective (jsonb) — objective weights
  - task_ids (text[]) — input maintenance task IDs
  - block_ids (text[]) — input block IDs
  - result (jsonb) — full optimization result (schedule, metrics, explanation)
  - created_at (timestamptz, default now())
  - completed_at (timestamptz)

- `optimization_schedules` — Individual schedule entries from an optimization run.
  - id (text, primary key) — e.g., "OSC-001"
  - optimization_run_id (text, FK to optimization_runs.id, not null)
  - maintenance_task_id (text, FK to maintenance_tasks.id)
  - block_id (text, FK to blocks.id)
  - start_time (text) — "HH:MM"
  - end_time (text) — "HH:MM"
  - score (double precision, default 0) — candidate score
  - created_at (timestamptz, default now())

- `simulation_scenarios` — What-if simulation scenarios.
  - id (text, primary key) — e.g., "SIM-001"
  - corridor_id (text, FK to corridors.id)
  - block_config (jsonb) — { start, end }
  - maintenance_task_ids (text[])
  - train_schedule_date (date)
  - status (text, not null, default 'created') — "created" | "queued" | "running" | "completed" | "failed"
  - created_at (timestamptz, default now())

- `simulation_results` — Results of a simulation run.
  - id (text, primary key) — e.g., "SIMR-001"
  - simulation_id (text, FK to simulation_scenarios.id, not null)
  - affected_trains (jsonb) — array of affected train details
  - expected_delay (integer) — minutes
  - affected_assets (jsonb) — array
  - infrastructure_availability (double precision) — percentage
  - conflicts (jsonb) — array of detected conflicts
  - block_utilization (double precision) — percentage
  - risk (double precision) — 0-1
  - alternative_blocks (jsonb) — array of alternative block suggestions
  - created_at (timestamptz, default now())

- `maintenance_plans` — Approved maintenance plans.
  - id (text, primary key) — e.g., "MP-001"
  - optimization_run_id (text, FK to optimization_runs.id)
  - approved_by (text, FK to users.id)
  - schedule (jsonb) — approved schedule entries
  - status (text, not null, default 'approved') — "approved" | "active" | "completed" | "archived"
  - created_at (timestamptz, default now())

2. Indexes
- optimization_runs: corridor_id, status
- optimization_schedules: optimization_run_id
- simulation_scenarios: corridor_id, status
- simulation_results: simulation_id
- maintenance_plans: optimization_run_id, approved_by

3. Security
- Enable RLS on all tables. Allow anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS optimization_runs (
  id text PRIMARY KEY,
  corridor_id text REFERENCES corridors(id),
  planning_date date,
  status text NOT NULL DEFAULT 'queued',
  progress integer NOT NULL DEFAULT 0,
  message text,
  objective jsonb,
  task_ids text[] DEFAULT '{}',
  block_ids text[] DEFAULT '{}',
  result jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE optimization_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_optimization_runs" ON optimization_runs;
CREATE POLICY "anon_select_optimization_runs" ON optimization_runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_optimization_runs" ON optimization_runs;
CREATE POLICY "anon_insert_optimization_runs" ON optimization_runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_optimization_runs" ON optimization_runs;
CREATE POLICY "anon_update_optimization_runs" ON optimization_runs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_optimization_runs" ON optimization_runs;
CREATE POLICY "anon_delete_optimization_runs" ON optimization_runs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_opt_runs_corridor_id ON optimization_runs(corridor_id);
CREATE INDEX IF NOT EXISTS idx_opt_runs_status ON optimization_runs(status);

CREATE TABLE IF NOT EXISTS optimization_schedules (
  id text PRIMARY KEY,
  optimization_run_id text NOT NULL REFERENCES optimization_runs(id),
  maintenance_task_id text REFERENCES maintenance_tasks(id),
  block_id text REFERENCES blocks(id),
  start_time text,
  end_time text,
  score double precision DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE optimization_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_optimization_schedules" ON optimization_schedules;
CREATE POLICY "anon_select_optimization_schedules" ON optimization_schedules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_optimization_schedules" ON optimization_schedules;
CREATE POLICY "anon_insert_optimization_schedules" ON optimization_schedules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_optimization_schedules" ON optimization_schedules;
CREATE POLICY "anon_update_optimization_schedules" ON optimization_schedules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_optimization_schedules" ON optimization_schedules;
CREATE POLICY "anon_delete_optimization_schedules" ON optimization_schedules FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_opt_sched_run_id ON optimization_schedules(optimization_run_id);

CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id text PRIMARY KEY,
  corridor_id text REFERENCES corridors(id),
  block_config jsonb,
  maintenance_task_ids text[] DEFAULT '{}',
  train_schedule_date date,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_simulation_scenarios" ON simulation_scenarios;
CREATE POLICY "anon_select_simulation_scenarios" ON simulation_scenarios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_simulation_scenarios" ON simulation_scenarios;
CREATE POLICY "anon_insert_simulation_scenarios" ON simulation_scenarios FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_simulation_scenarios" ON simulation_scenarios;
CREATE POLICY "anon_update_simulation_scenarios" ON simulation_scenarios FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_simulation_scenarios" ON simulation_scenarios;
CREATE POLICY "anon_delete_simulation_scenarios" ON simulation_scenarios FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sim_scen_corridor_id ON simulation_scenarios(corridor_id);
CREATE INDEX IF NOT EXISTS idx_sim_scen_status ON simulation_scenarios(status);

CREATE TABLE IF NOT EXISTS simulation_results (
  id text PRIMARY KEY,
  simulation_id text NOT NULL REFERENCES simulation_scenarios(id),
  affected_trains jsonb DEFAULT '[]',
  expected_delay integer DEFAULT 0,
  affected_assets jsonb DEFAULT '[]',
  infrastructure_availability double precision DEFAULT 0,
  conflicts jsonb DEFAULT '[]',
  block_utilization double precision DEFAULT 0,
  risk double precision DEFAULT 0,
  alternative_blocks jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_simulation_results" ON simulation_results;
CREATE POLICY "anon_select_simulation_results" ON simulation_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_simulation_results" ON simulation_results;
CREATE POLICY "anon_insert_simulation_results" ON simulation_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_simulation_results" ON simulation_results;
CREATE POLICY "anon_update_simulation_results" ON simulation_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_simulation_results" ON simulation_results;
CREATE POLICY "anon_delete_simulation_results" ON simulation_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sim_results_sim_id ON simulation_results(simulation_id);

CREATE TABLE IF NOT EXISTS maintenance_plans (
  id text PRIMARY KEY,
  optimization_run_id text REFERENCES optimization_runs(id),
  approved_by text REFERENCES users(id),
  schedule jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_maintenance_plans" ON maintenance_plans;
CREATE POLICY "anon_select_maintenance_plans" ON maintenance_plans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_maintenance_plans" ON maintenance_plans;
CREATE POLICY "anon_insert_maintenance_plans" ON maintenance_plans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_maintenance_plans" ON maintenance_plans;
CREATE POLICY "anon_update_maintenance_plans" ON maintenance_plans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_maintenance_plans" ON maintenance_plans;
CREATE POLICY "anon_delete_maintenance_plans" ON maintenance_plans FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_mp_opt_run_id ON maintenance_plans(optimization_run_id);
CREATE INDEX IF NOT EXISTS idx_mp_approved_by ON maintenance_plans(approved_by);
