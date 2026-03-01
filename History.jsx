import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { triageService, prescriptionService } from '../services/api'
import { Activity, Pill, Clock, ChevronRight, Filter } from 'lucide-react'

const riskBadge = { URGENT: 'badge-urgent', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

export default function History() {
  const [triageHistory, setTriageHistory] = useState([])
  const [prescriptionHistory, setPrescriptionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | triage | prescription

  useEffect(() => {
    Promise.all([
      triageService.getHistory(),
      prescriptionService.getHistory(),
    ]).then(([t, p]) => {
      setTriageHistory(t.data || [])
      setPrescriptionHistory(p.data || [])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const allItems = [
    ...triageHistory.map(i => ({ ...i, type: 'triage' })),
    ...prescriptionHistory.map(i => ({ ...i, type: 'prescription' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const filtered = filter === 'all' ? allItems :
    allItems.filter(i => i.type === filter)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">History</h1>
            <p className="text-slate-500 text-sm">{allItems.length} total queries</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-500" />
          {['all', 'triage', 'prescription'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {f === 'all' ? 'All' : f === 'triage' ? 'Symptom Checks' : 'Prescriptions'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-slate-500 mb-4">No history yet.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/triage" className="btn-primary text-sm">Check Symptoms</Link>
              <Link to="/prescription" className="btn-secondary text-sm">Explain Prescription</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <Link
                key={i}
                to={item.type === 'triage' ? `/triage/result/${item.id}` : `/prescription/result/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:border-slate-700 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'triage' ? 'bg-teal-500/15' : 'bg-blue-500/15'
                }`}>
                  {item.type === 'triage'
                    ? <Activity className="w-4 h-4 text-teal-400" />
                    : <Pill className="w-4 h-4 text-blue-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">
                    {item.summary || item.symptoms || item.prescription_text}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.risk_level && (
                    <span className={riskBadge[item.risk_level] || 'badge-low'}>{item.risk_level}</span>
                  )}
                  {item.type === 'prescription' && item.medication_count && (
                    <span className="badge-low">{item.medication_count} meds</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
