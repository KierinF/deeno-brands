import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const callSid = body.get('CallSid') as string
    const recordingUrl = body.get('RecordingUrl') as string | null
    const recordingStatus = body.get('RecordingStatus') as string | null

    if (!callSid || recordingStatus !== 'completed' || !recordingUrl) {
      return NextResponse.json({ ok: true })
    }

    const supabase = await createClient()

    // Update outreach_log with recording URL
    await supabase
      .from('outreach_log')
      .update({ recording_url: recordingUrl })
      .eq('twilio_call_sid', callSid)

    // Trigger async transcription
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    fetch(`${appUrl}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_sid: callSid, recording_url: recordingUrl }),
    }).catch((err) => console.error('Transcription trigger failed:', err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Recording callback error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
