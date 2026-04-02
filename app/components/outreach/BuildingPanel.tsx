'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'
import IdentityBar from './IdentityBar'

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

// Age-based decay matching DB scoring formula
function violationDecay(dateStr: string, isOpen: boolean): number {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  if (isOpen) {
    if (days <  90) return 1.0
    if (days < 180) return 0.9
    if (days < 365) return 0.8
    if (days < 730) return 0.7
    return 0.6  // floor — never zero for open
  } else {
    if (days <  90) return 0.8
    if (days < 180) return 0.6
    if (days < 365) return 0.4
    if (days < 730) return 0.2
    return 0.0
  }
}

function signalWeight(sig: any): number {
  const decay = violationDecay(sig.signal_date, sig.is_open)

  if (sig.signal_type === 'violation_fire' && sig.raw_data?.charges?.length) {
    const codes: string[] = sig.raw_data.charges.map((c: any) => c.code)
    const isITM        = codes.includes('BF20')
    const isSprinkler  = !isITM && codes.some((c: string) => ['BF12','BF01'].includes(c))
    const isTierB      = !isITM && !isSprinkler && codes.some((c: string) => ['BF35','BF17','BF09','BF08','BF14','BF15'].includes(c))
    const basePts      = isITM ? (sig.is_open ? 35 : 8) : isSprinkler ? (sig.is_open ? 25 : 6) : isTierB ? (sig.is_open ? 13 : 3) : (sig.is_open ? 3 : 1)
    // Map to 0-100 display weight: scale by base relative to max (35)
    return Math.round((basePts / 35) * 100 * decay)
  }
  if (sig.signal_type === 'violation_ecb') {
    const base = sig.raw_data?.ecb_tier === 'A' ? (sig.is_open ? 22 : 5) : (sig.is_open ? 10 : 3)
    return Math.round((base / 35) * 100 * decay)
  }
  // Non-violation signals — use existing weight table, no violation decay
  return SIGNAL_WEIGHT[sig.signal_type] ?? 30
}

function signalAccent(w: number) {
  if (w >= 80) return '#E8A020'
  if (w >= 60) return '#C47A15'
  if (w >= 40) return '#8C8070'
  return '#C8C1B3'
}

// Score badge colors: red / yellow / blue / gray
function boroughFromParcelId(parcelId: string): string | null {
  const m = parcelId.match(/^nyc_(\d)/)
  if (!m) return null
  return ({ '1': 'Manhattan', '2': 'Bronx', '3': 'Brooklyn', '4': 'Queens', '5': 'Staten Island' } as Record<string, string>)[m[1]] ?? null
}

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

type Tab = 'main' | 'signals' | 'portfolio'

