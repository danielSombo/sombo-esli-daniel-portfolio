// ────────────────────────────────────────────────────────────
//  CONTENU PAR DÉFAUT DU SITE
//  - Sert de contenu de secours si l'API ne répond pas.
//  - Sert à remplir la base au premier lancement (npm run seed dans server/).
//  Ensuite, tout se modifie depuis le dashboard : /admin
// ────────────────────────────────────────────────────────────

export const profile = {
  name: 'Daniel',
  handle: 'daniel',
  // Titre de poste affiché dans le hero (ex. « Ingénieur Data & Cloud ») — vide = masqué
  jobTitle: '',
  tagline: 'MASTER 2 · INGÉNIERIE DATA & CLOUD · ESATIC · ABIDJAN',
  intro:
    "Je m'appelle Daniel. Développeur full-stack JavaScript, je construis des applications de bout en bout et je me tourne vers Python, la data et le cloud. Ce site est construit comme un pipeline de données : chaque étape vous dit qui je suis.",
  status: "Disponible · stage de fin d'études",
  city: "Abidjan, Côte d'Ivoire",
  year: 2026,
}

// Couleurs du site
// accent : 'orange' | 'cobalt' | 'emeraude' | 'lime' | 'violet' | 'custom'
// customAccent : utilisée quand accent = 'custom' (#RRGGBB)
// background / ink : fond et texte (vide = valeurs d'origine)
export const theme = {
  accent: 'orange',
  customAccent: '#ff4f1a',
  background: '',
  ink: '',
}

// Sections affichées sur le site (Contact est toujours affichée)
export const sections = {
  parcours: true,
  experience: false, // à activer quand tu auras ton premier poste
  projets: true,
  certifs: true,
  stack: true,
  moments: true,
}

// ─── Expérience professionnelle ───
// start / end au format 'AAAA-MM' ; current: true = poste actuel (end ignoré)
export const experiences = [
  // {
  //   role: 'Ingénieur Data & Cloud',
  //   company: 'Nom de l’entreprise',
  //   location: 'Abidjan',
  //   start: '2027-03',
  //   end: '',
  //   current: true,
  //   description: 'Ce que tu fais au quotidien et ce que tu as livré.',
  //   stack: ['Python', 'Docker'],
  // },
]

// CV : dépose ton PDF dans public/ avec ce nom de fichier
export const cv = {
  file: '/cv-daniel.pdf',
  downloadName: 'CV-Daniel.pdf',
  label: 'cv_daniel.pdf',
  meta: 'PDF · [TAILLE] · mis à jour le [DATE]',
}

export const links = {
  email: 'mailto:[TON_EMAIL]',
  emailLabel: '[TON_EMAIL]',
  github: '[URL_GITHUB]',
  linkedin: '[URL_LINKEDIN]',
}

// Les étapes du pipeline = les sections du site, dans l'ordre.
// La numérotation (01, 02…) se recalcule selon les sections activées.
export const stages = [
  { id: 'parcours', step: 'INGEST', label: 'Parcours', title: 'Ce qui entre' },
  { id: 'experience', step: 'RUN', label: 'Expérience', title: 'Ce qui tourne en prod' },
  { id: 'moments', step: 'SNAPSHOT', label: 'Moments', title: "Hors de l'écran" },
  { id: 'projets', step: 'TRANSFORM', label: 'Projets', title: "Ce que j'en fais" },
  { id: 'certifs', step: 'VALIDATE', label: 'Certifs', title: 'Ce qui est validé' },
  { id: 'stack', step: 'LOAD', label: 'Stack', title: 'Ce qui est chargé' },
  { id: 'contact', step: 'SERVE', label: 'Contact', title: 'Écrivons la suite' },
]

// ─── Certifications ───
// status : 'obtenue' (badge VALIDÉE + bouton Vérifier) ou 'prevue' (badge PRÉVUE animé)
// Tant qu'aucune n'est obtenue, la section s'intitule « Ce qui sera validé ».
// Quand tu en obtiens une : passe-la en 'obtenue', ajoute la date et le lien de vérification
// (Credly, Microsoft Learn, etc.).
// Les 3 ci-dessous sont des suggestions : garde seulement celles que tu prépares vraiment.
export const certifications = [
  {
    name: 'GoMyCode — [NOM DU PROGRAMME]',
    issuer: 'GoMyCode',
    code: 'BOOTCAMP',
    status: 'obtenue',
    date: '[DATE]',
    verifyUrl: '[LIEN_DU_CERTIFICAT]',
  },
  {
    name: 'Microsoft Azure Fundamentals',
    issuer: 'Microsoft',
    code: 'AZ-900',
    status: 'prevue',
    date: '[DATE VISÉE]',
    verifyUrl: null,
  },
  {
    name: 'Azure Data Fundamentals',
    issuer: 'Microsoft',
    code: 'DP-900',
    status: 'prevue',
    date: '[DATE VISÉE]',
    verifyUrl: null,
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    code: 'CLF-C02',
    status: 'prevue',
    date: '[DATE VISÉE]',
    verifyUrl: null,
  },
  // Exemple de certification obtenue :
  // {
  //   name: 'Nom de la certification',
  //   issuer: 'Organisme',
  //   code: 'CODE',
  //   status: 'obtenue',
  //   date: '2026-11',
  //   verifyUrl: 'https://www.credly.com/badges/…',
  // },
]

