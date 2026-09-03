const { query } = require('../config/db');

class TrainScheduleRepository {
  async findWithFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.corridorId) {
      conditions.push(`ts.corridor_id = $${idx++}`);
      params.push(filters.corridorId);
    }
    if (filters.date) {
      conditions.push(`ts.schedule_date = $${idx++}`);
      params.push(filters.date);
    }

    let sql = `SELECT ts.id, ts.train_id, ts.corridor_id, ts.schedule_date, ts.arrival_time, ts.departure_time, ts.direction,
               t.name as train_name, t.number as train_number, t.type as train_type, t.priority as train_priority
               FROM train_schedules ts
               JOIN trains t ON ts.train_id = t.id`;

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY ts.arrival_time ASC';

    const result = await query(sql, params);
    return result.rows.map((r) => ({
      id: r.id,
      trainId: r.train_id,
      trainName: r.train_name,
      trainNumber: r.train_number,
      trainType: r.train_type,
      trainPriority: r.train_priority,
      corridorId: r.corridor_id,
      scheduleDate: r.schedule_date,
      arrivalTime: r.arrival_time,
      departureTime: r.departure_time,
      direction: r.direction,
    }));
  }

  async findByTrainId(trainId) {
    const result = await query(
      `SELECT * FROM train_schedules WHERE train_id = $1 ORDER BY schedule_date ASC, arrival_time ASC`,
      [trainId]
    );
    return result.rows;
  }

  async create(data) {
    const result = await query(
      `INSERT INTO train_schedules (id, train_id, corridor_id, schedule_date, arrival_time, departure_time, direction)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.id, data.trainId, data.corridorId, data.scheduleDate, data.arrivalTime, data.departureTime, data.direction || 'up']
    );
    return result.rows[0];
  }
}

module.exports = new TrainScheduleRepository();
