import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { twilioClient, APP_BASE_URL } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const From = body.get('From') as string

  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  try {
    const supabase = await createClient()

    // Look up caller in phone_numbers table
    const { data: phoneRecord } = await supabase
      .from('phone_numbers')
      .select('id, parcel_id, contact_id, org_id')
      .eq('number', From)
      .maybeSingle()

    if (phoneRecord?.parcel_id) {
      let callerName = 'Unknown'
      if (phoneRecord.contact_id) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('first_name, last_name, business_name')
          .eq('id', phoneRecord.contact_id)
          .maybeSingle()
        if (contact) {
          callerName = contact.first_name
            ? `${contact.first_name} ${contact.last_name || ''}`.trim()
            : contact.business_name || 'Unknown'
        }
      } else if (phoneRecord.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('business_name')
          .eq('id', phoneRecord.org_id)
          .maybeSingle()
        if (org) callerName = org.business_name || 'Unknown'
      }

      const { data: repSettings } = await supabase
        .from('rep_settings')
        .select('cell_number, twilio_number')
        .limit(1)
        .maybeSingle()

      if (repSettings?.cell_number) {
        const buildingUrl = `${APP_BASE_URL}/outreach/${phoneRecord.parcel_id}`
        await twilioClient.messages.create({
          body: `📞 Incoming: ${callerName} (${From})\n${buildingUrl}`,
          from: repSettings.twilio_number || process.env.TWILIO_NUMBER!,
          to: repSettings.cell_number,
        })
      }
    }
  } catch (err) {
    console.error('Inbound call lookup error:', err)
  }

  // Try browser client first (15s), then fall back to cell
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dial = twiml.dial({
    timeout: 15,
    action: `${APP_BASE_URL}/api/twilio/fallback`,
    method: 'POST',
  } as any)

  dial.client('rep')

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
