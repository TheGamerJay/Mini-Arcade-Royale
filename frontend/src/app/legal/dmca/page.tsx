import Link from 'next/link'

export const metadata = { title: 'DMCA Policy — Mini Arcade Royale' }

export default function DmcaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › DMCA
        </p>
        <h1 className="text-3xl font-black">DMCA Policy</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-6 text-sm text-arcade-text-muted leading-relaxed">

        <p>Mini Arcade Royale respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA) and applicable copyright laws.</p>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Reporting Infringement</h2>
          <p>If you believe content on Mini Arcade Royale infringes your copyright, please send a DMCA notice containing the following to our designated agent:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1.5">
            <li>A description of the copyrighted work you claim has been infringed.</li>
            <li>The URL or location of the allegedly infringing material.</li>
            <li>Your contact information (name, address, phone number, email).</li>
            <li>A statement that you have a good faith belief that the use is not authorised.</li>
            <li>A statement, under penalty of perjury, that the information is accurate and you are authorised to act on behalf of the copyright owner.</li>
            <li>Your physical or electronic signature.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Designated Agent</h2>
          <p>Submit DMCA notices via our <Link href="/support/contact" className="text-arcade-primary hover:underline">Contact Page</Link> with the subject line &quot;DMCA Notice&quot;.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Counter-Notices</h2>
          <p>If you believe material was removed incorrectly, you may submit a counter-notice via our Contact Page with subject line &quot;DMCA Counter-Notice&quot;. Your counter-notice must include the information required by 17 U.S.C. § 512(g)(3).</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Repeat Infringers</h2>
          <p>We will terminate accounts of users who are determined to be repeat infringers in appropriate circumstances.</p>
        </section>

      </div>
    </div>
  )
}
