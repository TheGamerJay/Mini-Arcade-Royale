import Link from 'next/link'

export const metadata = { title: 'Refund Policy — Mini Arcade Royale' }

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › Refund Policy
        </p>
        <h1 className="text-3xl font-black">Refund Policy</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-6 text-sm text-arcade-text-muted leading-relaxed">

        <div className="card p-4 border-arcade-warning/30">
          <p className="text-arcade-warning font-semibold text-xs">⚠ All purchases of Mini Credits are generally final and non-refundable.</p>
        </div>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">General Policy</h2>
          <p>Mini Credits purchased on Mini Arcade Royale are virtual goods delivered instantly upon purchase. Because virtual items are consumed digitally and cannot be returned, all sales are final unless otherwise required by the laws of your jurisdiction.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Exceptions — When We Do Refund</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>A technical error on our end prevented Mini Credits from being credited to your account after a successful payment</li>
            <li>You were charged twice for the same purchase</li>
            <li>You are entitled to a refund under applicable consumer protection law in your region (e.g., EU 14-day cooling-off period where applicable)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">How to Request a Refund</h2>
          <p>To request a refund, contact our support team within <strong className="text-arcade-text">14 days</strong> of the purchase date via the <Link href="/support/purchases" className="text-arcade-primary hover:underline">Purchase Support</Link> page. Include your username, the date of purchase, and a description of the issue. We aim to respond within 3 business days.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">No Refunds For</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Mini Credits already spent on games</li>
            <li>Dissatisfaction with game outcomes (outcomes are random by design)</li>
            <li>Account suspensions due to policy violations</li>
            <li>Credits lost due to account deletion initiated by the user</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Chargebacks</h2>
          <p>If you file a chargeback with your bank or payment provider without first contacting us, your account may be suspended pending investigation. We encourage you to reach out to support first — most issues can be resolved quickly.</p>
        </section>

      </div>
    </div>
  )
}
