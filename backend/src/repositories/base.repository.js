const { query } = require('../config/db');
const { NotFoundError } = require('../utils/errors');

class BaseRepository {
  constructor(tableName, idField = 'id') {
    this.tableName = tableName;
    this.idField = idField;
  }

  async findById(id, columns = '*') {
    const sql = `SELECT ${columns} FROM ${this.tableName} WHERE ${this.idField} = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async findAll(columns = '*', conditions = [], params = [], orderBy = 'created_at DESC') {
    let sql = `SELECT ${columns} FROM ${this.tableName}`;
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ` ORDER BY ${orderBy}`;
    const result = await query(sql, params);
    return result.rows;
  }

  async create(data, returning = '*') {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING ${returning}`;
    const result = await query(sql, values);
    return result.rows[0];
  }

  async update(id, data, returning = '*') {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id);
    const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.idField} = $${values.length} RETURNING ${returning}`;
    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE ${this.idField} = $1 RETURNING *`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async count(conditions = [], params = []) {
    let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  async findByIdOrFail(id, columns = '*') {
    const row = await this.findById(id, columns);
    if (!row) throw NotFoundError.resource(this.tableName);
    return row;
  }
}

module.exports = BaseRepository;
