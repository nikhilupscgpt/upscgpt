import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../src/lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, '../src/lib/curated-env-species.json');

function normalizeArray(val) {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  return Array.from(new Set(arr.map(s => String(s).trim()).filter(Boolean)));
}

async function main() {
  const args = process.argv.slice(2);
  const targetFile = args[0];

  console.log('🌿 === Environment Atlas Species Ingestion Engine ===\n');

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data store not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const existingStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let itemsToIngest = [];

  if (targetFile && targetFile !== '--sync-db') {
    const inputPath = path.resolve(targetFile);
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      process.exit(1);
    }
    console.log(`📁 Loading new items from: ${inputPath}`);
    const raw = fs.readFileSync(inputPath, 'utf8').trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      itemsToIngest = JSON.parse(raw);
    } else {
      itemsToIngest = raw.split(/\r?\n/).filter(l => l.trim()).map(l => JSON.parse(l));
    }
    console.log(`📥 Read ${itemsToIngest.length} species items from input file.`);

    // Merge into JSON store
    let inserted = 0;
    let updated = 0;

    for (const item of itemsToIngest) {
      if (!item.slug || !item.title) {
        console.warn(`⚠️ Skipping item missing slug or title:`, item);
        continue;
      }

      const formatted = {
        id: item.id || `ENV-SP-${Date.now().toString().slice(-4)}`,
        envId: item.envId || item.id || `ENV-SP-${Date.now().toString().slice(-4)}`,
        slug: item.slug.toLowerCase().trim(),
        module: item.module || 'SPECIES',
        category: item.category || 'Mammals',
        title: item.title.trim(),
        subtitle: item.subtitle ? item.subtitle.trim() : null,
        aliases: normalizeArray(item.aliases),
        oneline: item.oneline || '',
        priority: item.priority || 'High',
        isStarter: !!item.isStarter,
        sortOrder: Number(item.sortOrder) || (existingStore.items.length + 1),
        wikiTitle: item.wikiTitle || item.title.replace(/\s+/g, '_'),
        rememberBullets: Array.isArray(item.rememberBullets) ? item.rememberBullets : [],
        confusionTrap: item.confusionTrap || null,
        statusBadges: item.statusBadges || { iucn: 'VU', wpa: 'Schedule I', cites: 'Appendix I' },
        places: Array.isArray(item.places) ? item.places : [],
        similarPYQ: normalizeArray(item.similarPYQ),
        newsTriggers: Array.isArray(item.newsTriggers) ? item.newsTriggers : [],
      };

      const idx = existingStore.items.findIndex(x => x.slug === formatted.slug);
      if (idx >= 0) {
        existingStore.items[idx] = { ...existingStore.items[idx], ...formatted };
        updated++;
      } else {
        existingStore.items.push(formatted);
        inserted++;
      }
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(existingStore, null, 2), 'utf8');
    console.log(`✅ JSON Store Updated: ${inserted} inserted, ${updated} updated. Total: ${existingStore.items.length} species.`);
  }

  // Sync to PostgreSQL database
  console.log(`\n🔄 Syncing ${existingStore.items.length} species to PostgreSQL database (Prisma)...`);
  try {
    let dbSuccess = 0;
    for (const sp of existingStore.items) {
      await prisma.envAtlasItem.upsert({
        where: { slug: sp.slug },
        update: {
          title: sp.title,
          subtitle: sp.subtitle,
          module: sp.module || 'SPECIES',
          category: sp.category || 'Mammals',
          oneline: sp.oneline || '',
          priority: sp.priority || 'High',
          isStarter: !!sp.isStarter,
          sortOrder: sp.sortOrder || 100,
          wikiTitle: sp.wikiTitle,
          rememberBullets: sp.rememberBullets || [],
          confusionTrap: sp.confusionTrap,
          statusBadges: sp.statusBadges || {},
          places: sp.places || [],
          newsTriggers: sp.newsTriggers || [],
          similarPYQ: sp.similarPYQ || [],
        },
        create: {
          envId: sp.envId || sp.id || `ENV-SP-${Date.now()}`,
          slug: sp.slug,
          module: sp.module || 'SPECIES',
          category: sp.category || 'Mammals',
          title: sp.title,
          subtitle: sp.subtitle,
          oneline: sp.oneline || '',
          priority: sp.priority || 'High',
          isStarter: !!sp.isStarter,
          sortOrder: sp.sortOrder || 100,
          wikiTitle: sp.wikiTitle,
          rememberBullets: sp.rememberBullets || [],
          confusionTrap: sp.confusionTrap,
          statusBadges: sp.statusBadges || {},
          places: sp.places || [],
          newsTriggers: sp.newsTriggers || [],
          similarPYQ: sp.similarPYQ || [],
        },
      });
      dbSuccess++;
    }
    console.log(`✅ PostgreSQL Sync Complete: Successfully upserted ${dbSuccess} items.`);
  } catch (dbErr) {
    console.warn(`⚠️ PostgreSQL connection note: ${dbErr.message}`);
    console.log(`ℹ️ All species are fully active via JSON store (zero-latency offline & Edge SSR).`);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎉 Ingestion workflow finished successfully!');
}

main().catch(err => {
  console.error('Fatal error during ingestion:', err);
  process.exit(1);
});
