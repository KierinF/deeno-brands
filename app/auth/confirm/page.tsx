'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthConfirmPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'invite' | 'recovery' | 'email' | null

    if (!token_hash || !type) {
      router.push('/client-login')
      return
    }

    supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
      if (error) {
        setError(error.message)
      } else if (type === 'invite') {
        router.push('/set-password')
      } else {
        router.push('/dashboard')
      }
    })
  }, [])

  if (error) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#F7F4EE',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
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
            fontSize: 11,
            color: '#C0392B',
            letterSpacing: '1px',
          }}
        >
          {error}
        </p>
        <a
          href="/client-login"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '1.5px',
            color: '#8C8070',
            textDecoration: 'underline',
          }}
        >
          Back to login
        </a>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F7F4EE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
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
          fontSize: 11,
          letterSpacing: '2px',
          color: '#8C8070',
        }}
      >
        VERIFYING...
      </p>
    </main>
  )
}
