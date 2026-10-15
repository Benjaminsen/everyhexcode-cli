// Each finding in plain words, for people who have never heard of WCAG: what it is and where (named the way a person
// sees it: the search box, the footer line, a link), why it matters, and the fix as a colour and a CSS line. The
// selector, the variable and the rule number stay as detail. A template, the same words every time, no model.
import { contrast, family, info } from './color.js';

const TAGS = { a: 'link', button: 'button', input: 'text field', textarea: 'text box', select: 'drop-down', label: 'label', h1: 'main heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading', p: 'text', li: 'list item', th: 'table heading', td: 'table text', small: 'small print', code: 'code', pre: 'code', blockquote: 'quote', caption: 'caption', figcaption: 'caption', summary: 'toggle', nav: 'menu', footer: 'footer', header: 'header', svg: 'icon', hr: 'divider line', body: 'page text', html: 'page text', span: 'text', div: 'text', strong: 'bold text', b: 'bold text', em: 'text', time: 'date', mark: 'highlight' };
const PLACES = [[/\bfooter\b|(^|[-_])footer/, 'in the footer'], [/\bheader\b|(^|[-_])(header|masthead|topbar)/, 'in the header'], [/\bnav\b|(^|[-_])(nav|navbar|menu)/, 'in the menu'], [/\baside\b|(^|[-_])sidebar/, 'in the sidebar'], [/(^|[-_.])(modal|dialog|popover)/, 'in pop-ups'], [/(^|[-_.])card/, 'on cards'], [/(^|[-_.])hero/, 'in the top banner'], [/\btable\b|\bt[dh]\b/, 'in tables'], [/(^|[-_.])(alert|toast|banner)/, 'in notices'], [/(^|[-_.])(tooltip)/, 'in tooltips']];
// class words that say nothing to a reader
const NOISE = /^(js|is|has|u|c|l|o|wp|el|col|row|d|flex|grid|container|wrapper|wrap|inner|outer|item|block|main|content|text|color|colour|style|active|current|default|base|primary|secondary|lg|md|sm|xs|xl|\d+)$/;

