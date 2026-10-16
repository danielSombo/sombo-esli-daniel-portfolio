import mongoose from 'mongoose'
import { orderField, schemaOptions } from './options.js'

const yearMonth = {
  type: String,
  trim: true,
  default: '',
  validate: {
    validator: (v) => v === '' || /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
    message: 'Date attendue au format AAAA-MM',
  },
}

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: [true, 'Le poste est obligatoire'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, "L'entreprise est obligatoire"], trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 80, default: '' },
    start: { ...yearMonth, required: [true, 'La date de début est obligatoire'] },
    end: yearMonth,
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    stack: { type: [String], default: [] },
    order: orderField,
  },
  schemaOptions,
)

export default mongoose.model('Experience', experienceSchema)
