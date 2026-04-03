import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LogOut, Images, PenLine } from 'lucide-react'
import '../styles/navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="nav-logo" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
            <path d="M8 32 Q14 8 20 20 Q26 32 32 8" stroke="#c9a96e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
          SketchPad
        </button>
      </div>
      <div className="navbar-right">
        <button
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <PenLine size={14} /> Draw
        </button>
        <button
          className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          onClick={() => navigate('/gallery')}
        >
          <Images size={14} /> Gallery
        </button>
        <div className="nav-user">
          {user?.avatar && <img src={user.avatar} alt={user.name} className="nav-avatar" />}
          <span>{user?.name?.split(' ')[0]}</span>
        </div>
        <button className="nav-logout" onClick={logout} title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  )
}
