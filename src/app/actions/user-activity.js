"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Server Actions for User Progress & Activity
 */

export async function toggleIssueFollow(issueId) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Authentication required");

  const userId = session.user.id;

  const existing = await prisma.issueFollow.findUnique({
    where: {
      userId_issueId: { userId, issueId }
    }
  });

  if (existing) {
    await prisma.issueFollow.delete({
      where: { id: existing.id }
    });
    // LOG ACTIVITY
    await prisma.actionLog.create({
      data: {
        userId,
        action: 'ISSUE_UNFOLLOWED',
        entityType: 'Issue',
        entityId: issueId,
        message: 'Stopped following a strategic briefing'
      }
    });
  } else {
    await prisma.issueFollow.create({
      data: { userId, issueId }
    });
    // LOG ACTIVITY
    await prisma.actionLog.create({
      data: {
        userId,
        action: 'ISSUE_FOLLOWED',
        entityType: 'Issue',
        entityId: issueId,
        message: 'Started following a strategic briefing'
      }
    });
  }

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/profile");
  return { success: true, followed: !existing };
}

export async function updateIssueProgress(issueId, status) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[Activity Action] No session ID found");
      throw new Error("Authentication required");
    }

    const userId = session.user.id;
    console.log(`[Activity Action] Updating progress for user ${userId}, issue ${issueId} to ${status}`);

    await prisma.issueProgress.upsert({
      where: { userId_issueId: { userId, issueId } },
      update: { status, lastStudiedAt: new Date() },
      create: { userId, issueId, status, lastStudiedAt: new Date() }
    });

    // LOG ACTIVITY
    const log = await prisma.actionLog.create({
      data: {
        userId,
        action: 'PROGRESS_UPDATED',
        entityType: 'Issue',
        entityId: issueId,
        message: `Marked node as ${status.replace('_', ' ')}`
      }
    });
    console.log(`[Activity Action] Log created: ${log.id}`);

    revalidatePath(`/issues/${issueId}`);
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[Activity Action Error]:", err);
    return { success: false, error: err.message };
  }
}

export async function updateMasteryStep(issueId, stepKey, value) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Authentication required");

    const userId = session.user.id;
    
    // Valid step keys: readSummary, viewedNews, solvedPYQs, solvedMCQs
    const progress = await prisma.issueProgress.upsert({
      where: { userId_issueId: { userId, issueId } },
      update: { [stepKey]: value, lastStudiedAt: new Date() },
      create: { userId, issueId, [stepKey]: value, status: 'READING', lastStudiedAt: new Date() }
    });

    // AUTO-MASTER LOGIC: If all steps are true, set status to MASTERED
    const allDone = progress.readSummary && progress.viewedNews && progress.solvedPYQs && progress.solvedMCQs;
    if (allDone && progress.status !== 'MASTERED') {
      await prisma.issueProgress.update({
        where: { id: progress.id },
        data: { status: 'MASTERED' }
      });
    }

    revalidatePath(`/issues/${issueId}`);
    return { success: true, progress };
  } catch (err) {
    console.error("[Mastery Action Error]:", err);
    return { success: false, error: err.message };
  }
}

export async function saveUserNote(issueId, content, isAiGenerated = false) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Authentication required");

    const userId = session.user.id;

    const note = await prisma.userNote.create({
      data: { userId, issueId, content, isAiGenerated }
    });

    // LOG ACTIVITY
    await prisma.actionLog.create({
      data: {
        userId,
        action: 'NOTE_ADDED',
        entityType: 'Issue',
        entityId: issueId,
        message: 'Saved a strategic insight note'
      }
    });

    revalidatePath(`/issues/${issueId}`);
    revalidatePath("/profile");
    return { success: true, note };
  } catch (err) {
    console.error("[Note Action Error]:", err);
    return { success: false, error: err.message };
  }
}

export async function toggleBookmark(itemId, itemType, note = null) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Authentication required");

  const userId = session.user.id;

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_itemType_itemId: { userId, itemType, itemId }
    }
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.bookmark.create({
      data: { userId, itemType, itemId, note }
    });
    // LOG ACTIVITY
    await prisma.actionLog.create({
      data: {
        userId,
        action: 'ITEM_BOOKMARKED',
        entityType: itemType,
        entityId: itemId,
        message: `Bookmarked ${itemType.toLowerCase()}`
      }
    });
  }

  return { success: true, bookmarked: !existing };
}
