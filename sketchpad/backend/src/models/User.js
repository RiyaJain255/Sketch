import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * User model — supports both email/password and Google OAuth users.
 * For Google users, `password` is not set; `googleId` is used instead.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    // Not required — Google OAuth users have no password
  },
  googleId: {
    type: String,
    // Unique Google sub (subject) identifier for OAuth users
  },
  avatar: {
    type: String,
    // Profile picture URL (from Google or gravatar)
  },
}, { timestamps: true })

// Hash password before saving (only if it was modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Method to verify a password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Never send password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.googleId
  return obj
}

export default mongoose.model('User', userSchema)
