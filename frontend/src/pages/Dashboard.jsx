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
        <h1 className="font-display text-3xl font-bold text-white">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">What can MediAI help you with today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <Link
          to="/triage"
          className="card p-6 hover:border-teal-500/40 transition-all duration-300 group animate-fade-up stagger-1"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500/25 transition-colors">
              <Activity className="w-6 h-6 text-teal-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Symptom Triage</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Describe your symptoms and get an AI-powered risk assessment with possible conditions and advice.
          </p>
        </Link>

        <Link
          to="/prescription"
          className="card p-6 hover:border-teal-500/40 transition-all duration-300 group animate-fade-up stagger-2"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-500/25 transition-colors">
              <Pill className="w-6 h-6 text-teal-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Prescription Explainer</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
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
            <div key={i} className="card p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-2">
                {stat.icon}
                {stat.label}
              </div>
              <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="animate-fade-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Recent Activity
          </h2>
          <Link to="/history" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="card p-8 text-center text-slate-500">Loading...</div>
        ) : dashboard?.recent?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recent.map((item, i) => (
              <Link
                key={i}
                to={item.type === 'triage' ? `/triage/result/${item.id}` : `/prescription/result/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:border-slate-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'triage' ? 'bg-teal-500/15' : 'bg-blue-500/15'}`}>
                  {item.type === 'triage' ? <Activity className="w-4 h-4 text-teal-400" /> : <Pill className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{item.summary}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                {item.risk_level && (
                  <span className={riskColors[item.risk_level] || 'badge-low'}>{item.risk_level}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-slate-500 text-sm">No activity yet. Start with a symptom check or prescription explanation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
