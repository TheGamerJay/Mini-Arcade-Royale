'use client'

import { FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-arcade-error', 'bg-arcade-warning', 'bg-arcade-info', 'bg-arcade-success'][strength]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) { setError('Invalid or missing reset token.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await apiPost('/api/v1/auth/reset-password', { token, new_password: form.password })
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-arcade-text-muted text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/auth/forgot-password" className="btn-primary w-full block text-center">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00C2FF22, #7B2FBE22)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
          <p className="text-arcade-text-muted text-sm">Choose a strong password for your account</p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-lg font-semibold mb-2">Password Reset!</h2>
              <p className="text-arcade-text-muted text-sm mb-6">
                Your password has been updated. Redirecting to sign in...
              </p>
              <Link href="/auth/login" className="btn-primary w-full block text-center">Sign In Now</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="alert-error"><span>⚠</span>{error}</div>}

              {/* New password */}
              <div className="input-group">
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={show.password ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input no-password-toggle pr-12"
                    placeholder="Min. 8 characters"
                    required minLength={8}
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                    {show.password ? '👁️' : '🙈'}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-arcade-surface-3'}`}/>
                      ))}
                    </div>
                    <p className="text-xs text-arcade-text-muted">{strengthLabel}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="input-group">
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    className={`input no-password-toggle pr-12 ${form.confirm && form.confirm !== form.password ? 'input-error' : ''}`}
                    placeholder="Repeat password"
                    required
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                    {show.confirm ? '👁️' : '🙈'}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-arcade-error mt-1">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading || form.password !== form.confirm || form.password.length < 8}
                className="btn-primary w-full">
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
