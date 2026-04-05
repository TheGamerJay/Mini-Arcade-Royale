'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const BET_OPTIONS = [5, 10, 25, 50, 100, 200]

type GameState = 'idle' | 'buying' | 'opening' | 'revealed' | 'error'
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

interface PlayResult {
  game_id: number
  outcome: string
  rarity: Rarity
  label: string
  color: string
  multiplier: number
  bet_amount: number
  payout_amount: number
  net: number
  balance: number
}

const RARITY_CONFIG: Record<Rarity, { icon: string; glow: string; bg: string; border: string; textColor: string }> = {
  common:    { icon: '📦', glow: '',                              bg: 'bg-gray-500/10',    border: 'border-gray-500/30',    textColor: 'text-gray-400' },
  uncommon:  { icon: '💚', glow: '',                              bg: 'bg-green-500/10',   border: 'border-green-500/30',   textColor: 'text-green-400' },
  rare:      { icon: '💠', glow: 'shadow-[0_0_24px_#3b82f640]',  bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    textColor: 'text-blue-400' },
  epic:      { icon: '🔮', glow: 'shadow-[0_0_30px_#8b5cf640]',  bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  textColor: 'text-purple-400' },
  legendary: { icon: '👑', glow: 'shadow-[0_0_40px_#f59e0b60]',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/40',  textColor: 'text-yellow-400' },
}

const VAULT_DROPS = [
  { rarity: 'common' as Rarity,    label: '0.5× – 1×',   chance: '65%' },
  { rarity: 'uncommon' as Rarity,  label: '1.5×',         chance: '15%' },
  { rarity: 'rare' as Rarity,      label: '2.5×',         chance: '10%' },
  { rarity: 'epic' as Rarity,      label: '5×',           chance: '7%' },
  { rarity: 'legendary' as Rarity, label: '15×',          chance: '3%' },
]

export default function MysteryVaultPage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const [state, setGameState] = useState<GameState>('idle')
  const [bet, setBet] = useState(25)
  const [result, setResult] = useState<PlayResult | null>(null)
  const [animStep, setAnimStep] = useState(0)
  const [error, setError] = useState('')

  const handlePlay = async () => {
    if (!isAuthenticated || state === 'buying' || state === 'opening') return
    if (credits < bet) { setError(`Need ${bet} Mini Credits to open a vault.`); return }
    setError('')
    setResult(null)
    setAnimStep(0)
    setGameState('buying')

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/mystery-vault/play', { bet_amount: bet })
      setResult(data)
      refreshCredits()
      setGameState('opening')
      let step = 0
      const interval = setInterval(() => {
        step++
        setAnimStep(step)
        if (step >= 3) {
          clearInterval(interval)
          setGameState('revealed')
        }
      }, 750)
    } catch (err: any) {
      setError(err.message || 'Vault failed to open. Please try again.')
      setGameState('error')
    }
  }

  const handleReset = () => {
    setGameState('idle')
    setResult(null)
    setAnimStep(0)
    setError('')
  }

  const rarityKey = (result?.rarity ?? 'common') as Rarity
  const cfg = RARITY_CONFIG[rarityKey]
  const isWin = result && result.net > 0

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
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-arcade-text-muted">
              <Link href="/games" className="hover:text-arcade-text">← Games</Link>
              <span>›</span>
              <span>Mystery Vault</span>
            </div>
            <h1 className="text-2xl font-bold">🔮 Mystery Vault</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {error && <div className="alert-error mb-4"><span>⚠</span>{error}</div>}

        <div className="card p-8 mb-4 text-center">

          {/* Vault visual */}
          <div className="relative mx-auto w-36 h-36 mb-6">
            <div className={`w-full h-full rounded-3xl flex items-center justify-center transition-all duration-500 ${
              state === 'opening' || state === 'revealed'
                ? `${cfg.bg} ${cfg.glow}`
                : 'bg-arcade-surface-3 border border-arcade-border'
            }`}>
              <span className="text-5xl transition-all duration-300 select-none">
                {state === 'idle' || state === 'error' ? '🔒'
                  : state === 'buying' ? '⌛'
                  : state === 'opening' && animStep < 2 ? '🔓'
                  : state === 'opening' && animStep >= 2 ? '✨'
                  : cfg.icon}
              </span>
            </div>

            {(state === 'opening' || state === 'revealed') && (
              ['✨', '⭐', '💫', '🌟'].map((p, i) => (
                <div key={i} className="absolute text-lg animate-float pointer-events-none"
                  style={{ top: `${-10 + i * 30}%`, left: `${-20 + i * 40}%`, animationDelay: `${i * 0.2}s` }}>
                  {p}
                </div>
              ))
            )}
          </div>

          {/* Revealed result */}
          {state === 'revealed' && result && (
            <div className={`rounded-2xl border p-5 mb-5 animate-fade-in-up ${cfg.bg} ${cfg.border}`}>
              <div className={`text-lg font-black mb-1 ${cfg.textColor}`}>
                {cfg.icon} {result.label}
              </div>
              <div className="text-2xl font-bold text-arcade-text">
                {result.payout_amount > 0
                  ? `+${result.payout_amount.toLocaleString()} Mini Credits`
                  : 'No reward this time'}
              </div>
              <div className={`text-sm mt-1 ${isWin ? 'text-arcade-success' : 'text-arcade-error'}`}>
                net: {result.net >= 0 ? '+' : ''}{result.net.toLocaleString()}
              </div>
              <div className="text-xs text-arcade-text-muted mt-1">{result.multiplier}× multiplier</div>
            </div>
          )}

          {/* Opening animation status */}
          {state === 'opening' && (
            <p className="text-arcade-text-muted text-sm mb-5 animate-pulse">
              {animStep === 0 ? 'Unlocking vault...' : animStep === 1 ? 'Accessing contents...' : 'Calculating rarity...'}
            </p>
          )}

          {/* Bet picker */}
          {(state === 'idle' || state === 'result' || state === 'error') && (
            <div className="mb-5">
              <p className="text-xs text-arcade-text-muted mb-2">Choose your bet</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {BET_OPTIONS.map(b => (
                  <button key={b} onClick={() => setBet(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      bet === b ? 'bg-arcade-primary text-white border-arcade-primary' : 'border-arcade-border text-arcade-text-muted hover:border-arcade-primary/50'
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {state !== 'opening' && state !== 'buying' ? (
            <div>
              <button
                onClick={state === 'revealed' ? handleReset : handlePlay}
                disabled={credits < bet}
                className="btn-primary btn-lg w-full max-w-xs mx-auto block"
                style={{ boxShadow: '0 0 24px rgba(123,47,190,0.35)' }}>
                {state === 'revealed' ? 'Open Another Vault' : `Open Vault — ${bet} Mini Credits`}
              </button>
              {credits < bet && (
                <p className="text-arcade-error text-xs mt-2">
                  Need more credits. <Link href="/store" className="underline">Buy →</Link>
                </p>
              )}
            </div>
          ) : (
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
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Possible Drops</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VAULT_DROPS.map(drop => {
              const c = RARITY_CONFIG[drop.rarity]
              return (
                <div key={drop.rarity} className={`p-3 rounded-xl border ${c.bg} ${c.border}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{c.icon}</span>
                    <span className={`text-xs font-bold ${c.textColor} capitalize`}>{drop.rarity}</span>
                  </div>
                  <div className="text-sm font-semibold">{drop.label}</div>
                  <div className="text-xs text-arcade-text-muted">{drop.chance} chance</div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-arcade-text-muted mt-2">
            Rarity is determined randomly server-side before the vault opens.
          </p>
        </div>

      </div>
    </div>
  )
}
