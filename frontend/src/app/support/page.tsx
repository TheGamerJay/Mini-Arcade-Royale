import Link from 'next/link'

export const metadata = { title: 'Support — Mini Arcade Royale' }

const TOPICS = [
  {
    icon: '💳',
    title: 'Purchase & Billing',
    desc: 'Missing credits, payment issues, receipts',
    href: '/support/purchases',
  },
  {
    icon: '🔒',
    title: 'Account & Security',
    desc: 'Password, login issues, compromised account',
    href: '/support/security',
  },
  {
    icon: '🎮',
    title: 'Game Issues',
    desc: 'Game bugs, incorrect outcomes, Mini Credit disputes',
    href: '/support/contact',
  },
  {
    icon: '✉️',
    title: 'Contact Us',
    desc: 'General enquiries and everything else',
    href: '/support/contact',
  },
]

const FAQS = [
  {
    q: 'How do I get free Mini Credits?',
    a: 'Every new account receives 30 free Mini Credits on signup. You can also earn more through daily missions, login bonuses, and promotional events.',
  },
  {
    q: 'Can I cash out my Mini Credits?',
    a: 'No. Mini Credits are virtual entertainment tokens with no monetary value and cannot be exchanged for real money or prizes.',
  },
  {
    q: 'I bought credits but they haven\'t appeared.',
    a: 'Credits appear immediately after a successful payment. If yours are missing after 5 minutes, visit our Purchase Support page with your payment receipt.',
  },
  {
    q: 'How do I change my username?',
    a: 'Go to Account → Profile and update your username there. Usernames must be unique.',
  },
  {
    q: 'My account is locked — what do I do?',
    a: 'Contact our security team via the Account & Security support page. We\'ll verify your identity and help restore access.',
  },
]

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

      <div className="text-center space-y-3">
        <div className="text-4xl">🛟</div>
        <h1 className="text-3xl font-black">Support Centre</h1>
        <p className="text-arcade-text-muted">How can we help you today?</p>
      </div>

      {/* Topics */}
      <div className="grid sm:grid-cols-2 gap-4">
        {TOPICS.map(t => (
          <Link key={t.href + t.title} href={t.href} className="card card-hover p-5 flex items-start gap-4">
            <span className="text-2xl mt-0.5">{t.icon}</span>
            <div>
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs text-arcade-text-muted mt-0.5">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map(faq => (
            <div key={faq.q} className="card p-5">
              <p className="font-semibold text-sm mb-1.5">{faq.q}</p>
              <p className="text-xs text-arcade-text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-arcade-text-muted">
        Still need help?{' '}
        <Link href="/support/contact" className="text-arcade-primary hover:underline">Contact our team →</Link>
      </div>

    </div>
  )
}
