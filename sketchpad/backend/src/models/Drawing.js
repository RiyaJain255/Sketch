import mongoose from 'mongoose'

/**
 * Drawing model — stores a canvas snapshot as base64 PNG data.
 * Each drawing belongs to one user.
 *
 * Note: For production at scale, store imageData in cloud storage
 * (e.g. AWS S3 / Cloudinary) and only keep the URL in the DB.
 */
const drawingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,      // Index for fast per-user queries
  },
  title: {
    type: String,
    default: 'Untitled',
    trim: true,
    maxlength: 80,
  },
  imageData: {
    type: String,
    required: true,
    // Stores the full base64 PNG string: "data:image/png;base64,..."
  },
}, { timestamps: true })

export default mongoose.model('Drawing', drawingSchema)
