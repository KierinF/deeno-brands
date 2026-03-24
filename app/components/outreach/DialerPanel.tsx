'use client'

import { useState, useEffect, useRef } from 'react'
import CallLogForm from './CallLogForm'

type DialerState = 'idle' | 'connecting' | 'connected' | 'ended'

type Props = {
  parcelId: string
  contactName: string
  phoneNumber: string
  phoneNumberId?: string | null
  buildingAddress: string
  signalBrief: string
  leadId?: string | null
  contactId?: string | null
  onClose: () => void
}

export default function DialerPanel({
  parcelId,
  contactName,
  phoneNumber,
  buildingAddress,
  signalBrief,
  leadId,
  contactId,
  onClose,
}: Props) {
  const [state, setState] = useState<DialerState>('idle')
  const [callSid, setCallSid] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (deviceRef.current) {
        deviceRef.current.destroy()
      }
    }
  }, [])

  async function initAndCall() {
    setState('connecting')
    setError(null)
    try {
      // Dynamically import Twilio Voice SDK
      const { Device } = await import('@twilio/voice-sdk')

      const res = await fetch('/api/twilio/token', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to get token')
      const { token } = await res.json()

      const device = new Device(token, { logLevel: 1 })
      deviceRef.current = device

      await device.register()

      const call = await device.connect({
        params: {
          To: phoneNumber,
          parcel_id: parcelId,
          contact_id: contactId || '',
        },
      })
      callRef.current = call

      call.on('accept', () => {
        setState('connected')
        setCallSid(call.parameters?.CallSid || null)
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      })

      call.on('disconnect', () => {
        setState('ended')
        if (timerRef.current) clearInterval(timerRef.current)
      })

      call.on('error', (err: Error) => {
        setError(err.message)
        setState('ended')
        if (timerRef.current) clearInterval(timerRef.current)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setState('idle')
    }
  }

  function hangUp() {
    if (callRef.current) {
      callRef.current.disconnect()
    }
    setState('ended')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function dropVoicemail() {
    try {
      hangUp()
      await fetch('/api/twilio/drop-vm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          parcel_id: parcelId,
          contact_id: contactId || null,
        }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drop voicemail')
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 380,
        background: '#1C2B2B',
        borderLeft: '2px solid #E8A020',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2E3E3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '2px',
            color: '#8C8070',
          }}
        >
          DIALER
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#8C8070',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Contact info */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E3E3E' }}>
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: '2px',
            color: '#F7F4EE',
            margin: '0 0 4px 0',
          }}
        >
          {contactName}
        </p>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: '#E8A020',
            margin: '0 0 4px 0',
          }}
        >
          {phoneNumber}
        </p>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: '#8C8070',
            margin: '0 0 8px 0',
          }}
        >
          {buildingAddress}
        </p>
        {signalBrief && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: '#C8C1B3',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {signalBrief}
          </p>
        )}
      </div>

      {/* Dialer controls */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          borderBottom: state === 'ended' ? '1px solid #2E3E3E' : 'none',
          flex: state === 'ended' ? 'none' : 1,
        }}
      >
        {state === 'idle' && (
          <button
            onClick={initAndCall}
            style={{
              width: '100%',
              padding: '16px',
              background: '#E8A020',
              color: '#F7F4EE',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: '2px',
              cursor: 'pointer',
            }}
          >
            CALL NOW
          </button>
        )}

        {state === 'connecting' && (
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: '#C8C1B3',
                letterSpacing: '1.5px',
              }}
            >
              CONNECTING...
            </p>
          </div>
        )}

        {state === 'connected' && (
          <>
            <p
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 40,
                letterSpacing: '2px',
                color: '#E8A020',
                margin: 0,
              }}
            >
              {formatTime(seconds)}
            </p>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button
                onClick={dropVoicemail}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#C8C1B3',
                  border: '1px solid #2E3E3E',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                }}
              >
                DROP VM
              </button>
              <button
                onClick={hangUp}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#C0392B',
                  color: '#F7F4EE',
                  border: 'none',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                }}
              >
                HANG UP
              </button>
            </div>
          </>
        )}

        {error && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: '#C0392B',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Call log form after call ends */}
      {state === 'ended' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '2px',
              color: '#8C8070',
              margin: '0 0 16px 0',
            }}
          >
            LOG THIS CALL
          </p>
          <CallLogForm
            parcelId={parcelId}
            leadId={leadId || null}
            contactId={contactId || null}
            callSid={callSid}
            onSave={onClose}
          />
        </div>
      )}
    </div>
  )
}
