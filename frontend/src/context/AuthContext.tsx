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
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  const refreshCredits = useCallback(async () => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!t) return
    try {
      const res = await fetch(`${API_BASE}/api/v1/wallet/balance`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCredits(data.balance ?? 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (token) refreshCredits()
  }, [token, refreshCredits])

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('access_token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setCredits(0)
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{
      user, token, credits, loading, login, logout, refreshCredits,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
