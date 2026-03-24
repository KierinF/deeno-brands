import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  try {
    const supabase = await createClient()
    const { data: rep } = await supabase
      .from('rep_settings')
      .select('cell_number')
      .limit(1)
      .maybeSingle()

    if (rep?.cell_number) {
      const dial = twiml.dial()
      dial.number(rep.cell_number)
    } else {
      twiml.say('The representative is unavailable. Please try again later.')
    }
  } catch (err) {
    console.error('Fallback route error:', err)
    twiml.say('An error occurred. Please try again.')
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
