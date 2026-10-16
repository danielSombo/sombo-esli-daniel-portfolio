import { Router } from 'express'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import Message from '../models/Message.js'

const router = Router()

// 5 messages max par heure et par IP : limite le spam
const sendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de messages envoyés, réessayez dans une heure' },
})

const text = (v) => (typeof v === 'string' ? v : '')

// Public : envoi depuis le formulaire de contact
router.post(
  '/',
  sendLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {}
    // Champ piège invisible pour les humains : s'il est rempli, c'est un robot.
    // On répond « envoyé » sans rien enregistrer.
    if (text(body.website).trim()) return res.status(201).json({ ok: true })

    await Message.create({
      name: text(body.name),
      email: text(body.email),
      subject: text(body.subject),
      message: text(body.message),
    })
    res.status(201).json({ ok: true })
  }),
)

// ─── Admin : boîte de réception ───
router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json(await Message.find().sort({ createdAt: -1 }))
  }),
)

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' })
    // Seuls « lu » et « archivé » se modifient : le contenu d'un message reste tel qu'il a été reçu
    const update = {}
    if (typeof req.body?.read === 'boolean') update.read = req.body.read
    if (typeof req.body?.archived === 'boolean') update.archived = req.body.archived
    const msg = await Message.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!msg) return res.status(404).json({ error: 'Message introuvable' })
    res.json(msg)
  }),
)

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' })
    const msg = await Message.findByIdAndDelete(req.params.id)
    if (!msg) return res.status(404).json({ error: 'Message introuvable' })
    res.status(204).end()
  }),
)

export default router
