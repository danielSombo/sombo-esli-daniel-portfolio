import mongoose from 'mongoose'

// La photo de profil est stockée directement dans MongoDB, comme le CV (5 Mo max)
const photoFileSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String, default: 'photo' },
  },
  { timestamps: true },
)

export default mongoose.model('PhotoFile', photoFileSchema)