const human = (s) => s.replace(/^[-_.#]+/, '').split(/[-_]+|(?<=[a-z])(?=[A-Z])/).map((w) => w.toLowerCase()).filter((w) => w && !NOISE.test(w));

/** The selector's last element, read as a person would name it. */
export function thingOf(selector, part, kind) {
  const first = String(selector || '').split(/,(?![^(]*\))/)[0].trim();
  const steps = first.split(/\s*[>+~]\s*|\s+/).filter(Boolean);
  const last = steps[steps.length - 1] || '';
  const before = steps.slice(0, -1).join(' ').toLowerCase();
  const state = /:hover/.test(last) ? 'hover' : /:focus/.test(last) ? 'focus' : /:visited/.test(last) ? 'visited' : /::?placeholder/.test(last) ? 'placeholder' : /:active/.test(last) ? 'pressed' : null;
  const bare = last.replace(/::?[\w-]+(\([^)]*\))?/g, '');
  const tag = (bare.match(/^[a-z][a-z0-9]*/i) || [''])[0].toLowerCase();
  const classes = [...bare.matchAll(/[.#]([\w-]+)/g)].map((m) => m[1]);
  const attr = (bare.match(/\[type=["']?(\w+)/) || [])[1];
  const cls = classes.join(' ').toLowerCase();
  let name = null, shape = kind === 'ui' ? 'field' : 'text';
  if (/search/.test(cls) || attr === 'search') { name = 'search box'; shape = 'field'; }
  else if (attr === 'checkbox' || /checkbox/.test(cls)) { name = 'checkbox'; shape = 'check'; }
  else if (attr === 'radio' || /radio/.test(cls)) { name = 'option button'; shape = 'check'; }
  else if (tag === 'input' || tag === 'textarea' || tag === 'select' || /(^|[-_ ])(input|field|form-control|textarea|select)([-_ ]|$)/.test(cls)) { name = tag === 'select' || /select/.test(cls) ? 'drop-down' : tag === 'textarea' ? 'text box' : 'text field'; shape = 'field'; }
  else if (tag === 'button' || attr === 'submit' || /(^|[-_ ])(btn|button|cta)([-_ ]|$)/.test(cls)) { name = 'button'; shape = 'button'; }
  else if (tag === 'a' || /(^|[-_ ])link([-_ ]|s?$)/.test(cls)) { name = 'link'; shape = 'link'; }
  else if (/^h[1-6]$/.test(tag) || /(^|[-_ ])(heading|title|headline)([-_ ]|$)/.test(cls)) { name = tag === 'h1' ? 'main heading' : 'heading'; shape = 'heading'; }
  else if (/icon|svg/.test(cls) || tag === 'svg') { name = 'icon'; shape = 'icon'; }
  else if (/badge|tag|chip|pill|label/.test(cls)) { name = 'label'; shape = 'badge'; }
  // otherwise the class or id in words: .footer-trademark is the "footer trademark" text
  const PLACE_WORDS = /^(footer|header|masthead|topbar|nav|navbar|menu|sidebar|modal|dialog|popover|card|hero|alert|toast|banner|tooltip)$/;
  const words = human(classes[classes.length - 1] || '').filter((w) => !PLACE_WORDS.test(w));
  if (!name) name = words.length ? `“${words.join(' ')}” ${tag && TAGS[tag] && !/^(text|page text)$/.test(TAGS[tag]) ? TAGS[tag] : 'text'}` : (TAGS[tag] || (kind === 'ui' ? 'control' : 'text'));
  // where it sits, from the elements around it (or its own class), unless its name already says so
  let where = null;
  const around = `${before} ${cls}`;
  for (const [re, w] of PLACES) if (re.test(around) && !name.includes(w.replace(/^(in|on) (the )?/, '').replace(/s$/, ''))) { where = w; break; }
  if (!where) { const id = (before.match(/#([\w-]+)/g) || []).pop(); if (id) { const w = human(id); if (w.length) where = `in the “${w.join(' ')}” section`; } }
  if (state === 'placeholder') name = `placeholder text in the ${name}`;
  const when = state === 'hover' ? 'when the pointer is over it' : state === 'focus' ? 'when it has keyboard focus' : state === 'visited' ? 'once visited' : state === 'pressed' ? 'while pressed' : null;
  const what = part === 'border' ? `border of the ${name}` : part === 'outline' ? `focus ring of the ${name}` : name;
  return { name, what, where, when, shape: part === 'outline' ? 'focus' : shape };
}

/** A colour variable's name in words: --muted-foreground is "muted text", --input is "input borders". */
function tokenThing(name, kind) {
  const w = human(String(name).replace(/^(--|\$|@)/, '')).filter((x) => !/^(fg|foreground|bg|background|on)$/.test(x));
  if (kind === 'ui') return w.some((x) => /ring|focus|outline/.test(x)) ? 'focus ring' : w.some((x) => /input|border|field|control/.test(x)) ? 'text field borders' : `${w.join(' ') || 'interface'} color`;
  return w.length ? `${w.join(' ')} text` : 'body text';
}

/** A colour named for a reader: "very light gray", "near-black". */
export function colorWords(hex) {
  const o = info(hex).oklch || { l: 50, c: 0 }, l = o.l / 100, f = family(hex);
  if (l > 0.95) return /^f{6}$/i.test(hex) ? 'white' : 'off-white';
  if (l < 0.2) return 'near-black';
  if (f === 'white' || f === 'black' || f === 'gray') return l > 0.85 ? 'very light gray' : l > 0.7 ? 'light gray' : l < 0.4 ? 'dark gray' : 'gray';
  return `${l > 0.85 ? 'very light ' : l > 0.7 ? 'light ' : l < 0.4 ? 'dark ' : ''}${f}`;
}

const lighterOrDarker = (from, to) => ((info(to).oklch?.l ?? 0) > (info(from).oklch?.l ?? 0) ? 'lighter' : 'darker');
const propOf = (part, side) => (side === 'bg' ? 'background-color' : part === 'border' ? 'border-color' : part === 'outline' ? 'outline-color' : 'color');

/**
 * The plain finding for one judged pair. `fix` is the nearest passing colour for this pair if there is one:
 * { side: 'fg' | 'bg', name, from, to, ratio }.
 */
export function explain(p, fix) {
  const part = /sets (border|outline)\b/.test(p.why || '') ? (p.why.match(/sets (border|outline)/)[1]) : 'color';
  const fromRule = p.selector && !/^(body|html|:root)$/.test(p.selector);
  const t = fromRule ? thingOf(p.selector, part, p.kind) : { what: /default link/.test(p.fg.name) ? 'links' : /default text|browser default/.test(p.fg.name) ? 'page text' : tokenThing(p.fg.source || p.fg.name, p.kind), where: null, when: null, shape: p.kind === 'ui' ? 'field' : 'text' };
  if (/links? no CSS rule colours/.test(p.why || '')) { t.what = /^1 link/.test(p.why) ? 'link' : 'links'; t.shape = 'link'; }
  const plural = /s$/.test(t.what) && !/(text|ss)$/.test(t.what);
  const onPage = p.pageBg && p.bg.shown === p.pageBg;
  const bgWords = onPage ? 'the page background' : `its ${colorWords(p.bg.shown)} background`;
  const subject = `${t.what}${t.where ? ` ${t.where}` : ''}`;
  const Subject = subject.replace(/[a-z]/, (c) => c.toUpperCase());
  const swatches = `${colorWords(p.fg.shown)} #${p.fg.shown} on ${p.bg.shown === p.pageBg ? '' : `${colorWords(p.bg.shown)} `}#${p.bg.shown}`;
  const isUi = p.kind === 'ui';
  const bad = isUi ? 'too faint' : p.ratio < 3 ? 'hard to read' : 'harder to read than it should be';
  const rule = isUi ? 'Borders, icons and focus rings need at least 3:1' : p.kind === 'large' ? 'Large text (24px, or 19px bold) needs at least 3:1' : 'Text needs at least 4.5:1';
  const who = isUi ? (t.shape === 'focus' ? 'Keyboard users may not see where they are on the page.' : /field|search|box|drop-down|check/.test(t.what) ? `People with low vision may not see where the ${t.name || 'field'} is or where to type.` : 'People with low vision may not see it.') : 'People with low vision, or on a phone in sunlight, may not be able to read it.';
  const base = {
    subject: Subject, shape: t.shape,
    title: p.kind === 'decor' ? `${Subject}: decoration, no minimum` : p.pass === false ? `${Subject} ${plural ? 'are' : 'is'} ${bad}` : p.pass ? `${Subject}: ${p.ratio >= p.need + 0.5 ? 'clear' : 'just clear enough'}` : `${Subject}: not judged`,
    where: [t.where, t.when].filter(Boolean).join(', ') || null,
    colors: swatches,
  };
  if (p.pass !== false || p.kind === 'decor') return { ...base, what: null, why: null, fix: null };
  base.what = `The ${subject}${t.when ? ` (${t.when})` : ''} ${plural ? 'are' : 'is'} ${colorWords(p.fg.shown)} (#${p.fg.shown}) on ${bgWords} (#${p.bg.shown}). The two are only ${p.ratio}:1 apart.`;
  base.why = `${who} ${rule}; ${plural ? 'these are' : 'this one is'} ${p.ratio}:1.`;
  if (fix) {
    const prop = propOf(part, fix.side);
    const isVar = /^(--|\$|@)/.test(fix.name);
    const css = isVar ? `${fix.name}: #${fix.to};` : `${fromRule ? p.selector.split(/,(?![^(]*\))/)[0].trim() : fix.side === 'bg' ? 'body' : 'a'} { ${prop}: #${fix.to}; }`;
    base.fix = { side: fix.side, name: fix.name, from: fix.from, to: fix.to, ratio: fix.ratio, css,
      text: `Make the ${fix.side === 'bg' ? 'background' : part === 'color' ? (t.shape === 'link' ? 'link color' : 'text color') : part === 'outline' ? 'focus ring' : 'border'} a little ${lighterOrDarker(fix.from, fix.to)}: #${fix.from} → #${fix.to}, the nearest shade of the same color that passes (${fix.ratio}:1).${isVar ? ` It is set once, as ${fix.name}, so every place that uses it is fixed too.` : ''}` };
  } else base.fix = null;
  return base;
}

/** The top of a report in plain words: how much was checked, how much fails, the things to fix first. */
export function plainSummary(r) {
  const judged = r.pairs.filter((p) => p.kind !== 'decor' && !p.optional);
  const fail = judged.filter((p) => p.pass === false).sort((a, b) => a.ratio / a.need - b.ratio / b.need);
  const seen = new Set(), top = [];
  for (const p of fail) { const k = p.plain?.title; if (k && !seen.has(k)) { seen.add(k); top.push(k); } }
  const n = judged.length;
  const text = !n ? 'No color combinations to judge.' : fail.length
    ? `We checked ${n} color ${n === 1 ? 'combination' : 'combinations'}. ${fail.length === 1 ? '1 is' : `${fail.length} are`} too low in contrast: people with low vision, or on a phone in bright light, may not be able to see ${fail.length === 1 ? 'it' : 'them'}.`
    : `We checked ${n} color ${n === 1 ? 'combination' : 'combinations'}, and all of them are clear enough to read and see.`;
  return { text, top: top.slice(0, 5) };
}

/** Contrast in words, for column help. */
export const CONTRAST_HELP = 'How far apart two colors are in lightness: 1:1 is the same color, 21:1 is black on white.';
export const RULE_HELP = 'The accessibility standard (WCAG 2, level AA): normal text needs 4.5:1; large text, borders, icons and focus rings need 3:1.';
export const APCA_HELP = 'APCA is a newer method, still a draft. Lc runs from 0 (invisible) to about 106; body text wants Lc 75 or more. Advisory only: it does not change pass or fail.';
export { contrast };
