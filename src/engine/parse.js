// The forgiving colour reader: one parser for every converter, the hex lookup and the search box. It takes what people
// paste, not only what CSS accepts: "120 50% 50%" or "120,50,50" for HSL with no hsl() around it, rgb in 0–255,
// percent or 0–1, hex with or without # or 0x in 3, 4, 6 or 8 digits, cmyk in 0–100 or 0–1, colour names, and colour
// code from CSS, Swift, SwiftUI, Android, Compose and Flutter. A converter says what it expects (`as`), so bare numbers
// are read in that model; without it the numbers are guessed. The answer is { hex, alpha, mode } or { error }.
import {
  useMode, modeRgb, modeHsl, modeHsv, modeHwb, modeLab, modeLch, modeOklab, modeOklch, modeXyz65, modeLrgb, modeP3,
  parse as cparse, formatHex, toGamut, converter,
} from 'culori/fn';

useMode(modeRgb); useMode(modeLrgb); useMode(modeHsl); useMode(modeHsv); useMode(modeHwb); useMode(modeLab); useMode(modeLch);
useMode(modeOklab); useMode(modeOklch); useMode(modeXyz65); useMode(modeP3);
const toRgb = toGamut('rgb', 'oklch');
const asRgb = converter('rgb');

/** Model words people write before the numbers, and the model each one means. */
const WORDS = {
  rgb: 'rgb', rgba: 'rgb', srgb: 'rgb', hsl: 'hsl', hsla: 'hsl', hsv: 'hsv', hsva: 'hsv', hsb: 'hsv', hsba: 'hsv', hwb: 'hwb',
  cmyk: 'cmyk', lab: 'lab', cielab: 'lab', 'cie-lab': 'lab', lch: 'lch', cielch: 'lch', oklab: 'oklab', oklch: 'oklch',
  xyz: 'xyz', 'xyz-d65': 'xyz', ciexyz: 'xyz', argb: 'argb', decimal: 'decimal', int: 'decimal', integer: 'decimal',
};
/** What each model needs, for the hint when the numbers do not fit. */
const NEEDS = {
  rgb: 'red, green and blue (0–255, percentages or 0–1), and an optional alpha', hsl: 'hue, saturation and lightness, e.g. 120 50% 50%',
  hsv: 'hue, saturation and value (brightness), e.g. 120 50% 80%', hwb: 'hue, whiteness and blackness, e.g. 120 20% 30%',
  cmyk: 'cyan, magenta, yellow and black (0–100 or 0–1)', lab: 'L (0–100), a and b, e.g. 54 81 70', lch: 'L (0–100), chroma and hue, e.g. 54 107 40',
  oklab: 'L (0–1 or %), a and b, e.g. 0.63 0.22 0.13', oklch: 'L (0–1 or %), chroma and hue, e.g. 0.63 0.26 29', xyz: 'X, Y and Z (0–1 or 0–100)',
  argb: 'alpha, red, green and blue', decimal: 'one whole number from 0 to 16777215',
};

const fail = (error) => ({ error });
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const NUM = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|°|rad|grad|turn)?$/i;

/** "50%", "120deg", ".5", "255/255" → { v, unit, dot } or null. */
function num(t) {
  const frac = t.match(/^([+-]?[\d.]+)\/([\d.]+)$/);
  if (frac) return { v: Number(frac[1]) / Number(frac[2]), unit: '', dot: true };
  const m = t.match(NUM);
  if (!m) return null;
  return { v: Number(m[1]), unit: (m[2] || '').toLowerCase().replace('°', 'deg'), dot: m[1].includes('.') || /e/i.test(m[1]) };
}
const hueOf = (t) => (t.unit === 'rad' ? t.v * 180 / Math.PI : t.unit === 'grad' ? t.v * 0.9 : t.unit === 'turn' ? t.v * 360 : t.v);
/** An alpha: 0–1, a percentage, or 0–255 when larger than 100 (Android). */
const alphaOf = (t) => (!t ? 1 : clamp(t.unit === '%' ? t.v / 100 : t.v > 100 ? t.v / 255 : t.v > 1 ? t.v / 100 : t.v));
/** A 0–1 share from "50%", "50" or "0.5"; `frac` says the whole value is written in 0–1. */
const share = (t, frac) => clamp(t.unit === '%' ? t.v / 100 : frac ? t.v : t.v / 100);