export const parcours = [
  {
    source: 'SOURCE_01',
    title: 'Licence & premier stage',
    text: 'Un stage de fin de Licence dans un cabinet à Abidjan : ma première expérience en conditions réelles.',
    // Étiquette des moments liés : affiche « Voir les photos » sur la carte
    moments: 'Y3 Audit & Conseils',
  },
  {
    source: 'SOURCE_02',
    title: 'Master 2 SIGL · ID2C',
    text: "Systèmes informatiques et génie logiciel, spécialité Ingénierie Data & Cloud Computing, à l'ESATIC.",
  },
  {
    source: 'SOURCE_03 · EN COURS',
    title: "Le stage de fin d'études",
    text: "L'étape suivante : rejoindre une équipe data, cloud ou full-stack.",
    highlight: true,
  },
]

export const projects = [
  {
    name: 'FlowCI',
    kind: 'PROJET PHARE',
    tagline: "Un moteur de workflows visuel pour les PME : on dessine un processus métier, il s'exécute.",
    learned:
      'Architecture complète pensée dès le départ, authentification JWT et une feuille de route découpée sur six semaines.',
    stack: ['FastAPI', 'React', 'react-flow', 'PostgreSQL', 'Docker Compose', 'JWT'],
    demo: '[LIEN_DEMO_FLOWCI]',
    repo: '[LIEN_GITHUB_FLOWCI]',
  },
  {
    name: 'ImmoScraper',
    kind: 'DATA · SCRAPING',
    tagline: "Les annonces immobilières de Côte d'Ivoire, collectées et réunies en un seul endroit.",
    learned:
      "Sélecteurs de scraping robustes, mise en place de Playwright pour les pages dynamiques, galeries d'images côté front.",
    stack: ['FastAPI', 'MongoDB', 'Playwright', 'BeautifulSoup', 'React + TypeScript', 'TanStack Query'],
    demo: '[LIEN_DEMO_IMMOSCRAPER]',
    repo: '[LIEN_GITHUB_IMMOSCRAPER]',
  },
  {
    name: 'Traqode',
    kind: 'OUTIL PERSO',
    tagline: 'Le journal de bord du développeur : notes, bugs, solutions, snippets et objectifs.',
    learned:
      'Mon premier projet en TypeScript et Tailwind CSS. MongoDB, parce que chaque entrée a sa propre forme.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'MongoDB'],
    demo: '[LIEN_DEMO_TRAQODE]',
    repo: '[LIEN_GITHUB_TRAQODE]',
  },
  {
    name: 'Sites vitrines',
    kind: 'CLIENTS · VUE 3',
    tagline:
      "Trois univers : Goût Ivoire (restaurant ouest-africain), une bijouterie artisanale et un site de formation pour servants d'autel.",
    learned: "Chemins d'assets au build, zoom de galerie, lien actif dans la navigation, onglets et filtres.",
    stack: ['Vue 3', 'Tailwind CSS'],
    demo: '[LIEN_DEMO_VITRINES]',
    repo: '[LIEN_GITHUB_VITRINES]',
  },
  {
    name: 'Cluster Hadoop',
    kind: 'TP · ESATIC',
    tagline: 'Un pseudo-cluster Hadoop conteneurisé, monté en binôme.',
    learned: 'Faire cohabiter plusieurs services Big Data dans des conteneurs Docker.',
    stack: ['Hadoop', 'Docker'],
    demo: null,
    repo: '[LIEN_GITHUB_HADOOP]',
  },
  {
    name: 'Gestion universitaire',
    kind: 'PROJET DE GROUPE',
    tagline: 'Une plateforme de gestion académique développée en équipe.',
    learned: 'Programmation fonctionnelle et travail à plusieurs sur une même base de code.',
    stack: ['Scala'],
    demo: null,
    repo: '[LIEN_GITHUB_SCALA]',
  },
]

// ─── Moments ───
// Les photos de la vie professionnelle. context = étiquette de l'expérience liée
// (la même que le champ « moments » d'une étape du parcours).
// Sans photo, le site affiche des photos d'exemple : ajoute les vraies depuis le dashboard.
export const moments = [
  {
    title: "Compte rendu annuel des travaux avec l'équipe du cabinet",
    context: 'Y3 Audit & Conseils',
    place: 'Boulay Beach Resort, Île Boulay',
    date: '2024',
    description: '',
    photos: [],
  },
  {
    title: "Tournoi inter-cabinets, dans l'équipe de Y3",
    context: 'Y3 Audit & Conseils',
    place: '',
    date: '2024',
    description: '',
    photos: [],
  },
]

export const marquee = {
  solid: ['Vue.js', 'React', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB'],
  outline: ['Docker', 'FastAPI', 'TypeScript', 'Tailwind', 'Scala', 'Hadoop'],
}

export const stackGroups = [
  { label: 'FRONT', items: 'Vue.js, React, Tailwind CSS' },
  { label: 'BACK', items: 'Node.js, Express' },
  { label: 'DONNÉES & CLOUD', items: 'PostgreSQL, MongoDB, Docker, Hadoop' },
  { label: 'EN APPRENTISSAGE', items: 'Python & FastAPI, TypeScript, Scala', learning: true },
]
