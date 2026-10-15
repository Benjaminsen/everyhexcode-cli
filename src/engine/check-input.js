// The colour checker's reader: whatever people paste (a list of colours, CSS with custom properties and rules, SCSS or
// Less variables, a Tailwind config, design tokens in W3C DTCG, Style Dictionary or a Figma variables export) becomes one
// list of named colour tokens, each with its light or dark mode and where its value sits in the text, so a fix can be
// written back into the same text. CSS rules that set both a text and a background colour are kept as declared pairs.
import { parseColor } from './parse.js';
import { formatHex, interpolate, parse as cparse } from 'culori/fn';

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
const FN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
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
  if (v.startsWith('#')) return v.length <= 5 || v.length === 7 ? (/[A-F]/.test(raw) && !/[a-f]/.test(raw) ? 'HEX' : 'hex') : 'hex8';
  if (BARE_HSL.test(v)) return 'hsl-bare';
  const m = v.match(/^([a-z]+)\(/);
  if (m) return m[1].replace(/a$/, '') + (/,/.test(v) ? '-legacy' : '');
  return 'name';
}

/** color-mix(in <space>, a p%, b q%) worked out as browsers do it (CSS Color 5), or null. */
function mix(v) {
  const m = /^color-mix\(\s*in\s+([\w-]+)(?:\s+(?:shorter|longer|increasing|decreasing)\s+hue)?\s*,(.*)\)$/i.exec(v.trim());
  if (!m) return null;
  const parts = []; let depth = 0, cur = '';
  for (const ch of m[2]) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { parts.push(cur); cur = ''; } else cur += ch; }
  parts.push(cur);
  if (parts.length !== 2) return null;
  const one = (x) => { const pm = x.trim().match(/^(.*?)(?:\s+([\d.]+)%)?$/s); return { c: parseColor(pm[1].trim()), p: pm[2] != null ? Number(pm[2]) : null }; };
  const a = one(parts[0]), b = one(parts[1]);
  if (!a.c.hex || !b.c.hex) return null;
  let pa = a.p, pb = b.p;
  if (pa == null && pb == null) { pa = 50; pb = 50; } else if (pa == null) pa = 100 - pb; else if (pb == null) pb = 100 - pa;
  const sum = pa + pb;
  if (sum <= 0) return null;
  const space = { srgb: 'rgb', 'srgb-linear': 'lrgb', oklab: 'oklab', oklch: 'oklch', lab: 'lab', lch: 'lch', hsl: 'hsl', hwb: 'hwb', xyz: 'xyz65', 'xyz-d65': 'xyz65', 'display-p3': 'p3' }[m[1].toLowerCase()] || 'oklab';
  const ca = cparse('#' + a.c.hex), cb = cparse('#' + b.c.hex);
  ca.alpha = a.c.alpha ?? 1; cb.alpha = b.c.alpha ?? 1;
  const out = interpolate([ca, cb], space)(pb / sum);
  return { hex: formatHex(out).slice(1), alpha: Math.round(Math.min(1, out.alpha ?? 1) * (sum < 100 ? sum / 100 : 1) * 1000) / 1000 };
}

