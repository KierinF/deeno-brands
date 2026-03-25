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

    const accountSid   = process.env.TWILIO_ACCOUNT_SID
    const authToken    = process.env.TWILIO_AUTH_TOKEN
    const twimlAppSid  = process.env.TWILIO_TWIML_APP_SID
    const apiKeySid    = process.env.TWILIO_API_KEY_SID
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET

    if (!accountSid || !authToken || !twimlAppSid) {
      console.error('Missing Twilio env vars:', { accountSid: !!accountSid, authToken: !!authToken, twimlAppSid: !!twimlAppSid })
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
    }

    const identity = user.email || user.id

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    })

    // Use API key if set, otherwise fall back to authToken (legacy)
    const accessToken = new AccessToken(
      accountSid,
      apiKeySid    ?? accountSid,
      apiKeySecret ?? authToken,
      { identity, ttl: 3600 }
    )
    accessToken.addGrant(voiceGrant)

    return NextResponse.json({ token: accessToken.toJwt(), identity })
  } catch (err) {
    console.error('Token generation error:', err)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
