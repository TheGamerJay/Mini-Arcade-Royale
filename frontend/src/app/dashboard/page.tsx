'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiGet, formatCredits } from '@/lib/api'

interface Stats {
  total_games_played: number
  net_result: number
  win_rate: number
  favorite_game: string | null
}

interface GamePlay {
  id: number
  game_key: string
  bet_amount: number
  payout_amount: number
  outcome: string
  created_at: string
}

const GAME_NAMES: Record<string, string> = {
  'scratch-royale': '🎴 Scratch Royale',
  'royale-spin':    '🎡 Royale Spin',
  'mystery-vault':  '🔮 Mystery Vault',
}

const QUICK_LINKS = [
  { href: '/games/scratch-royale', icon: '🎴', label: 'Scratch Royale', desc: 'Scratch & win' },
  { href: '/games/royale-spin',    icon: '🎡', label: 'Royale Spin',    desc: 'Spin the wheel' },
  { href: '/games/mystery-vault',  icon: '🔮', label: 'Mystery Vault',  desc: 'Open a vault' },
  { href: '/missions',             icon: '🎯', label: 'Missions',       desc: 'Earn free credits' },
  { href: '/leaderboard',          icon: '🏆', label: 'Leaderboard',    desc: 'See top players' },
  { href: '/store',                icon: '💳', label: 'Get Credits',    desc: 'Buy Mini Credits' },
]

export default function DashboardPage() {
  const { user, credits, isAuthenticated, loading: authLoading, refreshCredits } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPlays, setRecentPlays] = useState<GamePlay[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    refreshCredits()
    apiGet<Stats>('/api/v1/account/stats').then(setStats).catch(() => {})
    apiGet<{ plays: GamePlay[] }>('/api/v1/account/game-history?limit=5')
      .then(d => setRecentPlays(d.plays || []))
      .catch(() => {})
  }, [isAuthenticated, refreshCredits])

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const displayName = user?.display_name || user?.username || 'Player'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, {displayName}!</h1>
        <p className="text-arcade-text-muted text-sm mt-1">Here&apos;s your arcade overview.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mini Credits', value: formatCredits(credits), icon: '💎', color: 'text-arcade-primary' },
          { label: 'Games Played', value: (stats?.total_games_played ?? 0).toLocaleString(), icon: '🎮', color: '' },
          { label: 'Win Rate',     value: stats ? `${stats.win_rate}%` : '—', icon: '🎯', color: '' },
          { label: 'Net Result',   value: stats ? (stats.net_result >= 0 ? '+' : '') + stats.net_result.toLocaleString() : '—',
            icon: '📊', color: stats ? (stats.net_result >= 0 ? 'text-arcade-success' : 'text-arcade-error') : '' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xs text-arcade-text-muted mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold ${s.color || 'text-arcade-text'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick play grid */}
      <div>
        <h2 className="font-semibold mb-3">Quick Play</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="card card-hover p-4 flex items-center gap-3">
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="text-sm font-semibold">{link.label}</p>
                <p className="text-xs text-arcade-text-muted">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent games */}
      {recentPlays.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-arcade-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Games</h2>
            <Link href="/account/game-history" className="text-xs text-arcade-primary hover:underline">View all →</Link>
          </div>
          <table className="table">
            <thead><tr><th>Game</th><th className="text-right">Spent</th><th className="text-right">Won</th><th className="text-right hidden sm:table-cell">Net</th></tr></thead>
            <tbody>
              {recentPlays.map(p => {
                const net = p.payout_amount - p.bet_amount
                return (
                  <tr key={p.id}>
                    <td className="text-sm font-medium">{GAME_NAMES[p.game_key] || p.game_key}</td>
                    <td className="text-right text-sm text-arcade-error">-{p.bet_amount.toLocaleString()}</td>
                    <td className="text-right text-sm text-arcade-success">+{p.payout_amount.toLocaleString()}</td>
                    <td className={`text-right text-sm font-semibold hidden sm:table-cell ${net >= 0 ? 'text-arcade-success' : 'text-arcade-error'}`}>
                      {net >= 0 ? '+' : ''}{net.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No games CTA */}
      {!authLoading && stats?.total_games_played === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">🎮</div>
          <h3 className="font-bold text-lg mb-1">Ready to play?</h3>
          <p className="text-arcade-text-muted text-sm mb-4">
            You have <span className="text-arcade-primary font-bold">{formatCredits(credits)} Mini Credits</span> — pick a game and start winning!
          </p>
          <Link href="/games" className="btn-primary">Browse Games</Link>
        </div>
      )}
    </div>
  )
}
