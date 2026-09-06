import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientService, prescriptionService } from '../services/api'
import { Mic, MicOff, UserPlus, ChevronDown, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function VoicePrescription() {
  const navigate = useNavigate()

  // Patient state
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // New patient form
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '', phone: '', blood_group: '', allergies: '' })
  const [savingPatient, setSavingPatient] = useState(false)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const recognitionRef = useRef(null)

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load patients on mount
  useEffect(() => {
    patientService.list()
      .then(res => setPatients(res.data || []))
      .catch(() => {})
  }, [])

  // Check browser voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) setVoiceSupported(false)
  }, [])

  // ── Voice recording ────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true        // keep listening until stopped manually
    recognition.interimResults = true    // show words as they are spoken
    recognition.lang = 'en-IN'           // Indian English — best for IIITA context

    recognition.onresult = (event) => {
      let full = ''
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript
      }
      setTranscript(full)
    }

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // ── Save new patient ───────────────────────────────────────────────────────
  const handleSavePatient = async () => {
    if (!newPatient.name.trim()) return
    setSavingPatient(true)
    try {
      const res = await patientService.create({
        ...newPatient,
        age: newPatient.age ? parseInt(newPatient.age) : null,
      })
      setPatients(prev => [...prev, res.data])
      setSelectedPatient(res.data)
      setShowNewPatientForm(false)
      setNewPatient({ name: '', age: '', gender: '', phone: '', blood_group: '', allergies: '' })
    } catch {
      setError('Failed to save patient.')
    } finally {
      setSavingPatient(false)
    }
  }

  // ── Submit prescription ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setError('Please record or type a prescription first.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await prescriptionService.explain(
        transcript,
        selectedPatient?.id || null,
        true  // is_voice_entry = true
      )
      navigate(`/prescription/result/${res.data.id}`, { state: { result: res.data } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process prescription.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <Mic className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Voice Prescription
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a patient, speak the prescription, and submit — the AI will explain each medicine.
        </p>
      </div>

      {/* ── Step 1: Select Patient ─────────────────────────────────────────── */}
      <div className="card p-5 animate-fade-up stagger-1">
        <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Step 1 — Select Patient
        </h2>

        {/* Dropdown */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowPatientDropdown(!showPatientDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <span>{selectedPatient ? selectedPatient.name : 'Select existing patient...'}</span>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          </button>

          {showPatientDropdown && patients.length > 0 && (
            <div
              className="absolute z-10 w-full mt-1 rounded-xl shadow-lg overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setShowPatientDropdown(false) }}
                  className="w-full text-left px-4 py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                >
                  <span className="font-medium">{p.name}</span>
                  {p.age && <span className="ml-2" style={{ color: 'var(--text-muted)' }}>Age {p.age}</span>}
                  {p.blood_group && <span className="ml-2 text-xs" style={{ color: 'var(--text-faint)' }}>{p.blood_group}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected patient info */}
        {selectedPatient && (
          <div
            className="p-3 rounded-xl text-sm mb-3"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span style={{ color: 'var(--text)' }}><strong>Name:</strong> {selectedPatient.name}</span>
              {selectedPatient.age && <span style={{ color: 'var(--text)' }}><strong>Age:</strong> {selectedPatient.age}</span>}
              {selectedPatient.gender && <span style={{ color: 'var(--text)' }}><strong>Gender:</strong> {selectedPatient.gender}</span>}
              {selectedPatient.blood_group && <span style={{ color: 'var(--text)' }}><strong>Blood:</strong> {selectedPatient.blood_group}</span>}
              {selectedPatient.allergies && (
                <span className="text-red-400"><strong>Allergies:</strong> {selectedPatient.allergies}</span>
              )}
            </div>
          </div>
        )}

        {/* New patient toggle */}
        <button
          onClick={() => setShowNewPatientForm(!showNewPatientForm)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--accent)' }}
        >
          <UserPlus className="w-4 h-4" />
          {showNewPatientForm ? 'Cancel' : 'Add new patient'}
        </button>

        {/* New patient form */}
        {showNewPatientForm && (
          <div className="mt-4 space-y-3">
            {[
              { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Patient name' },
              { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 45' },
              { key: 'phone', label: 'Phone', type: 'text', placeholder: 'Contact number' },
              { key: 'allergies', label: 'Allergies', type: 'text', placeholder: 'e.g. Penicillin, Aspirin' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={newPatient[key]}
                  onChange={e => setNewPatient(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            ))}

            {/* Gender + Blood Group row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={e => setNewPatient(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Blood Group</label>
                <select
                  value={newPatient.blood_group}
                  onChange={e => setNewPatient(prev => ({ ...prev, blood_group: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSavePatient}
              disabled={savingPatient || !newPatient.name.trim()}
              className="btn-primary w-full text-sm"
            >
              {savingPatient ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        )}
      </div>

      {/* ── Step 2: Record Voice ───────────────────────────────────────────── */}
      <div className="card p-5 animate-fade-up stagger-2">
        <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Step 2 — Speak or Type Prescription
        </h2>

        {!voiceSupported && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-3 text-sm text-yellow-400"
            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Voice input not supported in this browser. Please type the prescription below.
          </div>
        )}

        {/* Mic button */}
        {voiceSupported && (
          <div className="flex justify-center mb-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: isListening ? 'rgba(239,68,68,0.15)' : 'var(--accent-bg)',
                border: isListening ? '2px solid rgba(239,68,68,0.5)' : '2px solid var(--accent-border)',
              }}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(239,68,68,0.2)' }} />
              )}
              {isListening
                ? <MicOff className="w-8 h-8 text-red-400" />
                : <Mic className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              }
            </button>
          </div>
        )}

        {isListening && (
          <p className="text-center text-sm mb-3 text-red-400 animate-pulse">
            Listening... speak the prescription now. Click the mic again to stop.
          </p>
        )}

        {/* Editable transcript textarea */}
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          rows={6}
          placeholder="Prescription text will appear here as you speak, or type it manually..."
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            lineHeight: '1.6',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
          You can edit the text above to fix any transcription errors before submitting.
        </p>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !transcript.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm animate-fade-up"
      >
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          : <><Send className="w-4 h-4" /> Explain Prescription</>
        }
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
        The prescription will be saved to the patient's history and explained in plain English.
      </p>
    </div>
  )
}
