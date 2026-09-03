const { query } = require('../config/db');

class StationRepository {
  async findAll() {
    const result = await query(`SELECT id, name, latitude, longitude, corridor_id FROM stations ORDER BY id ASC`);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      corridorId: r.corridor_id,
    }));
  }

  async findByCorridorId(corridorId) {
    const result = await query(`SELECT id, name, latitude, longitude, corridor_id FROM stations WHERE corridor_id = $1 ORDER BY id ASC`, [corridorId]);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      corridorId: r.corridor_id,
    }));
  }
}

module.exports = new StationRepository();
