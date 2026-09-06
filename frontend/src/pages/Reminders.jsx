import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reminderService } from '../services/api'
import { Bell, Trash2, Clock, Loader, ChevronRight } from 'lucide-react'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    reminderService.getAll()
      .then(res => setReminders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await reminderService.delete(id)
      setReminders(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <Bell className="w-5 h-5" style={{ color: 'var(--teal-text)' }} />
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            My Medication Reminders
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Active daily reminders for your medicines
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--teal-main)' }} />
        </div>
      ) : reminders.length === 0 ? (
        <div className="card p-8 text-center animate-fade-up">
          <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No reminders set yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            After explaining a prescription, click the 🔔 bell icon on any medicine to set a reminder.
          </p>
          <Link to="/prescription" className="btn-primary text-sm inline-flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> Go to Prescription
          </Link>
        </div>
      ) : (
        reminders.map((r, i) => (
          <div key={r.id} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-start justify-between gap-3">

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--teal-subtle)', border: '1px solid var(--teal-border)' }}>
                  <Bell className="w-4 h-4" style={{ color: 'var(--teal-text)' }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {r.medication_name}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.dose_times?.map((t, j) => (
                      <span key={j} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--teal-subtle)', color: 'var(--teal-text)', border: '1px solid var(--teal-border)' }}>
                        <Clock className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Set on {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="p-2 rounded-lg transition-colors flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                title="Delete reminder"
              >
                {deletingId === r.id
                  ? <Loader className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" style={{ color: 'var(--red-text)' }} />
                }
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}