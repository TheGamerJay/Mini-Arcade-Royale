'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/login')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-arcade-dark/50 border-b border-arcade-primary/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('access_token')
              localStorage.removeItem('user')
              router.push('/')
            }}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Balance', value: '0 Credits', icon: '💰' },
            { label: 'Games Played', value: '0', icon: '🎮' },
            { label: 'Rank', value: 'Unranked', icon: '🏆' },
            { label: 'Win Rate', value: '0%', icon: '📊' }
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/games" className="card hover:border-arcade-primary/80 transition-all cursor-pointer group">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-arcade-primary">Play Games</h3>
            <p className="text-gray-400">Start playing and earn credits</p>
          </Link>

          <Link href="/leaderboard" className="card hover:border-arcade-primary/80 transition-all cursor-pointer group">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-arcade-primary">Leaderboard</h3>
            <p className="text-gray-400">See how you rank globally</p>
          </Link>

          <Link href="/store" className="card hover:border-arcade-primary/80 transition-all cursor-pointer group">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-arcade-primary">Store</h3>
            <p className="text-gray-400">Buy credits and power-ups</p>
          </Link>

          <Link href="/wallet" className="card hover:border-arcade-primary/80 transition-all cursor-pointer group">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-arcade-primary">Wallet</h3>
            <p className="text-gray-400">Manage your account</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
