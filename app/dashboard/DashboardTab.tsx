'use client'

import { useState, useMemo } from 'react'

type Campaign = {
  campaign_id: string
  campaign_name: string
  sent_count: number
  unique_sent_count: number
  open_count: number
  unique_open_count: number
  click_count: number
  reply_count: number
  positive_reply_count: number
  bounce_count: number
  unsubscribed_count: number
  meeting_count: number
  status: string
}

function sum(rows: Campaign[], key: keyof Campaign): number {
  return rows.reduce((acc, r) => acc + ((r[key] as number) ?? 0), 0)
}

const METRICS = [
  { key: 'sent_count' as const, label: 'EMAILS SENT' },
  { key: 'reply_count' as const, label: 'REPLIES' },
  { key: 'positive_reply_count' as const, label: 'POSITIVE REPLIES' },
  { key: 'bounce_count' as const, label: 'BOUNCES' },
]

export default function DashboardTab({ campaigns }: { campaigns: Campaign[] }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Aggregate: sum weekly rows per campaign_id for all-time totals
  const uniqueCampaigns = useMemo(() => {
    const map = new Map<string, Campaign>()
    for (const row of campaigns) {
      const existing = map.get(row.campaign_id)
      if (!existing) {
        map.set(row.campaign_id, { ...row })
      } else {
        map.set(row.campaign_id, {
          ...existing,
          sent_count: existing.sent_count + row.sent_count,
          reply_count: existing.reply_count + row.reply_count,
          bounce_count: existing.bounce_count + row.bounce_count,
          // positive_reply_count is all-time from /analytics — take max to avoid double-counting
          positive_reply_count: Math.max(existing.positive_reply_count, row.positive_reply_count),
        })
      }
    }
    return Array.from(map.values())
  }, [campaigns])

  const campaignIds = useMemo(() => uniqueCampaigns.map((c) => c.campaign_id), [uniqueCampaigns])
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

  const selectedCampaigns = useMemo(
    () => uniqueCampaigns.filter((c) => selectedIds.has(c.campaign_id)),
    [uniqueCampaigns, selectedIds]
  )

  return (
    <div>
      {/* Campaign filter dropdown */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
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
              {sum(selectedCampaigns, m.key).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

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
              {selectedCampaigns.map((c) => (
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
          {selectedCampaigns.length === 0 && (
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
