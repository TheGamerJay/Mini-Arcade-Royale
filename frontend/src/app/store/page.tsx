'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiPost } from '@/lib/api'

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    bonus: 0,
    price: 0.99,
    icon: '⚡',
    highlight: false,
    tag: null,
  },
  {
    id: 'player',
    name: 'Player Pack',
    credits: 600,
    bonus: 50,
    price: 4.99,
    icon: '🎮',
    highlight: false,
    tag: null,
  },
  {
    id: 'champion',
    name: 'Champion Pack',
    credits: 1300,
    bonus: 150,
    price: 9.99,
    icon: '🏆',
    highlight: true,
    tag: 'Best Value',
  },
  {
    id: 'royale',
    name: 'Royale Pack',
    credits: 2800,
    bonus: 400,
    price: 19.99,
    icon: '👑',
    highlight: false,
    tag: 'Popular',
  },
  {
    id: 'legend',
    name: 'Legend Pack',
    credits: 8000,
    bonus: 1500,
    price: 49.99,
    icon: '💎',
    highlight: false,
    tag: 'Most Credits',
  },
]

export default function StorePage() {
  const { isAuthenticated, credits } = useAuth()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    if (!isAuthenticated) return
    setError('')
    setLoadingId(pkg.id)
    try {
      const data = await apiPost<{ checkout_url: string }>('/api/v1/payments/checkout', {
        package_id: pkg.id,
      })
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative py-14 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative container-md">
          <span className="badge-purple mb-4 inline-flex">💎 Credit Store</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Top Up</span>{' '}
            <span className="text-arcade-text">Your Credits</span>
          </h1>
          <p className="text-arcade-text-muted text-lg max-w-xl mx-auto">
            Purchase virtual credits to play games and compete on the leaderboard.
            Credits have no cash value.
          </p>
          {isAuthenticated && (
            <div className="mt-4 credit-pill inline-flex">
              💎 Current Balance: {credits.toLocaleString()} credits
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="container-xl mb-4">
          <div className="alert-error"><span>⚠</span>{error}</div>
        </div>
      )}

      {/* Packages */}
      <div className="container-xl pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {PACKAGES.map(pkg => {
            const totalCredits = pkg.credits + pkg.bonus
            const perDollar = Math.round(totalCredits / pkg.price)
            return (
              <div
                key={pkg.id}
                className={`relative card p-6 flex flex-col transition-all duration-300 ${
                  pkg.highlight
                    ? 'border-arcade-primary/50 shadow-glow-blue scale-105'
                    : 'hover:border-arcade-primary/30 hover:-translate-y-1'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-blue text-xs px-3 py-1">⭐ Best Value</span>
                  </div>
                )}
                {pkg.tag && !pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-muted text-xs px-3 py-1">{pkg.tag}</span>
                  </div>
                )}

                <div className="text-4xl mb-4 text-center">{pkg.icon}</div>
                <h3 className="font-bold text-center mb-1">{pkg.name}</h3>

                <div className="text-center my-4">
                  <div className="text-3xl font-black text-gradient">{pkg.credits.toLocaleString()}</div>
                  <div className="text-sm text-arcade-text-muted">credits</div>
                  {pkg.bonus > 0 && (
                    <div className="mt-1 text-xs text-arcade-success font-semibold">
                      +{pkg.bonus.toLocaleString()} bonus
                    </div>
                  )}
                </div>

                <div className="text-xs text-arcade-text-muted text-center mb-4">
                  {perDollar.toLocaleString()} credits / $1
                </div>

                <div className="mt-auto">
                  <div className="text-2xl font-bold text-center mb-4">
                    ${pkg.price.toFixed(2)}
                  </div>
                  {isAuthenticated ? (
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={loadingId === pkg.id}
                      className={`w-full ${pkg.highlight ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {loadingId === pkg.id ? 'Loading...' : 'Buy Now'}
                    </button>
                  ) : (
                    <Link href="/auth/register" className={`w-full block text-center ${pkg.highlight ? 'btn-primary' : 'btn-outline'}`}>
                      Sign Up to Buy
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust row */}
        <div className="mt-12 card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', label: 'Secure Checkout', desc: 'Powered by Stripe' },
              { icon: '⚡', label: 'Instant Delivery', desc: 'Credits added immediately' },
              { icon: '🎮', label: 'Virtual Currency', desc: 'Entertainment use only' },
              { icon: '📧', label: 'Receipt by Email', desc: 'Confirmation sent to you' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs text-arcade-text-muted">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-arcade-text-muted mt-6 max-w-lg mx-auto">
          Credits are virtual entertainment currency with no cash value and cannot be redeemed for real money.
          All purchases are subject to our{' '}
          <Link href="/legal/refund-policy" className="text-arcade-primary hover:underline">Refund Policy</Link>{' '}
          and{' '}
          <Link href="/legal/credits-policy" className="text-arcade-primary hover:underline">Credits Policy</Link>.
        </p>
      </div>
    </div>
  )
}
