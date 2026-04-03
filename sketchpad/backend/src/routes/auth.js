import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { authenticate, signToken } from '../middleware/auth.js'

const router = Router()

// Google OAuth client for verifying tokens from the frontend
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ── POST /api/auth/signup ─────────────────────────────────────────────────
// Create a new email/password account
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }

    // Check if email is already registered
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // Create user (password hashed by pre-save hook in model)
    const user = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Signup failed' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────
// Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// ── POST /api/auth/google ─────────────────────────────────────────────────
// Google OAuth — frontend sends access_token + profile from Google
router.post('/google', async (req, res) => {
  try {
    const { access_token, profile } = req.body

    if (!profile?.sub || !profile?.email) {
      return res.status(400).json({ message: 'Invalid Google profile' })
    }

    // Find or create user by Google ID
    let user = await User.findOne({ googleId: profile.sub })

    if (!user) {
      // Also check by email in case they registered with email before
      user = await User.findOne({ email: profile.email })
      if (user) {
        // Link Google to existing account
        user.googleId = profile.sub
        user.avatar = profile.picture
        await user.save()
      } else {
        // Brand new user
        user = await User.create({
          name: profile.name,
          email: profile.email,
          googleId: profile.sub,
          avatar: profile.picture,
        })
      }
    }

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ message: 'Google authentication failed' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
// Return the currently authenticated user (used on page refresh)
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

export default router
