import { Router } from 'express'
import { asyncHandler } from '../middleware/auth.js'
import Certification from '../models/Certification.js'
import CvFile from '../models/CvFile.js'
import Experience from '../models/Experience.js'
import ImageFile from '../models/ImageFile.js'
import Moment from '../models/Moment.js'
import Parcours from '../models/Parcours.js'
import PhotoFile from '../models/PhotoFile.js'
import Project from '../models/Project.js'
import Settings from '../models/Settings.js'
import StackGroup from '../models/StackGroup.js'

const router = Router()
const byOrder = { order: 1, createdAt: 1 }

// Public : tout le contenu du site en un seul appel
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [settings, certifications, projects, parcours, stackGroups, experiences, cv, photo, momentDocs] = await Promise.all([
      Settings.findOne(),
      Certification.find().sort(byOrder),
      // Un projet ou un moment en brouillon n'apparaît pas sur le site
      Project.find({ published: { $ne: false } }).sort(byOrder),
      Parcours.find().sort(byOrder),
      StackGroup.find().sort(byOrder),
      Experience.find().sort(byOrder),
      CvFile.findOne().sort({ createdAt: -1 }).select('size updatedAt originalName'),
      PhotoFile.findOne().sort({ createdAt: -1 }).select('size updatedAt originalName'),
      Moment.find({ published: { $ne: false } }).sort(byOrder),
    ])

    // Chaque moment avec la liste de ses photos (identifiant + légende)
    const photos = await ImageFile.find({ owner: 'moment', ownerId: { $in: momentDocs.map((m) => m._id) } })
      .select('ownerId caption order')
      .sort({ order: 1, createdAt: 1 })
    const moments = momentDocs.map((m) => ({
      ...m.toJSON(),
      photos: photos
        .filter((p) => p.ownerId.equals(m._id))
        .map((p) => ({ id: p._id.toString(), caption: p.caption })),
    }))

    res.set('Cache-Control', 'no-cache')
    res.json({
      settings,
      certifications,
      projects,
      parcours,
      stackGroups,
      experiences,
      moments,
      cv: cv ? { available: true, size: cv.size, updatedAt: cv.updatedAt, originalName: cv.originalName } : { available: false },
      photo: photo
        ? { available: true, size: photo.size, updatedAt: photo.updatedAt, originalName: photo.originalName }
        : { available: false },
    })
  }),
)

export default router
