import mongoose from 'mongoose'
import { orderField, schemaOptions } from './options.js'

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom est obligatoire'], trim: true, maxlength: 160 },
    issuer: { type: String, required: [true, "L'organisme est obligatoire"], trim: true, maxlength: 120 },
    code: { type: String, trim: true, maxlength: 40, default: '' },
    status: { type: String, enum: { values: ['obtenue', 'prevue'], message: 'Statut invalide' }, default: 'prevue' },
    date: { type: String, trim: true, maxlength: 40, default: '' },
    verifyUrl: { type: String, trim: true, maxlength: 500, default: null },
    order: orderField,
  },
  schemaOptions,
)

export default mongoose.model('Certification', certificationSchema)
