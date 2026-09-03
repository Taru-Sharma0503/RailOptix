function successResponse(data = {}, message = null) {
  const res = { success: true, ...data };
  if (message) res.message = message;
  return res;
}

function errorResponse(message, code = 500) {
  return { success: false, message };
}

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timesOverlap(startA, endA, startB, endB) {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  if (sA === null || eA === null || sB === null || eB === null) return false;
  return sA < eB && sB < eA;
}

function generateId(prefix, num) {
  return `${prefix}-${String(num).padStart(3, '0')}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isValidTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false;
  return /^\d{1,2}:\d{2}$/.test(timeStr);
}

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

module.exports = {
  successResponse,
  errorResponse,
  timeToMinutes,
  minutesToTime,
  timesOverlap,
  generateId,
  clamp,
  isValidTime,
  isValidDate,
  daysBetween,
};
