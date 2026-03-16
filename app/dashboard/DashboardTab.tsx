'use client'

import { useState, useMemo } from 'react'

type Campaign = {
  campaign_id: number
  campaign_name: string
  lead_contacted: number
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  reply_count: number
  positive_reply_count: number
  bounce_count: number
  unsubscribe_count: number
  start_date: string | null
  end_date: string | null
}

type Period = '7D' | '30D' | '90D' | 'ALL'

function dedupe(rows: Campaign[]): Campaign[] {
  const map = new Map<number, Campaign>()
  for (const row of rows) {
    const existing = map.get(row.campaign_id)
    if (!existing) {
      map.set(row.campaign_id, row)
    } else {
      if ((row.end_date ?? '') > (existing.end_date ?? '')) {
        map.set(row.campaign_id, row)
      }
    }
  }
  return Array.from(map.values())
}

function sum(rows: Campaign[], key: keyof Campaign): number {
  return rows.reduce((acc, r) => acc + ((r[key] as number) ?? 0), 0)
}

function delta(curr: number, prev: number): number | null {
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

function filterByPeriod(rows: Campaign[], period: Period, which: 'current' | 'prev'): Campaign[] {
  if (period === 'ALL') return rows

  const days = period === '7D' ? 7 : period === '30D' ? 30 : 90
  const now = new Date()
  const currentStart = new Date(now)
  currentStart.setDate(currentStart.getDate() - days)

  const prevEnd = new Date(currentStart)
  const prevStart = new Date(currentStart)
  prevStart.setDate(prevStart.getDate() - days)

  const start = which === 'current' ? currentStart : prevStart
  const end = which === 'current' ? now : prevEnd

  return rows.filter((r) => {
    if (!r.end_date) return false
    const d = new Date(r.end_date)
    return d >= start && d <= end
  })
}

const METRICS = [
  { key: 'emails_sent' as const, label: 'EMAILS SENT' },
  { key: 'emails_opened' as const, label: 'OPENS' },
  { key: 'reply_count' as const, label: 'REPLIES' },
  { key: 'positive_reply_count' as const, label: 'POSITIVE REPLIES' },
  { key: 'bounce_count' as const, label: 'BOUNCES' },
]

export default function DashboardTab({ campaigns }: { campaigns: Campaign[] }) {
  const [period, setPeriod] = useState<Period>('30D')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const uniqueCampaigns = useMemo(() => dedupe(campaigns), [campaigns])
  const campaignIds = useMemo(() => uniqueCampaigns.map((c) => c.campaign_id), [uniqueCampaigns])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(campaignIds))

  const allSelected = selectedIds.size === campaignIds.length && campaignIds.length > 0

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(campaignIds))
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredRows = useMemo(
    () => campaigns.filter((r) => selectedIds.has(r.campaign_id)),
    [campaigns, selectedIds]
  )

  const currentRows = useMemo(
    () => filterByPeriod(filteredRows, period, 'current'),
    [filteredRows, period]
  )
  const prevRows = useMemo(
    () => filterByPeriod(filteredRows, period, 'prev'),
    [filteredRows, period]
  )

  const isAll = period === 'ALL'

  return (
    <div>
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        {/* Period filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['7D', '30D', '90D', 'ALL'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '1.5px',
                padding: '6px 12px',
                background: period === p ? '#1C2B2B' : 'transparent',
                color: period === p ? '#F7F4EE' : '#8C8070',
                border: '1px solid',
                borderColor: period === p ? '#1C2B2B' : '#C8C1B3',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Campaign filter dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1.5px',
              padding: '6px 14px',
              background: 'transparent',
              color: '#8C8070',
              border: '1px solid #C8C1B3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            CAMPAIGNS ({selectedIds.size}/{campaignIds.length}) ▾
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#F7F4EE',
                border: '1px solid #C8C1B3',
                minWidth: 260,
                marginTop: 4,
                zIndex: 50,
                boxShadow: '0 4px 16px rgba(28,43,43,0.08)',
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '1px',
                  color: '#1C2B2B',
                  borderBottom: '1px solid #C8C1B3',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{ accentColor: '#E8A020' }}
                />
                SELECT ALL
              </label>
              {uniqueCampaigns.map((c) => (
                <label
                  key={c.campaign_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '1px',
                    color: '#8C8070',
                    borderBottom: '1px solid #EEE9DF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.campaign_id)}
                    onChange={() => toggleOne(c.campaign_id)}
                    style={{ accentColor: '#E8A020' }}
                  />
                  {c.campaign_name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {isAll ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {METRICS.map((m) => (
            <div
              key={m.key}
              style={{
                background: '#FFFFFF',
                border: '1px solid #C8C1B3',
                padding: '20px 18px',
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 36,
                  color: '#1C2B2B',
                  letterSpacing: '1px',
                }}
              >
                {sum(filteredRows, m.key).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {/* Previous period */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                letterSpacing: '2px',
                color: '#8C8070',
                marginBottom: 12,
              }}
            >
              PREVIOUS {period}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              {METRICS.map((m) => (
                <div
                  key={m.key}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #C8C1B3',
                    padding: '16px 14px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '1.5px',
                      color: '#8C8070',
                      marginBottom: 6,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 30,
                      color: '#8C8070',
                      letterSpacing: '1px',
                    }}
                  >
                    {sum(prevRows, m.key).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current period */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                letterSpacing: '2px',
                color: '#E8A020',
                marginBottom: 12,
              }}
            >
              CURRENT {period}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              {METRICS.map((m) => {
                const curr = sum(currentRows, m.key)
                const prev = sum(prevRows, m.key)
                const d = delta(curr, prev)
                return (
                  <div
                    key={m.key}
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid #E8A020',
                      padding: '16px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        letterSpacing: '1.5px',
                        color: '#8C8070',
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{m.label}</span>
                      {d !== null && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: "'DM Mono', monospace",
                            color: d >= 0 ? '#27AE60' : '#C0392B',
                            background: d >= 0 ? '#E8F8F0' : '#FDECEA',
                            padding: '1px 5px',
                          }}
                        >
                          {d >= 0 ? '+' : ''}{d.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 30,
                        color: '#1C2B2B',
                        letterSpacing: '1px',
                      }}
                    >
                      {curr.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Campaign table */}
      <div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '2px',
            color: '#8C8070',
            marginBottom: 12,
          }}
        >
          CAMPAIGNS
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #C8C1B3' }}>
                {['CAMPAIGN', 'SENT', 'OPENS', 'REPLIES', '+REPLIES', 'BOUNCES', 'WEEK OF'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        color: '#8C8070',
                        fontWeight: 'normal',
                        letterSpacing: '1.5px',
                        fontSize: 9,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {uniqueCampaigns
                .filter((c) => selectedIds.has(c.campaign_id))
                .map((c) => (
                  <tr key={c.campaign_id} style={{ borderBottom: '1px solid #EEE9DF' }}>
                    <td style={{ padding: '10px 12px', color: '#1C2B2B', maxWidth: 220 }}>
                      {c.campaign_name}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#8C8070' }}>
                      {c.emails_sent?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#8C8070' }}>
                      {c.emails_opened?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#8C8070' }}>
                      {c.reply_count?.toLocaleString() ?? '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          color: '#27AE60',
                          background: '#E8F8F0',
                          padding: '2px 6px',
                          fontSize: 10,
                        }}
                      >
                        {c.positive_reply_count?.toLocaleString() ?? '0'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#C0392B' }}>
                      {c.bounce_count?.toLocaleString() ?? '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        color: '#8C8070',
                        fontSize: 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.end_date
                        ? new Date(c.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {uniqueCampaigns.filter((c) => selectedIds.has(c.campaign_id)).length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#8C8070',
              }}
            >
              No campaigns selected.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
