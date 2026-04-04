'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiPost } from '@/lib/api'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle')
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      setStatus('verifying')
      apiPost('/api/v1/auth/verify-email', { token })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    }
  }, [token])

  const handleResend = async () => {
    if (!resendEmail.trim()) return
    setResendLoading(true)
    try {
      await apiPost('/api/v1/auth/resend-verification', { email: resendEmail.trim().toLowerCase() })
      setResendDone(true)
    } catch {}
    setResendLoading(false)
  }

  // No token — show resend form
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #00C2FF22, #7B2FBE22)', border: '1px solid rgba(0,194,255,0.2)' }}>
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-arcade-text-muted text-sm">
              Check your inbox for a verification link, or request a new one below.
            </p>
          </div>
          <div className="card p-8">
            {resendDone ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">📬</div>
                <h2 className="text-lg font-semibold mb-2">Email Sent</h2>
                <p className="text-arcade-text-muted text-sm mb-6">If that address is registered, a new verification link is on its way.</p>
                <Link href="/auth/login" className="btn-primary w-full block text-center">Sign In</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="input-group">
                  <label className="label">Your email address</label>
                  <input type="email" value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                    className="input" placeholder="you@example.com" />
                </div>
                <button onClick={handleResend} disabled={resendLoading || !resendEmail} className="btn-primary w-full">
                  {resendLoading ? 'Sending...' : 'Resend Verification'}
                </button>
                <p className="text-center text-sm text-arcade-text-muted">
                  Already verified?{' '}
                  <Link href="/auth/login" className="text-arcade-primary hover:underline">Sign In</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="card p-10 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="animate-spin w-10 h-10 text-arcade-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying...</h2>
            <p className="text-arcade-text-muted text-sm">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2 text-arcade-success">Email Verified!</h2>
            <p className="text-arcade-text-muted text-sm mb-6">
              Your email has been verified successfully. You can now sign in.
            </p>
            <Link href="/auth/login" className="btn-primary w-full block text-center">Sign In</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2 text-arcade-error">Verification Failed</h2>
            <p className="text-arcade-text-muted text-sm mb-6">
              This link is invalid or has expired. Request a new verification email below.
            </p>
            <div className="space-y-3">
              <Link href="/auth/verify-email" className="btn-primary w-full block text-center">
                Request New Link
              </Link>
              <Link href="/auth/login" className="btn-ghost w-full block text-center text-sm">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
