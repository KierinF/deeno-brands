'use client'

import { useState } from 'react'
import type { NotionTask } from '@/lib/notion'

const STATUSES = ['To Do', 'In Progress', 'Review', 'Approved', 'Done', 'Blocked'] as const
type Status = (typeof STATUSES)[number]

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string }> = {
  'To Do':      { color: '#8C8070', bg: '#F0EDE8', border: '#C8C1B3' },
  'In Progress':{ color: '#1C5B8C', bg: '#EBF4FC', border: '#A8C8E8' },
  'Review':     { color: '#B45309', bg: '#FEF3C7', border: '#F0D070' },
  'Approved':   { color: '#6D28D9', bg: '#EDE9FE', border: '#C4B5FD' },
  'Done':       { color: '#27AE60', bg: '#E8F8F0', border: '#A8D8B8' },
  'Blocked':    { color: '#C0392B', bg: '#FDECEA', border: '#F0A8A0' },
}

export default function TasksTab({
  tasks: initialTasks,
  clientAssignee,
}: {
  tasks: NotionTask[]
  clientAssignee: string | null
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const canMove = (task: NotionTask) =>
    clientAssignee != null && task.assigned_to === clientAssignee

  const handleDragStart = (e: React.DragEvent, task: NotionTask) => {
    if (!canMove(task)) { e.preventDefault(); return }
    setDraggedId(task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    setDragOverStatus(null)
    if (!draggedId) return

    const task = tasks.find((t) => t.id === draggedId)
    if (!task || !canMove(task) || task.status === status) {
      setDraggedId(null)
      return
    }

    const prevStatus = task.status
    setTasks((prev) => prev.map((t) => (t.id === draggedId ? { ...t, status } : t)))
    setDraggedId(null)
    setSaving(task.id)

    try {
      const res = await fetch('/api/notion/update-task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: prevStatus } : t)))
    } finally {
      setSaving(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStatus(null)
  }

  const tasksByStatus = Object.fromEntries(
    STATUSES.map((s) => [s, tasks.filter((t) => t.status === s)])
  ) as Record<Status, NotionTask[]>

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length

  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: '2px',
          color: '#8C8070',
          marginBottom: 20,
        }}
      >
        {total - done} ACTIVE &middot; {done} DONE
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 'max-content', alignItems: 'flex-start' }}>
          {STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status]
            const isOver = dragOverStatus === status
            const colTasks = tasksByStatus[status]

            return (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => handleDrop(e, status)}
                style={{
                  width: 220,
                  flexShrink: 0,
                  background: isOver ? cfg.bg : '#F7F4EE',
                  border: `1px solid ${isOver ? cfg.border : '#C8C1B3'}`,
                  padding: 12,
                  minHeight: 280,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '2px',
                      color: cfg.color,
                      fontWeight: 600,
                    }}
                  >
                    {status.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: '#8C8070',
                      background: '#FFFFFF',
                      border: '1px solid #C8C1B3',
                      padding: '1px 6px',
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {colTasks.map((task) => {
                    const moveable = canMove(task)
                    const isDragging = draggedId === task.id
                    const isSaving = saving === task.id

                    return (
                      <div
                        key={task.id}
                        draggable={moveable}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #C8C1B3',
                          padding: '12px 14px',
                          cursor: moveable ? 'grab' : 'default',
                          opacity: isDragging ? 0.4 : isSaving ? 0.7 : 1,
                          transition: 'opacity 0.15s',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'DM Sans Variable', sans-serif",
                            fontSize: 13,
                            color: '#1C2B2B',
                            fontWeight: 500,
                            lineHeight: 1.4,
                            marginBottom: task.category || task.due_date ? 8 : 0,
                          }}
                        >
                          {task.task_name}
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {task.category && (
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 8,
                                letterSpacing: '1px',
                                color: '#8C8070',
                                background: '#F0EDE8',
                                padding: '2px 6px',
                              }}
                            >
                              {task.category.toUpperCase()}
                            </span>
                          )}
                          {task.due_date && (
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 8,
                                color: '#8C8070',
                              }}
                            >
                              {task.due_date}
                            </span>
                          )}
                          {!moveable && (
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 8,
                                color: '#C8C1B3',
                                letterSpacing: '1px',
                                marginLeft: 'auto',
                              }}
                            >
                              DEENO
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
