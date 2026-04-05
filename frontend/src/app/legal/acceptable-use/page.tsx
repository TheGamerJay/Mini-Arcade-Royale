import Link from 'next/link'

export const metadata = { title: 'Acceptable Use Policy — Mini Arcade Royale' }

export default function AcceptableUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › Acceptable Use
        </p>
        <h1 className="text-3xl font-black">Acceptable Use Policy</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-6 text-sm text-arcade-text-muted leading-relaxed">

        <p>By using Mini Arcade Royale, you agree to use the platform lawfully and in good faith. This policy describes behaviours that are prohibited.</p>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Prohibited Conduct</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-arcade-text">Account abuse:</strong> Creating multiple accounts to claim signup bonuses or circumvent suspensions.</li>
            <li><strong className="text-arcade-text">Automation:</strong> Using bots, scripts, or automated tools to interact with games or the API.</li>
            <li><strong className="text-arcade-text">Exploitation:</strong> Exploiting bugs or glitches to gain Mini Credits. You must report bugs to support immediately.</li>
            <li><strong className="text-arcade-text">Fraudulent payments:</strong> Chargebacks, stolen payment methods, or fraudulent credit card use.</li>
            <li><strong className="text-arcade-text">Harassment:</strong> Harassing other players, staff, or anyone associated with the platform.</li>
            <li><strong className="text-arcade-text">Illegal activity:</strong> Using the platform for money laundering, fraud, or any unlawful purpose.</li>
            <li><strong className="text-arcade-text">Reverse engineering:</strong> Attempting to decompile, reverse-engineer, or tamper with our software or servers.</li>
            <li><strong className="text-arcade-text">Impersonation:</strong> Pretending to be another user, staff member, or affiliate of the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Enforcement</h2>
          <p>Violations may result in account suspension, permanent bans, forfeiture of Mini Credit balances, and referral to law enforcement where applicable. We reserve the right to take action at our sole discretion.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Reporting Abuse</h2>
          <p>If you witness abuse or discover a bug, please report it via <Link href="/support/contact" className="text-arcade-primary hover:underline">Support</Link>. Responsible disclosure of security vulnerabilities is appreciated and may be rewarded.</p>
        </section>

      </div>
    </div>
  )
}
