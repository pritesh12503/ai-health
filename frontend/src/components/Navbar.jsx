import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, LogOut, User, Clock, Home } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/40 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-display font-semibold text-lg text-white">MediAI</span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/triage"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/triage')
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <Activity className="w-4 h-4" />
                Symptom Check
              </Link>
              <Link
                to="/prescription"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/prescription')
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <span className="text-sm">💊</span>
                Prescription
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/history')
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <Clock className="w-4 h-4" />
                History
              </Link>
            </div>
          )}

          {/* Right side */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <span className="text-teal-400 text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
