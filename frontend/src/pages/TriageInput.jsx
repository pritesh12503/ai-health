import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { triageService } from '../services/api'
import { Activity, AlertTriangle, Send } from 'lucide-react'

const EXAMPLES = [
  "I've had a 101°F fever for 3 days with a dry cough and mild headache",
  "Sharp chest pain on the left side when breathing, started 2 hours ago",
  "Runny nose, mild sore throat, and fatigue for the past 2 days",
]

export default function TriageInput() {
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!symptoms.trim() || symptoms.trim().length < 10) {
      setError('Please describe your symptoms in more detail (at least 10 characters)')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await triageService.analyze(symptoms)
      navigate(`/triage/result/${res.data.id}`, { state: { result: res.data } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Symptom Check</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8 ml-13">
          Describe your symptoms in plain language. Be as specific as possible — include duration, severity, and any relevant context.
        </p>

        {/* Form */}
        <div className="card p-6 mb-5">
          <form onSubmit={handleSubmit}>
            <label className="label text-base mb-3">What symptoms are you experiencing?</label>
            <textarea
              className="input-field resize-none text-sm leading-relaxed mb-2"
              rows={6}
              placeholder="e.g. I've had a fever of 101°F for 3 days, along with a dry cough and a mild headache. No chest pain or difficulty breathing..."
              value={symptoms}
              onChange={(e) => { setSymptoms(e.target.value); setError('') }}
              disabled={loading}
            />
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-slate-600">{symptoms.length} characters</span>
              {symptoms.length > 0 && symptoms.length < 10 && (
                <span className="text-xs text-orange-400">Add more detail for better results</span>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>
        </div>

        {/* Examples */}
        <div>
          <p className="text-slate-500 text-xs mb-3 uppercase tracking-wider font-mono">Try an example</p>
          <div className="space-y-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setSymptoms(ex)}
                className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-teal-500/30 hover:bg-teal-500/5 text-slate-400 hover:text-slate-200 text-sm transition-all duration-200"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-slate-500 text-xs leading-relaxed">
            ⚠️ <strong className="text-slate-400">Medical Disclaimer:</strong> This tool provides educational health guidance only and does not replace professional medical consultation. In case of emergency, call your local emergency number immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
