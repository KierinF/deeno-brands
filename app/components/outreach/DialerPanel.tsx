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
  onCallStarted?: () => void
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
  onCallStarted,
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
      if (deviceRef.current) deviceRef.current.destroy()
    }
  }, [])

  async function initAndCall() {
    setState('connecting')
    setError(null)
    console.log('[Twilio] initAndCall — number:', phoneNumber, 'leadId:', leadId)
    // Warn if number isn't E.164 — Twilio requires +1XXXXXXXXXX
    if (!phoneNumber.startsWith('+')) {
      setError(`Number must be in E.164 format (e.g. +12125550000). Got: ${phoneNumber}`)
      setState('idle')
      return
    }
    try {
      const { Device } = await import('@twilio/voice-sdk')

      console.log('[Twilio] Fetching token from /api/twilio/token...')
      const res = await fetch('/api/twilio/token', { method: 'POST' })
      console.log('[Twilio] Token response status:', res.status)
      if (!res.ok) {
        const body = await res.text()
        console.error('[Twilio] Token error body:', body)
        throw new Error(`Failed to get token (${res.status}): ${body}`)
      }
      const tokenData = await res.json()
      console.log('[Twilio] Got token, identity:', tokenData.identity, 'token length:', tokenData.token?.length)

      const device = new Device(tokenData.token, { logLevel: 1 })
      deviceRef.current = device

      device.on('error', (err: { message?: string; code?: number | string }) => {
        console.error('[Twilio] Device error:', err)
      })
      device.on('registered', () => console.log('[Twilio] Device registered'))
      device.on('unregistered', () => console.log('[Twilio] Device unregistered'))

      console.log('[Twilio] Registering device...')
      await device.register()
      console.log('[Twilio] Device registered, connecting to:', phoneNumber)

      const call = await device.connect({
        params: {
          To: phoneNumber,
          parcel_id: parcelId,
          contact_id: contactId || '',
        },
      })
      callRef.current = call
      console.log('[Twilio] device.connect() returned call object')

      // Auto-transition lead to in_progress when call is initiated
      onCallStarted?.()

      call.on('accept', () => {
        console.log('[Twilio] call accepted, CallSid:', call.parameters?.CallSid)
        setState('connected')
        setCallSid(call.parameters?.CallSid || null)
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      })
      call.on('ringing', () => console.log('[Twilio] call ringing'))
      call.on('disconnect', () => {
        console.log('[Twilio] call disconnected')
        setState('ended')
        if (timerRef.current) clearInterval(timerRef.current)
      })
      call.on('error', (err: { message?: string; code?: number | string; name?: string }) => {
        console.error('[Twilio] call error:', err)
        const code = err.code ? ` [${err.code}]` : ''
        setError((err.message || err.name || 'Call error') + code)
        setState('ended')
        if (timerRef.current) clearInterval(timerRef.current)
      })
    } catch (err: unknown) {
      const e = err as { message?: string; code?: number | string; name?: string }
      console.error('[Twilio] initAndCall exception:', e)
      const code = e.code ? ` [${e.code}]` : ''
      setError((e.message || e.name || 'Connection failed') + code)
      setState('idle')
    }
  }

  function hangUp() {
    if (callRef.current) callRef.current.disconnect()
    setState('ended')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function dropVoicemail() {
    try {
      hangUp()
      await fetch('/api/twilio/drop-vm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, parcel_id: parcelId, contact_id: contactId || null }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drop voicemail')
    }
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const sec = s % 60
    return `${mins}:${sec.toString().padStart(2, '0')}`
  }

  const m = { fontFamily: "'DM Mono', monospace" }

  return (
    <div style={{
      width: 360,
      flexShrink: 0,
      background: '#1C2B2B',
      borderLeft: '2px solid #E8A020',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ ...m, fontSize: 10, letterSpacing: '2px', color: '#8C8070' }}>DIALER</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8C8070', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      {/* Contact info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '2px', color: '#F7F4EE', margin: '0 0 4px 0' }}>
          {contactName}
        </p>
        <p style={{ ...m, fontSize: 13, color: '#E8A020', margin: '0 0 4px 0' }}>{phoneNumber}</p>
        <p style={{ ...m, fontSize: 11, color: '#8C8070', margin: '0 0 6px 0' }}>{buildingAddress}</p>
        {signalBrief && <p style={{ ...m, fontSize: 10, color: '#C8C1B3', margin: 0, lineHeight: 1.5 }}>{signalBrief}</p>}
      </div>

      {/* Controls */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, borderBottom: state === 'ended' ? '1px solid #2E3E3E' : 'none', flexShrink: 0 }}>
        {state === 'idle' && (
          <button onClick={initAndCall} style={{ width: '100%', padding: '14px', background: '#E8A020', color: '#1C2B2B', border: 'none', ...m, fontSize: 12, letterSpacing: '2px', fontWeight: 700, cursor: 'pointer' }}>
            CALL NOW
          </button>
        )}
        {state === 'connecting' && (
          <p style={{ ...m, fontSize: 12, color: '#C8C1B3', letterSpacing: '1.5px' }}>CONNECTING...</p>
        )}
        {state === 'connected' && (
          <>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: '2px', color: '#E8A020', margin: 0 }}>
              {formatTime(seconds)}
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={dropVoicemail} style={{ flex: 1, padding: '11px', background: 'transparent', color: '#C8C1B3', border: '1px solid #2E3E3E', ...m, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer' }}>
                DROP VM
              </button>
              <button onClick={hangUp} style={{ flex: 1, padding: '11px', background: '#C0392B', color: '#F7F4EE', border: 'none', ...m, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer', fontWeight: 700 }}>
                HANG UP
              </button>
            </div>
          </>
        )}
        {error && <p style={{ ...m, fontSize: 11, color: '#C0392B', textAlign: 'center', margin: 0 }}>{error}</p>}
      </div>

      {/* Call log form */}
      {state === 'ended' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <p style={{ ...m, fontSize: 10, letterSpacing: '2px', color: '#8C8070', margin: '0 0 14px 0' }}>LOG THIS CALL</p>
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
