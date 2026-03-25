'use client'

import { useEffect, useState, useCallback } from 'react'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'

// ── Signal config ─────────────────────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  violation_fire:             'FDNY Violation',
  permit_new_building:        'New Building Permit',
  permit_change_of_occupancy: 'Change of Occupancy',
  permit_large_renovation:    'Large Renovation',
  permit_demolition:          'Demolition Permit',
  permit_renovation_fire:     'Fire Renovation Permit',
  permit_fire_system:         'Fire System Permit',
  fire_incident_direct:       'Fire Incident (direct)',
  fire_incident_proximity:    'Fire Incident (nearby)',
  complaint_fire:             'DOB Fire Complaint',
  vacate_order:               'Vacate Order',
  license_sla:                'SLA Liquor License',
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

// Signals that are NOT useful when closed
const DROP_IF_CLOSED = new Set([
  'permit_new_building', 'permit_change_of_occupancy', 'permit_large_renovation',
  'permit_demolition', 'permit_renovation_fire', 'permit_fire_system', 'license_sla',
])

// Permits where "approved/permit entire" means contractor already engaged
const CONTRACTOR_ENGAGED_STATUSES = new Set(['permit entire', 'approved', 'permit signed off'])

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

// ── Normalization for company matching ────────────────────────────────────────

function normalizeName(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/\b(llc|lp|llp|inc|corp|corporation|ltd|limited|co|company|pllc|trust|assoc|associates?)\b\.?/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20)
}

// ── Contact group config ──────────────────────────────────────────────────────

const CONTACT_GROUPS = [
  { key: 'property_manager', label: 'PROPERTY MANAGERS', hint: 'Primary — decision makers for service contracts' },
  { key: 'owner',            label: 'OWNERS',            hint: 'Fallback if PM unknown or unresponsive' },
  { key: 'trade_referral',   label: 'TRADE REFERRALS',   hint: 'Have worked here — may know or refer the PM' },
  { key: 'permit_applicant', label: 'PERMIT APPLICANTS', hint: 'Pulled permits — possible contractor relationships' },
]

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'main' | 'signals'

