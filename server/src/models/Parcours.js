import mongoose from 'mongoose'
import { orderField, schemaOptions } from './options.js'

const parcoursSchema = new mongoose.Schema(
  {
    source: { type: String, trim: true, maxlength: 60, default: '' },
    title: { type: String, required: [true, 'Le titre est obligatoire'], trim: true, maxlength: 120 },
    text: { type: String, trim: true, maxlength: 600, default: '' },
    highlight: { type: Boolean, default: false },
    // Étiquette des moments liés : affiche « Voir les photos » sur la carte
    moments: { type: String, trim: true, maxlength: 80, default: '' },
    order: orderField,
  },
  schemaOptions,
)

export default mongoose.model('Parcours', parcoursSchema, 'parcours')
