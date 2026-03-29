// Next.js Instrumentation Hook
// This file runs ONCE when the server starts (both dev and production).
// It registers a node-cron job that triggers the daily UPSC news scraper.
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only run scheduler on the Node.js server (not in the Edge runtime or browser)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = (await import('node-cron')).default

    // ── Daily Scrape at 6:00 AM IST = 00:30 UTC ──────────────────────────
    // Cron syntax: minute hour day month weekday
    cron.schedule('30 0 * * *', async () => {
      console.log(`\n[UPSCGPT Cron] ⏰ Daily scrape triggered at ${new Date().toISOString()} (6:00 AM IST)`)

      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const cronSecret = process.env.CRON_SECRET || ''

        const res = await fetch(`${baseUrl}/api/cron/scrape`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cronSecret}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.ok) {
          const result = await res.json()
          console.log(`[UPSCGPT Cron] ✅ Success — Fetched: ${result.stats?.totalFetched ?? 0}, Enriched: ${result.stats?.totalEnriched ?? 0}, New Nodes: ${result.stats?.totalCreated ?? 0} | Duration: ${result.durationSeconds}s`)
        } else {
          const err = await res.text()
          console.error(`[UPSCGPT Cron] ❌ Scrape endpoint returned ${res.status}:`, err)
        }
      } catch (error) {
        console.error('[UPSCGPT Cron] ❌ Failed to trigger daily scrape:', error.message)
      }
    }, {
      timezone: 'Asia/Kolkata'  // Runs at exactly 6:00 AM in the IST timezone
    })

    console.log('[UPSCGPT Cron] 📅 Daily news scraper scheduled at 06:00 AM IST (Asia/Kolkata)')
  }
}
