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
  const [savedStage, setSavedStage] = useState(initialStage || 'new')
  const [pendingStage, setPendingStage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const displayStage = pendingStage ?? savedStage
  const isDirty = pendingStage !== null && pendingStage !== savedStage
  const currentIdx = STAGES.findIndex((s) => s.key === displayStage)

  async function commitStage() {
    if (!isDirty || saving || !pendingStage) return
    setSaving(true)
    if (leadId) {
      await supabase.from('leads').update({ status: pendingStage }).eq('id', leadId)
    } else {
      await supabase.from('leads').upsert(
        { parcel_id: parcelId, status: pendingStage },
        { onConflict: 'parcel_id' }
      )
    }
    setSavedStage(pendingStage)
    setPendingStage(null)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const m = { fontFamily: "'DM Mono', monospace" }

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', background: '#1C2B2B' }}>
      {STAGES.map((s, i) => {
        const isActive = s.key === displayStage
        const isPast = i < currentIdx
        const isPending = pendingStage === s.key && pendingStage !== savedStage
        return (
          <button
            key={s.key}
            onClick={() => setPendingStage(s.key === savedStage ? null : s.key)}
            style={{
              flex: 1, minWidth: 0,
              padding: '9px 4px',
              background: isPending ? '#C47A15' : isActive ? '#E8A020' : isPast ? '#2E3E3E' : 'transparent',
              color: isActive || isPending ? '#1C2B2B' : isPast ? '#C8C1B3' : '#8C8070',
              border: 'none',
              borderRight: i < STAGES.length - 1 ? '1px solid #2E3E3E' : 'none',
              ...m,
              fontSize: 9,
              letterSpacing: '1px',
              fontWeight: isActive || isPending ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {s.label}
          </button>
        )
      })}

      {/* SET STAGE button — only visible when a change is pending */}
      {isDirty && (
        <button
          onClick={commitStage}
          disabled={saving}
          style={{
            padding: '0 12px',
            background: '#E8A020',
            color: '#1C2B2B',
            border: 'none',
            borderLeft: '2px solid #1C2B2B',
            ...m,
            fontSize: 9,
            letterSpacing: '1px',
            fontWeight: 700,
            cursor: saving ? 'default' : 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? '...' : 'SET STAGE'}
        </button>
      )}

      {/* Saved confirmation */}
      {!isDirty && (
        <div style={{
          padding: '0 10px',
          display: 'flex', alignItems: 'center',
          ...m,
          fontSize: 9,
          color: saved ? '#E8A020' : 'transparent',
          flexShrink: 0,
          minWidth: 56,
        }}>
          {saved ? 'SAVED ✓' : '·'}
        </div>
      )}
    </div>
  )
}
