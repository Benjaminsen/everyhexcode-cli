// The one colour module: the server renders pages with it and the browser tools are bundled from it
// (scripts/build-client.mjs), so a value on a page and the same value in a tool always agree.
// Colour maths is culori (MIT); APCA is in shared/apca.js (APCA-W3 0.0.98G-4g constants).
import {
  useMode, modeRgb, modeLrgb, modeHsl, modeHsv, modeHwb, modeLab, modeLch, modeOklab, modeOklch, modeP3, modeXyz65,
  formatHex, toGamut, inGamut, clampRgb, differenceEuclidean, wcagContrast, wcagLuminance, interpolate, samples,
  filterDeficiencyProt, filterDeficiencyDeuter, filterDeficiencyTrit, parse as cparse, converter,
  fixupHueShorter, fixupHueLonger, fixupHueIncreasing, fixupHueDecreasing,
} from 'culori/fn';

useMode(modeRgb); useMode(modeLrgb); useMode(modeHsl); useMode(modeHsv); useMode(modeHwb); useMode(modeLab);
useMode(modeLch); useMode(modeOklab); useMode(modeOklch); useMode(modeP3); useMode(modeXyz65);

const okDist = differenceEuclidean('oklab');
const toSrgb = toGamut('rgb', 'oklch');
const toP3 = toGamut('p3', 'oklch');

import { parseColor } from './parse.js';

const HEX6 = /^[0-9a-f]{6}$/;

/** Any colour people type or paste → "ff5733" (no #), or null. The forgiving reader is shared/parse.js. */
export function normHex(input, as) {
  if (input == null) return null;
  const r = parseColor(input, as ? { as } : {});
  return r.hex || null;
}
export { parseColor };

export const isHex = (s) => HEX6.test(s);
const col = (hex) => cparse('#' + hex);
const r1 = (n, d = 0) => { const f = 10 ** d; const v = Math.round(n * f) / f; return Object.is(v, -0) ? 0 : v; };
const hue = (h) => (h == null || Number.isNaN(h) ? 0 : r1(((h % 360) + 360) % 360, 1));

/** Every value a page or tool shows for one colour, as numbers and as copy-ready strings. */
export function info(hex) {
  const c = col(hex);
  const rgb = { r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255) };
  const hsl = useConv('hsl')(c), hsv = useConv('hsv')(c), hwb = useConv('hwb')(c);
  const lab = useConv('lab')(c), lch = useConv('lch')(c), oklab = useConv('oklab')(c), oklch = useConv('oklch')(c);
  const p3 = useConv('p3')(c), xyz = useConv('xyz65')(c);
  const k = 1 - Math.max(c.r, c.g, c.b);
  const cmyk = k >= 1 ? { c: 0, m: 0, y: 0, k: 100 }
    : { c: r1((1 - c.r - k) / (1 - k) * 100), m: r1((1 - c.g - k) / (1 - k) * 100), y: r1((1 - c.b - k) / (1 - k) * 100), k: r1(k * 100) };
  const H = (x) => hue(x);
  const L = r1(oklch.l * 100, 2), C = r1(oklch.c, 4), Hh = oklch.c < 0.0001 ? 0 : r1(H(oklch.h), 2);
  const v = {
    hex: '#' + hex,
    hexUpper: '#' + hex.toUpperCase(),
    rgb, hsl: { h: H(hsl.h), s: r1(hsl.s * 100, 1), l: r1(hsl.l * 100, 1) },
    hsv: { h: H(hsv.h), s: r1(hsv.s * 100, 1), v: r1(hsv.v * 100, 1) },
    hwb: { h: H(hwb.h), w: r1(hwb.w * 100, 1), b: r1(hwb.b * 100, 1) },
    cmyk,
    lab: { l: r1(lab.l, 2), a: r1(lab.a, 2), b: r1(lab.b, 2) },
    lch: { l: r1(lch.l, 2), c: r1(lch.c, 2), h: H(lch.h) },
    oklab: { l: r1(oklab.l, 4), a: r1(oklab.a, 4), b: r1(oklab.b, 4) },
    oklch: { l: L, c: C, h: Hh },
    p3: { r: r1(p3.r, 4), g: r1(p3.g, 4), b: r1(p3.b, 4) },
    xyz: { x: r1(xyz.x * 100, 2), y: r1(xyz.y * 100, 2), z: r1(xyz.z * 100, 2) },
    decimal: parseInt(hex, 16),
    luminance: r1(wcagLuminance(c), 4),
  };
  v.strings = {
    hex: v.hex,
    rgb: `rgb(${rgb.r} ${rgb.g} ${rgb.b})`,
    rgbLegacy: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${v.hsl.h} ${v.hsl.s}% ${v.hsl.l}%)`,
    hsv: `hsv(${v.hsv.h}, ${v.hsv.s}%, ${v.hsv.v}%)`,
    hwb: `hwb(${v.hwb.h} ${v.hwb.w}% ${v.hwb.b}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    lab: `lab(${v.lab.l}% ${v.lab.a} ${v.lab.b})`,
    lch: `lch(${v.lch.l}% ${v.lch.c} ${v.lch.h})`,
    oklab: `oklab(${r1(oklab.l * 100, 2)}% ${v.oklab.a} ${v.oklab.b})`,
    oklch: `oklch(${L}% ${C} ${Hh})`,
    p3: `color(display-p3 ${v.p3.r} ${v.p3.g} ${v.p3.b})`,
    xyz: `color(xyz-d65 ${r1(xyz.x, 4)} ${r1(xyz.y, 4)} ${r1(xyz.z, 4)})`,
    decimal: String(v.decimal),
    android: `0xFF${hex.toUpperCase()}`,
    swift: `Color(red: ${r1(c.r, 3)}, green: ${r1(c.g, 3)}, blue: ${r1(c.b, 3)})`,
    uikit: `UIColor(red: ${r1(c.r, 3)}, green: ${r1(c.g, 3)}, blue: ${r1(c.b, 3)}, alpha: 1)`,
    flutter: `Color(0xFF${hex.toUpperCase()})`,
  };
  return v;
}

