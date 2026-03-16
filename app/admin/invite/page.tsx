'use client'

import { useState } from 'react'

export default function AdminInvitePage() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-invite-secret': secret,
      },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setStatus({ ok: true, message: `Invite sent to ${data.user}` })
      setEmail('')
    } else {
      setStatus({ ok: false, message: data.error })
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
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              letterSpacing: '3px',
              color: '#E8A020',
            }}
          >
            DEENO
          </span>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1.5px',
              color: '#8C8070',
              marginTop: 6,
            }}
          >
            INVITE CLIENT
          </p>
        </div>

        <form onSubmit={handleInvite}>
          <div style={{ marginBottom: 14 }}>
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
              CLIENT EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="client@company.com"
              style={{
                width: '100%',
                padding: '11px 13px',
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

          <div style={{ marginBottom: 22 }}>
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
              ADMIN SECRET
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 13px',
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

          {status && (
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: status.ok ? '#27AE60' : '#C0392B',
                marginBottom: 14,
              }}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#C8C1B3' : '#E8A020',
              color: '#F7F4EE',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '2px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'SENDING...' : 'SEND INVITE →'}
          </button>
        </form>
      </div>
    </main>
  )
}