export default function BuildingPanel({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('main')
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

  const m = { fontFamily: "'DM Mono', monospace" }

  if (loading) return <div style={{ ...m, fontSize: 12, color: '#8C8070', padding: 32 }}>Loading...</div>
  if (!data?.building) return <div style={{ ...m, fontSize: 12, color: '#8C8070', padding: 32 }}>Not found.</div>

  const { building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead, orgs } = data

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  // Filter signals: drop closed permits, keep closed violations + fire incidents
  const usefulSignals = (signals || []).filter((s: any) => {
    if (!s.is_open && DROP_IF_CLOSED.has(s.signal_type)) return false
    return true
  }).sort((a: any, b: any) => signalWeight(b) - signalWeight(a))

  const openSignals = usefulSignals.filter((s: any) => s.is_open)
  const closedSignals = usefulSignals.filter((s: any) => !s.is_open)

  // Group contacts by type, then sub-group by company
  const contactsByType: Record<string, any[]> = {}
  for (const c of (contacts || [])) {
    const t = (c.contact_type || 'other').toLowerCase()
    if (!contactsByType[t]) contactsByType[t] = []
    contactsByType[t].push(c)
  }

  // Match orgs to contacts by normalized name
  const orgsByNorm: Record<string, any> = {}
  for (const o of (orgs || [])) {
    const k = normalizeName(o.business_name || '')
    if (k) orgsByNorm[k] = o
  }

  function findOrgForName(name: string) {
    if (!name) return null
    const k = normalizeName(name)
    if (orgsByNorm[k]) return orgsByNorm[k]
    // Partial match — find org whose norm key starts with same 12 chars
    const prefix = k.substring(0, 12)
    if (prefix.length < 6) return null
    return Object.entries(orgsByNorm).find(([ok]) => ok.startsWith(prefix) || prefix.startsWith(ok.substring(0, 12)))?.[1] ?? null
  }

  const toggleGroup = (key: string) => setExpandedGroups(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n
  })

  // ── Render a company block with contacts underneath ──────────────────────────

  const renderCompanyBlock = (companyName: string, contactList: any[], fallbackOrg?: any) => {
    const org = findOrgForName(companyName) || fallbackOrg
    const orgPhones = org
      ? (phoneNumbers || []).filter((p: any) => p.org_id === org.id)
      : []
    const noIndividuals = contactList.every((c: any) => !c.first_name)

    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', marginBottom: 10 }}>
        {/* Company header */}
        <div style={{ padding: '10px 14px', borderBottom: contactList.length > 0 ? '1px solid #E8EDE8' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ ...m, fontSize: 11, color: '#1C2B2B', fontWeight: 700 }}>{companyName}</span>
            {org?.phone && (
              <span style={{ ...m, fontSize: 9, color: '#8C8070' }}>{org.phone}</span>
            )}
          </div>
          {/* Company phone manager */}
          <PhoneNumberManager
            parcelId={parcelId}
            numbers={org?.phone && orgPhones.length === 0
              ? [{ id: `org-${org.id}`, parcel_id: parcelId, number: org.phone, source: 'enriched', status: 'active', org_id: org.id }]
              : orgPhones
            }
            onUpdate={null}
            dialerProps={org ? {
              parcelId,
              contactId: org.id,
              contactName: companyName,
              buildingAddress: building.address,
              signalBrief,
              leadId: lead?.id ?? null,
            } : undefined}
          />
          {!org?.phone && orgPhones.length === 0 && (
            <div style={{ ...m, fontSize: 9, color: '#8C8070', marginTop: 4 }}>
              No company number — add the main line below
            </div>
          )}
          {noIndividuals && (
            <div style={{ ...m, fontSize: 9, color: '#8C8070', marginTop: 4 }}>
              No individual contacts identified
            </div>
          )}
        </div>

        {/* Individual contacts */}
        {contactList.filter((c: any) => c.first_name || !c.business_name).map((contact: any) => {
          const cphones = (phoneNumbers || []).filter((p: any) => p.contact_id === contact.id)
          const name = contact.first_name
            ? `${contact.first_name} ${contact.last_name || ''}`.trim()
            : contact.business_name || 'Unknown'
          return (
            <div key={contact.id} style={{ padding: '8px 14px 8px 24px', borderBottom: '1px solid #F0EDE8' }}>
              <div style={{ ...m, fontSize: 11, color: '#1C2B2B', marginBottom: 6 }}>
                {name}
                {contact.confidence && (
                  <span style={{ ...m, fontSize: 9, color: '#C8C1B3', marginLeft: 8 }}>{contact.confidence}%</span>
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
        })}
      </div>
    )
  }

  // ── Contacts section ─────────────────────────────────────────────────────────

  const ContactsSection = () => (
    <div>
      {CONTACT_GROUPS.map(({ key, label, hint }) => {
        const group = contactsByType[key] || []
        const showPmOrg = key === 'property_manager' && building.pm_name

        if (group.length === 0 && !showPmOrg) return null

        const isExpanded = expandedGroups.has(key)
        const COLLAPSE_AT = (key === 'trade_referral' || key === 'permit_applicant') ? 2 : 99

        // Group by company name
        const byCompany: Record<string, any[]> = {}
        const standalone: any[] = []
        for (const c of group) {
          if (c.business_name) {
            if (!byCompany[c.business_name]) byCompany[c.business_name] = []
            byCompany[c.business_name].push(c)
          } else {
            standalone.push(c)
          }
        }
        const companies = Object.entries(byCompany)
        const allEntries = [...companies.map(([name, cs]) => ({ type: 'company', name, contacts: cs })),
                           ...standalone.map(c => ({ type: 'person', contact: c }))]
        const visible = isExpanded ? allEntries : allEntries.slice(0, COLLAPSE_AT)
        const hidden = allEntries.length - visible.length

        return (
          <div key={key} style={{ marginBottom: 16 }}>
            <button onClick={() => toggleGroup(key)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 6px 0', borderBottom: '2px solid #1C2B2B', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>{label}</span>
                <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>{allEntries.length + (showPmOrg ? 1 : 0)}</span>
              </div>
              <span style={{ ...m, fontSize: 10, color: '#8C8070' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <>
                <div style={{ ...m, fontSize: 9, color: '#8C8070', marginBottom: 8, lineHeight: 1.5 }}>{hint}</div>

                {/* PM org from building_intelligence (when no PM contacts exist) */}
                {showPmOrg && group.length === 0 && renderCompanyBlock(building.pm_name, [])}

                {/* Company blocks */}
                {visible.map((entry: any, i) =>
                  entry.type === 'company'
                    ? <div key={entry.name + i}>{renderCompanyBlock(entry.name, entry.contacts)}</div>
                    : <div key={entry.contact.id} style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
                        <div style={{ ...m, fontSize: 11, color: '#1C2B2B', marginBottom: 6 }}>
                          {entry.contact.first_name} {entry.contact.last_name || ''}
                          {entry.contact.confidence && <span style={{ ...m, fontSize: 9, color: '#C8C1B3', marginLeft: 8 }}>{entry.contact.confidence}%</span>}
                        </div>
                        <PhoneNumberManager
                          parcelId={parcelId}
                          numbers={(phoneNumbers || []).filter((p: any) => p.contact_id === entry.contact.id)}
                          onUpdate={null}
                          dialerProps={{ parcelId, contactId: entry.contact.id, contactName: `${entry.contact.first_name} ${entry.contact.last_name || ''}`.trim(), buildingAddress: building.address, signalBrief, leadId: lead?.id ?? null }}
                        />
                      </div>
                )}

                {hidden > 0 && (
                  <button onClick={() => toggleGroup(key)} style={{ ...m, fontSize: 10, color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    + {hidden} more
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
      {contacts?.length === 0 && !building.pm_name && (
        <div style={{ ...m, fontSize: 12, color: '#8C8070' }}>No contacts found.</div>
      )}
    </div>
  )

  // ── Signals tab ──────────────────────────────────────────────────────────────

  const renderSignalRow = (sig: any, i: number) => {
    const w = signalWeight(sig)
    const charges = sig.raw_data?.charges || []
    const charge = charges[0]
    const rawAddr = sig.raw_data?.address
    const addrPrefix = (building.address || '').split(' ').slice(0, 2).join(' ').toUpperCase()
    const isThisBuilding = !rawAddr || rawAddr.toUpperCase().includes(addrPrefix)
    const filingStatus = (sig.raw_data?.filing_status || '').toLowerCase()
    const contractorEngaged = sig.signal_type === 'permit_renovation_fire' && CONTRACTOR_ENGAGED_STATUSES.has(filingStatus)

    return (
      <div key={sig.id || i} style={{
        display: 'flex', gap: 10, padding: '10px 12px',
        background: '#FFFFFF', border: '1px solid #C8C1B3',
        borderLeft: `3px solid ${contractorEngaged ? '#C8C1B3' : signalAccent(w)}`,
        marginBottom: 4, opacity: isThisBuilding ? 1 : 0.4,
      }}>
        <div style={{ ...m, fontSize: 11, fontWeight: 700, color: contractorEngaged ? '#C8C1B3' : signalAccent(w), minWidth: 24, textAlign: 'right', flexShrink: 0, paddingTop: 1 }}>
          {w}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ ...m, fontSize: 10, color: '#1C2B2B' }}>{SIGNAL_LABELS[sig.signal_type] || sig.signal_type}</span>
            {charge?.code && <span style={{ ...m, fontSize: 9, color: '#E8A020', fontWeight: 700 }}>{charge.code}</span>}
            {contractorEngaged && <span style={{ ...m, fontSize: 8, color: '#8C8070', border: '1px solid #C8C1B3', padding: '1px 4px' }}>CONTRACTOR ON SITE</span>}
            {!isThisBuilding && <span style={{ ...m, fontSize: 8, color: '#C0392B', border: '1px solid #C0392B', padding: '1px 4px' }}>WRONG ADDR</span>}
          </div>
          {charge && (
            <div style={{ ...m, fontSize: 10, color: '#8C8070', marginBottom: 2 }}>
              {CHARGE_LABELS[charge.code] || charge.description}
              {charge.amount ? ` · $${Number(charge.amount).toLocaleString()} fine` : ''}
            </div>
          )}
          {!charge && sig.raw_data?.job_type && (
            <div style={{ ...m, fontSize: 10, color: '#8C8070', marginBottom: 2 }}>
              {sig.raw_data.job_type}{filingStatus ? ` · ${sig.raw_data.filing_status}` : ''}
            </div>
          )}
          <div style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>
            {sig.signal_date ? new Date(sig.signal_date).toLocaleDateString() : ''}
            {rawAddr && !isThisBuilding ? ` · from ${rawAddr}` : ''}
          </div>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: '#1C2B2B', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {building.signal_score != null && (
            <span style={{ ...m, fontSize: 11, fontWeight: 700, padding: '3px 8px', flexShrink: 0, background: building.signal_score >= 80 ? '#E8A020' : building.signal_score >= 50 ? '#4A6060' : '#2E3E3E', color: building.signal_score >= 80 ? '#1C2B2B' : '#F7F4EE' }}>
              {building.signal_score}
            </span>
          )}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '2px', color: '#F7F4EE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {building.address}
          </h2>
        </div>
        <button onClick={onClose} title="Esc" style={{ ...m, fontSize: 18, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, flexShrink: 0 }}>×</button>
      </div>

      {/* Stage */}
      <div style={{ flexShrink: 0 }}>
        <StagePipeline parcelId={parcelId} initialStage={lead?.status ?? 'new'} leadId={lead?.id ?? null} />
      </div>

      {/* Stats bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #C8C1B3', padding: '8px 20px', display: 'flex', gap: 20, flexWrap: 'wrap', flexShrink: 0 }}>
        {[
          { label: 'VIOLATIONS', value: building.open_violation_count ?? 0, big: true, accent: building.open_violation_count > 0 },
          { label: 'LAST SIGNAL', value: building.last_signal_date ? new Date(building.last_signal_date).toLocaleDateString() : '—' },
          { label: 'PM', value: building.pm_name ? (building.pm_name.length > 20 ? building.pm_name.substring(0, 20) + '…' : building.pm_name) : '—', sub: building.pm_confidence ? `${building.pm_confidence}%` : null },
          { label: 'INCUMBENT', value: building.incumbent_name ? (building.incumbent_name.length > 18 ? building.incumbent_name.substring(0, 18) + '…' : building.incumbent_name) : '—', sub: building.incumbent_staleness?.replace('_', ' ') },
          ...(building.building_sqft ? [{ label: 'SIZE', value: `${Math.round(building.building_sqft / 1000)}k sqft`, sub: building.floors ? `${building.floors} fl` : null }] : []),
        ].map((item: any) => (
          <div key={item.label}>
            <div style={{ ...m, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 1 }}>{item.label}</div>
            <div style={{ fontFamily: item.big ? "'Bebas Neue', sans-serif" : "'DM Mono', monospace", fontSize: item.big ? 20 : 11, color: item.accent ? '#E8A020' : '#1C2B2B', lineHeight: 1 }}>{item.value}</div>
            {item.sub && <div style={{ ...m, fontSize: 9, color: item.label === 'INCUMBENT' && building.incumbent_staleness === 'very_stale' ? '#E8A020' : '#8C8070', marginTop: 1 }}>{item.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F7F4EE', borderBottom: '1px solid #C8C1B3', flexShrink: 0 }}>
        {(['main', 'OUTREACH'] as const).map((_, i) => {
          const key: Tab = i === 0 ? 'main' : 'signals'
          const label = i === 0 ? 'OUTREACH' : 'SIGNALS'
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px 0',
              ...m, fontSize: 10, letterSpacing: '1.5px',
              color: tab === key ? '#1C2B2B' : '#8C8070',
              background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #1C2B2B' : '2px solid transparent',
              cursor: 'pointer', fontWeight: tab === key ? 700 : 400,
            }}>{label}</button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* OUTREACH tab — two columns */}
        {tab === 'main' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
            {/* Left: contacts */}
            <div style={{ overflowY: 'auto', padding: '16px 16px 40px 20px', borderRight: '1px solid #C8C1B3' }}>
              <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 12 }}>WHO TO CALL</div>
              <ContactsSection />
            </div>
            {/* Right: notes + tasks + activity */}
            <div style={{ overflowY: 'auto', padding: '16px 20px 40px 16px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
                <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                  <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>TASKS</div>
                <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                  <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
                </div>
              </div>
              <div>
                <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>ACTIVITY</div>
                <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                  {activityLog?.length > 0 ? activityLog.map((entry: any, i: number) => (
                    <div key={entry.id} style={{ padding: '8px 0', borderBottom: i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ ...m, fontSize: 9, color: '#F7F4EE', padding: '2px 7px', background: entry.outcome === 'connected' ? '#1C2B2B' : '#8C8070' }}>
                          {entry.outcome?.toUpperCase() || 'CALL'}
                        </span>
                        <span style={{ ...m, fontSize: 10, color: '#8C8070' }}>
                          {entry.contacted_at ? new Date(entry.contacted_at).toLocaleString() : ''}
                        </span>
                        {entry.duration_secs && <span style={{ ...m, fontSize: 10, color: '#8C8070' }}>{Math.floor(entry.duration_secs / 60)}m{entry.duration_secs % 60}s</span>}
                      </div>
                      {entry.notes && <div style={{ ...m, fontSize: 11, color: '#1C2B2B', lineHeight: 1.6, marginBottom: 4 }}>{entry.notes}</div>}
                      <TranscriptViewer transcript={entry.transcript || null} recordingUrl={entry.recording_url || null} />
                    </div>
                  )) : <div style={{ ...m, fontSize: 11, color: '#8C8070' }}>No activity yet.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SIGNALS tab */}
        {tab === 'signals' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
            {/* Incumbent */}
            {building.incumbent_name && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>INCUMBENT</div>
                <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ ...m, fontSize: 12, color: '#1C2B2B' }}>{building.incumbent_name}</span>
                    {building.incumbent_staleness && (
                      <span style={{ ...m, fontSize: 8, padding: '2px 6px', color: building.incumbent_staleness.includes('stale') ? '#E8A020' : '#8C8070', border: `1px solid ${building.incumbent_staleness.includes('stale') ? '#E8A020' : '#8C8070'}` }}>
                        {building.incumbent_staleness.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  {building.incumbent_last_job && <div style={{ ...m, fontSize: 10, color: '#8C8070' }}>Last job: {new Date(building.incumbent_last_job).toLocaleDateString()}{building.incumbent_n_jobs ? ` · ${building.incumbent_n_jobs} jobs on record` : ''}</div>}
                  <div style={{ ...m, fontSize: 9, color: '#8C8070', marginTop: 4 }}>This is who you're displacing.</div>
                </div>
              </div>
            )}

            {openSignals.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>
                  <span style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>OPEN</span>
                  <span style={{ ...m, fontSize: 9, color: '#E8A020' }}>{openSignals.length}</span>
                  <span style={{ ...m, fontSize: 9, color: '#8C8070' }}>active / unresolved</span>
                </div>
                {openSignals.map(renderSignalRow)}
              </div>
            )}

            {closedSignals.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #C8C1B3', marginBottom: 10 }}>
                  <span style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#8C8070', fontWeight: 700 }}>CLOSED</span>
                  <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>{closedSignals.length}</span>
                  <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>compliance history</span>
                </div>
                {closedSignals.map(renderSignalRow)}
              </div>
            )}

            {usefulSignals.length === 0 && <div style={{ ...m, fontSize: 12, color: '#8C8070' }}>No signals found.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
