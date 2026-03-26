'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'

const DialerPanel = dynamic(() => import('./DialerPanel'), { ssr: false })

// ── Date formatting ───────────────────────────────────────────────────────────

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ── Signal config ─────────────────────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  violation_fire:             'FDNY Violation',
  violation_ecb:              'ECB Violation',
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
  // Tier A
  BF20: 'Inspection & Testing — failed ITM',
  BF12: 'Fire Protection Systems',
  BF01: 'Extinguishers & Hoses',
  // Tier B
  BF35: 'Unnecessary Alarms',
  BF17: 'Certificates of Fitness',
  BF09: 'Sprinkler System Deficiency',
  BF08: 'Standpipe Deficiency',
  BF14: 'Emergency Lighting',
  BF15: 'Exit Signs',
  // Tier C
  BF05: 'Recordkeeping & Logs',
  BF19: 'Affidavits & Documentation',
  BF06: 'Fire Drill Compliance',
  BF07: 'Posting & Signage',
  BF11: 'Fire Guard Requirements',
  BF30: 'Miscellaneous Fire Code',
}

const SIGNAL_WEIGHT: Record<string, number> = {
  violation_fire: 55, violation_ecb: 70, vacate_order: 95, fire_incident_direct: 82,
  complaint_fire: 60, permit_new_building: 72, permit_change_of_occupancy: 65,
  permit_large_renovation: 60, permit_demolition: 50, permit_renovation_fire: 35,
  permit_fire_system: 50, fire_incident_proximity: 25, license_sla: 20,
}

const CHARGE_WEIGHT: Record<string, number> = {
  // Tier A — highest urgency
  BF20: 95, BF12: 88, BF01: 82,
  // Tier B — moderate urgency
  BF35: 68, BF17: 65, BF09: 62, BF08: 60, BF14: 58, BF15: 58,
  // Tier C — low urgency
  BF05: 32, BF19: 30, BF06: 28, BF07: 28, BF11: 28, BF30: 25,
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
  if (sig.signal_type === 'violation_ecb') {
    w = sig.raw_data?.ecb_tier === 'A' ? 85 : 65
  }
  if (!sig.is_open) w = Math.round(w * 0.4)
  return w
}

function signalAccent(w: number) {
  if (w >= 80) return '#E8A020'
  if (w >= 60) return '#C47A15'
  if (w >= 40) return '#8C8070'
  return '#C8C1B3'
}

// Score badge colors: red / yellow / blue / gray
function scoreBadgeStyle(score: number | null) {
  if (!score || score === 0) return { background: '#C8C1B3', color: '#8C8070' }
  if (score >= 70) return { background: '#C0392B', color: '#FFFFFF' }
  if (score >= 40) return { background: '#E8A020', color: '#1C2B2B' }
  return { background: '#2E5D8E', color: '#FFFFFF' }
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
  { key: 'property_manager',   label: 'PROPERTY MANAGERS', hint: 'Primary — decision makers for service contracts' },
  { key: 'owner',              label: 'OWNERS',            hint: 'Fallback if PM unknown or unresponsive' },
  { key: 'leasing_broker',     label: 'BROKERS',           hint: 'Leasing brokers — know the building and often have PM relationships' },
  { key: 'tenant',             label: 'TENANTS',           hint: 'In the building daily — good referral source for PM/owner' },
  { key: 'institution',        label: 'INSTITUTIONS',      hint: 'Hospital, university, church — control their own suppression' },
  { key: 'trade_referral',     label: 'CONTRACTORS',       hint: 'Contractors on site or pulled permits — know the PM personally' },
  { key: 'violation_respondent', label: 'OTHER CONTACTS',  hint: 'Unclassified or government — low priority' },
]

type ActiveDial = {
  phoneNumber: string
  contactId: string
  contactName: string
}

type AddContactState = {
  sectionKey: string
  firstName: string
  lastName: string
  businessName: string
  phone: string
}

type Tab = 'main' | 'signals'

