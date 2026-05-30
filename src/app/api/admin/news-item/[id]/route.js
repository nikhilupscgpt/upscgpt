import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * PATCH /api/admin/news-item/[id]
 * Updates an already approved/ingested article or editorial.
 * Body: { type: 'ARTICLE' | 'EDITORIAL', title, contentType, crux, seoTitle, seoDescription, seoKeywords }
 */
export async function PATCH(req, props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await props.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { type, title, contentType, crux, seoTitle, seoDescription, seoKeywords } = body;

    if (!type || (type !== 'ARTICLE' && type !== 'EDITORIAL')) {
      return NextResponse.json({ error: 'Invalid or missing type (ARTICLE or EDITORIAL)' }, { status: 400 });
    }

    const table = type === 'ARTICLE' ? prisma.article : prisma.editorial;

    // Fetch existing item
    const existingItem = await table.findUnique({
      where: { id },
      select: { structuredData: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }

    const currentStructuredData = existingItem.structuredData || {};

    const updatedStructuredData = {
      ...currentStructuredData,
      crux: crux !== undefined ? crux : currentStructuredData.crux,
      seoTitle: seoTitle !== undefined ? seoTitle : currentStructuredData.seoTitle,
      seoDescription: seoDescription !== undefined ? seoDescription : currentStructuredData.seoDescription,
      seoKeywords: seoKeywords !== undefined ? seoKeywords : currentStructuredData.seoKeywords
    };

    const updateData = {
      structuredData: updatedStructuredData
    };

    if (title) updateData.title = title;
    if (contentType && type === 'ARTICLE') updateData.contentType = contentType;

    const updated = await table.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('[News Item PATCH] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
