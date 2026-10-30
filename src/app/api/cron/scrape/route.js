import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { message: 'Daily news scraper cron job has been removed.' },
    { status: 410 }
  )
}

