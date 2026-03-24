'use client'

import { useEffect, useState, useCallback } from 'react'
import StagePipeline from './StagePipeline'
import PhoneNumberManager from './PhoneNumberManager'
import BuildingNotes from './BuildingNotes'
import TaskSection from './TaskSection'
import TranscriptViewer from './TranscriptViewer'

const TYPE_ORDER: Record<string, number> = {
  property_manager: 0,
  owner: 1,
  trade_referral: 2,
  permit_applicant: 3,
  violation_respondent: 4,
}

type Props = {
  parcelId: string
  onClose: () => void
}

export default function BuildingPanel({ parcelId, onClose }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/outreach/building?parcel_id=${parcelId}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [parcelId])

  useEffect(() => {
    load()
  }, [load])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mono = { fontFamily: "'DM Mono', monospace" }

  if (loading) return (
    <div style={{ ...mono, fontSize: 12, color: '#8C8070', padding: 32 }}>Loading...</div>
  )
  if (!data?.building) return (
    <div style={{ ...mono, fontSize: 12, color: '#8C8070', padding: 32 }}>Not found.</div>
  )

  const { building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead } = data

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ].filter(Boolean).join(' · ')

  const sortedContacts = [...(contacts || [])].sort((a: any, b: any) => {
    const ta = TYPE_ORDER[a.contact_type?.toLowerCase() ?? ''] ?? 9
    const tb = TYPE_ORDER[b.contact_type?.toLowerCase() ?? ''] ?? 9
    if (ta !== tb) return ta - tb
    return (b.confidence ?? 0) - (a.confidence ?? 0)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Panel header */}
      <div style={{
        background: '#1C2B2B',
        padding: '0 20px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2E3E3E',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {building.signal_score != null && (
            <span style={{
              ...mono, fontSize: 11, fontWeight: 700,
              padding: '3px 8px',
              background: building.signal_score >= 80 ? '#E8A020' : building.signal_score >= 50 ? '#4A6060' : '#2E3E3E',
              color: building.signal_score >= 80 ? '#1C2B2B' : '#F7F4EE',
              flexShrink: 0,
            }}>
              {building.signal_score}
            </span>
          )}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 18,
            letterSpacing: '2px',
            color: '#F7F4EE',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {building.address}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            ...mono, fontSize: 16, color: '#8C8070', background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 8px', lineHeight: 1, flexShrink: 0,
          }}
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      {/* Stage pipeline */}
      <div style={{ flexShrink: 0 }}>
        <StagePipeline
          parcelId={parcelId}
          initialStage={lead?.status ?? 'new'}
          leadId={lead?.id ?? null}
        />
      </div>

      {/* Stats bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #C8C1B3',
        padding: '10px 20px',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>VIOLATIONS</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: building.open_violation_count > 0 ? '#E8A020' : '#1C2B2B', lineHeight: 1 }}>
            {building.open_violation_count ?? 0}
          </div>
        </div>
        <div>
          <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>LAST SIGNAL</div>
          <div style={{ ...mono, fontSize: 11, color: '#1C2B2B' }}>
            {building.last_signal_date ? new Date(building.last_signal_date).toLocaleDateString() : '—'}
          </div>
          {signals?.[0] && <div style={{ ...mono, fontSize: 9, color: '#8C8070' }}>{signals[0].signal_type}</div>}
        </div>
        <div>
          <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>PM</div>
          <div style={{ ...mono, fontSize: 11, color: '#1C2B2B' }}>{building.pm_name || '—'}</div>
          {building.pm_confidence && <div style={{ ...mono, fontSize: 9, color: '#8C8070' }}>{building.pm_confidence}%</div>}
        </div>
        <div>
          <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>INCUMBENT</div>
          <div style={{ ...mono, fontSize: 11, color: '#1C2B2B' }}>{building.incumbent_name || '—'}</div>
          {building.incumbent_staleness && <div style={{ ...mono, fontSize: 9, color: '#8C8070' }}>{building.incumbent_staleness}</div>}
        </div>
        {building.building_sqft && (
          <div>
            <div style={{ ...mono, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 2 }}>SIZE</div>
            <div style={{ ...mono, fontSize: 11, color: '#1C2B2B' }}>{Number(building.building_sqft).toLocaleString()} sqft</div>
            {building.floors && <div style={{ ...mono, fontSize: 9, color: '#8C8070' }}>{building.floors} fl</div>}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* CONTACTS */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 10 }}>CONTACTS</div>
          {sortedContacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedContacts.map((contact: any) => {
                const cphones = (phoneNumbers || []).filter((p: any) => p.contact_id === contact.id)
                const name = contact.first_name
                  ? `${contact.first_name} ${contact.last_name || ''}`.trim()
                  : contact.business_name || 'Unknown'
                return (
                  <div key={contact.id} style={{ background: '#F7F4EE', border: '1px solid #C8C1B3', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ ...mono, fontSize: 12, color: '#1C2B2B', marginBottom: 4 }}>{name}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ ...mono, fontSize: 8, letterSpacing: '1px', color: '#F7F4EE', background: '#8C8070', padding: '2px 5px' }}>
                            {contact.contact_type?.toUpperCase().replace('_', ' ')}
                          </span>
                          {contact.confidence && (
                            <span style={{ ...mono, fontSize: 9, color: '#C8C1B3' }}>{contact.confidence}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <PhoneNumberManager
                      parcelId={parcelId}
                      numbers={cphones}
                      onUpdate={null}
                      dialerProps={{
                        parcelId,
                        contactId: contact.id,
                        contactName: name,
                        buildingAddress: building.address,
                        signalBrief,
                        leadId: lead?.id ?? null,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 12, color: '#8C8070' }}>No contacts found.</div>
          )}
          {/* Unassigned numbers */}
          {(phoneNumbers || []).filter((p: any) => !p.contact_id).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...mono, fontSize: 9, letterSpacing: '1.5px', color: '#8C8070', marginBottom: 8 }}>OTHER NUMBERS</div>
              <PhoneNumberManager
                parcelId={parcelId}
                numbers={(phoneNumbers || []).filter((p: any) => !p.contact_id)}
                onUpdate={null}
              />
            </div>
          )}
        </section>

        {/* NOTES */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>NOTES</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            <BuildingNotes parcelId={parcelId} initialBody={buildingNotes?.body || ''} />
          </div>
        </section>

        {/* TASKS */}
        <section>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>TASKS</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            <TaskSection parcelId={parcelId} initialTasks={tasks || []} />
          </div>
        </section>

        {/* ACTIVITY LOG */}
        <section style={{ paddingBottom: 32 }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '2px', color: '#8C8070', marginBottom: 8 }}>ACTIVITY</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #C8C1B3', padding: '12px 14px' }}>
            {activityLog?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activityLog.map((entry: any, i: number) => (
                  <div key={entry.id} style={{ padding: '10px 0', borderBottom: i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        ...mono, fontSize: 9, letterSpacing: '1px',
                        color: '#F7F4EE',
                        background: entry.outcome === 'connected' ? '#1C2B2B' : entry.outcome === 'voicemail' ? '#8C8070' : '#C8C1B3',
                        padding: '2px 7px',
                      }}>
                        {entry.outcome?.toUpperCase() || 'CALL'}
                      </span>
                      <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                        {entry.contacted_at ? new Date(entry.contacted_at).toLocaleString() : ''}
                      </span>
                      {entry.duration_secs && (
                        <span style={{ ...mono, fontSize: 10, color: '#8C8070' }}>
                          {Math.floor(entry.duration_secs / 60)}m{entry.duration_secs % 60}s
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div style={{ ...mono, fontSize: 11, color: '#1C2B2B', lineHeight: 1.6, marginBottom: 6 }}>{entry.notes}</div>
                    )}
                    <TranscriptViewer transcript={entry.transcript || null} recordingUrl={entry.recording_url || null} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...mono, fontSize: 11, color: '#8C8070' }}>No activity yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
