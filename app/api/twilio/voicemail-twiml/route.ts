import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const vmUrl = url.searchParams.get('url')

  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  if (vmUrl) {
    twiml.play(vmUrl)
  } else {
    twiml.say('Hello, this is a message from Deeno. Please give us a call back at your earliest convenience.')
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
