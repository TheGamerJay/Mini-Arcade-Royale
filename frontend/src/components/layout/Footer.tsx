import Link from 'next/link'

const legalLinks = [
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/credits-policy', label: 'Credits Policy' },
  { href: '/legal/refund-policy', label: 'Refund Policy' },
  { href: '/legal/game-rules', label: 'Game Rules' },
  { href: '/legal/acceptable-use', label: 'Acceptable Use' },
  { href: '/legal/cookie-policy', label: 'Cookie Policy' },
]

const supportLinks = [
  { href: '/support', label: 'Help Center' },
  { href: '/support/contact', label: 'Contact Us' },
  { href: '/about', label: 'About' },
]

const platformLinks = [
  { href: '/games', label: 'Games' },
  { href: '/store', label: 'Store' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/missions', label: 'Missions' },
]

export default function Footer() {
  return (
    <footer className="border-t border-arcade-border mt-auto">
      <div className="container-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg, #00C2FF, #7B2FBE)' }}>
                🕹
              </div>
              <span className="font-bold text-base text-gradient">Mini Arcade Royale</span>
            </div>
            <p className="text-xs text-arcade-text-muted leading-relaxed max-w-xs">
              Premium digital arcade entertainment. Virtual credits only — no real-money gambling.
              Play for fun, compete for glory.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-arcade-text">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-arcade-text-muted hover:text-arcade-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-arcade-text">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-arcade-text-muted hover:text-arcade-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-arcade-text">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-arcade-text-muted hover:text-arcade-text transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-arcade-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-arcade-text-muted">
            &copy; {new Date().getFullYear()} Mini Arcade Royale. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-arcade-text-muted px-2 py-1 rounded-full bg-arcade-surface-2 border border-arcade-border">
              18+ Entertainment Only
            </span>
            <span className="text-xs text-arcade-text-muted px-2 py-1 rounded-full bg-arcade-surface-2 border border-arcade-border">
              Virtual Credits — No Cash Value
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
