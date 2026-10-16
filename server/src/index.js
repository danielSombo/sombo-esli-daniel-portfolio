import 'dotenv/config'
import { connectDB } from './db.js'
import { createApp } from './app.js'

const required = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH']
const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.error(`Variables manquantes dans server/.env : ${missing.join(', ')}`)
  console.error('Copie server/.env.example en server/.env et remplis-le.')
  process.exit(1)
}

const port = Number(process.env.PORT) || 4000

try {
  await connectDB()
  createApp().listen(port, () => console.log(`API prête sur http://localhost:${port}`))
} catch (err) {
  console.error('Démarrage impossible :', err.message)
  process.exit(1)
}
