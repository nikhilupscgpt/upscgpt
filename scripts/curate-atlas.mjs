#!/usr/bin/env node

/**
 * UPSC Mapping — Logical Curation Engine CLI
 *
 * Usage:
 *   node scripts/curate-atlas.mjs --status     # View current curation status & cluster count
 *   node scripts/curate-atlas.mjs --merge      # Step through candidate clusters to merge/prune
 *   node scripts/curate-atlas.mjs --weekly     # Run weekly clearing routine for recent entries
 *   node scripts/curate-atlas.mjs --weekly 14  # Weekly clearing for past 14 days
 */

import readline from 'readline';
import { prisma } from '../src/lib/prisma.js';
import {
  findCandidateClusters,
  mergePins,
  getCurationStatus,
  getWeeklyBatch,
  updatePinTiers,
} from '../src/lib/atlas-curation-engine.js';

function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return {
    ask: (query) => new Promise((resolve) => rl.question(query, resolve)),
    close: () => rl.close(),
  };
}

async function runStatus() {
  console.log('\n======================================================');
  console.log('       UPSC ATLAS MAPPING — CURATION DASHBOARD         ');
  console.log('======================================================\n');

  const status = await getCurationStatus();

  console.log(`Total Places in Database:     ${status.total}`);
  console.log(`⭐ Master Prelims Core:        ${status.masterCount} (High-yield permanent revision pins)`);
  console.log(`📅 Daily Logs (Active):       ${status.dailyCount}`);
  console.log(`📦 Merged / Archived:         ${status.archivedCount} (Pruned from main map)`);
  console.log(`⏳ Pending Human Review:       ${status.uncuratedCount}`);
  console.log(`🔗 Candidate Clusters Found:   ${status.candidateClustersCount}\n`);

  if (status.candidateClustersCount > 0) {
    console.log('--- Top Candidate Clusters for Merging ---');
    status.candidateClusters.slice(0, 5).forEach((c, idx) => {
      console.log(
        `\n[Cluster ${idx + 1}] Primary: "${c.primaryPin.place}" (${c.primaryPin.date})`
      );
      c.members.slice(1).forEach((m) => {
        console.log(`  + Candidate: "${m.place}" (${m.date}) [${m.matchReason}]`);
      });
    });
    console.log('\nRun "node scripts/curate-atlas.mjs --merge" to step through and merge these.');
  } else {
    console.log('No overlapping clusters found. All active pins are spatially and contextually distinct.');
  }

  console.log('\n======================================================\n');
}

async function runMergeQueue() {
  const prompter = createPrompter();

  console.log('\n======================================================');
  console.log('       UPSC ATLAS — INTERACTIVE MERGE QUEUE           ');
  console.log('======================================================\n');

  const clusters = await findCandidateClusters();

  if (clusters.length === 0) {
    console.log('No candidate clusters found to merge! Everything is well-separated.\n');
    prompter.close();
    return;
  }

  console.log(`Found ${clusters.length} candidate cluster(s) needing editorial review.\n`);

  let mergedTotal = 0;

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    const primary = cluster.primaryPin;
    const children = cluster.members.slice(1);

    console.log(`------------------------------------------------------`);
    console.log(`CLUSTER [${i + 1} of ${clusters.length}]`);
    console.log(`------------------------------------------------------`);
    console.log(`[1] PRIMARY: "${primary.place}" (Date: ${primary.date})`);
    console.log(`    Location: ${primary.locatedIn?.placeLine || 'N/A'}`);
    const primHook = primary.newsTriggers?.[0]?.newsHook || 'No hook';
    console.log(`    News:     ${primHook.slice(0, 100)}...`);

    children.forEach((c, cIdx) => {
      console.log(`\n[${cIdx + 2}] CHILD:   "${c.place}" (Date: ${c.date})`);
      console.log(`    Reason:   ${c.matchReason}`);
      console.log(`    Location: ${c.locatedIn?.placeLine || 'N/A'}`);
      const childHook = c.newsTriggers?.[0]?.newsHook || 'No hook';
      console.log(`    News:     ${childHook.slice(0, 100)}...`);
    });

    console.log('\nAction:');
    console.log('  [M] Merge children into Primary anchor (elevates Primary to Master, archives children)');
    console.log('  [K] Keep both separate (marks both as reviewed/curated)');
    console.log('  [D] Drop/Archive child pins only (Primary stays active)');
    console.log('  [S] Skip for now');
    console.log('  [Q] Quit review');

    const choice = (await prompter.ask('\nEnter choice [M/K/D/S/Q]: ')).trim().toUpperCase();

    if (choice === 'Q') {
      console.log('\nExiting merge queue. Progress saved.');
      break;
    } else if (choice === 'M') {
      const customTitle = (
        await prompter.ask(
          `Enter Master Title (Press Enter to keep "${primary.place}"): `
        )
      ).trim();

      const finalTitle = customTitle || primary.place;

      await mergePins({
        parentId: primary.id,
        childIds: children.map((c) => c.id),
        newPlaceTitle: finalTitle,
        mergeNotes: `Manually approved merge of ${children.length} pins into ${finalTitle}`,
      });

      console.log(`\n✔ Merged ${children.length} pin(s) into Master Anchor "${finalTitle}".`);
      mergedTotal++;
    } else if (choice === 'K') {
      // Mark all as curated
      await prisma.placeInNews.updateMany({
        where: { id: { in: cluster.members.map((m) => m.id) } },
        data: { isCurated: true, curatedAt: new Date() },
      });
      console.log('\n✔ Marked all pins in this cluster as separate and reviewed.');
    } else if (choice === 'D') {
      await updatePinTiers(
        children.map((c) => c.id),
        'archived',
        true
      );
      await prisma.placeInNews.update({
        where: { id: primary.id },
        data: { isCurated: true, curatedAt: new Date() },
      });
      console.log('\n✔ Archived child pin(s); Primary pin kept active.');
    } else {
      console.log('\nSkipped.');
    }
    console.log('');
  }

  prompter.close();
  console.log(`\nMerge queue finished! Merged ${mergedTotal} cluster(s).\n`);
}

