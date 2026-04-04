'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string
  }
}

export default function RegisterPage() {
  const router = useRouter()
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
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://mini-arcade-royale-production.up.railway.app')
      .replace(/\/$/, '')
      .replace(/\/api\/v1$/, '')

    try {
      // Validate
      if (!formData.email || !formData.username || !formData.password) {
        throw new Error('All fields required')
      }
      if (!formData.legalAccepted) {
        throw new Error('You must agree to Terms and Privacy before creating an account')
      }
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('Passwords do not match')
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      // Call backend
      const response = await fetch(
        `${apiBase}/api/v1/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
          }),
        }
      )

      if (!response.ok) {
        let detail = 'Registration failed'
        try {
          const data = await response.json()
          detail = data.detail || detail
        } catch {}
        throw new Error(detail)
      }

      const data = await response.json()
      // Store token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-arcade-dark border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-arcade-primary"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-arcade-dark border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-arcade-primary"
              placeholder="player123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="no-password-toggle w-full bg-arcade-dark border border-gray-600 rounded px-4 py-2 pr-12 text-white focus:outline-none focus:border-arcade-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🐵'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="no-password-toggle w-full bg-arcade-dark border border-gray-600 rounded px-4 py-2 pr-12 text-white focus:outline-none focus:border-arcade-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
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
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-arcade-dark text-arcade-primary focus:ring-arcade-primary"
              required
            />
            <label className="text-sm text-gray-300">
              I agree to the{' '}
              <Link href="/legal/terms" className="text-arcade-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-arcade-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              before creating my account.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.legalAccepted}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-arcade-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
