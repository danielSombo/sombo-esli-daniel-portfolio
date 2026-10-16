// Contenu du site : démarre avec les valeurs de src/data/portfolio.js,
// puis se met à jour avec les données de l'API (modifiées depuis le dashboard).
// Si l'API ne répond pas, le site reste affiché avec le contenu statique.
import { computed, reactive } from 'vue'
import * as defaults from '../data/portfolio'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const apiUrl = (path) => `${API}${path}`

const clone = (v) => JSON.parse(JSON.stringify(v))

export const SETTINGS_KEYS = ['profile', 'links', 'theme', 'marquee', 'cv', 'sections']
export const LIST_KEYS = ['certifications', 'projects', 'parcours', 'stackGroups', 'experiences', 'moments']

export const content = reactive({
  settings: {
    profile: clone(defaults.profile),
    links: clone(defaults.links),
    theme: clone(defaults.theme),
    marquee: clone(defaults.marquee),
    cv: clone(defaults.cv),
    sections: clone(defaults.sections),
  },
  certifications: clone(defaults.certifications),
  projects: clone(defaults.projects),
  parcours: clone(defaults.parcours),
  stackGroups: clone(defaults.stackGroups),
  experiences: clone(defaults.experiences),
  moments: clone(defaults.moments),
  cvFromApi: false,
  photoVersion: '', // date d'envoi de la photo de profil (vide = pas de photo)
  source: 'static', // 'static' | 'api'
})

export async function loadContent() {
  try {
    const res = await fetch(apiUrl('/api/content'), { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    if (data.settings) {
      for (const key of SETTINGS_KEYS) {
        if (data.settings[key]) Object.assign(content.settings[key], data.settings[key])
      }
    }
    for (const key of LIST_KEYS) {
      if (Array.isArray(data[key])) content[key] = data[key]
    }
    content.cvFromApi = Boolean(data.cv?.available)
    content.photoVersion = data.photo?.available ? String(data.photo.updatedAt) : ''
    content.source = 'api'
  } catch (err) {
    console.info('[portfolio] API indisponible, contenu statique affiché.', err.message)
  }
}

// ─── Sections visibles et numérotation du pipeline ───
// isVisible : réglage du dashboard · isShown : activée ET avec au moins un élément
export const isVisible = (id) => id === 'contact' || content.settings.sections?.[id] !== false

const LIST_OF = {
  parcours: 'parcours',
  experience: 'experiences',
  projets: 'projects',
  certifs: 'certifications',
  moments: 'moments',
}
export const isShown = (id) => isVisible(id) && (!LIST_OF[id] || content[LIST_OF[id]].length > 0)

export const visibleStages = computed(() =>
  defaults.stages
    .filter((s) => isShown(s.id))
    .map((s, i) => ({ ...s, num: String(i + 1).padStart(2, '0'), code: `${String(i + 1).padStart(2, '0')} · ${s.step}` })),
)

export const stageOf = (id) => computed(() => visibleStages.value.find((s) => s.id === id) || { id, code: '', title: '' })

// ─── Liens ───
// Lien de téléchargement du CV : celui de l'API s'il existe, sinon le PDF de public/
export function cvHref() {
  return content.cvFromApi ? apiUrl('/api/cv') : defaults.cv.file
}

// Photo de profil : envoyée depuis le dashboard, sinon rien n'est affiché.
// Le paramètre v force le navigateur à recharger l'image quand elle est remplacée.
export function photoHref() {
  return content.photoVersion ? apiUrl(`/api/photo?v=${encodeURIComponent(content.photoVersion)}`) : ''
}

// Capture d'un projet ou photo d'un moment
export function imageHref(id) {
  return id ? apiUrl(`/api/images/${id}`) : ''
}

// ─── Projets : catégories (filtres du site) ───
export const PROJECT_CATEGORIES = [
  { value: 'processus', label: 'Processus métier' },
  { value: 'logiciel', label: 'Logiciel' },
  { value: 'data', label: 'Data' },
]

// ─── Moments : filtre partagé ───
// Le lien « Voir les photos » du parcours choisit l'expérience affichée dans la section Moments
export const momentsView = reactive({ context: '' })

// Un lien « [À_REMPLIR] » ou vide ne doit pas casser le site
export function safeUrl(url) {
  return !url || url.startsWith('[') ? '#' : url
}

// ─── Expérience : durées ───
const toMonths = (ym) => {
  const [y, m] = String(ym || '').split('-').map(Number)
  return y && m ? y * 12 + (m - 1) : null
}
const nowMonths = () => {
  const d = new Date()
  return d.getFullYear() * 12 + d.getMonth()
}

export function experienceMonths(exp) {
  const start = toMonths(exp.start)
  if (start === null) return 0
  const end = exp.current ? nowMonths() : toMonths(exp.end) ?? nowMonths()
  return Math.max(1, end - start + 1)
}

export function formatDuration(months) {
  if (!months) return ''
  const y = Math.floor(months / 12)
  const m = months % 12
  const ys = y ? `${y} an${y > 1 ? 's' : ''}` : ''
  const ms = m ? `${m} mois` : ''
  return [ys, ms].filter(Boolean).join(' et ')
}

export const totalExperience = computed(() =>
  formatDuration(content.experiences.reduce((sum, e) => sum + experienceMonths(e), 0)),
)

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
export function formatMonth(ym) {
  const [y, m] = String(ym || '').split('-').map(Number)
  return y && m ? `${MONTHS[m - 1]} ${y}` : ''
}
