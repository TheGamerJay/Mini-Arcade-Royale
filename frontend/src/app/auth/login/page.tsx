'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { API_BASE } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!form.email || !form.password) throw new Error('Email and password required')

      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      })

      if (!res.ok) {
        let msg = 'Login failed'
        try { const d = await res.json(); msg = d.detail || msg } catch {}
        throw new Error(msg)
      }

      const data = await res.json()
      login(data.access_token, data.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00C2FF22, #7B2FBE22)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <span className="text-2xl">🕹</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-arcade-text-muted text-sm">Sign in to continue playing</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="input-group">
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-arcade-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input no-password-toggle pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <p className="text-center text-sm text-arcade-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-arcade-primary hover:underline font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-arcade-text-muted mt-6">
          By signing in, you agree to our{' '}
          <Link href="/legal/terms" className="text-arcade-primary hover:underline">Terms</Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-arcade-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
