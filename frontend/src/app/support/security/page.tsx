'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SecuritySupportPage() {
  const [form, setForm] = useState({ email: '', username: '', issue: '', details: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-bold">Security Report Received</h1>
        <p className="text-arcade-text-muted text-sm">Our security team will review your report within 24 hours. If your account is at immediate risk, we&apos;ll prioritise it.</p>
        <Link href="/support" className="btn-outline">Back to Support</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/support" className="hover:text-arcade-primary">Support</Link> › Security
        </p>
        <h1 className="text-2xl font-black">Account & Security</h1>
        <p className="text-arcade-text-muted text-sm mt-1">Locked out, hacked, or spotted something suspicious?</p>
      </div>

      <div className="card p-4 space-y-2">
        <p className="font-semibold text-xs text-arcade-text">Quick actions first:</p>
        <ul className="text-xs text-arcade-text-muted list-disc list-inside space-y-1">
          <li>Can still log in? <Link href="/account/security" className="text-arcade-primary hover:underline">Change your password now →</Link></li>
          <li>Suspicious login? <Link href="/account/sessions" className="text-arcade-primary hover:underline">Revoke all sessions →</Link></li>
          <li>Forgot password? <Link href="/auth/forgot-password" className="text-arcade-primary hover:underline">Reset via email →</Link></li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Email</label>
            <input required type="email" className="input" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
          </div>
          <div className="input-group">
            <label className="label">Username</label>
            <input required type="text" className="input" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="your_username" />
          </div>
        </div>

        <div className="input-group">
          <label className="label">Issue Type</label>
          <select className="input" value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}>
            <option value="">Select an issue...</option>
            <option>Can&apos;t log in / locked out</option>
            <option>Account hacked / unauthorised access</option>
            <option>Suspicious login notification</option>
            <option>Lost access to email</option>
            <option>Security vulnerability disclosure</option>
            <option>Other</option>
          </select>
        </div>

        <div className="input-group">
          <label className="label">Details</label>
          <textarea required rows={4} className="input" value={form.details}
            onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
            placeholder="Describe what happened..." />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Security Report'}
        </button>
      </form>
    </div>
  )
}
