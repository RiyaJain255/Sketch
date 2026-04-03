import { Router } from 'express'
import Drawing from '../models/Drawing.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All drawing routes require authentication
router.use(authenticate)

// ── GET /api/drawings ─────────────────────────────────────────────────────
// Retrieve all drawings for the logged-in user (newest first)
router.get('/', async (req, res) => {
  try {
    const drawings = await Drawing
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('title imageData createdAt') // Only return needed fields
    res.json({ drawings })
  } catch (err) {
    console.error('Get drawings error:', err)
    res.status(500).json({ message: 'Failed to fetch drawings' })
  }
})

// ── GET /api/drawings/:id ─────────────────────────────────────────────────
// Retrieve a single drawing (must belong to requesting user)
router.get('/:id', async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id,  // Security: ensure ownership
    })
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' })
    res.json({ drawing })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drawing' })
  }
})

// ── POST /api/drawings ────────────────────────────────────────────────────
// Save a new drawing
router.post('/', async (req, res) => {
  try {
    const { title, imageData } = req.body

    // Validate that imageData looks like a PNG base64 string
    if (!imageData?.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image data' })
    }

    // Enforce a reasonable size cap (~8MB base64 ≈ ~6MB image)
    if (imageData.length > 8_000_000) {
      return res.status(413).json({ message: 'Image too large (max 6MB)' })
    }

    const drawing = await Drawing.create({
      user: req.user._id,
      title: title || 'Untitled',
      imageData,
    })

    res.status(201).json({ drawing })
  } catch (err) {
    console.error('Save drawing error:', err)
    res.status(500).json({ message: 'Failed to save drawing' })
  }
})

// ── PUT /api/drawings/:id ─────────────────────────────────────────────────
// Update an existing drawing's title or image data
router.put('/:id', async (req, res) => {
  try {
    const { title, imageData } = req.body
    const update = {}
    if (title !== undefined) update.title = title
    if (imageData !== undefined) {
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image data' })
      }
      update.imageData = imageData
    }

    const drawing = await Drawing.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }  // Return the updated document
    )
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' })
    res.json({ drawing })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update drawing' })
  }
})

// ── DELETE /api/drawings/:id ──────────────────────────────────────────────
// Delete a drawing (must belong to requesting user)
router.delete('/:id', async (req, res) => {
  try {
    const drawing = await Drawing.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,  // Security: can only delete your own drawings
    })
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' })
    res.json({ message: 'Drawing deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete drawing' })
  }
})

export default router
