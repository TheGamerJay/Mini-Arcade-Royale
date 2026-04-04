'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      if (!formData.email || !formData.password) {
        throw new Error('Email and password required')
      }

      const response = await fetch(
        `${apiBase}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        let detail = 'Login failed'
        try {
          const data = await response.json()
          detail = data.detail || detail
        } catch {}
        throw new Error(detail)
      }

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>

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
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-arcade-primary hover:underline">
              Create One
            </Link>
          </p>
          <p className="text-center">
            <Link href="/auth/reset" className="text-sm text-gray-400 hover:text-arcade-primary">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
