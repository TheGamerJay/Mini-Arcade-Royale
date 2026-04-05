import Link from 'next/link'

export const metadata = { title: 'Cookie Policy — Mini Arcade Royale' }

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › Cookie Policy
        </p>
        <h1 className="text-3xl font-black">Cookie Policy</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-6 text-sm text-arcade-text-muted leading-relaxed">

        <p>Mini Arcade Royale uses minimal cookies and local storage. This policy explains what we store and why.</p>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">What We Store</h2>
          <div className="space-y-3">
            {[
              { name: 'access_token', storage: 'localStorage', purpose: 'Your JWT authentication token. Keeps you logged in between sessions. Expires after 24 hours.', required: true },
              { name: 'user', storage: 'localStorage', purpose: 'Cached user profile data (username, display name) to avoid refetching on every page load.', required: true },
            ].map(item => (
              <div key={item.name} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <code className="text-xs font-mono text-arcade-primary">{item.name}</code>
                  <div className="flex gap-2">
                    <span className="badge badge-muted text-xs">{item.storage}</span>
                    {item.required && <span className="badge badge-success text-xs">Required</span>}
                  </div>
                </div>
                <p className="text-xs">{item.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Third-Party Services</h2>
          <p>We use <strong className="text-arcade-text">Stripe</strong> for payment processing. Stripe may set cookies on the payment checkout page to prevent fraud. See <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-arcade-primary hover:underline">Stripe&apos;s Cookie Policy</a> for details.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Analytics</h2>
          <p>We do not currently use third-party analytics cookies (e.g., Google Analytics). Any future use of analytics will be disclosed here and, where required, will require your consent.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">How to Clear Stored Data</h2>
          <p>You can clear your browser&apos;s localStorage at any time via your browser settings or developer tools. Doing so will log you out of the platform. You can also log out explicitly using the logout button, which clears all stored tokens.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Contact</h2>
          <p>Questions about our use of cookies? <Link href="/support/contact" className="text-arcade-primary hover:underline">Contact us</Link>.</p>
        </section>

      </div>
    </div>
  )
}
