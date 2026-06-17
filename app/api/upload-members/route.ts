import { NextRequest, NextResponse } from 'next/server'

function parseCSV(text: string): { name: string; matric: string }[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const members: { name: string; matric: string }[] = []
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))
    const name = parts[0] || ''
    const matric = parts[1] || ''
    if (name) members.push({ name, matric })
  }
  return members
}

function parseText(text: string): { name: string; matric: string }[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const members: { name: string; matric: string }[] = []
  for (const line of lines) {
    const parts = line.split(/[,|\t]+/).map(p => p.trim())
    const name = parts[0] || ''
    const matric = parts[1] || ''
    if (name) members.push({ name, matric })
  }
  return members
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.toLowerCase()
    let members: { name: string; matric: string }[] = []

    if (fileName.endsWith('.csv')) {
      const text = buffer.toString('utf-8')
      members = parseCSV(text)
    } else if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      members = parseText(data.text)
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload a CSV or PDF file.' }, { status: 400 })
    }

    if (members.length === 0) {
      return NextResponse.json({ error: 'No members found in the file. Make sure each line has Name, MatricNumber.' }, { status: 400 })
    }

    return NextResponse.json({ members, count: members.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 })
  }
}
