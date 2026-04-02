import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Normalize an address string for matching against properties.address
// NYC DOF format uses "622 3 AV", "112 W 34 ST" etc.
// Clay gives "622 3rd Avenue, New York, NY" or "112 West 34th Street"
function normalizeAddr(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/,.*$/, '')                          // drop city/state/zip after first comma
    .replace(/\b(\d+)(?:st|nd|rd|th)\b/g, '$1') // 3rd → 3, 34th → 34
    .replace(/\bwest\b/g, 'w').replace(/\beast\b/g, 'e')
    .replace(/\bnorth\b/g, 'n').replace(/\bsouth\b/g, 's')
    .replace(/\bavenue\b/g, 'av').replace(/\bave\b/g, 'av')
    .replace(/\bstreet\b/g, 'st').replace(/\bboulevard\b/g, 'blvd')
    .replace(/\bplace\b/g, 'pl').replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd').replace(/\blane\b/g, 'ln')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(request: Request) {
  // Verify shared secret set in Clay HTTP action headers
  const secret = request.headers.get('x-clay-secret')
  if (!secret || secret !== process.env.CLAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const {
    address,
    owner_name,
    owner_confidence,
    pm_name,
    pm_confidence,
    broker_name,
    property_phone,
    property_website,
    contacts,
    reasoning,
  } = body

  if (!address) return NextResponse.json({ error: 'missing address' }, { status: 400 })

  const supabase = createAdminClient()

  // --- Address → parcel_id matching ---
  const normalized = normalizeAddr(address)
  const houseNumber = normalized.match(/^\d+/)?.[0]

  if (!houseNumber) {
    return NextResponse.json({ error: 'could not parse house number', address }, { status: 422 })
  }

  // Build a search string: house number + first token of street (e.g. "622 3")
  const tokens = normalized.split(' ')
  const streetFirstToken = tokens[1] ?? ''
  const searchPattern = `${houseNumber} ${streetFirstToken}%`

  const { data: candidates } = await supabase
    .from('properties')
    .select('parcel_id, address')
    .ilike('address', searchPattern)
    .limit(10)

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ error: 'property not found', address, normalized }, { status: 404 })
  }

  let parcel_id: string
  if (candidates.length === 1) {
    parcel_id = candidates[0].parcel_id
  } else {
    // Score candidates by how many normalized tokens match
    const inputTokens = normalized.split(' ')
    const scored = candidates.map((c: any) => {
      const candidateNorm = normalizeAddr(c.address || '')
      const matches = inputTokens.filter(t => candidateNorm.includes(t)).length
      return { parcel_id: c.parcel_id, matches }
    })
    scored.sort((a, b) => b.matches - a.matches)
    if (scored[0].matches === scored[1]?.matches) {
      // Ambiguous — return candidates for manual review
      return NextResponse.json({
        error: 'ambiguous address',
        address,
        candidates: candidates.map((c: any) => ({ parcel_id: c.parcel_id, address: c.address })),
      }, { status: 409 })
    }
    parcel_id = scored[0].parcel_id
  }

  // --- Update building_intelligence ---
  const pmConfInt = pm_confidence != null ? Math.round(pm_confidence * 100) : null
  const ownerConfInt = owner_confidence != null ? Math.round(owner_confidence * 100) : null

  const { data: existing } = await supabase
    .from('building_intelligence')
    .select('pm_confidence, owner_confidence')
    .eq('parcel_id', parcel_id)
    .maybeSingle()

  const biUpdate: Record<string, any> = {
    web_enrichment_raw: {
      pm_name, pm_confidence, owner_name, owner_confidence,
      broker_name, property_phone, property_website,
      contacts, reasoning,
      enriched_at: new Date().toISOString(),
    },
    web_enriched_at: new Date().toISOString(),
  }

  if (property_website) biUpdate.building_website = property_website

  // Only overwrite stitched pm_name/owner_name if Clay is more confident
  if (pm_name && pmConfInt != null && pmConfInt > (existing?.pm_confidence ?? 0)) {
    biUpdate.pm_name = pm_name
    biUpdate.pm_confidence = pmConfInt
  }
  if (owner_name && ownerConfInt != null && ownerConfInt > (existing?.owner_confidence ?? 0)) {
    biUpdate.owner_name = owner_name
    biUpdate.owner_confidence = ownerConfInt
  }

  await supabase.from('building_intelligence').update(biUpdate).eq('parcel_id', parcel_id)

  // --- Insert property phone ---
  if (property_phone) {
    // Check for existing to avoid duplicates (no unique constraint on number)
    const { data: existingPhone } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('parcel_id', parcel_id)
      .eq('number', property_phone)
      .maybeSingle()

    if (!existingPhone) {
      await supabase.from('phone_numbers').insert({
        parcel_id,
        number: property_phone,
        source: 'clay_web',
        status: 'active',
      })
    }
  }

  // --- Insert individual contacts ---
  const contactRows = (contacts ?? [])
    .filter((c: any) => c.name)
    .map((c: any) => {
      const parts = (c.name as string).trim().split(/\s+/)
      const first_name = parts[0]
      const last_name = parts.slice(1).join(' ') || null
      return {
        parcel_id,
        contact_type: 'property_manager' as const,
        first_name,
        last_name,
        title: c.title ?? null,
        phone: c.phone ?? null,
        email: c.email ?? null,
        source: 'clay_web',
        source_date: new Date().toISOString().split('T')[0],
        confidence: Math.round((c.confidence ?? pm_confidence ?? 0.7) * 100),
      }
    })

  let contacts_written = 0
  if (contactRows.length > 0) {
    // dedup_hash (generated column on parcel_id+first_name+last_name) prevents re-run duplicates
    const { data: inserted } = await supabase
      .from('contacts')
      .upsert(contactRows, { onConflict: 'dedup_hash', ignoreDuplicates: true })
      .select('id')
    contacts_written = inserted?.length ?? 0
  }

  return NextResponse.json({ ok: true, parcel_id, contacts_written })
}
