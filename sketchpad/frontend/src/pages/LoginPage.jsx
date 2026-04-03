import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/login.css'

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Google OAuth flow — uses implicit flow to get access token
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        // Fetch user info from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const profile = await res.json()
        // Send profile to our backend to create/verify user
        await loginWithGoogle(tokenResponse.access_token, profile)
        toast.success(`Welcome, ${profile.given_name}!`)
        navigate('/')
      } catch (err) {
        toast.error('Google login failed')
      } finally {
        setLoading(false)
      }
    },
    onError: () => toast.error('Google login failed'),
  })

  // Email login / signup
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(form.name, form.email, form.password)
        toast.success('Account created!')
      } else {
        await loginWithEmail(form.email, form.password)
        toast.success('Welcome back!')
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated background lines */}
      <div className="bg-lines">
        {[...Array(8)].map((_, i) => <div key={i} className="bg-line" style={{ '--i': i }} />)}
      </div>

      <div className="login-card">
        <div className="login-brand">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 32 Q14 8 20 20 Q26 32 32 8" stroke="#c9a96e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="8" cy="32" r="2.5" fill="#c9a96e"/>
            <circle cx="32" cy="8" r="2.5" fill="#c9a96e"/>
          </svg>
          <h1>SketchPad</h1>
        </div>
        <p className="login-tagline">Draw. Save. Revisit.</p>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        {/* Google button */}
        <button className="google-btn" onClick={() => googleLogin()} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="email-form">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            minLength={6}
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
