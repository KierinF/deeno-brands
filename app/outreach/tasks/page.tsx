import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TaskRow from '@/app/components/outreach/TaskRow'

export const dynamic = 'force-dynamic'

type Task = {
  id: string
  parcel_id: string
  title: string
  due_date: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}

type TaskWithAddress = Task & { address: string | null }

export default async function OutreachTasksPage() {
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

  const { data: rawTasks } = await supabase
    .from('tasks')
    .select('*')
    .is('completed_at', null)
    .order('due_date', { ascending: true })

  const tasks = rawTasks || []

  // Get building addresses
  const parcelIds = [...new Set(tasks.map((t) => t.parcel_id))]
  const { data: buildings } = parcelIds.length
    ? await supabase
        .from('building_intelligence')
        .select('parcel_id, address')
        .in('parcel_id', parcelIds)
    : { data: [] }

  const addressMap = new Map((buildings || []).map((b) => [b.parcel_id, b.address]))

  const enriched: TaskWithAddress[] = tasks.map((t) => ({
    ...t,
    address: addressMap.get(t.parcel_id) || null,
  }))

  const today = new Date().toISOString().split('T')[0]

  const overdue = enriched.filter((t) => t.due_date && t.due_date < today)
  const dueToday = enriched.filter((t) => t.due_date === today)
  const upcoming = enriched.filter((t) => t.due_date && t.due_date > today)
  const noDate = enriched.filter((t) => !t.due_date)

  function TaskGroup({
    label,
    tasks: groupTasks,
    accent,
  }: {
    label: string
    tasks: TaskWithAddress[]
    accent?: string
  }) {
    if (groupTasks.length === 0) return null
    return (
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '2px',
            color: accent || '#8C8070',
            margin: '0 0 10px 0',
          }}
        >
          {label} ({groupTasks.length})
        </p>
        <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3' }}>
          {groupTasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              isLast={i === groupTasks.length - 1}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      <header
        style={{
          background: '#1C2B2B',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #E8A020',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/outreach"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '1.5px',
              color: '#C8C1B3',
              textDecoration: 'none',
            }}
          >
            ← OUTREACH
          </Link>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: '3px',
              color: '#E8A020',
            }}
          >
            DEENO
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              paddingTop: 2,
            }}
          >
            TASKS
          </span>
        </div>
      </header>

      <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
        <TaskGroup label="OVERDUE" tasks={overdue} accent="#C0392B" />
        <TaskGroup label="DUE TODAY" tasks={dueToday} accent="#E8A020" />
        <TaskGroup label="UPCOMING" tasks={upcoming} />
        <TaskGroup label="NO DATE" tasks={noDate} />

        {enriched.length === 0 && (
          <div
            style={{
              padding: '48px 0',
              textAlign: 'center',
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: '#8C8070',
            }}
          >
            No open tasks.
          </div>
        )}
      </div>
    </div>
  )
}
