const departmentService = require('../services/department.service');

async function getDepartments(req, res, next) {
  try { res.json(await departmentService.getDepartments()); } catch (err) { next(err); }
}
async function getDepartment(req, res, next) {
  try { res.json(await departmentService.getDepartmentById(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getDepartments, getDepartment };
