const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let pool = null;
let supabaseClient = null;
let useSupabaseFallback = false;

function initPool() {
  const connStr = env.databaseUrl;
  if (!connStr) {
    console.log('DATABASE_URL not set — will use Supabase REST API fallback');
    return null;
  }
  return new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') || connStr.includes('pooler') ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

function initSupabaseClient() {
  if (env.supabaseUrl && env.supabaseAnonKey) {
    return createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return null;
}

pool = initPool();
supabaseClient = initSupabaseClient();

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err.message);
  });
}

async function query(text, params) {
  if (pool) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  if (!supabaseClient) {
    throw new Error('No database connection available. Set DATABASE_URL in .env');
  }

  return supabaseQuery(text, params);
}

async function supabaseQuery(text, params = []) {
  const supabase = supabaseClient;

  const insertMatch = text.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
  if (insertMatch) {
    const table = insertMatch[1];
    const columns = insertMatch[2].split(',').map((c) => c.trim());
    const valuePlaceholders = insertMatch[3].split(',').map((c) => c.trim());
    const record = {};
    columns.forEach((col, i) => {
      const placeholder = valuePlaceholders[i];
      if (placeholder.startsWith('$')) {
        const idx = parseInt(placeholder.replace('$', '')) - 1;
        record[col] = params[idx];
      } else {
        record[col] = placeholder;
      }
    });
    const { data, error } = await supabase.from(table).insert(record).select();
    if (error) throw new Error(error.message);
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  const selectMatch = text.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/is);
  if (selectMatch) {
    const columns = selectMatch[1].trim();
    const table = selectMatch[2].trim();
    const whereClause = selectMatch[3];
    const limit = selectMatch[5] ? parseInt(selectMatch[5]) : null;

    let q = supabase.from(table).select(columns === '*' ? '*' : columns);

    if (whereClause) {
      const conditions = parseWhereClause(whereClause, params);
      conditions.forEach(({ column, operator, value }) => {
        if (operator === '=') q = q.eq(column, value);
        else if (operator === 'IN') q = q.in(column, value);
      });
    }

    if (limit) q = q.limit(limit);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  const updateMatch = text.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(\w+)\s*=\s*\$(\d+)/is);
  if (updateMatch) {
    const table = updateMatch[1].trim();
    const setClause = updateMatch[2];
    const whereCol = updateMatch[3].trim();
    const whereParamIdx = parseInt(updateMatch[4]) - 1;

    const setPairs = parseSetClause(setClause, params);
    const record = {};
    setPairs.forEach(({ column, value }) => {
      record[column] = value;
    });

    const { data, error } = await supabase.from(table).update(record).eq(whereCol, params[whereParamIdx]).select();
    if (error) throw new Error(error.message);
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  const deleteMatch = text.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
  if (deleteMatch) {
    const table = deleteMatch[1].trim();
    const whereCol = deleteMatch[2].trim();
    const whereParamIdx = parseInt(deleteMatch[3]) - 1;
    const { data, error } = await supabase.from(table).delete().eq(whereCol, params[whereParamIdx]).select();
    if (error) throw new Error(error.message);
    return { rows: data || [], rowCount: data ? data.length : 0 };
  }

  throw new Error(`Unsupported query via Supabase fallback: ${text.substring(0, 100)}`);
}

function parseWhereClause(clause, params) {
  const conditions = [];
  const parts = clause.split(/\s+AND\s+/i);
  for (const part of parts) {
    const eqMatch = part.match(/(\w+)\s*=\s*\$(\d+)/);
    if (eqMatch) {
      conditions.push({ column: eqMatch[1], operator: '=', value: params[parseInt(eqMatch[2]) - 1] });
      continue;
    }
    const inMatch = part.match(/(\w+)\s+IN\s*\(([^)]+)\)/i);
    if (inMatch) {
      const placeholders = inMatch[2].split(',').map((p) => p.trim());
      const values = placeholders.map((p) => {
        if (p.startsWith('$')) return params[parseInt(p.replace('$', '')) - 1];
        return p;
      });
      conditions.push({ column: inMatch[1], operator: 'IN', value: values });
    }
  }
  return conditions;
}

function parseSetClause(clause, params) {
  const pairs = [];
  const parts = clause.split(',');
  for (const part of parts) {
    const match = part.trim().match(/(\w+)\s*=\s*(\$\d+|NOW\(\)|[^$]+)/);
    if (match) {
      const column = match[1];
      const valuePart = match[2].trim();
      if (valuePart.startsWith('$')) {
        pairs.push({ column, value: params[parseInt(valuePart.replace('$', '')) - 1] });
      } else if (valuePart.toUpperCase() === 'NOW()') {
        pairs.push({ column, value: new Date().toISOString() });
      }
    }
  }
  return pairs;
}

async function testConnection() {
  if (pool) {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connected (pg) at:', result.rows[0].now);
      return true;
    } catch (err) {
      console.error('pg connection failed:', err.message);
      console.log('Falling back to Supabase REST API...');
      pool = null;
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('departments').select('count').limit(1);
      if (error) throw error;
      console.log('Database connected (Supabase REST API)');
      useSupabaseFallback = true;
      return true;
    } catch (err) {
      console.error('Supabase REST API connection failed:', err.message);
      return false;
    }
  }

  console.error('No database connection available. Set DATABASE_URL or VITE_SUPABASE_URL in .env');
  return false;
}

module.exports = { pool: () => pool, query, testConnection, isUsingSupabaseFallback: () => useSupabaseFallback };
