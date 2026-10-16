import mongoose from 'mongoose'
import { schemaOptions } from './options.js'

export const ACCENTS = ['orange', 'cobalt', 'emeraude', 'lime', 'violet', 'custom']

const hexColor = {
  type: String,
  trim: true,
  default: '',
  validate: {
    validator: (v) => v === '' || /^#[0-9a-fA-F]{6}$/.test(v),
    message: 'Couleur attendue au format #RRGGBB',
  },
}

// Document unique : profil, liens, couleur, bandeaux, textes du CV
const settingsSchema = new mongoose.Schema(
  {
    profile: {
      name: { type: String, trim: true, maxlength: 80, default: '' },
      handle: { type: String, trim: true, maxlength: 40, default: '' },
      jobTitle: { type: String, trim: true, maxlength: 100, default: '' },
      tagline: { type: String, trim: true, maxlength: 160, default: '' },
      intro: { type: String, trim: true, maxlength: 800, default: '' },
      status: { type: String, trim: true, maxlength: 80, default: '' },
      city: { type: String, trim: true, maxlength: 80, default: '' },
      year: { type: Number, default: () => new Date().getFullYear() },
    },
    links: {
      email: { type: String, trim: true, maxlength: 200, default: '' },
      emailLabel: { type: String, trim: true, maxlength: 200, default: '' },
      github: { type: String, trim: true, maxlength: 300, default: '' },
      linkedin: { type: String, trim: true, maxlength: 300, default: '' },
    },
    theme: {
      accent: { type: String, enum: { values: ACCENTS, message: 'Couleur inconnue' }, default: 'orange' },
      customAccent: { ...hexColor, default: '#ff4f1a' },
      background: hexColor,
      ink: hexColor,
    },
    // Sections affichées sur le site (Contact est toujours affichée)
    sections: {
      parcours: { type: Boolean, default: true },
      experience: { type: Boolean, default: false },
      projets: { type: Boolean, default: true },
      certifs: { type: Boolean, default: true },
      stack: { type: Boolean, default: true },
      moments: { type: Boolean, default: true },
    },
    marquee: {
      solid: { type: [String], default: [] },
      outline: { type: [String], default: [] },
    },
    cv: {
      label: { type: String, trim: true, maxlength: 80, default: 'cv.pdf' },
      downloadName: { type: String, trim: true, maxlength: 80, default: 'CV.pdf' },
      meta: { type: String, trim: true, maxlength: 160, default: '' },
    },
  },
  schemaOptions,
)

export default mongoose.model('Settings', settingsSchema)
