'use client'

import { useEffect, useState, useCallback } from 'react'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'

// ── Signal helpers ────────────────────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  violation_fire: 'FDNY Violation',
  permit_new_building: 'New Building Permit',
  permit_change_of_occupancy: 'Change of Occupancy',
  permit_large_renovation: 'Large Renovation',
  permit_demolition: 'Demolition Permit',
  permit_renovation_fire: 'Fire Renovation Permit',
  permit_fire_system: 'Fire System Permit',
  fire_incident_direct: 'Fire Incident (direct)',
  fire_incident_proximity: 'Fire Incident (nearby)',
  complaint_fire: 'DOB Fire Complaint',
  vacate_order: 'Vacate Order',
  license_sla: 'SLA Liquor License',
}

const CHARGE_LABELS: Record<string, string> = {
  BF20: 'Inspection & Testing',
  BF12: 'Fire Protection Systems',
  BF35: 'Unnecessary Alarms',
  BF17: 'Certificates of Fitness',
  BF01: 'Extinguishers & Hoses',
  BF19: 'Affidavits & Documentation',
}

const SIGNAL_WEIGHT: Record<string, number> = {
  violation_fire: 55,
  vacate_order: 95,
  fire_incident_direct: 82,
  complaint_fire: 60,
  permit_new_building: 72,
  permit_change_of_occupancy: 65,
  permit_large_renovation: 60,
  permit_demolition: 50,
  permit_renovation_fire: 35,
  permit_fire_system: 28,
  fire_incident_proximity: 25,
  license_sla: 20,
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

function signalColor(w: number) {
  if (w >= 80) return '#E8A020'
  if (w >= 60) return '#C47A15'
  if (w >= 40) return '#8C8070'
  return '#C8C1B3'
}

// ── Contact grouping ───────────────────────────────────────────────────────────

const CONTACT_GROUPS = [
  { key: 'property_manager', label: 'PROPERTY MANAGER', hint: 'Primary decision maker for service contracts' },
  { key: 'owner', label: 'OWNER', hint: 'Fallback if no PM identified' },
  { key: 'trade_referral', label: 'TRADE REFERRALS', hint: 'Have worked here — may know the PM or refer' },
  { key: 'permit_applicant', label: 'PERMIT APPLICANTS', hint: 'Pulled permits — possible contractor relationships' },
]

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  parcelId: string
  onClose: () => void
}

