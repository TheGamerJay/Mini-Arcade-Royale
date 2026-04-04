'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { formatCredits, formatDate } from '@/lib/api'

const QUICK_LINKS = [
  { href: '/account/profile', icon: '✏️', label: 'Edit Profile', desc: 'Update your display name and info' },
  { href: '/account/credits', icon: '💎', label: 'Credits', desc: 'View balance and transaction history' },
  { href: '/account/security', icon: '🔒', label: 'Security', desc: 'Change password and manage security' },
  { href: '/account/game-history', icon: '🎮', label: 'Game History', desc: 'Review all your plays' },
  { href: '/account/purchases', icon: '🧾', label: 'Purchases', desc: 'View credit purchase receipts' },
  { href: '/account/stats', icon: '📊', label: 'Stats', desc: 'Your performance overview' },
]

export default function AccountPage() {
  const { user, credits } = useAuth()

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">Manage your profile, credits, and settings.</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00C2FF, #7B2FBE)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user?.display_name || user?.username}</h2>
            <p className="text-arcade-text-muted text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? '✓ Verified' : '⚠ Unverified'}
              </span>
              <span className="badge-muted">Member since {user?.created_at ? formatDate(user.created_at) : '—'}</span>
            </div>
          </div>
          <Link href="/account/profile" className="btn-outline btn-sm flex-shrink-0">Edit</Link>
        </div>
      </div>

      {/* Credit balance */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.08), rgba(123,47,190,0.08))', borderColor: 'rgba(0,194,255,0.25)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-arcade-text-muted mb-1">Credit Balance</p>
            <p className="text-3xl font-black text-gradient">{formatCredits(credits)}</p>
            <p className="text-xs text-arcade-text-muted mt-1">virtual credits</p>
          </div>
          <div className="flex gap-2">
            <Link href="/store" className="btn-primary btn-sm">Buy Credits</Link>
            <Link href="/account/credits/history" className="btn-outline btn-sm">History</Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_LINKS.map(link => (
          <Link key={link.href} href={link.href}
            className="card-hover p-5 flex items-start gap-3 cursor-pointer">
            <span className="text-2xl">{link.icon}</span>
            <div>
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-arcade-text-muted mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-arcade-error/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-arcade-error">Danger Zone</p>
            <p className="text-xs text-arcade-text-muted mt-0.5">Permanently delete your account and all data</p>
          </div>
          <Link href="/account/delete" className="btn-danger btn-sm">Delete Account</Link>
        </div>
      </div>
    </div>
  )
}
