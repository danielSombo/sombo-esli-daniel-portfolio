import { Router } from 'express'
import mongoose from 'mongoose'
import { asyncHandler, requireAuth } from '../middleware/auth.js'

// Champs que le client n'a pas le droit d'écrire directement
// (imageId et photoCount sont gérés par les routes des images)
const PROTECTED = ['_id', 'id', 'createdAt', 'updatedAt', 'order', '__v', 'imageId', 'photoCount']

function clean(body = {}) {
  const out = { ...body }
  PROTECTED.forEach((k) => delete out[k])
  return out
}

function checkId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Identifiant invalide' })
    return false
  }
  return true
}

/**
 * Crée un router CRUD complet (protégé) pour un modèle Mongoose :
 *   GET    /          liste triée
 *   POST   /          ajout (placé en dernier)
 *   PUT    /reorder   nouvel ordre { ids: [...] }
 *   PUT    /:id       modification
 *   DELETE /:id       suppression
 */
export function crudRouter(Model) {
  const router = Router()
  router.use(requireAuth)

  const list = () => Model.find().sort({ order: 1, createdAt: 1 })

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json(await list())
    }),
  )

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const last = await Model.findOne().sort({ order: -1 })
      const doc = await Model.create({ ...clean(req.body), order: last ? last.order + 1 : 0 })
      res.status(201).json(doc)
    }),
  )

  router.put(
    '/reorder',
    asyncHandler(async (req, res) => {
      const { ids } = req.body || {}
      if (!Array.isArray(ids) || !ids.every((id) => mongoose.isValidObjectId(id))) {
        return res.status(400).json({ error: 'Liste d’identifiants invalide' })
      }
      await Model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { order: i } } })))
      res.json(await list())
    }),
  )

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      if (!checkId(req, res)) return
      const doc = await Model.findByIdAndUpdate(req.params.id, clean(req.body), {
        new: true,
        runValidators: true,
      })
      if (!doc) return res.status(404).json({ error: 'Élément introuvable' })
      res.json(doc)
    }),
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      if (!checkId(req, res)) return
      const doc = await Model.findByIdAndDelete(req.params.id)
      if (!doc) return res.status(404).json({ error: 'Élément introuvable' })
      res.status(204).end()
    }),
  )

  return router
}