const converters = {};
function useConv(mode) { return (converters[mode] ||= converter(mode)); }

/** WCAG 2.x contrast ratio, two decimals. */
// Rounded to two decimals, but never up onto a WCAG threshold: 4.499 shows as 4.49 and fails, as WebAIM's does
export function contrast(a, b) {
  const x = wcagContrast(col(a), col(b)), r = r1(x, 2);
  return [3, 4.5, 7].some((t) => x < t && r >= t) ? Math.floor(x * 100) / 100 : r;
}

/** WCAG 2.x grades for a ratio. */
export function wcagGrades(ratio) {
  return { aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5, ui: ratio >= 3 };
}

// APCA lives in its own module (shared/apca.js) under its own licence terms; the CLI is built without it.
import { apca, apcaUse } from './apca.js';
export { apca, apcaUse };

/** Black or white, whichever has more WCAG 2 contrast on this colour (the better one is always at least 4.58:1). */
export function textOn(hex) {
  return contrast('000000', hex) >= contrast('ffffff', hex) ? '000000' : 'ffffff';
}

function fromOklch(l, c, h) { return formatHex(toSrgb({ mode: 'oklch', l, c, h })).slice(1); }

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// Lightness and relative chroma of each step, taken from Tailwind v4's own red (OKLCH), so scales sit beside its palette.
const SCALE_L = [0.971, 0.936, 0.885, 0.808, 0.704, 0.637, 0.577, 0.505, 0.444, 0.396, 0.258];
const SCALE_C = [0.055, 0.135, 0.26, 0.48, 0.81, 1, 1.03, 0.9, 0.75, 0.6, 0.39];

/**
 * A Tailwind-style 50–950 scale built in OKLCH around one colour: the hue is kept, lightness follows the steps and
 * chroma tapers at both ends; the given colour replaces the step nearest to its own lightness, exactly.
 */
