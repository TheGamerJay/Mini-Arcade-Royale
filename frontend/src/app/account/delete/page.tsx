'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

export default function DeleteAccountPage() {
  const { user, logout } = useAuth()
  const [step, setStep] = useState<'confirm' | 'password' | 'done'>('confirm')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!password) { setError('Please enter your password to confirm.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/v1/account/delete', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: 'Delete failed' }))
        throw new Error(d.detail || 'Delete failed')
      }
      setStep('done')
      setTimeout(() => logout(), 2000)
    } catch (err: any) {
      setError(err.message || 'Account deletion failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="card p-10 max-w-md text-center">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-xl font-bold mb-2">Account Deleted</h2>
        <p className="text-arcade-text-muted text-sm">Your account has been permanently deleted. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title text-arcade-error">Delete Account</h1>
        <p className="page-subtitle">This action is permanent and cannot be undone.</p>
      </div>

      <div className="card p-6 border-arcade-error/30 max-w-lg">
        <div className="alert-error mb-6">
          <span>⚠</span>
          <div>
            <p className="font-semibold">This will permanently delete:</p>
            <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside">
              <li>Your account and profile</li>
              <li>All credit balance (non-refundable)</li>
              <li>All game history and stats</li>
              <li>All purchases and transaction records</li>
            </ul>
          </div>
        </div>

        {step === 'confirm' ? (
          <div className="space-y-4">
            <p className="text-sm text-arcade-text-muted">
              Are you sure you want to delete <strong className="text-arcade-text">{user?.username}</strong>&apos;s account?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep('password')} className="btn-danger flex-1">
                Yes, Delete My Account
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-arcade-text-muted">Enter your password to confirm deletion:</p>
            {error && <div className="alert-error"><span>⚠</span>{error}</div>}
            <div className="input-group">
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input no-password-toggle pr-12"
                  placeholder="Your password"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('confirm')} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={loading || !password} className="btn-danger flex-1">
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
