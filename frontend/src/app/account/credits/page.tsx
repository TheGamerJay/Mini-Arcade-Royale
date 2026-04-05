'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiGet, formatCredits, formatDateTime } from '@/lib/api'

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  description: string | null
  balance_after: number
  created_at: string
  status: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PURCHASE:             { label: 'Purchase',        color: 'text-arcade-success', icon: '💳' },
  GAME_SPEND:           { label: 'Game Play',        color: 'text-arcade-error',   icon: '🎮' },
  GAME_REWARD:          { label: 'Game Win',         color: 'text-arcade-success', icon: '🏆' },
  DAILY_BONUS:          { label: 'Daily Bonus',      color: 'text-arcade-primary', icon: '🎁' },
  MISSION_REWARD:       { label: 'Mission',          color: 'text-arcade-primary', icon: '🎯' },
  PROMO_REWARD:         { label: 'Promo',            color: 'text-arcade-accent',  icon: '🎉' },
  ADMIN_ADJUSTMENT_ADD: { label: 'Admin Credit',     color: 'text-arcade-warning', icon: '⚡' },
  ADMIN_ADJUSTMENT_SUBTRACT: { label: 'Admin Debit', color: 'text-arcade-error',  icon: '⚡' },
}

export default function CreditsPage() {
  const { credits, refreshCredits } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshCredits()
    apiGet<{ transactions: Transaction[] }>('/api/v1/wallet/transactions?limit=10')
      .then(d => setTransactions(d.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshCredits])

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Credits</h1>
        <p className="page-subtitle">Your virtual credit balance and recent activity.</p>
      </div>

      {/* Balance card */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.08), rgba(123,47,190,0.08))', borderColor: 'rgba(0,194,255,0.25)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-arcade-text-muted mb-1">Current Balance</p>
            <p className="text-4xl font-black text-gradient">{formatCredits(credits)}</p>
            <p className="text-xs text-arcade-text-muted mt-1">virtual entertainment credits · no cash value</p>
          </div>
          <Link href="/store" className="btn-primary">Buy Credits</Link>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-arcade-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link href="/account/credits/history" className="text-xs text-arcade-primary hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state py-10">
            <div className="empty-state-icon">💎</div>
            <p className="empty-state-title">No transactions yet</p>
            <p className="empty-state-desc">Buy credits or play games to see history here.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Type</th><th>Description</th><th className="text-right">Amount</th><th className="text-right hidden sm:table-cell">Balance</th><th className="hidden md:table-cell">Date</th></tr></thead>
            <tbody>
              {transactions.map(tx => {
                const cfg = TYPE_CONFIG[tx.transaction_type] || { label: tx.transaction_type, color: 'text-arcade-text-muted', icon: '•' }
                return (
                  <tr key={tx.id}>
                    <td><span className="flex items-center gap-1.5 text-xs"><span>{cfg.icon}</span><span>{cfg.label}</span></span></td>
                    <td className="text-xs text-arcade-text-muted max-w-[160px] truncate">{tx.description || '—'}</td>
                    <td className={`text-right font-semibold text-sm ${cfg.color}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                    <td className="text-right text-xs text-arcade-text-muted hidden sm:table-cell">{tx.balance_after.toLocaleString()}</td>
                    <td className="text-xs text-arcade-text-muted hidden md:table-cell">{formatDateTime(tx.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
