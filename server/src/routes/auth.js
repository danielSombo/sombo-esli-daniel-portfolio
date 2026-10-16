import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { asyncHandler, requireAuth } from '../middleware/auth.js'

const router = Router()

// 10 tentatives de connexion max par quart d'heure et par IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessaie dans 15 minutes' },
})

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const hash = process.env.ADMIN_PASSWORD_HASH || ''
    const emailOk = email.trim().toLowerCase() === adminEmail
    // On compare toujours le mot de passe, même si l'email est faux (même temps de réponse)
    const passwordOk = hash ? await bcrypt.compare(password, hash) : false

    if (!emailOk || !passwordOk) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    const token = jwt.sign({ sub: 'admin', email: adminEmail }, process.env.JWT_SECRET, { expiresIn: '8h' })
    res.json({ token, email: adminEmail })
  }),
)

router.get('/me', requireAuth, (req, res) => {
  res.json({ email: req.admin.email })
})

export default router
