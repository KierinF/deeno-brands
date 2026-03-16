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

type CallStats = {
  total_calls: number
  answered: number
  missed: number
  outgoing: number
  incoming: number
  avg_duration_secs: number
  total_talk_secs: number
  dispositions: Record<string, number>
}

async function fetchStats(dateFrom: string, dateTo: string): Promise<CallStats> {
  const first = await fetchPage(dateFrom, dateTo, 1)
  const rd = first.responseData
  const pageCount = Math.min(rd.pageCount ?? 1, 15)

  const pages = [rd.data ?? []]
  if (pageCount > 1) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        fetchPage(dateFrom, dateTo, i + 2).then(r => r.responseData.data ?? [])
      )
    )
    pages.push(...rest)
  }

  const calls = pages.flat()

  let answered = 0, missed = 0, outgoing = 0, incoming = 0
  let totalTalkSecs = 0, answeredDurationSecs = 0
  const dispositions: Record<string, number> = {}

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

    // Dispositions = call-level tags (set by agents after calls)
    const callTags: { name: string }[] = c.Tags ?? []
    for (const t of callTags) {
      dispositions[t.name] = (dispositions[t.name] ?? 0) + 1
    }
  }

  return {
    total_calls: calls.length,
    answered,
    missed,
    outgoing,
    incoming,
    avg_duration_secs: answered > 0 ? Math.round(answeredDurationSecs / answered) : 0,
    total_talk_secs: totalTalkSecs,
    dispositions,
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const dateFrom = searchParams.get('date_from') || ''
  const dateTo = searchParams.get('date_to') || ''
  const prevFrom = searchParams.get('prev_date_from') || ''
  const prevTo = searchParams.get('prev_date_to') || ''

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: 'date_from and date_to required' }, { status: 400 })
  }

  try {
    const [current, previous] = await Promise.all([
      fetchStats(dateFrom, dateTo),
      prevFrom && prevTo ? fetchStats(prevFrom, prevTo) : Promise.resolve(null),
    ])

    return NextResponse.json({ current, previous })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
