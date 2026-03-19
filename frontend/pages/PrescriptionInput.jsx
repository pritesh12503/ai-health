import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prescriptionService } from '../services/api'
import { Pill, Send, AlertTriangle } from 'lucide-react'

const EXAMPLE = `Amoxicillin 500mg - Take 1 capsule 3 times daily for 7 days
Ibuprofen 400mg - Take 1 tablet every 8 hours with food as needed for pain
Cetirizine 10mg - Take 1 tablet once daily at bedtime`

export default function PrescriptionInput() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || text.trim().length < 5) {
      setError('Please enter your prescription details')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await prescriptionService.explain(text)
      navigate(`/prescription/result/${res.data.id}`, { state: { result: res.data } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Pill className="w-5 h-5 text-teal-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Prescription Explainer</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8">
          Paste your prescription below. MediAI will extract each medication and explain it in plain language — including dosage, purpose, side effects, and important warnings.
        </p>

        <div className="card p-6 mb-5">
          <form onSubmit={handleSubmit}>
            <label className="label text-base mb-3">Enter your prescription</label>
            <textarea
              className="input-field resize-none text-sm leading-relaxed font-mono mb-2"
              rows={7}
              placeholder="e.g.&#10;Amoxicillin 500mg - Take 1 capsule 3 times daily for 7 days&#10;Ibuprofen 400mg - Take 1 tablet every 8 hours with food..."
              value={text}
              onChange={(e) => { setText(e.target.value); setError('') }}
              disabled={loading}
            />

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Analyzing prescription...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Explain Prescription
                </>
              )}
            </button>
          </form>
        </div>

        {/* Example */}
        <div>
          <p className="text-slate-500 text-xs mb-3 uppercase tracking-wider font-mono">Try an example</p>
          <button
            onClick={() => setText(EXAMPLE)}
            className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-teal-500/30 hover:bg-teal-500/5 text-slate-400 hover:text-slate-200 text-xs font-mono leading-relaxed transition-all duration-200 whitespace-pre-line"
          >
            {EXAMPLE}
          </button>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-slate-500 text-xs leading-relaxed">
            ⚠️ <strong className="text-slate-400">Medical Disclaimer:</strong> This explainer is for educational purposes only. Always follow your doctor's instructions and consult your pharmacist about drug interactions.
          </p>
        </div>
      </div>
    </div>
  )
}
