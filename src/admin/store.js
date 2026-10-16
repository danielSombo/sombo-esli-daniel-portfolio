// État partagé du dashboard : réglages du site + notifications
import { reactive } from 'vue'
import { api } from './api'
import { loadContent } from '../stores/content'

export const settingsState = reactive({ data: null, loading: false })

export async function loadSettings() {
  settingsState.loading = true
  try {
    settingsState.data = await api.get('/api/settings')
  } finally {
    settingsState.loading = false
  }
  return settingsState.data
}

// Envoie un ou plusieurs blocs : { theme: {...} }, { sections: {...} }…
export async function saveSettings(partial) {
  settingsState.data = await api.put('/api/settings', partial)
  refreshSite()
  return settingsState.data
}

// ─── Tableau de bord : résumé + messages non lus (pastille du menu) ───
export const dashboardState = reactive({ data: null, unread: 0 })

export async function loadDashboard() {
  dashboardState.data = await api.get('/api/dashboard')
  dashboardState.unread = dashboardState.data.messages.unread
  return dashboardState.data
}

// Met à jour le site public (même onglet) après une modification
export function refreshSite() {
  loadContent()
}

// ─── Notifications ───
export const toasts = reactive([])
let nextId = 1
export function notify(message, type = 'success') {
  const id = nextId++
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }, type === 'error' ? 6000 : 3000)
}
