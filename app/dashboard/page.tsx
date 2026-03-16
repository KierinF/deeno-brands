import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import DashboardTab from './DashboardTab'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/client-login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  const { data: campaigns } = await supabase.rpc('get_my_campaigns')

  const params = await searchParams
  const tab = params.tab ?? 'dashboard'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      {/* Header */}
      <header
        style={{
          background: '#F7F4EE',
          borderBottom: '1px solid #C8C1B3',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: '3px',
              color: '#E8A020',
            }}
          >
            DEENO
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1px',
              color: '#8C8070',
            }}
          >
            {client?.name ?? user.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* Tabs */}
      <div
        style={{
          borderBottom: '1px solid #C8C1B3',
          padding: '0 32px',
          display: 'flex',
          gap: 0,
        }}
      >
        {['dashboard', 'approvals'].map((t) => (
          <a
            key={t}
            href={`/dashboard?tab=${t}`}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '2px',
              padding: '14px 20px',
              textDecoration: 'none',
              color: tab === t ? '#1C2B2B' : '#8C8070',
              borderBottom: tab === t ? '2px solid #E8A020' : '2px solid transparent',
              transition: 'color 0.2s',
            }}
          >
            {t.toUpperCase()}
          </a>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {tab === 'dashboard' ? (
          <DashboardTab campaigns={campaigns ?? []} />
        ) : (
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: '#8C8070',
              textAlign: 'center',
              paddingTop: 80,
            }}
          >
            APPROVALS — COMING SOON
          </div>
        )}
      </div>
    </div>
  )
}
