'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiPatch } from '@/lib/api'

export default function ProfilePage() {
  const { user, login, token } = useAuth()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const updated = await apiPatch<typeof user>('/api/v1/users/me', form)
      if (updated && token) {
        login(token, updated as NonNullable<typeof user>)
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">Update your display name and public info.</p>
      </div>

      <div className="card p-6 max-w-lg">
        {success && <div className="alert-success mb-5"><span>✓</span>Profile updated successfully.</div>}
        {error && <div className="alert-error mb-5"><span>⚠</span>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="input-group">
            <label className="label">Display Name</label>
            <input type="text" value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="input" placeholder="How others see you" maxLength={100} />
            <p className="text-xs text-arcade-text-muted mt-1">Leave blank to use your username</p>
          </div>

          <div className="input-group">
            <label className="label">Username</label>
            <input type="text" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="input" placeholder="username" minLength={3} maxLength={30} required />
          </div>

          <div className="input-group">
            <label className="label">Email</label>
            <input type="email" value={user?.email || ''} className="input opacity-50 cursor-not-allowed" disabled />
            <p className="text-xs text-arcade-text-muted mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
