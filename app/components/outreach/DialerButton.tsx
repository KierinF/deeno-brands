'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const DialerPanel = dynamic(() => import('./DialerPanel'), { ssr: false })

type Props = {
  parcelId: string
  contactId: string
  contactName: string
  phoneNumber: string
  buildingAddress: string
  signalBrief: string
  leadId?: string | null
}

export default function DialerButton({
  parcelId,
  contactId,
  contactName,
  phoneNumber,
  buildingAddress,
  signalBrief,
  leadId,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Call ${contactName}`}
        style={{
          padding: '8px 14px',
          background: '#E8A020',
          color: '#F7F4EE',
          border: 'none',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: '1px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span>CALL</span>
        <span style={{ fontSize: 14 }}>&#9742;</span>
      </button>

      {open && (
        <DialerPanel
          parcelId={parcelId}
          contactId={contactId}
          contactName={contactName}
          phoneNumber={phoneNumber}
          buildingAddress={buildingAddress}
          signalBrief={signalBrief}
          leadId={leadId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