export function scale(hex) {
  const o = useConv('oklch')(col(hex));
  const h = o.h || 0;
  let nearest = 0, best = 9;
  SCALE_L.forEach((l, i) => { const d = Math.abs(l - o.l); if (d < best) { best = d; nearest = i; } });
  // the chroma the scale would have at 500; a pale or very dark colour does not imply a vivid middle, so it is capped
  const mid = o.c < 0.015 ? 0 : Math.min(o.c / SCALE_C[nearest], Math.max(o.c * 1.6, 0.03));
  return SCALE_STEPS.map((step, i) => ({
    step,
    hex: i === nearest ? hex : fromOklch(SCALE_L[i], o.c < 0.015 ? o.c : mid * SCALE_C[i], h),
    base: i === nearest,
  }));
}

/** Harmonies by turning the hue in OKLCH (lightness and chroma kept, mapped into sRGB). */
export function harmonies(hex) {
  const o = useConv('oklch')(col(hex));
  const turn = (d) => fromOklch(o.l, o.c, ((o.h || 0) + d + 360) % 360);
  return {
    complementary: [hex, turn(180)],
    analogous: [turn(-30), hex, turn(30)],
    triadic: [hex, turn(120), turn(240)],
    splitComplementary: [hex, turn(150), turn(210)],
    tetradic: [hex, turn(90), turn(180), turn(270)],
    monochromatic: [0.3, 0.45, 0.6, 0.75, 0.9].map((l) => fromOklch(l, Math.min(o.c, 0.2), o.h || 0)),
  };
}

/** Tints (towards white), shades (towards black) and tones (towards grey), mixed in OKLab, 10 steps each. */
export function mixes(hex) {
  const step = (to) => samples(11).slice(1, 11).map((t) => formatHex(interpolate([ '#' + hex, to ], 'oklab')(t)).slice(1));
  return { tints: step('#ffffff'), shades: step('#000000'), tones: step('#808080') };
}

/** n colours from a to b (both included), interpolated in a space (oklch keeps gradients from going grey). */
export function blend(stops, n, space = 'oklch') {
  const f = interpolate(stops.map((h) => '#' + h), space);
  return samples(n).map((t) => formatHex(toSrgb(f(t))).slice(1));
}

/** The spaces CSS can mix a gradient in (`linear-gradient(in <space>, …)`), as culori modes. `legacy` is a gradient with
 * no `in` and hex stops, which browsers mix in sRGB; `modern` is one with no `in` and oklch() stops, mixed in Oklab. */
export const INTERP = [
  { id: 'legacy', label: 'no in, hex colors', clause: '', mode: 'rgb' },
  { id: 'srgb', label: 'in srgb', clause: 'in srgb', mode: 'rgb' },
  { id: 'srgb-linear', label: 'in srgb-linear', clause: 'in srgb-linear', mode: 'lrgb' },
  { id: 'display-p3', label: 'in display-p3', clause: 'in display-p3', mode: 'p3' },
  { id: 'xyz', label: 'in xyz', clause: 'in xyz', mode: 'xyz65' },
  { id: 'lab', label: 'in lab', clause: 'in lab', mode: 'lab' },
  { id: 'oklab', label: 'in oklab', clause: 'in oklab', mode: 'oklab' },
  { id: 'modern', label: 'no in, oklch() colors', clause: '', mode: 'oklab', modern: true },
  { id: 'oklch', label: 'in oklch', clause: 'in oklch', mode: 'oklch', hue: 'shorter' },
  { id: 'oklch-longer', label: 'in oklch longer hue', clause: 'in oklch longer hue', mode: 'oklch', hue: 'longer' },
  { id: 'oklch-increasing', label: 'in oklch increasing hue', clause: 'in oklch increasing hue', mode: 'oklch', hue: 'increasing' },
  { id: 'oklch-decreasing', label: 'in oklch decreasing hue', clause: 'in oklch decreasing hue', mode: 'oklch', hue: 'decreasing' },
  { id: 'lch', label: 'in lch', clause: 'in lch', mode: 'lch', hue: 'shorter' },
  { id: 'hsl', label: 'in hsl', clause: 'in hsl', mode: 'hsl', hue: 'shorter' },
  { id: 'hwb', label: 'in hwb', clause: 'in hwb', mode: 'hwb', hue: 'shorter' },
];
const FIXUP = { shorter: fixupHueShorter, longer: fixupHueLonger, increasing: fixupHueIncreasing, decreasing: fixupHueDecreasing };

