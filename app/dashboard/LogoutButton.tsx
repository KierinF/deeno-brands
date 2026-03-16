'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/client-login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: '1.5px',
        color: '#8C8070',
        background: 'none',
        border: '1px solid #C8C1B3',
        padding: '6px 14px',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = '#1C2B2B'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1C2B2B'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = '#8C8070'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C1B3'
      }}
    >
      SIGN OUT
    </button>
  )
}
