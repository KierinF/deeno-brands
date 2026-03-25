'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const BuildingPanel = dynamic(() => import('./BuildingPanel'), { ssr: false })

type FilterTab = 'all' | 'priority' | 'callbacks' | 'contacted'

type Row = {
  parcel_id: string
  address: string
  signal_score: number | null
  pm_name: string | null
  pm_confidence: number | null
  open_violation_count: number | null
  incumbent_staleness: string | null
  lead: {
    id: string
    status: string | null
    last_called_at: string | null
    call_count: number | null
    next_followup_at: string | null
  } | null
}

type Props = {
  initialRows: Row[]
  total: number
  page: number
  pageSize: number
  filter: FilterTab
  tasksParcelIds: string[]
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'priority', label: 'PRIORITY (70+)' },
  { key: 'callbacks', label: 'CALLBACKS' },
  { key: 'contacted', label: 'CONTACTED' },
]

const STAGE_COLORS: Record<string, string> = {
  new: '#C8C1B3',
  attempted: '#8C8070',
  contacted: '#1C2B2B',
  qualified: '#E8A020',
  proposal: '#E8A020',
  closed: '#2E8B57',
}

export default function OutreachListClient({
  initialRows,
  total,
  page,
  pageSize,
  filter,
  tasksParcelIds,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const tasksSet = new Set(tasksParcelIds)
  const offset = page * pageSize
  const mono = { fontFamily: "'DM Mono', monospace" }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: '#1C2B2B',
        padding: '0 24px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #E8A020',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '3px', color: '#E8A020' }}>
            DEENO
          </span>
          <span style={{ ...mono, fontSize: 10, letterSpacing: '2px', color: '#8C8070', paddingTop: 2 }}>
            OUTREACH
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/outreach/tasks" style={{ ...mono, fontSize: 10, letterSpacing: '1.5px', color: '#C8C1B3', textDecoration: 'none' }}>
            TASKS
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ ...mono, fontSize: 10, letterSpacing: '1.5px', color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              SIGN OUT
            </button>
          </form>
        </div>
      </header>

      {/* Filter tabs */}
      <div style={{ background: '#1C2B2B', padding: '0 24px', display: 'flex', gap: 0, borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/outreach?filter=${tab.key}`}
            style={{
              ...mono,
              fontSize: 9,
              letterSpacing: '1.5px',
              color: filter === tab.key ? '#E8A020' : '#8C8070',
              textDecoration: 'none',
              padding: '9px 14px',
              borderBottom: filter === tab.key ? '2px solid #E8A020' : '2px solid transparent',
              display: 'block',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Split view */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LIST */}
        <div style={{
          width: selectedId ? 360 : '100%',
          flexShrink: 0,
          overflowY: 'auto',
          borderRight: selectedId ? '1px solid #C8C1B3' : 'none',
          transition: 'width 0.2s ease',
        }}>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedId ? '44px 1fr 70px' : '44px 1fr 120px 100px 100px',
            gap: 0,
            padding: '8px 16px',
            borderBottom: '1px solid #C8C1B3',
            background: '#F7F4EE',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
            {['SCR', 'ADDRESS', selectedId ? 'LAST CALL' : 'STAGE', ...(!selectedId ? ['LAST CALL', 'VIOLATIONS'] : [])].map((h) => (
              <span key={h} style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>{h}</span>
            ))}
          </div>

          {initialRows.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', ...mono, fontSize: 12, color: '#8C8070' }}>
              No buildings found.
            </div>
          )}

          {initialRows.map((row) => {
            const hasTask = tasksSet.has(row.parcel_id)
            const isSelected = selectedId === row.parcel_id
            const stage = row.lead?.status || 'new'
            const lastCalled = row.lead?.last_called_at
            const stageColor = STAGE_COLORS[stage] || '#C8C1B3'

            return (
              <div
                key={row.parcel_id}
                onClick={() => setSelectedId(isSelected ? null : row.parcel_id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectedId ? '44px 1fr 70px' : '44px 1fr 120px 100px 100px',
                  gap: 0,
                  padding: '12px 16px',
                  background: isSelected ? '#FFFFFF' : '#FFFFFF',
                  borderBottom: '1px solid #C8C1B3',
                  borderLeft: hasTask ? '3px solid #E8A020' : isSelected ? '3px solid #1C2B2B' : '3px solid transparent',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected ? 'inset 3px 0 0 #1C2B2B' : 'none',
                  opacity: 1,
                }}
              >
                {/* Score */}
                <div>
                  {row.signal_score != null ? (
                    <span style={{
                      ...mono, fontSize: 11, fontWeight: 700,
                      display: 'inline-block',
                      padding: '2px 6px',
                      ...(row.signal_score >= 70
                        ? { background: '#C0392B', color: '#FFFFFF' }
                        : row.signal_score >= 40
                        ? { background: '#E8A020', color: '#1C2B2B' }
                        : row.signal_score > 0
                        ? { background: '#2E5D8E', color: '#FFFFFF' }
                        : { background: '#C8C1B3', color: '#8C8070' }),
                    }}>
                      {row.signal_score}
                    </span>
                  ) : (
                    <span style={{ ...mono, fontSize: 10, color: '#C8C1B3' }}>—</span>
                  )}
                </div>

                {/* Address */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    ...mono, fontSize: 12, color: isSelected ? '#1C2B2B' : '#1C2B2B',
                    fontWeight: isSelected ? 700 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {row.address}
                  </div>
                  {row.pm_name && !selectedId && (
                    <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.pm_name}{row.pm_confidence ? ` ${row.pm_confidence}%` : ''}
                    </div>
                  )}
                </div>

                {/* Stage (collapsed) or Last call (expanded) */}
                {selectedId ? (
                  <div style={{ ...mono, fontSize: 10, color: '#8C8070', whiteSpace: 'nowrap' }}>
                    {lastCalled ? new Date(lastCalled).toLocaleDateString() : 'Never'}
                  </div>
                ) : (
                  <div>
                    <span style={{
                      ...mono, fontSize: 9, letterSpacing: '1px',
                      color: '#F7F4EE',
                      background: stageColor,
                      padding: '2px 6px',
                    }}>
                      {stage.toUpperCase()}
                    </span>
                  </div>
                )}

                {!selectedId && (
                  <>
                    <div style={{ ...mono, fontSize: 11, color: '#8C8070' }}>
                      {lastCalled ? new Date(lastCalled).toLocaleDateString() : 'Never'}
                    </div>
                    <div style={{ ...mono, fontSize: 11, color: row.open_violation_count ? '#E8A020' : '#C8C1B3' }}>
                      {row.open_violation_count ?? '—'}
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderTop: '1px solid #C8C1B3' }}>
            {page > 0 && (
              <Link
                href={`/outreach?filter=${filter}&page=${page - 1}`}
                style={{ ...mono, fontSize: 10, color: '#1C2B2B', textDecoration: 'none', padding: '6px 12px', border: '1px solid #C8C1B3', background: '#FFFFFF' }}
              >
                ← PREV
              </Link>
            )}
            <span style={{ ...mono, fontSize: 9, color: '#8C8070' }}>
              {offset + 1}–{Math.min(offset + pageSize, total)} of {total}
            </span>
            {offset + pageSize < total && (
              <Link
                href={`/outreach?filter=${filter}&page=${page + 1}`}
                style={{ ...mono, fontSize: 10, color: '#1C2B2B', textDecoration: 'none', padding: '6px 12px', border: '1px solid #C8C1B3', background: '#FFFFFF' }}
              >
                NEXT →
              </Link>
            )}
          </div>
        </div>

        {/* PANEL */}
        {selectedId && (
          <div style={{ flex: 1, background: '#F7F4EE', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <BuildingPanel
              key={selectedId}
              parcelId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
