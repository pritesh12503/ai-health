import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../services/api'
import { Activity, Pill, Clock, ChevronRight, Filter, Mic } from 'lucide-react'

const riskBadge = { URGENT: 'badge-urgent', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    userService.getHistory()
      .then(res => setItems(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Clock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>History</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {items.length} total {items.length === 1 ? 'query' : 'queries'}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          {[
            { key: 'all', label: 'All' },
            { key: 'triage', label: 'Symptom Checks' },
            { key: 'prescription', label: 'Prescriptions' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={filter === key
                ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                : { color: 'var(--text-muted)', border: '1px solid transparent' }
              }>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--border)' }} />
                <div className="h-3 rounded w-1/4" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>No history yet.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/triage" className="btn-primary text-sm">Check Symptoms</Link>
              <Link to="/prescription" className="btn-secondary text-sm">Explain Prescription</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <Link key={i}
                to={item.type === 'triage' ? `/triage/result/${item.id}` : `/prescription/result/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:border-teal-500/30 transition-colors block">

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                  {item.type === 'triage'
                    ? <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    : <Pill className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  }
                  {/* Voice badge */}
                  {item.is_voice_entry && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent)' }}>
                      <Mic className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {item.summary || item.symptoms || item.prescription_text}
                  </p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-faint)' }}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                    {item.is_voice_entry && <span className="ml-2" style={{ color: 'var(--accent)' }}>• voice</span>}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.risk_level && (
                    <span className={riskBadge[item.risk_level] || 'badge-low'}>{item.risk_level}</span>
                  )}
                  {item.type === 'prescription' && item.medication_count > 0 && (
                    <span className="badge-low">{item.medication_count} meds</span>
                  )}
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
