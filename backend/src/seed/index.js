const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting database seed...');

  // Departments
  await query(`INSERT INTO departments (id, name, code) VALUES
    ('DEP-ENG', 'Engineering', 'ENG'),
    ('DEP-SNT', 'S&T', 'SNT'),
    ('DEP-TRC', 'Traction', 'TRC')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Departments seeded');

  // Corridors
  await query(`INSERT INTO corridors (id, name, status, length_km) VALUES
    ('COR-001', 'Delhi-Ghaziabad', 'active', 25),
    ('COR-002', 'Ghaziabad-Meerut', 'active', 60)
    ON CONFLICT (id) DO NOTHING`);
  console.log('Corridors seeded');

  // Stations
  await query(`INSERT INTO stations (id, name, latitude, longitude, corridor_id, location) VALUES
    ('ST-001', 'New Delhi', 28.6428, 77.2191, 'COR-001', ST_SetSRID(ST_MakePoint(77.2191, 28.6428), 4326)::geography),
    ('ST-002', 'Ghaziabad', 28.6692, 77.4538, 'COR-001', ST_SetSRID(ST_MakePoint(77.4538, 28.6692), 4326)::geography),
    ('ST-003', 'Shahdara', 28.6720, 77.2890, 'COR-001', ST_SetSRID(ST_MakePoint(77.2890, 28.6720), 4326)::geography),
    ('ST-004', 'Meerut City', 28.9845, 77.7064, 'COR-002', ST_SetSRID(ST_MakePoint(77.7064, 28.9845), 4326)::geography),
    ('ST-005', 'Hapur', 28.7700, 77.7740, 'COR-002', ST_SetSRID(ST_MakePoint(77.7740, 28.7700), 4326)::geography),
    ('ST-006', 'Modinagar', 28.8300, 77.5800, 'COR-002', ST_SetSRID(ST_MakePoint(77.5800, 28.8300), 4326)::geography)
    ON CONFLICT (id) DO NOTHING`);
  console.log('Stations seeded');

  // User
  const hash = await bcrypt.hash('password123', 10);
  await query(`INSERT INTO users (id, name, email, password_hash, role, department_id) VALUES
    ('USR-001', 'Rahul Sharma', 'rahul@example.com', $1, 'operator', 'DEP-ENG')
    ON CONFLICT (id) DO NOTHING`, [hash]);
  console.log('Users seeded');

  // Assets
  await query(`INSERT INTO assets (id, name, type, corridor_id, criticality, condition, defect_severity, installation_date, latitude, longitude, location) VALUES
    ('AST-001', 'Track Section DG-12', 'track', 'COR-001', 9, 'critical', 7, '2015-06-15', 28.65, 77.35, ST_SetSRID(ST_MakePoint(77.35, 28.65), 4326)::geography),
    ('AST-002', 'Signal NDL-03', 'signal', 'COR-001', 8, 'warning', 5, '2018-03-20', 28.64, 77.25, ST_SetSRID(ST_MakePoint(77.25, 28.64), 4326)::geography),
    ('AST-003', 'OHE Span GZB-08', 'ohe', 'COR-001', 7, 'warning', 4, '2016-11-10', 28.67, 77.43, ST_SetSRID(ST_MakePoint(77.43, 28.67), 4326)::geography),
    ('AST-004', 'Bridge Yamuna-02', 'bridge', 'COR-001', 10, 'critical', 8, '2008-09-05', 28.66, 77.30, ST_SetSRID(ST_MakePoint(77.30, 28.66), 4326)::geography),
    ('AST-005', 'Turnout GZB-05', 'turnout', 'COR-001', 6, 'healthy', 1, '2020-01-15', 28.67, 77.45, ST_SetSRID(ST_MakePoint(77.45, 28.67), 4326)::geography),
    ('AST-006', 'Track Section GZB-15', 'track', 'COR-001', 7, 'warning', 4, '2017-08-22', 28.68, 77.44, ST_SetSRID(ST_MakePoint(77.44, 28.68), 4326)::geography),
    ('AST-007', 'Signal SHD-01', 'signal', 'COR-001', 5, 'healthy', 0, '2021-04-10', 28.67, 77.29, ST_SetSRID(ST_MakePoint(77.29, 28.67), 4326)::geography),
    ('AST-008', 'OHE Span NDL-12', 'ohe', 'COR-001', 8, 'critical', 6, '2014-02-18', 28.64, 77.22, ST_SetSRID(ST_MakePoint(77.22, 28.64), 4326)::geography),
    ('AST-009', 'Track Section MRT-03', 'track', 'COR-002', 8, 'warning', 5, '2016-05-12', 28.97, 77.70, ST_SetSRID(ST_MakePoint(77.70, 28.97), 4326)::geography),
    ('AST-010', 'Signal MRT-07', 'signal', 'COR-002', 6, 'healthy', 2, '2019-07-25', 28.98, 77.71, ST_SetSRID(ST_MakePoint(77.71, 28.98), 4326)::geography),
    ('AST-011', 'Bridge HPR-01', 'bridge', 'COR-002', 9, 'warning', 5, '2012-03-08', 28.77, 77.77, ST_SetSRID(ST_MakePoint(77.77, 28.77), 4326)::geography),
    ('AST-012', 'Turnout MDN-03', 'turnout', 'COR-002', 5, 'healthy', 0, '2020-09-15', 28.83, 77.58, ST_SetSRID(ST_MakePoint(77.58, 28.83), 4326)::geography),
    ('AST-013', 'OHE Span HPR-04', 'ohe', 'COR-002', 7, 'warning', 3, '2017-12-01', 28.76, 77.78, ST_SetSRID(ST_MakePoint(77.78, 28.76), 4326)::geography),
    ('AST-014', 'Track Section MDN-08', 'track', 'COR-002', 6, 'healthy', 1, '2019-02-14', 28.82, 77.57, ST_SetSRID(ST_MakePoint(77.57, 28.82), 4326)::geography),
    ('AST-015', 'Signal GZB-12', 'signal', 'COR-001', 9, 'critical', 7, '2013-06-30', 28.67, 77.42, ST_SetSRID(ST_MakePoint(77.42, 28.67), 4326)::geography),
    ('AST-016', 'Bridge MRT-02', 'bridge', 'COR-002', 10, 'critical', 9, '2005-11-20', 28.99, 77.72, ST_SetSRID(ST_MakePoint(77.72, 28.99), 4326)::geography)
    ON CONFLICT (id) DO NOTHING`);
  console.log('Assets seeded (16)');

  // Maintenance tasks
  await query(`INSERT INTO maintenance_tasks (id, asset_id, department_id, description, severity, estimated_duration, deadline, safety_risk, status, priority_score, failure_risk) VALUES
    ('MT-001', 'AST-001', 'DEP-ENG', 'Rail wear replacement on Track Section DG-12', 9, 180, '2026-09-12', 8, 'pending', 78.5, 0.72),
    ('MT-002', 'AST-004', 'DEP-ENG', 'Bridge Yamuna-02 structural inspection and repair', 10, 240, '2026-09-10', 10, 'pending', 92.0, 0.85),
    ('MT-003', 'AST-008', 'DEP-TRC', 'OHE Span NDL-12 contact wire replacement', 8, 150, '2026-09-15', 7, 'pending', 65.5, 0.61),
    ('MT-004', 'AST-015', 'DEP-SNT', 'Signal GZB-12 lens replacement and wiring', 9, 120, '2026-09-11', 6, 'pending', 71.0, 0.68),
    ('MT-005', 'AST-002', 'DEP-SNT', 'Signal NDL-03 routine calibration', 5, 60, '2026-09-20', 3, 'pending', 28.0, 0.35),
    ('MT-006', 'AST-003', 'DEP-TRC', 'OHE Span GZB-08 insulator cleaning', 6, 90, '2026-09-18', 4, 'pending', 35.0, 0.42),
    ('MT-007', 'AST-006', 'DEP-ENG', 'Track Section GZB-15 ballast tamping', 7, 120, '2026-09-16', 5, 'pending', 48.5, 0.45),
    ('MT-008', 'AST-009', 'DEP-ENG', 'Track Section MRT-03 rail grinding', 8, 180, '2026-09-14', 6, 'pending', 58.0, 0.55),
    ('MT-009', 'AST-011', 'DEP-ENG', 'Bridge HPR-01 crack sealing', 7, 100, '2026-09-19', 5, 'pending', 42.0, 0.48),
    ('MT-010', 'AST-013', 'DEP-TRC', 'OHE Span HPR-04 tension adjustment', 6, 75, '2026-09-22', 4, 'pending', 32.0, 0.38),
    ('MT-011', 'AST-016', 'DEP-ENG', 'Bridge MRT-02 emergency structural assessment', 10, 300, '2026-09-08', 10, 'pending', 95.0, 0.91),
    ('MT-012', 'AST-007', 'DEP-SNT', 'Signal SHD-01 firmware upgrade', 4, 45, '2026-09-25', 2, 'completed', 15.0, 0.12)
    ON CONFLICT (id) DO NOTHING`);
  console.log('Maintenance tasks seeded (12)');

  // Trains
  await query(`INSERT INTO trains (id, name, number, type, priority, corridor_id) VALUES
    ('TR-001', 'Shatabdi Express', '12009', 'superfast', 9, 'COR-001'),
    ('TR-002', 'Ghaziabad Passenger', '54401', 'passenger', 4, 'COR-001'),
    ('TR-003', 'Rajdhani Express', '12259', 'superfast', 10, 'COR-001'),
    ('TR-004', 'Delhi-Meerut Express', '64555', 'express', 7, 'COR-002'),
    ('TR-005', 'Sangam Express', '14163', 'express', 6, 'COR-002'),
    ('TR-006', 'Yamuna Bridge Goods', 'GDS-01', 'freight', 3, 'COR-001'),
    ('TR-007', 'Shatabdi Express Return', '12010', 'superfast', 9, 'COR-001'),
    ('TR-008', 'Meerut-Delhi Passenger', '54402', 'passenger', 4, 'COR-002'),
    ('TR-009', 'Dehradun Express', '12687', 'express', 7, 'COR-001'),
    ('TR-010', 'Ganga Freight', 'GDS-02', 'freight', 3, 'COR-002'),
    ('TR-011', 'Anand Vihar Express', '14005', 'express', 6, 'COR-001'),
    ('TR-012', 'Meerut Fast Passenger', '64556', 'express', 5, 'COR-002')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Trains seeded (12)');

  // Train schedules
  await query(`INSERT INTO train_schedules (id, train_id, corridor_id, schedule_date, arrival_time, departure_time, direction) VALUES
    ('TS-001', 'TR-001', 'COR-001', '2026-09-12', '08:15', '08:20', 'up'),
    ('TS-002', 'TR-002', 'COR-001', '2026-09-12', '09:30', '09:35', 'up'),
    ('TS-003', 'TR-003', 'COR-001', '2026-09-12', '10:00', '10:05', 'up'),
    ('TS-004', 'TR-006', 'COR-001', '2026-09-12', '10:30', '11:00', 'up'),
    ('TS-005', 'TR-007', 'COR-001', '2026-09-12', '11:30', '11:35', 'down'),
    ('TS-006', 'TR-009', 'COR-001', '2026-09-12', '13:00', '13:10', 'up'),
    ('TS-007', 'TR-011', 'COR-001', '2026-09-12', '14:20', '14:25', 'up'),
    ('TS-008', 'TR-002', 'COR-001', '2026-09-12', '15:30', '15:35', 'down'),
    ('TS-009', 'TR-004', 'COR-002', '2026-09-12', '08:45', '08:50', 'up'),
    ('TS-010', 'TR-005', 'COR-002', '2026-09-12', '10:15', '10:20', 'up'),
    ('TS-011', 'TR-008', 'COR-002', '2026-09-12', '12:00', '12:05', 'down'),
    ('TS-012', 'TR-010', 'COR-002', '2026-09-12', '13:30', '13:45', 'up'),
    ('TS-013', 'TR-012', 'COR-002', '2026-09-12', '15:00', '15:05', 'up'),
    ('TS-014', 'TR-001', 'COR-001', '2026-09-11', '08:15', '08:20', 'up'),
    ('TS-015', 'TR-003', 'COR-001', '2026-09-11', '10:00', '10:05', 'up')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Train schedules seeded (15)');

  // Blocks
  await query(`INSERT INTO blocks (id, corridor_id, department_id, date, start_time, end_time, reason, status, maintenance_task_ids, duration_minutes) VALUES
    ('BLK-001', 'COR-001', 'DEP-ENG', '2026-09-12', '09:00', '12:00', 'Track maintenance on DG-12', 'pending', ARRAY['MT-001'], 180),
    ('BLK-002', 'COR-001', 'DEP-SNT', '2026-09-12', '10:30', '12:30', 'Signal GZB-12 replacement', 'pending', ARRAY['MT-004'], 120),
    ('BLK-003', 'COR-001', 'DEP-TRC', '2026-09-12', '13:00', '15:00', 'OHE Span NDL-12 wire replacement', 'pending', ARRAY['MT-003'], 120),
    ('BLK-004', 'COR-001', 'DEP-ENG', '2026-09-12', '10:00', '14:00', 'Bridge Yamuna-02 structural repair', 'pending', ARRAY['MT-002'], 240),
    ('BLK-005', 'COR-002', 'DEP-ENG', '2026-09-12', '09:30', '12:30', 'Track Section MRT-03 grinding', 'pending', ARRAY['MT-008'], 180),
    ('BLK-006', 'COR-002', 'DEP-TRC', '2026-09-12', '14:00', '16:00', 'OHE Span HPR-04 tension adjustment', 'pending', ARRAY['MT-010'], 120),
    ('BLK-007', 'COR-001', 'DEP-SNT', '2026-09-13', '09:00', '11:00', 'Signal NDL-03 calibration', 'pending', ARRAY['MT-005'], 120),
    ('BLK-008', 'COR-002', 'DEP-ENG', '2026-09-13', '10:00', '13:00', 'Bridge HPR-01 crack sealing', 'pending', ARRAY['MT-009'], 180),
    ('BLK-009', 'COR-001', 'DEP-ENG', '2026-09-14', '08:00', '10:00', 'Track Section GZB-15 tamping', 'approved', ARRAY['MT-007'], 120),
    ('BLK-010', 'COR-001', 'DEP-TRC', '2026-09-14', '10:00', '12:00', 'OHE Span GZB-08 cleaning', 'approved', ARRAY['MT-006'], 120)
    ON CONFLICT (id) DO NOTHING`);
  console.log('Blocks seeded (10)');

  // Conflicts
  await query(`INSERT INTO conflicts (id, corridor_id, date, type, severity, status, block_ids, department_ids, description) VALUES
    ('CON-001', 'COR-001', '2026-09-12', 'block_overlap', 'high', 'open', ARRAY['BLK-001', 'BLK-002'], ARRAY['DEP-ENG', 'DEP-SNT'], 'Engineering block (09:00-12:00) overlaps with S&T block (10:30-12:30) on corridor COR-001'),
    ('CON-002', 'COR-001', '2026-09-12', 'block_overlap', 'high', 'open', ARRAY['BLK-001', 'BLK-004'], ARRAY['DEP-ENG'], 'Two Engineering blocks overlap: BLK-001 (09:00-12:00) and BLK-004 (10:00-14:00) on same corridor'),
    ('CON-003', 'COR-002', '2026-09-13', 'resource_conflict', 'medium', 'open', ARRAY['BLK-008'], ARRAY['DEP-ENG'], 'Bridge HPR-01 maintenance requires corridor closure but freight train GDS-02 scheduled')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Conflicts seeded (3)');

  // Historical failures
  await query(`INSERT INTO historical_failures (id, asset_id, failure_type, failure_date, downtime_hours, root_cause, resolution) VALUES
    ('HF-001', 'AST-001', 'Rail fracture', '2024-03-15', 8, 'Metal fatigue due to heavy traffic', 'Emergency rail replacement'),
    ('HF-002', 'AST-001', 'Surface cracking', '2023-11-20', 4, 'Thermal stress', 'Welding repair'),
    ('HF-003', 'AST-004', 'Structural crack', '2024-01-10', 12, 'Age-related deterioration', 'Reinforcement plating'),
    ('HF-004', 'AST-008', 'Contact wire break', '2024-06-05', 6, 'Wear and tear', 'Wire splice and tensioning'),
    ('HF-005', 'AST-015', 'Signal failure', '2024-08-22', 3, 'Electronic component burnout', 'PCB replacement'),
    ('HF-006', 'AST-009', 'Track misalignment', '2023-09-12', 5, 'Ballast degradation', 'Ballast tamping'),
    ('HF-007', 'AST-016', 'Foundation settlement', '2024-04-18', 16, 'Soil erosion', 'Foundation grouting'),
    ('HF-008', 'AST-002', 'Lens fogging', '2023-07-08', 2, 'Weather damage', 'Lens replacement'),
    ('HF-009', 'AST-003', 'Insulator flashover', '2024-02-28', 3, 'Contamination buildup', 'Cleaning and replacement'),
    ('HF-010', 'AST-006', 'Ballast displacement', '2023-12-15', 4, 'Vibration from high-speed trains', 'Ballast tamping and stabilization')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Historical failures seeded (10)');

  // Maintenance history
  await query(`INSERT INTO maintenance_history (id, asset_id, task_id, department_id, description, type, status, performed_at, duration_minutes, cost, notes) VALUES
    ('MH-001', 'AST-005', NULL, 'DEP-ENG', 'Routine turnout inspection', 'inspection', 'completed', '2026-08-15T10:00:00Z', 45, 500, 'All clear, no issues found'),
    ('MH-002', 'AST-007', NULL, 'DEP-SNT', 'Signal firmware update', 'maintenance', 'completed', '2026-08-20T09:00:00Z', 60, 1200, 'Updated to v2.4'),
    ('MH-003', 'AST-012', NULL, 'DEP-ENG', 'Turnout lubrication', 'maintenance', 'completed', '2026-08-10T11:00:00Z', 30, 300, 'Routine lubrication'),
    ('MH-004', 'AST-001', NULL, 'DEP-ENG', 'Emergency rail repair', 'repair', 'completed', '2026-07-22T14:00:00Z', 180, 15000, 'Replaced 12m of rail'),
    ('MH-005', 'AST-004', NULL, 'DEP-ENG', 'Bridge structural inspection', 'inspection', 'completed', '2026-08-05T08:00:00Z', 120, 3000, 'Cracks identified, follow-up scheduled'),
    ('MH-006', 'AST-009', NULL, 'DEP-ENG', 'Track grinding', 'maintenance', 'completed', '2026-07-15T09:00:00Z', 150, 8000, 'Surface corrugation removed'),
    ('MH-007', 'AST-014', NULL, 'DEP-ENG', 'Track inspection', 'inspection', 'completed', '2026-08-25T10:00:00Z', 60, 800, 'Good condition'),
    ('MH-008', 'AST-010', NULL, 'DEP-SNT', 'Signal calibration', 'maintenance', 'completed', '2026-08-12T13:00:00Z', 45, 600, 'Calibrated within spec'),
    ('MH-009', 'AST-013', NULL, 'DEP-TRC', 'OHE inspection', 'inspection', 'completed', '2026-08-18T09:30:00Z', 90, 1500, 'Tension within spec'),
    ('MH-010', 'AST-002', NULL, 'DEP-SNT', 'Signal lens cleaning', 'maintenance', 'completed', '2026-07-30T11:00:00Z', 30, 200, 'Lens cleaned, no damage'),
    ('MH-011', 'AST-012', 'MT-012', 'DEP-SNT', 'Signal SHD-01 firmware upgrade', 'maintenance', 'completed', '2026-09-01T10:00:00Z', 45, 800, 'Successfully upgraded')
    ON CONFLICT (id) DO NOTHING`);
  console.log('Maintenance history seeded (11)');

  console.log('\nSeed completed successfully!');
  console.log('Demo user: rahul@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
