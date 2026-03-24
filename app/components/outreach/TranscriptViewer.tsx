'use client'

import { useState } from 'react'

type Props = {
  transcript: string | null
  recordingUrl: string | null
}

export default function TranscriptViewer({ transcript, recordingUrl }: Props) {
  const [open, setOpen] = useState(false)

  if (!transcript && !recordingUrl) return null

  return (
    <div style={{ marginTop: 8 }}>
      {recordingUrl && (
        <div style={{ marginBottom: 6 }}>
          <audio
            controls
            src={recordingUrl}
            style={{
              width: '100%',
              height: 32,
              filter: 'invert(0)',
            }}
          />
        </div>
      )}

      {transcript ? (
        <div>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: '1.5px',
              color: '#8C8070',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{open ? '▼' : '▶'}</span>
            TRANSCRIPT
          </button>
          {open && (
            <div
              style={{
                marginTop: 8,
                padding: '12px',
                background: '#F7F4EE',
                border: '1px solid #C8C1B3',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#1C2B2B',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {transcript}
            </div>
          )}
        </div>
      ) : recordingUrl ? (
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: '1.5px',
            color: '#8C8070',
            margin: 0,
          }}
        >
          TRANSCRIBING...
        </p>
      ) : null}
    </div>
  )
}
