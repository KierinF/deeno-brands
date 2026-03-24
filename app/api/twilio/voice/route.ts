import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { APP_BASE_URL, TWILIO_NUMBER } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const To = body.get('To') as string
  const parcelId = body.get('parcel_id') as string | null
  const contactId = body.get('contact_id') as string | null

  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  if (!To) {
    twiml.say('No destination number provided.')
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const statusCallbackUrl = new URL(`${APP_BASE_URL}/api/twilio/status`)
  if (parcelId) statusCallbackUrl.searchParams.set('parcel_id', parcelId)
  if (contactId) statusCallbackUrl.searchParams.set('contact_id', contactId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dial = twiml.dial({
    callerId: TWILIO_NUMBER,
    record: 'record-from-answer',
    recordingStatusCallback: `${APP_BASE_URL}/api/twilio/recording`,
    recordingStatusCallbackMethod: 'POST',
    action: statusCallbackUrl.toString(),
    method: 'POST',
  } as any)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dial.number({
    statusCallback: statusCallbackUrl.toString(),
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  } as any, To)

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
