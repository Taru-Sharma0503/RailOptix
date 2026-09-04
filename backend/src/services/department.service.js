const departmentRepo = require('../repositories/department.repository');
const { query } = require('../config/db');
const { NotFoundError } = require('../utils/errors');
const { successResponse } = require('../utils/helpers');

class DepartmentService {
  async getDepartments() {
    const departments = await departmentRepo.findAll();
    return successResponse({ departments });
  }

  async getDepartmentById(id) {
    const department = await departmentRepo.findById(id);
    if (!department) throw NotFoundError.resource('Department');

    const activeTasksResult = await query(
      `SELECT COUNT(*) as count FROM maintenance_tasks WHERE department_id = $1 AND status IN ('pending','scheduled','in_progress')`,
      [id]
    );
    const blockRequestsResult = await query(
      `SELECT COUNT(*) as count FROM blocks WHERE department_id = $1`,
      [id]
    );
    const conflictsResult = await query(
      `SELECT COUNT(*) as count FROM conflicts WHERE $1 = ANY(department_ids) AND status = 'open'`,
      [id]
    );

    return successResponse({
      department: {
        ...department,
        activeTasks: parseInt(activeTasksResult.rows[0].count),
        blockRequests: parseInt(blockRequestsResult.rows[0].count),
        conflicts: parseInt(conflictsResult.rows[0].count),
      },
    });
  }
}

module.exports = new DepartmentService();