function fromHex(h, argb) {
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8 && argb) return { hex: h.slice(2), alpha: Math.round(parseInt(h.slice(0, 2), 16) / 255 * 1000) / 1000 };
  if (h.length === 8) return { hex: h.slice(0, 6), alpha: Math.round(parseInt(h.slice(6), 16) / 255 * 1000) / 1000 };
  return { hex: h, alpha: 1 };
}

function done(c, alpha, mode) {
  // a colour inside sRGB converts straight (no round trip through OKLCH, which can move 127.5 to 127)
  const direct = asRgb(c);
  const inside = direct && [direct.r, direct.g, direct.b].every((x) => x >= -1e-6 && x <= 1 + 1e-6);
  const rgb = inside ? { mode: 'rgb', r: clamp(direct.r), g: clamp(direct.g), b: clamp(direct.b) } : toRgb(c);
  if (!rgb || [rgb.r, rgb.g, rgb.b].some((x) => Number.isNaN(x))) return fail('That does not make a color.');
  return { hex: formatHex(rgb).slice(1), alpha: Math.round(clamp(alpha ?? 1) * 1000) / 1000, mode };
}

/** Numbers in a model → a colour. */
function fromNumbers(mode, ts) {
  const n = ts.length;
  const want = (k) => (n < k ? fail(`${mode.toUpperCase()} needs ${NEEDS[mode]}.`) : null);
  switch (mode) {
    case 'rgb': {
      if (want(3)) return want(3);
      const frac = ts.slice(0, 3).every((t) => t.unit !== '%' && t.v <= 1) && ts.slice(0, 3).some((t) => t.dot);
      const ch = (t) => clamp(t.unit === '%' ? t.v / 100 : frac ? t.v : t.v / 255);
      if (ts.slice(0, 3).some((t) => t.unit !== '%' && t.v > 255)) return fail('RGB channels go from 0 to 255.');
      return done({ mode: 'rgb', r: ch(ts[0]), g: ch(ts[1]), b: ch(ts[2]) }, alphaOf(ts[3]), 'rgb');
    }
    case 'argb': {
      if (want(4)) return want(4);
      const [a, ...rest] = ts;
      const r = fromNumbers('rgb', rest);
      return r.error ? r : { ...r, alpha: alphaOf(a), mode: 'argb' };
    }
    case 'hsl': case 'hsv': case 'hwb': {
      if (want(3)) return want(3);
      const [h, x, y] = ts;
      // all three written as 0–1 (hue too): hue is a turn
      const frac = [x, y].every((t) => t.unit !== '%' && t.v <= 1) && [x, y].some((t) => t.dot);
      const hue = frac && !h.unit && h.v <= 1 && h.dot ? h.v * 360 : hueOf(h);
      const c = mode === 'hsl' ? { mode, h: hue, s: share(x, frac), l: share(y, frac) }
        : mode === 'hsv' ? { mode, h: hue, s: share(x, frac), v: share(y, frac) } : { mode, h: hue, w: share(x, frac), b: share(y, frac) };
      return done(c, alphaOf(ts[3]), mode);
    }
    case 'cmyk': {
      if (want(4)) return want(4);
      const frac = ts.slice(0, 4).every((t) => t.unit !== '%' && t.v <= 1);
      const [c, m, y, k] = ts.slice(0, 4).map((t) => share(t, frac));
      return done({ mode: 'rgb', r: (1 - c) * (1 - k), g: (1 - m) * (1 - k), b: (1 - y) * (1 - k) }, alphaOf(ts[4]), 'cmyk');
    }
    case 'lab': case 'lch': {
      if (want(3)) return want(3);
      const L = ts[0].v;   // a percentage of 100 is the same number
      return done(mode === 'lab' ? { mode: 'lab', l: L, a: ts[1].v, b: ts[2].v } : { mode: 'lch', l: L, c: ts[1].v, h: hueOf(ts[2]) }, alphaOf(ts[3]), mode);
    }
    case 'oklab': case 'oklch': {
      if (want(3)) return want(3);
      const L = ts[0].unit === '%' || ts[0].v > 1 ? ts[0].v / 100 : ts[0].v;
      const ab = (t) => (t.unit === '%' ? t.v / 100 * 0.4 : t.v);
      return done(mode === 'oklab' ? { mode: 'oklab', l: L, a: ab(ts[1]), b: ab(ts[2]) } : { mode: 'oklch', l: L, c: ab(ts[1]), h: hueOf(ts[2]) }, alphaOf(ts[3]), mode);
    }
    case 'xyz': {
      if (want(3)) return want(3);
      const k = ts.slice(0, 3).some((t) => t.v > 1.5 || t.unit === '%') ? 100 : 1;
      return done({ mode: 'xyz65', x: ts[0].v / k, y: ts[1].v / k, z: ts[2].v / k }, alphaOf(ts[3]), 'xyz');
    }
    case 'decimal': {
      if (n !== 1 || ts[0].dot || ts[0].unit) return fail(`A decimal color is ${NEEDS.decimal}.`);
      let v = ts[0].v;
      if (v < 0) v += 2 ** 32;   // an Android color int is signed ARGB
      if (v > 0xffffffff) return fail(`A decimal color is ${NEEDS.decimal}.`);
      if (v > 0xffffff) return { hex: (v & 0xffffff).toString(16).padStart(6, '0'), alpha: Math.round(Math.floor(v / 2 ** 24) / 255 * 1000) / 1000, mode: 'decimal' };
      return { hex: v.toString(16).padStart(6, '0'), alpha: 1, mode: 'decimal' };
    }
    default: return fail('Unknown color model.');
  }
}

