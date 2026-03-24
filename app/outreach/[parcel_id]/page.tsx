import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BuildingNotes from '@/app/components/outreach/BuildingNotes'
import PhoneNumberManager from '@/app/components/outreach/PhoneNumberManager'
import TranscriptViewer from '@/app/components/outreach/TranscriptViewer'
import TaskSection from '@/app/components/outreach/TaskSection'
import DialerButton from '@/app/components/outreach/DialerButton'

export const dynamic = 'force-dynamic'

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ parcel_id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/client-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!roleRow || (roleRow.role !== 'internal' && roleRow.role !== 'admin')) {
    redirect('/dashboard')
  }

  const { parcel_id } = await params

  const [
    { data: building },
    { data: contacts },
    { data: phoneNumbers },
    { data: activityLog },
    { data: buildingNotes },
    { data: tasks },
    { data: signals },
    { data: lead },
  ] = await Promise.all([
    supabase
      .from('building_intelligence')
      .select('*')
      .eq('parcel_id', parcel_id)
      .single(),
    supabase
      .from('contacts')
      .select('*')
      .eq('parcel_id', parcel_id)
      .order('confidence', { ascending: false }),
    supabase
      .from('phone_numbers')
      .select('*')
      .eq('parcel_id', parcel_id)
      .order('added_at', { ascending: false }),
    supabase
      .from('outreach_log')
      .select('*')
      .eq('parcel_id', parcel_id)
      .order('contacted_at', { ascending: false })
      .limit(20),
    supabase
      .from('building_notes')
      .select('body, updated_at')
      .eq('parcel_id', parcel_id)
      .maybeSingle(),
    supabase
      .from('tasks')
      .select('*')
      .eq('parcel_id', parcel_id)
      .order('due_date', { ascending: true }),
    supabase
      .from('signals')
      .select('*')
      .eq('parcel_id', parcel_id)
      .order('signal_date', { ascending: false })
      .limit(5),
    supabase
      .from('leads')
      .select('*')
      .eq('parcel_id', parcel_id)
      .maybeSingle(),
  ])

  if (!building) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F7F4EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Mono', monospace",
          color: '#8C8070',
        }}
      >
        Building not found.
      </div>
    )
  }

  const signalBrief = [
    building.open_violation_count ? `${building.open_violation_count} violations` : null,
    building.signal_score ? `Score ${building.signal_score}` : null,
    building.incumbent_name ? `Incumbent: ${building.incumbent_name}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      {/* Header */}
      <header
        style={{
          background: '#1C2B2B',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #E8A020',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/outreach"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '1.5px',
              color: '#C8C1B3',
              textDecoration: 'none',
            }}
          >
            ← BACK
          </Link>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: '3px',
              color: '#E8A020',
            }}
          >
            DEENO
          </span>
        </div>
        <Link
          href="/outreach/tasks"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: '1.5px',
            color: '#C8C1B3',
            textDecoration: 'none',
          }}
        >
          TASKS
        </Link>
      </header>

      <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
        {/* Building header */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '24px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {building.signal_score !== null && building.signal_score !== undefined && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background:
                        building.signal_score >= 80
                          ? '#E8A020'
                          : building.signal_score >= 50
                          ? '#1C2B2B'
                          : '#8C8070',
                      color: '#F7F4EE',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '1px',
                    }}
                  >
                    {building.signal_score}
                  </span>
                )}
                <h1
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    letterSpacing: '2px',
                    color: '#1C2B2B',
                    margin: 0,
                  }}
                >
                  {building.address}
                </h1>
              </div>
              {lead && (
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: '#8C8070',
                    margin: 0,
                    letterSpacing: '1px',
                  }}
                >
                  {lead.status?.toUpperCase() || 'NEW'}
                  {lead.call_count ? ` · ${lead.call_count} calls` : ''}
                  {lead.last_called_at
                    ? ` · Last called ${new Date(lead.last_called_at).toLocaleDateString()}`
                    : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WHY THIS BUILDING */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              marginBottom: 16,
              margin: '0 0 16px 0',
            }}
          >
            WHY THIS BUILDING
          </p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  margin: '0 0 4px 0',
                }}
              >
                OPEN VIOLATIONS
              </p>
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: '2px',
                  color: building.open_violation_count > 0 ? '#E8A020' : '#1C2B2B',
                  margin: 0,
                }}
              >
                {building.open_violation_count ?? 0}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  margin: '0 0 4px 0',
                }}
              >
                LAST SIGNAL
              </p>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: '#1C2B2B',
                  margin: 0,
                }}
              >
                {building.last_signal_date
                  ? new Date(building.last_signal_date).toLocaleDateString()
                  : '—'}
              </p>
              {signals && signals.length > 0 && (
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: '#8C8070',
                    margin: '4px 0 0 0',
                  }}
                >
                  {signals[0].signal_type}
                </p>
              )}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  margin: '0 0 4px 0',
                }}
              >
                INCUMBENT
              </p>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: '#1C2B2B',
                  margin: 0,
                }}
              >
                {building.incumbent_name || '—'}
              </p>
              {building.incumbent_staleness && (
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: '#8C8070',
                    margin: '4px 0 0 0',
                  }}
                >
                  {building.incumbent_staleness}
                </p>
              )}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  margin: '0 0 4px 0',
                }}
              >
                PM
              </p>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: '#1C2B2B',
                  margin: 0,
                }}
              >
                {building.pm_name || 'Unknown'}
              </p>
              {building.pm_confidence && (
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: '#8C8070',
                    margin: '4px 0 0 0',
                  }}
                >
                  {building.pm_confidence}% confidence
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CONTACTS */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              margin: '0 0 16px 0',
            }}
          >
            CONTACTS
          </p>

          {contacts && contacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {contacts.map((contact) => {
                const contactPhones = (phoneNumbers || []).filter(
                  (p) => p.contact_id === contact.id
                )
                const name = contact.first_name
                  ? `${contact.first_name} ${contact.last_name || ''}`.trim()
                  : contact.business_name || 'Unknown'
                return (
                  <div
                    key={contact.id}
                    style={{
                      padding: '12px 16px',
                      background: '#F7F4EE',
                      border: '1px solid #C8C1B3',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: contactPhones.length > 0 ? 12 : 0,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            color: '#1C2B2B',
                          }}
                        >
                          {name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 10,
                            color: '#8C8070',
                            marginLeft: 10,
                            letterSpacing: '1px',
                          }}
                        >
                          {contact.contact_type?.toUpperCase()}
                        </span>
                        {contact.confidence && (
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 10,
                              color: '#C8C1B3',
                              marginLeft: 8,
                            }}
                          >
                            {contact.confidence}%
                          </span>
                        )}
                      </div>
                      {contact.phone && (
                        <DialerButton
                          parcelId={parcel_id}
                          contactId={contact.id}
                          contactName={name}
                          phoneNumber={contact.phone}
                          buildingAddress={building.address}
                          signalBrief={signalBrief}
                        />
                      )}
                    </div>
                    {contactPhones.length > 0 && (
                      <PhoneNumberManager
                        parcelId={parcel_id}
                        numbers={contactPhones}
                        onUpdate={null}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: '#8C8070',
              }}
            >
              No contacts found.
            </p>
          )}

          {/* Unassigned phone numbers */}
          {phoneNumbers && phoneNumbers.filter((p) => !p.contact_id).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  color: '#8C8070',
                  margin: '0 0 8px 0',
                }}
              >
                OTHER NUMBERS
              </p>
              <PhoneNumberManager
                parcelId={parcel_id}
                numbers={phoneNumbers.filter((p) => !p.contact_id)}
                onUpdate={null}
              />
            </div>
          )}
        </div>

        {/* NOTES */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              margin: '0 0 12px 0',
            }}
          >
            NOTES
          </p>
          <BuildingNotes
            parcelId={parcel_id}
            initialBody={buildingNotes?.body || ''}
          />
        </div>

        {/* TASKS */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              margin: '0 0 12px 0',
            }}
          >
            TASKS
          </p>
          <TaskSection parcelId={parcel_id} initialTasks={tasks || []} />
        </div>

        {/* ACTIVITY LOG */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8C1B3',
            padding: '20px 24px',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              margin: '0 0 16px 0',
            }}
          >
            ACTIVITY LOG
          </p>
          {activityLog && activityLog.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activityLog.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '14px 0',
                    borderBottom:
                      i < activityLog.length - 1 ? '1px solid #C8C1B3' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '1px',
                        color: '#F7F4EE',
                        background:
                          entry.outcome === 'connected'
                            ? '#1C2B2B'
                            : entry.outcome === 'voicemail'
                            ? '#8C8070'
                            : '#C8C1B3',
                        padding: '2px 8px',
                      }}
                    >
                      {entry.outcome?.toUpperCase() || 'CALL'}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: '#8C8070',
                      }}
                    >
                      {entry.contacted_at
                        ? new Date(entry.contacted_at).toLocaleString()
                        : ''}
                    </span>
                    {entry.duration_secs && (
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          color: '#8C8070',
                        }}
                      >
                        {Math.floor(entry.duration_secs / 60)}m{entry.duration_secs % 60}s
                      </span>
                    )}
                    {entry.direction && (
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: '#C8C1B3',
                          letterSpacing: '1px',
                        }}
                      >
                        {entry.direction.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        color: '#1C2B2B',
                        margin: '0 0 8px 0',
                        lineHeight: 1.6,
                      }}
                    >
                      {entry.notes}
                    </p>
                  )}
                  <TranscriptViewer
                    transcript={entry.transcript || null}
                    recordingUrl={entry.recording_url || null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: '#8C8070',
              }}
            >
              No activity yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
