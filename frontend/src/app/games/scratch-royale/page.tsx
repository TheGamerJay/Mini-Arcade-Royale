'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const COST = 10

type GameState = 'idle' | 'buying' | 'scratching' | 'revealed' | 'error'

interface PlayResult {
  outcome: string
  reward_credits: number
  multiplier: number
  symbols: string[]
  balance_after: number
}

const SYMBOL_POOL = ['💎', '⭐', '🔥', '7️⃣', '🎯', '👑', '⚡', '🌙']
const TIERS = [
  { label: 'Jackpot!', color: 'text-arcade-gold', bg: 'bg-arcade-gold/10', border: 'border-arcade-gold/40', min: 200 },
  { label: 'Big Win!', color: 'text-arcade-primary', bg: 'bg-arcade-primary/10', border: 'border-arcade-primary/30', min: 50 },
  { label: 'Win!', color: 'text-arcade-success', bg: 'bg-arcade-success/10', border: 'border-arcade-success/30', min: 10 },
  { label: 'Try Again', color: 'text-arcade-text-muted', bg: 'bg-arcade-surface-3', border: 'border-arcade-border', min: 0 },
]

function getTier(reward: number) {
  return TIERS.find(t => reward >= t.min) || TIERS[3]
}

export default function ScratchRoyalePage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const [state, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<PlayResult | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [scratchProgress, setScratchProgress] = useState(0)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratchedRef = useRef(false)
  const isDrawing = useRef(false)

  const resetCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, '#1A1A35')
    grad.addColorStop(1, '#0E0E1A')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0,194,255,0.1)'
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
    }
    ctx.fillStyle = '#8888A8'
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 8)
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Swipe or drag to reveal', canvas.width / 2, canvas.height / 2 + 14)
    scratchedRef.current = false
    setScratchProgress(0)
    setRevealed(false)
  }

  useEffect(() => {
    if (state === 'scratching') resetCanvas()
  }, [state])

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const cx = (x - rect.left) * (canvas.width / rect.width)
    const cy = (y - rect.top) * (canvas.height / rect.height)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, Math.PI * 2)
    ctx.fill()
    checkProgress(ctx, canvas)
  }

  const checkProgress = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparent = 0
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++
    }
    const pct = Math.round((transparent / (pixels.length / 4)) * 100)
    setScratchProgress(pct)
    if (pct > 60 && !scratchedRef.current) {
      scratchedRef.current = true
      setRevealed(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    scratch(e.clientX, e.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing.current) return
    scratch(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handlePlay = async () => {
    if (!isAuthenticated) return
    if (credits < COST) { setError(`Not enough credits. You need ${COST} credits.`); return }
    setError('')
    setGameState('buying')
    setResult(null)

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/scratch-royale/play', {
        idempotency_key: `scratch-${Date.now()}-${Math.random()}`,
      })
      setResult(data)
      await refreshCredits()
      setGameState('scratching')
    } catch (err: any) {
      setError(err.message || 'Play failed. Please try again.')
      setGameState('error')
    }
  }

  const handleReset = () => {
    setGameState('idle')
    setResult(null)
    setRevealed(false)
    setScratchProgress(0)
    setError('')
  }

  const tier = result ? getTier(result.reward_credits) : null

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🎴</div>
          <h2 className="text-2xl font-bold mb-2">Scratch Royale</h2>
          <p className="text-arcade-text-muted mb-6">Sign in to play and win credits.</p>
          <Link href="/auth/register" className="btn-primary w-full block text-center">Create Account</Link>
          <Link href="/auth/login" className="btn-ghost w-full block text-center mt-2 text-sm">Sign In</Link>
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
              <span className="text-sm text-arcade-text">Scratch Royale</span>
            </div>
            <h1 className="text-2xl font-bold">🎴 Scratch Royale</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {/* Error */}
        {error && <div className="alert-error mb-6"><span>⚠</span>{error}</div>}

        {/* Game area */}
        <div className="card p-8 mb-6">
          {state === 'idle' || state === 'error' ? (
            <div className="text-center">
              <div className="text-7xl mb-6 animate-float">🎴</div>
              <h2 className="text-xl font-bold mb-2">Ready to Scratch?</h2>
              <p className="text-arcade-text-muted text-sm mb-6">
                Cost: <span className="text-arcade-primary font-semibold">{COST} credits</span> per card
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8 max-w-xs mx-auto">
                {['💎 50×', '⭐ 25×', '🔥 10×', '7️⃣ 5×', '🎯 3×', '⚡ 2×'].map(s => (
                  <div key={s} className="card p-3 text-center text-sm">{s}</div>
                ))}
              </div>
              <button onClick={handlePlay} disabled={credits < COST}
                className="btn-primary btn-lg glow-blue">
                Buy Card — {COST} Credits
              </button>
              {credits < COST && (
                <p className="text-arcade-error text-xs mt-3">
                  Not enough credits. <Link href="/store" className="underline">Buy more →</Link>
                </p>
              )}
            </div>
          ) : state === 'buying' ? (
            <div className="text-center py-10">
              <svg className="animate-spin w-12 h-12 text-arcade-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-arcade-text-muted">Generating your card...</p>
            </div>
          ) : state === 'scratching' ? (
            <div>
              <p className="text-center text-sm text-arcade-text-muted mb-4">
                {scratchProgress < 60 ? 'Scratch the card to reveal your prize!' : 'Keep going...'}
              </p>

              {/* The card underneath (result) */}
              <div className="relative mx-auto" style={{ maxWidth: 320 }}>
                {/* Result layer */}
                <div className={`rounded-2xl border p-6 ${tier?.bg} ${tier?.border} text-center`}
                  style={{ minHeight: 200 }}>
                  {result && (
                    <>
                      <div className="text-4xl mb-3">{result.symbols?.[0] || '💎'}</div>
                      <div className={`text-2xl font-black mb-1 ${tier?.color}`}>{tier?.label}</div>
                      {result.reward_credits > 0 ? (
                        <div className="text-lg font-bold text-arcade-text">
                          +{result.reward_credits.toLocaleString()} credits
                        </div>
                      ) : (
                        <div className="text-arcade-text-muted">Better luck next time</div>
                      )}
                    </>
                  )}
                </div>

                {/* Scratch canvas overlay */}
                {!revealed && (
                  <canvas
                    ref={canvasRef}
                    width={320} height={200}
                    className="absolute inset-0 w-full h-full rounded-2xl cursor-crosshair touch-none"
                    onMouseDown={() => { isDrawing.current = true }}
                    onMouseUp={() => { isDrawing.current = false }}
                    onMouseLeave={() => { isDrawing.current = false }}
                    onMouseMove={handleMouseMove}
                    onTouchStart={() => { isDrawing.current = true }}
                    onTouchEnd={() => { isDrawing.current = false }}
                    onTouchMove={handleTouchMove}
                  />
                )}
              </div>

              {revealed && (
                <div className="text-center mt-6 animate-fade-in-up">
                  <button onClick={handleReset} className="btn-primary">
                    Play Again — {COST} Credits
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="card p-5 text-xs text-arcade-text-muted">
          <p className="font-semibold mb-1 text-arcade-text">How it works</p>
          <p>Each card costs {COST} credits. Outcomes are determined server-side before you scratch. Scratching only reveals the pre-determined result — the animation never affects your winnings.</p>
        </div>
      </div>
    </div>
  )
}
