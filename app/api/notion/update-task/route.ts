import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, status } = await req.json()
  if (!taskId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: client } = await supabase
    .from('clients')
    .select('notion_page_id, notion_assignee')
    .eq('user_id', user.id)
    .single()

  if (!client?.notion_page_id || !client?.notion_assignee) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Verify task belongs to this client and is assigned to them
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!pageRes.ok) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const page = await pageRes.json()

  const clientRelation: { id: string }[] = page.properties['Client']?.relation ?? []
  const normalizedClientPageId = client.notion_page_id.replace(/-/g, '')
  const belongsToClient = clientRelation.some(
    (r) => r.id.replace(/-/g, '') === normalizedClientPageId
  )

  const assignedTo: string | null = page.properties['Assigned To']?.select?.name ?? null
  const isAssignedToClient = assignedTo === client.notion_assignee

  if (!belongsToClient || !isAssignedToClient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateRes = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  })

  if (!updateRes.ok) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
