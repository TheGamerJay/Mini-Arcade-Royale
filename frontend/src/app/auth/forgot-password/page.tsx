'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true)
    try {
      await apiPost('/api/v1/auth/forgot-password', { email: email.trim().toLowerCase() })
    } catch {
      // Anti-enumeration: always show success regardless
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00C2FF22, #7B2FBE22)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-arcade-text-muted text-sm">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="card p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-lg font-semibold mb-2">Check Your Inbox</h2>
              <p className="text-arcade-text-muted text-sm mb-6">
                If an account with <strong className="text-arcade-text">{email}</strong> exists,
                we&apos;ve sent a password reset link. Check your spam folder too.
              </p>
              <p className="text-xs text-arcade-text-muted mb-6">The link expires in 1 hour.</p>
              <Link href="/auth/login" className="btn-primary w-full block text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="alert-error"><span>⚠</span>{error}</div>}

              <div className="input-group">
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-arcade-text-muted">
                Remember it?&nbsp;
                <Link href="/auth/login" className="text-arcade-primary hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
