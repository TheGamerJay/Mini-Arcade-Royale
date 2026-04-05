'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost, formatCredits } from '@/lib/api'

const BET_OPTIONS = [1, 5, 10, 25, 50, 100]

// Must match backend SPIN_SEGMENTS order exactly
const SEGMENTS = [
  { label: '0×',   multiplier: 0.0,  color: '#ef4444' },
  { label: '½×',   multiplier: 0.5,  color: '#f97316' },
  { label: '1×',   multiplier: 1.0,  color: '#eab308' },
  { label: '1.5×', multiplier: 1.5,  color: '#22c55e' },
  { label: '2×',   multiplier: 2.0,  color: '#3b82f6' },
  { label: '3×',   multiplier: 3.0,  color: '#8b5cf6' },
  { label: '5×',   multiplier: 5.0,  color: '#ec4899' },
  { label: '10×',  multiplier: 10.0, color: '#00C2FF' },
]

type GameState = 'idle' | 'buying' | 'spinning' | 'result' | 'error'

interface PlayResult {
  game_id: number
  outcome: string
  segment_index: number
  segment: { label: string; multiplier: number; color: string }
  bet_amount: number
  payout_amount: number
  net: number
  balance: number
}

export default function RoyaleSpinPage() {
  const { isAuthenticated, credits, refreshCredits } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setGameState] = useState<GameState>('idle')
  const [bet, setBet] = useState(10)
  const [result, setResult] = useState<PlayResult | null>(null)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState('')
  const animRef = useRef<number>()
  const rotRef = useRef(0)

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas
    const cx = width / 2, cy = height / 2
    const r = Math.min(width, height) / 2 - 10

    ctx.clearRect(0, 0, width, height)

    const arc = (Math.PI * 2) / SEGMENTS.length

    SEGMENTS.forEach((seg, i) => {
      const start = rot + i * arc
      const end = start + arc

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = seg.color + '30'
      ctx.fill()
      ctx.strokeStyle = seg.color + '90'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${seg.label.length > 3 ? '11' : '13'}px Inter, sans-serif`
      ctx.fillText(seg.label, r - 12, 5)
      ctx.restore()
    })

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,194,255,0.3)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Center hub
    const hub = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
    hub.addColorStop(0, '#00C2FF')
    hub.addColorStop(1, '#7B2FBE')
    ctx.beginPath()
    ctx.arc(cx, cy, 20, 0, Math.PI * 2)
    ctx.fillStyle = hub
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 9px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('SPIN', cx, cy + 3)
  }

  useEffect(() => {
    drawWheel(rotRef.current)
  })

  const spinTo = (targetIndex: number, onDone: () => void) => {
    const arc = (Math.PI * 2) / SEGMENTS.length
    const segMid = targetIndex * arc + arc / 2
    const extraSpins = Math.PI * 2 * (8 + Math.random() * 3)
    // pointer is at top (−π/2), we need segMid to land at top
    const targetDelta = extraSpins + (Math.PI * 1.5 - segMid - (rotRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

    const startRot = rotRef.current
    let startTs: number | null = null
    const duration = 4500

    const ease = (t: number) => 1 - Math.pow(1 - t, 4)

    const frame = (ts: number) => {
      if (!startTs) startTs = ts
      const t = Math.min((ts - startTs) / duration, 1)
      rotRef.current = startRot + targetDelta * ease(t)
      setRotation(rotRef.current)
      drawWheel(rotRef.current)
      if (t < 1) {
        animRef.current = requestAnimationFrame(frame)
      } else {
        onDone()
      }
    }
    animRef.current = requestAnimationFrame(frame)
  }

  const handlePlay = async () => {
    if (!isAuthenticated || state === 'spinning' || state === 'buying') return
    if (credits < bet) { setError(`Need ${bet} Mini Credits to spin.`); return }
    setError('')
    setResult(null)
    setGameState('buying')

    try {
      const data = await apiPost<PlayResult>('/api/v1/games/royale-spin/play', { bet_amount: bet })
      setResult(data)
      refreshCredits()
      setGameState('spinning')
      spinTo(data.segment_index, () => setGameState('result'))
    } catch (err: any) {
      setError(err.message || 'Spin failed. Please try again.')
      setGameState('error')
    }
  }

  const handleReset = () => {
    setGameState('idle')
    setResult(null)
    setError('')
  }

  const isWin = result && result.net > 0

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card p-10 max-w-md text-center">
          <div className="text-5xl mb-4">🎡</div>
          <h2 className="text-2xl font-bold mb-2">Royale Spin</h2>
          <p className="text-arcade-text-muted mb-6">Sign in to spin and win Mini Credits.</p>
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
              <span>Royale Spin</span>
            </div>
            <h1 className="text-2xl font-bold">🎡 Royale Spin</h1>
          </div>
          <div className="credit-pill">💎 {formatCredits(credits)}</div>
        </div>

        {error && <div className="alert-error mb-4"><span>⚠</span>{error}</div>}

        <div className="card p-6 mb-4">

          {/* Wheel */}
          <div className="relative mx-auto mb-5" style={{ width: 280, height: 280 }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-xl text-arcade-primary">▼</div>
            <canvas ref={canvasRef} width={280} height={280} className="rounded-full" />
            {state === 'spinning' && (
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 40px rgba(0,194,255,0.25)' }} />
            )}
          </div>

          {/* Result */}
          {state === 'result' && result && (
            <div className="text-center mb-5 animate-fade-in-up">
              {isWin ? (
                <div>
                  <div className="text-2xl font-black text-arcade-success">{result.segment?.label} — Win!</div>
                  <div className="text-lg font-bold text-arcade-text mt-1">
                    +{result.payout_amount.toLocaleString()} Mini Credits
                  </div>
                  <div className="text-xs text-arcade-text-muted mt-0.5">net: +{result.net.toLocaleString()}</div>
                </div>
              ) : result.net === 0 ? (
                <div className="text-arcade-warning font-semibold">Break even — {result.segment?.label}</div>
              ) : (
                <div>
                  <div className="text-arcade-error font-semibold">{result.segment?.label} — No win this time</div>
                  <div className="text-xs text-arcade-text-muted mt-0.5">net: {result.net.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Bet picker (only in idle/result/error) */}
          {(state === 'idle' || state === 'result' || state === 'error') && (
            <div className="mb-4">
              <p className="text-xs text-arcade-text-muted text-center mb-2">Bet amount</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {BET_OPTIONS.filter(b => b <= 100).map(b => (
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
          <div className="text-center">
            {state === 'buying' ? (
              <div className="flex items-center justify-center gap-2 text-arcade-text-muted text-sm">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Preparing spin...</span>
              </div>
            ) : state === 'spinning' ? (
              <p className="text-arcade-text-muted text-sm animate-pulse">Spinning...</p>
            ) : (
              <button
                onClick={state === 'result' ? handleReset : handlePlay}
                disabled={credits < bet}
                className="btn-primary btn-lg">
                {state === 'result' ? 'Spin Again' : `Spin — ${bet} Mini Credits`}
              </button>
            )}
            {credits < bet && state !== 'spinning' && state !== 'buying' && (
              <p className="text-arcade-error text-xs mt-2">
                Need more credits. <Link href="/store" className="underline">Buy →</Link>
              </p>
            )}
          </div>
        </div>

        {/* Odds table */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Wheel segments</p>
          <div className="grid grid-cols-4 gap-2">
            {SEGMENTS.map(seg => (
              <div key={seg.label} className="text-center p-2 rounded-lg"
                style={{ background: seg.color + '15', border: `1px solid ${seg.color}40` }}>
                <div className="font-bold text-sm" style={{ color: seg.color }}>{seg.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-arcade-text-muted mt-2">
            Outcome decided server-side before the wheel spins. Results are random on every play.
          </p>
        </div>

      </div>
    </div>
  )
}
