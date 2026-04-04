'use client'

import { FormEvent, useState } from 'react'
import { apiPost } from '@/lib/api'

export default function SecurityPage() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const strength = (() => {
    const p = form.new_password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthColor = ['', 'bg-arcade-error', 'bg-arcade-warning', 'bg-arcade-info', 'bg-arcade-success'][strength]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (form.new_password !== form.confirm) { setError('New passwords do not match'); return }
    if (form.new_password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await apiPost('/api/v1/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess(true)
      setForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err: any) {
      setError(err.message || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (
    key: keyof typeof form,
    showKey: keyof typeof show,
    label: string,
    placeholder: string
  ) => (
    <div className="input-group">
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="input no-password-toggle pr-12"
          placeholder={placeholder}
          required
        />
        <button type="button"
          onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
          {show[showKey] ? '👁️' : '🙈'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">Manage your password and account security.</p>
      </div>

      <div className="card p-6 max-w-lg">
        <h2 className="text-base font-semibold mb-5">Change Password</h2>
        {success && <div className="alert-success mb-5"><span>✓</span>Password updated successfully.</div>}
        {error && <div className="alert-error mb-5"><span>⚠</span>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {field('current_password', 'current', 'Current Password', 'Your current password')}

          <div className="input-group">
            <label className="label">New Password</label>
            <div className="relative">
              <input type={show.new ? 'text' : 'password'} value={form.new_password}
                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                className="input no-password-toggle pr-12" placeholder="Min. 8 characters" required minLength={8} />
              <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                {show.new ? '👁️' : '🙈'}
              </button>
            </div>
            {form.new_password && (
              <div className="mt-2 flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-arcade-surface-3'}`} />
                ))}
              </div>
            )}
          </div>

          {field('confirm', 'confirm', 'Confirm New Password', 'Repeat new password')}

          <button type="submit" disabled={loading || form.new_password !== form.confirm}
            className="btn-primary">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="card p-6 max-w-lg">
        <h2 className="text-base font-semibold mb-2">Account Security Tips</h2>
        <ul className="space-y-2 text-sm text-arcade-text-muted">
          {[
            'Use a unique password not used on other sites',
            'Include uppercase, numbers, and symbols',
            'Never share your password with anyone',
            'Log out of sessions you no longer use',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-arcade-success mt-0.5">✓</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
