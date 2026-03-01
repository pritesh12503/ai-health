import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/api'
import { User, Lock, CheckCircle } from 'lucide-react'

export default function Profile() {
  const { user, login } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileLoading(true)
    try {
      await userService.updateProfile({ name, email })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Update failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    setPasswordError('')
    setPasswordLoading(true)
    try {
      await userService.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Password change failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Profile Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account information</p>
      </div>

      {/* Profile Info */}
      <div className="card p-6 animate-fade-up stagger-1">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4 text-teal-400" />
          <h2 className="font-semibold text-white">Personal Information</h2>
        </div>

        {profileSuccess && (
          <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/25 rounded-lg text-teal-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm">{profileError}</div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6 animate-fade-up stagger-2">
        <div className="flex items-center gap-3 mb-5">
          <Lock className="w-4 h-4 text-teal-400" />
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/25 rounded-lg text-teal-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Password changed successfully
          </div>
        )}
        {passwordError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm">{passwordError}</div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={passwordLoading} className="btn-secondary">
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
