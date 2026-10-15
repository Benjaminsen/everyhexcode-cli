// How a check is written out: text for a terminal, JSON, SARIF (GitHub code scanning shows it on the pull request),
// Markdown (a job summary or a PR comment) and GitHub annotations.
import path from 'node:path';
import { locate } from './files.js';

const C = process.stdout.isTTY && !process.env.NO_COLOR ? { r: '\x1b[31m', g: '\x1b[32m', y: '\x1b[33m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' } : { r: '', g: '', y: '', d: '', b: '', x: '' };
const rel = (f) => (/^https?:/.test(f) ? f : path.relative(process.cwd(), f).replace(/\\/g, '/') || f);
const SITE = 'https://everyhexcode.com';

/** Where a pair's text colour is declared (else its background), as file and line. */
export function whereOf(group, report, pair) {
  for (const side of [pair.fg, pair.bg]) {
    const t = report.tokens.find((x) => x.name === side.name && x.mode === pair.mode && x.at != null) || report.tokens.find((x) => x.name === side.name && x.at != null);
    if (t) return locate(group, t.at);
  }
  return { file: group.parts[0].file, line: 1, column: 1 };
}

export const failing = (r) => r.pairs.filter((p) => !p.pass && p.kind !== 'decor' && !p.optional);
export const lookAlike = (r) => r.collisions.filter((c) => c.common);
const link = (r) => `${SITE}/color-checker`;
const fixOf = (r, p) => r.fix.changes.filter((c) => c.mode === p.mode && (c.name === p.fg.name || c.name === p.bg.name)).map((c) => `${c.name} → #${c.to}`).filter((x, i, l) => l.indexOf(x) === i).join(', ');

export function text(results, opts) {
  const out = [];
  for (const { group, report: r } of results) {
    out.push(`${C.b}${rel(group.label)}${C.x} ${C.d}(${r.input.kind}, ${r.input.colors} colors${r.input.modes.length > 1 ? ', light and dark' : ''})${C.x}`);
    const f = failing(r);
    for (const p of f) {
      const at = whereOf(group, r, p);
      const fx = fixOf(r, p);
      // a rendered page has no file lines: the element is the place to look
      const where = /^https?:/.test(at.file) ? (p.why || '').replace(/ sets .*$/, '') : `${rel(at.file)}:${at.line}`;
      out.push(`  ${C.r}✗${C.x} ${p.fg.name} on ${p.bg.name}${r.input.modes.length > 1 ? ` [${p.mode}]` : ''}: ${C.b}${p.ratio}:1${C.x}, needs ${p.need}:1 (${p.kind})  ${C.d}${where}${C.x}${fx ? `\n      ${C.g}fix:${C.x} ${fx}` : ''}`);
    }
    for (const c of lookAlike(r)) out.push(`  ${C.y}!${C.x} ${c.a.name} and ${c.b.name} look alike with ${c.worst.label.toLowerCase()} (ΔE ${c.worst.d})`);
    if (opts.verbose) for (const p of r.pairs.filter((x) => x.pass)) out.push(`  ${C.g}✓${C.x} ${p.fg.name} on ${p.bg.name}${r.input.modes.length > 1 ? ` [${p.mode}]` : ''}: ${p.ratio}:1`);
    out.push(`  ${f.length ? C.r : C.g}${r.summary.pass} pass, ${r.summary.fail} fail${C.x} against ${r.standard}${r.input.warnings.length ? `  ${C.y}${r.input.warnings.join(' ')}${C.x}` : ''}`);
    if (r.fix.remaining.length) out.push(`  ${C.y}${r.fix.remaining.length} pair(s) need both colors to move.${C.x}`);
    out.push('');
  }
  return out.join('\n');
}

export function json(results) {
  return JSON.stringify(results.map(({ group, report }) => ({ file: group.parts.length === 1 ? rel(group.parts[0].file) : group.parts.map((p) => rel(p.file)), report })), null, 2);
}

