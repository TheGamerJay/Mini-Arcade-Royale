'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiGet, formatDateTime } from '@/lib/api'

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  description: string | null
  balance_after: number
  created_at: string
  status: string
}

interface HistoryResponse {
  transactions: Transaction[]
  total: number
  page: number
  pages: number
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PURCHASE:                  { label: 'Purchase',        color: 'text-arcade-success', icon: '💳' },
  GAME_SPEND:                { label: 'Game Play',        color: 'text-arcade-error',   icon: '🎮' },
  GAME_REWARD:               { label: 'Game Win',         color: 'text-arcade-success', icon: '🏆' },
  DAILY_BONUS:               { label: 'Daily Bonus',      color: 'text-arcade-primary', icon: '🎁' },
  MISSION_REWARD:            { label: 'Mission',          color: 'text-arcade-primary', icon: '🎯' },
  PROMO_REWARD:              { label: 'Promo',            color: 'text-arcade-accent',  icon: '🎉' },
  ADMIN_ADJUSTMENT_ADD:      { label: 'Admin Credit',     color: 'text-arcade-warning', icon: '⚡' },
  ADMIN_ADJUSTMENT_SUBTRACT: { label: 'Admin Debit',      color: 'text-arcade-error',   icon: '⚡' },
}

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PURCHASE', label: 'Purchases' },
  { value: 'GAME_SPEND', label: 'Game Plays' },
  { value: 'GAME_REWARD', label: 'Game Wins' },
  { value: 'DAILY_BONUS', label: 'Bonuses' },
  { value: 'MISSION_REWARD', label: 'Missions' },
]

const PAGE_SIZE = 25

export default function CreditHistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) })
      if (typeFilter) params.set('type', typeFilter)
      const d = await apiGet<HistoryResponse>(`/api/v1/wallet/transactions?${params}`)
      setData(d)
    } catch {
      setData({ transactions: [], total: 0, page: 1, pages: 1 })
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => { load() }, [load])

  const transactions = data?.transactions || []
  const totalPages = data?.pages || 1

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-xs text-arcade-text-muted mb-1">
            <Link href="/account/credits" className="hover:text-arcade-primary">Credits</Link>
            <span>›</span>
            <span>Full History</span>
          </div>
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">All credit transactions on your account.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setTypeFilter(f.value); setPage(1) }}
            className={`tab ${typeFilter === f.value ? 'tab-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-state-icon">💎</div>
            <p className="empty-state-title">No transactions found</p>
            <p className="empty-state-desc">
              {typeFilter ? 'Try a different filter.' : 'Buy credits or play games to see history here.'}
            </p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th className="hidden sm:table-cell">Description</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right hidden sm:table-cell">Balance</th>
                  <th className="hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const cfg = TYPE_CONFIG[tx.transaction_type] || { label: tx.transaction_type, color: 'text-arcade-text-muted', icon: '•' }
                  return (
                    <tr key={tx.id}>
                      <td>
                        <span className="flex items-center gap-1.5 text-xs">
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="text-xs text-arcade-text-muted max-w-[200px] truncate hidden sm:table-cell">
                        {tx.description || '—'}
                      </td>
                      <td className={`text-right font-semibold text-sm ${cfg.color}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                      <td className="text-right text-xs text-arcade-text-muted hidden sm:table-cell">
                        {tx.balance_after.toLocaleString()}
                      </td>
                      <td className="text-xs text-arcade-text-muted hidden md:table-cell">
                        {formatDateTime(tx.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-arcade-border flex items-center justify-between">
                <p className="text-xs text-arcade-text-muted">
                  Page {page} of {totalPages} · {data?.total.toLocaleString()} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
