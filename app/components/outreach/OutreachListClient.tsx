'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const DialerPanel = dynamic(() => import('./DialerPanel'), { ssr: false })

const BOROUGH_MAP: Record<string, string> = {
  '1': 'Manhattan', '2': 'Bronx', '3': 'Brooklyn', '4': 'Queens', '5': 'Staten Island',
}
const ALL_BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']

function boroughFromParcelId(parcelId: string): string {
  const digit = parcelId.startsWith('nyc_') ? parcelId[4] : parcelId[0]
  return BOROUGH_MAP[digit] || ''
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'Never'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const BuildingPanel = dynamic(() => import('./BuildingPanel'), { ssr: false })

type FilterTab = 'properties' | 'managers' | 'owners' | 'contractors' | 'brokers' | 'incumbents'

type Row = {
  parcel_id: string
  address: string
  signal_score: number | null
  pm_name: string | null
  pm_confidence: number | null
  open_violation_count: number | null
  open_fines_total: number | null
  total_fines: number | null
  incumbent_name: string | null
  incumbent_staleness: string | null
  incumbent_last_job: string | null
  lead: {
    id: string
    status: string | null
    last_called_at: string | null
    call_count: number | null
    next_followup_at: string | null
  } | null
}

type ContactRow = {
  parcel_id: string
  business_name: string
  contact_type: string
  first_name: string | null
  last_name: string | null
  confidence: number | null
  source_date: string | null
  source: string | null
}

function fmtFines(amount: number | null | undefined): string {
  if (!amount) return ''
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`
  return `$${amount}`
}

const CONTRACTOR_KEYWORDS = /scaffold|construct|contrac|builder|plumb|electric|hvac|mechanical|sprinkler|suppression|fire.?prot|demolit|mason|carpent|paint|tile|glass|roofing|welding|elevator|boiler|service|install|repair|maint|management.*(?:llc|inc|corp)/i

type OrgGroup = {
  name: string
  buildings: Row[]
  topScore: number
  openFines: number
  totalFines: number
  latestJob: string | null
}

const PAGE_SIZE = 100

type Props = {
  initialRows: Row[]
  contacts: ContactRow[]
  filter: FilterTab
  tasksParcelIds: string[]
  contactInfoParcelIds: string[]
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'properties', label: 'PROPERTIES' },
  { key: 'managers', label: 'MANAGERS' },
  { key: 'owners', label: 'OWNERS' },
  { key: 'contractors', label: 'CONTRACTORS' },
  { key: 'brokers', label: 'BROKERS' },
  { key: 'incumbents', label: 'INCUMBENTS' },
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
  contacts,
  filter,
  tasksParcelIds,
  contactInfoParcelIds,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const [contractorFilter, setContractorFilter] = useState<'all' | 'fire'>('all')
  const [boroughFilter, setBoroughFilter] = useState<Set<string>>(new Set(ALL_BOROUGHS))
  const [contactFilter, setContactFilter] = useState<'all' | 'has_contact'>('all')
  const [dialInput, setDialInput] = useState<string | null>(null)
  const [activeDial, setActiveDial] = useState<{
    phoneNumber: string
    contactId?: string
    contactName?: string
    parcelId?: string
    buildingAddress?: string
    signalBrief?: string
    leadId?: string | null
  } | null>(null)
  const [panelRefresh, setPanelRefresh] = useState(0)
  const tasksSet = new Set(tasksParcelIds)
  const mono = { fontFamily: "'DM Mono', monospace" }

  const contactInfoSet = useMemo(() => new Set(contactInfoParcelIds), [contactInfoParcelIds])

  const rowsByParcel = useMemo(() => {
    const m: Record<string, Row> = {}
    for (const r of initialRows) m[r.parcel_id] = r
    return m
  }, [initialRows])

  // Build org groups for managers/owners/contractors/brokers tabs
  const orgGroups = useMemo((): OrgGroup[] => {
    if (filter === 'properties') return []
    const q = search.trim().toLowerCase()

    function buildingFines(buildings: Row[]) {
      return {
        openFines: buildings.reduce((s, r) => s + (r.open_fines_total ?? 0), 0),
        totalFines: buildings.reduce((s, r) => s + (r.total_fines ?? 0), 0),
      }
    }

    if (filter === 'managers' || filter === 'incumbents') {
      const groups: Map<string, Row[]> = new Map()
      for (const row of initialRows) {
        if (!boroughFilter.has(boroughFromParcelId(row.parcel_id))) continue
        const name = filter === 'incumbents'
          ? (row.incumbent_name || null)
          : (row.pm_name || '(Unknown PM)')
        if (!name) continue
        if (q && !name.toLowerCase().includes(q) && !(row.address || '').toLowerCase().includes(q)) continue
        if (!groups.has(name)) groups.set(name, [])
        groups.get(name)!.push(row)
      }
      return Array.from(groups.entries())
        .map(([name, rawBuildings]) => {
          const buildings = [...rawBuildings].sort((a, b) =>
            (b.signal_score ?? 0) - (a.signal_score ?? 0))
          const latestJob = buildings.reduce((best, r) => {
            const d = r.incumbent_last_job ?? ''
            return d > (best ?? '') ? d : best
          }, null as string | null)
          return {
            name,
            buildings,
            topScore: Math.max(...buildings.map(r => r.signal_score ?? 0)),
            latestJob,
            ...buildingFines(buildings),
          }
        })
        .filter(g => contactFilter === 'all' || g.buildings.some(b => contactInfoSet.has(b.parcel_id)))
        .sort((a, b) =>
          filter === 'incumbents'
            ? (b.latestJob ?? '').localeCompare(a.latestJob ?? '')
            : filter === 'managers'
              ? b.openFines - a.openFines || b.buildings.length - a.buildings.length
              : b.buildings.length - a.buildings.length || b.topScore - a.topScore
        )
    }

    // owners / contractors / brokers — grouped from contacts
    const groups: Map<string, { parcels: Set<string>; latestDate: string | null }> = new Map()
    for (const c of (contacts || [])) {
      if (!boroughFilter.has(boroughFromParcelId(c.parcel_id))) continue
      const name = (c.business_name || '').trim()
      if (!name) continue
      if (filter === 'owners' && CONTRACTOR_KEYWORDS.test(name)) continue
      if (filter === 'contractors' && contractorFilter === 'fire' && c.source !== 'nyc_dob_plumbing') continue
      if (q && !name.toLowerCase().includes(q) && !(rowsByParcel[c.parcel_id]?.address || '').toLowerCase().includes(q)) continue
      if (!groups.has(name)) groups.set(name, { parcels: new Set(), latestDate: null })
      const g = groups.get(name)!
      g.parcels.add(c.parcel_id)
      if (c.source_date && (!g.latestDate || c.source_date > g.latestDate)) g.latestDate = c.source_date
    }
    return Array.from(groups.entries())
      .map(([name, { parcels, latestDate }]) => {
        const buildings = Array.from(parcels)
          .map(pid => rowsByParcel[pid])
          .filter(Boolean)
          .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0))
        return {
          name,
          buildings,
          topScore: buildings.length ? Math.max(...buildings.map(r => r.signal_score ?? 0)) : 0,
          latestJob: latestDate,
          ...buildingFines(buildings),
        }
      })
      .filter(g => g.buildings.length > 0)
      .filter(g => contactFilter === 'all' || g.buildings.some(b => contactInfoSet.has(b.parcel_id)))
      .sort((a, b) =>
        filter === 'brokers'
          ? b.openFines - a.openFines || b.buildings.length - a.buildings.length
          : filter === 'contractors'
            ? (b.latestJob ?? '').localeCompare(a.latestJob ?? '') || b.buildings.length - a.buildings.length
            : b.buildings.length - a.buildings.length || b.topScore - a.topScore
      )
  }, [filter, initialRows, contacts, rowsByParcel, search, contractorFilter, contactFilter, contactInfoSet, boroughFilter])

  const filteredRows = useMemo(() => {
    if (filter !== 'properties') return []
    const q = search.trim().toLowerCase()
    return initialRows.filter(r => {
      const borough = boroughFromParcelId(r.parcel_id)
      if (!boroughFilter.has(borough)) return false
      if (contactFilter === 'has_contact' && !contactInfoSet.has(r.parcel_id)) return false
      if (!q) return true
      return (r.address || '').toLowerCase().includes(q) ||
             (r.pm_name || '').toLowerCase().includes(q)
    })
  }, [filter, initialRows, search, boroughFilter, contactFilter, contactInfoSet])

  const total = filter === 'properties' ? filteredRows.length : orgGroups.length
  const offset = page * PAGE_SIZE
  const pageRows = filteredRows.slice(offset, offset + PAGE_SIZE)
  const pageGroups = orgGroups.slice(offset, offset + PAGE_SIZE)

  const searchFilters = (
    <div style={{ background: '#F7F4EE', borderBottom: '1px solid #C8C1B3', padding: '8px 16px', flexShrink: 0 }}>
      <input
        type="text"
        placeholder={filter === 'properties' ? 'Search address or PM...' : `Search ${filter}...`}
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0) }}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '7px 12px',
          border: '1px solid #C8C1B3',
          background: '#FFFFFF',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: '#1C2B2B',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {ALL_BOROUGHS.map(b => {
          const active = boroughFilter.has(b)
          return (
            <button
              key={b}
              onClick={() => {
                setBoroughFilter(prev => {
                  const next = new Set(prev)
                  next.has(b) ? next.delete(b) : next.add(b)
                  return next
                })
                setPage(0)
              }}
              style={{
                ...mono, fontSize: 9, letterSpacing: '1px',
                padding: '3px 8px',
                border: '1px solid #C8C1B3',
                background: active ? '#1C2B2B' : '#FFFFFF',
                color: active ? '#E8A020' : '#8C8070',
                cursor: 'pointer',
              }}
            >
              {b.toUpperCase()}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {(['all', 'has_contact'] as const).map(opt => (
          <button
            key={opt}
            onClick={() => { setContactFilter(opt); setPage(0) }}
            style={{
              ...mono, fontSize: 9, letterSpacing: '1.5px',
              padding: '3px 8px',
              border: '1px solid #C8C1B3',
              background: contactFilter === opt ? '#1C2B2B' : '#FFFFFF',
              color: contactFilter === opt ? '#E8A020' : '#8C8070',
              cursor: 'pointer',
            }}
          >
            {opt === 'all' ? 'ALL' : 'HAS CONTACT'}
          </button>
        ))}
      </div>
      {filter === 'contractors' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {(['all', 'fire'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => { setContractorFilter(opt); setPage(0) }}
              style={{
                ...mono, fontSize: 9, letterSpacing: '1.5px',
                padding: '4px 10px',
                border: '1px solid #C8C1B3',
                background: contractorFilter === opt ? '#1C2B2B' : '#FFFFFF',
                color: contractorFilter === opt ? '#E8A020' : '#8C8070',
                cursor: 'pointer',
              }}
            >
              {opt === 'all' ? 'ALL' : 'FIRE SYSTEM ONLY'}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ height: '100vh', background: '#F7F4EE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

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
      <div style={{ background: '#1C2B2B', padding: '0 24px', display: 'flex', gap: 0, borderBottom: '1px solid #2E3E3E', flexShrink: 0, alignItems: 'center' }}>
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/outreach?filter=${tab.key}`}
            onClick={() => { setPage(0); setSearch('') }}
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
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { setDialInput(''); setActiveDial(null) }}
          style={{
            ...mono, fontSize: 9, letterSpacing: '1.5px',
            color: (dialInput !== null || activeDial) ? '#1C2B2B' : '#E8A020',
            background: (dialInput !== null || activeDial) ? '#E8A020' : 'none',
            border: '1px solid #E8A020',
            cursor: 'pointer', padding: '5px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          DIAL
        </button>
      </div>

      {/* Search bar — full width when no panel open */}
      {!selectedId && searchFilters}

      {/* Split view */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT COLUMN: search (when panel open) + scrollable list */}
        <div style={{
          width: selectedId ? 360 : '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: selectedId ? '1px solid #C8C1B3' : 'none',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}>
          {selectedId && searchFilters}
          <div style={{ flex: 1, overflowY: 'auto' }}>

          {filter === 'properties' ? (
            <>
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
                {['SCR', 'ADDRESS', selectedId ? 'LAST CALL' : 'STAGE', ...(!selectedId ? ['LAST CALL', 'FINES'] : [])].map((h) => (
                  <span key={h} style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>{h}</span>
                ))}
              </div>

              {pageRows.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center', ...mono, fontSize: 12, color: '#8C8070' }}>
                  {search ? 'No results.' : 'No buildings found.'}
                </div>
              )}

              {pageRows.map((row) => renderBuildingRow(row))}
            </>
          ) : (
            <>
              {/* Org grouped view */}
              {pageGroups.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center', ...mono, fontSize: 12, color: '#8C8070' }}>
                  {search ? 'No results.' : `No ${filter} found.`}
                </div>
              )}

              {pageGroups.map((group) => {
                const isExpanded = expandedOrgs.has(group.name)
                // For incumbents tab, derive staleness from the buildings in the group
                const stalenessValues = filter === 'incumbents'
                  ? group.buildings.map(r => r.incumbent_staleness).filter(Boolean)
                  : []
                const worstStaleness = stalenessValues.includes('active') ? 'active'
                  : stalenessValues.includes('dormant') ? 'dormant'
                  : stalenessValues.includes('stale') ? 'stale' : null
                return (
                  <div key={group.name} style={{ borderBottom: '1px solid #C8C1B3' }}>
                    {/* Org header row */}
                    <div
                      onClick={() => setExpandedOrgs(prev => {
                        const n = new Set(prev)
                        n.has(group.name) ? n.delete(group.name) : n.add(group.name)
                        return n
                      })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        background: '#F7F4EE',
                        cursor: 'pointer',
                        borderLeft: worstStaleness === 'active' ? '3px solid #C0392B'
                          : worstStaleness === 'dormant' ? '3px solid #E8A020'
                          : '3px solid #C8C1B3',
                      }}
                    >
                      <span style={{ ...mono, fontSize: 9, color: '#8C8070', flexShrink: 0 }}>
                        {isExpanded ? '▾' : '▸'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ ...mono, fontSize: 12, color: '#1C2B2B', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {group.name}
                          </div>
                          {worstStaleness && (
                            <span style={{
                              ...mono, fontSize: 8, letterSpacing: '1px',
                              padding: '1px 5px',
                              background: worstStaleness === 'active' ? '#C0392B' : '#E8A020',
                              color: worstStaleness === 'active' ? '#FFF' : '#1C2B2B',
                              flexShrink: 0,
                            }}>
                              {worstStaleness === 'active' ? 'ACTIVE' : worstStaleness === 'dormant' ? 'DORMANT' : 'STALE'}
                            </span>
                          )}
                        </div>
                        <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginTop: 2 }}>
                          {group.buildings.length} building{group.buildings.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        {group.openFines > 0 && (
                          <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#C0392B' }}>
                            {fmtFines(group.openFines)} open
                          </span>
                        )}
                        {group.totalFines > 0 && (
                          <span style={{ ...mono, fontSize: 9, color: '#8C8070' }}>
                            {fmtFines(group.totalFines)} total
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded building rows */}
                    {isExpanded && (() => {
                      const colHeader = (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: selectedId ? '44px 1fr 70px' : '44px 1fr 120px 100px 100px',
                          padding: '5px 16px 5px 36px',
                          background: '#F0EDE7',
                          borderBottom: '1px solid #C8C1B3',
                        }}>
                          {['SCR', 'ADDRESS', selectedId ? 'LAST CALL' : 'STAGE', ...(!selectedId ? ['LAST CALL', 'FINES'] : [])].map((h) => (
                            <span key={h} style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>{h}</span>
                          ))}
                        </div>
                      )

                      if (filter !== 'incumbents' && filter !== 'contractors') {
                        return (
                          <>
                            {colHeader}
                            {group.buildings.map((row) => (
                              <div key={row.parcel_id} style={{ paddingLeft: 20 }}>
                                {renderBuildingRow(row, true)}
                              </div>
                            ))}
                          </>
                        )
                      }

                      if (filter === 'contractors') {
                        const bands = [
                          { label: '80–100', min: 80, max: 100 },
                          { label: '50–79', min: 50, max: 79 },
                          { label: '0–49', min: 0, max: 49 },
                        ]
                        return (
                          <>
                            {colHeader}
                            {bands.map(({ label, min, max }) => {
                              const rows = group.buildings
                                .filter(r => (r.signal_score ?? 0) >= min && (r.signal_score ?? 0) <= max)
                                .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0))
                              if (!rows.length) return null
                              return (
                                <div key={label}>
                                  <div style={{ padding: '4px 16px 4px 36px', background: '#EAE7E1', borderBottom: '1px solid #C8C1B3', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>SCORE {label}</span>
                                  </div>
                                  {rows.map((row) => (
                                    <div key={row.parcel_id} style={{ paddingLeft: 20 }}>
                                      {renderBuildingRow(row, true)}
                                    </div>
                                  ))}
                                </div>
                              )
                            })}
                          </>
                        )
                      }

                      // Incumbents: sub-group by score band, sort within band by job recency (fresh first)
                      const STALENESS_ORDER: Record<string, number> = { active: 0, dormant: 1, stale: 2 }
                      const bands = [
                        { label: '80–100', min: 80, max: 100 },
                        { label: '50–79', min: 50, max: 79 },
                        { label: '0–49', min: 0, max: 49 },
                      ]
                      return (
                        <>
                          {colHeader}
                          {bands.map(({ label, min, max }) => {
                            const rows = group.buildings
                              .filter(r => (r.signal_score ?? 0) >= min && (r.signal_score ?? 0) <= max)
                              .sort((a, b) =>
                                (STALENESS_ORDER[a.incumbent_staleness ?? ''] ?? 3) -
                                (STALENESS_ORDER[b.incumbent_staleness ?? ''] ?? 3)
                              )
                            if (!rows.length) return null
                            return (
                              <div key={label}>
                                <div style={{
                                  padding: '4px 16px 4px 36px',
                                  background: '#EAE7E1',
                                  borderBottom: '1px solid #C8C1B3',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}>
                                  <span style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>
                                    SCORE {label}
                                  </span>
                                  <span style={{ ...mono, fontSize: 8, color: '#C8C1B3' }}>· sorted by recency</span>
                                </div>
                                {rows.map((row) => (
                                  <div key={row.parcel_id} style={{ paddingLeft: 20 }}>
                                    {renderBuildingRow(row, true)}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </>
                      )
                    })()}
                  </div>
                )
              })}
            </>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderTop: '1px solid #C8C1B3' }}>
            {page > 0 && (
              <button
                onClick={() => setPage(p => p - 1)}
                style={{ ...mono, fontSize: 10, color: '#1C2B2B', padding: '6px 12px', border: '1px solid #C8C1B3', background: '#FFFFFF', cursor: 'pointer' }}
              >
                ← PREV
              </button>
            )}
            <span style={{ ...mono, fontSize: 9, color: '#8C8070' }}>
              {total === 0 ? '0' : `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)}`} of {total}
            </span>
            {offset + PAGE_SIZE < total && (
              <button
                onClick={() => setPage(p => p + 1)}
                style={{ ...mono, fontSize: 10, color: '#1C2B2B', padding: '6px 12px', border: '1px solid #C8C1B3', background: '#FFFFFF', cursor: 'pointer' }}
              >
                NEXT →
              </button>
            )}
          </div>
          </div>{/* end inner scroll div */}
        </div>{/* end left column */}

        {/* PANEL */}
        {selectedId && (
          <div style={{ flex: 1, background: '#F7F4EE', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <BuildingPanel
              key={selectedId}
              parcelId={selectedId}
              onClose={() => setSelectedId(null)}
              onDialRequest={(dial) => setActiveDial(dial)}
              refreshTrigger={panelRefresh}
            />
          </div>
        )}

        {/* Global dialer panel — inline flex sibling, pushes content left */}
        {(dialInput !== null || activeDial) && (
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          {activeDial ? (
            <DialerPanel
              parcelId={activeDial.parcelId || selectedId || ''}
              contactId={activeDial.contactId || ''}
              contactName={activeDial.contactName || 'Manual Dial'}
              phoneNumber={activeDial.phoneNumber}
              buildingAddress={activeDial.buildingAddress || (selectedId ? (initialRows.find(r => r.parcel_id === selectedId)?.address || '') : '')}
              signalBrief={activeDial.signalBrief || ''}
              leadId={activeDial.leadId ?? null}
              onClose={() => { setActiveDial(null); setDialInput(null); setPanelRefresh(n => n + 1) }}
            />
          ) : (
            <div style={{
              width: 280, height: '100%',
              background: '#1C2B2B', borderLeft: '2px solid #E8A020',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ ...mono, fontSize: 10, letterSpacing: '2px', color: '#8C8070' }}>DIALER</span>
                <button onClick={() => setDialInput(null)} style={{ background: 'none', border: 'none', color: '#8C8070', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
              </div>

              {/* Number display */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, background: '#0E1A1A', border: '1px solid #2E3E3E', padding: '8px 12px', ...mono, fontSize: 18, color: '#F7F4EE', letterSpacing: '2px', minHeight: 40 }}>
                  {dialInput || <span style={{ color: '#2E3E3E' }}>—</span>}
                </div>
                <button
                  onClick={() => setDialInput(p => (p ?? '').slice(0, -1))}
                  style={{ background: 'none', border: 'none', color: '#8C8070', cursor: 'pointer', ...mono, fontSize: 18, padding: '4px 6px' }}
                >⌫</button>
              </div>

              {/* Keypad */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']].map((row, ri) => (
                  <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {row.map(k => (
                      <button
                        key={k}
                        onClick={() => setDialInput(p => (p ?? '') + k)}
                        style={{
                          background: '#2E3E3E', border: 'none', color: '#F7F4EE',
                          ...mono, fontSize: 18, padding: '14px 0', cursor: 'pointer',
                        }}
                      >{k}</button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Call button */}
              <div style={{ padding: '0 20px' }}>
                <button
                  disabled={!dialInput}
                  onClick={() => {
                    if (!dialInput) return
                    const digits = dialInput.replace(/\D/g, '')
                    const e164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : dialInput
                    setActiveDial({ phoneNumber: e164 })
                    setDialInput(null)
                  }}
                  style={{
                    width: '100%',
                    background: dialInput ? '#E8A020' : '#2E3E3E',
                    border: 'none', color: dialInput ? '#1C2B2B' : '#8C8070',
                    ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
                    padding: '14px 0', cursor: dialInput ? 'pointer' : 'default',
                  }}
                >CALL</button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )

  function renderBuildingRow(row: Row, indented = false) {
    const hasTask = tasksSet.has(row.parcel_id)
    const isSelected = selectedId === row.parcel_id
    const stage = row.lead?.status || 'new'
    const lastCalled = row.lead?.last_called_at
    const stageColor = STAGE_COLORS[stage] || '#C8C1B3'
    const displayScore = row.signal_score || null

    return (
      <div
        key={row.parcel_id}
        onClick={() => setSelectedId(isSelected ? null : row.parcel_id)}
        style={{
          display: 'grid',
          gridTemplateColumns: selectedId ? '44px 1fr 70px' : '44px 1fr 120px 100px 100px',
          gap: 0,
          padding: indented ? '10px 16px 10px 0' : '12px 16px',
          background: isSelected ? '#FFFFFF' : '#FFFFFF',
          borderBottom: '1px solid #C8C1B3',
          borderLeft: hasTask ? '3px solid #E8A020' : isSelected ? '3px solid #1C2B2B' : '3px solid transparent',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: isSelected ? 'inset 3px 0 0 #1C2B2B' : 'none',
        }}
      >
        <div>
          {displayScore != null ? (
            <span style={{
              ...mono, fontSize: 11, fontWeight: 700,
              display: 'inline-block',
              padding: '2px 6px',
              ...(displayScore >= 70 ? { background: '#C0392B', color: '#FFFFFF' } :
                  displayScore >= 40 ? { background: '#E8A020', color: '#1C2B2B' } :
                  displayScore > 0 ? { background: '#2E5D8E', color: '#FFFFFF' } :
                  { background: '#C8C1B3', color: '#8C8070' }),
            }}>
              {displayScore}
            </span>
          ) : (
            <span style={{ ...mono, fontSize: 10, color: '#C8C1B3' }}>—</span>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            ...mono, fontSize: 12, color: '#1C2B2B',
            fontWeight: isSelected ? 700 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {row.address}
          </div>
          <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {boroughFromParcelId(row.parcel_id)}
            {row.pm_name && !selectedId && filter === 'properties'
              ? ` · ${row.pm_name}${row.pm_confidence ? ` ${row.pm_confidence}%` : ''}`
              : ''}
          </div>
        </div>

        {selectedId ? (
          <div style={{ ...mono, fontSize: 10, color: '#8C8070', whiteSpace: 'nowrap' }}>
            {fmtDate(lastCalled)}
          </div>
        ) : (
          <div>
            <span style={{ ...mono, fontSize: 9, letterSpacing: '1px', color: '#F7F4EE', background: stageColor, padding: '2px 6px' }}>
              {stage.toUpperCase()}
            </span>
          </div>
        )}

        {!selectedId && (
          <>
            <div style={{ ...mono, fontSize: 11, color: '#8C8070' }}>{fmtDate(lastCalled)}</div>
            <div style={{ lineHeight: 1.3 }}>
              {row.open_fines_total
                ? <div style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#C0392B' }}>{fmtFines(row.open_fines_total)} open</div>
                : <div style={{ ...mono, fontSize: 10, color: '#C8C1B3' }}>—</div>}
              {row.total_fines
                ? <div style={{ ...mono, fontSize: 9, color: '#8C8070' }}>{fmtFines(row.total_fines)} total</div>
                : null}
            </div>
          </>
        )}
      </div>
    )
  }
}
