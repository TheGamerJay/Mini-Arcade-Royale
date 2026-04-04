'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const COST = 25

const SEGMENTS = [
  { label: '2×', credits: 50, color: '#00C2FF', probability: 0.30 },
  { label: '3×', credits: 75, color: '#7B2FBE', probability: 0.20 },
  { label: '5×', credits: 125, color: '#00FFF5', probability: 0.15 },
  { label: '10×', credits: 250, color: '#FFD700', probability: 0.10 },
  { label: '25×', credits: 625, color: '#BF00FF', probability: 0.05 },
  { label: 'Try Again', credits: 0, color: '#2A2A50', probability: 0.20 },
]

type GameState = 'idle' | 'buying' | 'spinning' | 'result' | 'error'

interface PlayResult {
  outcome: string
  reward_credits: number
  multiplier: number
  segment_index: number
  balance_after: number
}

export default function RoyaleSpinPage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<PlayResult | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [error, setError] = useState('')
  const animRef = useRef<number>()

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas
    const cx = width / 2
    const cy = height / 2
    const r = Math.min(width, height) / 2 - 12

    ctx.clearRect(0, 0, width, height)

    // Outer glow ring
    const glow = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 6)
    glow.addColorStop(0, 'rgba(0,194,255,0.4)')
    glow.addColorStop(1, 'rgba(0,194,255,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2)
    ctx.strokeStyle = glow
    ctx.lineWidth = 8
    ctx.stroke()

    const arc = (Math.PI * 2) / SEGMENTS.length

    SEGMENTS.forEach((seg, i) => {
      const startAngle = rot + i * arc
      const endAngle = startAngle + arc

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color + '33'
      ctx.fill()
      ctx.strokeStyle = seg.color + '80'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${seg.label.length > 3 ? '11' : '14'}px Inter, sans-serif`
      ctx.fillText(seg.label, r - 14, 5)
      ctx.restore()
    })

    // Center hub
    const hub = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24)
    hub.addColorStop(0, '#00C2FF')
    hub.addColorStop(1, '#7B2FBE')
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = hub
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('SPIN', cx, cy + 4)
  }

  useEffect(() => {
    drawWheel(rotation)
  }, [rotation])

  const spinTo = (targetSegment: number) => {
    const arc = (Math.PI * 2) / SEGMENTS.length
    const segCenter = targetSegment * arc + arc / 2
    const extraSpins = Math.PI * 2 * (8 + Math.random() * 4)
    const targetRot = extraSpins + (Math.PI * 2 - segCenter) - rotation % (Math.PI * 2)

    let start: number | null = null
    const duration = 4500

    const ease = (t: number) => 1 - Math.pow(1 - t, 4)

    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      const current = rotation + targetRot * ease(progress)
      setRotation(current)
      drawWheel(current)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        setGameState('result')
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  const handlePlay = async () => {
    if (!isAuthenticated || isSpinning) return
    if (credits < COST) { setError(`Need ${COST} credits to spin.`); return }
    setError('')
    setResult(null)
    setGameState('buying')

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/royale-spin/play', {
        idempotency_key: `spin-${Date.now()}-${Math.random()}`,
      })
      setResult(data)
      await refreshCredits()
      setIsSpinning(true)
      setGameState('spinning')
      spinTo(data.segment_index ?? Math.floor(Math.random() * SEGMENTS.length))
    } catch (err: any) {
      setError(err.message || 'Spin failed.')
      setGameState('error')
    }
  }

  const handleReset = () => {
    setGameState('idle')
    setResult(null)
    setError('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🎡</div>
          <h2 className="text-2xl font-bold mb-2">Royale Spin</h2>
          <p className="text-arcade-text-muted mb-6">Sign in to spin and win credits.</p>
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
              <span className="text-sm">Royale Spin</span>
            </div>
            <h1 className="text-2xl font-bold">🎡 Royale Spin</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {error && <div className="alert-error mb-6"><span>⚠</span>{error}</div>}

        <div className="card p-8 mb-6">
          {/* Wheel */}
          <div className="relative mx-auto mb-6" style={{ width: 280, height: 280 }}>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-2xl">▼</div>
            <canvas ref={canvasRef} width={280} height={280} className="rounded-full" />
            {isSpinning && (
              <div className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
            )}
          </div>

          {/* Result */}
          {state === 'result' && result && (
            <div className="text-center mb-6 animate-fade-in-up">
              {result.reward_credits > 0 ? (
                <div>
                  <div className="text-2xl font-black text-arcade-primary mb-1">
                    {result.multiplier ? `${result.multiplier}×` : ''} Win!
                  </div>
                  <div className="text-xl font-bold text-arcade-accent">
                    +{result.reward_credits.toLocaleString()} credits
                  </div>
                </div>
              ) : (
                <div className="text-arcade-text-muted font-semibold">Better luck next time!</div>
              )}
            </div>
          )}

          {/* Action */}
          <div className="text-center">
            {state === 'buying' ? (
              <div className="flex items-center justify-center gap-2 text-arcade-text-muted">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Preparing spin...</span>
              </div>
            ) : state === 'spinning' ? (
              <p className="text-arcade-text-muted text-sm animate-pulse">Spinning...</p>
            ) : (
              <button onClick={state === 'result' ? handleReset : handlePlay}
                disabled={credits < COST}
                className="btn-primary btn-lg glow-purple">
                {state === 'result' ? `Spin Again — ${COST} Credits` : `Spin — ${COST} Credits`}
              </button>
            )}
            {credits < COST && (
              <p className="text-arcade-error text-xs mt-3">
                Need more credits. <Link href="/store" className="underline">Buy now →</Link>
              </p>
            )}
          </div>
        </div>

        {/* Odds table */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-3">Reward Table</p>
          <div className="grid grid-cols-3 gap-2">
            {SEGMENTS.filter(s => s.credits > 0).map(seg => (
              <div key={seg.label} className="text-center p-2 rounded-lg"
                style={{ background: seg.color + '15', border: `1px solid ${seg.color}40` }}>
                <div className="font-bold text-sm" style={{ color: seg.color }}>{seg.label}</div>
                <div className="text-xs text-arcade-text-muted">{seg.credits}cr</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
