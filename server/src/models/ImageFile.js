import mongoose from 'mongoose'

// Images des projets (capture) et des moments (photos), stockées dans MongoDB comme le CV
const imageFileSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String, default: 'image' },
    owner: { type: String, enum: ['project', 'moment'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    caption: { type: String, trim: true, maxlength: 200, default: '' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.data // jamais le contenu binaire dans le JSON
        return ret
      },
    },
  },
)

export default mongoose.model('ImageFile', imageFileSchema)
