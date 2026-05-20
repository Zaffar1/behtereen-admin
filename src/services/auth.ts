import { apiFetch } from '@/services/api'
import { authState, clearAuth, setAuthReady, setToken, setUser, type AuthUser } from '@/stores/auth'

type CallbackResponse = {
  message: string
  access_token: string
  token_type: string
  user: AuthUser
}

const GOOGLE_START_PATH =
  (import.meta.env.VITE_GOOGLE_AUTH_START_URL as string | undefined)?.replace(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    '',
  ) || '/api/admin/auth/google/redirect'

export const getGoogleRedirectUrl = async () => {
  const data = await apiFetch<{ url: string }>(GOOGLE_START_PATH, {
    method: 'GET',
    skipAuthRedirect: true,
  })

  return data.url
}

export const completeGoogleCallback = async (loginCode: string) => {
  const data = await apiFetch<CallbackResponse>('/api/admin/auth/google/exchange', {
    method: 'POST',
    body: JSON.stringify({ login_code: loginCode }),
    skipAuthRedirect: true,
  })

  setToken(data.access_token)
  setUser(data.user)
  return data
}

export const fetchProfile = async () => {
  const profile = await apiFetch<AuthUser>('/api/auth/profile', {
    method: 'GET',
  })

  setUser(profile)
  return profile
}

export const bootstrapAuth = async () => {
  if (!authState.token) {
    setAuthReady(true)
    return
  }

  try {
    await fetchProfile()
  } catch {
    clearAuth()
  } finally {
    setAuthReady(true)
  }
}

export const logout = async () => {
  try {
    await apiFetch<{ message: string }>('/api/admin/auth/logout', { method: 'POST' })
  } finally {
    clearAuth()
  }
}
