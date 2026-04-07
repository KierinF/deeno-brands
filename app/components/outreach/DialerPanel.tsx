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

function toE164(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return input.startsWith('+') ? `+${digits}` : input.trim()
}

const KEYPAD_KEYS: { digit: string; letters: string }[][] = [
  [{ digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' }],
  [{ digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' }],
  [{ digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' }],
  [{ digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' }],
]

export default function DialerPanel({
  parcelId,
  contactName,
  phoneNumber: rawPhoneNumber,
  buildingAddress,
  signalBrief,
  leadId,
  contactId,
  onCallStarted,
  onClose,
}: Props) {
  const phoneNumber = toE164(rawPhoneNumber)
  const [state, setState] = useState<DialerState>('idle')
  const [callSid, setCallSid] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showKeypad, setShowKeypad] = useState(false)
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
        setShowKeypad(false)
        if (timerRef.current) clearInterval(timerRef.current)
      })
      call.on('error', (err: { message?: string; code?: number | string; name?: string }) => {
        console.error('[Twilio] call error:', err)
        const code = err.code ? ` [${err.code}]` : ''
        setError((err.message || err.name || 'Call error') + code)
        setState('ended')
        setShowKeypad(false)
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

  function sendDTMF(digit: string) {
    if (callRef.current) {
      callRef.current.sendDigits(digit)
    }
  }

  function hangUp() {
    if (callRef.current) callRef.current.disconnect()
    setState('ended')
    setShowKeypad(false)
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
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, borderBottom: (state === 'ended' || (state === 'connected' && showKeypad)) ? '1px solid #2E3E3E' : 'none', flexShrink: 0 }}>
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
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                style={{
                  flex: 1, padding: '11px',
                  background: showKeypad ? '#E8A020' : 'transparent',
                  color: showKeypad ? '#1C2B2B' : '#C8C1B3',
                  border: showKeypad ? 'none' : '1px solid #2E3E3E',
                  ...m, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer',
                  fontWeight: showKeypad ? 700 : 400,
                }}
              >
                KEYPAD
              </button>
              <button onClick={hangUp} style={{ flex: 1, padding: '11px', background: '#C0392B', color: '#F7F4EE', border: 'none', ...m, fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer', fontWeight: 700 }}>
                HANG UP
              </button>
            </div>
          </>
        )}
        {error && <p style={{ ...m, fontSize: 11, color: '#C0392B', textAlign: 'center', margin: 0 }}>{error}</p>}
      </div>

      {/* DTMF Keypad with letters — visible during connected call */}
      {state === 'connected' && showKeypad && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E3E3E', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {KEYPAD_KEYS.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {row.map(({ digit, letters }) => (
                  <button
                    key={digit}
                    onClick={() => sendDTMF(digit)}
                    style={{
                      background: '#2E3E3E', border: 'none',
                      cursor: 'pointer', padding: '8px 0',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    }}
                  >
                    <span style={{ ...m, fontSize: 20, color: '#F7F4EE', lineHeight: 1 }}>{digit}</span>
                    {letters && (
                      <span style={{ ...m, fontSize: 8, color: '#8C8070', letterSpacing: '2px', lineHeight: 1 }}>{letters}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call log form */}
      {state === 'ended' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <p style={{ ...m, fontSize: 10, letterSpacing: '2px', color: '#8C8070', margin: '0 0 14px 0' }}>LOG THIS CALL</p>
          <CallLogForm
            parcelId={parcelId}
            leadId={leadId || null}
            contactId={contactId || null}
            callSid={callSid}
            phoneNumber={phoneNumber}
            onSave={onClose}
          />
        </div>
      )}
    </div>
  )
}
