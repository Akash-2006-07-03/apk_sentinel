// Base URL is empty by default so requests go through Vite's dev proxy
// (see vite.config.js), which forwards /api/* to the FastAPI backend.
// Set VITE_API_BASE in a .env file if the backend isn't proxied
// (e.g. when the frontend is deployed separately).
const API_BASE = import.meta.env.VITE_API_BASE || ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function uploadApk(file, { onProgress } = {}) {
  const formData = new FormData()
  formData.append('file', file)

  let response
  try {
    response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch (networkErr) {
    throw new ApiError(
      'Could not reach the APK Sentinel backend. Make sure the server is running at ' +
        'http://127.0.0.1:8000 (uvicorn main:app --reload).',
      0,
    )
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    // Non-JSON response body, fall through with body = null
  }

  if (!response.ok) {
    const detail = body?.detail || body?.error || `Request failed with status ${response.status}`
    throw new ApiError(detail, response.status)
  }

  return body
}
