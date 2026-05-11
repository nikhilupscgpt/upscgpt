import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const nodes = await prisma.issue.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        gsPapers: true,
        domain: true,
        nodeType: true,
        parentIssueId: true,
      }
    });

    // Map to Force Graph format
    const graphData = {
      nodes: nodes.map(n => ({
        id: n.id,
        name: n.title,
        slug: n.slug,
        group: n.gsPapers?.[0] || "General",
        domain: n.domain,
        val: n.parentIssueId ? 1 : 3, // Root nodes are larger
      })),
      links: nodes
        .filter(n => n.parentIssueId)
        .map(n => ({
          source: n.parentIssueId,
          target: n.id
        }))
    };

    return NextResponse.json(graphData);
  } catch (error) {
    console.error("Graph Data Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 });
  }
}
