'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Outcome = 'connected' | 'voicemail' | 'no_answer' | 'bad_number'
type Dispo = 'none' | 'meeting_booked' | 'not_interested' | 'nurture'

type Props = {
  parcelId: string
  leadId: string | null
  contactId: string | null
  callSid: string | null
  phoneNumber?: string | null
  onSave: () => void
}

const OUTCOMES: { key: Outcome; label: string }[] = [
  { key: 'connected',  label: 'CONNECTED' },
  { key: 'voicemail',  label: 'VOICEMAIL' },
  { key: 'no_answer',  label: 'NO ANSWER' },
  { key: 'bad_number', label: 'BAD NUMBER' },
]

const DISPOS: { key: Dispo; label: string; stage: string | null }[] = [
  { key: 'none',            label: 'NO DISPO',       stage: null },
  { key: 'meeting_booked',  label: 'MEETING BOOKED', stage: 'meeting_booked' },
  { key: 'not_interested',  label: 'NOT INTERESTED', stage: 'not_interested' },
  { key: 'nurture',         label: 'NURTURE',        stage: 'nurture' },
]

export default function CallLogForm({ parcelId, leadId, contactId, callSid, phoneNumber, onSave }: Props) {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [dispo, setDispo] = useState<Dispo>('none')
  const [notes, setNotes] = useState('')
  const [followup, setFollowup] = useState<'none' | 'schedule'>('none')
  const [followupDate, setFollowupDate] = useState('')
  const [followupTime, setFollowupTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  async function handleSave() {
    if (!outcome) return
    setSaving(true)

    try {
      // Build the full note with phone number prefix
      const fullNotes = [
        phoneNumber ? `Called: ${phoneNumber}` : null,
        notes || null,
      ].filter(Boolean).join('\n') || null

      const logEntry: Record<string, unknown> = {
        outcome,
        notes: fullNotes,
        parcel_id: parcelId,
        contact_id: contactId || null,
        contacted_at: new Date().toISOString(),
        direction: 'outbound',
      }
      if (callSid) logEntry.twilio_call_sid = callSid

      if (callSid) {
        const { data } = await supabase
          .from('outreach_log')
          .update({ outcome, notes: fullNotes })
          .eq('twilio_call_sid', callSid)
          .select('id')
        if (!data || data.length === 0) {
          await supabase.from('outreach_log').insert(logEntry)
        }
      } else {
        await supabase.from('outreach_log').insert(logEntry)
      }

      // Auto-transition stage based on disposition
      const stageFromDispo = DISPOS.find(d => d.key === dispo)?.stage
      if (leadId && stageFromDispo) {
        await supabase.from('leads').update({ status: stageFromDispo }).eq('id', leadId)
      }

      // Create follow-up task
      if (followup === 'schedule' && followupDate) {
        const dueDate = followupTime
          ? `${followupDate}T${followupTime}`
          : followupDate
        await supabase.from('tasks').insert({
          parcel_id: parcelId,
          title: `Follow up: ${outcome}`,
          due_date: dueDate,
          notes: notes || null,
        })
      }

      setSaved(true)
      setTimeout(() => onSave(), 800)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#2E3E3E',
    border: '1px solid #3E4E4E',
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#F7F4EE',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: '1.5px',
    color: '#8C8070',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Outcome */}
      <div>
        <span style={labelStyle}>OUTCOME</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OUTCOMES.map((o) => (
            <button
              key={o.key}
              onClick={() => setOutcome(o.key)}
              style={{
                padding: '8px 12px',
                background: outcome === o.key ? '#E8A020' : '#2E3E3E',
                color: outcome === o.key ? '#F7F4EE' : '#8C8070',
                border: '1px solid',
                borderColor: outcome === o.key ? '#E8A020' : '#3E4E4E',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>NOTES</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What happened on this call..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Disposition */}
      {outcome === 'connected' && (
        <div>
          <span style={labelStyle}>DISPOSITION</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DISPOS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDispo(d.key)}
                style={{
                  padding: '8px 12px',
                  background: dispo === d.key ? '#E8A020' : '#2E3E3E',
                  color: dispo === d.key ? '#F7F4EE' : '#8C8070',
                  border: '1px solid',
                  borderColor: dispo === d.key ? '#E8A020' : '#3E4E4E',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up */}
      <div>
        <span style={labelStyle}>FOLLOW-UP</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['none', 'schedule'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFollowup(opt)}
              style={{
                padding: '8px 12px',
                background: followup === opt ? '#E8A020' : '#2E3E3E',
                color: followup === opt ? '#F7F4EE' : '#8C8070',
                border: '1px solid',
                borderColor: followup === opt ? '#E8A020' : '#3E4E4E',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              {opt === 'none' ? 'NO FOLLOWUP' : 'SCHEDULE'}
            </button>
          ))}
        </div>
        {followup === 'schedule' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="time"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !outcome || saved}
        style={{
          width: '100%',
          padding: '14px',
          background: saved ? '#1C2B2B' : !outcome ? '#2E3E3E' : '#E8A020',
          color: saved ? '#E8A020' : '#F7F4EE',
          border: saved ? '1px solid #E8A020' : 'none',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: '2px',
          cursor: !outcome || saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saved ? 'SAVED' : saving ? 'SAVING...' : 'SAVE LOG'}
      </button>
    </div>
  )
}
