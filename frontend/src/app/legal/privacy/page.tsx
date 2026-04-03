'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-slate-900/90 p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4 text-gray-300">
          Mini Arcade Royale respects your privacy and collects only the data needed to support your account and gameplay experience.
        </p>
        <p className="mb-4 text-gray-300">
          By accepting this policy, you consent to the collection and use of user data as described here.
        </p>
        <p className="mb-4 text-gray-300">
          Account creation requires agreeing to both Privacy Policy and Terms of Service.
        </p>
        <Link href="/auth/register" className="text-arcade-primary hover:underline">
          Back to signup
        </Link>
      </div>
    </div>
  )
}
