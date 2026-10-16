   # daniel/portfolio — « Le Pipeline »

Portfolio **SPA Vue 3 + Vite + Tailwind CSS v4** avec un **dashboard admin**
et une **API Node.js / Express + MongoDB** (auth JWT).

Le site est construit comme un pipeline de données :
`INGEST` (parcours) → `RUN` (expérience pro) → `TRANSFORM` (projets) → `VALIDATE` (certifications) → `LOAD` (stack) → `SERVE` (contact).
La numérotation 01, 02… se recalcule selon les sections activées.

```
portfolio-pipeline/
├── src/                 ← le site + le dashboard (Vue 3)
│   ├── views/           HomeView (site) · AdminLogin · AdminView (dashboard)
│   ├── components/      sections du site
│   ├── admin/           éditeurs du dashboard, client API, schémas des formulaires
│   ├── stores/content.js  contenu du site (API + repli statique)
│   ├── data/portfolio.js  contenu par défaut (secours + import initial)
│   └── theme.js         couleurs (prédéfinies ou personnalisées)
└── server/              ← l'API Express + MongoDB
    └── src/             models · routes · middleware · seed.js
```

---

## 1. Lancer en local

**Prérequis :** Node.js 20+ et une base MongoDB (en local, ou gratuite sur [MongoDB Atlas](https://www.mongodb.com/atlas)).

### L'API

```bash
cd server
npm install
cp .env.example .env
npm run hash-password -- "TonMotDePasse"   # colle la ligne affichée dans .env
```

Remplis `server/.env` : `MONGODB_URI`, `JWT_SECRET` (une longue chaîne aléatoire), `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.

```bash
npm run seed     # importe le contenu de src/data/portfolio.js + le CV de public/
npm run dev      # API sur http://localhost:4000
```

### Le site

Dans un autre terminal, à la racine :

```bash
npm install
npm run dev      # http://localhost:5173  (les appels /api sont redirigés vers l'API)
```

- Le site : http://localhost:5173
- Le dashboard : **http://localhost:5173/admin**

> Si l'API est arrêtée, le site s'affiche quand même avec le contenu de `src/data/portfolio.js`.

---

## 2. Le dashboard (`/admin`)

| Onglet | Ce que tu peux faire |
|---|---|
| **Tableau de bord** | ouvre l'admin : messages non lus, projets publiés, moments, sections en ligne, liste « À compléter » |
| **Moments** | photos de ta vie professionnelle reliées à une expérience · plusieurs photos par moment, légendes, ordre · sans photo, le site affiche une photo d'exemple |
| **Messages** | messages reçus par le formulaire de contact · lu / non lu, archiver, répondre par e-mail, supprimer |
| **Certifications** | ajouter, modifier, supprimer, réordonner · statut Obtenue / Prévue · lien de vérification |
| **Expérience pro** | postes (titre, entreprise, dates, poste actuel, stack) · les années d'expérience sont calculées automatiquement et affichées dans le hero |
| **Projets / Parcours / Stack** | ajouter, modifier, supprimer, réordonner · projets : capture, catégories (filtres du site), badge « En cours », brouillon · parcours : étiquette des moments liés (lien « Voir les photos ») |
| **Couleurs** | 5 couleurs prêtes ou une couleur personnalisée, fond et texte, aperçu en direct et contrôle du contraste |
| **Profil & liens** | titre de poste (badge du hero), statut, intro, email, GitHub, LinkedIn, bandeaux de la stack |
| **CV** | envoyer / remplacer / retirer le PDF (5 Mo max) et ses textes |

Chaque section a un interrupteur **Visible sur le site / Masquée du site**.
La section **Expérience pro** est masquée au départ : active-la quand tu auras ton premier poste.
Une section vide n'apparaît jamais sur le site.

---

## 3. Mettre en ligne (gratuit)

1. **Base de données — MongoDB Atlas** : crée un cluster gratuit (M0), un utilisateur, autorise l'accès réseau (`0.0.0.0/0`), copie l'URL `mongodb+srv://…`.
2. **API — Render** (Web Service) : dossier racine `server`, build `npm install`, start `npm start`.
   Variables d'environnement : celles de `.env` avec `CLIENT_ORIGIN=https://ton-site.vercel.app`.
   Lance ensuite une fois `npm run seed` (Render → Shell) ou en local avec l'URL Atlas.
3. **Site — Vercel** (ou Netlify) : dossier racine du projet, variable `VITE_API_URL=https://ton-api.onrender.com`.
   `vercel.json` (et `public/_redirects` pour Netlify) gèrent déjà les routes `/admin`.

> Sur le plan gratuit de Render, l'API s'endort après 15 min sans visite et met ~30 s à se réveiller.
> Ce n'est pas gênant : le site affiche immédiatement le contenu de secours, puis se met à jour quand l'API répond.

---

## 4. API — routes

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/login` | public (10 essais / 15 min) |
| GET | `/api/content` | public — tout le contenu du site |
| GET | `/api/cv` | public — téléchargement du CV |
| GET | `/api/photo` | public — photo de profil |
| GET · PUT | `/api/settings` | admin |
| POST · DELETE | `/api/cv` | admin |
| POST · DELETE | `/api/photo` | admin |
| GET · POST · PUT `/:id` · DELETE `/:id` · PUT `/reorder` | `/api/certifications` `/api/experiences` `/api/projects` `/api/parcours` `/api/stack-groups` `/api/moments` | admin |
| GET | `/api/images/:id` | public — capture d'un projet ou photo d'un moment |
| POST | `/api/messages` | public — formulaire de contact (5 envois / heure) |
| GET · PUT `/:id` · DELETE `/:id` | `/api/messages` | admin |
| POST · DELETE | `/api/projects/:id/image` | admin — capture du projet |
| GET · POST · PUT `/reorder` · PUT `/:photoId` · DELETE `/:photoId` | `/api/moments/:id/photos` | admin — photos du moment |
| GET | `/api/dashboard` | admin — résumé du tableau de bord |
Sécurité : mot de passe haché (bcrypt), token JWT de 8 h, limitation des tentatives de connexion, Helmet, CORS limité à ton site, vérification que le CV est un vrai PDF.

---

## Couleurs

Les palettes prédéfinies sont dans `src/style.css` (blocs `:root[data-accent='…']`).
Une couleur personnalisée est calculée dans `src/theme.js` : variantes lisibles sur fond clair, sur fond noir et texte posé sur l'accent.
Les animations se coupent si le visiteur a activé « réduire les animations ».
