/**
 * ShelfSaathi API Client
 * Centralized fetch client for backend communication.
 * Handles authentication header attachment, response envelopes, and error normalization.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

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
 * Perform an authenticated API request
 * @param {string} endpoint - API path relative to base or absolute
 * @param {RequestInit} [options={}] - Fetch options
 * @param {string} [token=null] - Optional Supabase bearer token
 * @returns {Promise<any>} Parsed response data
 */
export async function apiRequest(endpoint, options = {}, token = null) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const errorData = isJson && payload.error ? payload.error : {}
    throw new ApiError(
      errorData.message || response.statusText || 'An unexpected error occurred',
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.details || null,
      payload.request_id || null
    )
  }

  // Follow API envelope convention: return payload.data if standard envelope
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
}

export { ApiError }

