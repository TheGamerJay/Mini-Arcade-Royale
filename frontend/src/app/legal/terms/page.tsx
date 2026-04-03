'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-slate-900/90 p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="mb-4 text-gray-300">
          Welcome to Mini Arcade Royale. By creating an account, you agree to our Terms of Service.
        </p>
        <p className="mb-4 text-gray-300">
          This page contains the basic legal agreement required for account creation and gameplay.
        </p>
        <p className="mb-4 text-gray-300">
          <strong>Note:</strong> These terms are part of the signup agreement and must be accepted before account creation.
        </p>
        <Link href="/auth/register" className="text-arcade-primary hover:underline">
          Back to signup
        </Link>
      </div>
    </div>
  )
}
