import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parcel_id = searchParams.get('parcel_id')
  if (!parcel_id) return NextResponse.json({ error: 'missing parcel_id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [
    { data: building },
    { data: contacts },
    { data: phoneNumbers },
    { data: activityLog },
    { data: buildingNotes },
    { data: tasks },
    { data: signals },
    { data: lead },
    { data: parcelOrgs },
    { data: permitOrgs },
    { data: buildings },
  ] = await Promise.all([
    supabase.from('building_intelligence').select('*').eq('parcel_id', parcel_id).maybeSingle(),
    supabase.from('contacts').select('*').eq('parcel_id', parcel_id).order('confidence', { ascending: false }),
    supabase.from('phone_numbers').select('*').eq('parcel_id', parcel_id).order('added_at', { ascending: false }),
    supabase.from('outreach_log').select('*').eq('parcel_id', parcel_id).order('contacted_at', { ascending: false }).limit(20),
    supabase.from('building_notes').select('body, updated_at').eq('parcel_id', parcel_id).maybeSingle(),
    supabase.from('tasks').select('*').eq('parcel_id', parcel_id).order('due_date', { ascending: true }),
    // Fetch up to 150 signals — order open first, then by date, so violations aren't buried by proximity fires
    supabase.from('signals').select('id, signal_type, signal_date, is_open, source, raw_data').eq('parcel_id', parcel_id).order('is_open', { ascending: false }).order('signal_date', { ascending: false }).limit(150),
    supabase.from('leads').select('*').eq('parcel_id', parcel_id).maybeSingle(),
    // Organizations: PM, owner orgs for this parcel
    supabase.from('organizations').select('id, org_profile_id, business_name, org_type, phone, management_signal_type, confidence, source, website, website_domain').eq('parcel_id', parcel_id).order('confidence', { ascending: false }).limit(200),
    // Permit applicant orgs with trade_type — source for CONTRACTORS section
    supabase.from('organizations').select('id, business_name, trade_type, phone, source_date, source').eq('parcel_id', parcel_id).eq('org_type', 'permit_applicant').not('trade_type', 'is', null).order('source_date', { ascending: false }).limit(300),
    // BIN-level buildings on this lot
    supabase.from('buildings').select('bin, address, is_primary').eq('parcel_id', parcel_id).order('is_primary', { ascending: false }),
  ])

  // Also fetch orgs that entity contacts link to but live on a different parcel
  const linkedOrgIds = (contacts || [])
    .filter((c: any) => c.organization_id && c.ai_entity_type === 'entity')
    .map((c: any) => c.organization_id)
    .filter((id: string, i: number, arr: string[]) => arr.indexOf(id) === i) // dedupe
  const parcelOrgIds = new Set((parcelOrgs || []).map((o: any) => o.id))
  const missingOrgIds = linkedOrgIds.filter((id: string) => !parcelOrgIds.has(id))

  let linkedOrgs: any[] = []
  if (missingOrgIds.length > 0) {
    const { data } = await supabase
      .from('organizations')
      .select('id, org_profile_id, business_name, org_type, phone, management_signal_type, confidence, source, website, website_domain')
      .in('id', missingOrgIds)
    linkedOrgs = data || []
  }

  const orgs = [...(parcelOrgs || []), ...linkedOrgs]

  // Collect org_profile_ids from both organizations and contacts (web_enriched contacts link directly)
  const orgProfileIds = [
    ...(orgs || []).map((o: any) => o.org_profile_id),
    ...(contacts || []).map((c: any) => c.org_profile_id),
  ].filter((id, i, arr) => id && arr.indexOf(id) === i)  // dedupe

  // Collect all business names to match against org_profiles.canonical_name
  // Include pm_name so PM's org_profile (with common_contractors) is always fetched
  const businessNames = [
    ...(contacts || []).map((c: any) => c.business_name),
    ...(orgs || []).map((o: any) => o.business_name),
    building?.pm_name,
  ].filter((n, i, arr) => n && arr.indexOf(n) === i)

  const [{ data: profilePhones }, { data: orgProfiles }] = await Promise.all([
    orgProfileIds.length > 0
      ? supabase.from('phone_numbers').select('*').in('org_profile_id', orgProfileIds)
      : Promise.resolve({ data: [] }),
    businessNames.length > 0
      ? supabase.from('org_profiles').select('id, canonical_name, phone, website, email, office_address, common_contractors, principals').in('canonical_name', businessNames)
      : Promise.resolve({ data: [] }),
  ])

  const allPhoneNumbers = [...(phoneNumbers || []), ...(profilePhones || [])]

  // If building_intelligence has no row (non-Manhattan), get address from properties table
  let address = building?.address ?? null
  if (!address) {
    const { data: prop } = await supabase
      .from('properties')
      .select('address')
      .eq('parcel_id', parcel_id)
      .maybeSingle()
    address = prop?.address ?? parcel_id
  }

  return NextResponse.json({ building, address, contacts, phoneNumbers: allPhoneNumbers, activityLog, buildingNotes, tasks, signals, lead, orgs, orgProfiles, permitOrgs, buildings })
}
