import { authState, clearAuth } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

type ApiOptions = RequestInit & {
  skipAuthRedirect?: boolean
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (authState.token) {
    headers.set('Authorization', `Bearer ${authState.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && !options.skipAuthRedirect) {
    clearAuth()
    if (window.location.pathname !== '/signin') {
      window.location.href = '/signin'
    }
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = (payload as { message?: string })?.message || 'Request failed'
    const error = new Error(message) as Error & { status?: number; payload?: unknown }
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload as T
}
