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

  // Fetch from the outreach_list view — replaces separate leads + BI + properties queries
  // ORDER BY parcel_id is critical: without deterministic ordering, .range() pagination
  // can return the same row in multiple pages (Postgres doesn't guarantee order without ORDER BY).
  // Also fetch tasks in parallel.
  const [listData, { data: todayTasks }] = await Promise.all([
    fetchAllRows((start) =>
      supabase
        .from('outreach_list')
        .select('*')
        .order('parcel_id')
        .range(start, start + FETCH_CHUNK - 1) as any
    ),
    supabase
      .from('tasks')
      .select('parcel_id')
      .lte('due_date', new Date().toISOString().split('T')[0])
      .is('completed_at', null),
  ])

  // For parcels with no BI fines (outer boroughs), compute from signals
  const outerParcelIds = (listData || [])
    .filter((r: any) => !r.open_fines_total && !r.total_fines)
    .map((r: any) => r.parcel_id)

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

  // Build rows + contact info set from the view data
  const contactInfoParcelIds: string[] = []

  const rows = (listData || []).map((row: any) => {
    if (row.has_contact_info || row.pm_phone || row.has_pm_contact) {
      contactInfoParcelIds.push(row.parcel_id)
    }
    const sigFines = sigViolMap[row.parcel_id]
    return {
      parcel_id:            row.parcel_id,
      address:              row.address || row.parcel_id,
      signal_score:         row.score,
      pm_name:              row.pm_name,
      pm_confidence:        row.pm_confidence,
      open_violation_count: row.open_violation_count || sigFines?.open_violation_count || null,
      open_fines_total:     row.open_fines_total     || sigFines?.open_fines_total     || null,
      total_fines:          row.total_fines           || sigFines?.total_fines           || null,
      incumbent_name:       row.incumbent_name,
      incumbent_staleness:  row.incumbent_staleness,
      incumbent_last_job:   row.incumbent_last_job ?? null,
      lead: {
        id:               row.lead_id,
        status:           row.status,
        last_called_at:   row.last_called_at,
        call_count:       row.call_count,
        next_followup_at: row.next_followup_at,
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
          .order('parcel_id')
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
          .order('parcel_id')
          .range(start, start + FETCH_CHUNK - 1) as any
      )
    }
  }

  const tasksSet = new Set((todayTasks || []).map((t) => t.parcel_id))

  return { rows, contacts, tasksSet: Array.from(tasksSet), contactInfoParcelIds }
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
