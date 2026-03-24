'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    // Check role and route accordingly
    const userId = authData.user?.id
    if (userId) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()
      const role = roleRow?.role
      if (role === 'internal' || role === 'admin') {
        router.push('/outreach')
        return
      }
    }

    router.push('/dashboard')
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
          <a href="/" style={{ textDecoration: 'none' }}>
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
          </a>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '1.5px',
              color: '#8C8070',
              marginTop: 8,
            }}
          >
            CLIENT PORTAL
          </p>
        </div>

        <form onSubmit={handleLogin}>
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
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
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
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {loading ? 'SIGNING IN...' : 'SIGN IN →'}
          </button>
        </form>

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: '#8C8070',
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          Access is by invitation only.
        </p>
      </div>
    </main>
  )
}
