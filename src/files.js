// Which files to check: paths, folders (walked) and simple globs (*, **), the kinds the checker reads, and how CSS
// files are joined so a variable set in one file resolves where another file uses it.
import fs from 'node:fs';
import path from 'node:path';

export const EXT = /\.(css|scss|sass|less|pcss|postcss|json|js|cjs|mjs|ts|txt)$/i;
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', 'coverage', 'vendor', '.turbo', '.cache']);
// a JS or TS file is read only when it is a Tailwind config or a theme/tokens file, never as app code
const CONFIG_JS = /(^|[/\\])(tailwind\.config|theme|tokens?|colors?|palette)[\w.-]*\.(c|m)?(js|ts)$/i;

function globToRe(g) {
  let s = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*' && g[i + 1] === '*') { s += '.*'; i++; if (g[i + 1] === '/') i++; }
    else if (c === '*') s += '[^/]*';
    else if (c === '?') s += '[^/]';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${s}$`);
}

function walk(dir, out, root) {
  let list;
  try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of list) {
    if (e.name.startsWith('.') && e.name !== '.') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p, out, root); }
    else if (EXT.test(e.name)) out.push(p);
  }
}

/** The files a list of arguments means, each once, in a stable order. */
export function expand(args, cwd = process.cwd()) {
  const out = [];
  for (const a of args.length ? args : ['.']) {
    if (/[*?]/.test(a)) {
      const base = a.slice(0, a.search(/[*?]/)).replace(/[^/]*$/, '') || '.';
      const re = globToRe(path.posix.normalize(a.replace(/\\/g, '/')).replace(/^\.\//, ''));
      const all = [];
      walk(path.resolve(cwd, base), all, cwd);
      for (const f of all) { const rel = path.relative(cwd, f).replace(/\\/g, '/'); if (re.test(rel)) out.push(f); }
      continue;
    }
    const p = path.resolve(cwd, a);
    let st;
    try { st = fs.statSync(p); } catch { throw new Error(`No such file or folder: ${a}`); }
    if (st.isDirectory()) walk(p, out, cwd); else out.push(p);
  }
  const keep = (f) => !/\.(js|cjs|mjs|ts)$/i.test(f) || CONFIG_JS.test(f);
  const jsonOk = (f) => !/\.json$/i.test(f) || !/(^|[/\\])(package(-lock)?|tsconfig[\w.-]*|jsconfig|composer|manifest|\.?eslintrc[\w.-]*|renovate|turbo|vercel|firebase|app)\.json$/i.test(f);
  return [...new Set(out)].filter((f) => keep(f) && jsonOk(f)).sort();
}

/**
 * Groups to check: all stylesheets together (one cascade: a variable set in tokens.css resolves in buttons.css), and
 * each token or config file alone. Each group keeps where every file starts in the joined text, so findings and fixes
 * go back to the right file and line.
 */
export const skipped = [];
export function groups(files, read = (f) => fs.readFileSync(f, 'utf8')) {
  const css = [], other = [];
  for (const f of files) {
    const text = read(f);
    if (text.length > 5_000_000) { skipped.push(`${f} (over 5 MB, not read)`); continue; }
    if (/\.(css|scss|sass|less|pcss|postcss)$/i.test(f)) css.push({ file: f, text }); else other.push({ file: f, text });
  }
  const out = [];
  // stylesheets are read together only when one uses a variable another defines (tokens.css and buttons.css): unrelated
  // files stay apart, so a fix in one never comes from another's colours
  const defs = css.map((c) => new Set([...c.text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])));
  const uses = css.map((c) => new Set([...c.text.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])));
  const parent = css.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < css.length; i++) for (let j = 0; j < css.length; j++) {
    if (i !== j && [...uses[i]].some((v) => !defs[i].has(v) && defs[j].has(v))) parent[find(i)] = find(j);
  }
  const sets = new Map();
  css.forEach((c, i) => { const r = find(i); sets.set(r, [...(sets.get(r) || []), c]); });
  for (const list of sets.values()) {
    let text = '', parts = [];
    for (const c of list) { parts.push({ file: c.file, start: text.length, end: text.length + c.text.length, text: c.text }); text += c.text + '\n'; }
    out.push({ label: list.length === 1 ? list[0].file : `${list.length} stylesheets that share variables`, text, parts });
  }
  for (const o of other) out.push({ label: o.file, text: o.text, parts: [{ file: o.file, start: 0, end: o.text.length, text: o.text }] });
  return out;
}

/** File, line and column of an offset in a joined group. */
export function locate(group, offset) {
  const p = group.parts.find((x) => offset >= x.start && offset <= x.end) || group.parts[0];
  const before = p.text.slice(0, Math.max(0, offset - p.start));
  const line = before.split('\n').length;
  return { file: p.file, line, column: before.length - before.lastIndexOf('\n') };
}
