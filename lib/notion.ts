const NOTION_TOKEN = process.env.NOTION_TOKEN!
const TASKS_DB_ID = '5f6242210d0c468f91c5a8cab0e316da'

export type NotionTask = {
  id: string
  task_name: string
  status: string
  category: string | null
  due_date: string | null
  notes: string | null
  assigned_to: string | null
}

export async function getTasksForClient(notionPageId: string): Promise<NotionTask[]> {
  if (!NOTION_TOKEN) return []

  const res = await fetch(`https://api.notion.com/v1/databases/${TASKS_DB_ID}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: 'Client',
            relation: { contains: notionPageId },
          },
          {
            property: 'Private',
            checkbox: { equals: false },
          },
        ],
      },
      sorts: [{ property: 'Status', direction: 'ascending' }],
    }),
    next: { revalidate: 60 },
  } as RequestInit)

  if (!res.ok) return []

  const data = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results.map((page: any) => ({
    id: page.id,
    task_name: page.properties['Task Name']?.title?.[0]?.plain_text ?? '(untitled)',
    status: page.properties['Status']?.select?.name ?? 'To Do',
    category: page.properties['Category']?.select?.name ?? null,
    due_date: page.properties['Due Date']?.date?.start ?? null,
    notes: page.properties['Notes']?.rich_text?.[0]?.plain_text ?? null,
    assigned_to: page.properties['Assigned To']?.select?.name ?? null,
  }))
}
