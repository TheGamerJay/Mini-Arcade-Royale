'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete, formatDateTime } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Session {
  id: string
  device: string
  ip_address: string
  created_at: string
  last_active: string
  is_current: boolean
}

export default function SessionsPage() {
  const { logout } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [logoutAllLoading, setLogoutAllLoading] = useState(false)

  useEffect(() => {
    apiGet<{ sessions: Session[] }>('/api/v1/account/sessions')
      .then(d => setSessions(d.sessions || []))
      .catch(() => setSessions([{
        id: 'current',
        device: 'Current Browser',
        ip_address: '—',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_current: true,
      }]))
      .finally(() => setLoading(false))
  }, [])

  const revokeSession = async (id: string) => {
    setRevoking(id)
    try {
      await apiDelete(`/api/v1/account/sessions/${id}`)
      setSessions(s => s.filter(x => x.id !== id))
    } catch {}
    setRevoking(null)
  }

  const logoutAll = async () => {
    setLogoutAllLoading(true)
    try {
      await apiPost('/api/v1/auth/logout-all')
      logout()
    } catch {}
    setLogoutAllLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Active Sessions</h1>
        <p className="page-subtitle">Manage where you&apos;re logged in. Revoke sessions you don&apos;t recognize.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">🖥</div>
            <p className="empty-state-title">No sessions found</p>
          </div>
        ) : (
          <div className="divide-y divide-arcade-border">
            {sessions.map(session => (
              <div key={session.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💻</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{session.device}</p>
                      {session.is_current && <span className="badge-success text-xs">Current</span>}
                    </div>
                    <p className="text-xs text-arcade-text-muted">
                      {session.ip_address} · Last active {formatDateTime(session.last_active)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button onClick={() => revokeSession(session.id)}
                    disabled={revoking === session.id}
                    className="btn-danger btn-sm flex-shrink-0">
                    {revoking === session.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5 border-arcade-error/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Sign Out Everywhere</p>
            <p className="text-xs text-arcade-text-muted mt-0.5">Revoke all sessions including this one</p>
          </div>
          <button onClick={logoutAll} disabled={logoutAllLoading} className="btn-danger btn-sm flex-shrink-0">
            {logoutAllLoading ? 'Signing out...' : 'Sign Out All'}
          </button>
        </div>
      </div>
    </div>
  )
}
