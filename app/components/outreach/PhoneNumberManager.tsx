'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PhoneNumber = {
  id: string
  parcel_id: string
  contact_id?: string | null
  org_id?: string | null
  number: string
  source?: string | null
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

const SOURCES = ['manual', 'scraped', 'whitepages', 'linkedin', 'other']

// Normalize to E.164 for US numbers
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
  const supabase = createClient()

  async function deleteNumber(id: string) {
    // Don't delete synthetic org phone entries (id starts with 'org-')
    if (id.startsWith('org-')) return
    await supabase.from('phone_numbers').delete().eq('id', id)
    setNumbers((prev) => prev.filter((n) => n.id !== id))
  }

  async function markStale(id: string) {
    if (id.startsWith('org-')) return
    await supabase
      .from('phone_numbers')
      .update({ status: 'stale', marked_stale_at: new Date().toISOString() })
      .eq('id', id)
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'stale', marked_stale_at: new Date().toISOString() } : n
      )
    )
  }

  async function markBad(id: string) {
    if (id.startsWith('org-')) return
    await supabase.from('phone_numbers').update({ status: 'bad' }).eq('id', id)
    setNumbers((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'bad' } : n)))
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

  const statusColor = (status: string | null | undefined) => {
    if (status === 'stale') return '#8C8070'
    if (status === 'bad') return '#C0392B'
    return '#1C2B2B'
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
              {onCallRequest && num.status !== 'bad' && (
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
              <span style={{ ...m, fontSize: 13, color: statusColor(num.status), textDecoration: num.status === 'bad' ? 'line-through' : 'none' }}>
                {num.number}
              </span>
              {num.source && (
                <span style={{ ...m, fontSize: 9, letterSpacing: '1px', color: '#C8C1B3', padding: '2px 5px', border: '1px solid #C8C1B3' }}>
                  {num.source.toUpperCase()}
                </span>
              )}
              {num.status && num.status !== 'active' && (
                <span style={{ ...m, fontSize: 9, letterSpacing: '1px', color: num.status === 'bad' ? '#C0392B' : '#8C8070', padding: '2px 5px', border: `1px solid ${num.status === 'bad' ? '#C0392B' : '#8C8070'}` }}>
                  {num.status.toUpperCase()}
                </span>
              )}
              {num.status !== 'stale' && num.status !== 'bad' && !num.id.startsWith('org-') && (
                <>
                  <button onClick={() => markStale(num.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#8C8070', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    stale
                  </button>
                  <button onClick={() => markBad(num.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    bad
                  </button>
                  <button onClick={() => deleteNumber(num.id)} style={{ background: 'none', border: 'none', ...m, fontSize: 9, color: '#C0392B', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    delete
                  </button>
                </>
              )}
            </div>
          ))}
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
