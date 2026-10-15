// The colour checker's reader: whatever people paste (a list of colours, CSS with custom properties and rules, SCSS or
// Less variables, a Tailwind config, design tokens in W3C DTCG, Style Dictionary or a Figma variables export) becomes one
// list of named colour tokens, each with its light or dark mode and where its value sits in the text, so a fix can be
// written back into the same text. CSS rules that set both a text and a background colour are kept as declared pairs.
import { parseColor } from './parse.js';

export const MAX_TOKENS = 300;

/** A token: { name, hex, alpha, mode, raw, span:[start,end]|null, format, alias? }. */
const CSS_NAMES = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue '
  + 'chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki '
  + 'darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise '
  + 'darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod '
  + 'gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue '
  + 'lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray '
  + 'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple '
  + 'mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite '
  + 'navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink '
  + 'plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue '
  + 'slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow '
  + 'yellowgreen').split(' '));
const FN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const BARE_HSL = /^-?[\d.]+(?:deg)?\s+[\d.]+%\s+[\d.]+%(?:\s*\/\s*[\d.]+%?)?$/;

/** Whether a declared value is meant as a colour (so --radius: 0.5rem or --z: 10 are never read as one). */
export function looksColor(raw) {
  const v = String(raw).trim();
  if (!v || v.length > 120) return false;
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
  if (FN.test(v)) return true;
  if (BARE_HSL.test(v)) return true;
  return CSS_NAMES.has(v.toLowerCase()) || v.toLowerCase() === 'transparent';
}

