import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Activity, LogOut, Clock, Home, Sun, Moon, Mic } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path

  const activeStyle = { background: 'var(--teal-subtle)', color: 'var(--teal-text)' }
  const inactiveStyle = { color: 'var(--text-secondary)' }

  return (
    <nav style={{
      background: 'var(--bg-nav)',
      borderBottom: '1px solid var(--border-nav)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--teal-subtle)', border: '1px solid var(--teal-border)' }}>
              <Activity className="w-4 h-4" style={{ color: 'var(--teal-text)' }} />
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              MediAI
            </span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden sm:flex items-center gap-1">
              {[
                { path: '/dashboard', icon: <Home className="w-4 h-4" />, label: 'Dashboard' },
                { path: '/triage', icon: <Activity className="w-4 h-4" />, label: 'Symptom Check' },
                { path: '/prescription', icon: <span className="text-sm">💊</span>, label: 'Prescription' },
                { path: '/voice-prescription', icon: <Mic className="w-4 h-4" />, label: 'Voice Rx' },
                { path: '/history', icon: <Clock className="w-4 h-4" />, label: 'History' },
              ].map(({ path, icon, label }) => (
                <Link key={path} to={path}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:opacity-90"
                  style={isActive(path) ? activeStyle : inactiveStyle}
                  onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--teal-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {isDark
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4" style={{ color: 'var(--teal-text)' }} />
              }
            </button>

            {user ? (
              <>
                <Link to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--teal-subtle)', border: '1px solid var(--teal-border)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--teal-text)' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </Link>

                <button onClick={handleLogout}
                  className="p-2 rounded-lg transition-colors duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  title="Logout"
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red-text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
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
