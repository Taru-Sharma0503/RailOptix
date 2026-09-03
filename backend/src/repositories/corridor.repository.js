const { query } = require('../config/db');

class CorridorRepository {
  async findAll() {
    const result = await query(`SELECT id, name, status, length_km, created_at FROM corridors ORDER BY id ASC`);
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      lengthKm: r.length_km,
      createdAt: r.created_at,
    }));
  }

  async findById(id) {
    const result = await query(`SELECT id, name, status, length_km FROM corridors WHERE id = $1`, [id]);
    if (!result.rows[0]) return null;
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      status: result.rows[0].status,
      lengthKm: result.rows[0].length_km,
    };
  }
}

module.exports = new CorridorRepository();
