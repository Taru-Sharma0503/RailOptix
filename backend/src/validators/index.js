const { ValidationError } = require('../utils/errors');
const { isValidTime, isValidDate } = require('../utils/helpers');

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateAsset(req, res, next) {
  const { name, type, criticality, latitude, longitude } = req.body;
  const errors = [];
  const validTypes = ['track', 'signal', 'ohe', 'bridge', 'turnout'];

  if (req.method === 'POST') {
    if (!name) errors.push('Name is required');
    if (!type || !validTypes.includes(type)) errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }
  if (criticality !== undefined && (criticality < 1 || criticality > 10)) {
    errors.push('Criticality must be between 1 and 10');
  }
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }
  if (req.body.condition !== undefined && !['healthy', 'warning', 'critical'].includes(req.body.condition)) {
    errors.push('Condition must be healthy, warning, or critical');
  }
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateMaintenance(req, res, next) {
  const { assetId, description, severity, estimatedDuration, deadline, safetyRisk } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!assetId) errors.push('Asset ID is required');
    if (!description) errors.push('Description is required');
  }
  if (severity !== undefined && (severity < 1 || severity > 10)) {
    errors.push('Severity must be between 1 and 10');
  }
  if (estimatedDuration !== undefined && estimatedDuration < 0) {
    errors.push('Estimated duration cannot be negative');
  }
  if (safetyRisk !== undefined && (safetyRisk < 1 || safetyRisk > 10)) {
    errors.push('Safety risk must be between 1 and 10');
  }
  if (deadline !== undefined && !isValidDate(deadline)) {
    errors.push('Invalid deadline date format (use YYYY-MM-DD)');
  }
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateBlock(req, res, next) {
  const { corridorId, departmentId, date, start, end } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!corridorId) errors.push('Corridor ID is required');
    if (!departmentId) errors.push('Department ID is required');
    if (!date || !isValidDate(date)) errors.push('Valid date is required (YYYY-MM-DD)');
    if (!start || !isValidTime(start)) errors.push('Valid start time is required (HH:MM)');
    if (!end || !isValidTime(end)) errors.push('Valid end time is required (HH:MM)');

    if (start && end && isValidTime(start) && isValidTime(end)) {
      const { timeToMinutes } = require('../utils/helpers');
      const sMin = timeToMinutes(start);
      const eMin = timeToMinutes(end);
      if (eMin <= sMin) errors.push('End time must be after start time');
    }
  }
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateOptimize(req, res, next) {
  const { corridorId, planningDate, maintenanceTaskIds, blockIds, objective } = req.body;
  const errors = [];

  if (!corridorId) errors.push('Corridor ID is required');
  if (!planningDate || !isValidDate(planningDate)) errors.push('Valid planning date is required (YYYY-MM-DD)');
  if (!maintenanceTaskIds || !Array.isArray(maintenanceTaskIds) || maintenanceTaskIds.length === 0) {
    errors.push('At least one maintenance task ID is required');
  }
  if (!blockIds || !Array.isArray(blockIds)) {
    errors.push('Block IDs must be an array');
  }

  if (objective) {
    const keys = ['assetAvailability', 'trainDisruption', 'conflicts', 'blockWastage', 'safetyRisk'];
    let sum = 0;
    for (const key of keys) {
      if (objective[key] !== undefined) {
        if (typeof objective[key] !== 'number' || objective[key] < 0 || objective[key] > 1) {
          errors.push(`Objective weight '${key}' must be a number between 0 and 1`);
        }
        sum += objective[key] || 0;
      }
    }
    if (Math.abs(sum - 1) > 0.15) {
      errors.push(`Objective weights should sum to approximately 1.0 (current sum: ${sum.toFixed(2)})`);
    }
  }

  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

function validateSimulation(req, res, next) {
  const { corridorId, block, maintenanceTaskIds, trainScheduleDate } = req.body;
  const errors = [];

  if (!corridorId) errors.push('Corridor ID is required');
  if (!block || !block.start || !block.end) {
    errors.push('Block with start and end times is required');
  } else if (!isValidTime(block.start) || !isValidTime(block.end)) {
    errors.push('Block start and end must be valid time format (HH:MM)');
  }
  if (!maintenanceTaskIds || !Array.isArray(maintenanceTaskIds) || maintenanceTaskIds.length === 0) {
    errors.push('At least one maintenance task ID is required');
  }
  if (!trainScheduleDate || !isValidDate(trainScheduleDate)) {
    errors.push('Valid train schedule date is required (YYYY-MM-DD)');
  }
  if (errors.length > 0) throw new ValidationError(errors.join('; '));
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateAsset,
  validateMaintenance,
  validateBlock,
  validateOptimize,
  validateSimulation,
};
