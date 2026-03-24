import OpenAI from 'openai'

// Lazy init — don't throw at module load time when key is not yet set
function getOpenAI() {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === 'placeholder') throw new Error('OPENAI_API_KEY not configured')
  return new OpenAI({ apiKey: key })
}

/**
 * Downloads a Twilio recording MP3 (authenticated) and transcribes via OpenAI Whisper.
 */
export async function transcribeRecording(recordingUrl: string): Promise<string> {
  const openai = getOpenAI()

  const mp3Url = recordingUrl.endsWith('.mp3') ? recordingUrl : `${recordingUrl}.mp3`

  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const response = await fetch(mp3Url, {
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to download recording: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const file = new File([buffer], 'recording.mp3', { type: 'audio/mpeg' })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  })

  return transcription.text
}