/** n colours along a gradient mixed the way CSS mixes it in one of INTERP's spaces (out-of-gamut ones mapped into sRGB). */
export function interpBlend(stops, n, id) {
  const sp = INTERP.find((x) => x.id === id) || INTERP[0];
  const f = interpolate(stops.map((h) => '#' + h), sp.mode, sp.hue ? { h: { fixup: FIXUP[sp.hue] } } : undefined);
  return samples(n).map((t) => { const c = f(t); return formatHex(inSrgb(c) ? c : okDist(c, clampRgb(c)) < 0.002 ? clampRgb(c) : toSrgb(c)).slice(1); });
}
const inSrgb = inGamut('rgb');

/** Distance in OKLab (ΔE-OK ×100): under ~2 is hard to tell apart, under ~5 close. */
export function distance(a, b) { return r1(okDist(col(a), col(b)) * 100, 2); }

/** The `n` nearest of a list of {hex, …}, each with its distance. */
export function nearest(hex, list, n = 5) {
  const c = col(hex);
  return list.map((x) => ({ ...x, d: r1(okDist(c, col(x.hex)) * 100, 2) })).sort((a, b) => a.d - b.d).slice(0, n);
}

/** Where a colour sits: is it in sRGB (every hex is), and how much more colourful P3 could make the same hue. */
export function gamut(hex) {
  const o = useConv('oklch')(col(hex));
  const vivid = toP3({ mode: 'oklch', l: o.l, c: 0.4, h: o.h || 0 });
  const vo = useConv('oklch')(vivid);
  return { p3MaxChroma: r1(vo.c, 3), srgbChroma: r1(o.c, 3), p3Vivid: `oklch(${r1(o.l * 100, 2)}% ${r1(vo.c, 3)} ${r1(o.h || 0, 2)})` };
}

// OKLCH hue angles (pure red sits at 29, #FFA500 orange at 71, #FFD700 gold at 95); the old cut-offs at 20 and 70 called
// red an orange and orange a yellow (mba #fg-ehc-pages-quality-read: "Red is a mid-tone orange" on /colors/red)
const FAMILIES = [
  ['red', 0, 40], ['orange', 40, 78], ['yellow', 78, 110], ['green', 110, 165], ['teal', 165, 200], ['blue', 200, 275],
  ['purple', 275, 330], ['pink', 330, 355], ['red', 355, 361],
];
/** The plain colour family a colour belongs to, for "shades of …" pages. */
export function family(hex) {
  const o = useConv('oklch')(col(hex));
  if (o.l > 0.96 && o.c < 0.03) return 'white';
  if (o.l < 0.22 && o.c < 0.05) return 'black';
  if (o.c < 0.035) return 'gray';
  const h = o.h || 0;
  if (h >= 20 && h < 90 && o.l < 0.62 && o.c < 0.16) return 'brown';
  if ((h >= 330 || h < 20) && o.l > 0.72) return 'pink';
  const f = FAMILIES.find(([, a, b]) => h >= a && h < b);
  return f ? f[0] : 'red';
}
export const FAMILY_NAMES = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'gray', 'black', 'white'];

/** A colour-vision filter applied the way the Machado (2009) matrices are meant to be: to linear light, not to the
 * gamma-encoded values (applied to sRGB values, pure red under protanopia came out #271d00 instead of about #6d5f00). */
export function cvd(filter, severity = 1) {
  const f = filter(severity);
  return (c) => {
    const l = useConv('lrgb')(c);
    const o = f({ mode: 'rgb', r: l.r, g: l.g, b: l.b, alpha: c.alpha });
    return useConv('rgb')({ mode: 'lrgb', r: Math.max(0, Math.min(1, o.r)), g: Math.max(0, Math.min(1, o.g)), b: Math.max(0, Math.min(1, o.b)) });
  };
}

