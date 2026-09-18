/**
 * Every theme, checked against the rules a theme has to obey.
 *
 *     node tools/theme-check.mjs        # npm run themes
 *
 * Exits non-zero on the first theme that breaks one, so it is a check and not a
 * report. It reads the real config through the dev server, so it is checking
 * what the game loads rather than a copy of it.
 *
 * ================= WHY THIS EXISTS =================
 *
 * TRAFFIC IS SHARED. The density curve, the guaranteed escape lane, the rule
 * that no stretch of road may become a wall, and the speed aware spacing are
 * one model that every road runs. They are what make the road playable and they
 * were measured to get there - tools/bot-run.mjs held full throttle for 3.09 km
 * at the opening density and 1.07 km at the cap with zero crashes, and the
 * escape guarantee is enforced at spawn because that is the only place it can
 * be. A theme that quietly re-tunes any of it ships a road nobody profiled, and
 * the symptom arrives as "this road feels wrong" weeks later rather than as an
 * error.
 *
 * So a theme may set exactly two things about traffic: `mix`, which thins one
 * type against another, and `look`, which repaints them. Both are paint-and-
 * proportion. Everything else under `world.traffic` is refused here.
 *
 * A THEME NEVER ALLOCATES is the other rule, and it was already broken when
 * this was written: auroraPass set `world.roadside.stationsPerChunk`, which
 * sized an InstancedMesh - config/themes/index.js says in capitals not to put a
 * count or a pool size in a theme file. This check is what found it. Roadside
 * now allocates at the union over every theme and scales the surplus to
 * nothing, so the key is live rather than structural and the road can thin or
 * thicken its pylons mid run.
 *
 * That is the whole point of writing it down: a rule nothing checks is a rule
 * that is already broken somewhere nobody has looked.
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

/**
 * The only keys a theme may set under `world.traffic`. Everything else there is
 * the shared model.
 */
const TRAFFIC_ALLOWED = ['mix', 'look'];

/**
 * Keys anywhere in a theme patch that size something. A theme that sets one of
 * these allocates, which breaks the rule the live road transitions rest on:
 * an instance buffer cannot be resized mid run, and a road that changes theme
 * every few kilometres cannot reload the page.
 */
const ALLOCATING = [
  'count', 'counts', 'poolSize', 'perChunk',
  'segments', 'widthSegments', 'heightSegments', 'radialSegments',
  'pointsPerChunk', 'octaves', 'taps', 'textureVariants',
];

/**
 * Keys that LOOK like they size something and no longer do, because the module
 * behind them now allocates at the union over every theme and treats the
 * theme's own value as a live count. Listed rather than quietly dropped, so the
 * next person to read the list above knows the difference was deliberate.
 *
 * `roadside.stationsPerChunk` is the worked example: it really did size an
 * InstancedMesh, this check is what found it, and world/Roadside.js now sizes
 * from maxStationsPerChunk() and scales the surplus to nothing.
 */
const SIZED_AT_THE_UNION = ['stationsPerChunk'];

/** Walks a patch and yields every leaf path. */
function* paths(value, trail = []) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    yield { path: trail.join('.'), key: trail[trail.length - 1], value };
    return;
  }
  for (const key of Object.keys(value)) yield* paths(value[key], trail.concat(key));
}

function startServer() {
  const child = spawn('npm', ['run', 'dev'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let text = '';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no dev server: ' + text)), 30000);
    child.stdout.on('data', (chunk) => {
      text += String(chunk);
      const m = text.replace(ANSI, '').match(/Local:\s+(https?:\/\/\S+)/);
      if (m) { clearTimeout(timer); resolve({ child, url: m[1].trim() }); }
    });
  });
}

const server = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(server.url + '?god=1', { waitUntil: 'load' });
await page.waitForFunction(() => window.NEON, null, { timeout: 20000 });

const themes = await page.evaluate(() => {
  const out = {};
  for (const [name, theme] of Object.entries(window.NEON.config.themes)) {
    // Structured clone through JSON: the patch is plain data by definition, and
    // anything in it that is not is itself a finding.
    out[name] = JSON.parse(JSON.stringify(theme));
  }
  return out;
});

await browser.close();
server.child.kill();

const failures = [];
const warnings = [];

for (const [name, theme] of Object.entries(themes)) {
  const found = [];
  // Reported once per offending BRANCH, not once per leaf under it. A theme
  // that sets four numbers inside world.traffic.models is one mistake, and
  // printing it four times buries the other findings.
  const reported = new Set();

  for (const leaf of paths(theme)) {
    // --- traffic: the shared model ---------------------------------------
    if (leaf.path.startsWith('world.traffic.')) {
      const key = leaf.path.slice('world.traffic.'.length).split('.')[0];
      if (!TRAFFIC_ALLOWED.includes(key) && !reported.has(key)) {
        reported.add(key);
        failures.push(
          `${name}: sets world.traffic.${key} - traffic is the SHARED model. `
          + `A theme may set only ${TRAFFIC_ALLOWED.map((k) => 'world.traffic.' + k).join(' and ')}.`,
        );
      }
    }

    // --- allocation --------------------------------------------------------
    if (ALLOCATING.includes(leaf.key) && !SIZED_AT_THE_UNION.includes(leaf.key)) {
      warnings.push(`${name}: sets ${leaf.path} - that sizes something, and a theme never allocates`);
    }
    found.push(leaf.path);
  }

  // --- motion comfort, which CLAUDE.md requires of every theme -------------
  if (!theme.comfort || !theme.comfort.centreMotion) {
    failures.push(
      `${name}: has no comfort.centreMotion - CLAUDE.md requires every theme to say `
      + 'where its motion lives, and a theme that leaves it unsaid inherits whatever '
      + 'the theme before it left behind',
    );
  }
  if (!theme.comfort || theme.comfort.weather === undefined) {
    failures.push(`${name}: has no comfort.weather - say what is falling, even if it is 'none'`);
  }
  if (!theme.name) failures.push(`${name}: has no display name`);

  console.log(`${name.padEnd(14)} ${found.length} patched leaves`);
}

console.log('');
for (const warning of warnings) console.log('WARN  ' + warning);
for (const failure of failures) console.log('FAIL  ' + failure);

if (failures.length) {
  console.log(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`\ntheme-check: ${Object.keys(themes).length} themes ok`
  + (warnings.length ? `, ${warnings.length} warning(s)` : ''));
process.exit(0);
