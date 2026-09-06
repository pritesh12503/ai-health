import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { patientService } from '../services/api'
import { Pill, Mic, Clock, ChevronRight, ArrowLeft, User } from 'lucide-react'

export default function PatientHistory() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      patientService.getById(id),
      patientService.getHistory(id),
    ])
      .then(([pRes, hRes]) => {
        setPatient(pRes.data)
        setHistory(hRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
    </div>
  )

  if (!patient) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p style={{ color: 'var(--text-muted)' }}>Patient not found.</p>
      <Link to="/patients" className="btn-primary mt-4 inline-block text-sm">Back to Patients</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

      {/* Back */}
      <Link
        to="/patients"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" /> All Patients
      </Link>

      {/* Patient card */}
      <div
        className="card p-5 animate-fade-up"
        style={{ border: '1px solid var(--accent-border)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <User className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>
              {patient.name}
            </h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
              Patient since {new Date(patient.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Age', value: patient.age ? `${patient.age} yrs` : '—' },
            { label: 'Gender', value: patient.gender || '—' },
            { label: 'Blood Group', value: patient.blood_group || '—' },
            { label: 'Phone', value: patient.phone || '—' },
          ].map(({ label, value }) => (
            <div key={label}
              className="p-2 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
              <p className="font-medium mt-0.5" style={{ color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>

        {patient.allergies && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-400">
            <span className="font-bold flex-shrink-0">⚠ Allergies:</span>
            <span>{patient.allergies}</span>
          </div>
        )}
      </div>

      {/* Prescription history */}
      <div className="animate-fade-up stagger-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
            Prescription History
          </h2>
          <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
            {history.length} record{history.length !== 1 ? 's' : ''}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No prescriptions recorded for this patient yet.</p>
            <Link to="/voice-prescription" className="btn-primary text-sm mt-4 inline-block">
              Record First Prescription
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <Link
                key={i}
                to={`/prescription/result/${item.id}`}
                className="card p-4 flex items-center gap-4 hover:border-teal-500/30 transition-colors block"
              >
                {/* Icon — mic badge if voice */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                >
                  <Pill className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  {item.is_voice_entry && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--accent)', color: 'white' }}
                      title="Voice entry"
                    >
                      <Mic className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {item.summary || item.prescription_text}
                  </p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-faint)' }}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {item.is_voice_entry && <span className="ml-2 text-teal-400">• voice</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.medication_count > 0 && (
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
