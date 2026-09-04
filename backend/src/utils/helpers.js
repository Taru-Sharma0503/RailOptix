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

// Atomically reserves and returns the next sequential ID for a given prefix
// (e.g. "AST-004"). Uses a single INSERT ... ON CONFLICT ... RETURNING
// statement against the id_counters table so concurrent requests cannot
// be handed the same ID — unlike the old "SELECT COUNT(*) + 1" pattern.
//
// `legacyCounter` is an async () => number callback (typically
// repo.count()) used ONLY as a fallback when no direct Postgres pool is
// configured (i.e. the app is running against the Supabase REST fallback,
// which cannot execute an ON CONFLICT upsert). In that mode the old,
// non-atomic behavior is preserved rather than throwing.
async function nextSequentialId(prefix, legacyCounter) {
  const { query, pool } = require('../config/db');

  if (pool()) {
    try {
      const result = await query(
        `INSERT INTO id_counters (prefix, next_value) VALUES ($1, 2)
         ON CONFLICT (prefix) DO UPDATE SET next_value = id_counters.next_value + 1
         RETURNING (next_value - 1) as value`,
        [prefix]
      );
      const num = parseInt(result.rows[0].value);
      return generateId(prefix, num);
    } catch (err) {
      console.error(`nextSequentialId atomic path failed for prefix ${prefix}, falling back:`, err.message);
    }
  }

  // Supabase REST fallback (or atomic path failed): best-effort, non-atomic.
  const count = await legacyCounter();
  return generateId(prefix, count + 1);
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
  nextSequentialId,
  clamp,
  isValidTime,
  isValidDate,
  daysBetween,
};