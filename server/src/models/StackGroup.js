import mongoose from 'mongoose'
import { orderField, schemaOptions } from './options.js'

const stackGroupSchema = new mongoose.Schema(
  {
    label: { type: String, required: [true, 'Le libellé est obligatoire'], trim: true, maxlength: 60 },
    items: { type: String, trim: true, maxlength: 300, default: '' },
    learning: { type: Boolean, default: false },
    order: orderField,
  },
  schemaOptions,
)

export default mongoose.model('StackGroup', stackGroupSchema)