export default function BuildingPanel({ parcelId, onClose }: { parcelId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('main')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['property_manager', 'owner']))
  const [activeDial, setActiveDial] = useState<ActiveDial | null>(null)
  const [manualDialInput, setManualDialInput] = useState<string | null>(null)
  const [addContact, setAddContact] = useState<AddContactState | null>(null)
  const [savingContact, setSavingContact] = useState(false)
  const [localLeadStatus, setLocalLeadStatus] = useState<string | null>(null)
  const [contactOrder, setContactOrder] = useState<Record<string, string[]>>({})
  const [reassigningContact, setReassigningContact] = useState<string | null>(null)
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null)
  const [editWebsiteValue, setEditWebsiteValue] = useState('')
  const [classifying, setClassifying] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/outreach/building?parcel_id=${parcelId}`)
    setData(await res.json())
    setLoading(false)
  }, [parcelId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (manualDialInput !== null) { setManualDialInput(null); return }
        if (!activeDial) onClose()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, activeDial, manualDialInput])

  const m = { fontFamily: "'DM Mono', monospace" }

  if (loading) return <div style={{ ...m, fontSize: 14, color: '#8C8070', padding: 32 }}>Loading...</div>
  if (!data?.lead && !data?.address) return <div style={{ ...m, fontSize: 14, color: '#8C8070', padding: 32 }}>Not found.</div>

  const { building: _building, address: buildingAddress, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead, orgs, orgProfiles, permitOrgs } = data
  // Merge building_intelligence with lead fallbacks so non-Manhattan buildings (no bi row) still render
  const building = {
    ..._building,
    signal_score:       lead?.score                   ?? _building?.signal_score  ?? null,
    pm_name:            _building?.pm_name            ?? lead?.pm_name            ?? null,
    pm_confidence:      _building?.pm_confidence      ?? lead?.pm_confidence      ?? null,
    incumbent_name:     _building?.incumbent_name     ?? lead?.incumbent_name     ?? null,
    incumbent_staleness:_building?.incumbent_staleness?? lead?.incumbent_staleness?? null,
  }

  // ── Contractor trade grouping ─────────────────────────────────────────────
  const FIRE_TRADES = new Set(['fire_suppression', 'sprinkler'])
  const TRADE_LABEL: Record<string, string> = {
    gc: 'GC', plumbing: 'PLUMBING', electrical: 'ELECTRICAL',
    fire_suppression: 'FIRE SUPPRESSION', sprinkler: 'SPRINKLER',
    hvac: 'HVAC', boiler: 'BOILER', other_trade: 'OTHER TRADE', demolition: 'DEMOLITION',
  }
  // Fire trades first (incumbents to displace), then referral trades
  const TRADE_ORDER = ['fire_suppression', 'sprinkler', 'gc', 'plumbing', 'electrical', 'hvac', 'boiler', 'other_trade', 'demolition']

  type ContractorEntry = { name: string; phone: string; dates: string[] }
  const contractorsByTrade: Record<string, ContractorEntry[]> = {}
  for (const org of (permitOrgs || [])) {
    if (!org.trade_type || !org.business_name) continue
    if (!contractorsByTrade[org.trade_type]) contractorsByTrade[org.trade_type] = []
    const existing = contractorsByTrade[org.trade_type].find((c: ContractorEntry) => c.name === org.business_name)
    if (existing) {
      if (org.source_date && !existing.dates.includes(org.source_date)) existing.dates.push(org.source_date)
      if (!existing.phone && org.phone) existing.phone = org.phone
    } else {
      contractorsByTrade[org.trade_type].push({ name: org.business_name, phone: org.phone || '', dates: org.source_date ? [org.source_date] : [] })
    }
  }
  // Sort dates desc within each contractor, sort contractors by most recent date, cap at 3 per trade
  for (const tt of Object.keys(contractorsByTrade)) {
    contractorsByTrade[tt] = contractorsByTrade[tt]
      .map((c: ContractorEntry) => ({ ...c, dates: [...c.dates].sort().reverse() }))
      .sort((a: ContractorEntry, b: ContractorEntry) => (b.dates[0] || '').localeCompare(a.dates[0] || ''))
      .slice(0, 3)
  }
  const contractorTradeKeys = TRADE_ORDER.filter(tt => contractorsByTrade[tt]?.length > 0)
  const totalContractors = contractorTradeKeys.reduce((s, tt) => s + contractorsByTrade[tt].length, 0)

  // PM common contractors from org_profile
  const pmOrgProfile = (() => {
    if (!building.pm_name) return null
    const k = normalizeName(building.pm_name)
    if (!k) return null
    const exact = (orgProfiles || []).find((op: any) => normalizeName(op.canonical_name || '') === k)
    if (exact) return exact
    const prefix = k.substring(0, 12)
    if (prefix.length < 6) return null
    return (orgProfiles || []).find((op: any) => {
      const ok = normalizeName(op.canonical_name || '')
      return ok.startsWith(prefix) || prefix.startsWith(ok.substring(0, 12))
    }) ?? null
  })()
  const pmCommonContractors: Record<string, { name: string; parcel_count: number; phone: string }[]> = pmOrgProfile?.common_contractors || {}
  const pmContractorTradeKeys = TRADE_ORDER.filter(tt => pmCommonContractors[tt]?.length > 0)

  // ── Build org_profiles lookup by normalized name (phone source for enriched contacts)
  const orgProfilesByNorm: Record<string, any> = {}
  for (const op of (orgProfiles || [])) {
    const k = normalizeName(op.canonical_name || '')
    if (k) orgProfilesByNorm[k] = op
  }
  function findOrgProfile(name: string) {
    if (!name) return null
    const k = normalizeName(name)
    if (orgProfilesByNorm[k]) return orgProfilesByNorm[k]
    const prefix = k.substring(0, 12)
    if (prefix.length < 6) return null
    return Object.entries(orgProfilesByNorm).find(([ok]) => ok.startsWith(prefix) || prefix.startsWith(ok.substring(0, 12)))?.[1] ?? null
  }

  // Compute fine totals from FDNY + ECB signals
  const allFdnyViolations = (signals || []).filter((s: any) => s.signal_type === 'violation_fire')
  const allEcbViolations  = (signals || []).filter((s: any) => s.signal_type === 'violation_ecb')
  const openFines = allFdnyViolations
    .filter((s: any) => s.is_open)
    .reduce((sum: number, s: any) =>
      sum + (s.raw_data?.charges || []).reduce((cs: number, c: any) => cs + (Number(c.amount) || 0), 0), 0)
    + allEcbViolations
    .filter((s: any) => s.is_open)
    .reduce((sum: number, s: any) => sum + (Number(s.raw_data?.penalty_imposed) || 0), 0)
  const totalFines = allFdnyViolations
    .reduce((sum: number, s: any) =>
      sum + (s.raw_data?.charges || []).reduce((cs: number, c: any) => cs + (Number(c.amount) || 0), 0), 0)
    + allEcbViolations
    .reduce((sum: number, s: any) => sum + (Number(s.raw_data?.penalty_imposed) || 0), 0)

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  // Superseded: open violation_fire with a NEWER closed violation_fire sharing a charge code
  const supersededIds = new Set<string>()
  const _fireSignals = (signals || []).filter((s: any) => s.signal_type === 'violation_fire')
  const _closedFireSigs = _fireSignals.filter((s: any) => !s.is_open)
  for (const openSig of _fireSignals.filter((s: any) => s.is_open)) {
    const openCodes = new Set((openSig.raw_data?.charges || []).map((c: any) => c.code))
    for (const closedSig of _closedFireSigs) {
      if ((closedSig.signal_date || '') > (openSig.signal_date || '')) {
        const closedCodes = (closedSig.raw_data?.charges || []).map((c: any) => c.code)
        if (closedCodes.some((code: string) => openCodes.has(code))) {
          supersededIds.add(openSig.id)
          break
        }
      }
    }
  }

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
    // Superseded open violations score as if closed (stale, already resolved in practice)
    const effectiveSig = supersededIds.has(sig.id) ? { ...sig, is_open: false } : sig
    let base = signalWeight(effectiveSig)
    // Violation decay is already baked into signalWeight; apply ageDecay only to non-violation signals
    const isViolation = sig.signal_type === 'violation_fire' || sig.signal_type === 'violation_ecb'
    const decay = isViolation ? 1.0 : ageDecay(sig.signal_date)
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
      const charges = [...(sig.raw_data?.charges || [])].sort((a: any, b: any) =>
        (CHARGE_WEIGHT[b.code] ?? 0) - (CHARGE_WEIGHT[a.code] ?? 0)
      )
      const top = charges[0]
      const code = top?.code || ''
      const totalAmount = (sig.raw_data?.charges || []).reduce((s: number, c: any) => s + Number(c.amount || 0), 0)
      const amount = totalAmount
      const headline = SIG_HEADLINES[code] || (CHARGE_LABELS[code] ? `Violation — ${CHARGE_LABELS[code]}` : 'FDNY fire safety violation')
      const meaning = SIG_MEANINGS[code] || 'Open FDNY violation — certified contractor needed to cure and close'
      const detail = [amount > 0 ? `$${amount.toLocaleString()} fine` : null, da, openStr].filter(Boolean).join(' · ')
      return { tag: code || 'VIOLATION', headline, detail, meaning, score, color: score >= 70 ? '#C0392B' : '#E8A020' }
    }
    if (sig.signal_type === 'violation_ecb') {
      const tier = sig.raw_data?.ecb_tier || 'B'
      const desc = sig.raw_data?.violation_description || ''
      const openStr2 = sig.is_open ? 'OPEN' : 'closed'
      const penalty = Number(sig.raw_data?.penalty_imposed || 0)
      const headline = tier === 'A'
        ? 'Sprinkler system not installed (ECB)'
        : 'Fire protection compliance violation (ECB)'
      const meaning = tier === 'A'
        ? 'DOB-issued ECB violation for missing sprinkler — major remediation required, strong sales opportunity'
        : 'ECB violation for fire protection non-compliance — PM under pressure to resolve before penalty escalates'
      const detail = [penalty > 0 ? `$${penalty.toLocaleString()} fine` : null, desc ? desc.slice(0, 60) : null, da, openStr2].filter(Boolean).join(' · ')
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

  // Dedupe: one card per signal_type (except violation_fire — one per highest-tier charge code), pick top 3 by score
  const seen = new Set<string>()
  const whyCardsUnsorted: (WhyCard & { date: string | null })[] = []
  for (const { sig, score } of scoredSigs) {
    const key = sig.signal_type === 'violation_fire'
      ? (() => {
          const charges = sig.raw_data?.charges || []
          const best = [...charges].sort((a: any, b: any) =>
            (CHARGE_WEIGHT[b.code] ?? 0) - (CHARGE_WEIGHT[a.code] ?? 0)
          )[0]
          return `violation_fire:${best?.code || 'generic'}`
        })()
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
    .sort((a: any, b: any) => (b.signal_date || '').localeCompare(a.signal_date || ''))
  const closedSignals = thisSignals.filter((s: any) => !s.is_open)
    .sort((a: any, b: any) => (b.signal_date || '').localeCompare(a.signal_date || ''))

  // Group contacts by type, then sub-group by company (exclude bad data)
  // permit_applicant merges into trade_referral (both shown as CONTRACTORS)
  const contactsByType: Record<string, any[]> = {}
  for (const c of (contacts || [])) {
    if (c.is_bad_data) continue
    // Hide AI-classified entities from PM/owner groups — they're company name fragments, not people
    if (c.ai_entity_type === 'entity' && (c.contact_type === 'property_manager' || c.contact_type === 'owner')) continue
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

  function moveEntry(groupKey: string, currentKeys: string[], targetKey: string, direction: 'up' | 'down') {
    const idx = currentKeys.indexOf(targetKey)
    if (idx < 0) return
    const next = [...currentKeys]
    if (direction === 'up' && idx > 0) { [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]] }
    else if (direction === 'down' && idx < next.length - 1) { [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]] }
    else return
    setContactOrder(prev => ({ ...prev, [groupKey]: next }))
  }

  async function markContactBad(contactId: string) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('contacts').update({ is_bad_data: true }).eq('id', contactId)
    load()
  }

  async function deleteContact(contactId: string) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('contacts').delete().eq('id', contactId)
    load()
  }

  async function deleteOrg(orgId: string) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('organizations').delete().eq('id', orgId)
    load()
  }

  async function reassignContact(contactId: string, orgName: string | null) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('contacts').update({
      business_name: orgName || null,
      assignment_source: 'manual',
    }).eq('id', contactId)
    setReassigningContact(null)
    load()
  }

  async function saveOrgWebsite(orgId: string, website: string) {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('organizations').update({ website: website.trim() || null }).eq('id', orgId)
    setEditingOrgId(null)
    setEditWebsiteValue('')
    load()
  }

  async function classifyContacts() {
    setClassifying(true)
    try {
      await fetch('/api/classify-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcel_id: parcelId }),
      })
      load()
    } finally {
      setClassifying(false)
    }
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

  const renderCompanyBlock = (companyName: string, contactList: any[], fallbackOrg?: any, confOverride?: number | null, workDate?: string | null, permitLabel?: string | null, isT2Inferred?: boolean, webConf?: number | null) => {
    const org = findOrgForName(companyName) || fallbackOrg
    const orgProfile = findOrgProfile(companyName)
    const orgPhones = org
      ? (phoneNumbers || []).filter((p: any) =>
          p.org_id === org.id ||
          (org.org_profile_id && p.org_profile_id === org.org_profile_id)
        )
      : []
    const resolvedPhone = org?.phone || (orgPhones.length === 0 ? orgProfile?.phone : null)
    const noIndividuals = contactList.every((c: any) => !c.first_name)
    const conf = confOverride ?? org?.confidence ?? (contactList.length > 0 ? Math.max(...contactList.map((c: any) => c.confidence ?? 0)) : null)
    const website = org?.website || orgProfile?.website || null
    const isEditing = editingOrgId === org?.id

    // All orgs for this building — used in reassign dropdown
    const allOrgNames = [
      building.pm_name,
      building.owner_name,
      ...(orgs || []).map((o: any) => o.business_name),
    ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)

    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', marginBottom: 10 }}>
        {/* Company header */}
        <div style={{ padding: '10px 14px', borderBottom: (contactList.length > 0 || orgProfile?.principals?.length > 0) ? '1px solid #E8EDE8' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ ...m, fontSize: 13, color: '#1C2B2B', fontWeight: 700 }}>{companyName}</span>
                {conf != null && conf > 0 && (
                  <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{conf}%</span>
                )}
                {webConf != null && (
                  <span style={{ ...m, fontSize: 10, color: '#2A7A4B', background: '#D4EEE0', border: '1px solid #A8D5B5', padding: '2px 7px', letterSpacing: '0.5px', fontWeight: 700 }}>🌐 WEB · {Math.round(webConf * 100)}%</span>
                )}
                {isT2Inferred && (
                  <span style={{ ...m, fontSize: 10, color: '#5C8070', background: '#EAF4EE', padding: '1px 5px', letterSpacing: '0.5px' }}>inferred</span>
                )}
                {permitLabel && (
                  <span style={{ ...m, fontSize: 10, color: '#8C8070', background: '#F0EDE8', padding: '2px 5px', letterSpacing: '0.8px' }}>{permitLabel}</span>
                )}
                {workDate && (
                  <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>work: {workDate}</span>
                )}
              </div>

              {/* Website row */}
              {isEditing ? (
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <input
                    value={editWebsiteValue}
                    onChange={e => setEditWebsiteValue(e.target.value)}
                    placeholder="https://example.com"
                    style={{ flex: 1, padding: '4px 6px', border: '1px solid #C8C1B3', ...m, fontSize: 12, outline: 'none' }}
                  />
                  <button onClick={() => saveOrgWebsite(org!.id, editWebsiteValue)}
                    style={{ ...m, fontSize: 11, color: '#1C2B2B', background: '#E8A020', border: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: 700 }}>
                    SAVE
                  </button>
                  <button onClick={() => setEditingOrgId(null)}
                    style={{ ...m, fontSize: 11, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer' }}>
                    cancel
                  </button>
                </div>
              ) : website ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                    style={{ ...m, fontSize: 11, color: '#2A7A4B', textDecoration: 'underline' }}>
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                  {org?.id && (
                    <button onClick={() => { setEditingOrgId(org.id); setEditWebsiteValue(website) }}
                      style={{ ...m, fontSize: 11, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      edit
                    </button>
                  )}
                </div>
              ) : org?.id ? (
                <button onClick={() => { setEditingOrgId(org.id); setEditWebsiteValue('') }}
                  style={{ ...m, fontSize: 11, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 4px 0', textDecoration: 'underline' }}>
                  + add website
                </button>
              ) : null}
            </div>

            {/* Delete org button */}
            {org?.id && (
              <button onClick={() => deleteOrg(org.id)}
                style={{ ...m, fontSize: 11, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginTop: 2 }}>
                delete org
              </button>
            )}
          </div>

          <PhoneNumberManager
            parcelId={parcelId}
            orgId={org?.id ?? null}
            numbers={resolvedPhone && orgPhones.length === 0
              ? [{ id: `profile-${org?.id ?? orgProfile?.id ?? 'x'}`, parcel_id: parcelId, number: resolvedPhone, source: 'enriched', status: 'active', org_id: org?.id }]
              : orgPhones
            }
            onUpdate={null}
            onCallRequest={(phoneNumber) => setActiveDial({
              phoneNumber,
              contactId: org?.id ?? orgProfile?.id ?? '',
              contactName: companyName,
            })}
          />
          {!resolvedPhone && orgPhones.length === 0 && (
            <div style={{ ...m, fontSize: 11, color: '#8C8070', marginTop: 4 }}>No company number</div>
          )}
          {noIndividuals && contactList.length === 0 && !(orgProfile?.principals?.length > 0) && (
            <div style={{ ...m, fontSize: 11, color: '#8C8070', marginTop: 4 }}>No individual contacts on record</div>
          )}
        </div>

        {/* Org profile principals */}
        {orgProfile?.principals?.length > 0 && contactList.length === 0 && (
          (orgProfile.principals as any[]).map((p: any, i: number) => (
            <div key={i} style={{ padding: '8px 14px 8px 24px', borderBottom: '1px solid #F0EDE8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...m, fontSize: 13, color: '#1C2B2B' }}>{p.name}</span>
                {p.title && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{p.title}</span>}
                {p.phone && <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{p.phone}</span>}
              </div>
            </div>
          ))
        )}

        {/* Individual contacts */}
        {contactList.filter((c: any) => c.first_name || !c.business_name).map((contact: any) => {
          const cphones = (phoneNumbers || []).filter((p: any) => p.contact_id === contact.id)
          const name = contact.first_name
            ? `${contact.first_name} ${contact.last_name || ''}`.trim()
            : contact.business_name || 'Unknown'
          const isReassigning = reassigningContact === contact.id
          return (
            <div key={contact.id} style={{ padding: '8px 14px 8px 24px', borderBottom: '1px solid #F0EDE8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ ...m, fontSize: 13, color: '#1C2B2B' }}>
                  {name}
                  {contact.confidence && (
                    <span style={{ ...m, fontSize: 11, color: '#C8C1B3', marginLeft: 8 }}>{contact.confidence}%</span>
                  )}
                </span>
                {contact.source === 'clay_web' && (
                  <span style={{ ...m, fontSize: 10, color: '#2A7A4B', background: '#D4EEE0', border: '1px solid #A8D5B5', padding: '2px 7px', letterSpacing: '0.5px', fontWeight: 700 }}>🌐 WEB</span>
                )}
                {isT2Inferred && (
                  <span style={{ ...m, fontSize: 10, color: '#5C8070', background: '#EAF4EE', borderRadius: 3, padding: '1px 5px' }}>inferred</span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button onClick={() => setReassigningContact(isReassigning ? null : contact.id)}
                    style={{ background: 'none', border: 'none', ...m, fontSize: 11, color: '#5C8070', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    {isReassigning ? 'cancel' : 'move'}
                  </button>
                  <button onClick={() => deleteContact(contact.id)}
                    style={{ background: 'none', border: 'none', ...m, fontSize: 11, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    delete
                  </button>
                </div>
              </div>
              {contact.title && (
                <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: 4 }}>{contact.title}</div>
              )}
              {/* Reassign inline picker */}
              {isReassigning && (
                <div style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '8px 10px', marginBottom: 8 }}>
                  <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: 6 }}>MOVE TO:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {allOrgNames.map((orgN: string) => (
                      <button key={orgN} onClick={() => reassignContact(contact.id, orgN)}
                        style={{ ...m, fontSize: 12, color: '#1C2B2B', background: 'none', border: '1px solid #C8C1B3', padding: '4px 8px', cursor: 'pointer', textAlign: 'left' }}>
                        {orgN}
                      </button>
                    ))}
                    <button onClick={() => reassignContact(contact.id, null)}
                      style={{ ...m, fontSize: 12, color: '#8C8070', background: 'none', border: '1px dashed #C8C1B3', padding: '4px 8px', cursor: 'pointer', textAlign: 'left' }}>
                      Unassign (independent)
                    </button>
                  </div>
                </div>
              )}
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

  function renderContacts() {
    return (
    <div>
      {CONTACT_GROUPS.map(({ key, label, hint }) => {
        // CONTRACTORS rendered separately below using permitOrgs with trade grouping
        if (key === 'trade_referral') return null

        const group = contactsByType[key] || []
        const showPmOrg = key === 'property_manager' && building.pm_name

        // Clay PM: detect if Clay found a different PM than the gov record
        const clayPmRaw: string | null = building.web_enrichment_raw?.pm || null
        const clayPmConf: number | null = building.web_enrichment_raw?.pm_confidence ?? null
        const _govPmNorm = normalizeName(building.pm_name || '')
        const _clayPmNorm = normalizeName(clayPmRaw || '')
        const pmNamesMatch = _clayPmNorm.length > 3 && _govPmNorm.length > 3 && (
          _clayPmNorm === _govPmNorm || _clayPmNorm.startsWith(_govPmNorm.substring(0, 10)) || _govPmNorm.startsWith(_clayPmNorm.substring(0, 10))
        )
        // WEB badge for gov PM when Clay confirms the same PM
        const govPmWebConf: number | null = (key === 'property_manager' && pmNamesMatch) ? clayPmConf : null
        // Show Clay PM as its own block when it's a different company
        const showClayPm = key === 'property_manager' && !!(clayPmRaw && !pmNamesMatch)

        // Helper: get Clay web conf for a company name in context of this section
        const getClayWebConf = (name: string): number | null => {
          const web = building.web_enrichment_raw
          if (!web || !name) return null
          const nb = normalizeName(name)
          if (nb.length <= 3) return null
          const check = (raw: string | null | undefined, conf: number | null | undefined): number | null => {
            if (!raw) return null
            const na = normalizeName(raw)
            if (na.length <= 3) return null
            return (na === nb || na.startsWith(nb.substring(0, 10)) || nb.startsWith(na.substring(0, 10))) ? (conf ?? null) : null
          }
          if (key === 'property_manager') return check(web.pm, web.pm_confidence)
          if (key === 'owner') return check(web.owner, web.owner_confidence)
          if (key === 'leasing_broker') return check(web.broker, web.broker_confidence)
          return null
        }

        // Owner orgs from organizations table
        const ownerOrgs = key === 'owner'
          ? (orgs || []).filter((o: any) => o.org_type === 'owner' && o.business_name)
          : []

        // Clay owner — show if not already represented
        const clayOwner: string | null = key === 'owner' && building.web_enrichment_raw?.owner
          ? building.web_enrichment_raw.owner : null
        const clayOwnerAlreadyShown = !clayOwner || [
          ...ownerOrgs.map((o: any) => normalizeName(o.business_name || '')),
          ...group.map((c: any) => normalizeName(c.business_name || '')),
        ].some(n => { const cn = normalizeName(clayOwner); return n.length > 3 && cn.length > 3 && (n === cn || n.startsWith(cn.substring(0, 10))); })
        const showClayOwner = !!(clayOwner && !clayOwnerAlreadyShown)

        // Clay broker — show if not already in leasing_broker contacts
        const clayBroker: string | null = key === 'leasing_broker' && building.web_enrichment_raw?.broker
          ? building.web_enrichment_raw.broker : null
        const clayBrokerAlreadyShown = !clayBroker || group.some((c: any) => {
          const n = normalizeName(c.business_name || (`${c.first_name || ''} ${c.last_name || ''}`).trim())
          const cb = normalizeName(clayBroker)
          return n.length > 3 && cb.length > 3 && n === cb
        })
        const showClayBroker = !!(clayBroker && !clayBrokerAlreadyShown)

        if (group.length === 0 && !showPmOrg && ownerOrgs.length === 0 && !showClayOwner && !showClayBroker && !showClayPm) return null

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

        // T2 inference: person contacts without a company → attach to PM or owner org
        const inferredOrg = key === 'property_manager' ? building.pm_name
          : key === 'owner' ? building.owner_name : null
        const allT2Candidates = inferredOrg
          ? standalone.filter((c: any) => c.ai_entity_type === 'person' || c.ai_entity_type === null)
          : []
        // When Clay PM differs from gov PM, route clay_web contacts to Clay PM block
        const clayT2Persons = showClayPm ? allT2Candidates.filter((c: any) => c.source === 'clay_web') : []
        const t2Persons = showClayPm
          ? allT2Candidates.filter((c: any) => c.source !== 'clay_web')
          : allT2Candidates
        const trueStandalone = standalone.filter((c: any) => !allT2Candidates.includes(c))
        const companies = Object.entries(byCompany)
        let allEntries: any[] = [
          ...companies.map(([name, cs]) => {
            const dates = cs.map((c: any) => c.source_date).filter(Boolean).sort().reverse()
            const latestDate = dates[0] || null
            const isFire = cs.some((c: any) => c.source === 'nyc_dob_plumbing')
            const permitLabel = key === 'trade_referral'
              ? (isFire ? 'FIRE SYSTEM' : cs.some((c: any) => c.source === 'nyc_dob_bis') ? 'PERMIT' : null)
              : null
            return {
              type: 'company',
              name, // raw business_name — used as key and for org matching
              displayName: cs[0]?.ai_corrected_name || name, // corrected for display only
              contacts: cs,
              latestDate,
              isFire,
              permitLabel,
              isPinned: false,
            }
          }),
          ...trueStandalone.map(c => ({ type: 'person', contact: c })),
        ]

        // For owner section: merge ownerOrgs into allEntries for unified confidence-based sorting
        if (key === 'owner') {
          for (const o of ownerOrgs) {
            if (!allEntries.some((e: any) => e.type === 'company' && normalizeName(e.name) === normalizeName(o.business_name))) {
              allEntries.push({
                type: 'company', name: o.business_name, displayName: o.business_name,
                contacts: [], fallbackOrg: o, confOverride: o.confidence,
                latestDate: null, isFire: false, permitLabel: null, isPinned: false,
              })
            }
          }
        }

        if (key === 'trade_referral') {
          // Sort companies by most recent source_date DESC
          allEntries.sort((a: any, b: any) => {
            if (a.type !== 'company') return 1
            if (b.type !== 'company') return -1
            if (!a.latestDate && !b.latestDate) return 0
            if (!a.latestDate) return 1
            if (!b.latestDate) return -1
            return b.latestDate.localeCompare(a.latestDate)
          })
          // Pin most recent fire contractor to top
          const fireIdx = allEntries.findIndex((e: any) => e.type === 'company' && e.isFire)
          if (fireIdx >= 0) {
            allEntries[fireIdx] = { ...allEntries[fireIdx], isPinned: true }
            if (fireIdx > 0) {
              const [fireEntry] = allEntries.splice(fireIdx, 1)
              allEntries.unshift(fireEntry)
            }
          }
        } else {
          // Sort by confidence DESC, phone presence as tiebreaker
          const entryConf = (e: any): number => {
            if (e.type === 'company') {
              const orgConf = (findOrgForName(e.name) || e.fallbackOrg)?.confidence ?? null
              const contactConf = e.contacts.length > 0 ? Math.max(...e.contacts.map((c: any) => c.confidence ?? 0)) : null
              return e.confOverride ?? orgConf ?? contactConf ?? 0
            }
            return e.contact?.confidence ?? 0
          }
          const entryHasPhone = (e: any): boolean => {
            if (e.type === 'company') {
              const org = findOrgForName(e.name) || e.fallbackOrg
              if (org?.phone) return true
              return (phoneNumbers || []).some((p: any) => p.org_id === org?.id)
            }
            return (phoneNumbers || []).some((p: any) => p.contact_id === e.contact?.id)
          }
          allEntries.sort((a: any, b: any) => {
            const confDiff = entryConf(b) - entryConf(a)
            if (confDiff !== 0) return confDiff
            return (entryHasPhone(b) ? 1 : 0) - (entryHasPhone(a) ? 1 : 0)
          })
        }

        // Apply manual ordering if user has reordered
        const entryKey = (e: any) => e.type === 'company' ? `co:${e.name}` : `pe:${e.contact?.id}`
        const storedOrder = contactOrder[key]
        if (storedOrder && storedOrder.length > 0) {
          const keyMap = new Map(allEntries.map(e => [entryKey(e), e]))
          const ordered = storedOrder.map((k: string) => keyMap.get(k)).filter(Boolean) as any[]
          const seen = new Set(storedOrder)
          const extra = allEntries.filter(e => !seen.has(entryKey(e)))
          allEntries = [...ordered, ...extra]
        }
        const orderedKeys = allEntries.map(entryKey)

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
                <span style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>{label}</span>
                <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{allEntries.length + (showPmOrg ? 1 : 0) + (showClayPm ? 1 : 0)}</span>
              </div>
              <span style={{ ...m, fontSize: 12, color: '#8C8070' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <>
                <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: 8, lineHeight: 1.5 }}>{hint}</div>

                {showClayPm && renderCompanyBlock(clayPmRaw!, clayT2Persons, undefined, clayPmConf != null ? Math.round(clayPmConf * 100) : null, null, null, false, clayPmConf)}
                {showPmOrg && renderCompanyBlock(building.pm_name, t2Persons, undefined, building.pm_confidence, null, null, t2Persons.length > 0, govPmWebConf)}
                {showPmOrg && pmContractorTradeKeys.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <button onClick={() => toggleGroup('pm_contractors')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ ...m, fontSize: 11, color: '#8C8070', letterSpacing: '0.8px' }}>
                        {expandedGroups.has('pm_contractors') ? '▲' : '▼'} COMMON CONTRACTORS ACROSS PORTFOLIO
                      </span>
                    </button>
                    {expandedGroups.has('pm_contractors') && (
                      <div style={{ borderLeft: '2px solid #F0EDE8', paddingLeft: 10, marginTop: 4 }}>
                        {pmContractorTradeKeys.map(tt => (
                          <div key={tt} style={{ marginBottom: 8 }}>
                            <div style={{ ...m, fontSize: 10, letterSpacing: '1px', color: FIRE_TRADES.has(tt) ? '#E8A020' : '#8C8070', fontWeight: 700, marginBottom: 4 }}>{TRADE_LABEL[tt] || tt.toUpperCase()}</div>
                            {pmCommonContractors[tt].map((c: any) => (
                              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                <span style={{ ...m, fontSize: 12, color: '#1C2B2B' }}>{c.name}</span>
                                <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{c.parcel_count} bldgs</span>
                                {c.phone && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{c.phone}</span>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {showClayOwner && renderCompanyBlock(
                  clayOwner!,
                  [],
                  undefined,
                  building.web_enrichment_raw?.owner_confidence != null ? Math.round(building.web_enrichment_raw.owner_confidence * 100) : null,
                  null, null, false,
                  building.web_enrichment_raw?.owner_confidence ?? null
                )}
                {showClayBroker && renderCompanyBlock(
                  clayBroker!,
                  [],
                  undefined,
                  building.web_enrichment_raw?.broker_confidence != null ? Math.round(building.web_enrichment_raw.broker_confidence * 100) : null,
                  null, null, false,
                  building.web_enrichment_raw?.broker_confidence ?? null
                )}

                {visible.map((entry: any, i) => {
                  const eKey = entryKey(entry)
                  const eIdx = orderedKeys.indexOf(eKey)
                  const canUp = eIdx > 0
                  const canDown = eIdx < orderedKeys.length - 1
                  const reorderBtns = (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                      <button onClick={() => moveEntry(key, orderedKeys, eKey, 'up')} disabled={!canUp}
                        style={{ background: 'none', border: 'none', cursor: canUp ? 'pointer' : 'default', padding: '1px 4px', ...m, fontSize: 11, color: canUp ? '#8C8070' : '#E8E4DC', lineHeight: 1 }}>▲</button>
                      <button onClick={() => moveEntry(key, orderedKeys, eKey, 'down')} disabled={!canDown}
                        style={{ background: 'none', border: 'none', cursor: canDown ? 'pointer' : 'default', padding: '1px 4px', ...m, fontSize: 11, color: canDown ? '#8C8070' : '#E8E4DC', lineHeight: 1 }}>▼</button>
                    </div>
                  )
                  if (entry.type === 'company') return (
                    <div key={eKey} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: entry.isPinned ? 12 : 0, ...(entry.isPinned ? { outline: '2px solid #E8A020', outlineOffset: -1 } : {}) }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {entry.isPinned && (
                          <div style={{ background: '#E8A020', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ ...m, fontSize: 10, color: '#1C2B2B', fontWeight: 700, letterSpacing: '1px' }}>MOST RECENT FIRE CONTRACTOR</span>
                          </div>
                        )}
                        {renderCompanyBlock(entry.displayName || entry.name, entry.contacts, entry.fallbackOrg, entry.confOverride ?? undefined,
                          key === 'trade_referral' && entry.latestDate ? fmtDate(entry.latestDate) : null,
                          entry.permitLabel ?? null, false, getClayWebConf(entry.name)
                        )}
                        <button
                          onClick={() => { entry.contacts.forEach((c: any) => markContactBad(c.id)) }}
                          style={{ position: 'absolute', top: entry.isPinned ? 34 : 10, right: 36, background: 'none', border: 'none', ...m, fontSize: 11, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >wrong</button>
                      </div>
                      {reorderBtns}
                    </div>
                  )
                  return (
                    <div key={eKey} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
                      <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ ...m, fontSize: 13, color: '#1C2B2B' }}>
                            {entry.contact.first_name} {entry.contact.last_name || ''}
                            {entry.contact.confidence && <span style={{ ...m, fontSize: 11, color: '#C8C1B3', marginLeft: 8 }}>{entry.contact.confidence}%</span>}
                          </span>
                          {entry.contact.title && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{entry.contact.title}</span>}
                          {entry.contact.source === 'clay_web' && (
                            <span style={{ ...m, fontSize: 10, color: '#2A7A4B', background: '#D4EEE0', border: '1px solid #A8D5B5', padding: '2px 7px', letterSpacing: '0.5px', fontWeight: 700 }}>🌐 WEB</span>
                          )}
                          <button onClick={() => markContactBad(entry.contact.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 11, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline', marginLeft: 'auto' }}>
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
                      {reorderBtns}
                    </div>
                  )
                })}

                {hidden > 0 && (
                  <button onClick={() => toggleGroup(key)} style={{ ...m, fontSize: 12, color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    + {hidden} more
                  </button>
                )}

                {/* Add contact form */}
                {addContact?.sectionKey === key ? (
                  <div style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '12px 14px', marginTop: 8 }}>
                    <div style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 10 }}>ADD CONTACT</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input placeholder="Company name" value={addContact.businessName} onChange={e => setAddContact(a => a && ({ ...a, businessName: e.target.value }))}
                        style={{ padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 13, outline: 'none', background: '#FFF' }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input placeholder="First name" value={addContact.firstName} onChange={e => setAddContact(a => a && ({ ...a, firstName: e.target.value }))}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 13, outline: 'none', background: '#FFF' }} />
                        <input placeholder="Last name" value={addContact.lastName} onChange={e => setAddContact(a => a && ({ ...a, lastName: e.target.value }))}
                          style={{ flex: 1, padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 13, outline: 'none', background: '#FFF' }} />
                      </div>
                      <input placeholder="Phone (optional)" value={addContact.phone} onChange={e => setAddContact(a => a && ({ ...a, phone: e.target.value }))}
                        style={{ padding: '6px 8px', border: '1px solid #C8C1B3', ...m, fontSize: 13, outline: 'none', background: '#FFF' }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button onClick={saveNewContact} disabled={savingContact}
                          style={{ padding: '7px 14px', background: '#E8A020', color: '#1C2B2B', border: 'none', ...m, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>
                          {savingContact ? '...' : 'SAVE'}
                        </button>
                        <button onClick={() => setAddContact(null)}
                          style={{ background: 'none', border: 'none', ...m, fontSize: 13, color: '#8C8070', cursor: 'pointer' }}>
                          cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddContact({ sectionKey: key, firstName: '', lastName: '', businessName: '', phone: '' })}
                    style={{ ...m, fontSize: 12, letterSpacing: '1.5px', color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0 0' }}>
                    + ADD CONTACT
                  </button>
                )}
              </>
            )}
          </div>
        )
      })}
      {contacts?.length === 0 && !building.pm_name && (
        <div style={{ ...m, fontSize: 14, color: '#8C8070' }}>No contacts found.</div>
      )}

      {/* ── CONTRACTORS section — from permitOrgs, grouped by trade ── */}
      {totalContractors > 0 && (() => {
        const isExpanded = expandedGroups.has('trade_referral')
        return (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => toggleGroup('trade_referral')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 6px 0', borderBottom: '2px solid #1C2B2B', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>CONTRACTORS</span>
                <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{totalContractors}</span>
              </div>
              <span style={{ ...m, fontSize: 12, color: '#8C8070' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>
            {isExpanded && (
              <>
                <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: 8, lineHeight: 1.5 }}>
                  Fire trades = incumbent to displace. All others = referral sources who know the PM.
                </div>
                {contractorTradeKeys.map(tt => {
                  const contractors = contractorsByTrade[tt]
                  const isFire = FIRE_TRADES.has(tt)
                  return (
                    <div key={tt} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ ...m, fontSize: 10, letterSpacing: '1.2px', fontWeight: 700, padding: '2px 6px',
                          color: isFire ? '#1C2B2B' : '#8C8070',
                          background: isFire ? '#E8A020' : '#F0EDE8',
                        }}>{TRADE_LABEL[tt] || tt.toUpperCase()}</span>
                        {isFire && <span style={{ ...m, fontSize: 10, color: '#E8A020', letterSpacing: '0.8px' }}>FIRE INCUMBENT</span>}
                      </div>
                      {contractors.map((c: ContractorEntry) => (
                        <div key={c.name} style={{
                          background: '#FFFFFF', border: `1px solid ${isFire ? '#E8A020' : '#C8C1B3'}`,
                          padding: '8px 12px', marginBottom: 6,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: c.phone ? 2 : 0 }}>
                            <span style={{ ...m, fontSize: 13, color: '#1C2B2B', fontWeight: 700 }}>{c.name}</span>
                            {c.phone && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{c.phone}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                            {c.dates.slice(0, 3).map((d: string, i: number) => (
                              <span key={i} style={{ ...m, fontSize: 10, color: '#C8C1B3' }}>{fmtDate(d)}</span>
                            ))}
                            {c.dates.length > 3 && <span style={{ ...m, fontSize: 10, color: '#C8C1B3' }}>+{c.dates.length - 3} more</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )
      })()}
    </div>
  )}

  // ── Signal row ───────────────────────────────────────────────────────────

  const renderSignalRow = (sig: any, i: number) => {
    const isSuperseded = supersededIds.has(sig.id)
    const w = signalWeight(isSuperseded ? { ...sig, is_open: false } : sig)
    const charges = sig.raw_data?.charges || []
    // Use highest-severity charge for display, not just first
    const charge = charges.length
      ? [...charges].sort((a: any, b: any) => (CHARGE_WEIGHT[b.code] ?? 0) - (CHARGE_WEIGHT[a.code] ?? 0))[0]
      : null
    const totalFine = charges.reduce((s: number, c: any) => s + Number(c.amount || 0), 0)
    const filingStatus = (sig.raw_data?.filing_status || '').toLowerCase()
    const contractorEngaged = sig.signal_type === 'permit_renovation_fire' && CONTRACTOR_ENGAGED_STATUSES.has(filingStatus)
    const isProximity = sig.signal_type === 'fire_incident_proximity'
    const isEcb = sig.signal_type === 'violation_ecb'
    const proximityStreet = sig.raw_data?.incident_street
    const proximityType = sig.raw_data?.incident_type?.replace(/^\d+\s*-\s*/, '')
    const accent = contractorEngaged || isSuperseded ? '#C8C1B3' : signalAccent(w)

    return (
      <div key={sig.id || i} style={{
        display: 'flex', gap: 10, padding: '10px 12px',
        background: '#FFFFFF', border: '1px solid #C8C1B3',
        borderLeft: `3px solid ${accent}`,
        marginBottom: 4,
        opacity: isSuperseded ? 0.6 : 1,
      }}>
        <div style={{ width: 6, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ ...m, fontSize: 12, color: '#1C2B2B' }}>{SIGNAL_LABELS[sig.signal_type] || sig.signal_type}</span>
            {charge?.code && <span style={{ ...m, fontSize: 11, color: '#E8A020', fontWeight: 700 }}>{charge.code}</span>}
            {isEcb && <span style={{ ...m, fontSize: 11, color: '#E8A020', fontWeight: 700 }}>ECB-{sig.raw_data?.ecb_tier || 'B'}</span>}
            {contractorEngaged && <span style={{ ...m, fontSize: 10, color: '#8C8070', border: '1px solid #C8C1B3', padding: '1px 4px' }}>CONTRACTOR ON SITE</span>}
            {isSuperseded && <span style={{ ...m, fontSize: 10, color: '#8C8070', border: '1px solid #C8C1B3', padding: '1px 4px' }}>SUPERSEDED</span>}
          </div>
          {charge && (
            <div style={{ ...m, fontSize: 12, color: '#8C8070', marginBottom: 2 }}>
              {CHARGE_LABELS[charge.code] || charge.description}
              {totalFine > 0 ? ` · $${totalFine.toLocaleString()} fine` : ''}
            </div>
          )}
          {isEcb && (
            <div style={{ ...m, fontSize: 12, color: '#8C8070', marginBottom: 2 }}>
              {sig.raw_data?.violation_description
                ? sig.raw_data.violation_description.slice(0, 80).toLowerCase().replace(/^./, (c: string) => c.toUpperCase())
                : 'Sprinkler / fire protection violation'}
            </div>
          )}
          {!charge && !isEcb && sig.raw_data?.job_type && (
            <div style={{ ...m, fontSize: 12, color: '#8C8070', marginBottom: 2 }}>
              {sig.raw_data.job_type}{filingStatus ? ` · ${sig.raw_data.filing_status}` : ''}
            </div>
          )}
          {sig.raw_data?.owner_contact && (
            <div style={{ ...m, fontSize: 12, color: '#8C8070', marginBottom: 2 }}>
              Filed by: {sig.raw_data.owner_contact}
            </div>
          )}
          <div style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>
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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ background: '#1C2B2B', padding: '0 16px 0 20px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2E3E3E', flexShrink: 0, gap: 12 }}>
          {/* Left: score + address + borough */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 }}>
            {displayScore != null && (
              <span style={{ ...m, fontSize: 14, fontWeight: 700, padding: '4px 10px', flexShrink: 0, ...scoreStyle }}>
                {displayScore}
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '2px', color: '#F7F4EE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {buildingAddress}
              </h2>
              {boroughFromParcelId(parcelId) && (
                <div style={{ ...m, fontSize: 13, color: '#8C8070', letterSpacing: '1px', marginTop: 1 }}>
                  {boroughFromParcelId(parcelId)}
                </div>
              )}
            </div>
          </div>
          {/* Right: compact identity + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <IdentityBar building={building} compact />
            <button onClick={onClose} title="Esc" style={{ ...m, fontSize: 18, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Stage — key forces remount when lead status changes externally (e.g. auto in_progress) */}
        <div style={{ flexShrink: 0 }}>
          <StagePipeline key={localLeadStatus ?? lead?.status ?? 'new'} parcelId={parcelId} initialStage={localLeadStatus ?? lead?.status ?? 'new'} leadId={lead?.id ?? null} />
        </div>

        {/* Why we're calling bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #C8C1B3', padding: '8px 20px', flexShrink: 0 }}>
          {/* Inline stats line */}
          {(building.building_sqft || totalFines > 0 || building.building_website) && (
            <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: whyCards.length > 0 || comboNote || incumbentNote ? 6 : 0, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              {building.building_sqft && (
                <span style={{ color: '#1C2B2B' }}>{Math.round(building.building_sqft / 1000)}k sqft{building.floors ? ` · ${building.floors} fl` : ''}</span>
              )}
              {building.building_sqft && totalFines > 0 && <span>·</span>}
              {totalFines > 0 && (
                <span>
                  <span style={{ color: openFines > 0 ? '#E8A020' : '#1C2B2B', fontWeight: openFines > 0 ? 700 : 400 }}>${openFines.toLocaleString()} open</span>
                  <span style={{ color: '#C8C1B3' }}> / ${totalFines.toLocaleString()} total</span>
                </span>
              )}
              {building.building_website && (totalFines > 0 || building.building_sqft) && <span>·</span>}
              {building.building_website && (
                <a href={building.building_website} target="_blank" rel="noopener noreferrer"
                  style={{ ...m, fontSize: 11, color: '#2A7A4B', textDecoration: 'underline' }}>
                  {building.building_website.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 28)} ↗
                </a>
              )}
            </div>
          )}

          {/* Score-driven signal cards — horizontal */}
          {whyCards.length > 0 && (
            <div>
              <div style={{ ...m, fontSize: 10, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 6 }}>WHY WE'RE CALLING</div>
              <div style={{ display: 'flex', gap: 0 }}>
                {whyCards.map((card, i) => (
                  <div key={i} style={{
                    flex: 1, minWidth: 0,
                    borderLeft: `3px solid ${card.color}`,
                    paddingLeft: 10,
                    paddingRight: 12,
                  }}>
                    <div style={{ ...m, fontSize: 10, letterSpacing: '0.8px', color: card.color, fontWeight: 700, marginBottom: 2 }}>{card.tag}</div>
                    <div style={{ ...m, fontSize: 12, color: '#1C2B2B', fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{card.headline}</div>
                    {card.detail && <div style={{ ...m, fontSize: 11, color: '#8C8070' }}>{card.detail}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combo + competitive — single compact line */}
          {(comboNote || incumbentNote) && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {comboNote && (
                <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>
                  <span style={{ color: '#C0392B', fontWeight: 700 }}>COMBO </span>{comboNote}
                </span>
              )}
              {incumbentNote && (
                <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>
                  <span style={{ fontWeight: 700 }}>COMPETITIVE </span>{incumbentNote}
                </span>
              )}
            </div>
          )}

          {whyCards.length === 0 && !building.building_sqft && totalFines === 0 && (
            <div style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>No active signals</div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F7F4EE', borderBottom: '1px solid #C8C1B3', flexShrink: 0 }}>
          {([['main', 'OUTREACH'], ['signals', 'SIGNALS'], ['portfolio', 'PORTFOLIO']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px 0',
              ...m, fontSize: 12, letterSpacing: '1.5px',
              color: tab === key ? '#1C2B2B' : '#8C8070',
              background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid #1C2B2B' : '2px solid transparent',
              cursor: 'pointer', fontWeight: tab === key ? 700 : 400,
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          {/* OUTREACH tab */}
          {tab === 'main' && (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
              <div style={{ overflowY: 'auto', padding: '16px 16px 40px 20px', borderRight: '1px solid #C8C1B3' }}>
                <div style={{ ...m, fontSize: 11, letterSpacing: '2px', color: '#8C8070', marginBottom: 12 }}>WHO TO CALL</div>
                {renderContacts()}
              </div>
              <div style={{ overflowY: 'auto', padding: '16px 20px 40px 16px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ ...m, fontSize: 11, letterSpacing: '2px', color: '#8C8070' }}>TASKS</div>
                    <button
                      onClick={() => setManualDialInput('')}
                      style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#E8A020', background: 'none', border: '1px solid #E8A020', cursor: 'pointer', padding: '3px 10px' }}
                    >DIAL</button>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                    <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...m, fontSize: 11, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                    <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
                  </div>
                </div>
                <div>
                  <div style={{ ...m, fontSize: 11, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>ACTIVITY</div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '10px 12px' }}>
                    {activityLog?.length > 0 ? activityLog.map((entry: any, i: number) => (
                      <div key={entry.id} style={{ padding: '8px 0', borderBottom: i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ ...m, fontSize: 11, color: '#F7F4EE', padding: '2px 7px', background: entry.outcome === 'connected' ? '#1C2B2B' : '#8C8070' }}>
                            {entry.outcome?.toUpperCase() || 'CALL'}
                          </span>
                          <span style={{ ...m, fontSize: 12, color: '#8C8070' }}>
                            {fmtDateTime(entry.contacted_at)}
                          </span>
                          {entry.duration_secs && <span style={{ ...m, fontSize: 12, color: '#8C8070' }}>{Math.floor(entry.duration_secs / 60)}m{entry.duration_secs % 60}s</span>}
                        </div>
                        {entry.notes && <div style={{ ...m, fontSize: 13, color: '#1C2B2B', lineHeight: 1.6, marginBottom: 4 }}>{entry.notes}</div>}
                        <TranscriptViewer transcript={entry.transcript || null} recordingUrl={entry.recording_url || null} />
                      </div>
                    )) : <div style={{ ...m, fontSize: 13, color: '#8C8070' }}>No activity yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIGNALS tab */}
          {tab === 'signals' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
              {/* Fire incumbent — prefer new incumbents jsonb, fall back to scalar */}
              {(() => {
                const fi = building.incumbents?.fire_suppression || building.incumbents?.sprinkler
                const name = fi?.name || building.incumbent_name
                const staleness = fi?.staleness || building.incumbent_staleness
                const lastJob = fi?.last_job || building.incumbent_last_job
                const nJobs = fi?.n_jobs || building.incumbent_n_jobs
                const phone = fi?.phone || null
                if (!name) return null
                const isStale = staleness && staleness.includes('stale')
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>FIRE INCUMBENT</div>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E8A020', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ ...m, fontSize: 14, color: '#1C2B2B', fontWeight: 700 }}>{name}</span>
                        {staleness && (
                          <span style={{ ...m, fontSize: 10, padding: '2px 6px', color: isStale ? '#E8A020' : '#8C8070', border: `1px solid ${isStale ? '#E8A020' : '#8C8070'}` }}>
                            {staleness.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        )}
                        {phone && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{phone}</span>}
                      </div>
                      {lastJob && <div style={{ ...m, fontSize: 12, color: '#8C8070' }}>Last job: {fmtDate(lastJob)}{nJobs ? ` · ${nJobs} jobs on record` : ''}</div>}
                      <div style={{ ...m, fontSize: 11, color: '#8C8070', marginTop: 4 }}>This is who you're displacing.</div>
                    </div>
                  </div>
                )
              })()}

              {openSignals.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 10 }}>
                    <span style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700 }}>OPEN</span>
                    <span style={{ ...m, fontSize: 11, color: '#E8A020' }}>{openSignals.length}</span>
                    <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>active / unresolved</span>
                  </div>
                  {openSignals.map(renderSignalRow)}
                </div>
              )}

              {closedSignals.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '2px solid #C8C1B3', marginBottom: 10 }}>
                    <span style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#8C8070', fontWeight: 700 }}>CLOSED</span>
                    <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{closedSignals.length}</span>
                    <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>compliance history</span>
                  </div>
                  {closedSignals.map(renderSignalRow)}
                </div>
              )}

              {thisSignals.length === 0 && (
                <div style={{ ...m, fontSize: 14, color: '#8C8070', marginBottom: 20 }}>No verified signals for this address.</div>
              )}

              {/* Wrong-address signals collapsed at bottom */}
              {wrongAddrSignals.length > 0 && (
                <div style={{ opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '1px dashed #C8C1B3', marginBottom: 10 }}>
                    <span style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#8C8070', fontWeight: 700 }}>UNVERIFIED ADDRESS</span>
                    <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>{wrongAddrSignals.length}</span>
                    <span style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>signals matched to this parcel but different street address</span>
                  </div>
                  {wrongAddrSignals.map(renderSignalRow)}
                </div>
              )}
            </div>
          )}

          {/* PORTFOLIO tab */}
          {tab === 'portfolio' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
              {building.pm_name && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700, paddingBottom: 6, borderBottom: '2px solid #1C2B2B', marginBottom: 4 }}>
                    {building.pm_name}
                  </div>
                  <div style={{ ...m, fontSize: 11, color: '#8C8070', marginBottom: 12 }}>
                    Common contractors across this PM's portfolio — call these to reach the PM or understand their vendor relationships.
                  </div>
                  {pmContractorTradeKeys.length === 0 && (
                    <div style={{ ...m, fontSize: 13, color: '#8C8070' }}>No portfolio contractor data yet for this PM.</div>
                  )}
                  {pmContractorTradeKeys.map(tt => {
                    const isFire = FIRE_TRADES.has(tt)
                    return (
                      <div key={tt} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ ...m, fontSize: 10, letterSpacing: '1.2px', fontWeight: 700, padding: '2px 6px',
                            color: isFire ? '#1C2B2B' : '#8C8070',
                            background: isFire ? '#E8A020' : '#F0EDE8',
                          }}>{TRADE_LABEL[tt] || tt.toUpperCase()}</span>
                        </div>
                        {pmCommonContractors[tt].map((c: any) => (
                          <div key={c.name} style={{ background: '#FFFFFF', border: `1px solid ${isFire ? '#E8A020' : '#C8C1B3'}`, padding: '8px 12px', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ ...m, fontSize: 13, color: '#1C2B2B', fontWeight: 700 }}>{c.name}</span>
                              <span style={{ ...m, fontSize: 11, color: '#C8C1B3', background: '#F7F4EE', padding: '1px 5px' }}>{c.parcel_count} buildings</span>
                              {c.phone && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{c.phone}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
              {!building.pm_name && (
                <div style={{ ...m, fontSize: 13, color: '#8C8070' }}>No PM identified for this building.</div>
              )}

              {/* Per-building contractors for this property */}
              {contractorTradeKeys.length > 0 && (
                <div>
                  <div style={{ ...m, fontSize: 11, letterSpacing: '1.5px', color: '#1C2B2B', fontWeight: 700, paddingBottom: 6, borderBottom: '2px solid #C8C1B3', marginBottom: 12 }}>
                    CONTRACTORS AT THIS BUILDING
                  </div>
                  {contractorTradeKeys.map(tt => {
                    const contractors = contractorsByTrade[tt]
                    const isFire = FIRE_TRADES.has(tt)
                    return (
                      <div key={tt} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ ...m, fontSize: 10, letterSpacing: '1.2px', fontWeight: 700, padding: '2px 6px',
                            color: isFire ? '#1C2B2B' : '#8C8070',
                            background: isFire ? '#E8A020' : '#F0EDE8',
                          }}>{TRADE_LABEL[tt] || tt.toUpperCase()}</span>
                        </div>
                        {contractors.map((c: ContractorEntry) => (
                          <div key={c.name} style={{ background: '#FFFFFF', border: `1px solid ${isFire ? '#E8A020' : '#C8C1B3'}`, padding: '8px 12px', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                              <span style={{ ...m, fontSize: 13, color: '#1C2B2B', fontWeight: 700 }}>{c.name}</span>
                              {c.phone && <span style={{ ...m, fontSize: 11, color: '#8C8070' }}>{c.phone}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {c.dates.slice(0, 3).map((d: string, i: number) => (
                                <span key={i} style={{ ...m, fontSize: 10, color: '#C8C1B3' }}>{fmtDate(d)}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual dial side panel — number entry before handing off to DialerPanel */}
      {manualDialInput !== null && !activeDial && (
        <div style={{ width: 360, flexShrink: 0, background: '#1C2B2B', borderLeft: '2px solid #E8A020', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ ...m, fontSize: 12, letterSpacing: '2px', color: '#8C8070' }}>MANUAL DIAL</span>
            <button onClick={() => setManualDialInput(null)} style={{ background: 'none', border: 'none', color: '#8C8070', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          </div>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
            <p style={{ ...m, fontSize: 13, color: '#8C8070', margin: '0 0 10px 0' }}>{buildingAddress}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, background: '#0E1A1A', border: '1px solid #2E3E3E', padding: '8px 12px', ...m, fontSize: 16, color: '#F7F4EE', letterSpacing: '2px', minHeight: 36 }}>
                {manualDialInput || <span style={{ color: '#2E3E3E' }}>—</span>}
              </div>
              <button onClick={() => setManualDialInput(p => (p ?? '').slice(0, -1))} style={{ background: 'none', border: 'none', color: '#8C8070', cursor: 'pointer', ...m, fontSize: 16, padding: '4px 6px' }}>⌫</button>
            </div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']].map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {row.map(k => (
                  <button
                    key={k}
                    onClick={() => setManualDialInput(p => (p ?? '') + k)}
                    style={{ background: '#2E3E3E', border: 'none', color: '#F7F4EE', ...m, fontSize: 16, padding: '12px 0', cursor: 'pointer' }}
                  >{k}</button>
                ))}
              </div>
            ))}
            <button
              disabled={!manualDialInput}
              onClick={() => {
                if (!manualDialInput) return
                const digits = manualDialInput.replace(/\D/g, '')
                const e164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : manualDialInput
                setActiveDial({ phoneNumber: e164, contactId: '', contactName: 'Manual Dial' })
                setManualDialInput(null)
              }}
              style={{ marginTop: 4, background: manualDialInput ? '#E8A020' : '#2E3E3E', border: 'none', color: manualDialInput ? '#1C2B2B' : '#8C8070', ...m, fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', padding: '13px 0', cursor: manualDialInput ? 'pointer' : 'default' }}
            >CALL</button>
          </div>
        </div>
      )}

      {/* Dialer side panel — renders alongside content, not as overlay */}
      {activeDial && (
        <DialerPanel
          parcelId={parcelId}
          contactId={activeDial.contactId}
          contactName={activeDial.contactName}
          phoneNumber={activeDial.phoneNumber}
          buildingAddress={buildingAddress}
          signalBrief={signalBrief}
          leadId={lead?.id ?? null}
          onCallStarted={handleCallStarted}
          onClose={() => setActiveDial(null)}
        />
      )}
    </div>
  )
}
