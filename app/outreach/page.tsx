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

  // Fetch all non-govt buildings in sequential 1k chunks (bypasses PostgREST default cap)
  const buildings = await fetchAllRows((start) =>
    supabase
      .from('building_intelligence')
      .select('parcel_id, address, signal_score, pm_name, pm_confidence, open_violation_count, incumbent_staleness, incumbent_name, incumbent_last_job, open_fines_total, total_fines')
      .not('building_class', 'like', 'Y%')
      .range(start, start + FETCH_CHUNK - 1) as any
  )

  // Fetch all leads in sequential 1k chunks
  const leadsData = await fetchAllRows((start) =>
    supabase
      .from('leads')
      .select('parcel_id, id, status, last_called_at, call_count, next_followup_at')
      .range(start, start + FETCH_CHUNK - 1) as any
  )

  const leadsMap = Object.fromEntries(leadsData.map((l: any) => [l.parcel_id, l]))

  const rows = (buildings || []).map((b) => ({
    ...b,
    lead: leadsMap[b.parcel_id] || null,
  }))

  // Sort by signal_score desc
  rows.sort((a, b) => (b.signal_score ?? -1) - (a.signal_score ?? -1))

  // For org-centric tabs, fetch relevant contacts
  let contacts: any[] = []
  if (filter === 'owners' || filter === 'contractors' || filter === 'brokers') {
    if (filter === 'contractors') {
      contacts = await fetchAllRows((start) =>
        supabase
          .from('contacts')
          .select('parcel_id, business_name, contact_type, first_name, last_name, confidence, source_date')
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

  return { rows, contacts, tasksSet: Array.from(tasksSet) }
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

  const { rows, contacts, tasksSet } = await getListData(filter)

  return (
    <OutreachListClient
      initialRows={rows}
      contacts={contacts}
      filter={filter}
      tasksParcelIds={tasksSet}
    />
  )
}
