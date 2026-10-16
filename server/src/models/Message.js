import mongoose from 'mongoose'
import { schemaOptions } from './options.js'

// Message envoyé depuis le formulaire de contact du site
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom est obligatoire'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, "L'e-mail est obligatoire"],
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Adresse e-mail invalide'],
    },
    subject: { type: String, trim: true, maxlength: 150, default: '' },
    message: {
      type: String,
      required: [true, 'Le message est obligatoire'],
      trim: true,
      minlength: [10, 'Le message est trop court (10 caractères minimum)'],
      maxlength: [5000, 'Le message est trop long (5 000 caractères maximum)'],
    },
    read: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  schemaOptions,
)

export default mongoose.model('Message', messageSchema)
