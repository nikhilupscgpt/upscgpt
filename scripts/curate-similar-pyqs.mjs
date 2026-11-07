#!/usr/bin/env node

/**
 * UPSC Similar PYQ Engine — Interactive CLI Curation Tool
 *
 * Usage:
 *   node scripts/curate-similar-pyqs.mjs --year 2024
 *   node scripts/curate-similar-pyqs.mjs --subject "Geography"
 *   node scripts/curate-similar-pyqs.mjs --unverified
 *   node scripts/curate-similar-pyqs.mjs --question "UPSC-2024-21"
 */

import readline from 'readline';
import { prisma } from '../src/lib/prisma.js';
import {
  findSimilarPyqCandidates,
  attachSimilarPyq,
  detachSimilarPyq,
  searchQuestionsForFamily,
} from '../src/lib/pyq-similar-engine.js';

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

async function main() {
  const args = process.argv.slice(2);
  let filterYear = null;
  let filterSubject = null;
  let filterQuestion = null;
  let unverifiedOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--year' || args[i] === '-y') filterYear = Number(args[i + 1]);
    if (args[i] === '--subject' || args[i] === '-s') filterSubject = args[i + 1];
    if (args[i] === '--question' || args[i] === '-q') filterQuestion = args[i + 1];
    if (args[i] === '--unverified' || args[i] === '-u') unverifiedOnly = true;
  }

  const where = {};
  if (filterYear) where.examYear = filterYear;
  if (filterSubject) where.subject = { name: { contains: filterSubject, mode: 'insensitive' } };
  if (filterQuestion) where.OR = [{ id: filterQuestion }, { dedupHash: filterQuestion }];

  const questions = await prisma.question.findMany({
    where,
    select: {
      id: true,
      dedupHash: true,
      examName: true,
      examYear: true,
      stem: true,
      analysis: true,
      subject: { select: { name: true } },
      topic: { select: { name: true } },
    },
    orderBy: [{ examYear: 'desc' }, { id: 'asc' }],
    take: 100,
  });

  const prompter = createPrompter();

  console.log('\n======================================================');
  console.log('       UPSC SIMILAR PYQ CURATION ENGINE CLI           ');
  console.log('======================================================\n');
  console.log(`Loaded ${questions.length} questions for review.\n`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const currentSim = q.analysis?.similarPyq;
    const isVerified = !!currentSim?.isVerified;

    if (unverifiedOnly && isVerified) continue;

    console.log('------------------------------------------------------');
    console.log(`[${i + 1} of ${questions.length}] QUESTION: ${q.dedupHash} (${q.examName} ${q.examYear})`);
    console.log(`Subject: ${q.subject?.name || 'N/A'} · Topic: ${q.topic?.name || 'N/A'}`);
    console.log(`STEM: ${q.stem.slice(0, 150)}...\n`);

    if (currentSim) {
      const verifiedTag = isVerified ? '✔ [VERIFIED]' : '⚠️ [UNVERIFIED / AI-ATTACHED]';
      console.log(`Current Attached Similar PYQ: ${verifiedTag}`);
      console.log(`  Target: ${currentSim.targetId || currentSim.questionId} (${currentSim.examName} ${currentSim.examYear})`);
      console.log(`  Stem:   ${(currentSim.stem || '').slice(0, 110)}...`);
      if (currentSim.keyTakeaway) {
        console.log(`  Note:   ${currentSim.keyTakeaway}`);
      }
    } else {
      console.log('Current Attached Similar PYQ: None');
    }
    console.log('');

    // Fetch engine candidate suggestions
    const suggestionResult = await findSimilarPyqCandidates(q.id, { limit: 4 });
    const candidates = suggestionResult.candidates;

    if (candidates.length > 0) {
      console.log('Suggested Family Predecessors/Successors (Rule-Based Engine):');
      candidates.forEach((c, cIdx) => {
        console.log(`  [${cIdx + 1}] ${c.dedupHash} (${c.examYear}) - ${c.matchReason}`);
        console.log(`      ${c.stem.slice(0, 110)}...`);
      });
    } else {
      console.log('No strong automatic candidates found.');
    }

    console.log('\nActions:');
    console.log('  [1-4] Attach candidate as Similar PYQ');
    console.log('  [R]   Remove / Detach current similar PYQ');
    console.log('  [K]   Keep current attachment and mark Verified');
    console.log('  [S]   Search database by keyword to attach custom PYQ');
    console.log('  [N]   Next question (Skip)');
    console.log('  [Q]   Quit');

    const action = (await prompter.ask('\nEnter choice: ')).trim().toUpperCase();

    if (action === 'Q') {
      console.log('\nExiting CLI curation. Progress saved.');
      break;
    } else if (action === 'R') {
      await detachSimilarPyq({ questionId: q.id });
      console.log(`✔ Detached similar PYQ from ${q.dedupHash}.`);
    } else if (action === 'K') {
      if (currentSim) {
        await attachSimilarPyq({
          questionId: q.id,
          targetId: currentSim.targetId || currentSim.questionId,
          keyTakeaway: currentSim.keyTakeaway,
          isVerified: true,
        });
        console.log(`✔ Marked current attachment as VERIFIED.`);
      } else {
        console.log('No attachment to verify.');
      }
    } else if (action === '1' || action === '2' || action === '3' || action === '4') {
      const idx = parseInt(action, 10) - 1;
      const chosen = candidates[idx];
      if (chosen) {
        const note = (
          await prompter.ask('Enter pattern takeaway note (or press Enter for default): ')
        ).trim();

        await attachSimilarPyq({
          questionId: q.id,
          targetId: chosen.id,
          keyTakeaway: note || `Pattern predecessor: ${chosen.matchReason}.`,
          isVerified: true,
        });
        console.log(`✔ Attached ${chosen.dedupHash} to ${q.dedupHash}!`);
      }
    } else if (action === 'S') {
      const searchKeyword = (await prompter.ask('Enter search keyword or dedupHash: ')).trim();
      if (searchKeyword) {
        const searchResults = await searchQuestionsForFamily({
          query: searchKeyword,
          excludeId: q.id,
          limit: 5,
        });
        if (searchResults.length > 0) {
          console.log('\nSearch results:');
          searchResults.forEach((r, rIdx) => {
            console.log(`  [${rIdx + 1}] ${r.dedupHash} (${r.examYear}): ${r.stem.slice(0, 80)}...`);
          });
          const pick = (await prompter.ask('Pick number to attach (or Enter to cancel): ')).trim();
          const pickIdx = parseInt(pick, 10) - 1;
          if (!isNaN(pickIdx) && searchResults[pickIdx]) {
            await attachSimilarPyq({
              questionId: q.id,
              targetId: searchResults[pickIdx].id,
              isVerified: true,
            });
            console.log(`✔ Attached ${searchResults[pickIdx].dedupHash}!`);
          }
        } else {
          console.log('No results found for that keyword.');
        }
      }
    }

    console.log('');
  }

  prompter.close();
  await prisma.$disconnect();
}

main().catch(console.error);
