const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('users', 'id');
  }

  async findByEmail(email) {
    const { query } = require('../config/db');
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async safeUser(user) {
    if (!user) return null;
    const { id, name, email, role, department_id, created_at } = user;
    return { id, name, email, role, departmentId: department_id, createdAt: created_at };
  }
}

module.exports = new UserRepository();
