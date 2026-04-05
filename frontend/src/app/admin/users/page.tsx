'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { apiGet, formatDateTime } from '@/lib/api'

interface AdminUser {
  id: number
  email: string
  username: string
  display_name: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  balance?: number
}

export default function AdminUsersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 25

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
      })
      if (search) params.set('q', search)
      const d = await apiGet<{ users: AdminUser[]; total: number }>(`/api/v1/admin/users?${params}`)
      setUsers(d.users || [])
      setTotal(d.total || 0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return }
    if (!authLoading && isAuthenticated) load()
  }, [authLoading, isAuthenticated, router, load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-xs text-arcade-text-muted hover:text-arcade-primary">← Admin</Link>
        <h1 className="text-xl font-bold">User Management</h1>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="Search by username or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <button onClick={load} className="btn-outline">Search</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">No users found</p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th className="hidden sm:table-cell">Email</th>
                  <th className="hidden md:table-cell">Status</th>
                  <th className="hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-xs text-arcade-text-muted font-mono">#{u.id}</td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{u.username}</p>
                        {u.display_name && <p className="text-xs text-arcade-text-muted">{u.display_name}</p>}
                      </div>
                    </td>
                    <td className="text-xs text-arcade-text-muted hidden sm:table-cell">{u.email}</td>
                    <td className="hidden md:table-cell">
                      <div className="flex gap-1.5">
                        <span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-error'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                        {u.is_verified && <span className="badge badge-muted text-xs">Verified</span>}
                      </div>
                    </td>
                    <td className="text-xs text-arcade-text-muted hidden lg:table-cell">
                      {formatDateTime(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-arcade-border flex items-center justify-between">
                <p className="text-xs text-arcade-text-muted">Page {page} of {totalPages} · {total.toLocaleString()} users</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
