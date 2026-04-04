'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { formatCredits } from '@/lib/api'

const publicLinks = [
  { href: '/games', label: 'Games' },
  { href: '/store', label: 'Store' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/missions', label: 'Missions' },
]

const userMenuLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/account', label: 'Account', icon: '👤' },
  { href: '/account/credits', label: 'Credits', icon: '💎' },
  { href: '/account/game-history', label: 'Game History', icon: '🎮' },
  { href: '/offers', label: 'Offers', icon: '🎁' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, credits, logout, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-arcade-border/60"
      style={{ background: 'rgba(8,8,15,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="container-xl">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg, #00C2FF, #7B2FBE)' }}>
              🕹
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="text-gradient">Mini Arcade</span>
              <span className="text-arcade-text"> Royale</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`nav-link px-3 py-2 rounded-lg text-sm ${isActive(link.href) ? 'nav-link-active bg-arcade-primary/10' : 'hover:bg-arcade-surface-2'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Credit balance pill */}
                <Link href="/store" className="credit-pill hidden sm:flex hover:shadow-glow-blue-sm transition-shadow">
                  <span>💎</span>
                  <span>{formatCredits(credits)}</span>
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-arcade-surface-2 border border-arcade-border hover:border-arcade-primary/30 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #00C2FF, #7B2FBE)' }}>
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                    <svg className={`w-4 h-4 text-arcade-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 card-glass z-20 py-2 animate-fade-in-up">
                        <div className="px-4 py-3 border-b border-arcade-border">
                          <p className="text-sm font-semibold">{user?.username}</p>
                          <p className="text-xs text-arcade-text-muted truncate">{user?.email}</p>
                          <div className="mt-2 credit-pill text-xs">
                            <span>💎</span>
                            <span>{formatCredits(credits)} credits</span>
                          </div>
                        </div>
                        <div className="py-1">
                          {userMenuLinks.map(link => (
                            <Link key={link.href} href={link.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-arcade-text-muted hover:text-arcade-text hover:bg-arcade-surface-2 transition-colors">
                              <span>{link.icon}</span>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-arcade-border py-1">
                          <button onClick={() => { setUserMenuOpen(false); logout() }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-arcade-error hover:bg-arcade-error/10 transition-colors text-left">
                            <span>🚪</span>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                <Link href="/auth/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-arcade-border bg-arcade-surface">
          <div className="container-xl py-3 space-y-1">
            {publicLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${isActive(link.href) ? 'bg-arcade-primary/10 text-arcade-primary' : 'text-arcade-text-muted hover:text-arcade-text hover:bg-arcade-surface-2'}`}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <div className="pt-2 border-t border-arcade-border">
                {userMenuLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arcade-text-muted hover:text-arcade-text hover:bg-arcade-surface-2">
                    <span>{link.icon}</span>{link.label}
                  </Link>
                ))}
                <button onClick={() => { setMobileOpen(false); logout() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arcade-error hover:bg-arcade-error/10 text-left">
                  <span>🚪</span>Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
