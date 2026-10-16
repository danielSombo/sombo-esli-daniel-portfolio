import { Router } from 'express'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import Settings from '../models/Settings.js'

const router = Router()
router.use(requireAuth)

const SECTIONS = ['profile', 'links', 'theme', 'marquee', 'cv', 'sections']

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = (await Settings.findOne()) || (await Settings.create({}))
    res.json(settings)
  }),
)

// Met à jour uniquement les blocs envoyés (profile, links, theme, marquee, cv, sections)
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const update = {}
    for (const section of SECTIONS) {
      const value = req.body?.[section]
      if (value && typeof value === 'object') {
        for (const [key, v] of Object.entries(value)) update[`${section}.${key}`] = v
      }
    }
    // Le lien mailto se déduit de l'adresse email
    if (typeof req.body?.links?.emailLabel === 'string') {
      const email = req.body.links.emailLabel.trim()
      update['links.email'] = email ? `mailto:${email}` : ''
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    res.json(settings)
  }),
)

export default router
