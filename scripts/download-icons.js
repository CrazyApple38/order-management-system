#!/usr/bin/env node
/**
 * Icon Bulk Downloader with Kuroshiro romanization
 * - icooon-mono.com: SVG icons
 * - silhouette-illust.com: PNG icons via ZIP
 *
 * Usage:
 *   node scripts/download-icons.js         # both
 *   node scripts/download-icons.js im      # icooon-mono only
 *   node scripts/download-icons.js si      # silhouette-illust only
 */
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const Kuroshiro = require('kuroshiro').default || require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const BASE_DIR = path.join(__dirname, '..', 'docs', 'assets', 'icons');
const PROGRESS_FILE = path.join(__dirname, 'download-progress.json');
const INDEX_FILE = path.join(BASE_DIR, 'index.json');
const DELAY_MS = 200;
const MAX_RETRIES = 3;
const SI_CONCURRENCY = 5; // parallel SI downloads

let kuroshiro;

const IM_CAT = {
  person: 'person', business: 'business', health: 'health',
  fashion: 'fashion', food: 'food', event: 'event',
  animal: 'animal-plant', transport: 'transport', game: 'sports-game',
  art: 'art-music', building: 'building', stationery: 'stationery',
  sign: 'sign-mark', education: 'education', pc: 'pc-tech', other: 'other'
};
const SI_CAT = {
  person: 'person', business: 'business', coin: 'money',
  mark: 'sign-mark', it: 'pc-tech', electrical: 'electrical',
  eat: 'food', medical: 'health', beauty: 'fashion',
  life: 'life', music: 'art-music', sports: 'sports-game',
  game: 'game', outdoor: 'outdoor', building: 'building',
  vehicle: 'transport', machinery: 'machinery', plant: 'plant',
  season: 'event', animal: 'animal-plant', fish: 'fish',
  bug: 'bug', school: 'education', stationery: 'stationery',
  fukidashi: 'fukidashi', nenga: 'nenga', etc: 'other'
};
const ALL_FOLDERS = [...new Set([...Object.values(IM_CAT), ...Object.values(SI_CAT)])];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchR(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (r.ok) return r;
      if (r.status === 404) return null;
    } catch (e) { /* retry */ }
    await sleep(1000 * (i + 1));
  }
  return null;
}

async function fetchBuf(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        redirect: 'manual'
      });
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get('location');
        if (loc) return fetchBuf(loc.startsWith('http') ? loc : new URL(loc, url).href, retries - i);
      }
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch (e) { /* retry */ }
    await sleep(1000 * (i + 1));
  }
  return null;
}

function loadP() { try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); } catch { return {}; } }
function saveP(p) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p)); }

async function toSlug(title) {
  // Remove suffix noise
  let t = title
    .replace(/の?(アイコン素材|フリーアイコン|アイコン|白黒シルエットイラスト素材|白黒シルエットイラスト|シルエットイラスト素材|シルエットイラスト|イラスト素材|イラスト|シルエット)\s*\d*$/g, '')
    .trim();
  if (!t) t = title;

  try {
    let romaji = await kuroshiro.convert(t, { to: 'romaji', mode: 'spaced' });
    // Clean: keep only ascii, dashes
    romaji = romaji.toLowerCase()
      .replace(/ō/g, 'ou').replace(/ū/g, 'uu').replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ē/g, 'ee')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return romaji.substring(0, 60) || 'icon';
  } catch {
    return 'icon';
  }
}

// === ICOOON-MONO ===

function imExtract($, catSlug, folder) {
  const out = [];
  $('a[href*="icooon-mono.com/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/\/(\d{5})-/);
    if (m && !out.find(i => i.id === m[1])) {
      out.push({ id: m[1], catSlug, folder, title: $(el).text().trim(), pageUrl: href });
    }
  });
  return out;
}

function imPages($) {
  const m = ($('.page_info').text() || '').match(/of\s+(\d+)/);
  return m ? parseInt(m[1]) : 1;
}

