import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { triageService } from '../services/api'
import { AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Info } from 'lucide-react'

const RISK_CONFIG = {
  URGENT: {
    label: 'URGENT — Seek Immediate Care',
    color: 'border-red-500/50 bg-red-500/8',
    badge: 'bg-red-500 text-white',
    icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
    message: 'Your symptoms indicate a potentially serious condition. Please seek emergency medical care or call emergency services immediately.',
  },
  HIGH: {
    label: 'High Risk',
    color: 'border-orange-500/40 bg-orange-500/5',
    badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
    message: 'Your symptoms suggest a condition that warrants prompt medical attention. Please consult a doctor today.',
  },
  MEDIUM: {
    label: 'Moderate Risk',
    color: 'border-yellow-500/40 bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    icon: <Info className="w-6 h-6 text-yellow-400" />,
    message: 'Your symptoms suggest a moderate-risk condition. Monitor closely and consult a doctor if symptoms worsen.',
  },
  LOW: {
    label: 'Low Risk',
    color: 'border-teal-500/40 bg-teal-500/5',
    badge: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    icon: <CheckCircle className="w-6 h-6 text-teal-400" />,
    message: 'Your symptoms appear low-risk. Rest, stay hydrated, and monitor for any changes.',
  },
}

export default function TriageResult() {
  const { id } = useParams()
  const location = useLocation()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!result)

  useEffect(() => {
    if (!result) {
      triageService.getById(id)
        .then(res => setResult(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!result) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p className="text-slate-400">Result not found.</p>
      <Link to="/triage" className="btn-primary mt-4 inline-block">Start New Check</Link>
    </div>
  )

  const config = RISK_CONFIG[result.risk_level] || RISK_CONFIG.LOW

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

      {/* Risk Level Banner */}
      <div className={`card p-5 border-2 ${config.color} animate-fade-up`}>
        <div className="flex items-center gap-3 mb-3">
          {config.icon}
          <div>
            <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}>
              {result.risk_level}
            </span>
            <h2 className="font-display text-lg font-semibold text-white mt-1">{config.label}</h2>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{config.message}</p>
      </div>

      {/* Your Symptoms */}
      <div className="card p-5 animate-fade-up stagger-1">
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Symptoms Analyzed</h3>
        <p className="text-slate-300 text-sm leading-relaxed italic">"{result.symptoms}"</p>
      </div>

      {/* Possible Conditions */}
      {result.conditions?.length > 0 && (
        <div className="card p-5 animate-fade-up stagger-2">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Possible Conditions</h3>
          <div className="space-y-3">
            {result.conditions.map((cond, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-slate-200 text-sm font-medium">{cond.name}</p>
                    {cond.confidence && (
                      <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                        {Math.round(cond.confidence * 100)}% match
                      </span>
                    )}
                  </div>
                  {cond.explanation && <p className="text-slate-400 text-xs leading-relaxed">{cond.explanation}</p>}
                  {cond.contributing_symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cond.contributing_symptoms.map((s, j) => (
                        <span key={j} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home Care Advice */}
      {result.home_care && (
        <div className="card p-5 animate-fade-up stagger-3">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Home Care Advice</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{result.home_care}</p>
        </div>
      )}

      {/* Doctor Recommendation */}
      {result.doctor_recommendation && (
        <div className="card p-5 border border-teal-500/20 animate-fade-up stagger-4">
          <h3 className="text-xs font-mono text-teal-500/70 uppercase tracking-wider mb-2">Doctor Recommendation</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{result.doctor_recommendation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 animate-fade-up">
        <Link to="/triage" className="btn-secondary flex-1 text-center text-sm">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          New Check
        </Link>
        <Link to="/history" className="btn-ghost text-sm flex items-center gap-1">
          View History <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <p className="text-slate-500 text-xs leading-relaxed">
          ⚠️ This analysis is for educational purposes only. It does not constitute a medical diagnosis. Always consult a qualified healthcare professional for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  )
}
