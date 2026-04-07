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

  // Fetch from the outreach_list view — single query replaces leads + BI + properties joins
  const [listData, todayTasks] = await Promise.all([
    fetchAllRows((start) =>
      supabase
        .from('outreach_list')
        .select('*')
        .range(start, start + FETCH_CHUNK - 1) as any
    ),
    supabase
      .from('tasks')
      .select('parcel_id')
      .lte('due_date', new Date().toISOString().split('T')[0])
      .is('completed_at', null),
  ])

  // Build rows + contact info set from the view data
  const contactInfoParcelIds: string[] = []

  const rows = (listData || []).map((row: any) => {
    if (row.has_contact_info || row.pm_phone || row.has_pm_contact) {
      contactInfoParcelIds.push(row.parcel_id)
    }
    return {
      parcel_id:            row.parcel_id,
      address:              row.address || row.parcel_id,
      signal_score:         row.score,
      pm_name:              row.pm_name,
      pm_confidence:        row.pm_confidence,
      open_violation_count: row.open_violation_count || null,
      open_fines_total:     row.open_fines_total || null,
      total_fines:          row.total_fines || null,
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

  const tasksSet = new Set((todayTasks.data || []).map((t) => t.parcel_id))

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