async function crawlIM(p) {
  console.log('\n=== Crawling icooon-mono.com ===');
  const icons = p.imIcons || [];
  const ids = new Set(icons.map(i => i.id));
  const doneCats = new Set(icons.filter(i => i._d).map(i => i.catSlug));

  for (const [slug, folder] of Object.entries(IM_CAT)) {
    if (doneCats.has(slug)) { console.log(`  [skip] ${slug}`); continue; }
    const r = await fetchR(`https://icooon-mono.com/category/${slug}/`);
    if (!r) continue;
    const h = await r.text();
    const $ = cheerio.load(h);
    const tp = imPages($);
    for (const ic of imExtract($, slug, folder)) { if (!ids.has(ic.id)) { icons.push(ic); ids.add(ic.id); } }

    for (let pg = 2; pg <= tp; pg++) {
      await sleep(DELAY_MS);
      const r2 = await fetchR(`https://icooon-mono.com/category/${slug}/page/${pg}/`);
      if (!r2) break;
      const $ = cheerio.load(await r2.text());
      for (const ic of imExtract($, slug, folder)) { if (!ids.has(ic.id)) { icons.push(ic); ids.add(ic.id); } }
      process.stdout.write(`\r  ${slug}: ${pg}/${tp} (${icons.length})`);
    }
    icons.filter(i => i.catSlug === slug).forEach(i => i._d = true);
    p.imIcons = icons; saveP(p);
    console.log(`  ${slug}: ${tp}p done`);
  }
  console.log(`  Total: ${icons.length}`);
}

