import Link from 'next/link'

export const metadata = { title: 'Game Rules — Mini Arcade Royale' }

export default function GameRulesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs text-arcade-text-muted mb-2">
          <Link href="/legal/terms" className="hover:text-arcade-primary">Terms</Link> › Game Rules
        </p>
        <h1 className="text-3xl font-black">Game Rules</h1>
        <p className="text-arcade-text-muted mt-2 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-8 text-sm text-arcade-text-muted leading-relaxed">

        <p>All games on Mini Arcade Royale use server-side random number generation. Outcomes are determined before animation begins; the frontend only reveals a pre-decided result. This ensures fairness and prevents manipulation.</p>

        {[
          {
            name: '🎴 Scratch Royale',
            bet: '1–50 Mini Credits',
            rules: [
              'Choose your bet amount and click Scratch.',
              'The server decides a multiplier (0×, 1×, 2×, 3×, 5×, 10×, or 25×) before the card is revealed.',
              'Scratch the card to reveal three matching symbols — if they match, you win the multiplier.',
              'Payout = bet × multiplier. A 0× result returns nothing.',
            ],
          },
          {
            name: '🎡 Royale Spin',
            bet: '1–100 Mini Credits',
            rules: [
              'Choose your bet amount and click Spin.',
              'The server selects a wheel segment before the wheel starts spinning.',
              'The wheel animates to land on the pre-selected segment.',
              'Multipliers: 0×, 0.5×, 1×, 1.5×, 2×, 3×, 5×, 10×.',
              'Payout = bet × multiplier.',
            ],
          },
          {
            name: '🔮 Mystery Vault',
            bet: '5–200 Mini Credits',
            rules: [
              'Choose your bet amount and click Open Vault.',
              'The server assigns a rarity tier: Common, Uncommon, Rare, Epic, or Legendary.',
              'The vault opens with an animation revealing your reward tier.',
              'Multipliers range from 0.5× (Common) to 15× (Legendary).',
              'Payout = bet × multiplier.',
            ],
          },
        ].map(game => (
          <section key={game.name} className="card p-5">
            <h2 className="text-base font-bold text-arcade-text mb-3">{game.name}</h2>
            <p className="text-xs mb-3"><span className="text-arcade-text-muted">Bet range: </span><strong className="text-arcade-text">{game.bet}</strong></p>
            <ol className="list-decimal list-inside space-y-1.5">
              {game.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </section>
        ))}

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Fairness</h2>
          <p>All outcomes use cryptographically-seeded pseudo-random number generation. The house edge is built into the probability weights of each outcome tier. No game can be predicted or manipulated.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-arcade-text mb-2">Responsible Play</h2>
          <p>Games are for entertainment only. Mini Credits have no real-money value. If you feel you are playing compulsively, please take a break. You can delete your account at any time from <Link href="/account/delete" className="text-arcade-primary hover:underline">Account Settings</Link>.</p>
        </section>

      </div>
    </div>
  )
}
