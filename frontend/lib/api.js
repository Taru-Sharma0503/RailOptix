// RailOptix API client
// Talks to the Express backend. Base URL comes from NEXT_PUBLIC_API_URL
// (set this in frontend/.env.local), falling back to localhost:5000 for dev.

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

const TOKEN_KEY = 'railoptix_token'
const USER_KEY = 'railoptix_user'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// Token / user session helpers
// ---------------------------------------------------------------------------

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

// Redirect-to-login guard for use in protected page components:
//   useEffect(() => { requireAuth(router) }, [])
export function requireAuth(router) {
  if (!isAuthenticated()) {
    router.replace('/login')
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Core request wrapper
// ---------------------------------------------------------------------------

async function request(path, { method = 'GET', body, auth = true, query } = {}) {
  let url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  if (query && Object.keys(query).length) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v)
    })
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(`Could not reach RailOptix backend at ${API_BASE_URL}. Is it running?`, 0)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      clearSession()
    }
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status)
  }

  return data
}

const get = (path, query) => request(path, { method: 'GET', query })
const post = (path, body) => request(path, { method: 'POST', body })
const put = (path, body) => request(path, { method: 'PUT', body })
const del = (path) => request(path, { method: 'DELETE' })

// ---------------------------------------------------------------------------
// Resource APIs — mirrors the RailOptix backend API contract
// ---------------------------------------------------------------------------

export const authApi = {
  register: (payload) => post('/api/auth/register', payload),
  login: (payload) => post('/api/auth/login', payload),
  me: () => get('/api/auth/me'),
}

export const dashboardApi = {
  overview: (corridorId) => get('/api/dashboard/overview', { corridorId }),
}

export const networkApi = {
  get: (corridorId) => get('/api/network', { corridorId }),
  stations: () => get('/api/network/stations'),
  corridors: () => get('/api/network/corridors'),
}

export const assetsApi = {
  list: (filters) => get('/api/assets', filters),
  get: (id) => get(`/api/assets/${id}`),
  create: (payload) => post('/api/assets', payload),
  update: (id, payload) => put(`/api/assets/${id}`, payload),
  remove: (id) => del(`/api/assets/${id}`),
  history: (id) => get(`/api/assets/${id}/history`),
  risk: (id) => get(`/api/assets/${id}/risk`),
}

export const maintenanceApi = {
  list: (filters) => get('/api/maintenance', filters),
  get: (id) => get(`/api/maintenance/${id}`),
  create: (payload) => post('/api/maintenance', payload),
  update: (id, payload) => put(`/api/maintenance/${id}`, payload),
  remove: (id) => del(`/api/maintenance/${id}`),
  import: (payload) => post('/api/maintenance/import', payload),
}

export const predictionsApi = {
  maintenancePriority: (payload) => post('/api/predictions/maintenance-priority', payload),
  failureRisk: (payload) => post('/api/predictions/failure-risk', payload),
  trafficImpact: (payload) => post('/api/predictions/traffic-impact', payload),
}

export const trainsApi = {
  list: (filters) => get('/api/trains', filters),
  get: (id) => get(`/api/trains/${id}`),
  timetable: (filters) => get('/api/trains/timetable', filters),
}

export const blocksApi = {
  list: (filters) => get('/api/blocks', filters),
  get: (id) => get(`/api/blocks/${id}`),
  create: (payload) => post('/api/blocks', payload),
  update: (id, payload) => put(`/api/blocks/${id}`, payload),
  remove: (id) => del(`/api/blocks/${id}`),
  available: (filters) => get('/api/blocks/available', filters),
  conflicts: () => get('/api/blocks/conflicts'),
}

export const optimizeApi = {
  start: (payload) => post('/api/optimize', payload),
  status: (runId) => get(`/api/optimize/${runId}`),
  result: (runId) => get(`/api/optimize/${runId}/result`),
  explanation: (runId) => get(`/api/optimize/${runId}/explanation`),
  // Polls status until completed/failed. onProgress(statusPayload) fires each tick.
  async poll(runId, { intervalMs = 1500, timeoutMs = 120000, onProgress } = {}) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const s = await optimizeApi.status(runId)
      onProgress?.(s)
      if (s.status === 'completed') return optimizeApi.result(runId)
      if (s.status === 'failed') throw new ApiError(s.message || 'Optimization failed', 500)
      await new Promise((r) => setTimeout(r, intervalMs))
    }
    throw new ApiError('Optimization timed out', 408)
  },
}

export const conflictsApi = {
  list: () => get('/api/conflicts'),
  get: (id) => get(`/api/conflicts/${id}`),
  negotiate: (conflictId) => post('/api/conflicts/negotiate', { conflictId }),
  resolve: (payload) => post('/api/conflicts/resolve', payload),
}

export const simulationApi = {
  create: (payload) => post('/api/simulation', payload),
  get: (id) => get(`/api/simulation/${id}`),
  run: (id) => post(`/api/simulation/${id}/run`),
  results: (id) => get(`/api/simulation/${id}/results`),
  async poll(id, { intervalMs = 1500, timeoutMs = 60000, onProgress } = {}) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const s = await simulationApi.get(id)
      onProgress?.(s)
      if (s?.scenario?.status === 'completed') return simulationApi.results(id)
      if (s?.scenario?.status === 'failed') throw new ApiError('Simulation failed', 500)
      await new Promise((r) => setTimeout(r, intervalMs))
    }
    throw new ApiError('Simulation timed out', 408)
  },
}

export const planningApi = {
  weekly: (startDate) => get('/api/planning/weekly', { startDate }),
  monthly: (month) => get('/api/planning/monthly', { month }),
  approve: (payload) => post('/api/planning/approve', payload),
}

export const analyticsApi = {
  kpis: (from, to) => get('/api/analytics/kpis', { from, to }),
  delays: (from, to) => get('/api/analytics/delays', { from, to }),
  availability: (from, to) => get('/api/analytics/availability', { from, to }),
}

export const historyApi = {
  list: (filters) => get('/api/history', filters),
}

export const departmentsApi = {
  list: () => get('/api/departments'),
  get: (id) => get(`/api/departments/${id}`),
}