const readOne = (raw) => {
  if (/^color-mix\(/i.test(String(raw).trim())) return mix(raw);
  const r = parseColor(String(raw).trim());
  return r.hex ? { hex: r.hex, alpha: r.alpha ?? 1 } : null;
};

/** Comments out, offsets kept: each comment becomes spaces of the same length. */
function blankComments(s, line = true) {
  let out = s.replace(/\/\*[^]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  if (line) out = out.replace(/(^|[^:"'(\w\/])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
  return out;
}

const DARK_SEL = /\.dark\b|\[data-(?:[\w-]*theme|mode|color-scheme)=["']?dark|\.theme-dark|\bdark-theme\b|\[theme=["']?dark/i;
const DARK_MEDIA = /prefers-color-scheme\s*:\s*dark/i;
const LIGHT_SEL = /\.light\b|\[data-(?:theme|mode|color-scheme)=["']?light|prefers-color-scheme\s*:\s*light/i;

// where a custom property is a design token: at the top, under :root, html, body, a theme class or attribute, or inside
// @media, @supports, @layer or @theme around those. One set inside a component (.card { --bg: … }) is that component's.
const MODE_ATTR = '\\[data-(?:[\\w-]*theme|mode|color-scheme)(?:=["\']?(?:light|dark)["\']?)?\\]';
const GLOBAL_PART = new RegExp(`^((:root|html|body|:host|\\*)?(${MODE_ATTR}|\\.(dark|light)(-theme|-mode)?|:not\\(\\.dark\\)|:not\\(\\.light\\)|:not\\(${MODE_ATTR}\\))*|:root|html|body|:host|\\*|\\.dark|\\.light)$`, 'i');
export function isGlobalScope(prelude) {
  const p = String(prelude || '').trim();
  if (!p || /^@(media|supports|layer|theme|container|document|scope)\b/i.test(p)) return true;
  if (p.startsWith('@')) return false;
  // a list that includes the root (":root, :root:has(…), [data-theme=light]") applies to the page: it is global
  return p.split(',').some((x) => GLOBAL_PART.test(x.trim().replace(/\s+/g, ' ')) || /^(:root|html)\s+(body)?$/.test(x.trim()));
}

const PROPS = {
  color: 'fg', 'background-color': 'bg', background: 'bg', 'border-color': 'border', border: 'border', 'border-top': 'border',
  'border-bottom': 'border', outline: 'outline', 'outline-color': 'outline', fill: 'fill', stroke: 'stroke', 'caret-color': 'caret',
  'text-decoration-color': 'decoration', 'column-rule-color': 'border',
};

/** CSS, SCSS and Less: custom properties and variables become tokens; rules keep the colours they set. */
export function readCss(text) {
  // // comments exist only in SCSS and Less; in plain CSS a // is part of a url(), so only those files lose them
  const src = blankComments(text, /^\s*[$@][\w-]+\s*:/m.test(text) && !/^\s*@(media|supports|import|font-face|layer|container|charset|keyframes)\b/m.test(text.slice(0, 0)));
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
    if (stack.some((p) => /^@media\b[^{]*\bprint\b/i.test(p) && !/screen/i.test(p))) return; // print styles never reach a screen
    decls.push({ prop: m[1], value: val, span: [vs, ve], depth: stack.length, prelude: stack[stack.length - 1] || '', global: stack.every(isGlobalScope), mode: mode(), scoped: stack.some((p) => LIGHT_SEL.test(p)), block: blockId });
  };
  let blockId = 0, blockSeq = 0; const blockStack = [];
  let quote = null, paren = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') { i++; continue; } // an escaped character (Tailwind's .\[\&\>svg\:not\(…) is never a quote, a bracket or a brace
    if (quote) { if (ch === quote) quote = null; continue; }
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
  // a file of themes only (.theme-zinc { … } .theme-rose { … }): its first theme stands in for the default
  let firstTheme = null;
  if (!decls.some((d) => d.global && d.prop.startsWith('--') && looksColor(d.value.trim()))) {
    const d0 = decls.find((d) => d.prop.startsWith('--') && looksColor(d.value.trim()) && /theme|\[data-[\w-]*(theme|mode)|color-scheme/i.test(d.prelude));
    const key = d0 && (d0.prelude.match(/\.[\w-]+|\[data-[\w-]+=["']?[\w-]+["']?\]/) || [])[0];
    if (key) { firstTheme = key; for (const d of decls) if (d.prelude.includes(key)) { d.global = true; if (DARK_SEL.test(d.prelude) && !DARK_SEL.test(key)) d.mode = 'dark'; } }
  }
  const vars = new Map(); // name|mode → token
  const themeScopes = new Set();
  const scoped = new Map(); // block|name → raw value, for var() inside that component's own rules
  const keep = (t) => { const k = `${t.name}|${t.mode}`; const was = vars.get(k); if (was) was.dropped = true; vars.set(k, t); tokens.push(t); };
  for (const d of decls) {
    if (d.prop.startsWith('--tw-')) continue; // Tailwind's internal variables (ring offsets, gradients stops), not the design's colours
    const isVar = d.prop.startsWith('--') || ((d.prop.startsWith('$') || (d.prop.startsWith('@') && !/^@(media|supports|import|font-face|keyframes|layer|theme|container|tailwind|apply|use|forward|include|mixin|function|return|if|else|each|for|while|charset|namespace|page)$/.test(d.prop))) && d.depth <= 1);
    if (!isVar) continue;
    const raw = d.value.trim();
    if (d.prop.startsWith('--') && !d.global) { scoped.set(`${d.block}|${d.prop}`, raw); if (/theme|\[data-/i.test(d.prelude) && looksColor(raw)) themeScopes.add(d.prelude.replace(/\s+/g, ' ').slice(0, 60)); continue; }
    const ref = raw.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/) || raw.match(/^([$@][\w-]+)$/);
    const hslRef = raw.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    // light-dark(a, b): one value per mode, each written back where it stands
    const ld = splitLightDark(raw);
    if (ld) {
      for (const [m, part] of [['light', ld[0]], ['dark', ld[1]]]) {
        if (!looksColor(part.text)) continue;
        const c = readOne(part.text);
        if (!c) continue;
        const at = d.span[0] + part.at;
        const tk = { name: d.prop, mode: m, raw: part.text, span: [at, at + part.text.length], format: formatOf(part.text), ...c };
        keep(tk);
      }
      continue;
    }
    const t = { name: d.prop, mode: d.mode, raw, span: d.span, format: formatOf(raw) };
    if (ref) { t.alias = ref[1]; if (ref[2] && looksColor(ref[2])) t.fallback = ref[2].trim(); }
    else if (hslRef) { t.alias = hslRef[2]; t.wrap = hslRef[1].toLowerCase(); t.wrapAlpha = hslRef[3]; t.span = null; }
    else if (looksColor(raw)) { const c = readOne(raw); if (!c) continue; Object.assign(t, c); }
    else continue;
    keep(t);
  }
  // a later definition of the same name in the same mode wins, as in the cascade
  for (let i = tokens.length - 1; i >= 0; i--) if (tokens[i].dropped) tokens.splice(i, 1);
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
  // var(--missing, #999): the fallback is what the browser uses
  for (const t of tokens) if (!t.hex && t.fallback) { const c = readOne(t.fallback); if (c) Object.assign(t, c); }
  // var() resolves where it is used: an alias set once (Tailwind v4's @theme --color-background: var(--background))
  // follows its target into dark mode when only the target is redefined there
  if (tokens.some((t) => t.mode === 'dark')) {
    for (const t of tokens.filter((x) => x.mode === 'light' && x.alias && !vars.has(`${x.name}|dark`))) {
      const to = vars.get(`${t.alias}|dark`);
      if (!to) continue;
      resolve(to);
      const c = t.wrap && to.raw ? readOne(`${t.wrap}(${to.raw}${t.wrapAlpha ? ` / ${t.wrapAlpha}` : ''})`) : to.hex ? { hex: to.hex, alpha: to.alpha } : null;
      if (c) { const d = { ...t, ...c, mode: 'dark', span: null, via: to.name }; vars.set(`${t.name}|dark`, d); tokens.push(d); }
    }
  }

  // a value in a rule: a colour, a variable, or a colour inside a shorthand
  const valueOf = (raw, m, span, block, depth = 0) => {
    const v = raw.trim();
    if (/gradient\(|url\(/i.test(v)) return { image: true };
    const fn = v.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    if (fn) { const t = lookup(fn[2], m); const c = t?.raw && readOne(`${fn[1]}(${t.raw}${fn[3] ? ` / ${fn[3]}` : ''})`); return c ? { ...c, token: t.name } : null; }
    const vr = v.match(/var\(\s*(--[\w-]+)/) || v.match(/^([$@][\w-]+)$/);
    if (vr) {
      // a variable the component sets for itself resolves there first
      const sv = block != null && depth < 6 && scoped.get(`${block}|${vr[1]}`);
      if (sv) { const inner = valueOf(sv, m, null, block, depth + 1); return inner ? { ...inner, token: undefined, span: null, raw: undefined } : null; }
      const t = lookup(vr[1], m); return t?.hex ? { hex: t.hex, alpha: t.alpha, token: t.name } : null;
    }
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
    const ldv = splitLightDark(d.value.trim());
    if (ldv) {
      // a rule value that differs by mode: the light one here, the dark one on a twin rule kept for dark mode only
      const off = d.value.indexOf(d.value.trim());
      const lv = valueOf(ldv[0].text, 'light', [d.span[0] + off + ldv[0].at, 0], d.block), dv = valueOf(ldv[1].text, 'dark', [d.span[0] + off + ldv[1].at, 0], d.block);
      if (lv) { r[kind] = lv; r.scoped = true; }
      let twin = byBlock.get(`${d.block}|dark`);
      if (!twin) { twin = { selector: r.selector, mode: 'dark', scoped: true, twinOf: r }; byBlock.set(`${d.block}|dark`, twin); }
      if (dv) twin[kind] = dv;
      continue;
    }
    const v = valueOf(d.value, d.mode, d.span, d.block);
    if (v && (v.hex || v.image)) { r[kind] = v; const tw = byBlock.get(`${d.block}|dark`); if (tw && !tw[kind]) tw[kind] = v; }
  }
  for (const r of byBlock.values()) {
    if (r.twinOf) for (const k of ['fg', 'bg', 'border', 'outline', 'fontSize', 'fontWeight']) if (r[k] === undefined && r.twinOf[k] !== undefined) r[k] = r.twinOf[k];
    if (r.fg || r.bg || r.border || r.outline) rules.push(r);
  }
  const notes = firstTheme ? [`Only the first theme, ${firstTheme}, is checked${themeScopes.size ? `; ${themeScopes.size} other theme ${themeScopes.size === 1 ? 'scope is' : 'scopes are'} not` : ''}. Paste one theme at a time to check another.`] : themeScopes.size ? [`${themeScopes.size} other theme ${themeScopes.size === 1 ? 'scope was' : 'scopes were'} not checked (${[...themeScopes].slice(0, 3).join(', ')}${themeScopes.size > 3 ? ', …' : ''}): only the default light and dark colors are. Paste one theme at a time to check it.`] : [];
  return { tokens: tokens.filter((t) => t.hex), rules, notes, vars: decls.filter((d) => d.prop.startsWith('--')).length };
}

/** light-dark(a, b) → [{ text, at }, { text, at }] (offsets inside the value), or null. */
export function splitLightDark(v) {
  const m = /^light-dark\(/i.exec(v);
  if (!m || !v.endsWith(')')) return null;
  const inner = v.slice(m[0].length, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '(') depth++; else if (c === ')') depth--;
    else if (c === ',' && !depth) {
      const a = inner.slice(0, i), b = inner.slice(i + 1);
      const at0 = m[0].length + (a.length - a.trimStart().length), at1 = m[0].length + i + 1 + (b.length - b.trimStart().length);
      return [{ text: a.trim(), at: at0 }, { text: b.trim(), at: at1 }];
    }
  }
  return null;
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
/** JSON5 and JSON with comments (Primer, Tokens Studio): comments, unquoted keys, single quotes and trailing commas made plain JSON. */
function json5(text) {
  let out = '', i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'") { let j = i + 1, str = ''; while (j < text.length && text[j] !== c) { if (text[j] === '\\') { str += text[j] + text[j + 1]; j += 2; continue; } str += text[j] === '"' ? '\\"' : text[j]; j++; } out += '"' + str + '"'; i = j + 1; continue; }
    if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? text.length : e + 2; continue; }
    if (/[A-Za-z_$]/.test(c) && /[{,]\s*$/.test(out)) { const m = /^[A-Za-z_$][\w$-]*/.exec(text.slice(i)); const after = text.slice(i + m[0].length).match(/^\s*:/); if (after) { out += '"' + m[0] + '"'; i += m[0].length; continue; } }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

export function readJson(text) {
  let data, converted = false;
  try { data = JSON.parse(text); } catch {
    try { const plain = json5(text); data = JSON.parse(plain); text = plain; converted = true; } catch { return null; }
  }
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
  const dtcg = leaves.some((l) => l.path[l.path.length - 1] === '$value') || /"\$value"\s*:\s*\{/.test(text);
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
        const sp = String(v.colorSpace || 'srgb').toLowerCase(), k = (v.components || []).map((x) => (x === 'none' ? 0 : Number(x)));
        const css = ['oklch', 'oklab', 'lab', 'lch', 'hwb'].includes(sp) ? `${sp}(${k.join(' ')})` : sp === 'hsl' ? `hsl(${k[0]} ${k[1]}% ${k[2]}%)` : `color(${sp} ${k.join(' ')})`;
        const c = v.hex ? readOne(v.hex) : readOne(css);
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
  // JSON5 was read through a plain-JSON copy, so positions do not match the file: fixes are listed, not written
  if (converted) for (const t of tokens) t.span = null;
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
  if (found) {
    // CSS colour names written beside functional colours ("rgb(0 0 0 / 50%), white")
    const taken = tokens.map((t) => t.span);
    const re = /(?<![\w#(-])([a-z]+)(?![\w(-])/gi;
    while ((m = re.exec(text))) if (CSS_NAMES.has(m[1].toLowerCase()) && !taken.some(([a, b]) => m.index >= a && m.index < b) && !/[:=]\s*$/.test(text.slice(text.lastIndexOf('\n', m.index) + 1, m.index)) && !/[:=]/.test(text.slice(m.index + m[1].length, text.indexOf('\n', m.index) < 0 ? undefined : text.indexOf('\n', m.index)))) add(m[1], m.index, null);
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
  if (!out || (!out.tokens.length && !(out.rules || []).length && !out.vars)) out = { kind: 'list', ...readList(s), rules: [] };
  const warnings = [...(out.notes || [])];
  if (out.tokens.length > MAX_TOKENS) {
    // keep the named roles (background, text, primary…) before the steps of colour scales (red-50 … red-950)
    const step = (t) => (/(^|[-_.])(background|bg|foreground|fg|text|surface|border|primary|accent|muted|card|ring|input|link|destructive|error|success|warning)([-_.]|$)/i.test(t.name) ? 0 : /[-_.](50|[1-9]00|950|[1-9]|1[0-2])$/.test(t.name) ? 2 : 1);
    out.tokens = out.tokens.map((t, i) => [t, i]).sort((a, b) => step(a[0]) - step(b[0]) || a[1] - b[1]).slice(0, MAX_TOKENS).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
    warnings.push(`Only ${MAX_TOKENS} of the colors are checked: the named ones first, then scale steps.`);
  }
  return { ...out, warnings };
}
