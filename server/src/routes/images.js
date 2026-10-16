import { Router } from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { asyncHandler, requireAuth } from '../middleware/auth.js'
import { IMAGE_TYPE_ERROR, sniffImageType } from './photo.js'
import ImageFile from '../models/ImageFile.js'
import Moment from '../models/Moment.js'
import Project from '../models/Project.js'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS_PER_UPLOAD = 12

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo par image
  fileFilter(_req, file, cb) {
    if (!IMAGE_TYPES.includes(file.mimetype)) return cb(new Error(IMAGE_TYPE_ERROR))
    cb(null, true)
  },
})

const validId = (id) => mongoose.isValidObjectId(id)

// Vérifie le contenu réel du fichier et prépare le document à enregistrer
function toImage(file, owner, ownerId, order = 0) {
  const contentType = sniffImageType(file.buffer)
  if (!contentType) return null
  return { data: file.buffer, contentType, size: file.size, originalName: file.originalname, owner, ownerId, order }
}

// ─── Public : affichage d'une image (capture ou photo) ───
export const imageRouter = Router()

imageRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' })
    const image = await ImageFile.findById(req.params.id)
    if (!image) return res.status(404).json({ error: 'Image introuvable' })
    res.set({
      'Content-Type': image.contentType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      // Une image remplacée reçoit un nouvel identifiant : on peut la garder en cache longtemps
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    res.send(image.data)
  }),
)

// ─── Admin : capture d'un projet ───
export const projectImageRouter = Router()

projectImageRouter.post(
  '/:id/image',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' })
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu (champ « file »)' })
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Projet introuvable' })
    const doc = toImage(req.file, 'project', project._id)
    if (!doc) return res.status(400).json({ error: 'Ce fichier n’est pas une image valide' })

    await ImageFile.deleteMany({ owner: 'project', ownerId: project._id })
    const image = await ImageFile.create(doc)
    project.imageId = image._id
    await project.save()
    res.status(201).json(project)
  }),
)

projectImageRouter.delete(
  '/:id/image',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide' })
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Projet introuvable' })
    await ImageFile.deleteMany({ owner: 'project', ownerId: project._id })
    project.imageId = null
    await project.save()
    res.json(project)
  }),
)

// ─── Admin : photos d'un moment ───
export const momentPhotosRouter = Router()

const listPhotos = (momentId) => ImageFile.find({ owner: 'moment', ownerId: momentId }).select('-data').sort({ order: 1, createdAt: 1 })

async function syncCount(momentId) {
  const count = await ImageFile.countDocuments({ owner: 'moment', ownerId: momentId })
  await Moment.updateOne({ _id: momentId }, { photoCount: count })
  return count
}

// Charge le moment et vérifie les identifiants ; répond lui-même en cas d'erreur
async function findMoment(req, res) {
  if (!validId(req.params.id)) {
    res.status(400).json({ error: 'Identifiant invalide' })
    return null
  }
  const moment = await Moment.findById(req.params.id)
  if (!moment) res.status(404).json({ error: 'Moment introuvable' })
  return moment
}

momentPhotosRouter.get(
  '/:id/photos',
  requireAuth,
  asyncHandler(async (req, res) => {
    const moment = await findMoment(req, res)
    if (!moment) return
    res.json(await listPhotos(moment._id))
  }),
)

momentPhotosRouter.post(
  '/:id/photos',
  requireAuth,
  upload.array('files', MAX_PHOTOS_PER_UPLOAD),
  asyncHandler(async (req, res) => {
    const moment = await findMoment(req, res)
    if (!moment) return
    if (!req.files?.length) return res.status(400).json({ error: 'Aucune photo reçue (champ « files »)' })

    const last = await ImageFile.findOne({ owner: 'moment', ownerId: moment._id }).sort({ order: -1 }).select('order')
    let order = last ? last.order + 1 : 0
    const docs = []
    for (const file of req.files) {
      const doc = toImage(file, 'moment', moment._id, order++)
      if (!doc) return res.status(400).json({ error: `« ${file.originalname} » n’est pas une image valide` })
      docs.push(doc)
    }
    await ImageFile.insertMany(docs)
    const photoCount = await syncCount(moment._id)
    res.status(201).json({ photos: await listPhotos(moment._id), photoCount })
  }),
)

momentPhotosRouter.put(
  '/:id/photos/reorder',
  requireAuth,
  asyncHandler(async (req, res) => {
    const moment = await findMoment(req, res)
    if (!moment) return
    const { ids } = req.body || {}
    if (!Array.isArray(ids) || !ids.every(validId)) {
      return res.status(400).json({ error: 'Liste d’identifiants invalide' })
    }
    await ImageFile.bulkWrite(
      ids.map((id, i) => ({ updateOne: { filter: { _id: id, owner: 'moment', ownerId: moment._id }, update: { order: i } } })),
    )
    res.json(await listPhotos(moment._id))
  }),
)

momentPhotosRouter.put(
  '/:id/photos/:photoId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const moment = await findMoment(req, res)
    if (!moment) return
    if (!validId(req.params.photoId)) return res.status(400).json({ error: 'Identifiant invalide' })
    const caption = typeof req.body?.caption === 'string' ? req.body.caption : ''
    const photo = await ImageFile.findOneAndUpdate(
      { _id: req.params.photoId, owner: 'moment', ownerId: moment._id },
      { caption },
      { new: true, runValidators: true },
    ).select('-data')
    if (!photo) return res.status(404).json({ error: 'Photo introuvable' })
    res.json(photo)
  }),
)

momentPhotosRouter.delete(
  '/:id/photos/:photoId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const moment = await findMoment(req, res)
    if (!moment) return
    if (!validId(req.params.photoId)) return res.status(400).json({ error: 'Identifiant invalide' })
    const photo = await ImageFile.findOneAndDelete({ _id: req.params.photoId, owner: 'moment', ownerId: moment._id })
    if (!photo) return res.status(404).json({ error: 'Photo introuvable' })
    const photoCount = await syncCount(moment._id)
    res.json({ photoCount })
  }),
)