/** How the colour looks to people with each common colour-vision deficiency. */
export function simulate(hex) {
  const c = col(hex);
  const f = (fn) => formatHex(toSrgb(cvd(fn, 1)(c))).slice(1);
  return { protanopia: f(filterDeficiencyProt), deuteranopia: f(filterDeficiencyDeuter), tritanopia: f(filterDeficiencyTrit),
    achromatopsia: formatHex(toSrgb({ mode: 'oklch', l: useConv('oklch')(c).l, c: 0, h: 0 })).slice(1) };
}

/**
 * A light and a dark theme from one brand colour: roles a site uses, each checked for contrast against its background.
 */
export function theme(hex) {
  const o = useConv('oklch')(col(hex));
  const h = o.h || 0, c = o.c;
  const n = (l, cc) => fromOklch(l, Math.min(cc, c || cc), h);
  const make = (dark) => {
    const roles = dark ? {
      background: n(0.17, 0.012), surface: n(0.215, 0.016), muted: n(0.28, 0.02), border: n(0.33, 0.022),
      text: n(0.96, 0.006), 'text-muted': n(0.76, 0.015),
      primary: fromOklch(Math.max(o.l, 0.68), c, h), accent: fromOklch(0.78, Math.min(c * 0.8, 0.14), (h + 40) % 360),
    } : {
      background: n(0.99, 0.004), surface: n(0.965, 0.008), muted: n(0.93, 0.012), border: n(0.88, 0.016),
      text: n(0.2, 0.02), 'text-muted': n(0.47, 0.025),
      primary: fromOklch(Math.min(o.l, 0.56), c, h), accent: fromOklch(0.55, Math.min(c * 0.8, 0.14), (h + 40) % 360),
    };
    roles['on-primary'] = textOn(roles.primary);
    return roles;
  };
  return { light: make(false), dark: make(true) };
}

/** A random palette that holds together: hues spaced on a rule, lightness spread, chroma kept in a band. */
export function randomPalette(n = 5, rnd = Math.random, locked = []) {
  const base = rnd() * 360;
  const rules = [[0, 30, 60, 180, 210], [0, 120, 240, 60, 300], [0, 15, 30, 45, 200], [0, 150, 210, 30, 180], [0, 0, 0, 180, 180]];
  const rule = rules[Math.floor(rnd() * rules.length)];
  const cBand = 0.04 + rnd() * 0.14;
  const ls = [0.25 + rnd() * 0.1, 0.45 + rnd() * 0.1, 0.62 + rnd() * 0.1, 0.78 + rnd() * 0.08, 0.92 + rnd() * 0.05].sort(() => rnd() - 0.5);
  const out = [];
  for (let i = 0; i < n; i++) {
    if (locked[i]) { out.push(locked[i]); continue; }
    const l = ls[i % ls.length], c = cBand * (0.6 + rnd() * 0.8) * (l > 0.9 ? 0.4 : 1);
    out.push(fromOklch(l, c, (base + rule[i % rule.length] + (rnd() - 0.5) * 16 + 360) % 360));
  }
  return out;
}

/** Every pair in a palette with WCAG ratio and APCA Lc (text first, background second). */
export function matrix(hexes) {
  return hexes.map((bg) => hexes.map((fg) => ({ fg, bg, ratio: contrast(fg, bg), lc: apca(fg, bg) })));
}

/** The nearest colour along the lightness axis (OKLCH) that reaches a WCAG ratio against `against`, or null. */
export function fixContrast(hex, against, target = 4.5) {
  const o = useConv('oklch')(col(hex));
  const bgL = useConv('oklch')(col(against)).l;
  const dir = o.l > bgL ? 1 : -1;
  // only away from the other colour: a fix never turns light text dark or a light background dark
  for (const d of [dir]) {
    for (let l = Math.min(1, Math.max(0, o.l)); l >= 0 && l <= 1; l += d * 0.005) {
      const x = fromOklch(l, o.c, o.h || 0);
      if (contrast(x, against) >= target) return x;
    }
  }
  return null;
}

export { formatHex, wcagLuminance };

