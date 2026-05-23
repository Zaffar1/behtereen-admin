import { reactive } from 'vue'

export type AuthUser = {
  id: number
  name: string
  email: string | null
  is_admin: boolean
  is_active?: boolean
  avatar?: string | null
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  ready: boolean
}

const TOKEN_KEY = 'admin_access_token'

export const authState = reactive<AuthState>({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  ready: false,
})

export const setToken = (token: string | null) => {
  authState.token = token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(TOKEN_KEY)
}

export const setUser = (user: AuthUser | null) => {
  authState.user = user
}

export const setAuthReady = (ready: boolean) => {
  authState.ready = ready
}

export const clearAuth = () => {
  setToken(null)
  setUser(null)
}
