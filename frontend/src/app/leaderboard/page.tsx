'use client'

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface LeaderboardEntry {
  rank: number
  username: string
  display_name: string | null
  total_won: number
  games_played: number
  avatar?: string
}

const TABS = [
  { key: 'credits_won', label: 'Most Credits Won', icon: '💎' },
  { key: 'games_played', label: 'Most Games Played', icon: '🎮' },
  { key: 'streak', label: 'Longest Streak', icon: '🔥' },
]

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: 'bg-arcade-gold/10 border-arcade-gold/30', text: 'text-arcade-gold', icon: '🥇' },
  2: { bg: 'bg-gray-400/10 border-gray-400/20', text: 'text-gray-300', icon: '🥈' },
  3: { bg: 'bg-orange-700/10 border-orange-700/20', text: 'text-orange-400', icon: '🥉' },
}

function MockLeaderboard() {
  const mock: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    username: `player${1000 + i * 37}`,
    display_name: null,
    total_won: Math.max(0, 50000 - i * 4200 + Math.floor(Math.random() * 500)),
    games_played: Math.max(1, 200 - i * 18),
  }))
  return mock
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('credits_won')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiGet<{ entries: LeaderboardEntry[] }>(`/api/v1/leaderboard/global?type=${activeTab}&limit=50`)
      .then(d => setEntries(d.entries || MockLeaderboard()))
      .catch(() => setEntries(MockLeaderboard()))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative py-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative container-md">
          <span className="badge-gold mb-4 inline-flex">🏆 Global Rankings</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Leaderboard</span>
          </h1>
          <p className="text-arcade-text-muted text-lg">
            Top players competing for arcade glory.
          </p>
        </div>
      </div>

      <div className="container-xl pb-20">
        {/* Tabs */}
        <div className="tab-bar mb-8 max-w-lg mx-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab text-xs ${activeTab === tab.key ? 'tab-active' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!loading && entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
            {[entries[1], entries[0], entries[2]].map((entry, i) => {
              const displayRank = [2, 1, 3][i]
              const style = RANK_STYLES[displayRank]
              return (
                <div key={entry.username}
                  className={`card border p-4 text-center ${style.bg} ${i === 1 ? 'order-first sm:order-none -mt-4' : ''}`}>
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className={`text-sm font-bold ${style.text}`}>{entry.username}</div>
                  <div className="text-xs text-arcade-text-muted mt-1">
                    💎 {entry.total_won.toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16">Rank</th>
                  <th>Player</th>
                  <th className="text-right">Credits Won</th>
                  <th className="text-right hidden sm:table-cell">Games</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isMe = user?.username === entry.username
                  const rankStyle = RANK_STYLES[entry.rank]
                  return (
                    <tr key={entry.username}
                      className={isMe ? 'bg-arcade-primary/5' : ''}>
                      <td>
                        <span className={`font-bold ${rankStyle?.text || 'text-arcade-text-muted'}`}>
                          {rankStyle?.icon || `#${entry.rank}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #00C2FF33, #7B2FBE33)', border: '1px solid rgba(0,194,255,0.2)' }}>
                            {entry.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className={`font-medium text-sm ${isMe ? 'text-arcade-primary' : ''}`}>
                              {entry.display_name || entry.username}
                            </span>
                            {isMe && <span className="ml-2 badge-blue text-xs">You</span>}
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-arcade-accent">
                          💎 {entry.total_won.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right hidden sm:table-cell text-arcade-text-muted text-sm">
                        {entry.games_played.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
