#!/usr/bin/env node
// everyhexcode: check the colors in your CSS, Tailwind config or design tokens against WCAG 2 contrast and color vision,
// fix them with the nearest passing colors, or scan a running page in your own headless Chrome. Runs on your machine
// and in your own CI; nothing is sent anywhere. Same engine as https://everyhexcode.com/color-checker.
import fs from 'node:fs';
import path from 'node:path';
import { applyFix, check, VERSION as ENGINE } from './engine/check.js';
import { expand, groups, skipped } from './files.js';
import * as out from './output.js';
import { renderScan } from './render.js';

const VERSION = '0.1.0';
const HELP = `everyhexcode ${VERSION}: check and fix the colors in your code

Usage
  everyhexcode check [files or folders...]   check CSS, SCSS, Less, Tailwind configs and design tokens (default: .)
  everyhexcode fix [files...] --write        write the nearest passing colors back into the files
  everyhexcode scan <url> [--dark]           load a page in your own headless Chrome and check what it draws

Options
  --target AA|AAA        WCAG 2 level (default AA)
  --format text|json|sarif|markdown|github   (default text; github prints annotations)
  --out <file>           write the report to a file instead of stdout
  --sarif <file>         also write SARIF (for GitHub code scanning)
  --lock <names>         comma-separated names or hex codes that must not change (e.g. --lock=--primary)
  --config <file>        settings file (default: colorcheck.json if it exists)
  --fail-on fail|warn|none   exit 1 on failing pairs (default), also on look-alike colors, or never
  --write                with fix: change the files
  --verbose              list passing pairs too
  --chrome <path>        Chrome or Chromium to use for scan (default: CHROME_PATH or the usual install)
  --width <px>           viewport width for scan (default 1280)

Settings file (colorcheck.json)
  { "files": ["src/styles"], "target": "AA", "lock": ["--brand"], "roles": { "--muted": "bg" },
    "pairs": [["--link", "--card", "text"]], "ignore": ["--decorative"], "failOn": "fail" }

Exit codes: 0 all pass, 1 failing pairs, 2 usage or read error.
Licensed under the Functional Source License (FSL-1.1-ALv2): free for your own use, see LICENSE.md.`;

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--') { a._.push(...argv.slice(i + 1)); break; }
    if (x.startsWith('--')) {
      const [k, v] = x.slice(2).split(/=(.*)/s);
      const flag = ['write', 'verbose', 'dark', 'help', 'version', 'light'].includes(k);
      a[k] = v !== undefined ? v : flag ? true : argv[++i];
    } else if (x === '-h') a.help = true;
    else if (x === '-v') a.version = true;
    else a._.push(x);
  }
  return a;
}

function loadConfig(file) {
  const p = file || (fs.existsSync('colorcheck.json') ? 'colorcheck.json' : null);
  if (!p) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { throw new Error(`Could not read ${p}: ${e.message}`); }
}

function emit(results, a, version) {
  const fmt = a.format || 'text';
  const body = fmt === 'json' ? out.json(results) : fmt === 'sarif' ? out.sarif(results, version) : fmt === 'markdown' ? out.markdown(results) : fmt === 'github' ? out.github(results) : out.text(results, a);
  if (a.out) fs.writeFileSync(a.out, body + '\n'); else if (body) process.stdout.write(body + '\n');
  if (a.sarif) fs.writeFileSync(a.sarif, out.sarif(results, version) + '\n');
  if (process.env.GITHUB_STEP_SUMMARY && fmt === 'github') fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.markdown(results) + '\n');
}

function exitCode(results, failOn) {
  if (failOn === 'none') return 0;
  const bad = results.some(({ report }) => out.failing(report).length);
  const warn = results.some(({ report }) => out.lookAlike(report).length);
  return bad || (failOn === 'warn' && warn) ? 1 : 0;
}

