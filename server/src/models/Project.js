import mongoose from 'mongoose'
import ImageFile from './ImageFile.js'
import { orderField, schemaOptions } from './options.js'

export const PROJECT_CATEGORIES = ['processus', 'logiciel', 'data']

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom est obligatoire'], trim: true, maxlength: 120 },
    kind: { type: String, trim: true, maxlength: 60, default: '' },
    tagline: { type: String, trim: true, maxlength: 400, default: '' },
    learned: { type: String, trim: true, maxlength: 800, default: '' },
    stack: { type: [String], default: [] },
    demo: { type: String, trim: true, maxlength: 500, default: null },
    repo: { type: String, trim: true, maxlength: 500, default: null },
    // Ajouts : catégories (filtres du site), statut, publication, capture
    categories: {
      type: [{ type: String, enum: { values: PROJECT_CATEGORIES, message: 'Catégorie inconnue' } }],
      default: [],
    },
    inProgress: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    imageId: { type: mongoose.Schema.Types.ObjectId, default: null }, // tenu à jour par les routes de la capture
    order: orderField,
  },
  schemaOptions,
)

// Supprimer un projet supprime sa capture
projectSchema.post('findOneAndDelete', async (doc) => {
  if (doc) await ImageFile.deleteMany({ owner: 'project', ownerId: doc._id })
})

export default mongoose.model('Project', projectSchema)
