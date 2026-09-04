const { query } = require('../config/db');

class SimulationRepository {
  async createScenario(data) {
    const result = await query(
      `INSERT INTO simulation_scenarios (id, corridor_id, block_config, maintenance_task_ids, train_schedule_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.id, data.corridorId, JSON.stringify(data.blockConfig), data.maintenanceTaskIds || [], data.trainScheduleDate, data.status || 'created']
    );
    return this.mapScenario(result.rows[0]);
  }

  async findScenarioById(id) {
    const result = await query(`SELECT * FROM simulation_scenarios WHERE id = $1`, [id]);
    return result.rows[0] ? this.mapScenario(result.rows[0]) : null;
  }

  async updateScenario(id, data) {
    const fieldMap = { status: 'status' };
    const setParts = [];
    const params = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (data[jsKey] !== undefined) {
        setParts.push(`${dbKey} = $${idx++}`);
        params.push(data[jsKey]);
      }
    }
    if (setParts.length === 0) return this.findScenarioById(id);

    params.push(id);
    const result = await query(`UPDATE simulation_scenarios SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return result.rows[0] ? this.mapScenario(result.rows[0]) : null;
  }

  async createResult(data) {
    const result = await query(
      `INSERT INTO simulation_results (id, simulation_id, affected_trains, expected_delay, affected_assets, infrastructure_availability, conflicts, block_utilization, risk, alternative_blocks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [data.id, data.simulationId, JSON.stringify(data.affectedTrains || []), data.expectedDelay || 0, JSON.stringify(data.affectedAssets || []), data.infrastructureAvailability || 0, JSON.stringify(data.conflicts || []), data.blockUtilization || 0, data.risk || 0, JSON.stringify(data.alternativeBlocks || [])]
    );
    return this.mapResult(result.rows[0]);
  }

  async findResultBySimulationId(simulationId) {
    const result = await query(`SELECT * FROM simulation_results WHERE simulation_id = $1 ORDER BY created_at DESC LIMIT 1`, [simulationId]);
    return result.rows[0] ? this.mapResult(result.rows[0]) : null;
  }

  mapScenario(r) {
    if (!r) return null;
    return {
      id: r.id,
      corridorId: r.corridor_id,
      blockConfig: typeof r.block_config === 'string' ? JSON.parse(r.block_config) : r.block_config,
      maintenanceTaskIds: r.maintenance_task_ids,
      trainScheduleDate: r.train_schedule_date,
      status: r.status,
      createdAt: r.created_at,
    };
  }

  mapResult(r) {
    if (!r) return null;
    return {
      id: r.id,
      simulationId: r.simulation_id,
      affectedTrains: typeof r.affected_trains === 'string' ? JSON.parse(r.affected_trains) : r.affected_trains,
      expectedDelay: r.expected_delay,
      affectedAssets: typeof r.affected_assets === 'string' ? JSON.parse(r.affected_assets) : r.affected_assets,
      infrastructureAvailability: r.infrastructure_availability,
      conflicts: typeof r.conflicts === 'string' ? JSON.parse(r.conflicts) : r.conflicts,
      blockUtilization: r.block_utilization,
      risk: r.risk,
      alternativeBlocks: typeof r.alternative_blocks === 'string' ? JSON.parse(r.alternative_blocks) : r.alternative_blocks,
      createdAt: r.created_at,
    };
  }
}

module.exports = new SimulationRepository();
