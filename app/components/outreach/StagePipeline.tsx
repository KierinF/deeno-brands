'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STAGES = [
  { key: 'new',       label: 'NEW' },
  { key: 'attempted', label: 'ATTEMPTED' },
  { key: 'contacted', label: 'CONTACTED' },
  { key: 'qualified', label: 'QUALIFIED' },
  { key: 'proposal',  label: 'PROPOSAL' },
  { key: 'closed',    label: 'CLOSED' },
]

export default function StagePipeline({
  parcelId,
  initialStage,
  leadId,
}: {
  parcelId: string
  initialStage: string | null
  leadId: string | null
}) {
  const [stage, setStage] = useState(initialStage || 'new')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function updateStage(key: string) {
    if (saving || key === stage) return
    setSaving(true)
    setSaved(false)
    setStage(key)

    if (leadId) {
      await supabase.from('leads').update({ status: key }).eq('id', leadId)
    } else {
      await supabase.from('leads').upsert(
        { parcel_id: parcelId, status: key },
        { onConflict: 'parcel_id' }
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const currentIdx = STAGES.findIndex((s) => s.key === stage)

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', background: '#1C2B2B' }}>
      {STAGES.map((s, i) => {
        const isActive = s.key === stage
        const isPast = i < currentIdx
        return (
          <button
            key={s.key}
            onClick={() => updateStage(s.key)}
            style={{
              flex: 1, minWidth: 0,
              padding: '9px 4px',
              background: isActive ? '#E8A020' : isPast ? '#2E3E3E' : 'transparent',
              color: isActive ? '#1C2B2B' : isPast ? '#C8C1B3' : '#8C8070',
              border: 'none',
              borderRight: i < STAGES.length - 1 ? '1px solid #2E3E3E' : 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '1px',
              fontWeight: isActive ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {s.label}
          </button>
        )
      })}
      {/* Save status */}
      <div style={{
        padding: '0 10px',
        display: 'flex', alignItems: 'center',
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        color: saving ? '#8C8070' : saved ? '#E8A020' : 'transparent',
        flexShrink: 0,
        minWidth: 48,
      }}>
        {saving ? 'saving' : saved ? 'SAVED ✓' : '·'}
      </div>
    </div>
  )
}
