import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`);
    
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) throw new Error('Could not parse article content');

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
