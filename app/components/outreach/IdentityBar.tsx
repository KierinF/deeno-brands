'use client'

// IdentityBar — shows verified identity for PM, Owner, Broker
// Compares stitched (government sources) vs web-enriched (Clay) data
// ✓ = both sources agree  ⚠ = sources conflict  no badge = single source only

interface IdentityBarProps {
  building: {
    pm_name?: string | null
    pm_confidence?: number | null
    owner_name?: string | null
    owner_confidence?: number | null
    web_enrichment_raw?: {
      pm?: string | null
      pm_confidence?: number | null
      pm_source?: string | null
      owner?: string | null
      owner_confidence?: number | null
      owner_source?: string | null
      broker?: string | null
      broker_confidence?: number | null
      confidence_label?: string | null
    } | null
    web_enriched_at?: string | null
  }
  compact?: boolean
}

const m = { fontFamily: "'IBM Plex Mono', monospace" }

function normalizeName(s: string | null | undefined): string {
  return (s || '')
    .toLowerCase()
    .replace(/\b(llc|lp|llp|inc|corp|corporation|ltd|limited|co|company|pllc|trust|assoc|associates?)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 16)
}

function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const na = normalizeName(a)
  const nb = normalizeName(b)
  return na.length > 3 && nb.length > 3 && na === nb
}

// Compact version — lives in the dark green header
function CompactIdentityBar({ building }: { building: IdentityBarProps['building'] }) {
  const web = building.web_enrichment_raw

  const slots = [
    { label: 'PM', stitched: building.pm_name, web: web?.pm, webConf: web?.pm_confidence },
    { label: 'OWNER', stitched: building.owner_name, web: web?.owner, webConf: web?.owner_confidence },
    { label: 'BROKER', stitched: null as string | null, web: web?.broker ?? null, webConf: web?.broker_confidence },
  ].filter(s => s.stitched || s.web)

  if (slots.length === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {slots.map((s, i) => {
        const agree = namesMatch(s.stitched, s.web)
        const hasBoth = !!(s.stitched && s.web)
        const conflict = hasBoth && !agree
        const name = s.stitched || s.web || ''
        // Truncate long names
        const displayName = name.length > 22 ? name.substring(0, 20) + '…' : name

        return (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column', gap: 1,
            paddingLeft: i > 0 ? 12 : 0,
            borderLeft: i > 0 ? '1px solid #2E3E3E' : 'none',
            marginLeft: i > 0 ? 12 : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ ...m, fontSize: 7, letterSpacing: '1.5px', color: '#5C7070' }}>{s.label}</span>
              {agree && <span style={{ fontSize: 8, color: '#2A7A4B' }}>✓</span>}
              {conflict && <span style={{ fontSize: 8, color: '#E8A020' }}>⚠</span>}
            </div>
            <span style={{ ...m, fontSize: 10, color: '#C8C1B3', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface SlotProps {
  label: string
  stitched: string | null | undefined
  web: string | null | undefined
  webConf: number | null | undefined  // 0-1 float
}

function IdentitySlot({ label, stitched, web, webConf }: SlotProps) {
  const agree = namesMatch(stitched, web)
  const hasBoth = !!(stitched && web)
  const conflict = hasBoth && !agree

  // confidence color for web-only entries
  const confColor = webConf == null ? '#8C8070'
    : webConf >= 0.8 ? '#2A7A4B'
    : webConf >= 0.6 ? '#E8A020'
    : '#8C8070'

  return (
    <div style={{ minWidth: 140, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ ...m, fontSize: 8, letterSpacing: '1.5px', color: '#8C8070' }}>{label}</span>
        {agree && <span style={{ fontSize: 10, color: '#2A7A4B' }}>✓</span>}
        {conflict && <span style={{ fontSize: 10, color: '#E8A020' }}>⚠</span>}
      </div>

      {agree && (
        <div style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{stitched}</div>
      )}

      {conflict && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div>
            <span style={{ ...m, fontSize: 8, color: '#8C8070', marginRight: 4 }}>GOV</span>
            <span style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{stitched}</span>
          </div>
          <div>
            <span style={{ ...m, fontSize: 8, color: '#8C8070', marginRight: 4 }}>WEB</span>
            <span style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{web}</span>
          </div>
        </div>
      )}

      {!hasBoth && stitched && (
        <div>
          <div style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{stitched}</div>
          <div style={{ ...m, fontSize: 8, color: '#C8C1B3' }}>gov only</div>
        </div>
      )}

      {!hasBoth && web && !stitched && (
        <div>
          <div style={{ ...m, fontSize: 11, color: '#1C2B2B' }}>{web}</div>
          <div style={{ ...m, fontSize: 8, color: confColor }}>
            web · {webConf != null ? `${Math.round(webConf * 100)}%` : '—'}
          </div>
        </div>
      )}

      {!stitched && !web && (
        <div style={{ ...m, fontSize: 11, color: '#C8C1B3' }}>—</div>
      )}
    </div>
  )
}

export default function IdentityBar({ building, compact }: IdentityBarProps) {
  const web = building.web_enrichment_raw

  // Don't render if no data at all
  const hasSomething = building.pm_name || building.owner_name || web?.pm || web?.owner || web?.broker
  if (!hasSomething) return null

  if (compact) return <CompactIdentityBar building={building} />

  return (
    <div style={{ background: '#F7F4EF', borderBottom: '1px solid #C8C1B3', padding: '10px 20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 130, paddingRight: 16, borderRight: '1px solid #E8E4DC' }}>
          <IdentitySlot
            label="PROPERTY MANAGER"
            stitched={building.pm_name}
            web={web?.pm}
            webConf={web?.pm_confidence ?? null}
          />
        </div>
        <div style={{ flex: 1, minWidth: 130, paddingLeft: 16, paddingRight: 16, borderRight: '1px solid #E8E4DC' }}>
          <IdentitySlot
            label="OWNER"
            stitched={building.owner_name}
            web={web?.owner}
            webConf={web?.owner_confidence ?? null}
          />
        </div>
        <div style={{ flex: 1, minWidth: 100, paddingLeft: 16 }}>
          <IdentitySlot
            label="BROKER"
            stitched={null}
            web={web?.broker ?? null}
            webConf={web?.broker_confidence ?? null}
          />
        </div>
      </div>
      {building.web_enriched_at && (
        <div style={{ ...m, fontSize: 8, color: '#C8C1B3', marginTop: 8 }}>
          web enriched {new Date(building.web_enriched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}
