'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PurchaseSupportPage() {
  const [form, setForm] = useState({ email: '', order_id: '', description: '' })
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
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Request Received</h1>
        <p className="text-arcade-text-muted text-sm">We&apos;ll investigate your purchase issue and respond within 2 business days.</p>
        <Link href="/support" className="btn-outline">Back to Support</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/support" className="hover:text-arcade-primary">Support</Link> › Purchase Issues
        </p>
        <h1 className="text-2xl font-black">Purchase Support</h1>
        <p className="text-arcade-text-muted text-sm mt-1">Missing credits or billing issues? We&apos;ll sort it out.</p>
      </div>

      <div className="card p-4 space-y-2 text-sm text-arcade-text-muted">
        <p className="font-semibold text-arcade-text text-xs">Before submitting:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Check your <Link href="/account/credits" className="text-arcade-primary hover:underline">Credits page</Link> — credits appear immediately after payment</li>
          <li>Check your bank/card statement to confirm the charge went through</li>
          <li>Wait 5 minutes — rarely, credits can be delayed by a few minutes</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="input-group">
          <label className="label">Email Used for Purchase</label>
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
          <label className="label">Order / Payment Reference <span className="text-arcade-text-muted text-xs">(optional)</span></label>
          <input
            type="text"
            className="input"
            value={form.order_id}
            onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))}
            placeholder="Stripe payment ID or bank reference"
          />
        </div>

        <div className="input-group">
          <label className="label">Describe the Issue</label>
          <textarea
            required
            rows={4}
            className="input"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="e.g. I purchased 500 credits but they didn't appear..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      <p className="text-xs text-arcade-text-muted text-center">
        See our <Link href="/legal/refund-policy" className="text-arcade-primary hover:underline">Refund Policy</Link> for eligibility details.
      </p>
    </div>
  )
}
