import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { prescriptionService } from '../services/api'
import { Pill, AlertTriangle, RefreshCw, ChevronRight, Info } from 'lucide-react'

export default function PrescriptionResult() {
  const { id } = useParams()
  const location = useLocation()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!result)

  useEffect(() => {
    if (!result) {
      prescriptionService.getById(id)
        .then(res => setResult(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  )

  if (!result) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p className="text-slate-400">Result not found.</p>
      <Link to="/prescription" className="btn-primary mt-4 inline-block">Try Again</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <Pill className="w-5 h-5 text-teal-400" />
          <h1 className="font-display text-2xl font-bold text-white">Prescription Explained</h1>
        </div>
        <p className="text-slate-400 text-sm">{result.medications?.length || 0} medication(s) found and explained</p>
      </div>

      {/* Medications */}
      {result.medications?.map((med, i) => (
        <div key={i} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          {/* Drug Name */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">{med.name}</h2>
              {med.generic_name && med.generic_name !== med.name && (
                <p className="text-slate-500 text-xs mt-0.5">Generic: {med.generic_name}</p>
              )}
            </div>
            <div className="text-right">
              {med.dosage && <p className="text-teal-400 text-sm font-mono">{med.dosage}</p>}
              {med.frequency && <p className="text-slate-400 text-xs mt-0.5">{med.frequency}</p>}
            </div>
          </div>

          <div className="space-y-3">
            {/* Purpose */}
            {med.purpose && (
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">What it's for</p>
                <p className="text-slate-300 text-sm leading-relaxed">{med.purpose}</p>
              </div>
            )}

            {/* How to take */}
            {med.instructions && (
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">How to take it</p>
                <p className="text-slate-300 text-sm leading-relaxed">{med.instructions}</p>
              </div>
            )}

            {/* Side Effects */}
            {med.side_effects?.length > 0 && (
              <div className="p-3 bg-slate-800/40 rounded-xl">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Common side effects</p>
                <div className="flex flex-wrap gap-1.5">
                  {med.side_effects.map((se, j) => (
                    <span key={j} className="text-xs bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {med.warnings?.length > 0 && (
              <div className="p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-xs font-mono text-red-400/80 uppercase tracking-wider">Important warnings</p>
                </div>
                <ul className="space-y-1">
                  {med.warnings.map((w, j) => (
                    <li key={j} className="text-red-300/80 text-xs leading-relaxed flex gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Duration */}
            {med.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400">Course duration: <span className="text-slate-200">{med.duration}</span></span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3 animate-fade-up">
        <Link to="/prescription" className="btn-secondary flex-1 text-center text-sm">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          New Prescription
        </Link>
        <Link to="/history" className="btn-ghost text-sm flex items-center gap-1">
          View History <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <p className="text-slate-500 text-xs leading-relaxed">
          ⚠️ This explanation is for educational purposes only. Always follow your doctor's prescribed instructions. Consult your pharmacist for drug interactions and personalized advice.
        </p>
      </div>
    </div>
  )
}
