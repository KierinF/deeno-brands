'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PhoneNumber = {
  id: string
  parcel_id: string
  contact_id?: string | null
  org_id?: string | null
  org_profile_id?: string | null
  number: string
  source?: string | null
  source_url?: string | null
  status?: string | null
  added_at?: string | null
  marked_stale_at?: string | null
}

type Props = {
  parcelId: string
  numbers: PhoneNumber[]
  contactId?: string | null
  orgId?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: any
  onCallRequest?: (phoneNumber: string) => void
}

const SOURCES = ['manual', 'scraped', 'web_enriched', 'whitepages', 'linkedin', 'other']

function toE164(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return input.trim()
}

export default function PhoneNumberManager({
  parcelId,
  numbers: initialNumbers,
  contactId,
  orgId,
  onCallRequest,
}: Props) {
  const [numbers, setNumbers] = useState<PhoneNumber[]>(initialNumbers)
  const [showAdd, setShowAdd] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [newSource, setNewSource] = useState('manual')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const supabase = createClient()

  async function doDeleteNumber(id: string) {
    if (id.startsWith('org-')) return
    await supabase.from('phone_numbers').delete().eq('id', id)
    setNumbers((prev) => prev.filter((n) => n.id !== id))
  }

  function startEdit(num: PhoneNumber) {
    if (num.id.startsWith('org-')) return
    setEditingId(num.id)
    setEditValue(num.number)
  }

  async function saveEdit(id: string) {
    if (!editValue.trim()) return
    const normalized = toE164(editValue.trim())
    await supabase.from('phone_numbers').update({ number: normalized }).eq('id', id)
    setNumbers((prev) => prev.map((n) => n.id === id ? { ...n, number: normalized } : n))
    setEditingId(null)
  }

  async function addNumber() {
    if (!newNumber.trim()) return
    setAdding(true)
    const normalized = toE164(newNumber.trim())
    const { data } = await supabase
      .from('phone_numbers')
      .insert({
        parcel_id: parcelId,
        number: normalized,
        source: newSource,
        status: 'active',
        added_at: new Date().toISOString(),
        ...(contactId ? { contact_id: contactId } : {}),
        ...(orgId ? { org_id: orgId } : {}),
      })
      .select()
      .single()
    if (data) setNumbers((prev) => [...prev, data])
    setNewNumber('')
    setShowAdd(false)
    setAdding(false)
  }

  const m = { fontFamily: "'DM Mono', monospace" }

  const inputStyle = {
    padding: '7px 10px',
    background: '#FFFFFF',
    border: '1px solid #C8C1B3',
    ...m,
    fontSize: 12,
    color: '#1C2B2B',
    outline: 'none',
  }

  return (
    <div>
      {numbers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          {numbers.map((num) => (
            <div key={num.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {onCallRequest && (
                <button
                  onClick={() => onCallRequest(num.number)}
                  style={{
                    padding: '4px 10px',
                    background: '#E8A020',
                    color: '#1C2B2B',
                    border: 'none',
                    ...m,
                    fontSize: 10,
                    letterSpacing: '1px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  CALL
                </button>
              )}
              {editingId === num.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    autoFocus
                    type="tel"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(num.id); if (e.key === 'Escape') setEditingId(null) }}
                    style={{ ...inputStyle, width: 140 }}
                  />
                  <button onClick={() => saveEdit(num.id)} style={{ ...m, fontSize: 9, color: '#E8A020', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...m, fontSize: 9, color: '#8C8070', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>cancel</button>
                </div>
              ) : (
                <>
                  <span style={{ ...m, fontSize: 13, color: '#1C2B2B' }}>
                    {num.number}
                  </span>
                  {num.source && (
                    num.source_url ? (
                      <a
                        href={num.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Source: ${num.source_url}`}
                        style={{ ...m, fontSize: 9, letterSpacing: '1px', color: '#C8C1B3', padding: '2px 5px', border: '1px solid #C8C1B3', textDecoration: 'none' }}
                      >
                        {num.source.toUpperCase()} ↗
                      </a>
                    ) : (
                      <span style={{ ...m, fontSize: 9, letterSpacing: '1px', color: '#C8C1B3', padding: '2px 5px', border: '1px solid #C8C1B3' }}>
                        {num.source.toUpperCase()}
                      </span>
                    )
                  )}
                  {!num.id.startsWith('org-') && (
                    <>
                      <button onClick={() => startEdit(num)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#8C8070', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                        edit
                      </button>
                      <button onClick={() => { setPendingDeleteId(num.id); setDeleteInput('') }} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                        delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingDeleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPendingDeleteId(null)}>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '20px 24px', minWidth: 300 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1C2B2B', marginBottom: 10 }}>Delete phone number?</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#8C8070', marginBottom: 10 }}>Type <strong>delete</strong> to confirm</div>
            <input
              autoFocus
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && deleteInput === 'delete') { doDeleteNumber(pendingDeleteId); setPendingDeleteId(null) } if (e.key === 'Escape') setPendingDeleteId(null) }}
              placeholder="delete"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, border: '1px solid #C8C1B3', padding: '6px 8px', width: '100%', outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { doDeleteNumber(pendingDeleteId); setPendingDeleteId(null) }} disabled={deleteInput !== 'delete'}
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, background: deleteInput === 'delete' ? '#C0392B' : '#E8E4DC', color: deleteInput === 'delete' ? '#FFFFFF' : '#C8C1B3', border: 'none', padding: '6px 16px', cursor: deleteInput === 'delete' ? 'pointer' : 'default', fontWeight: 700 }}>
                DELETE
              </button>
              <button onClick={() => setPendingDeleteId(null)}
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, background: 'none', border: '1px solid #C8C1B3', padding: '6px 16px', cursor: 'pointer', color: '#8C8070' }}>
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: 'none', border: 'none', ...m, fontSize: 10, letterSpacing: '1.5px', color: '#E8A020', cursor: 'pointer', padding: 0 }}
        >
          + ADD NUMBER
        </button>
      )}

      {showAdd && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <input
            type="tel"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNumber()}
            placeholder="212 555 0000"
            style={{ ...inputStyle, width: 140 }}
          />
          <select value={newSource} onChange={(e) => setNewSource(e.target.value)} style={{ ...inputStyle }}>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={addNumber}
            disabled={adding}
            style={{ padding: '7px 12px', background: '#E8A020', color: '#1C2B2B', border: 'none', ...m, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}
          >
            {adding ? '...' : 'ADD'}
          </button>
          <button
            onClick={() => setShowAdd(false)}
            style={{ background: 'none', border: 'none', ...m, fontSize: 11, color: '#8C8070', cursor: 'pointer', padding: 0 }}
          >
            cancel
          </button>
        </div>
      )}
    </div>
  )
}
