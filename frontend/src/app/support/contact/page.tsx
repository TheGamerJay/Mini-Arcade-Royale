'use client'

import { useState } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  'General Enquiry',
  'Bug Report',
  'Purchase Issue',
  'Account Problem',
  'DMCA / Copyright',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Stub — in production POST to a support email/ticketing API
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Message Sent!</h1>
        <p className="text-arcade-text-muted text-sm">Thanks for reaching out. We&apos;ll get back to you within 2 business days.</p>
        <Link href="/support" className="btn-outline">Back to Support</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/support" className="hover:text-arcade-primary">Support</Link> › Contact
        </p>
        <h1 className="text-2xl font-black">Contact Us</h1>
        <p className="text-arcade-text-muted text-sm mt-1">We aim to respond within 2 business days.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="input-group">
          <label className="label">Your Name</label>
          <input
            required
            type="text"
            className="input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Display name or full name"
          />
        </div>

        <div className="input-group">
          <label className="label">Email Address</label>
          <input
            required
            type="email"
            className="input"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="your@email.com"
          />
        </div>

        <div className="input-group">
          <label className="label">Subject</label>
          <select
            className="input"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          >
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Message</label>
          <textarea
            required
            rows={5}
            className="input"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Describe your issue in as much detail as possible..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <p className="text-xs text-arcade-text-muted text-center">
        For DMCA notices see our <Link href="/legal/dmca" className="text-arcade-primary hover:underline">DMCA Policy</Link>.
      </p>
    </div>
  )
}