export function markdown(results) {
  const out = ['## Color check', ''];
  for (const { group, report: r } of results) {
    const f = failing(r);
    out.push(`### ${rel(group.label)}: ${f.length ? `❌ ${r.summary.fail} failing` : '✅ all pass'} (${r.standard})`, '', r.summary.text, '');
    if (f.length) {
      out.push('| Text | Background | Mode | Contrast | Needs | Where | Fix |', '|---|---|---|---|---|---|---|');
      for (const p of f) { const at = whereOf(group, r, p); out.push(`| \`${p.fg.name}\` | \`${p.bg.name}\` | ${p.mode} | ${p.ratio}:1 | ${p.need}:1 | ${/^https?:/.test(at.file) ? `\`${(p.why || '').replace(/ sets .*$/, '').replace(/\|/g, '/')}\`` : `${rel(at.file)}:${at.line}`} | ${fixOf(r, p) || '–'} |`); }
      out.push('');
    }
    if (r.fix.diff) out.push('<details><summary>The fix as a diff</summary>', '', '```diff', r.fix.diff.trim(), '```', '', '</details>', '');
  }
  out.push(`Checked with [everyhexcode](${link()}): WCAG 2 contrast, color vision and the nearest passing colors.`);
  return out.join('\n');
}

const esc = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
// property values (file, title) also escape : and , (GitHub's workflow command format)
const escP = (s) => esc(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
export function github(results) {
  const out = [];
  for (const { group, report: r } of results) {
    for (const p of failing(r)) {
      const at = whereOf(group, r, p), fx = fixOf(r, p);
      const loc = /^https?:/.test(at.file) ? '' : `file=${escP(rel(at.file))},line=${at.line},col=${at.column},`;
      out.push(`::error ${loc}title=${escP(`Contrast ${p.ratio}:1 (needs ${p.need}:1)`)}::${esc(`${p.fg.name} on ${p.bg.name}${r.input.modes.length > 1 ? ` (${p.mode} mode)` : ''}${loc ? '' : ` at ${(p.why || '').replace(/ sets .*$/, '')}`} is ${p.ratio}:1; ${p.kind === 'ui' ? 'UI parts need 3:1 (WCAG 1.4.11)' : `text needs ${p.need}:1 (WCAG 1.4.3)`}.${fx ? ` Nearest passing: ${fx}.` : ''}`)}`);
    }
    for (const c of lookAlike(r)) out.push(`::warning title=Colors look alike::${esc(`${c.a.name} and ${c.b.name} look alike with ${c.worst.label.toLowerCase()} (ΔE ${c.worst.d}). Do not let color alone tell them apart (WCAG 1.4.1).`)}`);
  }
  return out.join('\n');
}

export function sarif(results, version) {
  const rules = [
    { id: 'contrast-text', name: 'TextContrast', shortDescription: { text: 'Text contrast below WCAG 2 (1.4.3)' }, helpUri: `${SITE}/guides/wcag-color-contrast`, defaultConfiguration: { level: 'error' } },
    { id: 'contrast-ui', name: 'NonTextContrast', shortDescription: { text: 'UI part contrast below 3:1 (WCAG 1.4.11)' }, helpUri: `${SITE}/guides/wcag-color-contrast`, defaultConfiguration: { level: 'error' } },
    { id: 'look-alike', name: 'ColorsLookAlike', shortDescription: { text: 'Colors that look alike with color blindness (WCAG 1.4.1)' }, helpUri: `${SITE}/color-blind-palette-checker`, defaultConfiguration: { level: 'warning' } },
  ];
  const res = [];
  for (const { group, report: r } of results) {
    for (const p of failing(r)) {
      const at = whereOf(group, r, p), fx = fixOf(r, p);
      res.push({ ruleId: p.kind === 'ui' ? 'contrast-ui' : 'contrast-text', level: 'error',
        message: { text: `${p.fg.name} on ${p.bg.name}${r.input.modes.length > 1 ? ` (${p.mode} mode)` : ''}: ${p.ratio}:1, needs ${p.need}:1.${fx ? ` Nearest passing: ${fx}.` : ''}` },
        locations: [{ physicalLocation: { artifactLocation: { uri: rel(at.file) }, region: { startLine: at.line, startColumn: at.column } } }],
        partialFingerprints: { pair: `${p.fg.name}|${p.bg.name}|${p.mode}` } });
    }
    for (const c of lookAlike(r)) {
      const t = r.tokens.find((x) => x.name === c.a.name && x.at != null);
      const at = t ? locate(group, t.at) : { file: group.parts[0].file, line: 1, column: 1 };
      res.push({ ruleId: 'look-alike', level: 'warning', message: { text: `${c.a.name} and ${c.b.name} look alike with ${c.worst.label.toLowerCase()} (ΔE ${c.worst.d}).` },
        locations: [{ physicalLocation: { artifactLocation: { uri: rel(at.file) }, region: { startLine: at.line } } }] });
    }
  }
  return JSON.stringify({ $schema: 'https://json.schemastore.org/sarif-2.1.0.json', version: '2.1.0',
    runs: [{ tool: { driver: { name: 'everyhexcode', version, informationUri: SITE + '/color-checker', rules } }, results: res }] }, null, 2);
}
