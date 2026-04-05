'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/lib/api'

interface AdminStats {
  total_users: number
  active_users: number
  total_transactions: number
  total_credits_in_circulation: number
  total_games_played: number
}

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (!authLoading && isAuthenticated) {
      // Stub — real implementation checks user.role === 'admin'
      apiGet<AdminStats>('/api/v1/admin/stats')
        .then(setStats)
        .catch(() => setStats({
          total_users: 0, active_users: 0,
          total_transactions: 0, total_credits_in_circulation: 0,
          total_games_played: 0,
        }))
        .finally(() => setLoading(false))
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="skeleton h-8 w-32 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Platform overview and management.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users',             value: stats?.total_users?.toLocaleString() ?? '—',                   icon: '👥' },
          { label: 'Active Users',            value: stats?.active_users?.toLocaleString() ?? '—',                  icon: '✅' },
          { label: 'Total Transactions',      value: stats?.total_transactions?.toLocaleString() ?? '—',            icon: '📋' },
          { label: 'Credits in Circulation',  value: stats?.total_credits_in_circulation?.toLocaleString() ?? '—', icon: '💎' },
          { label: 'Total Games Played',      value: stats?.total_games_played?.toLocaleString() ?? '—',            icon: '🎮' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xs text-arcade-text-muted mb-0.5">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/users', icon: '👥', label: 'User Management', desc: 'View, search, suspend users and adjust credits' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="card card-hover p-5 flex items-center gap-4">
            <span className="text-3xl">{link.icon}</span>
            <div>
              <p className="font-semibold">{link.label}</p>
              <p className="text-xs text-arcade-text-muted mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
