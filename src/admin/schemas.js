// Description de chaque liste éditable dans le dashboard.
// Le composant CollectionEditor génère les formulaires à partir de ces champs.
// Types : text | textarea | url | select | tags | checkbox | month | multi (cases à cocher)
import { PROJECT_CATEGORIES } from '../stores/content'

export const collections = {
  certifications: {
    title: 'Certifications',
    endpoint: '/api/certifications',
    section: 'certifs',
    itemName: 'certification',
    fields: [
      { key: 'name', label: 'Nom de la certification', type: 'text', required: true },
      { key: 'issuer', label: 'Organisme', type: 'text', required: true, placeholder: 'GoMyCode, Microsoft…' },
      { key: 'code', label: 'Code', type: 'text', placeholder: 'AZ-900, BOOTCAMP…' },
      {
        key: 'status',
        label: 'Statut',
        type: 'select',
        options: [
          { value: 'obtenue', label: 'Obtenue (badge VALIDÉE)' },
          { value: 'prevue', label: 'Prévue (badge PRÉVUE)' },
        ],
      },
      { key: 'date', label: 'Date', type: 'text', placeholder: '2026-11 ou « Novembre 2026 »' },
      { key: 'verifyUrl', label: 'Lien de vérification', type: 'url', placeholder: 'https://…' },
    ],
    blank: () => ({ name: '', issuer: '', code: '', status: 'obtenue', date: '', verifyUrl: '' }),
    title_: (i) => i.name,
    subtitle: (i) => [i.issuer, i.code, i.date].filter(Boolean).join(' · '),
    badge: (i) => (i.status === 'obtenue' ? { text: 'VALIDÉE', strong: true } : { text: 'PRÉVUE' }),
  },

  experiences: {
    title: 'Expérience professionnelle',
    endpoint: '/api/experiences',
    section: 'experience',
    itemName: 'expérience',
    fields: [
      { key: 'role', label: 'Titre du poste', type: 'text', required: true, placeholder: 'Ingénieur Data & Cloud' },
      { key: 'company', label: 'Entreprise', type: 'text', required: true },
      { key: 'location', label: 'Lieu', type: 'text', placeholder: 'Abidjan' },
      { key: 'start', label: 'Début', type: 'month', required: true },
      { key: 'current', label: "C'est mon poste actuel", type: 'checkbox' },
      { key: 'end', label: 'Fin', type: 'month', hideIf: (f) => f.current },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Missions, réalisations…' },
      { key: 'stack', label: 'Technologies', type: 'tags', help: 'Séparées par des virgules' },
    ],
    blank: () => ({ role: '', company: '', location: '', start: '', end: '', current: true, description: '', stack: [] }),
    title_: (i) => i.role,
    subtitle: (i) => [i.company, i.current ? `depuis ${i.start}` : `${i.start} → ${i.end}`].filter(Boolean).join(' · '),
    badge: (i) => (i.current ? { text: 'EN POSTE', strong: true } : null),
  },

  projets: {
    title: 'Projets',
    endpoint: '/api/projects',
    section: 'projets',
    itemName: 'projet',
    fields: [
      { key: 'name', label: 'Nom', type: 'text', required: true },
      { key: 'kind', label: 'Étiquette', type: 'text', placeholder: 'PROJET PHARE, DATA · SCRAPING…' },
      { key: 'tagline', label: 'Accroche', type: 'textarea' },
      { key: 'learned', label: "Ce que j'y ai appris", type: 'textarea' },
      { key: 'stack', label: 'Stack', type: 'tags', help: 'Séparées par des virgules' },
      { key: 'demo', label: 'Lien de la démo', type: 'url', help: 'Vide = pas de bouton démo' },
      { key: 'repo', label: 'Lien GitHub', type: 'url' },
      {
        key: 'categories',
        label: 'Catégories (filtres du site)',
        type: 'multi',
        options: PROJECT_CATEGORIES,
        help: 'Les filtres apparaissent sur le site dès que deux catégories sont utilisées',
      },
      { key: 'inProgress', label: 'Projet en cours (badge EN COURS)', type: 'checkbox' },
      { key: 'published', label: 'Publié sur le site (décoché = brouillon)', type: 'checkbox' },
    ],
    blank: () => ({
      name: '',
      kind: '',
      tagline: '',
      learned: '',
      stack: [],
      demo: '',
      repo: '',
      categories: [],
      inProgress: false,
      published: true,
    }),
    title_: (i) => i.name,
    subtitle: (i) =>
      [i.kind, (i.stack || []).join(', '), i.imageId ? 'capture ✓' : 'sans capture'].filter(Boolean).join(' · '),
    badge: (i) =>
      i.published === false ? { text: 'BROUILLON' } : i.inProgress ? { text: 'EN COURS', strong: true } : null,
    extra: 'capture', // envoi de la capture sous le formulaire
  },

  parcours: {
    title: 'Parcours',
    endpoint: '/api/parcours',
    section: 'parcours',
    itemName: 'étape',
    fields: [
      { key: 'source', label: 'Étiquette', type: 'text', placeholder: 'SOURCE_04' },
      { key: 'title', label: 'Titre', type: 'text', required: true },
      { key: 'text', label: 'Texte', type: 'textarea' },
      { key: 'highlight', label: 'Mettre en avant (carte noire)', type: 'checkbox' },
      {
        key: 'moments',
        label: 'Étiquette des moments liés',
        type: 'text',
        placeholder: 'Y3 Audit & Conseils',
        help: 'Même étiquette que dans l’onglet Moments : affiche « Voir les photos » sur la carte',
      },
    ],
    blank: () => ({ source: '', title: '', text: '', highlight: false, moments: '' }),
    title_: (i) => i.title,
    subtitle: (i) => i.source,
    badge: (i) => (i.highlight ? { text: 'EN AVANT' } : null),
  },

  moments: {
    title: 'Moments',
    endpoint: '/api/moments',
    section: 'moments',
    itemName: 'moment',
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Tournoi inter-cabinets' },
      {
        key: 'context',
        label: 'Expérience liée (étiquette)',
        type: 'text',
        placeholder: 'Y3 Audit & Conseils',
        help: 'Sert de filtre sur le site et relie le moment à une étape du parcours',
      },
      { key: 'place', label: 'Lieu', type: 'text', placeholder: 'Boulay Beach Resort, Île Boulay' },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'Juin 2024' },
      { key: 'description', label: 'Description courte', type: 'textarea' },
      { key: 'published', label: 'Publié sur le site (décoché = brouillon)', type: 'checkbox' },
    ],
    blank: () => ({ title: '', context: '', place: '', date: '', description: '', published: true }),
    title_: (i) => i.title,
    subtitle: (i) => [i.context, i.place, i.date].filter(Boolean).join(' · '),
    badge: (i) =>
      i.published === false
        ? { text: 'BROUILLON' }
        : i.photoCount
          ? { text: `${i.photoCount} PHOTO${i.photoCount > 1 ? 'S' : ''}` }
          : { text: "PHOTOS D'EXEMPLE", strong: true },
    extra: 'photos', // gestion des photos sous le formulaire
  },

  stack: {
    title: 'Stack',
    endpoint: '/api/stack-groups',
    section: 'stack',
    itemName: 'groupe',
    fields: [
      { key: 'label', label: 'Catégorie', type: 'text', required: true, placeholder: 'FRONT, BACK…' },
      { key: 'items', label: 'Technologies', type: 'text', placeholder: 'Vue.js, React, Tailwind CSS' },
      { key: 'learning', label: 'En apprentissage (couleur d’accent)', type: 'checkbox' },
    ],
    blank: () => ({ label: '', items: '', learning: false }),
    title_: (i) => i.label,
    subtitle: (i) => i.items,
    badge: (i) => (i.learning ? { text: 'EN COURS' } : null),
  },
}

export const navItems = [
  { id: 'tableau', label: 'Tableau de bord' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'experience', label: 'Expérience pro' },
  { id: 'projets', label: 'Projets' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'moments', label: 'Moments' },
  { id: 'stack', label: 'Stack' },
  { id: 'messages', label: 'Messages' },
  { id: 'apparence', label: 'Couleurs' },
  { id: 'profil', label: 'Profil & liens' },
  { id: 'cv', label: 'CV' },
]
