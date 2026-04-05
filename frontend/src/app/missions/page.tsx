'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiGet, apiPost } from '@/lib/api'

interface Mission {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  target: number
  completed: boolean
  claimed: boolean
  type: 'daily' | 'weekly' | 'special'
}

const MOCK_MISSIONS: Mission[] = [
  { id: 'daily_play_1',  title: 'First Play',      description: 'Play any game today',             reward: 5,  progress: 0, target: 1,  completed: false, claimed: false, type: 'daily' },
  { id: 'daily_play_3',  title: 'Hat Trick',        description: 'Play 3 games today',              reward: 10, progress: 0, target: 3,  completed: false, claimed: false, type: 'daily' },
  { id: 'daily_win_1',   title: 'Lucky Break',      description: 'Win a game today',                reward: 15, progress: 0, target: 1,  completed: false, claimed: false, type: 'daily' },
  { id: 'weekly_play_10',title: 'Regular',          description: 'Play 10 games this week',         reward: 30, progress: 0, target: 10, completed: false, claimed: false, type: 'weekly' },
  { id: 'weekly_win_5',  title: 'Winner',           description: 'Win 5 games this week',           reward: 50, progress: 0, target: 5,  completed: false, claimed: false, type: 'weekly' },
  { id: 'weekly_vault_3',title: 'Vault Hunter',     description: 'Open 3 Mystery Vaults this week', reward: 40, progress: 0, target: 3,  completed: false, claimed: false, type: 'weekly' },
  { id: 'special_first_spin',   title: 'First Spin',    description: 'Play Royale Spin for the first time',    reward: 20, progress: 0, target: 1, completed: false, claimed: false, type: 'special' },
  { id: 'special_first_scratch', title: 'Scratch Master', description: 'Play Scratch Royale for the first time', reward: 20, progress: 0, target: 1, completed: false, claimed: false, type: 'special' },
]

export default function MissionsPage() {
  const { isAuthenticated, refreshCredits } = useAuth()
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily')
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    apiGet<{ missions: Mission[] }>('/api/v1/missions')
      .then(d => {
        if (d.missions?.length) setMissions(d.missions)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleClaim = async (id: string) => {
    setClaiming(id)
    setClaimMsg('')
    try {
      const res = await apiPost<{ message: string; credits_awarded: number }>(`/api/v1/missions/${id}/claim`)
      setMissions(ms => ms.map(m => m.id === id ? { ...m, claimed: true } : m))
      setClaimMsg(res.message || 'Reward claimed!')
      refreshCredits()
      setTimeout(() => setClaimMsg(''), 3000)
    } catch (err: any) {
      setClaimMsg(err.message || 'Claim failed')
      setTimeout(() => setClaimMsg(''), 3000)
    }
    setClaiming(null)
  }

  const TABS: { key: 'daily' | 'weekly' | 'special'; label: string; icon: string }[] = [
    { key: 'daily',   label: 'Daily',   icon: '📅' },
    { key: 'weekly',  label: 'Weekly',  icon: '📆' },
    { key: 'special', label: 'Special', icon: '⭐' },
  ]

  const filtered = missions.filter(m => m.type === activeTab)

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative py-12 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-2">
            🎯 <span className="text-gradient">Missions</span>
          </h1>
          <p className="text-arcade-text-muted">Complete challenges to earn free Mini Credits.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {!isAuthenticated ? (
          <div className="empty-state py-16">
            <div className="empty-state-icon">🎯</div>
            <p className="empty-state-title">Sign in to view missions</p>
            <p className="empty-state-desc mb-6">Complete missions and earn bonus Mini Credits.</p>
            <Link href="/auth/register" className="btn-primary">Get Started Free</Link>
          </div>
        ) : (
          <>
            {claimMsg && (
              <div className="alert-success mb-4"><span>✓</span>{claimMsg}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">✅</div>
                <p className="empty-state-title">No missions here</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(mission => {
                  const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100))
                  return (
                    <div key={mission.id}
                      className={`card p-5 flex flex-col gap-3 ${mission.claimed ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{mission.title}</p>
                          <p className="text-xs text-arcade-text-muted mt-0.5">{mission.description}</p>
                        </div>
                        <span className="badge badge-muted text-xs flex-shrink-0">+{mission.reward} cr</span>
                      </div>

                      <div>
                        <div className="progress-bar h-1.5">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-arcade-text-muted">{mission.progress}/{mission.target}</span>
                          <span className="text-xs text-arcade-text-muted">{pct}%</span>
                        </div>
                      </div>

                      {mission.claimed ? (
                        <div className="text-center text-xs text-arcade-success font-medium">✓ Claimed</div>
                      ) : mission.completed ? (
                        <button onClick={() => handleClaim(mission.id)}
                          disabled={claiming === mission.id}
                          className="btn-primary btn-sm w-full">
                          {claiming === mission.id ? 'Claiming...' : '🎁 Claim Reward'}
                        </button>
                      ) : (
                        <Link href="/games" className="btn-ghost btn-sm w-full text-center text-xs block">
                          Play to progress →
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
