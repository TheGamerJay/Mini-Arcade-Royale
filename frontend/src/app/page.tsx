'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-arcade-primary via-arcade-secondary to-arcade-accent bg-clip-text text-transparent">
          Mini Arcade Royale
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Experience premium arcade games. Compete globally. Earn real rewards.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register" className="btn-primary">
            Start Playing
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        {[
          {
            title: 'Arcade Games',
            description: 'Classic and modern arcade games with a twist',
            icon: '🎮'
          },
          {
            title: 'Real Rewards',
            description: 'Earn credits and compete for real prizes',
            icon: '💰'
          },
          {
            title: 'Global Leaderboard',
            description: 'Compete with players worldwide in real-time',
            icon: '🏆'
          }
        ].map((feature) => (
          <div key={feature.title} className="card glow-accent">
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">Ready to join the arcade revolution?</p>
        <Link href="/auth/register" className="btn-primary glow-accent">
          Create Your Account Now
        </Link>
      </div>
    </main>
  )
}
