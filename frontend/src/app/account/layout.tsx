'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { href: '/account', label: 'Overview', icon: '👤', exact: true },
  { href: '/account/profile', label: 'Profile', icon: '✏️' },
  { href: '/account/credits', label: 'Credits', icon: '💎' },
  { href: '/account/game-history', label: 'Game History', icon: '🎮' },
  { href: '/account/purchases', label: 'Purchases', icon: '🧾' },
  { href: '/account/stats', label: 'Stats', icon: '📊' },
  { href: '/account/security', label: 'Security', icon: '🔒' },
  { href: '/account/sessions', label: 'Sessions', icon: '🖥' },
  { href: '/account/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/account/delete', label: 'Delete Account', icon: '🗑', danger: true },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  if (loading || !user) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-arcade-text-muted text-sm">Loading...</div>
    </div>
  )

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="card p-3 lg:sticky lg:top-20">
              {/* User summary */}
              <div className="px-3 py-4 mb-2 border-b border-arcade-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00C2FF, #7B2FBE)' }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">{user.username}</p>
                    <p className="text-xs text-arcade-text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-0.5">
                {NAV.map(item => (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive(item.href, item.exact)
                        ? 'bg-arcade-primary/10 text-arcade-primary font-medium'
                        : item.danger
                          ? 'text-arcade-error/70 hover:text-arcade-error hover:bg-arcade-error/10'
                          : 'text-arcade-text-muted hover:text-arcade-text hover:bg-arcade-surface-2'
                    }`}>
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
