'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  parcelId: string
  initialBody: string
}

export default function BuildingNotes({ parcelId, initialBody }: Props) {
  const [body, setBody] = useState(initialBody)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const supabase = createClient()

  async function handleBlur() {
    if (body === initialBody && status === 'idle') return
    setStatus('saving')
    await supabase.from('building_notes').upsert(
      { parcel_id: parcelId, body, updated_at: new Date().toISOString() },
      { onConflict: 'parcel_id' }
    )
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={handleBlur}
        rows={5}
        placeholder="Notes about this building..."
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
      <div
        style={{
          marginTop: 6,
          height: 16,
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: '1.5px',
          color: status === 'saved' ? '#E8A020' : '#C8C1B3',
        }}
      >
        {status === 'saving' && 'SAVING...'}
        {status === 'saved' && 'SAVED'}
      </div>
    </div>
  )
}
