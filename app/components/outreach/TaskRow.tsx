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
  const [confirming, setConfirming] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const supabase = createClient()

  async function completeTask() {
    await supabase
      .from('tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', task.id)
    setCompleted(true)
  }

  async function doDeleteTask() {
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
        onClick={() => { setConfirming(true); setDeleteInput('') }}
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

      {confirming && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirming(false)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '20px 24px', minWidth: 300 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1C2B2B', marginBottom: 10 }}>Delete task?</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8C8070', marginBottom: 10 }}>Type <strong>delete</strong> to confirm</div>
            <input
              autoFocus
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && deleteInput === 'delete') { doDeleteTask(); setConfirming(false) } if (e.key === 'Escape') setConfirming(false) }}
              placeholder="delete"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, border: '1px solid #C8C1B3', padding: '6px 8px', width: '100%', outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { doDeleteTask(); setConfirming(false) }} disabled={deleteInput !== 'delete'}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, background: deleteInput === 'delete' ? '#C0392B' : '#E8E4DC', color: deleteInput === 'delete' ? '#FFFFFF' : '#C8C1B3', border: 'none', padding: '6px 16px', cursor: deleteInput === 'delete' ? 'pointer' : 'default', fontWeight: 700 }}>
                DELETE
              </button>
              <button onClick={() => setConfirming(false)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, background: 'none', border: '1px solid #C8C1B3', padding: '6px 16px', cursor: 'pointer', color: '#8C8070' }}>
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
