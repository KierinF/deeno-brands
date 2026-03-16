import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CT_ID = '863RBY1LO@QSD8UJQF%DNN1'
const CT_KEY = 'ylWXzhY54A%D@IfTu4peuEbTr7Cl?231hmmcSxB0iuD1l'
const BASE = 'https://my.cloudtalk.io/api'
const AUTH = 'Basic ' + Buffer.from(`${CT_ID}:${CT_KEY}`).toString('base64')

async function fetchPage(dateFrom: string, dateTo: string, page: number) {
  const url = `${BASE}/calls/index.json?limit=200&page=${page}&date_from=${dateFrom}&date_to=${dateTo}`
  const res = await fetch(url, { headers: { Authorization: AUTH } })
  if (!res.ok) throw new Error(`CloudTalk ${res.status}`)
  return res.json()
}

export async function GET(request: NextRequest) {
  // Require auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const dateFrom = searchParams.get('date_from') || ''
  const dateTo = searchParams.get('date_to') || ''

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: 'date_from and date_to required' }, { status: 400 })
  }

  try {
    // Fetch first page to get total count
    const first = await fetchPage(dateFrom, dateTo, 1)
    const rd = first.responseData
    const pageCount = Math.min(rd.pageCount, 15) // cap at 15 pages (3000 calls)

    // Fetch remaining pages in parallel
    const pages = [rd.data]
    if (pageCount > 1) {
      const rest = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, i) =>
          fetchPage(dateFrom, dateTo, i + 2).then(r => r.responseData.data)
        )
      )
      pages.push(...rest)
    }

    const calls = pages.flat()

    let answered = 0
    let missed = 0
    let outgoing = 0
    let incoming = 0
    let totalTalkSecs = 0
    let answeredDurationSecs = 0

    for (const c of calls) {
      const cdr = c.Cdr
      const talkTime = parseInt(cdr.talking_time ?? '0', 10) || 0
      const wasAnswered = talkTime > 0

      if (cdr.type === 'outgoing') outgoing++
      else incoming++

      if (wasAnswered) {
        answered++
        totalTalkSecs += talkTime
        answeredDurationSecs += parseInt(cdr.billsec ?? '0', 10) || 0
      } else {
        missed++
      }
    }

    const totalCalls = calls.length
    const avgDurationSecs = answered > 0 ? Math.round(answeredDurationSecs / answered) : 0

    return NextResponse.json({
      total_calls: totalCalls,
      answered,
      missed,
      outgoing,
      incoming,
      avg_duration_secs: avgDurationSecs,
      total_talk_secs: totalTalkSecs,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
