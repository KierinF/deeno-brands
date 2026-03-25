'use client'

import { useEffect, useState, useCallback } from 'react'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'

// ── Signal helpers ────────────────────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  violation_fire:           'FDNY Violation',
  permit_new_building:      'New Building Permit',
  permit_change_of_occupancy: 'Change of Occupancy',
  permit_large_renovation:  'Large Renovation',
  permit_demolition:        'Demolition Permit',
  permit_renovation_fire:   'Fire Renovation Permit',
  permit_fire_system:       'Fire System Permit',
  fire_incident_direct:     'Fire Incident (direct)',
  fire_incident_proximity:  'Fire Incident (nearby)',
  complaint_fire:           'DOB Fire Complaint',
  vacate_order:             'Vacate Order',
  license_sla:              'SLA Liquor License',
}

const CHARGE_LABELS: Record<string, string> = {
  BF20: 'Inspection & Testing — failed ITM',
  BF12: 'Fire Protection Systems',
  BF35: 'Unnecessary Alarms',
  BF17: 'Certificates of Fitness',
  BF01: 'Extinguishers & Hoses',
  BF19: 'Affidavits & Documentation',
}

const SIGNAL_WEIGHT: Record<string, number> = {
  violation_fire: 55, vacate_order: 95, fire_incident_direct: 82,
  complaint_fire: 60, permit_new_building: 72, permit_change_of_occupancy: 65,
  permit_large_renovation: 60, permit_demolition: 50, permit_renovation_fire: 35,
  permit_fire_system: 28, fire_incident_proximity: 25, license_sla: 20,
}

const CHARGE_WEIGHT: Record<string, number> = {
  BF20: 95, BF12: 88, BF35: 82, BF17: 78, BF01: 65, BF19: 40,
}

function signalWeight(sig: any): number {
  let w = SIGNAL_WEIGHT[sig.signal_type] ?? 30
  if (sig.signal_type === 'violation_fire' && sig.raw_data?.charges?.length) {
    const code = sig.raw_data.charges[0]?.code
    if (code && CHARGE_WEIGHT[code]) w = CHARGE_WEIGHT[code]
  }
  return w
}

function signalAccent(w: number) {
  if (w >= 80) return '#E8A020'
  if (w >= 60) return '#C47A15'
  if (w >= 40) return '#8C8070'
  return '#C8C1B3'
}

// ── Contact groups ────────────────────────────────────────────────────────────

const CONTACT_GROUPS = [
  { key: 'property_manager', label: 'PROPERTY MANAGER', hint: 'Primary — decision maker for service contracts' },
  { key: 'owner',            label: 'OWNER',            hint: 'Fallback if PM unknown or unresponsive' },
  { key: 'trade_referral',   label: 'TRADE REFERRALS',  hint: 'Have worked here — may know or refer the PM' },
  { key: 'permit_applicant', label: 'PERMIT APPLICANTS', hint: 'Pulled permits — possible contractor relationships' },
]

// ── Component ─────────────────────────────────────────────────────────────────

type Tab = 'contacts' | 'signals' | 'history'

