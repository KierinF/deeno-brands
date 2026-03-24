import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const callSid = body.get('CallSid') as string
    const callStatus = body.get('CallStatus') as string
    const callDuration = body.get('CallDuration') as string | null
    const direction = body.get('Direction') as string | null
    const from = body.get('From') as string | null
    const to = body.get('To') as string | null

    // These come from our custom query params
    const url = new URL(request.url)
    const parcelId = url.searchParams.get('parcel_id') || (body.get('parcel_id') as string | null)
    const contactId = url.searchParams.get('contact_id') || (body.get('contact_id') as string | null)

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 })
    }

    const supabase = await createClient()

    // Only record completed calls
    if (callStatus === 'completed' || callStatus === 'no-answer' || callStatus === 'busy' || callStatus === 'failed') {
      const outcome = callStatus === 'completed' ? 'connected' : callStatus

      // Upsert to outreach_log
      await supabase.from('outreach_log').upsert(
        {
          twilio_call_sid: callSid,
          direction: direction || 'outbound',
          duration_secs: callDuration ? parseInt(callDuration) : null,
          outcome,
          parcel_id: parcelId || null,
          contact_id: contactId || null,
          contacted_at: new Date().toISOString(),
        },
        { onConflict: 'twilio_call_sid' }
      )

      // Update lead stats if we have a parcel_id
      if (parcelId) {
        const { data: lead } = await supabase
          .from('leads')
          .select('id, call_count')
          .eq('parcel_id', parcelId)
          .maybeSingle()

        if (lead) {
          await supabase
            .from('leads')
            .update({
              last_called_at: new Date().toISOString(),
              call_count: (lead.call_count || 0) + 1,
            })
            .eq('id', lead.id)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Status callback error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
