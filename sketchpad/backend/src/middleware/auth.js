import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * authenticate — Express middleware that verifies the Bearer JWT token.
 * Attaches `req.user` with the full user document on success.
 */
export async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch user from DB (ensures user still exists + gets fresh data)
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

/**
 * signToken — generates a signed JWT for a given userId.
 */
export function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }  // Tokens last 30 days
  )
}
