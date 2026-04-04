'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiGet, apiPost } from '@/lib/api'

interface Mission {
  id: number
  title: string
  description: string
  reward_credits: number
  progress: number
  target: number
  completed: boolean
  claimed: boolean
  icon: string
  category: string
}

const MOCK_MISSIONS: Mission[] = [
  { id: 1, title: 'First Play', description: 'Play your first game', reward_credits: 50, progress: 0, target: 1, completed: false, claimed: false, icon: '🎮', category: 'Daily' },
  { id: 2, title: 'Credit Spender', description: 'Spend 100 credits on games', reward_credits: 25, progress: 0, target: 100, completed: false, claimed: false, icon: '💎', category: 'Daily' },
  { id: 3, title: 'Arcade Regular', description: 'Play 5 games this week', reward_credits: 150, progress: 0, target: 5, completed: false, claimed: false, icon: '🕹', category: 'Weekly' },
  { id: 4, title: 'Game Explorer', description: 'Try 3 different game types', reward_credits: 200, progress: 0, target: 3, completed: false, claimed: false, icon: '🗺', category: 'Weekly' },
  { id: 5, title: 'Streak Starter', description: 'Log in 3 days in a row', reward_credits: 100, progress: 0, target: 3, completed: false, claimed: false, icon: '🔥', category: 'Special' },
  { id: 6, title: 'Vault Hunter', description: 'Open 2 Mystery Vaults', reward_credits: 175, progress: 0, target: 2, completed: false, claimed: false, icon: '🔮', category: 'Weekly' },
]

export default function MissionsPage() {
  const { isAuthenticated } = useAuth()
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Daily')
  const [claiming, setClaiming] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    apiGet<{ missions: Mission[] }>('/api/v1/missions')
      .then(d => setMissions(d.missions?.length ? d.missions : MOCK_MISSIONS))
      .catch(() => setMissions(MOCK_MISSIONS))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleClaim = async (id: number) => {
    setClaiming(id)
    try {
      await apiPost(`/api/v1/missions/${id}/claim`)
      setMissions(ms => ms.map(m => m.id === id ? { ...m, claimed: true } : m))
    } catch {}
    setClaiming(null)
  }

  const tabs = ['Daily', 'Weekly', 'Special']
  const filtered = missions.filter(m => m.category === activeTab)

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative py-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative container-md">
          <span className="badge-blue mb-4 inline-flex">🎯 Missions</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Complete <span className="text-gradient">Missions</span>
          </h1>
          <p className="text-arcade-text-muted text-lg">
            Complete challenges to earn bonus credits and achievements.
          </p>
        </div>
      </div>

      <div className="container-xl pb-20">
        {!isAuthenticated ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h2 className="empty-state-title">Sign in to view missions</h2>
            <p className="empty-state-desc mb-6">Create an account to start completing missions and earning bonus credits.</p>
            <Link href="/auth/register" className="btn-primary">Get Started</Link>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="tab-bar mb-8 max-w-sm">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`tab ${activeTab === tab ? 'tab-active' : ''}`}>
                  {tab === 'Daily' ? '📅' : tab === 'Weekly' ? '📆' : '⭐'} {tab}
                </button>
              ))}
            </div>

            {/* Mission cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(mission => (
                <div key={mission.id}
                  className={`card p-5 transition-all ${mission.claimed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg, #00C2FF22, #7B2FBE22)', border: '1px solid rgba(0,194,255,0.2)' }}>
                        {mission.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{mission.title}</h3>
                        <p className="text-xs text-arcade-text-muted">{mission.description}</p>
                      </div>
                    </div>
                    <span className="badge-blue text-xs flex-shrink-0 ml-2">
                      +{mission.reward_credits}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="progress-bar h-1.5">
                      <div className="progress-fill"
                        style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-arcade-text-muted">
                        {mission.progress}/{mission.target}
                      </span>
                      <span className="text-xs text-arcade-text-muted">
                        {Math.round((mission.progress / mission.target) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {mission.claimed ? (
                    <div className="text-center text-xs text-arcade-success font-medium">✓ Claimed</div>
                  ) : mission.completed ? (
                    <button
                      onClick={() => handleClaim(mission.id)}
                      disabled={claiming === mission.id}
                      className="btn-primary w-full btn-sm">
                      {claiming === mission.id ? 'Claiming...' : '🎁 Claim Reward'}
                    </button>
                  ) : (
                    <Link href="/games" className="btn-ghost w-full btn-sm text-center block text-xs">
                      Play to progress →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
