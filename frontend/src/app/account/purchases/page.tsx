'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet, formatDateTime } from '@/lib/api'

interface Purchase {
  id: number
  credits_amount: number
  price_usd: number
  status: string
  stripe_payment_intent_id: string | null
  created_at: string
  description: string | null
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  completed:  { label: 'Completed',  class: 'badge-success' },
  pending:    { label: 'Pending',    class: 'badge-muted' },
  failed:     { label: 'Failed',     class: 'badge-error' },
  refunded:   { label: 'Refunded',   class: 'badge-muted' },
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ purchases: Purchase[] }>('/api/v1/wallet/purchases')
      .then(d => setPurchases(d.purchases || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalSpent = purchases.filter(p => p.status === 'completed').reduce((s, p) => s + p.price_usd, 0)
  const totalCredits = purchases.filter(p => p.status === 'completed').reduce((s, p) => s + p.credits_amount, 0)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Purchase History</h1>
        <p className="page-subtitle">Your credit purchase receipts.</p>
      </div>

      {!loading && purchases.length > 0 && (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="card p-4 text-center">
            <p className="text-xs text-arcade-text-muted mb-1">Total Purchases</p>
            <p className="text-lg font-bold">{purchases.length}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-arcade-text-muted mb-1">Credits Purchased</p>
            <p className="text-lg font-bold text-arcade-primary">{totalCredits.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state py-14">
            <div className="empty-state-icon">💳</div>
            <p className="empty-state-title">No purchases yet</p>
            <p className="empty-state-desc">
              <Link href="/store" className="text-arcade-primary hover:underline">Visit the store</Link> to buy credits.
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Package</th>
                <th className="text-right">Credits</th>
                <th className="text-right hidden sm:table-cell">Price</th>
                <th className="hidden sm:table-cell">Status</th>
                <th className="hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => {
                const st = STATUS_CONFIG[p.status] || { label: p.status, class: 'badge-muted' }
                return (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{p.description || 'Credit Package'}</p>
                        {p.stripe_payment_intent_id && (
                          <p className="text-xs text-arcade-text-muted font-mono mt-0.5">
                            {p.stripe_payment_intent_id.slice(0, 20)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right font-semibold text-sm text-arcade-success">
                      +{p.credits_amount.toLocaleString()}
                    </td>
                    <td className="text-right text-sm hidden sm:table-cell">
                      ${p.price_usd.toFixed(2)}
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className={`badge text-xs ${st.class}`}>{st.label}</span>
                    </td>
                    <td className="text-xs text-arcade-text-muted hidden md:table-cell">
                      {formatDateTime(p.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-arcade-text-muted">
        All purchases are for virtual entertainment credits only · no cash value ·{' '}
        <Link href="/legal/refund-policy" className="text-arcade-primary hover:underline">Refund Policy</Link>
      </p>
    </div>
  )
}
