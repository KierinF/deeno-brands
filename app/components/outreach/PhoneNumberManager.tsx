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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: any
}

const SOURCES = ['manual', 'scraped', 'whitepages', 'linkedin', 'other']

export default function PhoneNumberManager({ parcelId, numbers: initialNumbers }: Props) {
  const [numbers, setNumbers] = useState<PhoneNumber[]>(initialNumbers)
  const [showAdd, setShowAdd] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [newSource, setNewSource] = useState('manual')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  async function markStale(id: string) {
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
    await supabase.from('phone_numbers').update({ status: 'bad' }).eq('id', id)
    setNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'bad' } : n))
    )
  }

  async function addNumber() {
    if (!newNumber.trim()) return
    setAdding(true)
    const { data } = await supabase
      .from('phone_numbers')
      .insert({
        parcel_id: parcelId,
        number: newNumber.trim(),
        source: newSource,
        status: 'active',
        added_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (data) {
      setNumbers((prev) => [...prev, data])
    }
    setNewNumber('')
    setShowAdd(false)
    setAdding(false)
  }

  const statusColor = (status: string | null | undefined) => {
    if (status === 'stale') return '#8C8070'
    if (status === 'bad') return '#C0392B'
    return '#1C2B2B'
  }

  const inputStyle = {
    padding: '8px 10px',
    background: '#FFFFFF',
    border: '1px solid #C8C1B3',
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#1C2B2B',
    outline: 'none',
  }

  return (
    <div>
      {numbers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {numbers.map((num) => (
            <div
              key={num.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: statusColor(num.status),
                  textDecoration: num.status === 'bad' ? 'line-through' : 'none',
                }}
              >
                {num.number}
              </span>
              {num.source && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '1px',
                    color: '#C8C1B3',
                    padding: '2px 6px',
                    border: '1px solid #C8C1B3',
                  }}
                >
                  {num.source.toUpperCase()}
                </span>
              )}
              {num.status && num.status !== 'active' && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '1px',
                    color:
                      num.status === 'bad'
                        ? '#C0392B'
                        : '#8C8070',
                    padding: '2px 6px',
                    border: `1px solid ${num.status === 'bad' ? '#C0392B' : '#8C8070'}`,
                  }}
                >
                  {num.status.toUpperCase()}
                </span>
              )}
              {num.status !== 'stale' && num.status !== 'bad' && (
                <>
                  <button
                    onClick={() => markStale(num.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '1px',
                      color: '#8C8070',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    mark stale
                  </button>
                  <button
                    onClick={() => markBad(num.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '1px',
                      color: '#C0392B',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    bad number
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
          + ADD NUMBER
        </button>
      )}

      {showAdd && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <input
            type="tel"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="+1 555 000 0000"
            style={{ ...inputStyle, width: 160 }}
          />
          <select
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            style={{ ...inputStyle }}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={addNumber}
            disabled={adding}
            style={{
              padding: '8px 14px',
              background: '#E8A020',
              color: '#F7F4EE',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            {adding ? '...' : 'ADD'}
          </button>
          <button
            onClick={() => setShowAdd(false)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: '#8C8070',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            cancel
          </button>
        </div>
      )}
    </div>
  )
}
