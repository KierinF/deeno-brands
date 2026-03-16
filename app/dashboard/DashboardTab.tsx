'use client'

import { useState, useMemo } from 'react'

type Campaign = {
  campaign_id: string
  campaign_name: string
  sent_count: number
  reply_count: number
  positive_reply_count: number
  bounce_count: number
  start_date: string | null
  end_date: string | null
}

function sumKey(rows: Campaign[], key: keyof Campaign): number {
  return rows.reduce((acc, r) => acc + ((r[key] as number) ?? 0), 0)
}

function delta(curr: number, prev: number): number | null {
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

const METRICS = [
  { key: 'sent_count' as const, label: 'EMAILS SENT' },
  { key: 'reply_count' as const, label: 'REPLIES' },
  { key: 'positive_reply_count' as const, label: 'POSITIVE REPLIES' },
  { key: 'bounce_count' as const, label: 'BOUNCES' },
]

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: '1.5px',
          color: '#8C8070',
        }}
      >
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: '#1C2B2B',
          background: '#FFFFFF',
          border: '1px solid #C8C1B3',
          padding: '6px 10px',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

// Aggregate rows by campaign_id, summing weekly metrics
// positive_reply_count is all-time so take max to avoid double-counting
function aggregateByCampaign(rows: Campaign[]): Campaign[] {
  const map = new Map<string, Campaign>()
  for (const r of rows) {
    const existing = map.get(r.campaign_id)
    if (!existing) {
      map.set(r.campaign_id, { ...r })
    } else {
      map.set(r.campaign_id, {
        ...existing,
        sent_count: existing.sent_count + r.sent_count,
        reply_count: existing.reply_count + r.reply_count,
        bounce_count: existing.bounce_count + r.bounce_count,
        positive_reply_count: Math.max(existing.positive_reply_count, r.positive_reply_count),
      })
    }
  }
  return Array.from(map.values())
}

export default function DashboardTab({ campaigns }: { campaigns: Campaign[] }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // All unique campaigns (for the dropdown list)
  const allCampaigns = useMemo(() => aggregateByCampaign(campaigns), [campaigns])
  const campaignIds = useMemo(() => allCampaigns.map((c) => c.campaign_id), [allCampaigns])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(campaignIds))

  const allSelected = selectedIds.size === campaignIds.length && campaignIds.length > 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(campaignIds))
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasDates = fromDate && toDate

  // Rows for selected campaigns
  const selectedRows = useMemo(
    () => campaigns.filter((r) => selectedIds.has(r.campaign_id)),
    [campaigns, selectedIds]
  )

  // Current period rows: any week that overlaps with [fromDate, toDate]
  const currentRows = useMemo(() => {
    if (!hasDates) return selectedRows
    return selectedRows.filter((r) => {
      if (!r.start_date || !r.end_date) return false
      return r.start_date <= toDate && r.end_date >= fromDate
    })
  }, [selectedRows, fromDate, toDate, hasDates])

  // Previous period: equal-length window immediately before fromDate, same overlap logic
  const prevRows = useMemo(() => {
    if (!hasDates) return []
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const duration = to.getTime() - from.getTime()
    const prevTo = new Date(from.getTime() - 86400000)
    const prevFrom = new Date(prevTo.getTime() - duration)
    const pf = prevFrom.toISOString().slice(0, 10)
    const pt = prevTo.toISOString().slice(0, 10)
    return selectedRows.filter((r) => {
      if (!r.start_date || !r.end_date) return false
      return r.start_date <= pt && r.end_date >= pf
    })
  }, [selectedRows, fromDate, toDate, hasDates])

  // Aggregate by campaign for the table
  const tableRows = useMemo(() => aggregateByCampaign(currentRows), [currentRows])

  const showComparison = !!hasDates

  return (
    <div>
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <DateInput label="FROM" value={fromDate} onChange={setFromDate} />
        <DateInput label="TO" value={toDate} onChange={setToDate} />
        {hasDates && (
          <button
            onClick={() => { setFromDate(''); setToDate('') }}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1px',
              color: '#8C8070',
              background: 'none',
              border: '1px solid #C8C1B3',
              padding: '6px 12px',
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            CLEAR
          </button>
        )}

        {/* Campaign dropdown */}
        <div style={{ position: 'relative', alignSelf: 'flex-end' }}>
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
              {allCampaigns.map((c) => (
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
      {showComparison ? (
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
              PREVIOUS PERIOD
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
                    {sumKey(prevRows, m.key).toLocaleString()}
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
              SELECTED PERIOD
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              {METRICS.map((m) => {
                const curr = sumKey(currentRows, m.key)
                const prev = sumKey(prevRows, m.key)
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
                        gap: 4,
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
                            whiteSpace: 'nowrap',
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
      ) : (
        // No date range — all-time totals
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
                {sumKey(aggregateByCampaign(selectedRows), m.key).toLocaleString()}
              </div>
            </div>
          ))}
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
                {['CAMPAIGN', 'SENT', 'REPLIES', '+REPLIES', 'BOUNCES'].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((c) => (
                <tr key={c.campaign_id} style={{ borderBottom: '1px solid #EEE9DF' }}>
                  <td style={{ padding: '10px 12px', color: '#1C2B2B', maxWidth: 220 }}>
                    {c.campaign_name}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#8C8070' }}>
                    {c.sent_count?.toLocaleString() ?? '—'}
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
                </tr>
              ))}
            </tbody>
          </table>
          {tableRows.length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#8C8070',
              }}
            >
              {hasDates ? 'No data for selected period.' : 'No campaigns selected.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
