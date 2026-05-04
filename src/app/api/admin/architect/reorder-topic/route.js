import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * PATCH /api/admin/architect/reorder-topic
 * Re-indexes an entire domain to reflect a new topic sequence.
 */
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { domain, gsPaper, topicSequence } = await req.json();

    if (!domain || !gsPaper || !topicSequence || !Array.isArray(topicSequence)) {
      return NextResponse.json({ error: 'Missing topic sequence array' }, { status: 400 });
    }

    // 1. Fetch ALL nodes in this domain/GS
    const allNodes = await prisma.issue.findMany({
      where: { domain, gsPapers: { has: gsPaper } }
    });

    // 2. Map nodes to their topics
    const topicMap = {};
    allNodes.forEach(node => {
      if (!topicMap[node.topic]) topicMap[node.topic] = [];
      topicMap[node.topic].push(node);
    });

    // 3. Create a unified update list based on the new topicSequence
    const updates = [];
    let globalIndex = 10;

    topicSequence.forEach(topicName => {
      const nodesInTopic = topicMap[topicName] || [];
      // Sort nodes within topic by their current orderIndex to preserve internal order
      nodesInTopic.sort((a, b) => a.orderIndex - b.orderIndex);
      
      nodesInTopic.forEach(node => {
        updates.push(prisma.issue.update({
          where: { id: node.id },
          data: { orderIndex: globalIndex }
        }));
        globalIndex += 10;
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: `Domain sequence normalized for ${domain}` });
  } catch (error) {
    console.error('[Topic Reorder API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
