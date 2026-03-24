'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Task = {
  id: string
  parcel_id: string
  title: string
  due_date: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
  address?: string | null
}

type Props = {
  task: Task
  isLast: boolean
}

export default function TaskRow({ task, isLast }: Props) {
  const [completed, setCompleted] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const supabase = createClient()

  async function completeTask() {
    await supabase
      .from('tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', task.id)
    setCompleted(true)
  }

  async function deleteTask() {
    await supabase.from('tasks').delete().eq('id', task.id)
    setDeleted(true)
  }

  if (completed || deleted) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid #C8C1B3',
      }}
    >
      <button
        onClick={completeTask}
        title="Mark complete"
        style={{
          width: 18,
          height: 18,
          border: '1px solid #C8C1B3',
          background: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: 3,
          padding: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <Link
          href={`/outreach/${task.parcel_id}`}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: '#1C2B2B',
            textDecoration: 'none',
            display: 'block',
            marginBottom: 4,
          }}
        >
          {task.title}
        </Link>
        {task.address && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: '#8C8070',
              margin: '0 0 2px 0',
              letterSpacing: '0.5px',
            }}
          >
            {task.address}
          </p>
        )}
        {task.due_date && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: '#8C8070',
              margin: 0,
            }}
          >
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        {task.notes && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: '#8C8070',
              margin: '4px 0 0 0',
            }}
          >
            {task.notes}
          </p>
        )}
      </div>
      <button
        onClick={deleteTask}
        title="Delete"
        style={{
          background: 'none',
          border: 'none',
          color: '#C8C1B3',
          cursor: 'pointer',
          fontSize: 14,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
