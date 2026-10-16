import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import PhotoFile from '../models/PhotoFile.js'

const router = Router()

export const IMAGE_TYPE_ERROR = 'Seules les images JPEG, PNG ou WebP sont acceptées'
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter(_req, file, cb) {
    if (!IMAGE_TYPES.includes(file.mimetype)) return cb(new Error(IMAGE_TYPE_ERROR))
    cb(null, true)
  },
})

// Type réel de l'image d'après sa signature, pas seulement l'extension
export function sniffImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'image/webp'
  return null
}

const describe = (photo) => ({
  available: true,
  size: photo.size,
  updatedAt: photo.updatedAt,
  originalName: photo.originalName,
})

// Public : affichage de la photo
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const photo = await PhotoFile.findOne().sort({ createdAt: -1 })
    if (!photo) return res.status(404).json({ error: 'Aucune photo en ligne' })
    res.set({
      'Content-Type': photo.contentType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    })
    res.send(photo.data)
  }),
)

// Admin : remplace la photo
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu (champ « file »)' })
    const contentType = sniffImageType(req.file.buffer)
    if (!contentType) return res.status(400).json({ error: 'Ce fichier n’est pas une image valide' })
    await PhotoFile.deleteMany({})
    const photo = await PhotoFile.create({
      data: req.file.buffer,
      contentType,
      size: req.file.size,
      originalName: req.file.originalname,
    })
    res.status(201).json(describe(photo))
  }),
)

// Admin : retire la photo
router.delete(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    await PhotoFile.deleteMany({})
    res.status(204).end()
  }),
)

export default router
