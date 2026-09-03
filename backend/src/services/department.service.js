const departmentRepo = require('../repositories/department.repository');
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
    return successResponse({ department });
  }
}

module.exports = new DepartmentService();
