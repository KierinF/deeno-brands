import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { parcel_id } = await req.json()
  if (!parcel_id) return NextResponse.json({ error: 'parcel_id required' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch unclassified contacts for this building
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, business_name, contact_type')
    .eq('parcel_id', parcel_id)
    .is('ai_entity_type', null)
    .eq('is_bad_data', false)

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ classified: 0, persons: 0, entities: 0, message: 'Nothing to classify' })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 })

  // Build classification prompt
  const lines = contacts.map(c => {
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ')
    return `${c.id}|${name || '(blank)'}|${c.business_name || ''}|${c.contact_type}`
  })

  const prompt = `Classify each name as "person" (real human) or "entity" (company, org, agency, government body, truncated business name, placeholder like "Owner Of").

Rules:
- "person" = looks like a real human name (first + last), even if unusual or foreign
- "entity" = company name, abbreviation, government agency, or clearly not a human
- When first+last name reads as a real person → person, even if they work for a company
- Truncated/garbled company names (e.g. "Hunter Roberts Constructi", "Nyc Dsbs", "S & F Warehouse") → entity
- "Owner Of", "Cityof New York" → entity

Respond with ONLY lines: <uuid>|<person or entity>
No other text.

${lines.join('\n')}`

  const oaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 4000,
    }),
  })

  if (!oaiResp.ok) {
    const err = await oaiResp.text()
    return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
  }

  const oaiData = await oaiResp.json()
  const raw = oaiData.choices?.[0]?.message?.content?.trim() || ''

  // Parse results
  const results: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const parts = line.trim().split('|')
    if (parts.length >= 2) {
      const id = parts[0].trim()
      const cls = parts[parts.length - 1].trim().toLowerCase()
      if (cls === 'person' || cls === 'entity') results[id] = cls
    }
  }

  // Batch update
  const updates = Object.entries(results)
  for (const [id, ai_entity_type] of updates) {
    await supabase.from('contacts').update({ ai_entity_type }).eq('id', id)
  }

  const persons = updates.filter(([, v]) => v === 'person').length
  const entities = updates.filter(([, v]) => v === 'entity').length

  return NextResponse.json({
    classified: updates.length,
    total_input: contacts.length,
    persons,
    entities,
    tokens: oaiData.usage?.total_tokens ?? 0,
  })
}
