import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * PATCH /api/admin/architect/reorder
 * Handles bulk updates to orderIndex.
 */
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { updates } = await req.json(); // Array of { id, orderIndex }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be an array' }, { status: 400 });
    }

    // Use a transaction for atomic bulk updates
    const operations = updates.map(u => 
      prisma.issue.update({
        where: { id: u.id },
        data: { orderIndex: parseInt(u.orderIndex) || 0 }
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, count: updates.length });
  } catch (error) {
    console.error('[Architect Reorder API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
