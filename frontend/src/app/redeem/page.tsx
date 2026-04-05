'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiPost } from '@/lib/api'

export default function RedeemPage() {
  const { isAuthenticated, refreshCredits } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; credits?: number } | null>(null)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await apiPost<{ message: string; credits_awarded: number }>('/api/v1/account/redeem', { code: code.trim().toUpperCase() })
      setResult({ success: true, message: data.message, credits: data.credits_awarded })
      setCode('')
      refreshCredits()
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Invalid or expired code.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">🎟️</div>
        <h1 className="text-2xl font-black">Redeem a Code</h1>
        <p className="text-arcade-text-muted text-sm">Enter a promo or gift code to receive Mini Credits.</p>
      </div>

      {!isAuthenticated ? (
        <div className="card p-6 text-center space-y-3">
          <p className="text-arcade-text-muted text-sm">You must be logged in to redeem a code.</p>
          <a href="/auth/login" className="btn-primary">Log In</a>
        </div>
      ) : (
        <>
          <form onSubmit={handleRedeem} className="card p-6 space-y-4">
            {result && (
              <div className={result.success ? 'alert-success' : 'alert-error'}>
                <span>{result.success ? '✓' : '⚠'}</span>
                <div>
                  <p>{result.message}</p>
                  {result.credits && <p className="text-xs mt-0.5">+{result.credits} Mini Credits added to your balance</p>}
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="label">Promo Code</label>
              <input
                type="text"
                className="input text-center font-mono text-lg tracking-widest uppercase"
                placeholder="XXXX-XXXX-XXXX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
            </div>

            <button type="submit" disabled={loading || !code.trim()} className="btn-primary w-full">
              {loading ? 'Redeeming...' : 'Redeem Code'}
            </button>
          </form>

          <p className="text-xs text-arcade-text-muted text-center">
            Codes are one-time use and cannot be transferred. Mini Credits have no cash value.
          </p>
        </>
      )}
    </div>
  )
}
