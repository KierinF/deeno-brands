'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/client-login')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F7F4EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              letterSpacing: '3px',
              color: '#E8A020',
            }}
          >
            DEENO
          </span>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '1.5px',
              color: '#8C8070',
              marginTop: 8,
            }}
          >
            SET YOUR PASSWORD
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '1.5px',
                color: '#8C8070',
                display: 'block',
                marginBottom: 6,
              }}
            >
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 8 characters"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#FFFFFF',
                border: '1px solid #C8C1B3',
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                color: '#1C2B2B',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '1.5px',
                color: '#8C8070',
                display: 'block',
                marginBottom: 6,
              }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Repeat password"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#FFFFFF',
                border: '1px solid #C8C1B3',
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                color: '#1C2B2B',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#C0392B',
                marginBottom: 16,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#C8C1B3' : '#E8A020',
              color: '#F7F4EE',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: '2px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'SAVING...' : 'SET PASSWORD →'}
          </button>
        </form>
      </div>
    </main>
  )
}
