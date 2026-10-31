/**
 * ShelfSaathi API Client
 * Centralized fetch client for backend communication.
 * Handles authentication header attachment, response envelopes, and error normalization.
 */

const configuredBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '')

class ApiError extends Error {
  constructor(message, status, code, details = null, requestId = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}

/**
 * Build candidate URLs to handle IPv4/IPv6 and Vite proxy fallbacks transparently.
 * @param {string} endpoint
 * @returns {string[]}
 */
function buildCandidates(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    const rawUrl = endpoint
    const candidates = [rawUrl]
    if (rawUrl.includes('localhost:8000')) {
      candidates.push(rawUrl.replace('localhost:8000', '127.0.0.1:8000'))
    } else if (rawUrl.includes('127.0.0.1:8000')) {
      candidates.push(rawUrl.replace('127.0.0.1:8000', 'localhost:8000'))
    }
    return candidates
  }

  const baseCandidates = [
    configuredBase,
    '/api/v1',
    'http://127.0.0.1:8000/api/v1',
    'http://localhost:8000/api/v1',
  ]
  const uniqueBases = Array.from(new Set(baseCandidates.map((b) => b.replace(/\/+$/, ''))))
  return uniqueBases.map((b) => `${b}${cleanEndpoint}`)
}

/**
 * Perform an authenticated API request
 * @param {string} endpoint - API path relative to base or absolute
 * @param {RequestInit} [options={}] - Fetch options
 * @param {string} [token=null] - Optional Supabase bearer token
 * @returns {Promise<any>} Parsed response data
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const candidates = buildCandidates(endpoint)

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = null
  let lastNetworkError = null

  for (const url of candidates) {
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
      break
    } catch (err) {
      lastNetworkError = err
    }
  }

  if (!response) {
    throw new ApiError(
      'Could not connect to the ShelfSaathi backend service. Please ensure the backend is running at http://127.0.0.1:8000.',
      0,
      'NETWORK_CONNECTION_ERROR',
      lastNetworkError ? lastNetworkError.message : null
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    let errorMessage = response.statusText || 'An unexpected error occurred'
    let errorCode = 'UNKNOWN_ERROR'
    let errorDetails = null

    if (isJson && payload) {
      if (payload.error) {
        errorMessage = payload.error.message || errorMessage
        errorCode = payload.error.code || errorCode
        errorDetails = payload.error.details || null
      } else if (payload.detail) {
        errorMessage =
          typeof payload.detail === 'string'
            ? payload.detail
            : JSON.stringify(payload.detail)
        errorCode = `HTTP_${response.status}`
      }
    }

    throw new ApiError(
      errorMessage,
      response.status,
      errorCode,
      errorDetails,
      payload && typeof payload === 'object' ? payload.request_id || null : null
    )
  }

  // Follow API envelope convention: return payload.data if standard envelope
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
}

export { ApiError }

