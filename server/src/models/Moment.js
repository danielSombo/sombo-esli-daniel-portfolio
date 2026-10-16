import mongoose from 'mongoose'
import ImageFile from './ImageFile.js'
import { orderField, schemaOptions } from './options.js'

// Un moment = des photos de la vie professionnelle, reliées à une expérience (ex. le stage chez Y3)
const momentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Le titre est obligatoire'], trim: true, maxlength: 140 },
    context: { type: String, trim: true, maxlength: 80, default: '' }, // étiquette de l'expérience liée
    place: { type: String, trim: true, maxlength: 120, default: '' },
    date: { type: String, trim: true, maxlength: 40, default: '' },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    published: { type: Boolean, default: true },
    photoCount: { type: Number, default: 0 }, // tenu à jour par les routes des photos
    order: orderField,
  },
  schemaOptions,
)

// Supprimer un moment supprime ses photos
momentSchema.post('findOneAndDelete', async (doc) => {
  if (doc) await ImageFile.deleteMany({ owner: 'moment', ownerId: doc._id })
})

export default mongoose.model('Moment', momentSchema)
