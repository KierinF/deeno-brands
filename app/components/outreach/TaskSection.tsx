'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Task = {
  id: string
  parcel_id: string
  title: string
  due_date: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}

type Props = {
  parcelId: string
  initialTasks: Task[]
}

export default function TaskSection({ parcelId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const supabase = createClient()

  async function addTask() {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('tasks')
      .insert({
        parcel_id: parcelId,
        title: newTitle.trim(),
        due_date: newDue || null,
        notes: newNotes || null,
      })
      .select()
      .single()
    if (data) setTasks((prev) => [...prev, data])
    setNewTitle('')
    setNewDue('')
    setNewNotes('')
    setShowForm(false)
    setSaving(false)
  }

  async function completeTask(id: string) {
    await supabase
      .from('tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function doDeleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function deleteTask(id: string) {
    setPendingDeleteId(id)
    setDeleteInput('')
  }

  const open = tasks.filter((t) => !t.completed_at)
  const done = tasks.filter((t) => t.completed_at)

  const inputStyle = {
    padding: '8px 10px',
    background: '#FFFFFF',
    border: '1px solid #C8C1B3',
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#1C2B2B',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div>
      {open.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {open.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid #C8C1B3',
              }}
            >
              <button
                onClick={() => completeTask(task.id)}
                title="Mark complete"
                style={{
                  width: 18,
                  height: 18,
                  border: '1px solid #C8C1B3',
                  background: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: 2,
                  padding: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    color: '#1C2B2B',
                    margin: 0,
                  }}
                >
                  {task.title}
                </p>
                {task.due_date && (
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: '#8C8070',
                      margin: '4px 0 0 0',
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
                onClick={() => deleteTask(task.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C8C1B3',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '1.5px',
              color: '#C8C1B3',
              margin: '0 0 8px 0',
            }}
          >
            COMPLETED ({done.length})
          </p>
          {done.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #C8C1B3',
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: '#C8C1B3',
                textDecoration: 'line-through',
              }}
            >
              {task.title}
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '1.5px',
            color: '#E8A020',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          + ADD TASK
        </button>
      )}

      {showForm && (
        <div
          style={{
            marginTop: 12,
            padding: '16px',
            background: '#F7F4EE',
            border: '1px solid #C8C1B3',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title"
            style={{ ...inputStyle, width: '100%' }}
          />
          <input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addTask}
              disabled={saving || !newTitle.trim()}
              style={{
                padding: '10px 20px',
                background: !newTitle.trim() ? '#C8C1B3' : '#E8A020',
                color: '#F7F4EE',
                border: 'none',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: '1px',
                cursor: !newTitle.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'ADDING...' : 'ADD'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: '1px solid #C8C1B3',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#8C8070',
                cursor: 'pointer',
              }}
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {pendingDeleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPendingDeleteId(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '20px 24px', minWidth: 300 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1C2B2B', marginBottom: 10 }}>Delete task?</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#8C8070', marginBottom: 10 }}>Type <strong>delete</strong> to confirm</div>
            <input
              autoFocus
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && deleteInput === 'delete') { doDeleteTask(pendingDeleteId); setPendingDeleteId(null) } if (e.key === 'Escape') setPendingDeleteId(null) }}
              placeholder="delete"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, border: '1px solid #C8C1B3', padding: '6px 8px', width: '100%', outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { doDeleteTask(pendingDeleteId); setPendingDeleteId(null) }} disabled={deleteInput !== 'delete'}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, background: deleteInput === 'delete' ? '#C0392B' : '#E8E4DC', color: deleteInput === 'delete' ? '#FFFFFF' : '#C8C1B3', border: 'none', padding: '6px 16px', cursor: deleteInput === 'delete' ? 'pointer' : 'default', fontWeight: 700 }}>
                DELETE
              </button>
              <button onClick={() => setPendingDeleteId(null)}
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
