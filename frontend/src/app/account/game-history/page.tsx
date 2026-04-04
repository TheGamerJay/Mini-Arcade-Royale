'use client'

import { useState, useEffect } from 'react'
import { apiGet, formatDateTime } from '@/lib/api'

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
  'royale-spin': '🎡 Royale Spin',
  'mystery-vault': '🔮 Mystery Vault',
}

export default function GameHistoryPage() {
  const [plays, setPlays] = useState<GamePlay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ plays: GamePlay[] }>('/api/v1/account/game-history?limit=50')
      .then(d => setPlays(d.plays || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const net = plays.reduce((sum, p) => sum + (p.payout_amount - p.bet_amount), 0)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Game History</h1>
        <p className="page-subtitle">All your recent game plays.</p>
      </div>

      {!loading && plays.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Plays', value: plays.length },
            { label: 'Total Spent', value: plays.reduce((s, p) => s + p.bet_amount, 0).toLocaleString() + ' cr' },
            { label: 'Net Result', value: (net >= 0 ? '+' : '') + net.toLocaleString() + ' cr', color: net >= 0 ? 'text-arcade-success' : 'text-arcade-error' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="text-xs text-arcade-text-muted mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color || ''}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : plays.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">🎮</div>
            <p className="empty-state-title">No games played yet</p>
            <p className="empty-state-desc">Start playing to see your history here.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Game</th><th className="text-right">Spent</th><th className="text-right">Won</th><th className="text-right hidden sm:table-cell">Net</th><th className="hidden md:table-cell">Outcome</th><th className="hidden lg:table-cell">Date</th></tr></thead>
            <tbody>
              {plays.map(play => {
                const net = play.payout_amount - play.bet_amount
                return (
                  <tr key={play.id}>
                    <td className="text-sm font-medium">{GAME_NAMES[play.game_key] || play.game_key}</td>
                    <td className="text-right text-sm text-arcade-error">-{play.bet_amount.toLocaleString()}</td>
                    <td className="text-right text-sm text-arcade-success">+{play.payout_amount.toLocaleString()}</td>
                    <td className={`text-right text-sm font-semibold hidden sm:table-cell ${net >= 0 ? 'text-arcade-success' : 'text-arcade-error'}`}>
                      {net >= 0 ? '+' : ''}{net.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell">
                      <span className={`badge text-xs ${play.outcome === 'win' ? 'badge-success' : play.outcome === 'loss' ? 'badge-error' : 'badge-muted'}`}>
                        {play.outcome}
                      </span>
                    </td>
                    <td className="text-xs text-arcade-text-muted hidden lg:table-cell">{formatDateTime(play.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
