'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const COST = 50

type GameState = 'idle' | 'buying' | 'opening' | 'revealed' | 'error'
type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

interface PlayResult {
  outcome: string
  rarity: Rarity
  reward_credits: number
  reward_label: string
  balance_after: number
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string; icon: string }> = {
  common:    { label: 'Common',    color: 'text-gray-400',              bg: 'bg-gray-500/10',              border: 'border-gray-500/30',              glow: '',                           icon: '📦' },
  rare:      { label: 'Rare',      color: 'text-arcade-info',           bg: 'bg-arcade-info/10',           border: 'border-arcade-info/30',           glow: 'shadow-[0_0_20px_#00B4D840]', icon: '💠' },
  epic:      { label: 'Epic!',     color: 'text-arcade-secondary-light', bg: 'bg-arcade-secondary/10',    border: 'border-arcade-secondary/40',      glow: 'shadow-glow-purple',          icon: '🔮' },
  legendary: { label: 'LEGENDARY!', color: 'text-arcade-gold',          bg: 'bg-arcade-gold/10',          border: 'border-arcade-gold/40',           glow: 'shadow-glow-gold',            icon: '👑' },
}

const PREVIEW_DROPS = [
  { rarity: 'legendary', label: '500× Credits', chance: '1%', icon: '👑' },
  { rarity: 'epic',      label: '100× Credits', chance: '5%', icon: '🔮' },
  { rarity: 'rare',      label: '20× Credits',  chance: '14%', icon: '💠' },
  { rarity: 'common',    label: '2× Credits',   chance: '80%', icon: '📦' },
]

export default function MysteryVaultPage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const [state, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<PlayResult | null>(null)
  const [animStep, setAnimStep] = useState(0)
  const [error, setError] = useState('')

  const handlePlay = async () => {
    if (!isAuthenticated || state === 'buying' || state === 'opening') return
    if (credits < COST) { setError(`Need ${COST} credits to open a vault.`); return }
    setError('')
    setResult(null)
    setAnimStep(0)
    setGameState('buying')

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/mystery-vault/play', {
        idempotency_key: `vault-${Date.now()}-${Math.random()}`,
      })
      setResult(data)
      await refreshCredits()
      setGameState('opening')
      // Animate through steps
      let step = 0
      const interval = setInterval(() => {
        step++
        setAnimStep(step)
        if (step >= 3) {
          clearInterval(interval)
          setGameState('revealed')
        }
      }, 700)
    } catch (err: any) {
      setError(err.message || 'Vault open failed.')
      setGameState('error')
    }
  }

  const rarityConfig = result?.rarity ? RARITY_CONFIG[result.rarity] : null

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold mb-2">Mystery Vault</h2>
          <p className="text-arcade-text-muted mb-6">Sign in to open vaults and discover rare rewards.</p>
          <Link href="/auth/register" className="btn-primary w-full block text-center">Create Account</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="container-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/games" className="text-arcade-text-muted text-sm hover:text-arcade-text">← Games</Link>
              <span className="text-arcade-border">›</span>
              <span className="text-sm">Mystery Vault</span>
            </div>
            <h1 className="text-2xl font-bold">🔮 Mystery Vault</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {error && <div className="alert-error mb-6"><span>⚠</span>{error}</div>}

        <div className="card p-8 mb-6 text-center">
          {/* Vault visual */}
          <div className="relative mx-auto w-40 h-40 mb-6">
            <div className={`w-full h-full rounded-3xl flex items-center justify-center transition-all duration-500 ${
              state === 'opening' || state === 'revealed'
                ? `${rarityConfig?.bg || 'bg-arcade-surface-3'} ${rarityConfig?.glow || ''}`
                : 'bg-arcade-surface-3 border border-arcade-border'
            }`}>
              <span className="text-6xl transition-all duration-300">
                {state === 'idle' || state === 'error' ? '🔒'
                  : state === 'buying' ? '⌛'
                  : state === 'opening' && animStep < 2 ? '🔓'
                  : state === 'opening' && animStep >= 2 ? '✨'
                  : rarityConfig?.icon || '📦'}
              </span>
            </div>

            {(state === 'opening' || state === 'revealed') && (
              <>
                {['✨', '⭐', '💫', '🌟'].map((p, i) => (
                  <div key={i} className="absolute text-lg animate-float pointer-events-none"
                    style={{
                      top: `${-10 + i * 30}%`, left: `${-20 + i * 40}%`,
                      animationDelay: `${i * 0.2}s`, animationDuration: `${1.5 + i * 0.3}s`
                    }}>
                    {p}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Result */}
          {state === 'revealed' && result && rarityConfig && (
            <div className={`rounded-2xl border p-6 mb-6 animate-fade-in-up ${rarityConfig.bg} ${rarityConfig.border}`}>
              <div className={`text-lg font-black mb-2 ${rarityConfig.color}`}>
                {rarityConfig.icon} {rarityConfig.label}
              </div>
              <div className="text-2xl font-bold text-arcade-text mb-1">
                {result.reward_label || `+${result.reward_credits.toLocaleString()} credits`}
              </div>
              {result.reward_credits > 0 && (
                <div className="text-arcade-accent text-sm">
                  +{result.reward_credits.toLocaleString()} credits added to your wallet
                </div>
              )}
            </div>
          )}

          {state === 'opening' && (
            <div className="text-arcade-text-muted text-sm mb-4 animate-pulse">
              {animStep === 0 ? 'Unlocking vault...'
                : animStep === 1 ? 'Accessing contents...'
                : 'Calculating rarity...'}
            </div>
          )}

          {/* CTA */}
          {state !== 'opening' && state !== 'buying' && (
            <div>
              <button
                onClick={state === 'revealed' ? () => { setGameState('idle'); setResult(null) } : handlePlay}
                disabled={credits < COST}
                className="btn-primary btn-lg w-full max-w-xs mx-auto block"
                style={{ boxShadow: '0 0 30px rgba(123,47,190,0.4)' }}>
                {state === 'revealed'
                  ? `Open Another — ${COST} Credits`
                  : `Open Vault — ${COST} Credits`}
              </button>
              {credits < COST && (
                <p className="text-arcade-error text-xs mt-3">
                  Need more credits. <Link href="/store" className="underline">Buy now →</Link>
                </p>
              )}
            </div>
          )}

          {(state === 'buying' || state === 'opening') && (
            <div className="flex items-center justify-center gap-2 text-arcade-text-muted">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-sm">{state === 'buying' ? 'Opening vault...' : 'Revealing...'}</span>
            </div>
          )}
        </div>

        {/* Drop rates */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-3">Possible Drops</p>
          <div className="grid grid-cols-2 gap-3">
            {PREVIEW_DROPS.map(drop => {
              const cfg = RARITY_CONFIG[drop.rarity as Rarity]
              return (
                <div key={drop.rarity} className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{drop.icon}</span>
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="text-sm font-semibold">{drop.label}</div>
                  <div className="text-xs text-arcade-text-muted">{drop.chance} chance</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
