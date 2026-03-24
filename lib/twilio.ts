import twilio from 'twilio'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export const TWILIO_NUMBER = process.env.TWILIO_NUMBER!
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL!
