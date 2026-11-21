// Generates the animated gopher section icons and footer into assets/art/.
// Run with: node scripts/build-art.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fonts, gopherBust, palettes, svg } from './art/gopher.mjs';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'art');

const sparkle = (x, y, s = 1, delay = 0) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path class="acc fb twinkle" style="animation-delay:${delay}s" d="M0 -8 L2.4 -2.4 8 0 2.4 2.4 0 8 -2.4 2.4 -8 0 -2.4 -2.4 Z"/></g>`;

const props = {
  about: `
    <g class="wave" style="transform-origin: 86px 78px">
      <ellipse class="tan" cx="100" cy="50" rx="10" ry="8"/>
      <path class="seam" d="M96 46 v6 M104 46 v6"/>
    </g>
    <path class="acc-s" d="M116 36 q6 6 0 14 M123 31 q9 10 0 24"/>`,
  stack: `
    <g class="fb spin">
      <circle cx="114" cy="50" r="15" fill="none" stroke="var(--accent)" stroke-width="8" stroke-dasharray="5.9 5.9"/>
      <circle class="acc" cx="114" cy="50" r="12"/>
      <circle class="white" cx="114" cy="50" r="5"/>
    </g>`,
  projects: `
    <g class="float">
      <g transform="translate(114 52) rotate(35)">
        <path class="flicker" fill="#ff9f43" d="M-5 16 L0 30 L5 16 Z"/>
        <path class="acc" stroke="var(--fg)" stroke-width="3" stroke-linejoin="round" d="M-7 6 L-13 18 L-5 15 Z M7 6 L13 18 L5 15 Z"/>
        <path class="white" d="M0 -22 C10 -12 10 8 7 16 L-7 16 C-10 8 -10 -12 0 -22 Z"/>
        <circle class="acc" cx="0" cy="-4" r="4" stroke="var(--fg)" stroke-width="2"/>
      </g>
    </g>
    ${sparkle(132, 22, .8, -.6)}`,
  stats: `
    <rect class="acc grow" x="98" y="62" width="10" height="22" rx="2" style="animation-delay:-.8s"/>
    <rect class="acc grow" x="112" y="48" width="10" height="36" rx="2" style="animation-delay:-1.6s"/>
    <rect class="acc grow" x="126" y="34" width="10" height="50" rx="2"/>
    <path class="ink" d="M94 86 H138"/>`,
  certs: `
    <g class="swing" style="transform-origin: 116px 18px">
      <path fill="#ef5b5b" stroke="var(--fg)" stroke-width="2.5" stroke-linejoin="round" d="M108 18 L104 48 L113 44 L116 18 Z M124 18 L128 48 L119 44 L116 18 Z"/>
      <circle fill="#f5c542" stroke="var(--fg)" stroke-width="3" cx="116" cy="60" r="15"/>
      <path fill="#fff" d="M116 51 L118.6 57 125 57.4 120 61.4 121.6 67.6 116 64.2 110.4 67.6 112 61.4 107 57.4 113.4 57 Z"/>
    </g>
    ${sparkle(134, 44, .7, -1)}`,
  now: `
    <path class="ink steam" d="M108 44 c-6 -6 6 -10 0 -18"/>
    <path class="ink steam" style="animation-delay:1.3s" d="M120 44 c-6 -6 6 -10 0 -18"/>
    <path class="white" d="M100 52 L103 86 L127 86 L130 52 Z"/>
    <path class="ink" d="M129 60 C142 60 142 78 128 78"/>
    <path class="acc-s" d="M102 64 H128"/>`,
  contact: `
    <g class="bounce">
      <rect class="white" x="96" y="44" width="40" height="28" rx="4"/>
      <path class="ink" d="M98 47 L116 61 L134 47"/>
    </g>
    <path class="fb pop" fill="#ef5b5b" d="M128 30 c-2 -4 -8 -3 -8 1 c0 4 8 8 8 8 s8 -4 8 -8 c0 -4 -6 -5 -8 -1 Z"/>`,
};

const titles = {
  about: 'Gopher waving hello', stack: 'Gopher with a spinning gear', projects: 'Gopher with a rocket',
  stats: 'Gopher with a bar chart', certs: 'Gopher with a medal', now: 'Gopher with a coffee mug',
  contact: 'Gopher with an envelope',
};

function icon(name, palette) {
  return svg({
    width: 140, height: 100, title: titles[name], palette,
    body: `<g class="bob">${gopherBust()}</g>${props[name]}`,
  });
}

function footer(palette) {
  return svg({
    width: 1200, height: 220, title: 'Gopher waving goodbye — thanks for stopping by', palette,
    body: `
  <path class="ink" style="stroke:var(--line)" d="M40 214 C400 210 800 216 1160 212"/>
  <g transform="translate(90 54) scale(1.6)">
    <g class="bob">${gopherBust()}</g>
    <g class="wave" style="transform-origin: 86px 78px">
      <ellipse class="tan" cx="100" cy="50" rx="10" ry="8"/>
      <path class="seam" d="M96 46 v6 M104 46 v6"/>
    </g>
  </g>
  <text x="340" y="104" class="txt" font-family='${fonts.sans}' font-size="40" font-weight="700">Thanks for stopping by!</text>
  <text x="342" y="146" class="acc" font-family='${fonts.mono}' font-size="20">// let's build something reliable together</text>
  <text class="acc float" x="1010" y="78" font-family='${fonts.mono}' font-size="20" opacity=".75">go func()</text>
  <text class="acc float" style="animation-delay:-2.5s" x="1060" y="150" font-family='${fonts.mono}' font-size="20" opacity=".75">&lt;-done</text>
  ${sparkle(960, 120, 1, -.4)}
  ${sparkle(300, 60, .8, -1.4)}`,
  });
}

mkdirSync(outDir, { recursive: true });
for (const [mode, palette] of Object.entries(palettes)) {
  for (const name of Object.keys(props)) {
    writeFileSync(join(outDir, `${name}-${mode}.svg`), icon(name, palette));
  }
  writeFileSync(join(outDir, `footer-${mode}.svg`), footer(palette));
}
console.info(`Wrote ${Object.keys(palettes).length * (Object.keys(props).length + 1)} SVGs to ${outDir}`);
