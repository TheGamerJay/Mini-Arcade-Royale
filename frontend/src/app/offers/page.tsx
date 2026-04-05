import Link from 'next/link'

export const metadata = { title: 'Offers — Mini Arcade Royale' }

const OFFERS = [
  {
    id: 'welcome',
    icon: '🎁',
    badge: 'New Players',
    title: 'Welcome Bonus',
    desc: '30 free Mini Credits on sign-up — no purchase needed.',
    cta: 'Claim on Registration',
    href: '/auth/register',
    highlight: true,
  },
  {
    id: 'daily',
    icon: '📅',
    badge: 'Daily',
    title: 'Daily Login Bonus',
    desc: 'Log in every day to claim your daily Mini Credit bonus. Streaks give bigger rewards.',
    cta: 'Go to Dashboard',
    href: '/dashboard',
    highlight: false,
  },
  {
    id: 'missions',
    icon: '🎯',
    badge: 'Missions',
    title: 'Mission Rewards',
    desc: 'Complete daily and weekly missions for free Mini Credits. No purchase required.',
    cta: 'View Missions',
    href: '/missions',
    highlight: false,
  },
]

export default function OffersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="text-4xl">🎉</div>
        <h1 className="text-3xl font-black">Offers & Bonuses</h1>
        <p className="text-arcade-text-muted text-sm">Ways to earn free Mini Credits.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {OFFERS.map(offer => (
          <div
            key={offer.id}
            className={`card p-6 flex flex-col gap-3 ${offer.highlight ? 'border-arcade-primary/40' : ''}`}
            style={offer.highlight ? { background: 'linear-gradient(135deg, rgba(0,194,255,0.07), rgba(123,47,190,0.07))' } : {}}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{offer.icon}</span>
              <span className="badge badge-muted text-xs">{offer.badge}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">{offer.title}</h3>
              <p className="text-xs text-arcade-text-muted leading-relaxed">{offer.desc}</p>
            </div>
            <Link href={offer.href} className={offer.highlight ? 'btn-primary text-center text-xs' : 'btn-outline text-center text-xs'}>
              {offer.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-2">Want more Mini Credits?</h2>
        <p className="text-sm text-arcade-text-muted mb-4">Our credit packages give you the best value for entertainment.</p>
        <Link href="/store" className="btn-primary">Visit the Store</Link>
      </div>

      <p className="text-xs text-arcade-text-muted text-center">
        Mini Credits are virtual entertainment tokens only · no cash value ·{' '}
        <Link href="/legal/credits-policy" className="text-arcade-primary hover:underline">Credits Policy</Link>
      </p>
    </div>
  )
}
