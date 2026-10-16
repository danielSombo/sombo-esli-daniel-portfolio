import mongoose from 'mongoose'

// Le CV PDF est stocké directement dans MongoDB (5 Mo max, bien sous la limite de 16 Mo)
const cvFileSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' },
    size: { type: Number, required: true },
    originalName: { type: String, default: 'cv.pdf' },
  },
  { timestamps: true },
)

export default mongoose.model('CvFile', cvFileSchema)
