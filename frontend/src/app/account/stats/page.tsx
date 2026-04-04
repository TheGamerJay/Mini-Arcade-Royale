'use client'

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'

interface Stats {
  total_games_played: number
  total_credits_spent: number
  total_credits_won: number
  net_result: number
  win_rate: number
  favorite_game: string | null
  current_streak: number
  longest_streak: number
  games_by_type: Record<string, number>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Stats>('/api/v1/account/stats')
      .then(setStats)
      .catch(() => setStats({
        total_games_played: 0, total_credits_spent: 0, total_credits_won: 0,
        net_result: 0, win_rate: 0, favorite_game: null,
        current_streak: 0, longest_streak: 0, games_by_type: {},
      }))
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = stats ? [
    { label: 'Games Played', value: stats.total_games_played.toLocaleString(), icon: '🎮' },
    { label: 'Credits Spent', value: stats.total_credits_spent.toLocaleString(), icon: '💸', color: 'text-arcade-error' },
    { label: 'Credits Won', value: stats.total_credits_won.toLocaleString(), icon: '🏆', color: 'text-arcade-success' },
    { label: 'Net Result', value: (stats.net_result >= 0 ? '+' : '') + stats.net_result.toLocaleString(), icon: '📊', color: stats.net_result >= 0 ? 'text-arcade-success' : 'text-arcade-error' },
    { label: 'Win Rate', value: `${stats.win_rate.toFixed(1)}%`, icon: '🎯' },
    { label: 'Current Streak', value: `${stats.current_streak} days`, icon: '🔥' },
    { label: 'Longest Streak', value: `${stats.longest_streak} days`, icon: '⭐' },
    { label: 'Favorite Game', value: stats.favorite_game || '—', icon: '❤️' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Stats</h1>
        <p className="page-subtitle">Your overall performance overview.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map(stat => (
              <div key={stat.label} className="card p-5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-xs text-arcade-text-muted mb-1">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color || 'text-arcade-text'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {stats && Object.keys(stats.games_by_type).length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Games by Type</h2>
              <div className="space-y-3">
                {Object.entries(stats.games_by_type).map(([game, count]) => {
                  const total = Object.values(stats.games_by_type).reduce((a, b) => a + b, 0)
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={game}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-arcade-text-muted capitalize">{game.replace(/-/g, ' ')}</span>
                        <span>{count} plays ({pct}%)</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
