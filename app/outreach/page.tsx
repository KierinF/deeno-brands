import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type FilterTab = 'all' | 'priority' | 'callbacks' | 'contacted'

async function getOutreachData(filter: FilterTab) {
  const supabase = await createClient()

  // Fetch buildings
  const { data: buildings, error } = await supabase
    .from('building_intelligence')
    .select(`
      parcel_id,
      address,
      pm_name,
      pm_confidence,
      pm_confidence_tier,
      pm_person_first,
      pm_person_last,
      signal_score,
      open_violation_count,
      last_signal_date,
      incumbent_name,
      incumbent_staleness,
      owner_name
    `)
    .limit(200)

  if (error) throw error

  const parcelIds = (buildings || []).map((b) => b.parcel_id)

  // Fetch leads separately (no FK between building_intelligence and leads)
  const { data: leadsData } = parcelIds.length
    ? await supabase
        .from('leads')
        .select('parcel_id, id, status, priority, last_contacted_at, next_followup_at, last_called_at, call_count')
        .in('parcel_id', parcelIds)
    : { data: [] }

  const leadsMap = Object.fromEntries((leadsData || []).map((l) => [l.parcel_id, l]))

  // Attach lead to each building
  const buildingsWithLeads = (buildings || []).map((b) => ({
    ...b,
    leads: leadsMap[b.parcel_id] || null,
  }))

  // Apply priority filter
  const filtered = filter === 'priority'
    ? buildingsWithLeads.filter((b) => b.leads !== null)
    : buildingsWithLeads

  // Get tasks due today
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select('id, parcel_id, title, due_date')
    .lte('due_date', today)
    .is('completed_at', null)
    .order('due_date', { ascending: true })

  return { buildings: filtered, todayTasks: todayTasks || [] }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null
  const color =
    score >= 80 ? '#E8A020' : score >= 50 ? '#1C2B2B' : '#8C8070'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        background: color,
        color: '#F7F4EE',
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: '1.5px',
        fontWeight: 700,
      }}
    >
      {score}
    </span>
  )
}

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/client-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!roleRow || (roleRow.role !== 'internal' && roleRow.role !== 'admin')) {
    redirect('/dashboard')
  }

  const resolvedParams = await searchParams
  const filter = (resolvedParams.filter as FilterTab) || 'all'
  const { buildings, todayTasks } = await getOutreachData(filter)

  // Sort: tasks first, then never-called (by signal_score desc), then by last_called_at asc
  const parcelIdsWithTasks = new Set(todayTasks.map((t) => t.parcel_id))

  const sorted = [...buildings].sort((a, b) => {
    const aHasTask = parcelIdsWithTasks.has(a.parcel_id) ? 0 : 1
    const bHasTask = parcelIdsWithTasks.has(b.parcel_id) ? 0 : 1
    if (aHasTask !== bHasTask) return aHasTask - bHasTask

    const aLead = a.leads
    const bLead = b.leads
    const aCalled = aLead?.last_called_at
    const bCalled = bLead?.last_called_at

    if (!aCalled && !bCalled) {
      return (b.signal_score || 0) - (a.signal_score || 0)
    }
    if (!aCalled) return -1
    if (!bCalled) return 1
    return new Date(aCalled).getTime() - new Date(bCalled).getTime()
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'priority', label: 'PRIORITY' },
    { key: 'callbacks', label: 'CALLBACKS' },
    { key: 'contacted', label: 'CONTACTED' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      {/* Header */}
      <header
        style={{
          background: '#1C2B2B',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #E8A020',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              paddingTop: 2,
            }}
          >
            OUTREACH
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/outreach/tasks"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '1.5px',
              color: '#C8C1B3',
              textDecoration: 'none',
            }}
          >
            TASKS
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: '1.5px',
                color: '#8C8070',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              SIGN OUT
            </button>
          </form>
        </div>
      </header>

      {/* Filter tabs */}
      <div
        style={{
          background: '#1C2B2B',
          padding: '0 32px',
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #2E3E3E',
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/outreach?filter=${tab.key}`}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1.5px',
              color: filter === tab.key ? '#E8A020' : '#8C8070',
              textDecoration: 'none',
              padding: '10px 16px',
              borderBottom: filter === tab.key ? '2px solid #E8A020' : '2px solid transparent',
              display: 'block',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200 }}>
        {/* Tasks due today */}
        {todayTasks.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '2px',
                color: '#E8A020',
                marginBottom: 12,
              }}
            >
              TASKS DUE TODAY ({todayTasks.length})
            </p>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8A020',
                padding: '0',
              }}
            >
              {todayTasks.map((task, i) => (
                <div
                  key={task.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < todayTasks.length - 1 ? '1px solid #C8C1B3' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <Link
                    href={`/outreach/${task.parcel_id}`}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: '#1C2B2B',
                      textDecoration: 'none',
                      flex: 1,
                    }}
                  >
                    {task.title}
                  </Link>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: '#8C8070',
                    }}
                  >
                    {task.due_date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Building list */}
        <div>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              marginBottom: 12,
            }}
          >
            BUILDINGS ({sorted.length})
          </p>

          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 160px 80px 120px 140px',
              gap: 12,
              padding: '8px 16px',
              background: '#F7F4EE',
              borderBottom: '1px solid #C8C1B3',
            }}
          >
            {['ADDRESS', 'SCORE', 'PM', 'VIOLATIONS', 'INCUMBENT', 'LAST CALL'].map((h) => (
              <span
                key={h}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {sorted.map((b) => {
            const lead = b.leads
            const hasTask = parcelIdsWithTasks.has(b.parcel_id)
            return (
              <Link
                key={b.parcel_id}
                href={`/outreach/${b.parcel_id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 60px 160px 80px 120px 140px',
                    gap: 12,
                    padding: '14px 16px',
                    background: '#FFFFFF',
                    borderBottom: '1px solid #C8C1B3',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderLeft: hasTask ? '3px solid #E8A020' : '3px solid transparent',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: '#1C2B2B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {b.address}
                  </span>
                  <div>
                    <ScoreBadge score={b.signal_score} />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: '#1C2B2B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {b.pm_name || b.pm_person_first
                      ? `${b.pm_person_first || ''} ${b.pm_person_last || ''}`.trim() ||
                        b.pm_name ||
                        '—'
                      : '—'}
                    {b.pm_confidence ? (
                      <span style={{ color: '#8C8070', fontSize: 10 }}>
                        {' '}({b.pm_confidence}%)
                      </span>
                    ) : null}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: b.open_violation_count > 0 ? '#E8A020' : '#8C8070',
                    }}
                  >
                    {b.open_violation_count ?? '—'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: '#8C8070',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {b.incumbent_name || '—'}
                    {b.incumbent_staleness ? (
                      <span style={{ color: '#C8C1B3' }}> · {b.incumbent_staleness}</span>
                    ) : null}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: '#8C8070',
                    }}
                  >
                    {lead?.last_called_at
                      ? new Date(lead.last_called_at).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </Link>
            )
          })}

          {sorted.length === 0 && (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: '#8C8070',
              }}
            >
              No buildings found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
