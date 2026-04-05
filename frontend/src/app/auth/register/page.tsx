'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

declare const process: { env: { NEXT_PUBLIC_API_URL?: string } }

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    legalAccepted: false,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://mini-arcade-royale-production.up.railway.app')
      .replace(/\/$/, '')
      .replace(/\/api\/v1$/, '')

    try {
      if (!formData.email || !formData.username || !formData.password)
        throw new Error('All fields are required')
      if (!formData.legalAccepted)
        throw new Error('You must agree to the Terms and Privacy Policy')
      if (formData.password !== formData.passwordConfirm)
        throw new Error('Passwords do not match')
      if (formData.password.length < 8)
        throw new Error('Password must be at least 8 characters')

      const response = await fetch(`${apiBase}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Registration failed' }))
        throw new Error(data.detail || 'Registration failed')
      }

      const data = await response.json()

      // Update AuthContext state so protected pages don't redirect to login
      login(data.access_token, data.user)

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🕹️</div>
          <h1 className="text-2xl font-black">Create Account</h1>
          <p className="text-arcade-text-muted text-sm mt-1">Get <span className="text-arcade-primary font-bold">40 free Mini Credits</span> on signup</p>
        </div>

        {error && (
          <div className="alert-error mb-5"><span>⚠</span>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="input" placeholder="you@example.com" required />
          </div>

          <div className="input-group">
            <label className="label">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange}
              className="input" placeholder="player123" minLength={3} maxLength={30} required />
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input no-password-toggle pr-12"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                {showPassword ? '👁️' : '🐵'}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="input no-password-toggle pr-12"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                {showConfirmPassword ? '👁️' : '🐵'}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="legalAccepted"
              checked={formData.legalAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-arcade-dark text-arcade-primary"
              required
            />
            <label className="text-sm text-arcade-text-muted">
              I agree to the{' '}
              <Link href="/legal/terms" className="text-arcade-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/legal/privacy" className="text-arcade-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={loading || !formData.legalAccepted}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Create Account — Get 40 Free Credits'}
          </button>
        </form>

        <p className="text-center text-arcade-text-muted mt-5 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-arcade-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
