import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OutreachListClient from '@/app/components/outreach/OutreachListClient'

export const dynamic = 'force-dynamic'

type FilterTab = 'all' | 'priority' | 'callbacks' | 'contacted'

async function getListData(filter: FilterTab, page: number, pageSize: number) {
  const supabase = await createClient()
  const offset = page * pageSize

  const { data: buildings, error, count } = await supabase
    .from('building_intelligence')
    .select('parcel_id, address, signal_score, pm_name, pm_confidence, open_violation_count, incumbent_staleness', { count: 'exact' })
    .order('signal_score', { ascending: false, nullsFirst: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  const parcelIds = (buildings || []).map((b) => b.parcel_id)

  const { data: leadsData } = parcelIds.length
    ? await supabase
        .from('leads')
        .select('parcel_id, id, score, status, last_called_at, call_count, next_followup_at')
        .in('parcel_id', parcelIds)
    : { data: [] }

  const leadsMap = Object.fromEntries((leadsData || []).map((l) => [l.parcel_id, l]))

  const rows = (buildings || []).map((b) => ({
    ...b,
    lead: leadsMap[b.parcel_id] || null,
  }))

  // Apply filters
  const today = new Date().toISOString().split('T')[0]
  const filtered =
    filter === 'priority'
      ? rows.filter((b) => b.signal_score && b.signal_score >= 70)
      : filter === 'callbacks'
      ? rows.filter((b) => b.lead?.next_followup_at && b.lead.next_followup_at.split('T')[0] <= today)
      : filter === 'contacted'
      ? rows.filter((b) => b.lead?.last_called_at)
      : rows

  // Get tasks due today (for badge)
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select('parcel_id')
    .lte('due_date', today)
    .is('completed_at', null)

  const tasksSet = new Set((todayTasks || []).map((t) => t.parcel_id))

  return { rows: filtered, total: count ?? 0, tasksSet: Array.from(tasksSet) }
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
  const filter = (resolvedParams.filter as FilterTab) || 'all'
  const page = Math.max(0, parseInt(resolvedParams.page || '0', 10))
  const PAGE_SIZE = 100

  const { rows, total, tasksSet } = await getListData(filter, page, PAGE_SIZE)

  return (
    <OutreachListClient
      initialRows={rows}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      filter={filter}
      tasksParcelIds={tasksSet}
    />
  )
}
