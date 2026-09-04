const maintenanceRepo = require('../repositories/maintenance.repository');
const assetRepo = require('../repositories/asset.repository');
const historicalFailureRepo = require('../repositories/historicalFailure.repository');
const maintenanceHistoryRepo = require('../repositories/maintenanceHistory.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, nextSequentialId, daysBetween, clamp } = require('../utils/helpers');
const { query } = require('../config/db');

class MaintenanceService {
  async getTasks(filters) {
    const tasks = await maintenanceRepo.findWithFilters(filters);
    return successResponse({ tasks });
  }

  async getTaskById(id) {
    const task = await maintenanceRepo.findById(id);
    if (!task) throw NotFoundError.resource('Maintenance task');
    return successResponse({ task });
  }

  async createTask(data) {
    const asset = await assetRepo.findById(data.assetId);
    if (!asset) throw NotFoundError.resource('Asset');

    const id = await nextSequentialId('MT', () => maintenanceRepo.count());

    const failureRisk = await this._calculateFailureRisk(data.assetId);
    const priorityScore = this._calculatePriorityScore({
      severity: data.severity,
      assetCriticality: asset.criticality,
      failureRisk,
      deadline: data.deadline,
      safetyRisk: data.safetyRisk,
    });

    const task = await maintenanceRepo.create({
      id,
      assetId: data.assetId,
      departmentId: data.departmentId,
      description: data.description,
      severity: data.severity,
      estimatedDuration: data.estimatedDuration,
      deadline: data.deadline,
      safetyRisk: data.safetyRisk,
      status: 'pending',
      priorityScore,
      failureRisk,
    });

    return { success: true, task };
  }

  async updateTask(id, data) {
    const existing = await maintenanceRepo.findById(id);
    if (!existing) throw NotFoundError.resource('Maintenance task');

    if (data.severity !== undefined || data.deadline !== undefined || data.safetyRisk !== undefined) {
      const severity = data.severity !== undefined ? data.severity : existing.severity;
      const deadline = data.deadline !== undefined ? data.deadline : existing.deadline;
      const safetyRisk = data.safetyRisk !== undefined ? data.safetyRisk : existing.safetyRisk;

      const asset = await assetRepo.findById(existing.assetId);
      data.priorityScore = this._calculatePriorityScore({
        severity,
        assetCriticality: asset ? asset.criticality : 5,
        failureRisk: existing.failureRisk,
        deadline,
        safetyRisk,
      });
    }

    const task = await maintenanceRepo.update(id, data);

    // Auto-log a maintenance_history entry when a task transitions to completed.
    if (data.status === 'completed' && existing.status !== 'completed') {
      try {
        const historyId = await nextSequentialId('MH', () => this._countHistory());
        await maintenanceHistoryRepo.create({
          id: historyId,
          assetId: task.assetId,
          taskId: task.id,
          departmentId: task.departmentId,
          description: task.description,
          type: 'maintenance',
          status: 'completed',
          performedAt: new Date().toISOString(),
          durationMinutes: task.estimatedDuration,
        });
      } catch (err) {
        console.error(`Failed to log maintenance history for task ${id}:`, err.message);
      }
    }

    return { success: true, task };
  }

  async deleteTask(id) {
    const task = await maintenanceRepo.delete(id);
    if (!task) throw NotFoundError.resource('Maintenance task');
    return { success: true, message: 'Maintenance task deleted successfully' };
  }

  async importTasks(data) {
    const { source, tasks } = data;

    if (!source) throw new ValidationError('Source is required');
    if (!tasks || !Array.isArray(tasks)) throw new ValidationError('Tasks must be an array');

    let imported = 0;
    let failed = 0;
    const errors = [];
    const importedTasks = [];

    for (const taskData of tasks) {
      try {
        if (!taskData.externalId) {
          errors.push(`Task missing externalId`);
          failed++;
          continue;
        }
        if (!taskData.assetId) {
          errors.push(`Task ${taskData.externalId} missing assetId`);
          failed++;
          continue;
        }

        const existing = await maintenanceRepo.findByExternalId(taskData.externalId, source);
        if (existing) {
          errors.push(`Task ${taskData.externalId} already imported`);
          failed++;
          continue;
        }

        const asset = await assetRepo.findById(taskData.assetId);
        if (!asset) {
          errors.push(`Asset ${taskData.assetId} not found for task ${taskData.externalId}`);
          failed++;
          continue;
        }

        // Each ID is reserved individually and atomically — avoids the
        // previous "count() + imported" pattern which skipped IDs.
        const id = await nextSequentialId('MT', () => maintenanceRepo.count());

        const failureRisk = await this._calculateFailureRisk(taskData.assetId);
        const priorityScore = this._calculatePriorityScore({
          severity: taskData.severity || 5,
          assetCriticality: asset.criticality,
          failureRisk,
          deadline: taskData.deadline,
          safetyRisk: taskData.safetyRisk || 5,
        });

        const createdTask = await maintenanceRepo.create({
          id,
          assetId: taskData.assetId,
          departmentId: taskData.departmentId,
          description: taskData.description,
          severity: taskData.severity || 5,
          estimatedDuration: taskData.estimatedDuration || 60,
          deadline: taskData.deadline,
          safetyRisk: taskData.safetyRisk || 5,
          status: 'pending',
          priorityScore,
          failureRisk,
          externalId: taskData.externalId,
          source,
        });

        importedTasks.push({ id: createdTask.id, externalId: taskData.externalId });
        imported++;
      } catch (err) {
        errors.push(`Task ${taskData.externalId || 'unknown'}: ${err.message}`);
        failed++;
      }
    }

    return {
      success: true,
      source,
      imported,
      failed,
      tasks: importedTasks,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async _calculateFailureRisk(assetId) {
    const asset = await assetRepo.findById(assetId);
    if (!asset) return 0.5;

    const failures = await historicalFailureRepo.findByAssetId(assetId);
    const failureCount = failures.length;

    let ageYears = 0;
    if (asset.installationDate) {
      ageYears = daysBetween(asset.installationDate, new Date()) / 365.25;
    }

    const conditionScore = asset.condition === 'critical' ? 0.35 : asset.condition === 'warning' ? 0.15 : 0.02;
    const criticalityScore = (asset.criticality / 10) * 0.20;
    const defectScore = (asset.defectSeverity / 10) * 0.20;
    const failureScore = Math.min(failureCount / 10, 1) * 0.15;
    const ageScore = Math.min(ageYears / 30, 1) * 0.10;

    return clamp(conditionScore + criticalityScore + defectScore + failureScore + ageScore, 0, 1);
  }

  _calculatePriorityScore({ severity, assetCriticality, failureRisk, deadline, safetyRisk }) {
    const severityScore = (severity / 10) * 30;
    const criticalityScore = (assetCriticality / 10) * 20;
    const riskScore = failureRisk * 20;
    const safetyScore = ((safetyRisk || 5) / 10) * 15;

    let overdueScore = 0;
    if (deadline) {
      const daysUntilDeadline = daysBetween(new Date(), deadline);
      if (daysUntilDeadline < 0) {
        overdueScore = 15;
      } else if (daysUntilDeadline <= 3) {
        overdueScore = 10;
      } else if (daysUntilDeadline <= 7) {
        overdueScore = 5;
      }
    }

    return parseFloat((severityScore + criticalityScore + riskScore + safetyScore + overdueScore).toFixed(2));
  }

  async _countHistory() {
    const result = await query('SELECT COUNT(*) as count FROM maintenance_history');
    return parseInt(result.rows[0].count);
  }
}

module.exports = new MaintenanceService();