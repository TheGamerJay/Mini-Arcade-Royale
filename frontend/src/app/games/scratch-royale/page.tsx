'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const BET_OPTIONS = [1, 5, 10, 25, 50]

type GameState = 'idle' | 'buying' | 'scratching' | 'revealed' | 'error'

interface PlayResult {
  game_id: number
  outcome: string
  multiplier: number
  label: string
  bet_amount: number
  payout_amount: number
  net: number
  grid: string[]
  balance: number
}

export default function ScratchRoyalePage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const [state, setGameState] = useState<GameState>('idle')
  const [bet, setBet] = useState(10)
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
    ctx.fillStyle = 'rgba(0,194,255,0.08)'
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
    }
    ctx.fillStyle = '#8888A8'
    ctx.font = 'bold 16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 8)
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Drag or swipe to reveal', canvas.width / 2, canvas.height / 2 + 14)
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
    ctx.arc(cx, cy, 32, 0, Math.PI * 2)
    ctx.fill()
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparent = 0
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++
    }
    const pct = Math.round((transparent / (pixels.length / 4)) * 100)
    setScratchProgress(pct)
    if (pct > 55 && !scratchedRef.current) {
      scratchedRef.current = true
      setRevealed(true)
    }
  }

  const handlePlay = async () => {
    if (!isAuthenticated) return
    if (credits < bet) { setError(`Not enough Mini Credits. Need ${bet}.`); return }
    setError('')
    setGameState('buying')
    setResult(null)

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/scratch-royale/play', { bet_amount: bet })
      setResult(data)
      refreshCredits()
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

  // Result display helpers
  const isWin = result && result.net > 0
  const isPush = result && result.net === 0
  const resultColor = isWin ? 'text-arcade-success' : isPush ? 'text-arcade-warning' : 'text-arcade-error'
  const resultBg = isWin ? 'bg-arcade-success/10 border-arcade-success/30' : isPush ? 'bg-arcade-warning/10 border-arcade-warning/30' : 'bg-arcade-surface-3 border-arcade-border'

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🎴</div>
          <h2 className="text-2xl font-bold mb-2">Scratch Royale</h2>
          <p className="text-arcade-text-muted mb-6">Sign in to play and win Mini Credits.</p>
          <Link href="/auth/register" className="btn-primary w-full block text-center mb-2">Create Account</Link>
          <Link href="/auth/login" className="btn-ghost w-full block text-center text-sm">Sign In</Link>
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
              <span>Scratch Royale</span>
            </div>
            <h1 className="text-2xl font-bold">🎴 Scratch Royale</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {error && <div className="alert-error mb-4"><span>⚠</span>{error}</div>}

        <div className="card p-6 mb-4">

          {/* Idle / bet picker */}
          {(state === 'idle' || state === 'error') && (
            <div className="text-center space-y-6">
              <div className="text-6xl animate-float">🎴</div>
              <div>
                <p className="text-sm text-arcade-text-muted mb-3">Choose your bet</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {BET_OPTIONS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBet(b)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        bet === b
                          ? 'bg-arcade-primary text-white border-arcade-primary'
                          : 'border-arcade-border text-arcade-text-muted hover:border-arcade-primary/50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-arcade-text-muted">
                Outcomes are random, determined server-side before you scratch.
                Win up to <span className="text-arcade-primary font-bold">25×</span> your bet.
              </div>
              <button
                onClick={handlePlay}
                disabled={credits < bet}
                className="btn-primary btn-lg w-full"
              >
                Buy Card — {bet} Mini Credits
              </button>
              {credits < bet && (
                <p className="text-arcade-error text-xs">
                  Not enough credits. <Link href="/store" className="underline">Buy more →</Link>
                </p>
              )}
            </div>
          )}

          {/* Buying spinner */}
          {state === 'buying' && (
            <div className="text-center py-10 space-y-4">
              <svg className="animate-spin w-12 h-12 text-arcade-primary mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-arcade-text-muted text-sm">Generating your card...</p>
            </div>
          )}

          {/* Scratching */}
          {state === 'scratching' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-arcade-text-muted">
                {scratchProgress < 55 ? 'Scratch to reveal your prize!' : 'Almost there...'}
              </p>

              <div className="relative mx-auto" style={{ maxWidth: 320 }}>
                {/* Result underneath */}
                <div className={`rounded-2xl border p-6 text-center ${resultBg}`} style={{ minHeight: 180 }}>
                  {result && (
                    <>
                      {/* 3×3 grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {(result.grid || []).slice(0, 9).map((sym, i) => (
                          <div key={i} className="text-2xl text-center p-1">{sym}</div>
                        ))}
                      </div>
                      <div className={`text-lg font-black ${resultColor}`}>{result.label}</div>
                      {result.payout_amount > 0
                        ? <div className="text-arcade-text font-bold mt-1">+{result.payout_amount.toLocaleString()} Mini Credits</div>
                        : <div className="text-arcade-text-muted text-sm mt-1">Better luck next time</div>
                      }
                    </>
                  )}
                </div>

                {/* Canvas overlay */}
                {!revealed && (
                  <canvas
                    ref={canvasRef}
                    width={320} height={180}
                    className="absolute inset-0 w-full h-full rounded-2xl cursor-crosshair touch-none"
                    onMouseDown={() => { isDrawing.current = true }}
                    onMouseUp={() => { isDrawing.current = false }}
                    onMouseLeave={() => { isDrawing.current = false }}
                    onMouseMove={e => { if (isDrawing.current) scratch(e.clientX, e.clientY) }}
                    onTouchStart={() => { isDrawing.current = true }}
                    onTouchEnd={() => { isDrawing.current = false }}
                    onTouchMove={e => { e.preventDefault(); if (isDrawing.current) scratch(e.touches[0].clientX, e.touches[0].clientY) }}
                  />
                )}
              </div>

              {/* Progress bar */}
              <div className="progress-bar h-1.5 max-w-xs mx-auto">
                <div className="progress-fill" style={{ width: `${Math.min(scratchProgress, 100)}%` }} />
              </div>

              {revealed && (
                <div className="text-center animate-fade-in-up">
                  <div className={`text-2xl font-black mb-1 ${resultColor}`}>
                    {isWin ? `+${result!.net.toLocaleString()} net` : isPush ? 'Break even' : `-${Math.abs(result!.net).toLocaleString()} net`}
                  </div>
                  <button onClick={handleReset} className="btn-primary mt-3">
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Odds */}
        <div className="card p-4 text-xs text-arcade-text-muted">
          <p className="font-semibold text-arcade-text mb-2">Payout table</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['0×', 'No match', '40%'],
              ['1×', 'Break even', '25%'],
              ['2×', 'Double', '15%'],
              ['3×', 'Triple', '10%'],
              ['5×', '5×', '6%'],
              ['10×', '10×', '3%'],
              ['25×', 'Jackpot', '1%'],
            ].map(([mult, label, chance]) => (
              <div key={mult} className="text-center p-1.5 rounded-lg bg-arcade-surface-2">
                <div className="font-bold text-arcade-primary">{mult}</div>
                <div className="text-xs opacity-70">{chance}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
