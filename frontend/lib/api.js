export async function apiFetch(endpoint, options = {}) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('railoptix-token')
      : null

  console.log('API REQUEST:', endpoint)
  console.log('TOKEN EXISTS:', !!token)

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `API request failed: ${response.status}`)
  }

  return data
}