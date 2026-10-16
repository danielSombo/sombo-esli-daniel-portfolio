import jwt from 'jsonwebtoken'

// Vérifie le header « Authorization: Bearer <token> » sur les routes admin
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentification requise' })
  }
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expirée, reconnecte-toi' })
  }
}

// Évite d'écrire try/catch dans chaque route async (Express 4)
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
