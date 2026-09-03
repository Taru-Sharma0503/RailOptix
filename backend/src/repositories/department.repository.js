const BaseRepository = require('./base.repository');

class DepartmentRepository extends BaseRepository {
  constructor() {
    super('departments', 'id');
  }
}

module.exports = new DepartmentRepository();
