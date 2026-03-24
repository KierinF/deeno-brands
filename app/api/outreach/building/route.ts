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
    { data: pmOrgs },
  ] = await Promise.all([
    supabase.from('building_intelligence').select('*').eq('parcel_id', parcel_id).single(),
    // No limit — we group by type and collapse in UI
    supabase.from('contacts').select('*').eq('parcel_id', parcel_id).order('confidence', { ascending: false }),
    supabase.from('phone_numbers').select('*').eq('parcel_id', parcel_id).order('added_at', { ascending: false }),
    supabase.from('outreach_log').select('*').eq('parcel_id', parcel_id).order('contacted_at', { ascending: false }).limit(20),
    supabase.from('building_notes').select('body, updated_at').eq('parcel_id', parcel_id).maybeSingle(),
    supabase.from('tasks').select('*').eq('parcel_id', parcel_id).order('due_date', { ascending: true }),
    // Full signal detail including raw_data for charge codes/fines
    supabase.from('signals').select('id, signal_type, signal_date, is_open, source, raw_data').eq('parcel_id', parcel_id).order('signal_date', { ascending: false }).limit(20),
    supabase.from('leads').select('*').eq('parcel_id', parcel_id).maybeSingle(),
    // PM org from organizations table
    supabase.from('organizations').select('id, business_name, org_type, phone, management_signal_type, confidence').eq('parcel_id', parcel_id).in('org_type', ['manager', 'owner', 'permit_applicant']).order('confidence', { ascending: false }).limit(10),
  ])

  return NextResponse.json({ building, contacts, phoneNumbers, activityLog, buildingNotes, tasks, signals, lead, pmOrgs })
}
