import mongoose from 'mongoose'

/**
 * connectDB — establishes a MongoDB connection via Mongoose.
 * Uses the MONGODB_URI environment variable.
 */
export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options prevent deprecation warnings
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}
