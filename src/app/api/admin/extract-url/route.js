import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { safeFetch, SafeFetchError } from "@/lib/safeFetch";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let res;
    try {
      res = await safeFetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
    } catch (err) {
      if (err instanceof SafeFetchError) {
        console.warn('[Extract API] Blocked/failed fetch:', err.code, err.message);
        return NextResponse.json({ error: 'URL could not be fetched (blocked or invalid destination)' }, { status: 400 });
      }
      throw err;
    }

    if (!res.ok) {
      console.error('[Extract API] Upstream status:', res.status, res.statusText);
      return NextResponse.json({ error: `Failed to fetch URL (HTTP ${res.status})` }, { status: 502 });
    }

    const html = await res.text();
    // Use the final URL (after validated redirects); JSDOM does not execute scripts or load resources by default.
    const dom = new JSDOM(html, { url: res.url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json({ error: 'Could not parse article content' }, { status: 422 });
    }

    // Extract source from hostname
    let source = '';
    try {
      source = new URL(url).hostname.replace('www.', '').split('.')[0].toUpperCase();
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: {
        title: article.title,
        content: article.textContent,
        source: source
      }
    });
  } catch (error) {
    console.error('[Extract API] Error:', error);
    return NextResponse.json({ error: 'Failed to extract URL content' }, { status: 500 });
  }
}
