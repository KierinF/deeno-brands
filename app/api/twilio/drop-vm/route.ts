import { NextRequest, NextResponse } from 'next/server'
import { twilioClient, APP_BASE_URL, TWILIO_NUMBER } from '@/lib/twilio'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, parcel_id, contact_id } = await request.json()

    if (!to) return NextResponse.json({ error: 'Missing to number' }, { status: 400 })

    // Get voicemail URL from rep settings
    const { data: rep } = await supabase
      .from('rep_settings')
      .select('voicemail_url')
      .eq('user_id', user.id)
      .maybeSingle()

    const voicemailUrl = rep?.voicemail_url
    if (!voicemailUrl) {
      return NextResponse.json({ error: 'No voicemail configured' }, { status: 400 })
    }

    const vmUrl = new URL(`${APP_BASE_URL}/api/twilio/voicemail-twiml`)
    vmUrl.searchParams.set('url', voicemailUrl)

    await twilioClient.calls.create({
      to,
      from: TWILIO_NUMBER,
      url: vmUrl.toString(),
      statusCallback: `${APP_BASE_URL}/api/twilio/status?parcel_id=${parcel_id || ''}&contact_id=${contact_id || ''}`,
      statusCallbackMethod: 'POST',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Drop VM error:', err)
    return NextResponse.json({ error: 'Failed to drop voicemail' }, { status: 500 })
  }
}