export default function BuildingPanel({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('main')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['property_manager', 'owner']))
  const [activeDial, setActiveDial] = useState<ActiveDial | null>(null)
  const [addContact, setAddContact] = useState<AddContactState | null>(null)
  const [savingContact, setSavingContact] = useState(false)
  const [localLeadStatus, setLocalLeadStatus] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/outreach/building?parcel_id=${parcelId}`)
    setData(await res.json())
    setLoading(false)
  }, [parcelId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !activeDial) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, activeDial])

  const m = { fontFamily: "'DM Mono', monospace" }

  if (loading) return <div style={{ ...m, fontSize: 12, color: '#8C8070', padding: 32 }}>Loading...</div>
  if (!data?.building) return <div style={{ ...m, fontSize: 12, color: '#8C8070', padding: 32 }}>Not found.</div>

  const { building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead, orgs } = data

  // Compute fine totals from all violation_fire signals
  const allViolations = (signals || []).filter((s: any) => s.signal_type === 'violation_fire')
  const openFines = allViolations
    .filter((s: any) => s.is_open)
    .reduce((sum: number, s: any) =>
      sum + (s.raw_data?.charges || []).reduce((cs: number, c: any) => cs + (Number(c.amount) || 0), 0), 0)
  const totalFines = allViolations
    .reduce((sum: number, s: any) =>
      sum + (s.raw_data?.charges || []).reduce((cs: number, c: any) => cs + (Number(c.amount) || 0), 0), 0)

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  // ── Score-driven "Why we're calling" ─────────────────────────────────────────
  const openViolations = (signals || []).filter((s: any) => s.signal_type === 'violation_fire' && s.is_open)

  function ageDecay(dateStr: string | null): number {
    if (!dateStr) return 0.5
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days < 30) return 1.0
    if (days < 60) return 0.7
    if (days < 90) return 0.4
    return 0.1
  }

  function fineMultiplier(amount: number): number {
    if (amount < 500) return 1.0
    if (amount < 1000) return 1.1
    if (amount < 2000) return 1.25
    return 1.4
  }

  function scoredWeight(sig: any): number {
    let base = signalWeight(sig)
    const decay = ageDecay(sig.signal_date)
    let mult = 1.0
    if (sig.signal_type === 'violation_fire') {
      const total = (sig.raw_data?.charges || []).reduce((s: number, c: any) => s + Number(c.amount || 0), 0)
      mult = fineMultiplier(total)
    }
    return Math.round(base * decay * mult)
  }

  function daysAgoStr(dateStr: string | null): string {
    if (!dateStr) return ''
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    return d === 0 ? 'today' : d === 1 ? '1d ago' : `${d}d ago`
  }

  type WhyCard = { tag: string; headline: string; detail: string; meaning: string; score: number; color: string }

  const SIG_HEADLINES: Record<string, string> = {
    // Tier A
    BF20: 'Failed ITM inspection',
    BF12: 'Fire protection system deficiency',
    BF01: 'Extinguisher / hose failure',
    // Tier B
    BF35: 'Unnecessary alarm responses',
    BF17: 'Certificate of Fitness lapse',
    BF09: 'Sprinkler system deficiency',
    BF08: 'Standpipe system deficiency',
    BF14: 'Emergency lighting failure',
    BF15: 'Exit sign violation',
    // Tier C
    BF05: 'Recordkeeping violation',
    BF19: 'Documentation violation',
    BF06: 'Fire drill non-compliance',
    BF07: 'Posting / signage violation',
    BF11: 'Fire guard violation',
    BF30: 'Fire code violation',
  }
  const SIG_MEANINGS: Record<string, string> = {
    // Tier A
    BF20: 'This is exactly what you sell — they need a certified contractor to re-certify and close the violation',
    BF12: 'Documented suppression system deficiency — direct upgrade opportunity',
    BF01: 'Extinguisher or hose out of compliance — basic service contract renewal',
    // Tier B
    BF35: 'Alarm generating unnecessary FDNY responses — calibration or replacement needed',
    BF17: 'Certificates of Fitness expired — compliance urgency, low-friction entry point',
    BF09: 'Sprinkler deficiency on record — inspection and repair opportunity',
    BF08: 'Standpipe out of compliance — direct service opportunity',
    BF14: 'Emergency lighting issue — simple fix, opens door to full system conversation',
    BF15: 'Exit sign non-compliance — straightforward entry point',
    // Tier C
    BF05: 'Recordkeeping gap — low technical bar but signals lax maintenance culture',
    BF19: 'Affidavit / documentation gap — fast close, low technical bar',
    BF06: 'Fire drill non-compliance — follow-up opportunity for broader safety audit',
    BF07: 'Signage violation — minor but compliance-motivated PM will want it cleared',
    BF11: 'Fire guard requirement — may indicate suppression gap worth exploring',
    BF30: 'Fire code violation — review raw data for specifics',
  }

  function narrativeForSig(sig: any, score: number): WhyCard | null {
    const da = daysAgoStr(sig.signal_date)
    const openStr = sig.is_open ? 'OPEN' : 'closed'

    if (sig.signal_type === 'violation_fire') {
      const charges = [...(sig.raw_data?.charges || [])].sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
      const top = charges[0]
      const code = top?.code || ''
      const amount = top ? Number(top.amount) : 0
      const headline = SIG_HEADLINES[code] || (CHARGE_LABELS[code] ? `Violation — ${CHARGE_LABELS[code]}` : 'FDNY fire safety violation')
      const meaning = SIG_MEANINGS[code] || 'Open FDNY violation — certified contractor needed to cure and close'
      const detail = [amount > 0 ? `$${amount.toLocaleString()} fine` : null, da, openStr].filter(Boolean).join(' · ')
      return { tag: code || 'VIOLATION', headline, detail, meaning, score, color: score >= 70 ? '#C0392B' : '#E8A020' }
    }
    if (sig.signal_type === 'violation_ecb') {
      const tier = sig.raw_data?.ecb_tier || 'B'
      const desc = sig.raw_data?.violation_description || ''
      const openStr2 = sig.is_open ? 'OPEN' : 'closed'
      const headline = tier === 'A'
        ? 'Sprinkler system not installed (ECB)'
        : 'Fire protection compliance violation (ECB)'
      const meaning = tier === 'A'
        ? 'DOB-issued ECB violation for missing sprinkler — major remediation required, strong sales opportunity'
        : 'ECB violation for fire protection non-compliance — PM under pressure to resolve before penalty escalates'
      const detail = [desc ? desc.slice(0, 60) : null, da, openStr2].filter(Boolean).join(' · ')
      return { tag: `ECB-${tier}`, headline, detail, meaning, score, color: tier === 'A' ? '#C0392B' : '#E8A020' }
    }
    if (sig.signal_type === 'vacate_order') {
      return { tag: 'VACATE', headline: 'Vacate order', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'Building cleared — cannot re-occupy without full fire compliance sign-off', score, color: '#C0392B' }
    }
    if (sig.signal_type === 'fire_incident_direct') {
      return { tag: 'FIRE', headline: 'Fire at this building', detail: da, meaning: 'Post-fire inspection mandatory — suppression system likely needs repair or replacement', score, color: '#C0392B' }
    }
    if (sig.signal_type === 'complaint_fire') {
      return { tag: 'COMPLAINT', headline: 'DOB fire safety complaint', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'Active complaint on record — building under scrutiny, PM motivated to resolve quickly', score, color: '#E8A020' }
    }
    if (sig.signal_type === 'permit_new_building') {
      return { tag: 'NEW BUILD', headline: 'New building permit', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'No incumbent fire contractor yet — ~60-90d window before the GC locks in their sub', score, color: '#E8A020' }
    }
    if (sig.signal_type === 'permit_change_of_occupancy') {
      return { tag: 'CO CHANGE', headline: 'Change of occupancy permit', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'New use = new fire suppression code requirements — existing system likely non-compliant', score, color: '#E8A020' }
    }
    if (sig.signal_type === 'permit_large_renovation') {
      return { tag: 'RENO', headline: 'Large renovation underway', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'Major work requires suppression update before CO — strong sub-contractor opportunity', score, color: '#8C8070' }
    }
    if (sig.signal_type === 'permit_fire_system') {
      return { tag: 'FIRE SYSTEM', headline: 'Fire system permit active', detail: [da, openStr].filter(Boolean).join(' · '), meaning: 'Someone is already working on the system — early contract or follow-on opportunity', score, color: '#8C8070' }
    }
    if (sig.signal_type === 'license_sla') {
      return { tag: 'SLA', headline: 'Liquor license filed', detail: da, meaning: 'Commercial kitchen hood and suppression required by law before license is approved', score, color: '#8C8070' }
    }
    if (sig.signal_type === 'fire_incident_proximity') {
      return { tag: 'NEARBY FIRE', headline: 'Fire incident on this block', detail: da, meaning: 'Area event — PM safety awareness elevated, receptive to suppression conversations', score, color: '#C8C1B3' }
    }
    return null
  }

  // Score each signal, dedupe by type (keep highest score per signal_type), pick top 3, then sort by recency
  const scoredSigs = (signals || [])
    .filter((s: any) => s.is_open || !DROP_IF_CLOSED.has(s.signal_type))
    .map((s: any) => ({ sig: s, score: scoredWeight(s) }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)

  // Dedupe: one card per signal_type (except violation_fire — one per charge code), pick top 3 by score
  const seen = new Set<string>()
  const whyCardsUnsorted: (WhyCard & { date: string | null })[] = []
  for (const { sig, score } of scoredSigs) {
    const key = sig.signal_type === 'violation_fire'
      ? `violation_fire:${sig.raw_data?.charges?.[0]?.code || 'generic'}`
      : sig.signal_type
    if (seen.has(key)) continue
    seen.add(key)
    const card = narrativeForSig(sig, score)
    if (card) whyCardsUnsorted.push({ ...card, date: sig.signal_date })
    if (whyCardsUnsorted.length >= 3) break
  }
  // Sort the top 3 by recency (most recent first)
  const whyCards: WhyCard[] = whyCardsUnsorted
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  // Combo multiplier bonuses — shown as a callout if active
  const openSigTypes = new Set((signals || []).filter((s: any) => s.is_open).map((s: any) => s.signal_type))
  const hasOpenViol = openViolations.length > 0
  let comboNote: string | null = null
  if (openSigTypes.has('permit_change_of_occupancy') && hasOpenViol)
    comboNote = '+30% urgency — must clear violations to receive CO, window is closing'
  else if (openSigTypes.has('fire_incident_direct') && hasOpenViol)
    comboNote = '+20% urgency — fire event + existing violations, system failed while non-compliant'
  else if ((openSigTypes.has('permit_new_building') || openSigTypes.has('permit_large_renovation')) && hasOpenViol)
    comboNote = '+20% urgency — active construction cannot get CO/TCO until violations are cleared'

  // Competitive angle
  const incumbentNote = (building.incumbent_staleness === 'very_stale' || building.incumbent_staleness === 'stale') && building.incumbent_name
    ? `Incumbent: ${building.incumbent_name} — last job ${building.incumbent_staleness === 'very_stale' ? 'very stale' : 'stale'}, no active relationship to displace`
    : null

  // Filter signals: drop closed permits, keep closed violations + fire incidents
  // All signals are already filtered by parcel_id (BBL), so all belong to this building
  const thisSignals = (signals || [])
    .filter((s: any) => {
      if (!s.is_open && DROP_IF_CLOSED.has(s.signal_type)) return false
      return true
    })
    .sort((a: any, b: any) => signalWeight(b) - signalWeight(a))
  const wrongAddrSignals: any[] = []

  const openSignals = thisSignals.filter((s: any) => s.is_open)
  const closedSignals = thisSignals.filter((s: any) => !s.is_open)

  // Group contacts by type, then sub-group by company (exclude bad data)
  // permit_applicant merges into trade_referral (both shown as CONTRACTORS)
  const contactsByType: Record<string, any[]> = {}
  for (const c of (contacts || [])) {
    if (c.is_bad_data) continue
    let t = (c.contact_type || 'other').toLowerCase()
    if (t === 'permit_applicant') t = 'trade_referral'
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
    const prefix = k.substring(0, 12)
    if (prefix.length < 6) return null
    return Object.entries(orgsByNorm).find(([ok]) => ok.startsWith(prefix) || prefix.startsWith(ok.substring(0, 12)))?.[1] ?? null
  }

  const toggleGroup = (key: string) => setExpandedGroups(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n
  })

  async function markContactBad(contactId: string) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('contacts').update({ is_bad_data: true }).eq('id', contactId)
    load()
  }

  async function saveNewContact() {
    if (!addContact) return
    setSavingContact(true)
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { data: newC } = await supabase.from('contacts').insert({
      parcel_id: parcelId,
      contact_type: addContact.sectionKey,
      first_name: addContact.firstName.trim() || null,
      last_name: addContact.lastName.trim() || null,
      business_name: addContact.businessName.trim() || null,
      source: 'manual',
    }).select().single()
    if (newC && addContact.phone.trim()) {
      const digits = addContact.phone.replace(/\D/g, '')
      const e164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : addContact.phone.trim()
      await supabase.from('phone_numbers').insert({
        parcel_id: parcelId,
        contact_id: newC.id,
        number: e164,
        source: 'manual',
        status: 'active',
        added_at: new Date().toISOString(),
      })
    }
    setAddContact(null)
    setSavingContact(false)
    load()
  }

  // ── Company block ─────────────────────────────────────────────────────────

  const renderCompanyBlock = (companyName: string, contactList: any[], fallbackOrg?: any, confOverride?: number | null, workDate?: string | null) => {
    const org = findOrgForName(companyName) || fallbackOrg
    const orgPhones = org
      ? (phoneNumbers || []).filter((p: any) =>
          p.org_id === org.id ||
          (org.org_profile_id && p.org_profile_id === org.org_profile_id)
        )
      : []
    const noIndividuals = contactList.every((c: any) => !c.first_name)
    const conf = confOverride ?? org?.confidence ?? (contactList.length > 0 ? Math.max(...contactList.map((c: any) => c.confidence ?? 0)) : null)

    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', marginBottom: 10 }}>
        {/* Company header */}
        <div style={{ padding: '10px 14px', borderBottom: contactList.length > 0 ? '1px solid #E8EDE8' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ ...m, fontSize: 11, color: '#1C2B2B', fontWeight: 700 }}>{companyName}</span>
            {conf != null && conf > 0 && (
              <span style={{ ...m, fontSize: 9, color: '#8C8070' }}>{conf}%</span>
            )}
            {workDate && (
              <span style={{ ...m, fontSize: 9, color: '#8C8070' }}>work: {workDate}</span>
            )}
            {org?.phone && (
              <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>{org.phone}</span>
            )}
          </div>
          <PhoneNumberManager
            parcelId={parcelId}
            orgId={org?.id ?? null}
            numbers={org?.phone && orgPhones.length === 0
              ? [{ id: `org-${org.id}`, parcel_id: parcelId, number: org.phone, source: 'enriched', status: 'active', org_id: org.id }]
              : orgPhones
            }
            onUpdate={null}
            onCallRequest={(phoneNumber) => setActiveDial({
              phoneNumber,
              contactId: org?.id ?? '',
              contactName: companyName,
            })}
          />
          {!org?.phone && orgPhones.length === 0 && (
            <div style={{ ...m, fontSize: 9, color: '#8C8070', marginTop: 4 }}>No company number — add below</div>
          )}
          {noIndividuals && (
            <div style={{ ...m, fontSize: 9, color: '#8C8070', marginTop: 4 }}>No individual contacts on record</div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>
                  {name}
                  {contact.confidence && (
                    <span style={{ ...m, fontSize: 9, color: '#C8C1B3', marginLeft: 8 }}>{contact.confidence}%</span>
                  )}
                </span>
                <button onClick={() => markContactBad(contact.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline', marginLeft: 'auto' }}>
                  wrong
                </button>
              </div>
              <PhoneNumberManager
                parcelId={parcelId}
                contactId={contact.id}
                numbers={cphones}
                onUpdate={null}
                onCallRequest={(phoneNumber) => setActiveDial({
                  phoneNumber,
                  contactId: contact.id,
                  contactName: name,
                })}
              />
            </div>
          )
        })}
      </div>
    )
  }

  // ── Contacts section ──────────────────────────────────────────────────────
  // NOTE: called as a render function {renderContacts()}, NOT as <ContactsSection />.
  // Defining inline components inside render creates a new type each render,
  // causing React to remount children and lose PhoneNumberManager state on every setActiveDial call.

  function renderContacts() { return (
    <div>
      {CONTACT_GROUPS.map(({ key, label, hint }) => {
        const group = contactsByType[key] || []
        const showPmOrg = key === 'property_manager' && building.pm_name

        if (group.length === 0 && !showPmOrg) return null

        const isExpanded = expandedGroups.has(key)
        const COLLAPSE_AT = key === 'trade_referral' ? 2 : 99

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
        const allEntries = [
          ...companies.map(([name, cs]) => ({
            type: 'company',
            name, // raw business_name — used as key and for org matching
            displayName: cs[0]?.ai_corrected_name || name, // corrected for display only
            contacts: cs,
          })),
          ...standalone.map(c => ({ type: 'person', contact: c })),
        ]
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

                {showPmOrg && group.length === 0 && renderCompanyBlock(building.pm_name, [], undefined, building.pm_confidence)}

                {visible.map((entry: any, i) =>
                  entry.type === 'company'
                    ? (
                      <div key={entry.name + i} style={{ position: 'relative' }}>
                        {renderCompanyBlock(entry.displayName || entry.name, entry.contacts, undefined, undefined,
                          key === 'trade_referral' ? (() => {
                            const dates = entry.contacts.map((c: any) => c.source_date).filter(Boolean).sort().reverse()
                            return dates[0] ? fmtDate(dates[0]) : null
                          })() : null
                        )}
                        <button
                          onClick={() => { entry.contacts.forEach((c: any) => markContactBad(c.id)) }}
                          style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >
                          wrong
                        </button>
                      </div>
                    )
                    : (
                      <div key={entry.contact.id} style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 14px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>
                            {entry.contact.first_name} {entry.contact.last_name || ''}
                            {entry.contact.confidence && <span style={{ ...m, fontSize: 9, color: '#C8C1B3', marginLeft: 8 }}>{entry.contact.confidence}%</span>}
                          </span>
                          <button onClick={() => markContactBad(entry.contact.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline', marginLeft: 'auto' }}>
                            wrong
                          </button>
                        </div>
                        <PhoneNumberManager
                          parcelId={parcelId}
                          contactId={entry.contact.id}
                          numbers={(phoneNumbers || []).filter((p: any) => p.contact_id === entry.contact.id)}
                          onUpdate={null}
                          onCallRequest={(phoneNumber) => setActiveDial({
                            phoneNumber,
                            contactId: entry.contact.id,
                            contactName: `${entry.contact.first_name} ${entry.contact.last_name || ''}`.trim(),
                          })}
                        />
                      </div>
                    )
                )}

                {hidden > 0 && (
                  <button onClick={() => toggleGroup(key)} style={{ ...m, fontSize: 10, color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    + {hidden} more
                  </button>
                )}

                {/* Add contact form */}
                {addContact?.sectionKey === key ? (
                  <div style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '12px 14px', marginTop: 8 }}>
                    <div style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 10 }}>ADD CONTACT</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input placeholder="Company name" value={addContact.businessName} onChange={e => setAddContact(a => a && ({ ...a, businessName: e.target.value }))}
                        style={{ padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 11, outline: 'none', background: '#FFF' }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input placeholder="First name" value={addContact.firstName} onChange={e => setAddContact(a => a && ({ ...a, firstName: e.target.value }))}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 11, outline: 'none', background: '#FFF' }} />
                        <input placeholder="Last name" value={addContact.lastName} onChange={e => setAddContact(a => a && ({ ...a, lastName: e.target.value }))}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 11, outline: 'none', background: '#FFF' }} />
                      </div>
                      <input placeholder="Phone (optional)" value={addContact.phone} onChange={e => setAddContact(a => a && ({ ...a, phone: e.target.value }))}
                        style={{ padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 11, outline: 'none', background: '#FFF' }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button onClick={saveNewContact} disabled={savingContact}
                          style={{ padding: '7px 14px', background: '#E8A020', color: '#1C2B2B', border: 'none', ...m, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>
                          {savingContact ? '...' : 'SAVE'}
                        </button>
                        <button onClick={() => setAddContact(null)}
                          style={{ background: 'none', border: 'none', ...m, fontSize: 11, color: '#8C8070', cursor: 'pointer' }}>
                          cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddContact({ sectionKey: key, firstName: '', lastName: '', businessName: '', phone: '' })}
                    style={{ ...m, fontSize: 10, letterSpacing: '1.5px', color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0 0' }}>
                    + ADD CONTACT
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
  )}

  // ── Signal row ───────────────────────────────────────────────────────────

  const renderSignalRow = (sig: any, i: number) => {
    const w = signalWeight(sig)
    const charges = sig.raw_data?.charges || []
    const charge = charges[0]
    const filingStatus = (sig.raw_data?.filing_status || '').toLowerCase()
    const contractorEngaged = sig.signal_type === 'permit_renovation_fire' && CONTRACTOR_ENGAGED_STATUSES.has(filingStatus)
    const isProximity = sig.signal_type === 'fire_incident_proximity'
    const proximityStreet = sig.raw_data?.incident_street
    const proximityType = sig.raw_data?.incident_type?.replace(/^\d+\s*-\s*/, '')

    return (
      <div key={sig.id || i} style={{
        display: 'flex', gap: 10, padding: '10px 12px',
        background: '#FFFFFF', border: '1px solid #C8C1B3',
        borderLeft: `3px solid ${contractorEngaged ? '#C8C1B3' : signalAccent(w)}`,
        marginBottom: 4,
      }}>
        <div style={{ ...m, fontSize: 11, fontWeight: 700, color: contractorEngaged ? '#C8C1B3' : signalAccent(w), minWidth: 24, textAlign: 'right', flexShrink: 0, paddingTop: 1 }}>
          {w}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ ...m, fontSize: 10, color: '#1C2B2B' }}>{SIGNAL_LABELS[sig.signal_type] || sig.signal_type}</span>
            {charge?.code && <span style={{ ...m, fontSize: 9, color: '#E8A020', fontWeight: 700 }}>{charge.code}</span>}
            {contractorEngaged && <span style={{ ...m, fontSize: 8, color: '#8C8070', border: '1px solid #C8C1B3', padding: '1px 4px' }}>CONTRACTOR ON SITE</span>}
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
            {fmtDate(sig.signal_date)}
            {isProximity && proximityStreet && ` · ${proximityStreet}`}
            {isProximity && proximityType && ` · ${proximityType}`}
          </div>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────

  const displayScore = building.signal_score || null
  const scoreStyle = scoreBadgeStyle(displayScore)

  function handleCallStarted() {
    setLocalLeadStatus('in_progress')
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ background: '#1C2B2B', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {displayScore != null && (
              <span style={{ ...m, fontSize: 11, fontWeight: 700, padding: '3px 8px', flexShrink: 0, ...scoreStyle }}>
                {displayScore}
              </span>
            )}
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '2px', color: '#F7F4EE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {building.address}
            </h2>
          </div>
          <button onClick={onClose} title="Esc" style={{ ...m, fontSize: 18, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        {/* Stage — key forces remount when lead status changes externally (e.g. auto in_progress) */}
        <div style={{ flexShrink: 0 }}>
          <StagePipeline key={localLeadStatus ?? lead?.status ?? 'new'} parcelId={parcelId} initialStage={localLeadStatus ?? lead?.status ?? 'new'} leadId={lead?.id ?? null} />
        </div>

        {/* Why we're calling bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #C8C1B3', padding: '10px 20px', flexShrink: 0 }}>
          {/* Size + Fines mini row */}
          {(building.building_sqft || totalFines > 0) && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: whyCards.length > 0 || comboNote || incumbentNote ? 10 : 0 }}>
              {building.building_sqft && (
                <div>
                  <div style={{ ...m, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 1 }}>SIZE</div>
                  <div style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{Math.round(building.building_sqft / 1000)}k sqft{building.floors ? ` · ${building.floors} fl` : ''}</div>
                </div>
              )}
              {totalFines > 0 && (
                <div>
                  <div style={{ ...m, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 1 }}>OPEN FINES</div>
                  <div style={{ ...m, fontSize: 11, color: openFines > 0 ? '#E8A020' : '#1C2B2B' }}>
                    ${openFines.toLocaleString()}<span style={{ color: '#8C8070' }}> / ${totalFines.toLocaleString()} total</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score-driven signal cards */}
          {whyCards.length > 0 && (
            <div>
              <div style={{ ...m, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 8 }}>WHY WE'RE CALLING</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {whyCards.map((card, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${card.color}`, paddingLeft: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                      <span style={{ ...m, fontSize: 8, letterSpacing: '1px', color: card.color, fontWeight: 700, flexShrink: 0 }}>{card.tag}</span>
                      <span style={{ ...m, fontSize: 11, color: '#1C2B2B', fontWeight: 600 }}>{card.headline}</span>
                      {card.detail && <span style={{ ...m, fontSize: 9, color: '#8C8070' }}>{card.detail}</span>}
                    </div>
                    <div style={{ ...m, fontSize: 10, color: '#5A5A5A', lineHeight: 1.5 }}>{card.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combo multiplier callout */}
          {comboNote && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F0EDE8' }}>
              <span style={{ ...m, fontSize: 8, letterSpacing: '1px', color: '#C0392B', fontWeight: 700 }}>COMBO  </span>
              <span style={{ ...m, fontSize: 10, color: '#8C8070' }}>{comboNote}</span>
            </div>
          )}

          {/* Competitive angle */}
          {incumbentNote && (
            <div style={{ marginTop: comboNote ? 4 : 8, paddingTop: comboNote ? 0 : 8, borderTop: comboNote ? 'none' : '1px solid #F0EDE8' }}>
              <span style={{ ...m, fontSize: 8, letterSpacing: '1px', color: '#8C8070', fontWeight: 700 }}>COMPETITIVE  </span>
              <span style={{ ...m, fontSize: 10, color: '#8C8070' }}>{incumbentNote}</span>
            </div>
          )}

          {whyCards.length === 0 && !building.building_sqft && totalFines === 0 && (
            <div style={{ ...m, fontSize: 10, color: '#C8C1B3' }}>No active signals</div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F7F4EE', borderBottom: '1px solid #C8C1B3', flexShrink: 0 }}>
          {(['main', 'signals'] as Tab[]).map((key) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px 0',
              ...m, fontSize: 10, letterSpacing: '1.5px',
              color: tab === key ? '#1C2B2B' : '#8C8070',
              background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #1C2B2B' : '2px solid transparent',
              cursor: 'pointer', fontWeight: tab === key ? 700 : 400,
            }}>
              {key === 'main' ? 'OUTREACH' : 'SIGNALS'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          {/* OUTREACH tab */}
          {tab === 'main' && (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
              <div style={{ overflowY: 'auto', padding: '16px 16px 40px 20px', borderRight: '1px solid #C8C1B3' }}>
                <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 12 }}>WHO TO CALL</div>
                {renderContacts()}
              </div>
              <div style={{ overflowY: 'auto', padding: '16px 20px 40px 16px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>TASKS</div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                    <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...m, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                    <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
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
                            {fmtDateTime(entry.contacted_at)}
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
                    {building.incumbent_last_job && <div style={{ ...m, fontSize: 10, color: '#8C8070' }}>Last job: {fmtDate(building.incumbent_last_job)}{building.incumbent_n_jobs ? ` · ${building.incumbent_n_jobs} jobs on record` : ''}</div>}
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

              {thisSignals.length === 0 && (
                <div style={{ ...m, fontSize: 12, color: '#8C8070', marginBottom: 20 }}>No verified signals for this address.</div>
              )}

              {/* Wrong-address signals collapsed at bottom */}
              {wrongAddrSignals.length > 0 && (
                <div style={{ opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '1px dashed #C8C1B3', marginBottom: 10 }}>
                    <span style={{ ...m, fontSize: 9, letterSpacing: '1.5px', color: '#8C8070', fontWeight: 700 }}>UNVERIFIED ADDRESS</span>
                    <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>{wrongAddrSignals.length}</span>
                    <span style={{ ...m, fontSize: 9, color: '#C8C1B3' }}>signals matched to this parcel but different street address</span>
                  </div>
                  {wrongAddrSignals.map(renderSignalRow)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialer side panel — renders alongside content, not as overlay */}
      {activeDial && (
        <DialerPanel
          parcelId={parcelId}
          contactId={activeDial.contactId}
          contactName={activeDial.contactName}
          phoneNumber={activeDial.phoneNumber}
          buildingAddress={building.address}
          signalBrief={signalBrief}
          leadId={lead?.id ?? null}
          onCallStarted={handleCallStarted}
          onClose={() => setActiveDial(null)}
        />
      )}
    </div>
  )
}
