import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transcribeRecording } from '@/lib/transcribe'

export async function POST(request: NextRequest) {
  try {
    const { call_sid, recording_url } = await request.json()

    if (!call_sid || !recording_url) {
      return NextResponse.json({ error: 'Missing call_sid or recording_url' }, { status: 400 })
    }

    const transcript = await transcribeRecording(recording_url)

    const supabase = await createClient()
    await supabase
      .from('outreach_log')
      .update({ transcript })
      .eq('twilio_call_sid', call_sid)

    return NextResponse.json({ ok: true, transcript })
  } catch (err) {
    console.error('Transcription error:', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