/** Write the fix back, file by file: each change goes into the file its value came from, in the way it was written. */
function writeBack(group, report) {
  const written = [];
  for (const part of group.parts) {
    const mine = report.fix.changes.filter((c) => c.span && c.span[0] >= part.start && c.span[1] <= part.end).map((c) => ({ ...c, span: [c.span[0] - part.start, c.span[1] - part.start] }));
    if (!mine.length) continue;
    const fixed = applyFix(part.text, mine, path.basename(part.file));
    fs.writeFileSync(part.file, fixed.text);
    written.push(`${path.relative(process.cwd(), part.file) || part.file}: ${mine.map((c) => `${c.name} #${c.from} → #${c.to}`).join(', ')}`);
  }
  return written;
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const cmd = ['check', 'fix', 'scan'].includes(a._[0]) ? a._.shift() : 'check';
  if (a.help) { console.log(HELP); return 0; }
  if (a.version) { console.log(`everyhexcode ${VERSION} (engine ${ENGINE})`); return 0; }
  // a value that is not one of the choices is a mistake in the command, not a reason to fall back silently
  const bad = [['target', ['AA', 'AAA', 'aa', 'aaa']], ['format', ['text', 'json', 'sarif', 'markdown', 'github']], ['fail-on', ['fail', 'warn', 'none']]].find(([k, ok]) => a[k] !== undefined && !ok.includes(String(a[k])));
  if (bad) { console.error(`everyhexcode: --${bad[0]} must be one of ${bad[0] === 'target' ? 'AA, AAA' : bad[1].join(', ')}`); return 2; }
  const cfg = loadConfig(a.config);
  const target = String(a.target || cfg.target || 'AA').toUpperCase() === 'AAA' ? 'AAA' : 'AA';
  const lock = [...(cfg.lock || []), ...String(a.lock || '').split(',').filter(Boolean)];
  const roles = { ...(cfg.roles || {}) };
  for (const n of cfg.ignore || []) roles[n] = 'ignore';
  const opts = { target, lock, roles, pairs: cfg.pairs, max: 5_000_000 };
  const failOn = a['fail-on'] || cfg.failOn || 'fail';

  if (cmd === 'scan') {
    const url = a._[0] || cfg.url;
    if (!url) { console.error('Give a URL: everyhexcode scan http://localhost:3000'); return 2; }
    const modes = a.dark ? ['dark'] : a.light ? ['light'] : ['light', 'dark'];
    const s = await renderScan(url, { chrome: a.chrome, width: Number(a.width) || 1280, modes, log: (m) => process.stderr.write(m + '\n') });
    const report = check(s.css, { ...opts, label: 'rendered' });
    report.input.kind = 'rendered page';
    const group = { label: `${s.url} (rendered)`, text: s.css, parts: [{ file: s.url, start: 0, end: s.css.length, text: s.css }] };
    emit([{ group, report }], a, VERSION);
    if ((a.format || 'text') === 'text') process.stderr.write(`Read ${s.elements} text elements (${s.images} over images or gradients) in ${modes.join(' and ')} mode.\n`);
    return exitCode([{ report }], failOn);
  }

  const files = expand(a._.length ? a._ : cfg.files || ['.']);
  if (!files.length) { console.error('No CSS, SCSS, Less, token or Tailwind config files found.'); return 2; }
  const results = groups(files).map((group) => ({ group, report: check(group.text, { ...opts, label: path.basename(group.label) }) })).filter(({ report }) => report.input.colors);
  for (const x of skipped) console.error(`everyhexcode: skipped ${x}`);
  if (!results.length) { console.error(`No colors found in ${files.length} file(s)${skipped.length ? ` (${skipped.length} skipped)` : ''}: nothing to check.`); return skipped.length ? 2 : 0; }
  if (cmd === 'fix' && a.write) {
    const lines = results.flatMap(({ group, report }) => writeBack(group, report));
    // values with no place in the text (Figma variables, values reached through an alias written as hsl(var()))
    const unwritten = results.flatMap(({ report }) => report.fix.changes.filter((c) => !c.span).map((c) => `${c.name}${report.input.modes.length > 1 ? ` (${c.mode})` : ''}: #${c.from} → #${c.to}`));
    console.log(lines.length ? `Changed:\n${lines.map((l) => '  ' + l).join('\n')}` : unwritten.length ? 'No file text to change.' : 'Nothing to change.');
    if (unwritten.length) console.log(`Change these where they are defined (they have no value in the file text):\n${unwritten.map((l) => '  ' + l).join('\n')}`);
    const again = groups(files).map((group) => ({ group, report: check(group.text, { ...opts, label: path.basename(group.label) }) }));
    emit(again, a, VERSION);
    return exitCode(again, failOn);
  }
  if (cmd === 'fix' && (a.format || 'text') === 'text') {
    for (const { report } of results) if (report.fix.diff) process.stdout.write(report.fix.diff + '\n');
    console.error('Run with --write to change the files.');
    return exitCode(results, failOn);
  }
  emit(results, a, VERSION);
  return exitCode(results, failOn);
}

process.stdout.on('error', (e) => { if (e.code === 'EPIPE') process.exit(process.exitCode || 0); throw e; });
main().then((code) => { process.exitCode = code; }, (e) => { console.error(`everyhexcode: ${e.message}`); process.exitCode = 2; });
