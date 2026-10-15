// The colour checker: from the tokens shared/check-input.js reads, it works out what each colour is for (text,
// background, border, accent), which colours really meet, and judges each pair by WCAG 2 (the standard), with APCA as an
// advisory value when the caller passes it in (shared/apca.js; the command-line build leaves it out). It simulates colour
// vision and glare, finds colours that must be told apart but look alike, reads the palette's feel, and fixes the whole
// palette at once, written back as a diff of the text that was pasted. All of it is computed; nothing is stored.
import { converter, differenceEuclidean, filterDeficiencyDeuter, filterDeficiencyProt, filterDeficiencyTrit, formatHex, parse as cparse, toGamut, wcagContrast, wcagLuminance } from 'culori/fn';
import { contrast, info, moods, textOn } from './color.js';
import { readInput } from './check-input.js';

const okDist = differenceEuclidean('oklab');
const toOklch = converter('oklch');
const toRgb = converter('rgb');
const toSrgb = toGamut('rgb', 'oklch');
const col = (hex) => cparse('#' + hex);
const r1 = (n, d = 0) => { const f = 10 ** d; const v = Math.round(n * f) / f; return Object.is(v, -0) ? 0 : v; };
const fromOklch = (l, c, h) => formatHex(toSrgb({ mode: 'oklch', l: Math.max(0, Math.min(1, l)), c, h })).slice(1);
const dE = (a, b) => r1(okDist(col(a), col(b)) * 100, 1);

export const VERSION = '1.0.0';
export const MAX_PAIRS = 400;

// ---------------------------------------------------------------------------------------------------------------- roles

