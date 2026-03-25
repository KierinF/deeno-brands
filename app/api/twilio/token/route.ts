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

    const accountSid   = process.env.TWILIO_ACCOUNT_SID?.trim()
    const authToken    = process.env.TWILIO_AUTH_TOKEN?.trim()
    const twimlAppSid  = process.env.TWILIO_TWIML_APP_SID?.trim()
    const apiKeySid    = process.env.TWILIO_API_KEY_SID?.trim()
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim()

    if (!accountSid || !authToken || !twimlAppSid) {
      console.error('Missing Twilio env vars:', { accountSid: !!accountSid, authToken: !!authToken, twimlAppSid: !!twimlAppSid })
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
    }

    const identity = user.email || user.id

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    })

    // Use API key if available (must start with SK), otherwise fall back to accountSid/authToken
    const hasApiKey = apiKeySid?.startsWith('SK') && !!apiKeySecret
    const accessToken = new AccessToken(
      accountSid,
      hasApiKey ? apiKeySid! : accountSid,
      hasApiKey ? apiKeySecret! : authToken,
      { identity, ttl: 3600 }
    )
    accessToken.addGrant(voiceGrant)

    return NextResponse.json({ token: accessToken.toJwt(), identity })
  } catch (err) {
    console.error('Token generation error:', err)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