export const SCHEMES = [
  { id: 'complementary', name: 'complementary', about: 'the color, its opposite on the hue wheel, and a light and a dark neutral tinted with its hue' },
  { id: 'analogous', name: 'analogous', about: 'neighbors on the hue wheel, 20° and 40° either side, at different lightness so the set has a background and text' },
  { id: 'triadic', name: 'triadic', about: 'three hues a third of the wheel apart, with a light ground and a dark ink tinted with the base' },
  { id: 'split-complementary', name: 'split complementary', about: 'the color and the two hues beside its opposite: as much contrast as complementary, less tension' },
  { id: 'tetradic', name: 'tetradic', about: 'four hues a quarter of the wheel apart, plus a dark ink' },
  { id: 'monochromatic', name: 'monochromatic', about: 'one hue from near-white to near-black, chroma tapering at both ends' },
];

/**
 * Five-color palettes for each harmony around one color, built in OKLCH. Each keeps the given color exactly and
 * includes a light and a dark member, so every one holds a text and background pair.
 */
export function schemePalettes(hex) {
  const o = useConv('oklch')(col(hex));
  const L = o.l, C = Math.max(o.c, 0.04), H = o.h || 0;
  const at = (l, c, d = 0) => fromOklch(l, c, (H + d + 360) % 360);
  const light = at(0.97, Math.min(C * 0.12, 0.02)), dark = at(0.22, Math.min(C * 0.35, 0.05));
  // a partner hue at a lightness that differs from the base, so the pair reads apart
  const lp = (d) => (L > 0.6 ? Math.max(0.42, L - 0.2) : Math.min(0.78, L + 0.2));
  const out = {
    complementary: [light, hex, at(lp(), C, 180), at(Math.min(L + 0.25, 0.9), C * 0.35), dark],
    analogous: [at(0.93, C * 0.25, -40), at(lp(), C * 0.9, -20), hex, at(lp(), C * 0.9, 20), at(0.3, C * 0.6, 40)],
    triadic: [light, hex, at(lp(), C * 0.9, 120), at(lp(), C * 0.9, 240), dark],
    'split-complementary': [light, hex, at(lp(), C * 0.9, 150), at(lp(), C * 0.9, 210), dark],
    tetradic: [hex, at(lp(), C * 0.85, 90), at(L, C * 0.85, 180), at(lp(), C * 0.85, 270), dark],
    monochromatic: (() => {
      const ls = [0.96, 0.84, 0.66, 0.46, 0.26];
      const k = ls.reduce((b, l, i) => (Math.abs(l - L) < Math.abs(ls[b] - L) ? i : b), 0);
      return ls.map((l, i) => (i === k ? hex : at(l, Math.min(o.c, 0.2) * (1 - Math.abs(l - 0.6) * 0.9))));
    })(),
  };
  return out;
}

/** Plain mood words for a palette, from its lightness and chroma in OKLCH. */
export function moods(hexes) {
  const all = hexes.map((h) => useConv('oklch')(col(h)));
  // a palette's dark ink is there for text: the mood is read from the other colours
  const darkest = all.reduce((m, x) => (x.l < m.l ? x : m), all[0]);
  const o = all.length > 3 && darkest.l < 0.32 ? all.filter((x) => x !== darkest) : all;
  const avgL = o.reduce((s, x) => s + x.l, 0) / o.length, avgC = o.reduce((s, x) => s + x.c, 0) / o.length;
  const maxC = Math.max(...o.map((x) => x.c));
  const soft = o.filter((x) => x.l > 0.78 && x.c >= 0.015 && x.c < 0.13).length;
  const warm = o.filter((x) => x.c > 0.04 && ((x.h || 0) < 100 || (x.h || 0) > 330)).length;
  const cool = o.filter((x) => x.c > 0.04 && (x.h || 0) > 160 && (x.h || 0) < 300).length;
  const t = [];
  if (soft >= Math.min(3, o.length - 1) && maxC < 0.16) t.push('pastel');
  if (avgL < 0.45) t.push('dark');
  if (avgL > 0.75) t.push('light');
  if (maxC > 0.2) t.push('bright');
  if (avgC < 0.06 && maxC < 0.12) t.push('muted');
  if (maxC < 0.04) t.push('neutral');
  if (warm >= Math.ceil(o.length / 2)) t.push('warm');
  if (cool >= Math.ceil(o.length / 2)) t.push('cool');
  return t;
}
