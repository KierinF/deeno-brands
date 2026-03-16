'use client'

import type { NotionTask } from '@/lib/notion'

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  'To Do': { color: '#8C8070', bg: '#F0EDE8' },
  'In Progress': { color: '#1C5B8C', bg: '#E3EFF8' },
  'Review': { color: '#B45309', bg: '#FEF3C7' },
  'Approved': { color: '#6D28D9', bg: '#EDE9FE' },
  'Done': { color: '#27AE60', bg: '#E8F8F0' },
  'Blocked': { color: '#C0392B', bg: '#FDECEA' },
}

const STATUS_ORDER = ['In Progress', 'Review', 'To Do', 'Approved', 'Blocked', 'Done']

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { color: '#8C8070', bg: '#F0EDE8' }
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: '1px',
        color: cfg.color,
        background: cfg.bg,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {status.toUpperCase()}
    </span>
  )
}

export default function TasksTab({ tasks }: { tasks: NotionTask[] }) {
  if (tasks.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: '#8C8070',
          textAlign: 'center',
          paddingTop: 80,
        }}
      >
        NO TASKS
      </div>
    )
  }

  const sorted = [...tasks].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status)
    const bi = STATUS_ORDER.indexOf(b.status)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const active = sorted.filter((t) => t.status !== 'Done')
  const done = sorted.filter((t) => t.status === 'Done')

  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: '2px',
          color: '#8C8070',
          marginBottom: 16,
        }}
      >
        {active.length} ACTIVE &middot; {done.length} DONE
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map((task) => (
          <div
            key={task.id}
            style={{
              background: task.status === 'Done' ? '#FAFAF8' : '#FFFFFF',
              border: '1px solid #C8C1B3',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              alignItems: 'center',
              gap: 16,
              opacity: task.status === 'Done' ? 0.6 : 1,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'DM Sans Variable', sans-serif",
                  fontSize: 14,
                  color: '#1C2B2B',
                  fontWeight: 500,
                  textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                }}
              >
                {task.task_name}
              </div>
              {task.notes && (
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: '#8C8070',
                    marginTop: 4,
                  }}
                >
                  {task.notes}
                </div>
              )}
            </div>

            {task.category ? (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1px',
                  color: '#8C8070',
                }}
              >
                {task.category.toUpperCase()}
              </span>
            ) : (
              <span />
            )}

            {task.due_date ? (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1px',
                  color: '#8C8070',
                }}
              >
                {task.due_date}
              </span>
            ) : (
              <span />
            )}

            <StatusBadge status={task.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
