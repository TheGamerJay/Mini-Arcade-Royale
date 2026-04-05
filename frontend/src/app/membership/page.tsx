import Link from 'next/link'

export const metadata = { title: 'Membership — Mini Arcade Royale' }

const TIERS = [
  {
    name: 'Free',
    icon: '🆓',
    price: 'Free',
    highlight: false,
    features: [
      '30 Mini Credits on signup',
      'Access to all 3 games',
      'Daily missions',
      'Leaderboard participation',
    ],
    cta: 'Get Started',
    href: '/auth/register',
  },
  {
    name: 'Royale',
    icon: '👑',
    price: 'Coming Soon',
    highlight: true,
    features: [
      'Everything in Free',
      'Daily bonus Mini Credits',
      'Exclusive Royale missions',
      'Priority support',
      'Royale badge on profile',
    ],
    cta: 'Notify Me',
    href: '/support/contact',
  },
]

export default function MembershipPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="text-4xl">👑</div>
        <h1 className="text-3xl font-black">Membership</h1>
        <p className="text-arcade-text-muted">Mini Arcade Royale is free to play. A Royale membership is coming soon.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {TIERS.map(tier => (
          <div
            key={tier.name}
            className={`card p-7 flex flex-col gap-5 ${tier.highlight ? 'border-arcade-primary/50' : ''}`}
            style={tier.highlight ? { background: 'linear-gradient(135deg, rgba(0,194,255,0.07), rgba(123,47,190,0.07))' } : {}}
          >
            <div>
              <div className="text-3xl mb-2">{tier.icon}</div>
              <h2 className="text-xl font-black">{tier.name}</h2>
              <p className={`text-sm mt-1 font-semibold ${tier.highlight ? 'text-arcade-primary' : 'text-arcade-text-muted'}`}>
                {tier.price}
              </p>
            </div>

            <ul className="flex-1 space-y-2">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-arcade-success mt-0.5">✓</span>
                  <span className="text-arcade-text-muted">{f}</span>
                </li>
              ))}
            </ul>

            <Link href={tier.href} className={tier.highlight ? 'btn-primary text-center' : 'btn-outline text-center'}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-xs text-arcade-text-muted text-center">
        All features use virtual Mini Credits only · no real money involved ·{' '}
        <Link href="/legal/credits-policy" className="text-arcade-primary hover:underline">Credits Policy</Link>
      </p>
    </div>
  )
}
