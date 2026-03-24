'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STAGES = [
  { key: 'new', label: 'NEW' },
  { key: 'attempted', label: 'ATTEMPTED' },
  { key: 'contacted', label: 'CONTACTED' },
  { key: 'qualified', label: 'QUALIFIED' },
  { key: 'proposal', label: 'PROPOSAL' },
  { key: 'closed', label: 'CLOSED' },
]

type Props = {
  parcelId: string
  initialStage: string | null
  leadId: string | null
}

export default function StagePipeline({ parcelId, initialStage, leadId }: Props) {
  const [stage, setStage] = useState(initialStage || 'new')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function setStageValue(key: string) {
    if (saving) return
    setSaving(true)
    setStage(key)
    if (leadId) {
      await supabase.from('leads').update({ status: key }).eq('id', leadId)
    } else {
      // Create lead row
      await supabase.from('leads').upsert({ parcel_id: parcelId, status: key }, { onConflict: 'parcel_id' })
    }
    setSaving(false)
  }

  const currentIdx = STAGES.findIndex((s) => s.key === stage)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: '#1C2B2B',
        padding: '0',
        overflowX: 'auto',
      }}
    >
      {STAGES.map((s, i) => {
        const isActive = s.key === stage
        const isPast = i < currentIdx

        return (
          <button
            key={s.key}
            onClick={() => setStageValue(s.key)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 8px',
              background: isActive ? '#E8A020' : isPast ? '#2E3E3E' : 'transparent',
              color: isActive ? '#1C2B2B' : isPast ? '#C8C1B3' : '#8C8070',
              border: 'none',
              borderRight: i < STAGES.length - 1 ? '1px solid #2E3E3E' : 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '1.5px',
              fontWeight: isActive ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
          >
            {s.label}
            {isActive && (
              <span
                style={{
                  display: 'block',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid #E8A020',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
