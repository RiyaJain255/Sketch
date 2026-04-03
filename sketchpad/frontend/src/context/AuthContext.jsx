import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: check if we have a stored token and validate it
  useEffect(() => {
    const token = localStorage.getItem('sketchpad_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get(`${API}/api/auth/me`)
        .then(res => setUser(res.data.user))
        .catch(() => {
          // Token invalid or expired — clear it
          localStorage.removeItem('sketchpad_token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Google OAuth login — send credential to backend
  const loginWithGoogle = async (credential) => {
    const res = await axios.post(`${API}/api/auth/google`, { credential })
    const { token, user } = res.data
    localStorage.setItem('sketchpad_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  // Email/password login
  const loginWithEmail = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password })
    const { token, user } = res.data
    localStorage.setItem('sketchpad_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  // Email/password signup
  const signup = async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/signup`, { name, email, password })
    const { token, user } = res.data
    localStorage.setItem('sketchpad_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('sketchpad_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
