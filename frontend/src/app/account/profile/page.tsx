'use client'

import { FormEvent, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiPatch, apiFetch } from '@/lib/api'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4']
const MAX_SIZE_MB = 8   // stored as base64 data URL in Postgres — 8 MB keeps DB sane

export default function ProfilePage() {
  const { user, login, token } = useAuth()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Avatar state
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSuccess, setAvatarSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    setAvatarSuccess(false)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError('Unsupported file type. Use PNG, JPG, JPEG, GIF, WebP, or MP4.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`File too large. Max ${MAX_SIZE_MB} MB.`)
      return
    }

    setAvatarFile(file)
    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      // MP4 — show a video icon placeholder
      setAvatarPreview(null)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setAvatarUploading(true)
    setAvatarError('')
    setAvatarSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', avatarFile)
      const res = await apiFetch('/api/v1/users/me/avatar', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser sets it with boundary for multipart
        headers: {},
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(d.detail || 'Upload failed')
      }
      const data = await res.json()
      // Update AuthContext user with new avatar_url
      if (user && token) {
        login(token, { ...user, avatar_url: data.avatar_url })
      }
      setAvatarSuccess(true)
      setAvatarFile(null)
      setTimeout(() => setAvatarSuccess(false), 3000)
    } catch (err: any) {
      setAvatarError(err.message || 'Upload failed')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const updated = await apiPatch<typeof user>('/api/v1/users/me', form)
      if (updated && token) {
        login(token, updated as NonNullable<typeof user>)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">Update your display name, username, and avatar.</p>
      </div>

      {/* Avatar section */}
      <div className="card p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Profile Avatar</h2>

        {avatarError && <div className="alert-error mb-4"><span>⚠</span>{avatarError}</div>}
        {avatarSuccess && <div className="alert-success mb-4"><span>✓</span>Avatar updated successfully.</div>}

        <div className="flex items-center gap-5 mb-4">
          {/* Avatar preview */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-arcade-surface-3 border border-arcade-border flex items-center justify-center flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : avatarFile?.type === 'video/mp4' ? (
              <span className="text-3xl">🎬</span>
            ) : (
              <span className="text-3xl">
                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '👤'}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-arcade-text-muted mb-2">
              PNG · JPG · JPEG · GIF · WebP · MP4 &nbsp;·&nbsp; max 8 MB
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-outline text-xs px-3 py-1.5"
              >
                Choose File
              </button>
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
                </button>
              )}
            </div>
            {avatarFile && (
              <p className="text-xs text-arcade-text-muted mt-1.5 truncate">{avatarFile.name}</p>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,video/mp4"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Profile info section */}
      <div className="card p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Profile Info</h2>

        {success && <div className="alert-success mb-5"><span>✓</span>Profile updated successfully.</div>}
        {error && <div className="alert-error mb-5"><span>⚠</span>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="input-group">
            <label className="label">Display Name</label>
            <input
              type="text"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="input"
              placeholder="How others see you"
              maxLength={100}
            />
            <p className="text-xs text-arcade-text-muted mt-1">Leave blank to show your username</p>
          </div>

          <div className="input-group">
            <label className="label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="input"
              placeholder="username"
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input opacity-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-arcade-text-muted mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
