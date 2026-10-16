import { Router } from 'express'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import Certification from '../models/Certification.js'
import CvFile from '../models/CvFile.js'
import Experience from '../models/Experience.js'
import Message from '../models/Message.js'
import Moment from '../models/Moment.js'
import Parcours from '../models/Parcours.js'
import PhotoFile from '../models/PhotoFile.js'
import Project from '../models/Project.js'
import Settings from '../models/Settings.js'
import StackGroup from '../models/StackGroup.js'

const router = Router()
router.use(requireAuth)

// Un lien vide ou encore « [À_REMPLIR] » est à compléter
const missing = (v) => !v || String(v).includes('[')

// Admin : résumé affiché à l'ouverture du dashboard
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [
      settings,
      unread,
      lastMessages,
      projects,
      moments,
      counts,
      cv,
      photo,
    ] = await Promise.all([
      Settings.findOne(),
      Message.countDocuments({ read: false, archived: false }),
      Message.find({ archived: false }).sort({ createdAt: -1 }).limit(3),
      Project.find().select('name published imageId'),
      Moment.find().select('title published photoCount'),
      Promise.all([
        Parcours.countDocuments(),
        Experience.countDocuments(),
        Certification.countDocuments(),
        StackGroup.countDocuments(),
      ]),
      CvFile.exists({}),
      PhotoFile.exists({}),
    ])

    const [parcoursCount, experienceCount, certifCount, stackCount] = counts
    const sectionsSetting = settings?.sections || {}
    const itemsOf = {
      parcours: parcoursCount,
      experience: experienceCount,
      projets: projects.filter((p) => p.published !== false).length,
      moments: moments.filter((m) => m.published !== false).length,
      certifs: certifCount,
      stack: stackCount,
    }
    const LABELS = {
      parcours: 'Parcours',
      experience: 'Expérience pro',
      projets: 'Projets',
      moments: 'Moments',
      certifs: 'Certifications',
      stack: 'Stack',
    }
    const ROUTES = { certifs: 'certifications' }
    const sections = Object.keys(LABELS).map((id) => {
      const enabled = sectionsSetting[id] !== false
      const empty = itemsOf[id] === 0
      return { id, route: ROUTES[id] || id, label: LABELS[id], enabled, empty, visible: enabled && !empty }
    })

    const withoutImage = projects.filter((p) => p.published !== false && !p.imageId).length
    const withoutPhotos = moments.filter((m) => !m.photoCount).length
    const links = settings?.links || {}

    const todo = []
    if (!photo) todo.push({ label: 'Ajouter ta photo de profil', route: 'profil' })
    if (!cv) todo.push({ label: 'Ajouter ton CV en PDF', route: 'cv' })
    if (missing(links.emailLabel)) todo.push({ label: 'Renseigner ton adresse e-mail', route: 'profil' })
    if (missing(links.github)) todo.push({ label: 'Renseigner ton lien GitHub', route: 'profil' })
    if (missing(links.linkedin)) todo.push({ label: 'Renseigner ton lien LinkedIn', route: 'profil' })
    if (withoutImage) {
      todo.push({ label: `Ajouter la capture de ${withoutImage} projet${withoutImage > 1 ? 's' : ''}`, route: 'projets' })
    }
    if (withoutPhotos) {
      todo.push({
        label: `Remplacer les photos d'exemple de ${withoutPhotos} moment${withoutPhotos > 1 ? 's' : ''}`,
        route: 'moments',
      })
    }

    res.json({
      messages: { unread, last: lastMessages },
      projects: {
        published: projects.filter((p) => p.published !== false).length,
        drafts: projects.filter((p) => p.published === false).length,
        withoutImage,
      },
      moments: { total: moments.length, withoutPhotos },
      sections,
      todo,
    })
  }),
)

export default router
