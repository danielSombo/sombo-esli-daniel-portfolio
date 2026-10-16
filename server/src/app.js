import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import multer from 'multer'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import contentRoutes from './routes/content.js'
import settingsRoutes from './routes/settings.js'
import cvRoutes from './routes/cv.js'
import photoRoutes, { IMAGE_TYPE_ERROR } from './routes/photo.js'
import { crudRouter } from './routes/crud.js'
import { imageRouter, momentPhotosRouter, projectImageRouter } from './routes/images.js'
import messageRoutes from './routes/messages.js'
import dashboardRoutes from './routes/dashboard.js'

import Certification from './models/Certification.js'
import Moment from './models/Moment.js'
import Project from './models/Project.js'
import Parcours from './models/Parcours.js'
import StackGroup from './models/StackGroup.js'
import Experience from './models/Experience.js'

export function createApp() {
  const app = express()

  const origins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  app.set('trust proxy', 1) // derrière le proxy de Render / Railway
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({ origin: origins.length ? origins : true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/content', contentRoutes)
  app.use('/api/settings', settingsRoutes)
  app.use('/api/cv', cvRoutes)
  app.use('/api/photo', photoRoutes)
  app.use('/api/images', imageRouter)
  app.use('/api/messages', messageRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/certifications', crudRouter(Certification))
  // Les routes des images passent avant le CRUD générique
  app.use('/api/projects', projectImageRouter)
  app.use('/api/projects', crudRouter(Project))
  app.use('/api/moments', momentPhotosRouter)
  app.use('/api/moments', crudRouter(Moment))
  app.use('/api/parcours', crudRouter(Parcours))
  app.use('/api/stack-groups', crudRouter(StackGroup))
  app.use('/api/experiences', crudRouter(Experience))

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Route introuvable' }))

  // Gestion d'erreurs centralisée
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Le fichier dépasse 5 Mo' : err.message
      return res.status(400).json({ error: msg })
    }
    if (err instanceof mongoose.Error.ValidationError) {
      const first = Object.values(err.errors)[0]
      return res.status(400).json({ error: first?.message || 'Données invalides' })
    }
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: `Valeur invalide pour « ${err.path} »` })
    }
    if (err?.message === 'Seuls les fichiers PDF sont acceptés' || err?.message === IMAGE_TYPE_ERROR) {
      return res.status(400).json({ error: err.message })
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON invalide' })
    }
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  })

  return app
}
