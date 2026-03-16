'use client'

import { useState, useMemo, useEffect } from 'react'

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

// Used in all-time view
const ALL_TIME_METRICS = [
  { key: 'sent_count' as const, label: 'EMAILS SENT', lowerIsBetter: false },
  { key: 'reply_count' as const, label: 'REPLIES', lowerIsBetter: false },
  { key: 'positive_reply_count' as const, label: 'POSITIVE REPLIES', lowerIsBetter: false },
  { key: 'bounce_count' as const, label: 'BOUNCES', lowerIsBetter: true },
]

// Used in period comparison
const PERIOD_METRICS = [
  { key: 'sent_count' as const, label: 'EMAILS SENT', lowerIsBetter: false },
  { key: 'reply_count' as const, label: 'REPLIES', lowerIsBetter: false },
  { key: 'positive_reply_count' as const, label: 'POSITIVE REPLIES', lowerIsBetter: false },
  { key: 'bounce_count' as const, label: 'BOUNCES', lowerIsBetter: true },
]

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.5px', color: '#8C8070' }}>
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

function StatCard({
  label,
  value,
  d,
  lowerIsBetter = false,
  highlighted = false,
  dimmed = false,
}: {
  label: string
  value: string
  d?: number | null
  lowerIsBetter?: boolean
  highlighted?: boolean
  dimmed?: boolean
}) {
  const good = d == null ? null : lowerIsBetter ? d < 0 : d >= 0
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: highlighted ? '2px solid #E8A020' : '1px solid #C8C1B3',
        padding: highlighted ? '16px 14px' : '20px 18px',
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
        <span>{label}</span>
        {d != null && (
          <span
            style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: good ? '#27AE60' : '#C0392B',
              background: good ? '#E8F8F0' : '#FDECEA',
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
          fontSize: highlighted ? 30 : 36,
          color: dimmed ? '#8C8070' : '#1C2B2B',
          letterSpacing: '1px',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: '2px',
        color: '#8C8070',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

type CallStats = {
  total_calls: number
  answered: number
  missed: number
  avg_duration_secs: number
  total_talk_secs: number
  dispositions: Record<string, number>
}

export default function DashboardTab({ campaigns }: { campaigns: Campaign[] }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const hasDates = fromDate && toDate

  // Previous period date math
  const { prevFrom, prevTo } = useMemo(() => {
    if (!fromDate || !toDate) return { prevFrom: '', prevTo: '' }
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const duration = to.getTime() - from.getTime()
    const pt = new Date(from.getTime() - 86400000)
    const pf = new Date(pt.getTime() - duration)
    return {
      prevFrom: pf.toISOString().slice(0, 10),
      prevTo: pt.toISOString().slice(0, 10),
    }
  }, [fromDate, toDate])

  // Email: include a weekly row if its start_date falls within the selected range
  const currentRows = useMemo(() => {
    if (!hasDates) return campaigns
    return campaigns.filter(r => r.start_date && r.start_date >= fromDate && r.start_date <= toDate)
  }, [campaigns, fromDate, toDate, hasDates])

  const prevRows = useMemo(() => {
    if (!prevFrom || !prevTo) return []
    return campaigns.filter(r => r.start_date && r.start_date >= prevFrom && r.start_date <= prevTo)
  }, [campaigns, prevFrom, prevTo])

  // All-time aggregation (sum all rows, positive_reply takes max per campaign to avoid double-count)
  const allTimeRows = useMemo(() => {
    const map = new Map<string, Campaign>()
    for (const r of campaigns) {
      const ex = map.get(r.campaign_id)
      if (!ex) { map.set(r.campaign_id, { ...r }); continue }
      map.set(r.campaign_id, {
        ...ex,
        sent_count: ex.sent_count + r.sent_count,
        reply_count: ex.reply_count + r.reply_count,
        bounce_count: ex.bounce_count + r.bounce_count,
        positive_reply_count: Math.max(ex.positive_reply_count, r.positive_reply_count),
      })
    }
    return Array.from(map.values())
  }, [campaigns])

  // CloudTalk stats
  const [callData, setCallData] = useState<{ current: CallStats; previous: CallStats | null } | null>(null)
  const [callLoading, setCallLoading] = useState(false)

  useEffect(() => {
    if (!fromDate || !toDate) { setCallData(null); return }
    setCallLoading(true)
    const params = new URLSearchParams({ date_from: fromDate, date_to: toDate })
    if (prevFrom && prevTo) { params.set('prev_date_from', prevFrom); params.set('prev_date_to', prevTo) }
    fetch(`/api/cloudtalk?${params}`)
      .then(r => r.json())
      .then(d => { setCallData(d); setCallLoading(false) })
      .catch(() => setCallLoading(false))
  }, [fromDate, toDate, prevFrom, prevTo])

  const showComparison = !!hasDates

  const CALL_METRICS: { key: keyof CallStats; label: string; lowerIsBetter: boolean; fmt?: (v: number) => string }[] = [
    { key: 'total_calls', label: 'TOTAL CALLS', lowerIsBetter: false },
    { key: 'answered', label: 'ANSWERED', lowerIsBetter: false },
    { key: 'missed', label: 'MISSED', lowerIsBetter: true },
    { key: 'avg_duration_secs', label: 'AVG DURATION', lowerIsBetter: false, fmt: fmtDuration },
  ]

  return (
    <div>
      {/* Date controls */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
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
      </div>

      {/* ── EMAIL STATS ── */}
      <SectionLabel>EMAIL</SectionLabel>
      {showComparison ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {/* Previous */}
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 12 }}>
              PREVIOUS PERIOD
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {PERIOD_METRICS.map(m => (
                <StatCard key={m.key} label={m.label} value={sumKey(prevRows, m.key).toLocaleString()} dimmed />
              ))}
            </div>
          </div>
          {/* Current */}
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '2px', color: '#E8A020', marginBottom: 12 }}>
              SELECTED PERIOD
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {PERIOD_METRICS.map(m => {
                const curr = sumKey(currentRows, m.key)
                const prev = sumKey(prevRows, m.key)
                return (
                  <StatCard
                    key={m.key}
                    label={m.label}
                    value={curr.toLocaleString()}
                    d={delta(curr, prev)}
                    lowerIsBetter={m.lowerIsBetter}
                    highlighted
                  />
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
          {ALL_TIME_METRICS.map(m => (
            <StatCard key={m.key} label={m.label} value={sumKey(allTimeRows, m.key).toLocaleString()} />
          ))}
        </div>
      )}

      {/* ── CALL STATS ── */}
      {hasDates && (
        <div style={{ marginTop: 8 }}>
          <SectionLabel>CALLS</SectionLabel>
          {callLoading ? (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#8C8070', marginBottom: 40 }}>
              LOADING...
            </div>
          ) : callData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {/* Previous */}
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 12 }}>
                  PREVIOUS PERIOD
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {CALL_METRICS.map(m => {
                    const val = callData.previous ? (callData.previous[m.key] as number) : 0
                    return (
                      <StatCard key={m.key} label={m.label} value={m.fmt ? m.fmt(val) : val.toLocaleString()} dimmed />
                    )
                  })}
                </div>
              </div>
              {/* Current */}
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '2px', color: '#E8A020', marginBottom: 12 }}>
                  SELECTED PERIOD
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {CALL_METRICS.map(m => {
                    const curr = callData.current[m.key] as number
                    const prev = callData.previous ? (callData.previous[m.key] as number) : 0
                    return (
                      <StatCard
                        key={m.key}
                        label={m.label}
                        value={m.fmt ? m.fmt(curr) : curr.toLocaleString()}
                        d={callData.previous ? delta(curr, prev) : null}
                        lowerIsBetter={m.lowerIsBetter}
                        highlighted
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* Dispositions */}
          {callData && Object.keys(callData.current.dispositions).length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <SectionLabel>CALL DISPOSITIONS</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {Object.entries(callData.current.dispositions)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => (
                    <StatCard key={name} label={name.toUpperCase()} value={count.toLocaleString()} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
