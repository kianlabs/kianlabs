// Generates 1280x640 social preview images for pinned repos into assets/social/.
// Needs Chromium on PATH for the PNG export. Run with: node scripts/build-social.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { fonts, gopherBust, palettes, svg } from './art/gopher.mjs';
import { props } from './build-art.mjs';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'social');
const p = palettes.dark;

const extraProps = {
  doc: `
    <rect class="white" x="96" y="24" width="34" height="44" rx="3"/>
    <path class="ink" d="M103 35 H123 M103 43 H123 M103 51 H115"/>
    <circle class="white" cx="124" cy="62" r="9"/>
    <path class="ink" d="M130.5 68.5 L137 75"/>`,
  briefcase: `
    <path class="ink" d="M108 44 V38 Q108 35 111 35 H121 Q124 35 124 38 V44"/>
    <rect fill="#c8874a" stroke="var(--fg)" stroke-width="3" x="96" y="44" width="40" height="30" rx="4"/>
    <path class="ink" d="M96 56 H136"/>
    <rect class="white" x="113" y="52" width="6" height="8" rx="1" style="stroke-width:2"/>`,
  coin: `
    <circle fill="#f5c542" stroke="var(--fg)" stroke-width="3" cx="116" cy="56" r="18"/>
    <circle fill="none" stroke="#c99a1e" stroke-width="2" cx="116" cy="56" r="12.5"/>
    <text x="116" y="61.5" text-anchor="middle" font-family='${fonts.sans}' font-size="14" font-weight="700" fill="#7a5200">Rp</text>`,
};

const repos = [
  { repo: 'task-api', title: 'Task Manager API', prop: props.stack, chips: ['Go', 'PostgreSQL', 'Docker', 'OpenAPI'],
    desc: "Multi-tenant task & project REST API on Go's standard library: JWT auth, RBAC, background worker. No framework, no ORM." },
  { repo: 'docuask', title: 'DocuAsk', prop: extraProps.doc, chips: ['Next.js', 'TypeScript', 'pgvector', 'Docker'],
    desc: 'Upload PDFs, ask questions, and get answers with page citations. Tenant isolation with PostgreSQL Row-Level Security.' },
  { repo: 'coffee-shop-pos', title: 'Suro POS', prop: props.now, chips: ['React', 'TypeScript', 'Capacitor', 'SQLite'],
    desc: 'Offline-first tablet POS for coffee shops: recipe-based stock, HPP per gram, Bluetooth thermal printing.' },
  { repo: 'uangku', title: 'UangKu', prop: props.stats, chips: ['Next.js', 'FastAPI', 'PostgreSQL', 'PWA'],
    desc: 'Production personal finance tracker with Google OAuth, category budgets, and PDF/CSV export.' },
  { repo: 'gawetracker', title: 'GaweTracker', prop: extraProps.briefcase, chips: ['Laravel', 'PHP', 'MySQL', 'Tailwind'],
    desc: 'Realtime job discovery scraper for Glints & JobStreet with a Kanban application tracker.' },
  { repo: 'dankas', title: 'DanKas', prop: extraProps.coin, chips: ['Next.js', 'Supabase', 'TypeScript', 'PWA'],
    desc: "Bookkeeping app for DAN'S LABEL clothing store in Surakarta. Mobile-first PWA." },
];

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  return line ? [...lines, line] : lines;
}

function chipsRow(chips) {
  let x = 80;
  return chips.map((label) => {
    const w = label.length * 14.4 + 36;
    const chip = `<rect x="${x}" y="408" width="${w}" height="44" rx="22" fill="#0b2a33" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="${x + w / 2}" y="437" text-anchor="middle" class="acc" font-family='${fonts.mono}' font-size="22">${escapeXml(label)}</text>`;
    x += w + 14;
    return chip;
  }).join('\n    ');
}

function preview({ repo, title, desc, chips, prop }) {
  const descLines = wrap(desc, 44)
    .map((l, i) => `<text x="80" y="${280 + i * 44}" class="muted" font-family='${fonts.sans}' font-size="31">${escapeXml(l)}</text>`)
    .join('\n  ');
  return svg({
    width: 1280, height: 640, title: `${title} — kianlabs/${repo}`, palette: p,
    body: `
  <style>.big :is(.body, .white, .tan, .ink, .acc-s, .seam) { stroke-width: 1.7; }</style>
  <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#1c2129"/></pattern></defs>
  <rect width="1280" height="640" fill="var(--bg)"/>
  <rect width="1280" height="640" fill="url(#grid)"/>
  <text x="80" y="112" class="acc" font-family='${fonts.mono}' font-size="26">kianlabs / ${escapeXml(repo)}</text>
  <text x="76" y="200" class="txt" font-family='${fonts.sans}' font-size="76" font-weight="700">${escapeXml(title)}</text>
  ${descLines}
  ${chipsRow(chips)}
  <path d="M80 540 H300" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
  <text x="80" y="582" class="muted" font-family='${fonts.mono}' font-size="22">github.com/kianlabs/${escapeXml(repo)}</text>
  <g class="big" transform="translate(800 312) scale(3.2)">${gopherBust()}${prop}</g>`,
  });
}

mkdirSync(outDir, { recursive: true });
for (const item of repos) {
  const svgPath = join(outDir, `${item.repo}.svg`);
  writeFileSync(svgPath, preview(item));
  execFileSync('chromium', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--force-prefers-reduced-motion',
    '--window-size=1280,640', `--screenshot=${join(outDir, `${item.repo}.png`)}`, pathToFileURL(svgPath).href,
  ], { stdio: 'ignore' });
}
console.info(`Wrote ${repos.length} social previews to ${outDir}`);
