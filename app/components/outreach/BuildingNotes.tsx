'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  parcelId: string
  initialBody: string
}

export default function BuildingNotes({ parcelId, initialBody }: Props) {
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const supabase = createClient()

  async function handleSave() {
    const text = body.trim()
    if (!text) return
    setStatus('saving')
    await supabase.from('outreach_log').insert({
      parcel_id: parcelId,
      outcome: 'note',
      notes: text,
      contacted_at: new Date().toISOString(),
      direction: 'outbound',
    })
    setBody('')
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Add a note..."
        style={{
          width: '100%',
          padding: '12px',
          background: '#F7F4EE',
          border: '1px solid #C8C1B3',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: '#1C2B2B',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.6,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <button
          onClick={handleSave}
          disabled={!body.trim() || status === 'saving'}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '1.5px',
            padding: '5px 14px',
            background: body.trim() ? '#1C2B2B' : '#C8C1B3',
            color: body.trim() ? '#E8A020' : '#8C8070',
            border: 'none',
            cursor: body.trim() ? 'pointer' : 'default',
          }}
        >
          {status === 'saving' ? 'SAVING...' : 'SAVE NOTE'}
        </button>
        {status === 'saved' && (
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '1.5px',
              color: '#E8A020',
            }}
          >
            SAVED
          </span>
        )}
      </div>
    </div>
  )
}
