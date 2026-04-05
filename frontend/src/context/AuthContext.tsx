'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://mini-arcade-royale-production.up.railway.app')
  .replace(/\/$/, '')
  .replace(/\/api\/v1$/, '')

export interface User {
  id: number
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  role?: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  credits: number
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshCredits: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  credits: 0,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshCredits: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
})

async function fetchFromAPI<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch fresh user data from Postgres — never trust stale localStorage cache
  const refreshUser = useCallback(async (t?: string) => {
    const tok = t ?? token
    if (!tok) return
    const fresh = await fetchFromAPI<User>('/api/v1/users/me', tok)
    if (fresh) {
      setUser(fresh)
    } else {
      // Token is invalid/expired — clear everything
      localStorage.removeItem('access_token')
      setToken(null)
      setUser(null)
      setCredits(0)
    }
  }, [token])

  // Fetch fresh credit balance from Postgres
  const refreshCredits = useCallback(async (t?: string) => {
    const tok = t ?? token
    if (!tok) return
    const data = await fetchFromAPI<{ balance: number }>('/api/v1/wallet/balance', tok)
    if (data) setCredits(data.balance ?? 0)
  }, [token])

  // On mount: validate stored token against backend, hydrate from Postgres
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    if (!storedToken) {
      setLoading(false)
      return
    }

    setToken(storedToken)

    // Validate token and load fresh data from Postgres in parallel
    Promise.all([
      fetchFromAPI<User>('/api/v1/users/me', storedToken),
      fetchFromAPI<{ balance: number }>('/api/v1/wallet/balance', storedToken),
    ]).then(([freshUser, wallet]) => {
      if (freshUser) {
        setUser(freshUser)
        setCredits(wallet?.balance ?? 0)
      } else {
        // Token expired or invalid — log out
        localStorage.removeItem('access_token')
        setToken(null)
      }
    }).finally(() => setLoading(false))
  }, [])

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('access_token', newToken)
    // Do NOT persist user to localStorage — always fetch from Postgres
    setToken(newToken)
    setUser(newUser)
    // Immediately sync credits from Postgres
    fetchFromAPI<{ balance: number }>('/api/v1/wallet/balance', newToken)
      .then(data => { if (data) setCredits(data.balance ?? 0) })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    setCredits(0)
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{
      user, token, credits, loading,
      login, logout, refreshCredits, refreshUser,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