export default function BuildingPanel({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('contacts')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['property_manager', 'owner']))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/outreach/building?parcel_id=${parcelId}`)
    setData(await res.json())
    setLoading(false)
  }, [parcelId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const mono = { fontFamily: "'DM Mono', monospace" }

  if (loading) return <div style={{ ...mono, fontSize: 12, color: '#8C8070', padding: 32 }}>Loading...</div>
  if (!data?.building) return <div style={{ ...mono, fontSize: 12, color: '#8C8070', padding: 32 }}>Not found.</div>

  const { building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead, orgs } = data

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  const sortedSignals = [...(signals || [])].sort((a: any, b: any) => signalWeight(b) - signalWeight(a))

  // Group individual contacts by type
  const contactsByType: Record<string, any[]> = {}
  for (const c of (contacts || [])) {
    const t = (c.contact_type || 'other').toLowerCase()
    if (!contactsByType[t]) contactsByType[t] = []
    contactsByType[t].push(c)
  }

  // PM org from organizations table (for "company only" calling)
  const pmOrg = (orgs || []).find((o: any) =>
    o.management_signal_type === 'owner_record' ||
    o.org_type === 'manager' ||
    (building.pm_name && o.business_name?.toUpperCase().includes(building.pm_name?.substring(0, 8).toUpperCase()))
  )
  const pmOrgPhones = pmOrg
    ? (phoneNumbers || []).filter((p: any) => p.org_id === pmOrg.id)
    : []

  const toggleGroup = (key: string) => setExpandedGroups(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n
  })

  const renderContactCard = (contact: any) => {
    const cphones = (phoneNumbers || []).filter((p: any) => p.contact_id === contact.id)
    const name = contact.first_name
      ? `${contact.first_name} ${contact.last_name || ''}`.trim()
      : contact.business_name || 'Unknown'
    const isOrgOnly = !contact.first_name && !!contact.business_name

    return (
      <div key={contact.id} style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ ...mono, fontSize: 12, color: '#1C2B2B' }}>{name}</span>
            {isOrgOnly && (
              <span style={{ ...mono, fontSize: 8, color: '#E8A020', border: '1px solid #E8A020', padding: '1px 5px' }}>
                COMPANY ONLY
              </span>
            )}
          </div>
          {contact.confidence && (
            <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>{contact.confidence}% confidence</span>
          )}
          {isOrgOnly && (
            <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 4, lineHeight: 1.5 }}>
              No individual identified — call main line and ask for the facilities manager.
            </div>
          )}
        </div>
        <PhoneNumberManager
          parcelId={parcelId}
          numbers={cphones}
          onUpdate={null}
          dialerProps={{ parcelId, contactId: contact.id, contactName: name, buildingAddress: building.address, signalBrief, leadId: lead?.id ?? null }}
        />
      </div>
    )
  }

  // ── CONTACTS TAB ────────────────────────────────────────────────────────────
  const ContactsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {CONTACT_GROUPS.map(({ key, label, hint }) => {
        const group = contactsByType[key] || []
        const showPmCompany = key === 'property_manager' && building.pm_name

        if (group.length === 0 && !showPmCompany) return null

        const isExpanded = expandedGroups.has(key)
        const COLLAPSE_AFTER = (key === 'trade_referral' || key === 'permit_applicant') ? 2 : 99
        const visible = isExpanded ? group : group.slice(0, COLLAPSE_AFTER)
        const hidden = group.length - visible.length

        return (
          <section key={key}>
            <button
              onClick={() => toggleGroup(key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 6px 0', borderBottom: '2px solid #1C2B2B', marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>
                  {label}
                </span>
                <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>
                  {group.length + (showPmCompany && group.filter((c: any) => !c.first_name).length === 0 ? 1 : 0)}
                </span>
              </div>
              <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <>
                <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginBottom: 10, lineHeight: 1.5 }}>{hint}</div>

                {/* PM company from building_intelligence — always show in PM section */}
                {showPmCompany && (
                  <div style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ ...mono, fontSize: 12, color: '#1C2B2B' }}>{building.pm_name}</span>
                      <span style={{ ...mono, fontSize: 8, color: '#8C8070', border: '1px solid #C8C1B3', padding: '1px 5px' }}>
                        PM ORG
                      </span>
                      {building.pm_confidence && (
                        <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>{building.pm_confidence}% conf</span>
                      )}
                    </div>
                    {group.length === 0 && (
                      <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginBottom: 8, lineHeight: 1.5 }}>
                        No individual contact identified. Add the main office number to call in.
                      </div>
                    )}
                    <PhoneNumberManager
                      parcelId={parcelId}
                      numbers={pmOrgPhones}
                      onUpdate={null}
                      dialerProps={pmOrg ? {
                        parcelId,
                        contactId: pmOrg.id,
                        contactName: building.pm_name,
                        buildingAddress: building.address,
                        signalBrief,
                        leadId: lead?.id ?? null,
                      } : undefined}
                    />
                  </div>
                )}

                {visible.map(renderContactCard)}

                {hidden > 0 && (
                  <button onClick={() => toggleGroup(key)} style={{ ...mono, fontSize: 10, color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    + {hidden} more
                  </button>
                )}
              </>
            )}
          </section>
        )
      })}

      {contacts?.length === 0 && !building.pm_name && (
        <div style={{ ...mono, fontSize: 12, color: '#8C8070' }}>No contacts found.</div>
      )}
    </div>
  )

  // ── SIGNALS TAB ─────────────────────────────────────────────────────────────
  const SignalsTab = () => {
    const openSignals = sortedSignals.filter((s: any) => s.is_open)
    const closedSignals = sortedSignals.filter((s: any) => !s.is_open)

    const renderSignal = (sig: any, i: number) => {
      const w = signalWeight(sig)
      const charges = sig.raw_data?.charges || []
      const primaryCharge = charges[0]
      const rawAddr = sig.raw_data?.address
      const addrTokens = building.address?.split(' ').slice(0, 2).join(' ').toUpperCase()
      const isThisBuilding = !rawAddr || rawAddr.toUpperCase().includes(addrTokens)

      return (
        <div key={sig.id || i} style={{
          display: 'flex', gap: 10, padding: '10px 12px',
          background: '#FFFFFF', border: '1px solid #C8C1B3',
          borderLeft: `3px solid ${signalAccent(w)}`,
          marginBottom: 4,
          opacity: isThisBuilding ? 1 : 0.45,
        }}>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: signalAccent(w), minWidth: 26, textAlign: 'right', flexShrink: 0, paddingTop: 1 }}>
            {w}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ ...mono, fontSize: 10, color: '#1C2B2B' }}>{SIGNAL_LABELS[sig.signal_type] || sig.signal_type}</span>
              {primaryCharge?.code && (
                <span style={{ ...mono, fontSize: 9, color: '#E8A020', fontWeight: 700 }}>{primaryCharge.code}</span>
              )}
              {!isThisBuilding && (
                <span style={{ ...mono, fontSize: 8, color: '#C0392B', border: '1px solid #C0392B', padding: '1px 4px' }}>WRONG ADDR</span>
              )}
            </div>
            {primaryCharge && (
              <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginBottom: 2 }}>
                {CHARGE_LABELS[primaryCharge.code] || primaryCharge.description}
                {primaryCharge.amount ? ` · $${Number(primaryCharge.amount).toLocaleString()} fine` : ''}
              </div>
            )}
            {!primaryCharge && sig.raw_data?.job_type && (
              <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginBottom: 2 }}>
                {sig.raw_data.job_type}{sig.raw_data.filing_status ? ` · ${sig.raw_data.filing_status}` : ''}
              </div>
            )}
            <div style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>
              {sig.signal_date ? new Date(sig.signal_date).toLocaleDateString() : ''}
              {rawAddr && !isThisBuilding ? ` · from ${rawAddr}` : ''}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Incumbent — competitive intel */}
        {building.incumbent_name && (
          <section>
            <div style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>
              INCUMBENT
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ ...mono, fontSize: 12, color: '#1C2B2B' }}>{building.incumbent_name}</span>
                {building.incumbent_staleness && (
                  <span style={{
                    ...mono, fontSize: 8, letterSpacing: '1px', padding: '2px 6px',
                    color: building.incumbent_staleness === 'very_stale' ? '#E8A020' : '#8C8070',
                    border: `1px solid ${building.incumbent_staleness === 'very_stale' ? '#E8A020' : '#8C8070'}`,
                  }}>
                    {building.incumbent_staleness.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              {building.incumbent_last_job && (
                <div style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                  Last job: {new Date(building.incumbent_last_job).toLocaleDateString()}
                  {building.incumbent_n_jobs ? ` · ${building.incumbent_n_jobs} jobs on record` : ''}
                </div>
              )}
              <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 4, fontStyle: 'italic' }}>
                Competitive intel — this is who you're displacing.
              </div>
            </div>
          </section>
        )}

        {/* Open signals */}
        {openSignals.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>
              <span style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>OPEN SIGNALS</span>
              <span style={{ ...mono, fontSize: 9, color: '#E8A020' }}>{openSignals.length}</span>
              <span style={{ ...mono, fontSize: 9, color: '#8C8070' }}>— still unresolved, active legal obligation</span>
            </div>
            {openSignals.map(renderSignal)}
          </section>
        )}

        {/* Closed signals */}
        {closedSignals.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #C8C1B3', marginBottom: 10 }}>
              <span style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#8C8070', fontWeight: 700 }}>CLOSED SIGNALS</span>
              <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>{closedSignals.length}</span>
              <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>— resolved but show pattern</span>
            </div>
            {closedSignals.map(renderSignal)}
          </section>
        )}

        {sortedSignals.length === 0 && (
          <div style={{ ...mono, fontSize: 12, color: '#8C8070' }}>No signals found.</div>
        )}
      </div>
    )
  }

  // ── HISTORY TAB ─────────────────────────────────────────────────────────────
  const HistoryTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section>
        <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
        <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
          <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
        </div>
      </section>
      <section>
        <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>TASKS</div>
        <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
          <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
        </div>
      </section>
      <section style={{ paddingBottom: 40 }}>
        <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>ACTIVITY LOG</div>
        <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
          {activityLog?.length > 0 ? (
            <div>
              {activityLog.map((entry: any, i: number) => (
                <div key={entry.id} style={{ padding: '10px 0', borderBottom: i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      ...mono, fontSize: 9, color: '#F7F4EE', padding: '2px 7px',
                      background: entry.outcome === 'connected' ? '#1C2B2B' : entry.outcome === 'voicemail' ? '#8C8070' : '#C8C1B3',
                    }}>
                      {entry.outcome?.toUpperCase() || 'CALL'}
                    </span>
                    <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                      {entry.contacted_at ? new Date(entry.contacted_at).toLocaleString() : ''}
                    </span>
                    {entry.duration_secs && (
                      <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                        {Math.floor(entry.duration_secs / 60)}m{entry.duration_secs % 60}s
                      </span>
                    )}
                  </div>
                  {entry.notes && <div style={{ ...mono, fontSize: 11, color: '#1C2B2B', lineHeight: 1.6, marginBottom: 6 }}>{entry.notes}</div>}
                  <TranscriptViewer transcript={entry.transcript || null} recordingUrl={entry.recording_url || null} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 11, color: '#8C8070' }}>No activity yet.</div>
          )}
        </div>
      </section>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        background: '#1C2B2B', padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #2E3E3E', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {building.signal_score != null && (
            <span style={{
              ...mono, fontSize: 11, fontWeight: 700, padding: '3px 8px', flexShrink: 0,
              background: building.signal_score >= 80 ? '#E8A020' : building.signal_score >= 50 ? '#4A6060' : '#2E3E3E',
              color: building.signal_score >= 80 ? '#1C2B2B' : '#F7F4EE',
            }}>
              {building.signal_score}
            </span>
          )}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '2px',
            color: '#F7F4EE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {building.address}
          </h2>
        </div>
        <button onClick={onClose} title="Esc" style={{
          ...mono, fontSize: 18, color: '#8C8070', background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 8px', lineHeight: 1, flexShrink: 0,
        }}>×</button>
      </div>

      {/* Stage */}
      <div style={{ flexShrink: 0 }}>
        <StagePipeline parcelId={parcelId} initialStage={lead?.status ?? 'new'} leadId={lead?.id ?? null} />
      </div>

      {/* Quick stats */}
      <div style={{
        background: '#FFFFFF', borderBottom: '1px solid #C8C1B3',
        padding: '8px 20px', display: 'flex', gap: 20, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {[
          { label: 'VIOLATIONS', value: building.open_violation_count ?? 0, big: true, accent: building.open_violation_count > 0 },
          { label: 'LAST SIGNAL', value: building.last_signal_date ? new Date(building.last_signal_date).toLocaleDateString() : '—' },
          { label: 'PM', value: building.pm_name || '—', sub: building.pm_confidence ? `${building.pm_confidence}% conf` : null },
          { label: 'SIZE', value: building.building_sqft ? `${Math.round(building.building_sqft / 1000)}k sqft` : '—', sub: building.floors ? `${building.floors} fl` : null },
        ].map((item: any) => (
          <div key={item.label}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 1 }}>{item.label}</div>
            <div style={{
              fontFamily: item.big ? "'Bebas Neue', sans-serif" : "'DM Mono', monospace",
              fontSize: item.big ? 20 : 11,
              color: item.accent ? '#E8A020' : '#1C2B2B',
              lineHeight: 1,
            }}>{item.value}</div>
            {item.sub && <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginTop: 1 }}>{item.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: '#F7F4EE',
        borderBottom: '1px solid #C8C1B3', flexShrink: 0,
      }}>
        {([['contacts', 'CONTACTS'], ['signals', 'SIGNALS'], ['history', 'HISTORY']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px 0',
              ...mono, fontSize: 10, letterSpacing: '1.5px',
              color: tab === key ? '#1C2B2B' : '#8C8070',
              background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #1C2B2B' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === key ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {tab === 'contacts' && <ContactsTab />}
        {tab === 'signals'  && <SignalsTab />}
        {tab === 'history'  && <HistoryTab />}
      </div>
    </div>
  )
}
