import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/api'
import { Activity, Pill, Clock, ArrowRight, TrendingUp } from 'lucide-react'

const riskColors = {
  URGENT: 'badge-urgent',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getDashboard()
      .then(res => setDashboard(res.data))
      .catch(() => setDashboard({ triage_count: 0, prescription_count: 0, recent: [] }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Welcome */}
      <div className="mb-10 animate-fade-up">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>What can MediAI help you with today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <Link to="/triage" className="card p-6 hover:border-teal-500/40 transition-all duration-300 group animate-fade-up stagger-1 block">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <Activity className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-faint)' }} />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Symptom Triage</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Describe your symptoms and get an AI-powered risk assessment with possible conditions and advice.
          </p>
        </Link>

        <Link to="/prescription" className="card p-6 hover:border-teal-500/40 transition-all duration-300 group animate-fade-up stagger-2 block">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <Pill className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-faint)' }} />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Prescription Explainer</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Paste your prescription and get plain-language explanations of each medication, dosage, and warnings.
          </p>
        </Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-up stagger-3">
          {[
            { label: 'Symptom Checks', value: dashboard?.triage_count ?? 0, icon: <Activity className="w-4 h-4" /> },
            { label: 'Prescriptions Explained', value: dashboard?.prescription_count ?? 0, icon: <Pill className="w-4 h-4" /> },
            { label: 'Total Queries', value: (dashboard?.triage_count ?? 0) + (dashboard?.prescription_count ?? 0), icon: <TrendingUp className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="card p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                {stat.icon}
                {stat.label}
              </div>
              <div className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="animate-fade-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
            Recent Activity
          </h2>
          <Link to="/history" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>View all →</Link>
        </div>

        {loading ? (
          <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : dashboard?.recent?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recent.map((item, i) => (
              <Link key={i}
                to={item.type === 'triage' ? `/triage/result/${item.id}` : `/prescription/result/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:border-teal-500/30 transition-colors block"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                  {item.type === 'triage'
                    ? <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    : <Pill className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.summary}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                {item.risk_level && (
                  <span className={riskColors[item.risk_level] || 'badge-low'}>{item.risk_level}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet. Start with a symptom check or prescription explanation.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/triage" className="btn-primary text-sm">Check Symptoms</Link>
              <Link to="/prescription" className="btn-secondary text-sm">Explain Prescription</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
