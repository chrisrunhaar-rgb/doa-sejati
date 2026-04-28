/**
 * Seeds ds_people_groups and ds_prayer_content from Joshua Project CSV.
 * Usage: node scripts/seed-prayer-content.mjs
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.
 *
 * Sources: C:\Users\user\Documents\Doa Sejati\Prayer database\UnreachedPeoplesByCountry.csv
 * Generates: 365 days of prayer content starting 2026-05-01
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Env ───────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

// ── CSV Parser ────────────────────────────────────────────────────────────
function parseRow(line) {
  const out = []; let cur = ''; let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else { cur += ch; }
  }
  out.push(cur);
  return out;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function extractIsland(cluster) {
  const c = (cluster || '').toLowerCase();
  if (c.includes('sumatra') || c.includes('sumatera')) return 'Sumatera';
  if (c.includes('java') || c.includes('jawa')) return 'Jawa';
  if (c.includes('kalimantan') || c.includes('borneo')) return 'Kalimantan';
  if (c.includes('sulawesi') || c.includes('celebes')) return 'Sulawesi';
  if (c.includes('papua') || c.includes('irian')) return 'Papua';
  if (c.includes('sunda') || c.includes('nusa') || c.includes('timor') || c.includes('lombok') || c.includes('flores')) return 'Nusa Tenggara';
  if (c.includes('maluku') || c.includes('molucca')) return 'Maluku';
  if (c.includes('bali')) return 'Bali';
  return 'Indonesia';
}

function bibleAccess(status) {
  const s = parseInt(status) || 0;
  return s >= 5 ? 'full' : s >= 2 ? 'partial' : 'none';
}

// Stable slug from JP PeopleID3 — simple, unique, no conflicts with manual seeds
function makeId(peopleId3) {
  return `jp-${peopleId3}`;
}

// ── Content templates ─────────────────────────────────────────────────────
// Rotated by group index to create variety across 234 groups

const SALVATION_ID = [
  (n) => `Berdoa agar Tuhan membuka hati orang-orang ${n} untuk mengenal Yesus — melalui mimpi, kesaksian, atau perjumpaan dengan orang percaya.`,
  (n) => `Berdoa agar ${n} dapat mendengar Injil dalam bahasa dan budaya yang mereka pahami, dan merespons dengan iman.`,
  (n) => `Berdoa agar Roh Kudus bekerja di antara suku ${n} — melunakkan hati yang keras dan membawa orang-orang kepada pertobatan.`,
  (n) => `Berdoa agar orang-orang ${n} yang mencari kebenaran menemukan Yesus sebagai jalan, kebenaran, dan hidup.`,
];
const SALVATION_EN = [
  (n) => `Pray that God opens hearts among the ${n} to know Jesus — through dreams, testimonies, or encounters with believers.`,
  (n) => `Pray that the ${n} would hear the Gospel in a way they understand, and respond in faith.`,
  (n) => `Pray for the Holy Spirit to move among the ${n} — softening hard hearts and bringing people to repentance.`,
  (n) => `Pray that ${n} people who are seeking truth would find Jesus as the way, the truth, and the life.`,
];

const ANIMIST_SALVATION_ID = [
  (n) => `Berdoa agar orang-orang ${n} dibebaskan dari rasa takut terhadap roh-roh dan menemukan Yesus sebagai Tuhan yang hidup dan berkuasa.`,
  (n) => `Berdoa agar Yesus menyatakan diri-Nya kepada suku ${n} sebagai pelindung sejati yang lebih berkuasa dari semua roh.`,
];
const ANIMIST_SALVATION_EN = [
  (n) => `Pray that the ${n} people would be freed from fear of spirits and discover Jesus as the living, all-powerful Lord.`,
  (n) => `Pray that Jesus reveals himself to the ${n} as the true protector, more powerful than all spirits.`,
];

const WORKERS_ID_LOW = [
  (n) => `Berdoa agar Tuhan mengutus pekerja-pekerja yang rela pergi dan tinggal bersama suku ${n} — mempelajari bahasa dan budaya mereka demi Injil.`,
  (n) => `Berdoa agar ada orang Indonesia yang dipanggil Tuhan untuk menjadi misionaris bagi suku ${n} yang belum pernah mendengar Injil.`,
];
const WORKERS_EN_LOW = [
  (n) => `Pray that God sends workers willing to go and live among the ${n} — learning their language and culture for the Gospel.`,
  (n) => `Pray for Indonesian believers to be called and sent as missionaries to the ${n} who have never heard the Gospel.`,
];
const WORKERS_ID_HIGH = [
  (n) => `Berdoa agar orang-orang percaya di antara suku ${n} dikuatkan dan berani bersaksi kepada keluarga dan komunitas mereka.`,
  (n) => `Berdoa agar gereja-gereja lokal di antara suku ${n} bertumbuh kuat dan mulai mengutus orang ke suku-suku lain yang belum terjangkau.`,
];
const WORKERS_EN_HIGH = [
  (n) => `Pray that believers among the ${n} would be strengthened and bold in witnessing to their families and communities.`,
  (n) => `Pray for local ${n} churches to grow strong and begin sending their own to other unreached groups.`,
];

const BIBLE_ID = {
  none: [
    (l, n) => `Berdoa agar ada tim yang memulai penerjemahan Alkitab dalam bahasa ${l} sehingga suku ${n} bisa mendengar Firman Tuhan dalam bahasa ibu mereka.`,
    (l, n) => `Berdoa agar Tuhan membangkitkan penerjemah-penerjemah yang berdedikasi untuk membawa Firman-Nya kepada suku ${n} dalam bahasa ${l}.`,
  ],
  partial: [
    (l, n) => `Berdoa agar penerjemahan Alkitab dalam bahasa ${l} segera diselesaikan sehingga suku ${n} dapat memiliki Firman Tuhan yang lengkap.`,
    (l, n) => `Berdoa agar proyek penerjemahan Alkitab bahasa ${l} didukung dengan sumber daya dan tenaga yang cukup.`,
  ],
  full: [
    (l, n) => `Berdoa agar Alkitab dalam bahasa ${l} tersebar luas dan suku ${n} semakin mengenal Firman Tuhan.`,
    (l, n) => `Berdoa agar orang-orang ${n} yang sudah percaya bertumbuh dalam iman melalui pembacaan Alkitab bahasa ${l} mereka.`,
  ],
};
const BIBLE_EN = {
  none: [
    (l, n) => `Pray for a team to begin translating the Bible into ${l} so the ${n} can hear God's Word in their heart language.`,
    (l, n) => `Pray that God raises up dedicated translators to bring His Word to the ${n} in the ${l} language.`,
  ],
  partial: [
    (l, n) => `Pray for the ${l} Bible translation to be completed so the ${n} can have the full Word of God.`,
    (l, n) => `Pray for adequate resources and workers to finish the ${l} Bible translation project.`,
  ],
  full: [
    (l, n) => `Pray for the ${l} Bible to spread widely among the ${n} and for growing knowledge of God's Word.`,
    (l, n) => `Pray that ${n} believers would grow in faith through reading the Bible in their own ${l} language.`,
  ],
};

const CONTEXT_ISLAM_ID = [
  (n, pop, island) => `Suku ${n} berjumlah sekitar ${pop} jiwa di ${island}. Mayoritas memeluk Islam secara turun-temurun. Injil belum pernah sampai secara signifikan di antara mereka.`,
  (n, pop, island) => `Di ${island}, suku ${n} hidup sebagai komunitas yang kuat secara budaya dengan populasi sekitar ${pop} jiwa. Islam adalah inti dari identitas dan kehidupan mereka, namun kasih Kristus belum banyak dikenal.`,
];
const CONTEXT_ISLAM_EN = [
  (n, pop, island) => `The ${n} people number approximately ${pop} in ${island}. The majority are Muslim by heritage. The Gospel has not yet reached them in significant measure.`,
  (n, pop, island) => `In ${island}, the ${n} form a strong cultural community of about ${pop} people. Islam is central to their identity and life, yet the love of Christ is largely unknown among them.`,
];
const CONTEXT_ANIMIST_ID = [
  (n, pop, island) => `Suku ${n} di ${island} berjumlah sekitar ${pop} jiwa. Kepercayaan animisme dan penghormatan leluhur masih menjadi inti kehidupan spiritual mereka. Banyak yang hidup dalam ketakutan terhadap roh-roh.`,
];
const CONTEXT_ANIMIST_EN = [
  (n, pop, island) => `The ${n} people in ${island} number around ${pop}. Animism and ancestral veneration remain central to their spiritual life. Many live under the fear of spirits.`,
];
const CONTEXT_DEFAULT_ID = [
  (n, pop, island) => `Suku ${n} adalah salah satu suku yang belum terjangkau di ${island} dengan populasi sekitar ${pop} jiwa. Mereka membutuhkan terang Injil Yesus Kristus.`,
];
const CONTEXT_DEFAULT_EN = [
  (n, pop, island) => `The ${n} people are one of ${island}'s unreached groups with a population of about ${pop}. They need the light of the Gospel of Jesus Christ.`,
];

const PROGRESS_ID = [
  () => `Skala kemajuan Injil mereka berada di angka terendah — hampir tidak ada orang Kristen yang diketahui di antara suku ini.`,
  () => `Hanya sebagian kecil yang telah merespons Injil. Komunitas iman yang ada masih sangat kecil dan membutuhkan dukungan.`,
  () => `Ada beberapa gereja yang mulai terbentuk, namun sebagian besar suku ini masih belum terjangkau oleh Injil.`,
];
const PROGRESS_EN = [
  () => `Their Gospel progress scale is at the lowest level — virtually no known Christians exist among this people group.`,
  () => `Only a small fraction has responded to the Gospel. The existing faith community is very small and needs support.`,
  () => `A few churches have begun to form, yet the majority of this group remains unreached by the Gospel.`,
];

function buildContent(group, idx) {
  const { nameId, nameEn, religion, jpScale, bibleAcc, lang, island, population } = group;
  const scale = parseInt(jpScale) || 1;
  const isIslam = /islam/i.test(religion);
  const isAnimist = /animis|ethnic|tribal/i.test(religion);
  const popId = parseInt(population).toLocaleString('id-ID');
  const popEn = parseInt(population).toLocaleString('en');
  const v = idx % 2; // variant index (0 or 1)

  // Context paragraph
  let ctxId, ctxEn;
  if (isIslam) {
    const pool = CONTEXT_ISLAM_ID;
    ctxId = pool[idx % pool.length](nameId, popId, island);
    ctxEn = CONTEXT_ISLAM_EN[idx % CONTEXT_ISLAM_EN.length](nameEn, popEn, island);
  } else if (isAnimist) {
    ctxId = CONTEXT_ANIMIST_ID[0](nameId, popId, island);
    ctxEn = CONTEXT_ANIMIST_EN[0](nameEn, popEn, island);
  } else {
    ctxId = CONTEXT_DEFAULT_ID[0](nameId, popId, island);
    ctxEn = CONTEXT_DEFAULT_EN[0](nameEn, popEn, island);
  }

  // Add progress context
  const progIdx = Math.min(scale - 1, PROGRESS_ID.length - 1);
  ctxId += ' ' + PROGRESS_ID[progIdx]();
  ctxEn += ' ' + PROGRESS_EN[progIdx]();

  // Prayer point 1: salvation
  const salPool_id = isAnimist ? ANIMIST_SALVATION_ID : SALVATION_ID;
  const salPool_en = isAnimist ? ANIMIST_SALVATION_EN : SALVATION_EN;
  const pt1_id = salPool_id[idx % salPool_id.length](nameId);
  const pt1_en = salPool_en[idx % salPool_en.length](nameEn);

  // Prayer point 2: workers
  const wPool_id = scale <= 2 ? WORKERS_ID_LOW : WORKERS_ID_HIGH;
  const wPool_en = scale <= 2 ? WORKERS_EN_LOW : WORKERS_EN_HIGH;
  const pt2_id = wPool_id[v](nameId);
  const pt2_en = wPool_en[v](nameEn);

  // Prayer point 3: scripture
  const bPool_id = BIBLE_ID[bibleAcc];
  const bPool_en = BIBLE_EN[bibleAcc];
  const pt3_id = bPool_id[v](lang, nameId);
  const pt3_en = bPool_en[v](lang, nameEn);

  return {
    prayer_text_id: ctxId,
    prayer_text_en: ctxEn,
    prayer_points_id: [pt1_id, pt2_id, pt3_id],
    prayer_points_en: [pt1_en, pt2_en, pt3_en],
    push_title_id: `Berdoa untuk Suku ${nameId}`,
    push_title_en: `Pray for the ${nameEn}`,
    push_body_id: `Hari ini, bergabunglah dalam doa untuk suku ${nameId} yang belum mengenal Yesus.`,
    push_body_en: `Today, join in prayer for the ${nameEn} people who do not yet know Jesus.`,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const CSV = 'C:/Users/user/Documents/Doa Sejati/Prayer database/UnreachedPeoplesByCountry.csv';
  const lines = readFileSync(CSV, 'utf8').split('\n');

  // Header is line index 2 (0-based)
  const headers = parseRow(lines[2]);
  const col = (name) => headers.indexOf(name);

  // Parse Indonesian groups
  const groups = [];
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('ID,')) continue;
    const row = parseRow(line);
    const g = {
      id: makeId(row[col('PeopleID3')]),
      nameId: row[col('PeopNameInCountry')],
      nameEn: row[col('PeopNameAcrossCountries')],
      population: parseInt(row[col('Population')]) || 0,
      jpScale: parseInt(row[col('JPScale')]) || 1,
      religion: row[col('PrimaryReligion')],
      lang: row[col('PrimaryLanguageName')],
      bibleAcc: bibleAccess(row[col('BibleStatus')]),
      cluster: row[col('PeopleCluster')],
      lat: parseFloat(row[col('Latitude')]) || null,
      lng: parseFloat(row[col('Longitude')]) || null,
      peopleId3: row[col('PeopleID3')],
    };
    g.island = extractIsland(g.cluster);
    groups.push(g);
  }
  console.log(`Parsed ${groups.length} Indonesian UPGs from CSV`);

  // 1. Upsert ds_people_groups
  console.log('\nUpserting ds_people_groups...');
  const pgRows = groups.map(g => ({
    id: g.id,
    name_id: g.nameId,
    name_en: g.nameEn,
    province: g.island,
    island: g.island,
    population: g.population,
    religion: g.religion,
    progress_scale: g.jpScale,
    bible_access: g.bibleAcc,
    photo_url: null,
    jp_profile_url: `https://joshuaproject.net/people_groups/${g.peopleId3}/ID`,
  }));

  for (let i = 0; i < pgRows.length; i += 50) {
    const { error } = await supabase.from('ds_people_groups').upsert(pgRows.slice(i, i + 50), { onConflict: 'id' });
    if (error) { console.error('Error upserting people groups:', error.message); process.exit(1); }
    process.stdout.write(`  ${Math.min(i + 50, pgRows.length)}/${pgRows.length}\r`);
  }
  console.log(`  ✓ ${pgRows.length} people groups upserted`);

  // 2. Generate 365 days of prayer content starting 2026-05-01
  const START_DATE = new Date('2026-05-01T00:00:00.000Z');
  const DAYS = 365;

  // Sort groups: largest first, so prominent populations land on earlier dates
  const sorted = [...groups].sort((a, b) => b.population - a.population);

  console.log('\nGenerating prayer content...');
  const contentRows = [];
  for (let day = 0; day < DAYS; day++) {
    const group = sorted[day % sorted.length];
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const content = buildContent(group, day);
    contentRows.push({ people_group_id: group.id, scheduled_date: dateStr, ...content });
  }
  console.log(`  ${contentRows.length} days generated (${contentRows[0].scheduled_date} → ${contentRows[contentRows.length - 1].scheduled_date})`);

  // 3. Insert prayer content in batches (skip dates that already have content)
  console.log('\nInserting ds_prayer_content...');
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < contentRows.length; i += 50) {
    const batch = contentRows.slice(i, i + 50);
    const { error } = await supabase
      .from('ds_prayer_content')
      .upsert(batch, { onConflict: 'scheduled_date', ignoreDuplicates: false });
    if (error) { console.error(`Batch ${i}-${i+50} error:`, error.message, error.details); process.exit(1); }
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${contentRows.length}\r`);
  }

  console.log(`\n  ✓ ${inserted} days inserted`);
  console.log('\n✓ Seeding complete!');
  console.log(`  ${pgRows.length} people groups in ds_people_groups`);
  console.log(`  ${inserted} days in ds_prayer_content`);
  console.log(`  Coverage: ${contentRows[0].scheduled_date} → ${contentRows[contentRows.length - 1].scheduled_date}`);
}

main().catch(e => { console.error('\nFatal error:', e.message || e); process.exit(1); });