const BG_WORDS = ['background', 'bg', 'surface', 'canvas', 'card', 'popover', 'paper', 'page', 'backdrop', 'layer', 'container', 'sheet', 'panel', 'well', 'sidebar', 'header', 'footer', 'nav', 'modal', 'dialog', 'menu', 'tooltip', 'overlay', 'fill'];
const FG_WORDS = ['foreground', 'fg', 'text', 'ink', 'on', 'label', 'heading', 'title', 'copy', 'content', 'caption', 'placeholder', 'icon', 'font', 'type'];
const BORDER_WORDS = ['border', 'outline', 'ring', 'divider', 'stroke', 'separator', 'input', 'focus', 'hairline', 'rule'];
const ACCENT_WORDS = ['primary', 'secondary', 'tertiary', 'accent', 'brand', 'link', 'info', 'success', 'warning', 'warn', 'danger', 'error', 'destructive', 'positive', 'negative', 'critical', 'caution', 'notice', 'highlight', 'attention', 'neutral', 'muted', 'subtle'];
const STATUS = ['info', 'success', 'warning', 'warn', 'danger', 'error', 'destructive', 'positive', 'negative', 'critical', 'caution', 'notice'];
// a utility class (Tailwind, Bootstrap) that sets one colour says nothing about where it is used: only rules that set
// text and background together are taken from those
const UTILITY = /^\.(?:[\w-]+\\:)*(?:text|bg|border|fill|stroke|from|via|to|ring|outline|decoration|placeholder|caret|accent|divide|shadow|link|btn-outline|bg-gradient)-[\w\\/.\[\]#-]+(?::[\w-]+)*$/;
const SCALE_STEP = /^(50|[1-9]00|950|[1-9]|1[0-2]|[1-9]0|a?[1-9]00)$/i;

/** "--md-sys-color-on-primary-container" → ["on", "primary", "container"]; camelCase and dots split too. */
export function words(name) {
  return String(name).replace(/^(--|\$|@)/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    .split(/[-_./\s]+/).filter((w) => w && !['md', 'sys', 'ref', 'color', 'colors', 'colour', 'theme', 'tw', 'semantic', 'global', 'default', 'token', 'tokens', 'value', 'chakra', 'mantine', 'bs', 'ui', 'sl'].includes(w));
}

/**
 * What a token is for, from its name: background, text (and on what), border, accent, chart, or scale step. A name
 * without a role word gets one from its lightness later (bare palettes).
 */
// a design system's raw scales (color.base.gray-900, primitives.blue.500, palette.red): values other tokens point to,
// never a pair of their own
const PRIMITIVE = /(^|[.\-_/])(base|primitives?|palette|core|ref|ramps?|scales?|raw|swatch(es)?)[.\-_/]./i;

export function roleOf(name) {
  const w = words(name);
  if (!w.length) return { role: null };
  if (PRIMITIVE.test(String(name).replace(/^(--|\$|@)/, '')) && !w.some((x) => ['on', 'foreground', 'fg', 'text', 'background', 'bg', 'surface', 'border'].includes(x))) return { role: 'scale', primitive: true };
  const has = (list) => w.some((x) => list.includes(x));
  const last = w[w.length - 1];
  // chart-1, series-3, data-2, categorical
  if (/^(chart|series|data|categorical|viz|graph|plot)$/.test(w[0]) || w.includes('chart')) return { role: 'chart' };
  // on-primary, on-surface-variant (Material), primary-foreground (shadcn), text-on-accent
  const onIdx = w.indexOf('on');
  if (onIdx >= 0 && onIdx < w.length - 1) return { role: 'text', on: w.slice(onIdx + 1).join('-'), why: 'named on-…' };
  if (w.length > 1 && ['foreground', 'fg', 'contrast', 'text', 'content', 'ink', 'icon'].includes(last) && !FG_WORDS.includes(w[0])) {
    return { role: 'text', on: w.slice(0, -1).join('-'), why: `named …-${last}` };
  }
  if (has(BORDER_WORDS)) return { role: has(['input', 'ring', 'focus']) ? 'control' : 'border' };
  if (FG_WORDS.includes(w[0]) && w.length > 1 && !has(BG_WORDS)) return { role: 'text', sub: w.slice(1).join('-') };
  if (has(FG_WORDS) && !has(BG_WORDS)) return { role: 'text' };
  if (has(BG_WORDS)) return { role: 'bg', accent: has(ACCENT_WORDS) };
  if (SCALE_STEP.test(last) && w.length > 1) return { role: 'scale', stem: w.slice(0, -1).join('-') };
  if (has(STATUS)) return { role: 'accent', status: true };
  if (has(ACCENT_WORDS)) return { role: 'accent', muted: has(['muted', 'subtle', 'neutral']) };
  return { role: null };
}

const L = (hex) => toOklch(col(hex)).l;
const C = (hex) => toOklch(col(hex)).c || 0;
const H = (hex) => toOklch(col(hex)).h || 0;

/** A colour with alpha, laid over its background, is the colour the eye gets. */
export function over(hex, alpha, bg) {
  if (alpha == null || alpha >= 1) return hex;
  const a = toRgb(col(hex)), b = toRgb(col(bg));
  const m = (x, y) => x * alpha + y * (1 - alpha);
  return formatHex({ mode: 'rgb', r: m(a.r, b.r), g: m(a.g, b.g), b: m(a.b, b.b) }).slice(1);
}

// ---------------------------------------------------------------------------------------------------------------- targets

/** What each kind of pair needs. WCAG 2 AA and AAA are the standard; "APCA" is advisory only. */
export const TARGETS = {
  AA: { text: 4.5, large: 3, ui: 3, label: 'WCAG 2 AA' },
  AAA: { text: 7, large: 4.5, ui: 3, label: 'WCAG 2 AAA' },
};
const KIND_LABEL = { text: 'text', large: 'large text', ui: 'UI part', decor: 'decoration' };
export const kindLabel = (k) => KIND_LABEL[k] || k;
/** Whether text of this size and weight is "large" in WCAG 2: 24px, or 18.66px bold. */
export const isLarge = (px, weight = 400) => px >= 24 || (weight >= 700 && px >= 18.66);
const needOf = (kind, target) => (kind === 'decor' ? 0 : (TARGETS[target] || TARGETS.AA)[kind] ?? 4.5);

// ---------------------------------------------------------------------------------------------------------------- vision

export const VISION = [
  { id: 'protanopia', label: 'Protanopia', note: 'no red cones, about 1% of men', f: (c) => filterDeficiencyProt(1)(c) },
  { id: 'deuteranopia', label: 'Deuteranopia', note: 'no green cones, about 1% of men', f: (c) => filterDeficiencyDeuter(1)(c) },
  { id: 'tritanopia', label: 'Tritanopia', note: 'no blue cones, rare', f: (c) => filterDeficiencyTrit(1)(c) },
  { id: 'protanomaly', label: 'Protanomaly', note: 'weak red cones, about 1% of men', f: (c) => filterDeficiencyProt(0.6)(c) },
  { id: 'deuteranomaly', label: 'Deuteranomaly', note: 'weak green cones, about 5% of men, the most common', f: (c) => filterDeficiencyDeuter(0.6)(c) },
  { id: 'tritanomaly', label: 'Tritanomaly', note: 'weak blue cones, rare', f: (c) => filterDeficiencyTrit(0.6)(c) },
  { id: 'achromatopsia', label: 'Achromatopsia', note: 'no color at all, very rare', f: (c) => ({ mode: 'oklch', l: toOklch(c).l, c: 0, h: 0 }) },
];
const simCache = new Map();
/** How a colour looks with one kind of colour vision. */
export function seeAs(hex, id) {
  const k = `${hex}|${id}`;
  let v = simCache.get(k);
  if (!v) {
    const t = VISION.find((x) => x.id === id);
    v = formatHex(toSrgb(t.f(col(hex)))).slice(1);
    if (simCache.size > 20000) simCache.clear();
    simCache.set(k, v);
  }
  return v;
}

/** Contrast in bright light: a veil of reflected light (a share of white) added to both colours. */
export function glareRatio(a, b, veil = 0.1) {
  const la = wcagLuminance(col(a)) + veil, lb = wcagLuminance(col(b)) + veil;
  return r1((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05), 2);
}

// ---------------------------------------------------------------------------------------------------------------- pairs

/**
 * The tokens with their roles, per mode, and the pairs to judge: declared in CSS rules, implied by names
 * (primary-foreground on primary, text on background), or chosen by lightness for a bare palette. `opts.roles` sets
 * a token's role by name; `opts.pairs` adds pairs [text, background, kind].
 */
export function plan(read, opts = {}) {
  const tokens = read.tokens.map((t, i) => ({ ...t, id: i, ...roleOf(t.name) }));
  // a dark mode that overrides only some names keeps the light value of the rest (CSS cascade): those come along,
  // marked inherited, and are never moved by a fix (moving one would change the light mode too)
  if (tokens.some((t) => t.mode === 'dark') && tokens.some((t) => t.mode === 'light')) {
    const dark = new Set(tokens.filter((t) => t.mode === 'dark').map((t) => t.name));
    for (const t of tokens.filter((x) => x.mode === 'light' && !dark.has(x.name))) tokens.push({ ...t, id: tokens.length, mode: 'dark', inherited: true, span: null });
  }
  for (const t of tokens) {
    const r = opts.roles?.[t.name] || opts.roles?.['#' + t.hex] || opts.roles?.[t.hex];
    if (r) { Object.assign(t, { role: r === 'ignore' ? 'ignore' : r, why: 'set by you', on: undefined, sub: undefined }); }
  }
  // "muted" and "subtle" alone are a pale surface in some systems (shadcn's --muted) and grey text in others: the light
  // mode's lightness decides, and the role holds in every mode (dark --muted is still a surface)
  const mutedRole = new Map();
  for (const t of [...tokens].sort((a, b) => (a.mode === 'light' ? -1 : 1) - (b.mode === 'light' ? -1 : 1))) {
    if (t.role !== 'accent' || !t.muted || t.why === 'set by you') continue;
    if (!mutedRole.has(t.name)) mutedRole.set(t.name, (t.mode === 'dark' ? L(t.hex) < 0.3 : L(t.hex) > 0.85) ? 'bg' : 'text');
    t.role = mutedRole.get(t.name); t.why = t.role === 'bg' ? 'muted: a surface' : 'muted: text';
  }
  // Bootstrap's --bs-body-color, --bs-secondary-color: "<x>-color" beside "<x>-bg" is the text colour on that background
  for (const t of tokens) {
    const m = String(t.name).match(/^(.*?)[-_]colou?r$/);
    if (!m || t.why === 'set by you' || t.role === 'text') continue;
    const bgTok = tokens.find((x) => x.mode === t.mode && (x.name === `${m[1]}-bg` || x.name === `${m[1]}-bg-color` || x.name === `${m[1]}-background`));
    if (bgTok) { t.role = 'text'; t.on = words(bgTok.name).join('-'); t.why = `beside ${bgTok.name}`; }
  }
  // Tailwind v4's --color-background: var(--background) is the same colour under a second name: one of them is judged
  const key = (t) => `${words(t.name).join('-')}|${t.mode}`;
  const byKey = new Map();
  for (const t of tokens) if (!t.via) byKey.set(key(t), t);
  for (const t of tokens) if (t.via && byKey.has(key(t)) && byKey.get(key(t)) !== t && byKey.get(key(t)).hex === t.hex) { t.role = 'ignore'; t.why = `the same as ${byKey.get(key(t)).name}`; }
  const modes = [...new Set([...tokens.map((t) => t.mode), ...(read.rules || []).map((r) => r.mode)])].sort((a, b) => (a === 'light' ? -1 : b === 'light' ? 1 : 0));
  const pairs = [];
  const seen = new Map();
  const add = (fg, bg, kind, why, extra = {}) => {
    if (!fg || !bg || fg === bg || fg.role === 'ignore' || bg.role === 'ignore') return;
    // a fully transparent colour paints nothing; a token that points to the other one is the same colour, not a pair
    if (fg.alpha === 0 || bg.alpha === 0 || fg.via === bg.name || bg.via === fg.name) return;
    // an alias (--color-background: var(--background), {color.base.gray-900}) is judged and fixed as its source
    const asFg = fg, asBg = bg;
    fg = canon(fg); bg = canon(bg);
    if (fg === bg) return;
    if (asFg !== fg) extra = { ...extra, asFg: asFg.name };
    if (asBg !== bg) extra = { ...extra, asBg: asBg.name };
    // the same colour on itself is never a design's pair (hidden text, a border that is the fill): only a pair you
    // declare is judged then
    if (fg.hex === bg.hex && (fg.alpha ?? 1) === (bg.alpha ?? 1) && why !== 'declared by you') return;
    const key = `${fg.id}>${bg.id}`;
    if (seen.has(key)) { const p = seen.get(key); if (p && rank(kind) > rank(p.kind)) Object.assign(p, { kind, why }); return; }
    const p = { key, fg, bg, kind, why, mode: fg.mode, ...extra };
    seen.set(key, p);
    pairs.push(p);
  };
  const rank = (k) => ({ text: 3, large: 2, ui: 1, decor: 0 })[k] ?? 0;
  const pairsLater = [];
  const byName = new Map(tokens.map((t) => [`${t.name}|${t.mode}`, t]));
  const canon = (t) => { let x = t, n = 0; while (x.via && n++ < 8) { const y = byName.get(`${x.via}|${x.mode}`) || byName.get(`${x.via}|light`); if (!y || y === x || y.role === 'ignore') break; x = y; } return x; };

  for (const mode of modes) {
    const all = tokens.filter((t) => t.mode === mode && t.role !== 'ignore');
    const named = new Map(all.map((t) => [words(t.name).join('-'), t]));
    // no roles to go on (a bare list, or a small set of raw colours such as a token file's core palette): lightness decides
    const unnamed = all.every((t) => t.unnamed || t.role == null) || (all.length <= 12 && all.every((t) => t.role === 'scale' || t.role == null));
    // a bare palette: roles by lightness (the lightest is the background, the darkest the text)
    if (unnamed && !read.rules?.length) {
      const by = [...all].sort((a, b) => L(b.hex) - L(a.hex));
      const light = by[0], dark = by[by.length - 1];
      for (const t of all) {
        if (t.why === 'set by you') continue;
        t.role = t === light ? 'bg' : t === dark ? 'text' : C(t.hex) > 0.04 ? 'accent' : L(t.hex) > 0.8 ? 'bg' : L(t.hex) < 0.35 ? 'text' : 'accent';
        t.why = t === light ? 'lightest' : t === dark ? 'darkest' : 'by lightness';
      }
    }
    const bgs = all.filter((t) => t.role === 'bg' && !t.accent);
    const modeRules = (read.rules || []).filter((x) => (x.mode === mode || (mode === 'dark' && x.mode === 'light' && !x.scoped)));
    // the page's own background, when a stylesheet sets it on html, body or :root and no token names one
    const pageRule = [...modeRules].reverse().find((x) => PAGE_SEL.test(x.selector) && x.bg && !x.bg.image && x.bg.alpha !== 0);
    let main = bgs.length ? pickMain(bgs, mode) : null;
    if (!main && pageRule) main = pageRule.bg.token ? all.find((t) => t.name === pageRule.bg.token) : synth(tokens, pageRule.bg, mode, pageRule.selector);
    if (!main) main = pickMain(all, mode);
    // CSS that sets text colours but no background at all: the browser's white page is what they sit on
    if (!main && mode === 'light' && modeRules.some((x) => x.fg)) { main = synth(tokens, { hex: 'ffffff', alpha: 1 }, mode, 'the browser default'); main.name = 'page background (white, the browser default)'; main.span = null; }
    // a page background with no text colour set on the page: the browser's default text is what sits on it
    if (pageRule && main && !modeRules.some((x) => PAGE_SEL.test(x.selector) && x.fg)) {
      const dflt = synth(tokens, { hex: mode === 'dark' ? 'ffffff' : '000000', alpha: 1 }, mode, 'the browser default');
      dflt.name = mode === 'dark' ? 'default text (white)' : 'default text (black)'; dflt.span = null;
      pairsLater.push([dflt, main]);
    }
    const texts = all.filter((t) => t.role === 'text');
    // 1. CSS rules: what a selector really sets
    for (const [a, b] of pairsLater.splice(0)) add(a, b, 'text', "the browser's default text on the page background");
    for (const r of modeRules.filter((x) => !(UTILITY.test(x.selector) && !(x.fg && x.bg)) && !(mode === 'dark' && x.mode === 'light' && ![x.fg, x.bg, x.border, x.outline].some((v) => v?.token)))) {
      const tok = (v) => (v && !v.image ? (all.find((t) => t.name === v.token) || synth(tokens, v, mode, r.selector)) : null);
      // a text colour alone is checked on the page background, unless the selector says it sits on something else
      if (!r.bg && r.fg && (ELSEWHERE.test(r.selector) || TEXT_UTILITY.test(r.selector))) continue;
      // a rule that sets only the text colour of a state (.button:hover) takes the background its base rule sets
      const base = !r.bg ? modeRules.find((x) => x !== r && x.bg && !x.bg.image && baseSel(x.selector) === baseSel(r.selector)) : null;
      const bg = r.bg && !r.bg.image ? tok(r.bg) : base ? tok(base.bg) : main;
      const large = r.fontSize ? isLarge(r.fontSize, r.fontWeight) : false;
      if (r.fg) add(tok(r.fg), bg, large ? 'large' : 'text', `${r.selector} sets ${r.bg ? 'color and background' : 'color'}`, { selector: r.selector, image: r.bg?.image, guess: !r.bg && !base });
      for (const k of ['border', 'outline']) if (r[k] && bg) add(tok(r[k]), bg, /input|select|textarea|button|focus|checkbox|radio/i.test(r.selector) || k === 'outline' ? 'ui' : 'decor', `${r.selector} sets ${k}`, { selector: r.selector });
    }
    // 2. names: X-foreground on X, on-X on X
    for (const t of texts) {
      if (t.on) {
        const base = named.get(t.on) || named.get(t.on.replace(/-?(default|base)$/, '')) || ['bg', 'background', 'surface', 'fill', 'container'].map((x) => named.get(`${t.on}-${x}`)).find(Boolean)
          || [...named.entries()].find(([k, v]) => v !== t && v.role !== 'text' && (k.endsWith(t.on) || t.on.endsWith(k)))?.[1];
        if (base && base !== t) add(t, base, 'text', `${t.name} is named for ${base.name}`);
        // muted-foreground and secondary text are used on the page background too
        if (main && base !== main && (!base || /muted|subtle|secondary|surface|card|popover|background/.test(t.on))) add(t, main, 'text', `${t.name} on the page background`, { guess: !base });
      } else if (main) {
        add(t, main, 'text', 'text on the page background');
        if (bgs.length <= 6) for (const b of bgs) if (b !== main && !hasOwnText(b, texts)) add(t, b, 'text', `text on ${b.name}`);
      }
    }
    // 3. accents and status colours: as text or icons on the background (links, error text), and as backgrounds of their own text
    for (const t of all.filter((x) => x.role === 'accent')) {
      if (!main || t === main) continue;
      const own = texts.find((x) => x.on && (named.get(x.on) === t || words(t.name).join('-') === x.on));
      // a filled colour with its own text colour: rule 2 covers it; a status colour is also used as text (error messages)
      if (own) { if (t.status) add(t, main, 'text', 'status colours are also text (error and warning messages)'); continue; }
      add(t, main, words(t.name).includes('link') || t.status ? 'text' : 'ui', words(t.name).includes('link') ? 'links are text' : t.status ? 'status text and icons' : 'buttons, icons and accents on the background');
      if (unnamed) for (const x of texts) add(x, t, 'text', 'text on an accent', { optional: true });
    }
    // 4. borders and controls: input borders and focus rings need 3:1, plain dividers are decoration
    for (const t of all.filter((x) => x.role === 'border' || x.role === 'control')) if (main) add(t, main, t.role === 'control' ? 'ui' : 'decor', t.role === 'control' ? 'input borders and focus rings (WCAG 1.4.11)' : 'dividers and card edges (decoration)');
    // 5. chart colours on the background
    for (const t of all.filter((x) => x.role === 'chart')) if (main) add(t, main, 'ui', 'chart colours on the background (WCAG 1.4.11)');
    // 6. a palette without names: dark text on every lighter colour, light text on every darker colour
    if (unnamed) for (const x of all) if (x.role === 'text' && main) add(x, main, 'text', 'darkest on lightest');
    // 7. pairs the caller declares
    for (const [a, b, kind] of opts.pairs || []) {
      const fa = findTok(all, a), fb = findTok(all, b);
      if (fa && fb) add(fa, fb, kind || 'text', 'declared by you');
    }
  }
  // groups that must be told apart: status colours, chart colours, the accents of a bare palette
  const groups = [];
  for (const mode of modes) {
    const all = tokens.filter((t) => t.mode === mode && t.role !== 'ignore');
    const status = all.filter((t) => t.status && !t.on);
    const chart = all.filter((t) => t.role === 'chart');
    const accents = all.filter((t) => t.role === 'accent' && !t.status && C(t.hex) > 0.04);
    if (status.length >= 2) groups.push({ id: `status-${mode}`, label: 'Status colors', mode, members: status });
    if (chart.length >= 2) groups.push({ id: `chart-${mode}`, label: 'Chart colors', mode, members: chart });
    if (accents.length >= 2 && !chart.length) groups.push({ id: `accents-${mode}`, label: 'Accent colors', mode, members: accents });
  }
  return { tokens, pairs: pairs.slice(0, MAX_PAIRS), groups, modes, tooMany: pairs.length > MAX_PAIRS };
}

// a text-colour utility somewhere in a selector (Tailwind's .hover\:text-red-500, .text-neutral-400\!, variants)
const TEXT_UTILITY = /(^|[\s.:(*,>])\.?[\w\\:\[\]\.*-]*text-[\w\\/.!\[\]#-]+/;
/** The first selector of a list, without its pseudo-classes: ".btn:hover, .btn:focus" → ".btn". */
const baseSel = (sel) => String(sel).split(',')[0].trim().replace(/::?[\w-]+(\([^)]*\))?/g, '').trim();
const PAGE_SEL = /^(html|body|:root)(\s*,\s*(html|body|:root))*$/i;
const ELSEWHERE = /invers|revers|on-dark|on-light|knockout|\.dark\b|dark-mode|-dark\b|::selection|disabled/i;

function pickMain(list, mode) {
  const exact = list.find((t) => /^(background|bg|page|canvas|body|surface|base|background-default|bg-default|surface-default)$/.test(words(t.name).join('-')));
  if (exact) return exact;
  return [...list].sort((a, b) => (mode === 'dark' ? L(a.hex) - L(b.hex) : L(b.hex) - L(a.hex)))[0] || null;
}
const hasOwnText = (b, texts) => {
  const w = words(b.name).join('-'), stem = w.replace(/-(bg|background|surface|fill|container)$/, '');
  return texts.some((x) => x.on && (w.endsWith(x.on) || stem === x.on));
};
function findTok(all, ref) {
  const s = String(ref).replace(/^#/, '').toLowerCase();
  return all.find((t) => t.name === ref) || all.find((t) => t.name.toLowerCase() === String(ref).toLowerCase()) || all.find((t) => t.hex === s);
}
/** A colour a CSS rule writes out literally becomes a token of its own, so it can be judged and fixed. */
function synth(tokens, v, mode, selector) {
  // one token per colour, opacity and mode: #000 at 0% (transparent) is not #000
  let t = tokens.find((x) => x.literal && x.hex === v.hex && (x.alpha ?? 1) === (v.alpha ?? 1) && x.mode === mode);
  if (!t) { t = { name: `#${v.hex}`, hex: v.hex, alpha: v.alpha, mode, id: tokens.length, role: 'literal', literal: true, raw: v.raw || null, span: v.span || null, format: v.format, where: selector }; tokens.push(t); }
  return t;
}

// ---------------------------------------------------------------------------------------------------------------- judging

/** One pair judged: WCAG 2 (with alpha laid over the background), APCA if given, glare, colour vision, low vision. */
export function judge(p, target = 'AA', apca) {
  const bgHex = p.bg.alpha < 1 ? over(p.bg.hex, p.bg.alpha, p.mode === 'dark' ? '000000' : 'ffffff') : p.bg.hex;
  const fgHex = over(p.fg.hex, p.fg.alpha, bgHex);
  const ratio = contrast(fgHex, bgHex);
  const need = needOf(p.kind, target);
  const out = {
    // shown under the name the design uses (an alias), fixed at its source
    fg: { name: p.asFg || p.fg.name, hex: p.fg.hex, alpha: p.fg.alpha ?? 1, shown: fgHex, ...(p.asFg ? { source: p.fg.name } : {}) },
    bg: { name: p.asBg || p.bg.name, hex: p.bg.hex, alpha: p.bg.alpha ?? 1, shown: bgHex, ...(p.asBg ? { source: p.bg.name } : {}) },
    mode: p.mode, kind: p.kind, why: p.why, ratio, need, pass: ratio >= need,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'fail',
    margin: r1(ratio - need, 2),
  };
  if (p.image) out.image = true;
  // a combination only a bare palette suggests is reported, not judged: pass is null
  if (p.optional) { out.optional = true; out.pass = null; }
  // text set without a background and nearly the page's own colour must sit on something the stylesheets do not show
  // (a dark header, a coloured badge): its background is unknown, so it is listed, not judged
  if (p.guess && ratio < 1.2) { out.optional = true; out.pass = null; out.unknownBg = true; out.why = `${p.why}; nearly the page color, so it sits on a background the stylesheets do not show`; }
  if (apca) out.lc = apca(fgHex, bgHex);
  out.glare = glareRatio(fgHex, bgHex);
  // the worst a colour-vision deficiency does to this pair (red text on dark goes darker for protans)
  let worst = null;
  for (const v of VISION) {
    const r = contrast(seeAs(fgHex, v.id), seeAs(bgHex, v.id));
    if (!worst || r < worst.ratio) worst = { id: v.id, label: v.label, ratio: r };
  }
  out.vision = worst;
  out.lowVision = ratio >= 7;
  return out;
}

/** Readability of a text pair at real sizes: WCAG 2 per size (large from 24px, or 18.66px bold), and APCA if given. */
export function readability(fg, bg, apca) {
  const ratio = contrast(fg, bg), lc = apca ? Math.abs(apca(fg, bg)) : null;
  const rows = [];
  for (const px of [12, 14, 16, 18, 20, 24, 32, 48]) for (const weight of [400, 700]) {
    const large = isLarge(px, weight);
    const need = large ? 3 : 4.5;
    rows.push({ px, weight, large, wcag: ratio >= need, aaa: ratio >= (large ? 4.5 : 7) });
  }
  return { ratio, lc, rows };
}

// ---------------------------------------------------------------------------------------------------------------- tell apart

/** Colours of a group that look alike, with normal vision or with a colour-vision deficiency (ΔE-OK under 10 is hard, under 5 the same). */
export function collisions(groups) {
  const out = [];
  for (const g of groups) {
    const m = g.members;
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      const a = m[i], b = m[j];
      const normal = dE(a.hex, b.hex);
      const under = VISION.map((v) => ({ id: v.id, label: v.label, d: dE(seeAs(a.hex, v.id), seeAs(b.hex, v.id)) }));
      // name the deficiency that matters most: red-green (about 1 in 12 men) before the rare ones, when it merges them
      const low = (l) => l.reduce((x, y) => (y.d < x.d ? y : x));
      const common = under.filter((x) => /^(protan|deuteran)/.test(x.id));
      const worst = low(common).d < 10 ? low(common) : low(under);
      if (normal < 10 || worst.d < 10) {
        out.push({ group: g.label, mode: g.mode, a: { name: a.name, hex: a.hex }, b: { name: b.name, hex: b.hex }, normal, worst,
          hard: under.filter((x) => x.d < 10).map((x) => x.label), common: under.some((x) => x.d < 10 && /^(protan|deuteran)/.test(x.id)), severity: normal < 5 || worst.d < 5 ? 'same' : 'close' });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- feel

const hueName = (h) => (h < 40 || h >= 355 ? 'red' : h < 78 ? 'orange' : h < 110 ? 'yellow' : h < 165 ? 'green' : h < 200 ? 'teal' : h < 275 ? 'blue' : h < 330 ? 'purple' : 'pink');
const angle = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** The palette's feel, measured: harmony, temperature, saturation balance, lightness steps, vibration, gamut, mood. */
export function feel(hexes) {
  const list = [...new Set(hexes)];
  if (!list.length) return null;
  const o = list.map((h) => ({ hex: h, ...toOklch(col(h)) })).map((x) => ({ ...x, c: x.c || 0, h: x.h || 0 }));
  const chromatic = o.filter((x) => x.c > 0.04);
  const notes = [];
  // harmony: cluster the chromatic hues (within 25°), then name the relation between the clusters
  const clusters = [];
  for (const x of [...chromatic].sort((a, b) => b.c - a.c)) {
    const k = clusters.find((cl) => angle(cl.h, x.h) <= 25);
    if (k) k.members.push(x); else clusters.push({ h: x.h, members: [x] });
  }
  const hs = clusters.map((c) => c.h);
  let harmony = 'neutral';
  if (hs.length === 1) harmony = 'monochromatic';
  else if (hs.length === 2) { const a = angle(hs[0], hs[1]); harmony = a >= 150 ? 'complementary' : a <= 60 ? 'analogous' : 'contrasting'; }
  else if (hs.length >= 3) {
    const spread = Math.max(...hs.flatMap((a) => hs.map((b) => angle(a, b))));
    const sorted = [...hs].sort((a, b) => a - b), gaps = sorted.map((h, i) => (sorted[(i + 1) % sorted.length] - h + 360) % 360 || 360);
    if (spread <= 90) harmony = 'analogous';
    else if (hs.length === 3 && gaps.every((g) => g >= 90 && g <= 150)) harmony = 'triadic';
    else if (hs.length === 3 && Math.max(...gaps) >= 150 && Math.min(...gaps) <= 60) harmony = 'split complementary';
    else if (hs.length === 4 && gaps.every((g) => g >= 60 && g <= 120)) harmony = 'tetradic';
    else harmony = 'free (no single rule)';
  }
  // temperature, weighted by chroma
  let warm = 0, cool = 0;
  for (const x of chromatic) { if (x.h < 100 || x.h > 330) warm += x.c; else if (x.h > 160 && x.h < 300) cool += x.c; }
  const temperature = !chromatic.length ? 'neutral' : warm > cool * 1.5 ? 'warm' : cool > warm * 1.5 ? 'cool' : 'mixed';
  // saturation balance: one colour much louder than the rest
  const cs = o.map((x) => x.c).sort((a, b) => a - b), med = cs[Math.floor(cs.length / 2)];
  const loud = o.filter((x) => x.c > 0.15 && x.c > Math.max(med, 0.03) * 2.5);
  if (loud.length === 1 && o.length >= 3) notes.push({ kind: 'loud', text: `#${loud[0].hex} is far more saturated than the rest; it will pull the eye. Good for one call to action, tiring as a large area.`, hex: loud[0].hex });
  const chromaSpread = r1((cs[cs.length - 1] - cs[0]), 3);
  // lightness steps: a set needs a clear dark and a clear light to carry text
  const ls = o.map((x) => x.l).sort((a, b) => a - b);
  const lightRange = r1(ls[ls.length - 1] - ls[0], 2);
  const steps = ls.filter((l, i) => !i || l - ls[i - 1] >= 0.08).length;
  const best = o.length >= 2 ? contrast(o.reduce((a, b) => (a.l > b.l ? a : b)).hex, o.reduce((a, b) => (a.l < b.l ? a : b)).hex) : 21;
  if (lightRange < 0.5 && o.length >= 2 && best < 4.5) notes.push({ kind: 'flat', text: `The lightest and darkest colours are only ${Math.round(lightRange * 100)} points apart in lightness, so no pair will carry body text. Add a near-black or near-white.` });
  else if (steps < Math.min(3, o.length)) notes.push({ kind: 'steps', text: 'Few distinct lightness steps: headings, text and surfaces will be hard to tell apart. Spread the lightness more.' });
  // vibration: saturated opposite hues at similar lightness flicker where they meet
  const vib = [];
  for (let i = 0; i < chromatic.length; i++) for (let j = i + 1; j < chromatic.length; j++) {
    const a = chromatic[i], b = chromatic[j];
    if (a.c > 0.12 && b.c > 0.12 && angle(a.h, b.h) >= 120 && Math.abs(a.l - b.l) < 0.12) vib.push([a.hex, b.hex]);
  }
  if (vib.length) notes.push({ kind: 'vibrate', text: `${vib.map(([a, b]) => `#${a} and #${b}`).join(', ')} are strong opposite hues at about the same lightness: as text on each other they vibrate. Use one as text only on a neutral.`, pairs: vib });
  // gamut: colours P3 screens could show far more vivid
  const edge = o.filter((x) => { const v = toGamut('p3', 'oklch')({ mode: 'oklch', l: x.l, c: 0.4, h: x.h }); return x.c > 0.1 && toOklch(v).c > x.c * 1.3; });
  const muddy = o.filter((x) => x.l > 0.35 && x.l < 0.6 && x.c > 0.03 && x.c < 0.07 && x.h > 40 && x.h < 120);
  if (muddy.length && muddy.length < o.length) notes.push({ kind: 'muddy', text: `${muddy.map((x) => '#' + x.hex).join(', ')} ${muddy.length === 1 ? 'sits' : 'sit'} in the dull olive-brown band (mid lightness, low chroma, warm hue), which can read as dirty next to clean colours.` });
  const neutrals = o.filter((x) => x.c <= 0.04).length;
  return {
    harmony, hues: clusters.map((c) => ({ h: r1(c.h), name: hueName(c.h), count: c.members.length })),
    temperature, chroma: { max: r1(cs[cs.length - 1], 3), median: r1(med, 3), spread: chromaSpread },
    lightness: { min: r1(ls[0], 2), max: r1(ls[ls.length - 1], 2), range: lightRange, steps },
    neutrals, vivid: chromatic.length, moods: moods(list), p3: edge.map((x) => x.hex), notes,
  };
}

// ---------------------------------------------------------------------------------------------------------------- fixing

const WEIGHT = { text: 1, literal: 1.1, control: 1.2, border: 1.2, chart: 1.6, bg: 1.8, scale: 1.5, accent: 2.2 };

/** The nearest lightness (hue and chroma kept, chroma lowered only to fit sRGB) at which a test passes, or null. */
function nearestL(hex, test) {
  const o = toOklch(col(hex)), c = o.c || 0, h = o.h || 0;
  const at = (l) => fromOklch(l, c, h);
  // coarse steps to find the first passing lightness each way, then fine steps back towards the start
  let best = null;
  for (const s of [1, -1]) {
    let hit = null;
    for (let d = 0.01; d <= 1.001; d += 0.01) { const l = o.l + s * d; if (l < -0.001 || l > 1.001) break; if (test(at(Math.min(1, Math.max(0, l))))) { hit = d; break; } }
    if (hit == null) continue;
    let d = hit;
    for (let f = hit - 0.001; f > hit - 0.01 && f > 0; f -= 0.001) { if (test(at(Math.min(1, Math.max(0, o.l + s * f))))) d = f; else break; }
    if (!best || d < best.d) best = { d, x: at(Math.min(1, Math.max(0, o.l + s * d))) };
  }
  return best && test(best.x) ? best.x : null;
}

/**
 * Fix a whole palette: each round moves the one colour whose nearest passing lightness fixes the most failing pairs for
 * the smallest visible change (ΔE-OK, weighted so text moves before backgrounds and brand colours last), without breaking a
 * pair that passes. Locked names never move. Returns the changes and what still fails.
 */
export function solve(planned, target = 'AA', lock = []) {
  const value = new Map(planned.tokens.map((t) => [t.id, t.hex]));
  const locked = new Set(lock.map(String));
  const pairs = planned.pairs.filter((p) => p.kind !== 'decor' && !p.optional && !p.image);
  const ok = (p, v = value) => {
    const bg = p.bg.alpha < 1 ? over(v.get(p.bg.id), p.bg.alpha, p.mode === 'dark' ? '000000' : 'ffffff') : v.get(p.bg.id);
    return contrast(over(v.get(p.fg.id), p.fg.alpha, bg), bg) >= needOf(p.kind, target);
  };
  const moved = new Map();
  const byId = new Map(planned.tokens.map((t) => [t.id, t]));
  for (let round = 0; round < 60; round++) {
    const failing = pairs.filter((p) => !ok(p));
    if (!failing.length) break;
    let best = null;
    const cands = new Map();
    for (const p of failing.slice(0, 40)) for (const t of [p.fg, p.bg]) { const tk = byId.get(t.id) || t; if (!tk.inherited && !locked.has(tk.name) && !locked.has(tk.hex) && !locked.has('#' + tk.hex)) cands.set(tk.id, tk); }
    for (const t of cands.values()) {
      const mine = pairs.filter((p) => p.fg.id === t.id || p.bg.id === t.id);
      const prev = value.get(t.id);
      const to = nearestL(prev, (x) => { value.set(t.id, x); const r = mine.every((p) => ok(p)); value.set(t.id, prev); return r; });
      if (!to) continue;
      const fixes = failing.filter((p) => p.fg.id === t.id || p.bg.id === t.id).length;
      const cost = (dE(value.get(t.id), to) * (WEIGHT[t.role] || 1.5)) / fixes;
      if (!best || cost < best.cost) best = { t, to, cost };
    }
    if (!best) break;
    value.set(best.t.id, best.to);
    moved.set(best.t.id, best.t);
  }
  const changes = [...moved.values()].map((t) => ({ name: t.name, mode: t.mode, role: t.role, from: t.hex, to: value.get(t.id), deltaE: dE(t.hex, value.get(t.id)), span: t.span, raw: t.raw, format: t.format, alpha: t.alpha }))
    .filter((c) => c.from !== c.to);
  const remaining = pairs.filter((p) => !ok(p)).map((p) => ({ fg: p.fg.name, bg: p.bg.name, mode: p.mode, kind: p.kind,
    // what one side alone would need, ignoring the other pairs
    suggest: { fg: nearestL(value.get(p.fg.id), (x) => ok(p, new Map(value).set(p.fg.id, x))), bg: nearestL(value.get(p.bg.id), (x) => ok(p, new Map(value).set(p.bg.id, x))) } })).slice(0, 60);
  return { target, changes, remaining, values: value };
}

/** A colour written the way the original was: hex stays hex (and its case), hsl stays hsl, bare shadcn numbers stay bare. */
export function writeLike(hex, raw, format, alpha = 1) {
  const v = info(hex), a = alpha < 1 ? alpha : null;
  const pct = (x) => `${r1(x, 1)}%`;
  switch (format) {
    case 'HEX': return '#' + hex.toUpperCase() + (a != null ? Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase() : '');
    case 'hex': case 'hex8': case 'name': return '#' + hex + (a != null ? Math.round(a * 255).toString(16).padStart(2, '0') : '');
    case 'hsl-bare': return `${v.hsl.h} ${pct(v.hsl.s)} ${pct(v.hsl.l)}${a != null ? ` / ${a}` : ''}`;
    case 'hsl': return `hsl(${v.hsl.h} ${pct(v.hsl.s)} ${pct(v.hsl.l)}${a != null ? ` / ${a}` : ''})`;
    case 'hsl-legacy': return a != null ? `hsla(${v.hsl.h}, ${pct(v.hsl.s)}, ${pct(v.hsl.l)}, ${a})` : `hsl(${v.hsl.h}, ${pct(v.hsl.s)}, ${pct(v.hsl.l)})`;
    case 'rgb': return `rgb(${v.rgb.r} ${v.rgb.g} ${v.rgb.b}${a != null ? ` / ${a}` : ''})`;
    case 'rgb-legacy': return a != null ? `rgba(${v.rgb.r}, ${v.rgb.g}, ${v.rgb.b}, ${a})` : `rgb(${v.rgb.r}, ${v.rgb.g}, ${v.rgb.b})`;
    case 'oklch': {
      const decimal = raw && /oklch\(\s*0?\.\d/i.test(raw);
      const o = v.oklch;
      return `oklch(${decimal ? r1(o.l / 100, 4) : `${o.l}%`} ${o.c} ${o.h}${a != null ? ` / ${a}` : ''})`;
    }
    default: return '#' + hex;
  }
}

/** The fixed text, and a unified diff of the lines that changed. */
export function applyFix(text, changes, label = 'colors') {
  const edits = changes.filter((c) => c.span).map((c) => ({ ...c, out: writeLike(c.to, c.raw, c.format, c.alpha) })).sort((a, b) => b.span[0] - a.span[0]);
  let out = text;
  for (const e of edits) out = out.slice(0, e.span[0]) + e.out + out.slice(e.span[1]);
  const A = text.split('\n'), B = out.split('\n');
  const changed = A.map((l, i) => l !== B[i]);
  const hunks = [];
  for (let i = 0; i < A.length; i++) {
    if (!changed[i]) continue;
    const s = Math.max(0, i - 2);
    let e = i;
    while (e + 1 < A.length && (changed[e + 1] || changed.slice(e + 1, e + 4).some(Boolean))) e++;
    e = Math.min(A.length - 1, e + 2);
    const lines = [];
    for (let k = s; k <= e; k++) { if (changed[k]) lines.push('-' + A[k], '+' + B[k]); else lines.push(' ' + A[k]); }
    const len = e - s + 1;
    hunks.push(`@@ -${s + 1},${len} +${s + 1},${len} @@\n${lines.join('\n')}`);
    i = e;
  }
  const diff = hunks.length ? `--- a/${label}\n+++ b/${label}\n${hunks.join('\n')}\n` : '';
  return { text: out, diff, unwritten: changes.filter((c) => !c.span).map((c) => c.name) };
}

// ---------------------------------------------------------------------------------------------------------------- report

/**
 * The whole check. `input` is pasted text, or an array of colours. Options: target ('AA' | 'AAA'), roles, pairs, lock
 * (names that must not move), apca (the APCA function from shared/apca.js, or nothing), label (the file name in diffs).
 */
export function check(input, opts = {}) {
  const text = Array.isArray(input) ? input.join('\n') : String(input ?? '');
  const read = readInput(text, opts.max || 200000);
  const target = opts.target === 'AAA' ? 'AAA' : 'AA';
  const planned = plan(read, opts);
  const judged = planned.pairs.map((p) => judge(p, target, opts.apca));
  const clash = collisions(planned.groups);
  const fix = solve(planned, target, opts.lock || []);
  const applied = applyFix(text, fix.changes, opts.label);
  const byMode = {};
  for (const m of planned.modes) byMode[m] = feel(planned.tokens.filter((t) => t.mode === m && t.role !== 'ignore').map((t) => t.hex));
  const failing = judged.filter((p) => !p.pass && p.kind !== 'decor' && !p.optional);
  const report = {
    version: VERSION,
    input: { kind: read.kind, colors: new Set(planned.tokens.filter((t) => !t.inherited).map((t) => `${t.name}|${t.mode}`)).size, rules: read.rules?.length || 0, modes: planned.modes, warnings: [...read.warnings, ...(planned.tooMany ? [`Only the first ${MAX_PAIRS} pairs are checked.`] : [])] },
    target, standard: TARGETS[target].label,
    tokens: planned.tokens.filter((t) => !t.literal || judged.some((p) => p.fg.name === t.name || p.bg.name === t.name)).map((t) => ({ name: t.name, hex: t.hex, alpha: t.alpha ?? 1, mode: t.mode, role: t.role || 'other', why: t.why || null, at: t.span ? t.span[0] : null, ...(t.where ? { where: t.where } : {}), ...(t.inherited ? { inherited: true } : {}) })),
    pairs: judged,
    collisions: clash,
    feel: byMode,
    fix: { changes: fix.changes.map((c) => ({ ...c, span: c.span || null, raw: c.raw ?? null })), remaining: fix.remaining, text: fix.changes.length ? applied.text : null, diff: applied.diff, unwritten: applied.unwritten },
  };
  report.summary = summarize(report);
  return report;
}

/** The plain-language top of a report, filled in from the numbers (a template, the same words every time). */
export function summarize(r) {
  const judged = r.pairs.filter((p) => p.kind !== 'decor' && !p.optional);
  const fail = judged.filter((p) => !p.pass);
  const pass = judged.length - fail.length;
  const lines = [];
  if (!r.input.colors) return { pass: 0, fail: 0, total: 0, issues: 0, text: r.input.rules ? `${r.input.rules} CSS rules read, but none sets a color that can be paired (colors set by scripts or images are not seen).` : 'No colors found. Paste hex codes, CSS, Tailwind config or design tokens.', lines: [] };
  if (!judged.length) lines.push(`${r.input.colors} colors read, but no pairs to judge: tell the checker which colors are text and which are backgrounds.`);
  else lines.push(`${judged.length} ${judged.length === 1 ? 'pair' : 'pairs'} checked against ${r.standard}: ${pass} pass, ${fail.length} fail.`);
  if (fail.length) {
    const kinds = {};
    for (const p of fail) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
    lines.push(`Failing: ${Object.entries(kinds).map(([k, n]) => `${n} ${kindLabel(k)}${n === 1 ? '' : k === 'text' || k === 'large' ? '' : 's'}`).join(', ')}. The worst is ${fail.sort((a, b) => a.ratio / a.need - b.ratio / b.need)[0].fg.name} on ${fail[0].bg.name} at ${fail[0].ratio}:1 (needs ${fail[0].need}:1).`);
  }
  if (r.fix.changes.length) {
    const ch = r.fix.changes;
    lines.push(`Changing ${ch.length} ${ch.length === 1 ? 'color' : 'colors'} fixes ${r.fix.remaining.length ? 'most of it' : 'every failing pair'}: ${ch.slice(0, 4).map((c) => `${c.name === '#' + c.from ? '' : c.name + ' '}${r.input.modes.length > 1 ? `(${c.mode}) ` : ''}#${c.from} → #${c.to} (ΔE ${c.deltaE})`).join(', ')}${ch.length > 4 ? ', …' : ''}.`);
  }
  if (r.fix.remaining.length) lines.push(`${r.fix.remaining.length} ${r.fix.remaining.length === 1 ? 'pair needs' : 'pairs need'} both colors to move; see the suggestions.`);
  const cvd = r.pairs.filter((p) => p.pass && p.vision && p.vision.ratio < p.need);
  if (cvd.length) lines.push(`${cvd.length} passing ${cvd.length === 1 ? 'pair drops' : 'pairs drop'} below ${r.standard} for some color vision (${[...new Set(cvd.map((p) => p.vision.label))].join(', ')}).`);
  const same = r.collisions.filter((c) => c.normal >= 10 && c.common);
  if (same.length) lines.push(`${same.length} ${same.length === 1 ? 'pair' : 'pairs'} of ${same[0].group.toLowerCase()} look alike with color-blindness: don't let color alone tell them apart.`);
  const narrow = judged.filter((p) => p.pass && p.kind === 'text' && p.ratio < 5);
  if (narrow.length) lines.push(`${narrow.length} text ${narrow.length === 1 ? 'pair passes' : 'pairs pass'} by less than 0.5; glare and low vision will lose ${narrow.length === 1 ? 'it' : 'them'}.`);
  return { pass, fail: fail.length, total: judged.length, issues: fail.length + same.length, text: lines.join(' '), lines };
}

export { textOn };
