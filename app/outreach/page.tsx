import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OutreachListClient from '@/app/components/outreach/OutreachListClient'

export const dynamic = 'force-dynamic'

type FilterTab = 'properties' | 'managers' | 'owners' | 'contractors' | 'brokers' | 'incumbents'

const FETCH_CHUNK = 1000

async function fetchAllRows(fetcher: (start: number) => Promise<{ data: any[] | null; error: any }>): Promise<any[]> {
  const results: any[] = []
  let start = 0
  while (true) {
    const { data, error } = await fetcher(start)
    if (error) throw error
    if (!data?.length) break
    results.push(...data)
    if (data.length < FETCH_CHUNK) break
    start += FETCH_CHUNK
  }
  return results
}

async function getListData(filter: FilterTab) {
  const supabase = await createClient()

  // Fetch all leads (scored buildings only) — this is the primary data source
  const leadsData = await fetchAllRows((start) =>
    supabase
      .from('leads')
      .select('parcel_id, id, status, score, pm_name, pm_confidence, pm_phone, has_pm_contact, incumbent_name, incumbent_staleness, last_called_at, call_count, next_followup_at')
      .range(start, start + FETCH_CHUNK - 1) as any
  )

  // Fetch building_intelligence for address + fines data
  const biData = await fetchAllRows((start) =>
    supabase
      .from('building_intelligence')
      .select('parcel_id, address, open_violation_count, incumbent_last_job, open_fines_total, total_fines')
      .not('building_class', 'like', 'Y%')
      .range(start, start + FETCH_CHUNK - 1) as any
  )

  const biMap = Object.fromEntries((biData || []).map((b: any) => [b.parcel_id, b]))

  // Fetch addresses from properties for all lead parcel_ids (fallback for non-Manhattan buildings
  // where building_intelligence has no row)
  const leadParcelIds = (leadsData || []).map((l: any) => l.parcel_id)

  const propAddressData: any[] = []
  for (let i = 0; i < leadParcelIds.length; i += 500) {
    const { data } = await supabase
      .from('properties')
      .select('parcel_id, address')
      .in('parcel_id', leadParcelIds.slice(i, i + 500))
    if (data) propAddressData.push(...data)
  }
  const propMap = Object.fromEntries(propAddressData.map((p: any) => [p.parcel_id, p.address]))

  // For parcels with no BI row, or BI row with no fines populated (outer boroughs), compute from signals
  const outerParcelIds = leadParcelIds.filter((id: string) => {
    const bi = biMap[id]
    return !bi || (!bi.open_fines_total && !bi.total_fines)
  })
  const violationSigData: any[] = []
  for (let i = 0; i < outerParcelIds.length; i += 500) {
    const { data } = await supabase
      .from('signals')
      .select('parcel_id, signal_type, is_open, raw_data')
      .in('parcel_id', outerParcelIds.slice(i, i + 500))
      .in('signal_type', ['violation_fire', 'violation_ecb'])
    if (data) violationSigData.push(...data)
  }
  const sigViolMap: Record<string, { open_violation_count: number; open_fines_total: number; total_fines: number }> = {}
  for (const sig of violationSigData) {
    if (!sigViolMap[sig.parcel_id]) sigViolMap[sig.parcel_id] = { open_violation_count: 0, open_fines_total: 0, total_fines: 0 }
    const charges: any[] = sig.raw_data?.charges || []
    const chargeTotal = charges.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0)
    sigViolMap[sig.parcel_id].total_fines += chargeTotal
    if (sig.is_open) {
      sigViolMap[sig.parcel_id].open_violation_count++
      sigViolMap[sig.parcel_id].open_fines_total += chargeTotal
    }
  }

  // Build contact info set from leads data we already fetched (no extra queries).
  // pm_phone or has_pm_contact means we have contact info for that building.
  const contactInfoSet = new Set<string>()
  for (const lead of leadsData || []) {
    if (lead.pm_phone || lead.has_pm_contact) contactInfoSet.add(lead.parcel_id)
  }

  // Also check phone_numbers table — small table (< 2k rows), single paginated fetch
  const activePhoneNumbers = await fetchAllRows((start) =>
    supabase
      .from('phone_numbers')
      .select('parcel_id')
      .not('parcel_id', 'is', null)
      .neq('status', 'stale')
      .range(start, start + FETCH_CHUNK - 1) as any
  )
  for (const r of activePhoneNumbers) {
    if (r.parcel_id) contactInfoSet.add(r.parcel_id)
  }

  // Check organizations for owner/PM phone or website — use a single batched query
  // that only selects DISTINCT parcel_id to keep result size small
  const parcelIdsNotYetMatched = leadParcelIds.filter((id: string) => !contactInfoSet.has(id))
  for (let i = 0; i < parcelIdsNotYetMatched.length; i += 500) {
    const batchIds = parcelIdsNotYetMatched.slice(i, i + 500)
    const { data } = await supabase
      .from('organizations')
      .select('parcel_id')
      .in('parcel_id', batchIds)
      .or('phone.not.is.null,website.not.is.null')
      .limit(500)
    for (const r of data || []) contactInfoSet.add(r.parcel_id)
  }

  // Build rows from leads (leads-first — only scored buildings appear)
  const rows = (leadsData || []).map((lead: any) => {
    const bi = biMap[lead.parcel_id] || {}
    return {
      parcel_id:            lead.parcel_id,
      address:              bi.address || propMap[lead.parcel_id] || lead.parcel_id,
      signal_score:         lead.score,
      pm_name:              lead.pm_name,
      pm_confidence:        lead.pm_confidence,
      open_violation_count: bi.open_violation_count || sigViolMap[lead.parcel_id]?.open_violation_count || null,
      open_fines_total:     bi.open_fines_total     || sigViolMap[lead.parcel_id]?.open_fines_total     || null,
      total_fines:          bi.total_fines           || sigViolMap[lead.parcel_id]?.total_fines           || null,
      incumbent_name:       lead.incumbent_name,
      incumbent_staleness:  lead.incumbent_staleness,
      incumbent_last_job:   bi.incumbent_last_job ?? null,
      lead: {
        id:               lead.id,
        status:           lead.status,
        last_called_at:   lead.last_called_at,
        call_count:       lead.call_count,
        next_followup_at: lead.next_followup_at,
      },
    }
  })

  // Sort by score desc
  rows.sort((a: any, b: any) => (b.signal_score ?? -1) - (a.signal_score ?? -1))

  // For org-centric tabs, fetch relevant contacts
  let contacts: any[] = []
  if (filter === 'owners' || filter === 'contractors' || filter === 'brokers') {
    if (filter === 'contractors') {
      contacts = await fetchAllRows((start) =>
        supabase
          .from('contacts')
          .select('parcel_id, business_name, contact_type, first_name, last_name, confidence, source_date, source')
          .in('contact_type', ['trade_referral', 'permit_applicant'])
          .neq('is_bad_data', true)
          .not('business_name', 'is', null)
          .range(start, start + FETCH_CHUNK - 1) as any
      )
    } else {
      const contactType = filter === 'owners' ? 'owner' : 'leasing_broker'
      contacts = await fetchAllRows((start) =>
        supabase
          .from('contacts')
          .select('parcel_id, business_name, contact_type, first_name, last_name, confidence, source_date')
          .eq('contact_type', contactType)
          .neq('is_bad_data', true)
          .not('business_name', 'is', null)
          .range(start, start + FETCH_CHUNK - 1) as any
      )
    }
  }

  // Get tasks due today (for badge)
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select('parcel_id')
    .lte('due_date', today)
    .is('completed_at', null)

  const tasksSet = new Set((todayTasks || []).map((t) => t.parcel_id))

  return { rows, contacts, tasksSet: Array.from(tasksSet), contactInfoParcelIds: Array.from(contactInfoSet) }
}

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/client-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!roleRow || (roleRow.role !== 'internal' && roleRow.role !== 'admin')) {
    redirect('/dashboard')
  }

  const resolvedParams = await searchParams
  const rawFilter = resolvedParams.filter
  const filter: FilterTab =
    rawFilter === 'managers' || rawFilter === 'owners' || rawFilter === 'contractors' || rawFilter === 'brokers' || rawFilter === 'incumbents'
      ? rawFilter
      : 'properties'

  const { rows, contacts, tasksSet, contactInfoParcelIds } = await getListData(filter)

  return (
    <OutreachListClient
      initialRows={rows}
      contacts={contacts}
      filter={filter}
      tasksParcelIds={tasksSet}
      contactInfoParcelIds={contactInfoParcelIds}
    />
  )
}