async function runWeeklyClearing(filterArg = 7) {
  const prompter = createPrompter();

  let options = {};
  let title = `WEEKLY CLEARING ROUTINE (PAST ${filterArg} DAYS)`;
  if (filterArg === 'uncurated' || filterArg === 'backlog') {
    options = { uncuratedOnly: true };
    title = 'HISTORICAL BACKLOG CLEARING (ALL UNCURATED ENTRIES)';
  } else if (filterArg === 'all' || filterArg === 'allTime') {
    options = { allTime: true };
    title = 'ALL-TIME DATABASE CLEARING';
  } else {
    const num = Number(filterArg) || 7;
    options = { daysBack: num };
    title = `CLEARING ROUTINE (PAST ${num} DAYS)`;
  }

  console.log('\n======================================================');
  console.log(`   ${title}   `);
  console.log('======================================================\n');

  const batch = await getWeeklyBatch(options);

  if (batch.count === 0) {
    console.log(`No active entries found for this filter.\n`);
    prompter.close();
    return;
  }

  console.log(`Found ${batch.count} entries to review:\n`);

  batch.pins.forEach((p, idx) => {
    const hook = p.newsTriggers?.[0]?.newsHook || 'N/A';
    const tierIcon = p.tier === 'master' ? '⭐ [MASTER]' : p.tier === 'daily' ? '📅 [DAILY]' : '[ARCHIVED]';
    console.log(
      `[${idx + 1}] ${p.place} (${p.date}) ${tierIcon}\n    Hook: ${hook.slice(0, 95)}...`
    );
  });

  console.log('\n------------------------------------------------------');
  console.log('STAGE 1: Elevate to "Master Prelims 200"');
  console.log('Which items have high-yield testability to keep permanently on revision map?');
  const masterInput = (
    await prompter.ask(
      'Enter comma-separated numbers (e.g. 1, 3) or press Enter to skip: '
    )
  ).trim();

  if (masterInput) {
    const indices = masterInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10) - 1)
      .filter((i) => !isNaN(i) && i >= 0 && i < batch.pins.length);

    const masterIds = indices.map((i) => batch.pins[i].id);
    if (masterIds.length > 0) {
      await updatePinTiers(masterIds, 'master', true);
      console.log(`✔ Elevated ${masterIds.length} item(s) to Master Prelims Core (⭐).`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log('STAGE 2: Archive / Prune Low-Yield Items');
  console.log('Which items were minor one-off events that should be hidden from main revision?');
  const archiveInput = (
    await prompter.ask(
      'Enter comma-separated numbers to ARCHIVE (e.g. 4, 7) or press Enter to skip: '
    )
  ).trim();

  if (archiveInput) {
    const indices = archiveInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10) - 1)
      .filter((i) => !isNaN(i) && i >= 0 && i < batch.pins.length);

    const archiveIds = indices.map((i) => batch.pins[i].id);
    if (archiveIds.length > 0) {
      await updatePinTiers(archiveIds, 'archived', true);
      console.log(`✔ Archived ${archiveIds.length} item(s) from main map.`);
    }
  }

  // Mark remainder as curated daily logs
  const allTouched = new Set([
    ...(masterInput ? masterInput.split(',').map((s) => parseInt(s.trim(), 10) - 1) : []),
    ...(archiveInput ? archiveInput.split(',').map((s) => parseInt(s.trim(), 10) - 1) : []),
  ]);

  const untouchedIds = batch.pins
    .map((p, idx) => (allTouched.has(idx) ? null : p.id))
    .filter(Boolean);

  if (untouchedIds.length > 0) {
    await prisma.placeInNews.updateMany({
      where: { id: { in: untouchedIds } },
      data: { isCurated: true, curatedAt: new Date() },
    });
    console.log(`✔ Retained remaining ${untouchedIds.length} item(s) in Daily logs.`);
  }

  prompter.close();
  console.log('\nWeekly clearing complete! Database is pruned and updated.\n');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--status';

  try {
    if (mode === '--status' || mode === '-s') {
      await runStatus();
    } else if (mode === '--merge' || mode === '-m') {
      await runMergeQueue();
    } else if (mode === '--weekly' || mode === '-w') {
      const days = args[1] || 7;
      await runWeeklyClearing(days);
    } else if (mode === '--backlog' || mode === '--uncurated' || mode === '-b') {
      await runWeeklyClearing('uncurated');
    } else if (mode === '--all' || mode === '-a') {
      await runWeeklyClearing('all');
    } else {
      console.log(`
UPSC Atlas Curation Engine CLI:
  node scripts/curate-atlas.mjs --status      # Show curation stats & candidate clusters
  node scripts/curate-atlas.mjs --merge       # Step through candidate clusters to merge/prune
  node scripts/curate-atlas.mjs --backlog     # Clear all historical uncurated backlog entries
  node scripts/curate-atlas.mjs --weekly 7    # Weekly clearing routine for past 7 days
  node scripts/curate-atlas.mjs --weekly 90   # Clearing routine for past 90 days
  node scripts/curate-atlas.mjs --all         # Curate all-time database
      `);
    }
  } catch (err) {
    console.error('Curation Engine Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
