// Client HTTP du dashboard : ajoute le token, gère les erreurs et la déconnexion
import { apiUrl } from '../stores/content'

const TOKEN_KEY = 'portfolio_admin_token'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function isLoggedIn() {
  const token = readToken()
  if (!token) return false
  try {
    // Vérifie l'expiration sans appel réseau (le serveur revérifie de toute façon)
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* rien */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, form } = {}) {
  const headers = { Accept: 'application/json' }
  const token = readToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new ApiError("Impossible de joindre l'API. Est-elle démarrée ?", 0)
  }

  if (res.status === 401 && path !== '/api/auth/login') {
    logout()
    window.location.assign(`/admin/login?expired=1&redirect=${encodeURIComponent(location.pathname)}`)
    throw new ApiError('Session expirée', 401)
  }
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || `Erreur ${res.status}`, res.status)
  return data
}

export async function login(email, password) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, password } })
  localStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload: (p, file) => {
    const form = new FormData()
    form.append('file', file)
    return request(p, { method: 'POST', form })
  },
  // Plusieurs fichiers d'un coup (photos d'un moment)
  uploadMany: (p, files) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return request(p, { method: 'POST', form })
  },
}
