import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Activity, LogOut, Clock, Home, Pill, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/40 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
              <Activity className="w-4 h-4 text-teal-500" />
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>MediAI</span>
          </Link>

          {user && (
            <div className="hidden sm:flex items-center gap-1">
              {[
                { path: '/dashboard', icon: <Home className="w-4 h-4" />, label: 'Dashboard' },
                { path: '/triage', icon: <Activity className="w-4 h-4" />, label: 'Symptom Check' },
                { path: '/prescription', icon: <Pill className="w-4 h-4" />, label: 'Prescription' },
                { path: '/history', icon: <Clock className="w-4 h-4" />, label: 'History' },
              ].map(({ path, icon, label }) => (
                <Link key={path} to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path) ? 'bg-teal-500/15 text-teal-500' : 'hover:bg-teal-500/10'}`}
                  style={{ color: isActive(path) ? undefined : 'var(--text-muted)' }}
                >
                  {icon}{label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1"
              style={{ background: isDark ? 'linear-gradient(135deg,#1e293b,#0f172a)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)', border: '1px solid var(--border)' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Moon className="absolute left-1.5 w-3.5 h-3.5 text-slate-400" />
              <Sun className="absolute right-1.5 w-3.5 h-3.5 text-yellow-500" />
              <div className="w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-300 z-10"
                style={{ transform: isDark ? 'translateX(0)' : 'translateX(28px)', background: isDark ? '#94a3b8' : '#fbbf24' }}>
                {isDark ? <Moon className="w-3 h-3 text-slate-900" /> : <Sun className="w-3 h-3 text-white" />}
              </div>
            </button>

            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-teal-500/10" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                    <span className="text-teal-500 text-xs font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400" style={{ color: 'var(--text-muted)' }} title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
