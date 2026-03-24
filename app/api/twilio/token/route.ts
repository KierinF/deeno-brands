import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'

const AccessToken = twilio.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID!

    const identity = user.email || user.id

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    })

    const token = new AccessToken(accountSid, authToken, process.env.TWILIO_API_KEY_SECRET || authToken, {
      identity,
      ttl: 3600,
    })
    // Use API key if available
    const accessToken = new AccessToken(
      accountSid,
      process.env.TWILIO_API_KEY_SID || accountSid,
      process.env.TWILIO_API_KEY_SECRET || authToken,
      { identity, ttl: 3600 }
    )
    accessToken.addGrant(voiceGrant)

    return NextResponse.json({ token: accessToken.toJwt(), identity })
  } catch (err) {
    console.error('Token generation error:', err)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
