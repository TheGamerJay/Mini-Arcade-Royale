import Link from 'next/link'

export const metadata = { title: 'Mini Credits Policy — Mini Arcade Royale' }

export default function CreditsPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › Credits Policy
        </p>
        <h1 className="text-3xl font-black">Mini Credits Policy</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="prose-arcade space-y-6 text-sm text-arcade-text-muted leading-relaxed">

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">What are Mini Credits?</h2>
          <p>Mini Credits are virtual entertainment tokens used exclusively within the Mini Arcade Royale platform. They have no monetary value, cannot be exchanged for real currency, goods, or services outside the platform, and are not redeemable for cash under any circumstances.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Welcome Bonus</h2>
          <p>All new accounts receive <strong className="text-arcade-primary">30 free Mini Credits</strong> upon registration. This bonus is a one-time gift per account and cannot be transferred.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Purchasing Mini Credits</h2>
          <p>Mini Credits may be purchased through our Store using supported payment methods. All purchases are final and non-refundable except where required by law. See our <Link href="/legal/refund-policy" className="text-arcade-primary hover:underline">Refund Policy</Link> for details.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Using Mini Credits</h2>
          <p>Mini Credits may only be used to play games on the Mini Arcade Royale platform. Game outcomes are determined by server-side random number generation. No skill, strategy, or outside system affects outcomes.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Expiration</h2>
          <p>Mini Credits do not expire while your account is active. If your account is suspended or deleted, all Mini Credit balances are forfeited without refund.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Earning Mini Credits</h2>
          <p>You may earn Mini Credits through game payouts, daily login bonuses, mission rewards, and promotional events. These earned credits carry the same restrictions as purchased credits.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">No Real-Money Gambling</h2>
          <p>Mini Arcade Royale is a social entertainment platform. Mini Credits are not real money. Games played with Mini Credits do not constitute gambling under applicable law. No real prizes are awarded.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Questions</h2>
          <p>For questions about your Mini Credits balance or transactions, contact us at <Link href="/support/contact" className="text-arcade-primary hover:underline">Support</Link>.</p>
        </section>

      </div>
    </div>
  )
}
