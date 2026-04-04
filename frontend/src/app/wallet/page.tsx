'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WalletRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/account/credits') }, [router])
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-arcade-text-muted text-sm">Redirecting...</div>
    </div>
  )
}
