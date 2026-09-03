const maintenanceService = require('../services/maintenance.service');

async function getTasks(req, res, next) {
  try { res.json(await maintenanceService.getTasks(req.query)); } catch (err) { next(err); }
}
async function getTask(req, res, next) {
  try { res.json(await maintenanceService.getTaskById(req.params.id)); } catch (err) { next(err); }
}
async function createTask(req, res, next) {
  try { res.status(201).json(await maintenanceService.createTask(req.body)); } catch (err) { next(err); }
}
async function updateTask(req, res, next) {
  try { res.json(await maintenanceService.updateTask(req.params.id, req.body)); } catch (err) { next(err); }
}
async function deleteTask(req, res, next) {
  try { res.json(await maintenanceService.deleteTask(req.params.id)); } catch (err) { next(err); }
}
async function importTasks(req, res, next) {
  try { res.json(await maintenanceService.importTasks(req.body)); } catch (err) { next(err); }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, importTasks };
