import Link from 'next/link'

export const metadata = { title: 'About — Mini Arcade Royale' }

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="text-5xl">🕹️</div>
        <h1 className="text-4xl font-black">About Mini Arcade Royale</h1>
        <p className="text-arcade-text-muted max-w-xl mx-auto">A premium social arcade platform built for entertainment. Play games, earn Mini Credits, climb the leaderboard.</p>
      </div>

      {/* What it is */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">What is Mini Arcade Royale?</h2>
          <p className="text-arcade-text-muted text-sm leading-relaxed">Mini Arcade Royale is a free-to-play social arcade platform. Every new account starts with <strong className="text-arcade-primary">30 free Mini Credits</strong>. Use them to play our growing library of games — scratch cards, spin wheels, mystery vaults, and more.</p>
          <p className="text-arcade-text-muted text-sm leading-relaxed">Mini Credits are virtual tokens for entertainment only. They have no cash value. We are a social gaming platform, not a gambling site.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🎴', label: 'Scratch Royale',  desc: 'Scratch cards with big multipliers' },
            { icon: '🎡', label: 'Royale Spin',     desc: 'Spin the wheel, win instantly' },
            { icon: '🔮', label: 'Mystery Vault',   desc: 'Open vaults for legendary rewards' },
            { icon: '🎯', label: 'Daily Missions',  desc: 'Complete quests for free credits' },
          ].map(g => (
            <div key={g.label} className="card p-4">
              <div className="text-2xl mb-2">{g.icon}</div>
              <p className="text-xs font-semibold text-arcade-text">{g.label}</p>
              <p className="text-xs text-arcade-text-muted mt-0.5">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🔒', title: 'Fair Play',          desc: 'All game outcomes are server-determined before animation. No manipulation. No tricks.' },
            { icon: '🎁', title: 'Accessible Fun',     desc: 'Every new player gets 30 free Mini Credits. No purchase required to start playing.' },
            { icon: '🛡️', title: 'Responsible Gaming', desc: 'Mini Credits are entertainment tokens only. We do not operate real-money gambling.' },
          ].map(v => (
            <div key={v.title} className="card p-6 text-left space-y-2">
              <div className="text-3xl">{v.icon}</div>
              <h3 className="font-bold">{v.title}</h3>
              <p className="text-xs text-arcade-text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card p-8 text-center space-y-4" style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.07), rgba(123,47,190,0.07))' }}>
        <h2 className="text-2xl font-bold">Ready to play?</h2>
        <p className="text-arcade-text-muted text-sm">Sign up free and claim your 30 Mini Credits.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/register" className="btn-primary">Create Free Account</Link>
          <Link href="/games" className="btn-outline">Browse Games</Link>
        </div>
      </div>

      {/* Links */}
      <div className="text-center text-xs text-arcade-text-muted space-x-4">
        <Link href="/legal/terms" className="hover:text-arcade-primary">Terms of Service</Link>
        <Link href="/legal/privacy" className="hover:text-arcade-primary">Privacy Policy</Link>
        <Link href="/legal/credits-policy" className="hover:text-arcade-primary">Credits Policy</Link>
        <Link href="/support/contact" className="hover:text-arcade-primary">Contact Us</Link>
      </div>

    </div>
  )
}
