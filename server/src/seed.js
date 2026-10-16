// Remplit la base avec le contenu actuel de src/data/portfolio.js (+ le CV de public/)
// npm run seed         → ne remplit que ce qui est vide
// npm run seed:force   → remplace tout
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import * as defaults from '../../src/data/portfolio.js'
import Certification from './models/Certification.js'
import CvFile from './models/CvFile.js'
import Experience from './models/Experience.js'
import Moment from './models/Moment.js'
import Parcours from './models/Parcours.js'
import Project from './models/Project.js'
import Settings from './models/Settings.js'
import StackGroup from './models/StackGroup.js'

const force = process.argv.includes('--force')
const withOrder = (list) => list.map((item, order) => ({ ...item, order }))

async function seedCollection(Model, items, label) {
  const count = await Model.countDocuments()
  if (count > 0 && !force) {
    console.log(`• ${label} : déjà ${count} élément(s), ignoré`)
    return
  }
  await Model.deleteMany({})
  await Model.insertMany(withOrder(items))
  console.log(`✓ ${label} : ${items.length} élément(s)`)
}

await connectDB()

await seedCollection(Certification, defaults.certifications, 'Certifications')
await seedCollection(Project, defaults.projects, 'Projets')
await seedCollection(Parcours, defaults.parcours, 'Parcours')
await seedCollection(StackGroup, defaults.stackGroups, 'Stack')
await seedCollection(Experience, defaults.experiences, 'Expériences')
// Les moments sont créés sans photos : le site affiche des photos d'exemple jusqu'à l'ajout des vraies
await seedCollection(
  Moment,
  defaults.moments.map(({ photos: _photos, ...m }) => m),
  'Moments',
)

if (force || !(await Settings.exists({}))) {
  await Settings.deleteMany({})
  await Settings.create({
    profile: defaults.profile,
    links: defaults.links,
    theme: defaults.theme,
    sections: defaults.sections,
    marquee: defaults.marquee,
    cv: { label: defaults.cv.label, downloadName: defaults.cv.downloadName, meta: defaults.cv.meta },
  })
  console.log('✓ Profil, liens, couleur, bandeaux')
} else {
  console.log('• Profil : déjà présent, ignoré')
}

if (force || !(await CvFile.exists({}))) {
  try {
    const pdfPath = fileURLToPath(new URL('../../public/cv-daniel.pdf', import.meta.url))
    const data = await readFile(pdfPath)
    await CvFile.deleteMany({})
    await CvFile.create({ data, size: data.length, originalName: 'cv-daniel.pdf' })
    console.log('✓ CV importé depuis public/cv-daniel.pdf')
  } catch {
    console.log('• Pas de public/cv-daniel.pdf : CV à ajouter depuis le dashboard')
  }
}

await mongoose.disconnect()
console.log('Terminé.')