export default function BuildingPanel({ parcelId, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['property_manager', 'owner']))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/outreach/building?parcel_id=${parcelId}`)
    const json = await res.json()
    setData(json)
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

  const { building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead } = data

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  // Sort signals by weight desc
  const sortedSignals = [...(signals || [])].sort((a: any, b: any) => signalWeight(b) - signalWeight(a))

  // Group contacts by type
  const contactsByType: Record<string, any[]> = {}
  for (const c of (contacts || [])) {
    const t = (c.contact_type || 'other').toLowerCase()
    if (!contactsByType[t]) contactsByType[t] = []
    contactsByType[t].push(c)
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const renderContact = (contact: any) => {
    const cphones = (phoneNumbers || []).filter((p: any) => p.contact_id === contact.id)
    const name = contact.first_name
      ? `${contact.first_name} ${contact.last_name || ''}`.trim()
      : contact.business_name || 'Unknown'
    const isOrgOnly = !contact.first_name && !!contact.business_name

    return (
      <div key={contact.id} style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
        <div style={{ marginBottom: isOrgOnly ? 6 : 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ ...mono, fontSize: 12, color: '#1C2B2B' }}>{name}</span>
            {isOrgOnly && (
              <span style={{ ...mono, fontSize: 8, letterSpacing: '1px', color: '#E8A020', border: '1px solid #E8A020', padding: '1px 5px' }}>
                COMPANY ONLY
              </span>
            )}
          </div>
          {contact.confidence && (
            <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>{contact.confidence}% confidence</span>
          )}
          {isOrgOnly && (
            <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 4, lineHeight: 1.5 }}>
              No individual identified. Call main line and ask for the facilities or property manager.
            </div>
          )}
        </div>
        <PhoneNumberManager
          parcelId={parcelId}
          numbers={cphones}
          onUpdate={null}
          dialerProps={{
            parcelId,
            contactId: contact.id,
            contactName: name,
            buildingAddress: building.address,
            signalBrief,
            leadId: lead?.id ?? null,
          }}
        />
      </div>
    )
  }

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
        <button onClick={onClose} title="Close (Esc)" style={{
          ...mono, fontSize: 18, color: '#8C8070', background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 8px', lineHeight: 1, flexShrink: 0,
        }}>×</button>
      </div>

      {/* Stage pipeline */}
      <div style={{ flexShrink: 0 }}>
        <StagePipeline parcelId={parcelId} initialStage={lead?.status ?? 'new'} leadId={lead?.id ?? null} />
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#FFFFFF', borderBottom: '1px solid #C8C1B3',
        padding: '10px 20px', display: 'flex', gap: 20, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {[
          { label: 'VIOLATIONS', value: building.open_violation_count ?? 0, accent: building.open_violation_count > 0 },
          { label: 'LAST SIGNAL', value: building.last_signal_date ? new Date(building.last_signal_date).toLocaleDateString() : '—' },
          { label: 'PM', value: building.pm_name || '—', sub: building.pm_confidence ? `${building.pm_confidence}% conf` : null },
          { label: 'INCUMBENT', value: building.incumbent_name || '—', sub: building.incumbent_staleness },
          ...(building.building_sqft ? [{ label: 'SIZE', value: `${Number(building.building_sqft).toLocaleString()} sqft`, sub: building.floors ? `${building.floors} fl` : null }] : []),
        ].map((item: any) => (
          <div key={item.label}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>{item.label}</div>
            <div style={{
              fontFamily: item.label === 'VIOLATIONS' ? "'Bebas Neue', sans-serif" : "'DM Mono', monospace",
              fontSize: item.label === 'VIOLATIONS' ? 22 : 11,
              color: item.accent ? '#E8A020' : '#1C2B2B',
              lineHeight: 1,
            }}>
              {item.value}
            </div>
            {item.sub && <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginTop: 2 }}>{item.sub}</div>}
          </div>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* SIGNALS */}
        {sortedSignals.length > 0 && (
          <section>
            <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 10 }}>
              SIGNALS ({sortedSignals.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortedSignals.map((sig: any, i: number) => {
                const w = signalWeight(sig)
                const charges = sig.raw_data?.charges || []
                const primaryCharge = charges[0]
                const rawAddr = sig.raw_data?.address
                const isThisBuilding = !rawAddr || rawAddr.toUpperCase().includes(building.address?.split(' ').slice(0, 2).join(' ').toUpperCase())
                return (
                  <div key={sig.id || i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #C8C1B3',
                    borderLeft: `3px solid ${signalColor(w)}`,
                    opacity: isThisBuilding ? 1 : 0.5,
                  }}>
                    <div style={{
                      ...mono, fontSize: 10, fontWeight: 700, color: signalColor(w),
                      minWidth: 24, textAlign: 'right', flexShrink: 0,
                    }}>
                      {w}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ ...mono, fontSize: 10, color: '#1C2B2B' }}>
                          {SIGNAL_LABELS[sig.signal_type] || sig.signal_type}
                        </span>
                        {primaryCharge?.code && (
                          <span style={{ ...mono, fontSize: 9, color: '#E8A020', letterSpacing: '1px' }}>
                            {primaryCharge.code}
                          </span>
                        )}
                        {sig.is_open ? (
                          <span style={{ ...mono, fontSize: 8, color: '#E8A020', border: '1px solid #E8A020', padding: '1px 4px' }}>OPEN</span>
                        ) : (
                          <span style={{ ...mono, fontSize: 8, color: '#C8C1B3', border: '1px solid #C8C1B3', padding: '1px 4px' }}>CLOSED</span>
                        )}
                        {!isThisBuilding && (
                          <span style={{ ...mono, fontSize: 8, color: '#C0392B', border: '1px solid #C0392B', padding: '1px 4px' }}>WRONG ADDR</span>
                        )}
                      </div>
                      {primaryCharge && (
                        <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 2 }}>
                          {CHARGE_LABELS[primaryCharge.code] || primaryCharge.description}
                          {primaryCharge.amount ? ` · $${Number(primaryCharge.amount).toLocaleString()}` : ''}
                        </div>
                      )}
                      {!primaryCharge && sig.raw_data?.job_type && (
                        <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginTop: 2 }}>
                          {sig.raw_data.job_type}{sig.raw_data.filing_status ? ` · ${sig.raw_data.filing_status}` : ''}
                        </div>
                      )}
                      <div style={{ ...mono, fontSize: 9, color: '#C8C1B3', marginTop: 2 }}>
                        {sig.signal_date ? new Date(sig.signal_date).toLocaleDateString() : ''}
                        {rawAddr && !isThisBuilding ? ` · ${rawAddr}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* CONTACTS — grouped */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 10 }}>CONTACTS</div>

          {CONTACT_GROUPS.map(({ key, label, hint }) => {
            const group = contactsByType[key] || []
            const hasPmFallback = key === 'property_manager' && group.length === 0 && building.pm_name
            if (group.length === 0 && !hasPmFallback) return null

            const isExpanded = expandedGroups.has(key)
            const COLLAPSE_AFTER = (key === 'property_manager' || key === 'owner') ? 99 : 2
            const visible = isExpanded ? group : group.slice(0, COLLAPSE_AFTER)
            const hidden = group.length - visible.length

            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <button
                  onClick={() => toggleGroup(key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 0 6px 0', borderBottom: '1px solid #C8C1B3', marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>
                      {label}
                    </span>
                    <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>
                      {hasPmFallback ? '1' : group.length}
                    </span>
                  </div>
                  <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {isExpanded && (
                  <>
                    <div style={{ ...mono, fontSize: 9, color: '#8C8070', marginBottom: 8 }}>{hint}</div>

                    {/* PM fallback — company only from building_intelligence */}
                    {hasPmFallback && (
                      <div style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ ...mono, fontSize: 12, color: '#1C2B2B' }}>{building.pm_name}</span>
                          <span style={{ ...mono, fontSize: 8, letterSpacing: '1px', color: '#E8A020', border: '1px solid #E8A020', padding: '1px 5px' }}>
                            COMPANY ONLY
                          </span>
                        </div>
                        {building.pm_confidence && (
                          <div style={{ ...mono, fontSize: 9, color: '#C8C1B3', marginBottom: 6 }}>{building.pm_confidence}% confidence</div>
                        )}
                        <div style={{ ...mono, fontSize: 10, color: '#8C8070', marginBottom: 8, lineHeight: 1.5 }}>
                          No individual identified. Call main line and ask for the facilities or property manager.
                        </div>
                        <PhoneNumberManager
                          parcelId={parcelId}
                          numbers={(phoneNumbers || []).filter((p: any) => !p.contact_id)}
                          onUpdate={null}
                        />
                      </div>
                    )}

                    {visible.map(renderContact)}

                    {hidden > 0 && (
                      <button
                        onClick={() => toggleGroup(key)}
                        style={{
                          ...mono, fontSize: 10, color: '#E8A020', background: 'none',
                          border: 'none', cursor: 'pointer', padding: '4px 0',
                        }}
                      >
                        + {hidden} more
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </section>

        {/* NOTES */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
          </div>
        </section>

        {/* TASKS */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>TASKS</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
          </div>
        </section>

        {/* ACTIVITY */}
        <section style={{ paddingBottom: 40 }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>ACTIVITY</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            {activityLog?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activityLog.map((entry: any, i: number) => (
                  <div key={entry.id} style={{ padding: '10px 0', borderBottom: i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        ...mono, fontSize: 9, letterSpacing: '1px', color: '#F7F4EE', padding: '2px 7px',
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
                    {entry.notes && (
                      <div style={{ ...mono, fontSize: 11, color: '#1C2B2B', lineHeight: 1.6, marginBottom: 6 }}>{entry.notes}</div>
                    )}
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
    </div>
  )
}