async function dlIM(p) {
  console.log('\n=== Downloading icooon-mono SVGs ===');
  const icons = p.imIcons || [];
  const done = p.imDone || {};
  let n = 0, err = 0;

  for (const ic of icons) {
    if (done[ic.id]) { n++; continue; }
    const r = await fetchR(`https://icooon-mono.com/i/icon_${ic.id}/icon_${ic.id}0.svg`);
    if (!r) { err++; await sleep(DELAY_MS); continue; }
    let svg = await r.text();
    svg = svg.replace(/<\?xml[^?]*\?>\s*/g, '').replace(/<!DOCTYPE[^>]*>\s*/g, '').replace(/<!--[\s\S]*?-->\s*/g, '');
    svg = svg.replace(/fill\s*:\s*#[0-9a-fA-F]{3,6}/g, 'fill:currentColor');
    svg = svg.replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="currentColor"');
    if (!svg.includes('currentColor')) svg = svg.replace(/<g/, '<g fill="currentColor"');

    const slug = await toSlug(ic.title);
    const fn = `im-${ic.id}-${slug}.svg`;
    fs.writeFileSync(path.join(BASE_DIR, ic.folder, fn), svg.trim());
    ic.file = `${ic.folder}/${fn}`;
    done[ic.id] = 1; n++;

    if (n % 100 === 0) {
      process.stdout.write(`\r  ${n}/${icons.length} (err:${err})`);
      p.imDone = done; saveP(p);
    }
    await sleep(DELAY_MS);
  }
  console.log(`\n  Done: ${n}/${icons.length} (err:${err})`);
  p.imDone = done; saveP(p);
}

// === SILHOUETTE-ILLUST ===

function siExtract($, catSlug, folder) {
  const out = [];
  $('a[href*="/illust/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/\/illust\/(\d+)/);
    if (!m || /\/cate\//.test(href)) return;
    if (out.find(i => i.id === m[1])) return;
    const img = $(el).find('img').first();
    const thumb = img.attr('src') || img.attr('data-src') || '';
    const title = (img.attr('alt') || '').trim();
    // Extract slug from thumb: .../slug_ID-WxH.ext
    let slug = '';
    // Greedy match: capture everything before -WxH.ext
    const sm = thumb.match(/\/([^/]+)-\d+x\d+\.\w+$/);
    if (sm) slug = sm[1].replace(/_\d+$/, '').replace(/_/g, '-');
    out.push({ id: m[1], catSlug, folder, title, slug, pageUrl: href.startsWith('http') ? href : `https://www.silhouette-illust.com${href}` });
  });
  return out;
}

function siPages($) {
  let mx = 1;
  $('a[href*="/page/"]').each((_, el) => {
    const m = ($(el).attr('href') || '').match(/\/page\/(\d+)/);
    if (m) mx = Math.max(mx, parseInt(m[1]));
  });
  return mx;
}

async function crawlSI(p) {
  console.log('\n=== Crawling silhouette-illust.com ===');
  const icons = p.siIcons || [];
  const ids = new Set(icons.map(i => i.id));
  const doneCats = new Set(icons.filter(i => i._d).map(i => i.catSlug));

  for (const [slug, folder] of Object.entries(SI_CAT)) {
    if (doneCats.has(slug)) { console.log(`  [skip] ${slug}`); continue; }
    const r = await fetchR(`https://www.silhouette-illust.com/illust/cate/${slug}`);
    if (!r) continue;
    const h = await r.text();
    const $ = cheerio.load(h);
    const tp = siPages($);
    for (const ic of siExtract($, slug, folder)) { if (!ids.has(ic.id)) { icons.push(ic); ids.add(ic.id); } }

    for (let pg = 2; pg <= tp; pg++) {
      await sleep(DELAY_MS);
      const r2 = await fetchR(`https://www.silhouette-illust.com/illust/cate/${slug}/page/${pg}`);
      if (!r2) break;
      const $ = cheerio.load(await r2.text());
      for (const ic of siExtract($, slug, folder)) { if (!ids.has(ic.id)) { icons.push(ic); ids.add(ic.id); } }
      process.stdout.write(`\r  ${slug}: ${pg}/${tp} (${icons.length})`);
    }
    icons.filter(i => i.catSlug === slug).forEach(i => i._d = true);
    p.siIcons = icons; saveP(p);
    console.log(`  ${slug}: ${tp}p done`);
  }
  console.log(`  Total: ${icons.length}`);
}

async function dlOneSI(ic, done, p) {
  try {
    const r = await fetchR(ic.pageUrl);
    if (!r) return false;
    const $ = cheerio.load(await r.text());
    let dl = $('a[href*="/download/"]').attr('href') || $('a.download-link').attr('href');
    if (!dl) return false;
    const dlUrl = dl.startsWith('http') ? dl : `https://www.silhouette-illust.com${dl}`;
    await sleep(DELAY_MS);
    const buf = await fetchBuf(dlUrl);
    if (!buf || buf.length < 100) return false;
    const zip = new AdmZip(buf);
    const png = zip.getEntries().find(e => e.entryName.endsWith('.png'));
    if (!png) return false;
    let slug = (ic.slug && ic.slug.length >= 3) ? ic.slug : await toSlug(ic.title);
    const fn = `si-${ic.id}-${slug}.png`;
    fs.writeFileSync(path.join(BASE_DIR, ic.folder, fn), png.getData());
    ic.file = `${ic.folder}/${fn}`;
    done[ic.id] = 1;
    return true;
  } catch { return false; }
}

async function dlSI(p) {
  console.log('\n=== Downloading silhouette-illust PNGs (concurrency: ' + SI_CONCURRENCY + ') ===');
  const icons = p.siIcons || [];
  const done = p.siDone || {};
  let n = Object.keys(done).length, err = 0;
  const pending = icons.filter(ic => !done[ic.id]);

  // Process in batches
  for (let i = 0; i < pending.length; i += SI_CONCURRENCY) {
    const batch = pending.slice(i, i + SI_CONCURRENCY);
    const results = await Promise.all(batch.map(ic => dlOneSI(ic, done, p)));
    results.forEach(ok => { if (ok) n++; else err++; });

    if ((i / SI_CONCURRENCY) % 10 === 0) {
      process.stdout.write(`\r  ${n}/${icons.length} (err:${err})`);
      p.siDone = done; saveP(p);
    }
    await sleep(DELAY_MS);
  }
  console.log(`\n  Done: ${n}/${icons.length} (err:${err})`);
  p.siDone = done; saveP(p);
}

// === INDEX ===
function buildIdx(p) {
  console.log('\n=== Building index.json ===');
  const idx = { generatedAt: new Date().toISOString(), icons: [] };
  for (const ic of (p.imIcons || [])) {
    if (ic.file) idx.icons.push({ id: `im-${ic.id}`, src: 'icooon-mono', title: ic.title, cat: ic.folder, file: ic.file, fmt: 'svg' });
  }
  for (const ic of (p.siIcons || [])) {
    if (ic.file) idx.icons.push({ id: `si-${ic.id}`, src: 'silhouette-illust', title: ic.title, cat: ic.folder, file: ic.file, fmt: 'png' });
  }
  idx.total = idx.icons.length;
  fs.writeFileSync(INDEX_FILE, JSON.stringify(idx, null, 2));
  console.log(`  ${idx.total} icons indexed`);
}

// === MAIN ===
async function main() {
  const t0 = Date.now();
  const f = process.argv[2];
  console.log(`=== Icon Downloader (${f || 'all'}) ===`);
  console.log(`Out: ${BASE_DIR}`);

  // Init kuroshiro
  kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());
  console.log('Kuroshiro initialized.\n');

  for (const d of ALL_FOLDERS) fs.mkdirSync(path.join(BASE_DIR, d), { recursive: true });
  const p = loadP();

  if (!f || f === 'im') { await crawlIM(p); await dlIM(p); }
  if (!f || f === 'si') { await crawlSI(p); await dlSI(p); }

  buildIdx(p);
  console.log(`\nDone! (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
}

main().catch(e => { console.error(e); process.exit(1); });