/** The way a value is written, so a fix is written back the same way. */
export function formatOf(raw) {
  const v = String(raw).trim().toLowerCase();
  if (v.startsWith('#')) return v.length <= 5 || v.length === 7 ? (raw.trim() === raw.trim().toUpperCase() ? 'HEX' : 'hex') : 'hex8';
  if (BARE_HSL.test(v)) return 'hsl-bare';
  const m = v.match(/^([a-z]+)\(/);
  if (m) return m[1].replace(/a$/, '') + (/,/.test(v) ? '-legacy' : '');
  return 'name';
}

const readOne = (raw) => {
  const r = parseColor(String(raw).trim());
  return r.hex ? { hex: r.hex, alpha: r.alpha ?? 1 } : null;
};

/** Comments out, offsets kept: each comment becomes spaces of the same length. */
function blankComments(s, line = true) {
  let out = s.replace(/\/\*[^]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  if (line) out = out.replace(/(^|[^:"'])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
  return out;
}

const DARK_SEL = /\.dark\b|\[data-(?:theme|mode|color-scheme)=["']?dark|\.theme-dark|\bdark-theme\b|\[theme=["']?dark/i;
const DARK_MEDIA = /prefers-color-scheme\s*:\s*dark/i;
const LIGHT_SEL = /\.light\b|\[data-(?:theme|mode|color-scheme)=["']?light|prefers-color-scheme\s*:\s*light/i;

const PROPS = {
  color: 'fg', 'background-color': 'bg', background: 'bg', 'border-color': 'border', border: 'border', 'border-top': 'border',
  'border-bottom': 'border', outline: 'outline', 'outline-color': 'outline', fill: 'fill', stroke: 'stroke', 'caret-color': 'caret',
  'text-decoration-color': 'decoration', 'column-rule-color': 'border',
};

/** CSS, SCSS and Less: custom properties and variables become tokens; rules keep the colours they set. */
export function readCss(text) {
  const src = blankComments(text, /\$[\w-]+\s*:|@[\w-]+\s*:/.test(text));
  const tokens = [], rules = [];
  const stack = []; // preludes of the open blocks
  let i = 0, start = 0;
  const mode = () => (stack.some((p) => DARK_MEDIA.test(p) || DARK_SEL.test(p)) ? 'dark' : 'light');
  const decls = [];
  const flushDecl = (from, to) => {
    const d = src.slice(from, to);
    const m = d.match(/^\s*([$@]?-{0,2}[A-Za-z_][\w-]*)\s*:\s*/);
    if (!m || d.slice(m[0].length).trim() === '') return;
    let vs = from + m[0].length, ve = to;
    while (ve > vs && /\s/.test(src[ve - 1])) ve--;
    let val = src.slice(vs, ve);
    const imp = val.match(/\s*!(?:important|default|global)\s*$/i);
    if (imp) { val = val.slice(0, -imp[0].length); ve -= imp[0].length; }
    decls.push({ prop: m[1], value: val, span: [vs, ve], depth: stack.length, prelude: stack[stack.length - 1] || '', mode: mode(), scoped: stack.some((p) => LIGHT_SEL.test(p)), block: blockId });
  };
  let blockId = 0, blockSeq = 0; const blockStack = [];
  let quote = null, paren = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (quote) { if (ch === quote && src[i - 1] !== '\\') quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') { paren++; continue; }
    if (ch === ')') { paren = Math.max(0, paren - 1); continue; }
    if (paren) continue;
    if (ch === '{') {
      const prelude = src.slice(start, i).trim();
      // a declaration ended without ; before a nested block (SCSS) would be lost: only text after the last ; is the prelude
      stack.push(prelude); blockStack.push(blockId); blockId = ++blockSeq; start = i + 1;
    } else if (ch === '}') {
      flushDecl(start, i); stack.pop(); blockId = blockStack.pop() ?? 0; start = i + 1;
    } else if (ch === ';') { flushDecl(start, i); start = i + 1; }
  }
  flushDecl(start, src.length);

  // variables first: custom properties, $scss and @less
  const vars = new Map(); // name|mode → token
  for (const d of decls) {
    const isVar = d.prop.startsWith('--') || ((d.prop.startsWith('$') || (d.prop.startsWith('@') && !/^@(media|supports|import|font-face|keyframes|layer|theme|container|tailwind|apply|use|forward|include|mixin|function|return|if|else|each|for|while|charset|namespace|page)$/.test(d.prop))) && d.depth <= 1);
    if (!isVar) continue;
    const raw = d.value.trim();
    const ref = raw.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/) || raw.match(/^([$@][\w-]+)$/);
    const hslRef = raw.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    const t = { name: d.prop, mode: d.mode, raw, span: d.span, format: formatOf(raw) };
    if (ref) t.alias = ref[1];
    else if (hslRef) { t.alias = hslRef[2]; t.wrap = hslRef[1].toLowerCase(); t.wrapAlpha = hslRef[3]; t.span = null; }
    else if (looksColor(raw)) { const c = readOne(raw); if (!c) continue; Object.assign(t, c); }
    else continue;
    vars.set(`${t.name}|${t.mode}`, t);
    tokens.push(t);
  }
  const lookup = (name, m) => vars.get(`${name}|${m}`) || vars.get(`${name}|light`);
  const resolve = (t, seen = new Set()) => {
    if (t.hex || !t.alias) return t;
    if (seen.has(t)) return t;
    seen.add(t);
    const to = lookup(t.alias, t.mode);
    if (!to) return t;
    resolve(to, seen);
    if (t.wrap && to.raw) {
      const c = readOne(`${t.wrap}(${to.raw}${t.wrapAlpha ? ` / ${t.wrapAlpha}` : ''})`);
      if (c) Object.assign(t, c, { via: to.name });
    } else if (to.hex) Object.assign(t, { hex: to.hex, alpha: to.alpha, via: to.name });
    return t;
  };
  tokens.forEach((t) => resolve(t));

  // a value in a rule: a colour, a variable, or a colour inside a shorthand
  const valueOf = (raw, m, span) => {
    const v = raw.trim();
    if (/gradient\(|url\(/i.test(v)) return { image: true };
    const fn = v.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    if (fn) { const t = lookup(fn[2], m); const c = t?.raw && readOne(`${fn[1]}(${t.raw}${fn[3] ? ` / ${fn[3]}` : ''})`); return c ? { ...c, token: t.name } : null; }
    const vr = v.match(/var\(\s*(--[\w-]+)/) || v.match(/^([$@][\w-]+)$/);
    if (vr) { const t = lookup(vr[1], m); return t?.hex ? { hex: t.hex, alpha: t.alpha, token: t.name } : null; }
    const lit = (x, at) => { const c = readOne(x); return c && { ...c, raw: x, format: formatOf(x), span: span ? [span[0] + at, span[0] + at + x.length] : null }; };
    if (looksColor(v)) return lit(v, raw.indexOf(v));
    for (const part of v.split(/\s+(?![^(]*\))/)) if (looksColor(part)) return lit(part, raw.indexOf(part));
    return null;
  };
  const byBlock = new Map();
  for (const d of decls) {
    const kind = PROPS[d.prop.toLowerCase()];
    if (!kind && !/^font-(size|weight)$/i.test(d.prop)) continue;
    if (!d.prelude || d.prop.startsWith('--')) continue;
    let r = byBlock.get(d.block);
    if (!r) { r = { selector: d.prelude.replace(/\s+/g, ' ').slice(0, 120), mode: d.mode, scoped: d.scoped }; byBlock.set(d.block, r); }
    if (/^font-size$/i.test(d.prop)) { const px = toPx(d.value); if (px) r.fontSize = px; continue; }
    if (/^font-weight$/i.test(d.prop)) { const w = d.value.trim() === 'bold' ? 700 : Number(d.value); if (w) r.fontWeight = w; continue; }
    const v = valueOf(d.value, d.mode, d.span);
    if (v && (v.hex || v.image)) r[kind] = v;
  }
  for (const r of byBlock.values()) if (r.fg || r.bg || r.border || r.outline) rules.push(r);
  return { tokens: tokens.filter((t) => t.hex), rules };
}

function toPx(v) {
  const m = String(v).trim().match(/^([\d.]+)(px|rem|em|pt)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === 'px' ? n : m[2] === 'pt' ? n * 4 / 3 : n * 16;
}

/** JSON string leaves with their path and where the string sits in the text. */
function jsonLeaves(text) {
  const out = [];
  let i = 0;
  const ws = () => { while (/\s/.test(text[i] || '')) i++; };
  const str = () => { const s = i; i++; while (i < text.length && text[i] !== '"') { if (text[i] === '\\') i++; i++; } i++; return { value: JSON.parse(text.slice(s, i)), span: [s + 1, i - 1] }; };
  const val = (path) => {
    ws();
    const c = text[i];
    if (c === '{') {
      i++; ws();
      if (text[i] === '}') { i++; return; }
      for (;;) { ws(); const k = str().value; ws(); i++; val([...path, k]); ws(); if (text[i] === ',') { i++; continue; } i++; return; }
    }
    if (c === '[') {
      i++; ws();
      if (text[i] === ']') { i++; return; }
      for (let n = 0; ; n++) { val([...path, String(n)]); ws(); if (text[i] === ',') { i++; continue; } i++; return; }
    }
    if (c === '"') { const s = str(); out.push({ path, value: s.value, span: s.span }); return; }
    const m = text.slice(i).match(/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/);
    i += m ? m[0].length : 1;
  };
  val([]);
  return out;
}

const MODE_WORD = /^(light|dark|day|night|lightmode|darkmode|light-mode|dark-mode)$/i;
const modeOfWord = (w) => (/dark|night/i.test(w) ? 'dark' : 'light');

/** Design tokens: DTCG ($value), Style Dictionary (value), Figma variables, Tokens Studio, or any JSON of colours. */
export function readJson(text) {
  let data;
  try { data = JSON.parse(text); } catch { return null; }
  const tokens = [];
  // Figma variables: the REST API's meta.variables, or a plugin export with variables[] and valuesByMode
  const figma = data?.meta?.variables ? Object.values(data.meta.variables) : Array.isArray(data?.variables) ? data.variables : null;
  if (figma && figma.some((v) => v && v.valuesByMode)) {
    const modes = new Map();
    for (const col of Object.values(data?.meta?.variableCollections || {})) for (const m of col.modes || []) modes.set(m.modeId, m.name);
    for (const m of data.modes ? Object.entries(data.modes) : []) modes.set(m[0], m[1]?.name || m[1]);
    const byId = new Map(figma.map((v) => [v.id, v]));
    const rgbOf = (v, modeId, depth = 0) => {
      const x = v.valuesByMode?.[modeId] ?? Object.values(v.valuesByMode || {})[0];
      if (x && x.type === 'VARIABLE_ALIAS' && depth < 8) { const to = byId.get(x.id); return to ? rgbOf(to, modeId in (to.valuesByMode || {}) ? modeId : Object.keys(to.valuesByMode)[0], depth + 1) : null; }
      return x && typeof x.r === 'number' ? x : null;
    };
    for (const v of figma) {
      if (v.resolvedType && v.resolvedType !== 'COLOR') continue;
      for (const modeId of Object.keys(v.valuesByMode || {})) {
        const x = rgbOf(v, modeId);
        if (!x) continue;
        const c = readOne(`rgb(${Math.round(x.r * 255)} ${Math.round(x.g * 255)} ${Math.round(x.b * 255)})`);
        const mname = String(modes.get(modeId) || '');
        tokens.push({ name: String(v.name || v.id).replace(/\//g, '.'), ...c, alpha: x.a ?? 1, mode: /dark|night/i.test(mname) ? 'dark' : 'light', raw: null, span: null, format: 'hex' });
      }
    }
    return { kind: 'figma', tokens };
  }
  const leaves = jsonLeaves(text);
  const dtcg = leaves.some((l) => l.path[l.path.length - 1] === '$value');
  const sd = !dtcg && leaves.some((l) => l.path[l.path.length - 1] === 'value');
  const byName = new Map();
  for (const l of leaves) {
    let path = l.path;
    const last = path[path.length - 1];
    if (dtcg) { if (last !== '$value') continue; path = path.slice(0, -1); }
    else if (sd) { if (last !== 'value') continue; path = path.slice(0, -1); }
    const modeIdx = path.findIndex((p) => MODE_WORD.test(p));
    const mode = modeIdx >= 0 ? modeOfWord(path[modeIdx]) : 'light';
    const clean = path.filter((p, k) => k !== modeIdx && !/^\$/.test(p));
    const name = clean.join('.');
    const raw = String(l.value).trim();
    const t = { name, mode, raw, span: l.span, format: formatOf(raw) };
    const alias = raw.match(/^\{([^}]+)\}$/);
    if (alias) t.alias = alias[1];
    else if (looksColor(raw)) { const c = readOne(raw); if (!c) continue; Object.assign(t, c); }
    else continue;
    tokens.push(t);
    byName.set(`${name}|${mode}`, t);
  }
  // DTCG 2025: $value as an object { colorSpace, components, alpha, hex }
  if (dtcg) {
    const walk = (o, path) => {
      if (!o || typeof o !== 'object') return;
      if (o.$value && typeof o.$value === 'object' && (o.$value.hex || o.$value.components)) {
        const v = o.$value;
        const c = v.hex ? readOne(v.hex) : readOne(`color(${v.colorSpace || 'srgb'} ${v.components.join(' ')})`);
        const modeIdx = path.findIndex((p) => MODE_WORD.test(p));
        if (c) tokens.push({ name: path.filter((_, k) => k !== modeIdx).join('.'), ...c, alpha: v.alpha ?? 1, mode: modeIdx >= 0 ? modeOfWord(path[modeIdx]) : 'light', raw: null, span: null, format: 'hex' });
        return;
      }
      for (const [k, x] of Object.entries(o)) if (!k.startsWith('$')) walk(x, [...path, k]);
    };
    walk(data, []);
  }
  for (const t of tokens) {
    let x = t, n = 0;
    while (x && !x.hex && x.alias && n++ < 8) x = byName.get(`${x.alias}|${t.mode}`) || byName.get(`${x.alias}|light`);
    if (x?.hex && x !== t) Object.assign(t, { hex: x.hex, alpha: x.alpha, via: x.name });
  }
  return { kind: dtcg ? 'dtcg' : sd ? 'style-dictionary' : 'json', tokens: tokens.filter((t) => t.hex) };
}

/** A Tailwind config (JS object literal): every string colour under `colors`, named by its path (blue-500, primary). */
export function readTailwind(text) {
  const src = blankComments(text);
  const tokens = [];
  const path = [];
  const re = /(?:(['"`]?)([A-Za-z_$][\w$-]*|\d+)\1\s*:\s*(?:(\{)|(['"`])([^'"`\n]*)\4))|(\})/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[6]) { path.pop(); continue; }
    const key = m[2];
    if (m[3]) { path.push(key); continue; }
    const raw = m[5];
    const inColors = path.includes('colors') || path.includes('backgroundColor') || path.includes('textColor');
    if (!inColors || !looksColor(raw)) continue;
    const c = readOne(raw);
    if (!c) continue;
    const at = m.index + m[0].length - raw.length - 1;
    const p = [...path.slice(path.lastIndexOf('colors') + 1), key].filter((x) => x !== 'DEFAULT');
    tokens.push({ name: p.join('-'), ...c, mode: 'light', raw, span: [at, at + raw.length], format: formatOf(raw) });
  }
  return { tokens };
}

const ANY_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)/gi;

/** A list: colours anywhere in the text, each with the name written before it on its line ("primary: #2563eb"). */
export function readList(text) {
  const tokens = [];
  const seen = new Map();
  const add = (raw, start, name) => {
    const c = readOne(raw);
    if (!c) return;
    const n = (name || '').trim().replace(/[:=\s]+$/, '').replace(/^[-*•\s]+/, '').slice(0, 60) || `#${c.hex}`;
    if (seen.has(n)) { if (seen.get(n) === c.hex) return; }
    seen.set(n, c.hex);
    tokens.push({ name: n, ...c, mode: 'light', raw, span: [start, start + raw.length], format: formatOf(raw), unnamed: !name });
  };
  let m, found = 0;
  ANY_COLOR.lastIndex = 0;
  while ((m = ANY_COLOR.exec(text))) {
    found++;
    const lineStart = text.lastIndexOf('\n', m.index) + 1;
    const before = text.slice(lineStart, m.index);
    const nm = before.match(/([A-Za-z][\w .\-/]{0,50}?)\s*[:=]\s*$/);
    add(m[0], m.index, nm ? nm[1] : null);
  }
  if (!found) {
    // bare words: "ff5733 00adcc", "red, navy", "ff5733-00adcc"
    const re = /[^\s,;|]+/g;
    while ((m = re.exec(text))) {
      const parts = /^[0-9a-f]{6}(?:-[0-9a-f]{6})+$/i.test(m[0]) ? m[0].split('-') : [m[0]];
      let off = m.index;
      for (const p of parts) { if (/^[0-9a-f]{3,8}$/i.test(p) || CSS_NAMES.has(p.toLowerCase())) add(p, off, null); off += p.length + 1; }
    }
  }
  return { tokens };
}

/**
 * Read anything pasted into the checker. The answer: { kind, tokens, rules, warnings }. Tokens with the same name in
 * the light and the dark mode both stay, each with its mode.
 */
export function readInput(text, max = 200000) {
  const s = String(text || '').slice(0, max);
  const t = s.trim();
  let out;
  if (/^[{[]/.test(t)) {
    const j = readJson(t);
    if (j) out = { kind: j.kind, tokens: j.tokens.map((x) => ({ ...x, span: x.span ? [x.span[0] + s.indexOf(t), x.span[1] + s.indexOf(t)] : null })), rules: [] };
  }
  if (!out && /(module\.exports|export\s+default|\bcolors\s*:\s*\{)/.test(s) && !/--[\w-]+\s*:/.test(s)) {
    out = { kind: 'tailwind', ...readTailwind(s), rules: [] };
  }
  if (!out && /[{;]/.test(s) && /(--[\w-]+|\$[\w-]+|@[\w-]+|\b(?:color|background(?:-color)?))\s*:/.test(s)) {
    const c = readCss(s);
    out = { kind: /@theme\b/.test(s) ? 'tailwind4' : /\$[\w-]+\s*:/.test(s) ? 'scss' : /@[\w-]+\s*:/.test(s) && !/--[\w-]+\s*:/.test(s) ? 'less' : 'css', ...c };
  }
  if (!out || !out.tokens.length && !(out.rules || []).length) out = { kind: 'list', ...readList(s), rules: [] };
  const warnings = [];
  if (out.tokens.length > MAX_TOKENS) { warnings.push(`Only the first ${MAX_TOKENS} colors are checked.`); out.tokens = out.tokens.slice(0, MAX_TOKENS); }
  return { ...out, warnings };
}
