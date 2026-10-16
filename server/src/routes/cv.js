import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import CvFile from '../models/CvFile.js'
import Settings from '../models/Settings.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Seuls les fichiers PDF sont acceptés'))
    cb(null, true)
  },
})

// Public : téléchargement du CV
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const cv = await CvFile.findOne().sort({ createdAt: -1 })
    if (!cv) return res.status(404).json({ error: 'Aucun CV en ligne' })
    const settings = await Settings.findOne()
    const name = (settings?.cv?.downloadName || 'CV.pdf').replace(/[^\w.\- ]/g, '_')
    res.set({
      'Content-Type': cv.contentType,
      'Content-Length': cv.size,
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-cache',
    })
    res.send(cv.data)
  }),
)

// Admin : remplace le CV
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu (champ « file »)' })
    // Vérifie la signature d'un vrai PDF, pas seulement l'extension
    if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ error: 'Ce fichier n’est pas un PDF valide' })
    }
    await CvFile.deleteMany({})
    const cv = await CvFile.create({
      data: req.file.buffer,
      contentType: 'application/pdf',
      size: req.file.size,
      originalName: req.file.originalname,
    })
    res.status(201).json({ available: true, size: cv.size, updatedAt: cv.updatedAt, originalName: cv.originalName })
  }),
)

// Admin : retire le CV
router.delete(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    await CvFile.deleteMany({})
    res.status(204).end()
  }),
)

export default router
