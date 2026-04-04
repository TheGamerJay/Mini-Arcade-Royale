'use client'

import { useState } from 'react'
import { apiPatch } from '@/lib/api'

const PREFS = [
  { key: 'email_game_results', label: 'Game Results', desc: 'Emails about wins and major game outcomes' },
  { key: 'email_purchases', label: 'Purchase Receipts', desc: 'Confirmation emails for credit purchases' },
  { key: 'email_promotions', label: 'Promotions & Offers', desc: 'Special deals, bonus credits, and limited-time offers' },
  { key: 'email_security', label: 'Security Alerts', desc: 'Suspicious login attempts and security events' },
  { key: 'email_policy_updates', label: 'Policy Updates', desc: 'When our Terms or Privacy Policy change' },
  { key: 'email_missions', label: 'Mission Reminders', desc: 'Reminders about incomplete daily and weekly missions' },
]

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email_game_results: false,
    email_purchases: true,
    email_promotions: true,
    email_security: true,
    email_policy_updates: true,
    email_missions: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await apiPatch('/api/v1/account/notifications', prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Choose what emails you receive from us.</p>
      </div>

      {saved && <div className="alert-success"><span>✓</span>Preferences saved.</div>}

      <div className="card divide-y divide-arcade-border">
        {PREFS.map(pref => (
          <div key={pref.key} className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{pref.label}</p>
              <p className="text-xs text-arcade-text-muted mt-0.5">{pref.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[pref.key]}
              onClick={() => toggle(pref.key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${prefs[pref.key] ? 'bg-arcade-primary' : 'bg-arcade-surface-3'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${prefs[pref.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}