/** Guess the model of bare numbers. */
function guess(ts) {
  const n = ts.length;
  if (n === 1 && !ts[0].dot && !ts[0].unit) return 'decimal';
  if (ts[0]?.unit && ts[0].unit !== '%') return 'hsl';
  if (n >= 3 && !ts[0].unit && (ts[1].unit === '%' || ts[2].unit === '%')) return 'hsl';
  // four numbers up to 100 with a whole last one ("0 66 80 0") are CMYK; a fraction last ("255 87 51 0.5") is an alpha
  if (n === 4 && !ts[3].dot && ts.every((t) => t.v <= 100)) return 'cmyk';
  if (n === 3 || n === 4) return 'rgb';
  return null;
}

/**
 * Read a colour from anything people paste. `opts.as` is the model a converter expects ('hsl', 'rgb', 'hex', 'argb',
 * 'decimal', …); `opts.name` looks up a colour name the CSS list does not have (the site's named colours).
 */
export function parseColor(input, opts = {}) {
  if (input == null) return fail('Type a color.');
  let s = String(input).normalize('NFKC').replace(/[−‒–—]/g, '-').trim().replace(/;+$/, '').trim();
  if (!s) return fail('Type a color.');
  const as = WORDS[opts.as] || opts.as;
  // code around the value: an Android resource, a CSS declaration, a quoted string
  const xml = s.match(/<color[^>]*>\s*([^<]+?)\s*<\/color>/i);
  if (xml) return parseColor(xml[1], { ...opts, as: /^#?[0-9a-f]{8}$/i.test(xml[1]) ? 'argb' : opts.as });
  const decl = s.match(/^(?:--)?([a-z][\w-]*)\s*[:=]\s*(.+)$/i);
  if (decl && !WORDS[decl[1].toLowerCase()] && !/^(red|green|blue|hue)$/i.test(decl[1])) return parseColor(decl[2], opts);
  const low = s.toLowerCase();
  // Swift and SwiftUI: UIColor(red: 1, green: 0.34, blue: 0.2, alpha: 1), Color(hue: …), #colorLiteral(…), NSColor(calibratedRed: …)
  const named = (k) => { const m = low.match(new RegExp(`\\b${k}\\s*:\\s*([+-]?[\\d.]+(?:\\s*/\\s*[\\d.]+)?)`)); return m ? num(m[1].replace(/\s+/g, '')) : null; };
  if (/\b(?:red|calibratedred|devicered)\s*:/.test(low)) {
    const r = named('(?:calibrated|device)?red'), g = named('green'), b = named('blue'), a = named('alpha') || named('opacity');
    if (r && g && b) { const frac = [r, g, b].every((t) => t.v <= 1); return done({ mode: 'rgb', r: frac ? r.v : r.v / 255, g: frac ? g.v : g.v / 255, b: frac ? b.v : b.v / 255 }, a ? alphaOf(a) : 1, 'rgb'); }
  }
  if (/\bhue\s*:/.test(low) && /saturation\s*:/.test(low) && /brightness\s*:/.test(low)) {
    const h = named('hue'), sa = named('saturation'), br = named('brightness'), a = named('alpha') || named('opacity');
    if (h && sa && br) return done({ mode: 'hsv', h: h.v <= 1 ? h.v * 360 : h.v, s: sa.v <= 1 ? sa.v : sa.v / 100, v: br.v <= 1 ? br.v : br.v / 100 }, a ? alphaOf(a) : 1, 'hsv');
  }
  // Android, Compose and Flutter: 0xFFFF5733, Color(0xFFFF5733), Color.parseColor("#…"), Color.rgb(…), Color.argb(…), Color.fromARGB(…), Color.fromRGBO(…)
  const ox = low.match(/0x([0-9a-f]{8}|[0-9a-f]{6})\b/);
  if (ox) return { ...fromHex(ox[1], true), mode: ox[1].length === 8 ? 'argb' : 'hex' };
  const call = low.match(/(?:color\.)?(rgb|argb|fromargb|fromrgbo)\s*\(([^)]*)\)/);
  if (call && !/^(rgb|rgba)\s*\(/.test(low)) {
    const ts = call[2].split(/[\s,]+/).filter(Boolean).map(num);
    if (ts.every(Boolean)) {
      if (call[1] === 'argb' || call[1] === 'fromargb') return fromNumbers('argb', ts);
      return fromNumbers('rgb', ts);
    }
  }
  // Android's Color.parseColor("#AARRGGBB") puts alpha first
  const quoted = s.match(/["'`]\s*([^"'`]+?)\s*["'`]/);
  if (quoted && quoted[1] !== s) return parseColor(quoted[1], /parsecolor/.test(low) ? { ...opts, as: 'argb' } : opts);
  // hex: #, 0x or nothing; 3, 4, 6 or 8 digits, or pairs with spaces ("ff 57 33"). Bare digits are hex only when they
  // cannot be anything else: 3 or 6 of them in one piece, or a converter that expects hex
  const pref = /^(#|0x|&h|\\x)/.test(low), spaced = /\s/.test(low);
  const hx = low.replace(/^(#|0x|&h|\\x)/, '').replace(/\s+/g, '');
  if (/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hx)) {
    const letters = /[a-f]/.test(hx);
    const isHex = pref || as === 'hex' || as === 'argb'
      || (letters && (!spaced || /^([0-9a-f]{2}\s+){2,3}[0-9a-f]{2}$/.test(low)))
      || (!letters && !spaced && !as && (hx.length === 3 || hx.length === 6));
    if (isHex) return { ...fromHex(hx, as === 'argb'), mode: hx.length === 8 && as === 'argb' ? 'argb' : 'hex' };
  }
  // a model word, with or without brackets: "hsl(120 50% 50%)", "hsl 120 50 50", "hsla: 120, 50, 50, .5"
  const fn = low.match(/^([a-z][a-z0-9-]*)\s*[(:]?\s*(.*?)\s*\)?$/);
  let mode = null, body = low;
  if (fn && WORDS[fn[1]]) { mode = WORDS[fn[1]]; body = fn[2]; }
  else if (/^color\s*\(/.test(low)) { const c = cparse(low); return c ? done(c, c.alpha ?? 1, 'rgb') : fail('That CSS color() is not one this reads.'); }
  if (mode || /^[\s\d.,+\-/%°a-z()]+$/.test(body)) {
    const raw = body.replace(/[()]/g, ' ').split(/[\s,]+|\s*\/\s*/).filter(Boolean);
    const ts = raw.map(num);
    if (raw.length && ts.every(Boolean)) {
      mode ||= as && as !== 'hex' && as !== 'name' ? as : guess(ts);
      if (mode) return fromNumbers(mode, ts);
    }
  }
  // a CSS colour name or any CSS colour syntax; then the site's names
  const c = cparse(low);
  if (c) { const r = asRgb(c); if (r) return done(c, c.alpha ?? 1, c.mode === 'rgb' ? (/^[a-z]+$/.test(low) ? 'name' : 'rgb') : c.mode); }
  const byName = opts.name?.(s);
  if (byName) return { hex: byName, alpha: 1, mode: 'name' };
  return fail(as && NEEDS[as] ? `Could not read that as ${as.toUpperCase()}. It needs ${NEEDS[as]}.` : 'Could not read that color. Try #ff5733, rgb 255 87 51, hsl 11 100% 60% or a color name.');
}
