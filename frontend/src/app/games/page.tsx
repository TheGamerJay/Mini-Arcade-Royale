'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const GAMES = [
  {
    key: 'scratch-royale',
    name: 'Scratch Royale',
    description: 'Scratch to reveal hidden prizes. Up to 50× your credits.',
    icon: '🎴',
    cost: '10 credits / play',
    tag: 'Instant Win',
    tagColor: 'badge-blue',
    href: '/games/scratch-royale',
    gradient: 'from-blue-900/40 to-cyan-900/20',
    border: 'hover:border-arcade-primary/40',
    glow: 'hover:shadow-glow-blue',
  },
  {
    key: 'royale-spin',
    name: 'Royale Spin',
    description: 'Spin the neon wheel and land on massive credit multipliers.',
    icon: '🎡',
    cost: '25 credits / spin',
    tag: 'Most Popular',
    tagColor: 'badge-gold',
    href: '/games/royale-spin',
    gradient: 'from-purple-900/40 to-pink-900/20',
    border: 'hover:border-arcade-secondary/40',
    glow: 'hover:shadow-glow-purple',
  },
  {
    key: 'mystery-vault',
    name: 'Mystery Vault',
    description: 'Open encrypted vaults for rare credits and exclusive rewards.',
    icon: '🔮',
    cost: '50 credits / vault',
    tag: 'Rare Drops',
    tagColor: 'badge-purple',
    href: '/games/mystery-vault',
    gradient: 'from-violet-900/40 to-purple-900/20',
    border: 'hover:border-arcade-accent-2/40',
    glow: 'hover:shadow-[0_0_20px_rgba(191,0,255,0.3)]',
  },
]

export default function GamesPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative container-md">
          <span className="badge-blue mb-4 inline-flex">🎮 Arcade Games</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Play. Win.</span>{' '}
            <span className="text-arcade-text">Dominate.</span>
          </h1>
          <p className="text-arcade-text-muted text-lg max-w-xl mx-auto">
            Three premium games powered by server-side fairness. Every outcome is determined before you play.
          </p>
        </div>
      </div>

      {/* Games grid */}
      <div className="container-xl pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {GAMES.map(game => (
            <Link
              key={game.key}
              href={isAuthenticated ? game.href : '/auth/register'}
              className={`group relative card overflow-hidden transition-all duration-300 ${game.border} ${game.glow} cursor-pointer`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-50 pointer-events-none`} />

              <div className="relative p-8">
                {/* Tag */}
                <div className="flex items-center justify-between mb-6">
                  <span className={game.tagColor}>{game.tag}</span>
                  {!isAuthenticated && (
                    <span className="badge-muted text-xs">Sign in to play</span>
                  )}
                </div>

                {/* Icon */}
                <div className="text-6xl mb-5 group-hover:animate-bounce-soft transition-all">
                  {game.icon}
                </div>

                {/* Info */}
                <h2 className="text-xl font-bold mb-2 group-hover:text-arcade-primary transition-colors">
                  {game.name}
                </h2>
                <p className="text-arcade-text-muted text-sm mb-4 leading-relaxed">
                  {game.description}
                </p>

                {/* Cost */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-arcade-text-muted bg-arcade-surface-3 px-3 py-1 rounded-full">
                    💎 {game.cost}
                  </span>
                  <span className="text-arcade-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Play →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info row */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🛡', title: 'Provably Fair', desc: 'All outcomes decided server-side before you play' },
            { icon: '⚡', title: 'Instant Results', desc: 'No waiting — results are immediate' },
            { icon: '💎', title: 'Virtual Credits Only', desc: 'Entertainment currency with no cash value' },
          ].map(item => (
            <div key={item.title} className="card p-5 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-arcade-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
