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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <Pill className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          </div>

          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Prescription Explained
          </h1>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {result.medications?.length || 0} medication(s) found and explained
        </p>
      </div>

      {/* Medications */}
      {result.medications?.map((med, i) => (
        <div key={i} className="card p-5 animate-fade-up">

          {/* Drug Name */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {med.name}
              </h2>

              {med.generic_name && med.generic_name !== med.name && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Generic: {med.generic_name}
                </p>
              )}
            </div>

            <div className="text-right">
              {med.dosage && (
                <p className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                  {med.dosage}
                </p>
              )}
              {med.frequency && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {med.frequency}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">

            {/* Purpose */}
            {med.purpose && (
              <div
                className="p-3 rounded-xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-mono uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  What it's for
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {med.purpose}
                </p>
              </div>
            )}

            {/* Instructions */}
            {med.instructions && (
              <div
                className="p-3 rounded-xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-mono uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  How to take it
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {med.instructions}
                </p>
              </div>
            )}

            {/* Side Effects */}
            {med.side_effects?.length > 0 && (
              <div
                className="p-3 rounded-xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-mono uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  Common side effects
                </p>

                <div className="flex flex-wrap gap-2">
                  {med.side_effects.map((se, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--accent-bg)',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent-border)'
                      }}
                    >
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {med.warnings?.length > 0 && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-mono uppercase text-red-600">
                    Important warnings
                  </p>
                </div>

                <ul className="space-y-1">
                  {med.warnings.map((w, j) => (
                    <li key={j} className="text-xs flex gap-2 text-red-600">
                      <span>•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Duration */}
            {med.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>
                  Course duration: <span style={{ color: 'var(--text)' }}>{med.duration}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/prescription" className="btn-secondary flex-1 text-center text-sm">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          New Prescription
        </Link>

        <Link to="/history" className="btn-ghost text-sm flex items-center gap-1">
          View History <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div
        className="p-4 rounded-xl"
        style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          ⚠️ <strong style={{ color: 'var(--text)' }}>Medical Disclaimer:</strong> This explanation is for educational purposes only. Always follow your doctor's prescribed instructions.
        </p>
      </div>
    </div>
  )
}
