#!/usr/bin/env node
// everyhexcode CLI, built from src/ (the CLI) and src/engine/ (the same engine as everyhexcode.com). Licensed FSL-1.1-ALv2 (LICENSE.md); culori is MIT (its notice is in LICENSE.md).

// cli/src/cli.js
import fs3 from "node:fs";
import path4 from "node:path";

// node_modules/culori/src/rgb/parseNumber.js
var parseNumber = (color, len) => {
  if (typeof color !== "number") return;
  if (len === 3) {
    return {
      mode: "rgb",
      r: (color >> 8 & 15 | color >> 4 & 240) / 255,
      g: (color >> 4 & 15 | color & 240) / 255,
      b: (color & 15 | color << 4 & 240) / 255
    };
  }
  if (len === 4) {
    return {
      mode: "rgb",
      r: (color >> 12 & 15 | color >> 8 & 240) / 255,
      g: (color >> 8 & 15 | color >> 4 & 240) / 255,
      b: (color >> 4 & 15 | color & 240) / 255,
      alpha: (color & 15 | color << 4 & 240) / 255
    };
  }
  if (len === 6) {
    return {
      mode: "rgb",
      r: (color >> 16 & 255) / 255,
      g: (color >> 8 & 255) / 255,
      b: (color & 255) / 255
    };
  }
  if (len === 8) {
    return {
      mode: "rgb",
      r: (color >> 24 & 255) / 255,
      g: (color >> 16 & 255) / 255,
      b: (color >> 8 & 255) / 255,
      alpha: (color & 255) / 255
    };
  }
};
var parseNumber_default = parseNumber;

// node_modules/culori/src/colors/named.js
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  // Added in CSS Colors Level 4:
  // https://drafts.csswg.org/css-color/#changes-from-3
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
var named_default = named;

// node_modules/culori/src/rgb/parseNamed.js
var parseNamed = (color) => {
  return parseNumber_default(named_default[color.toLowerCase()], 6);
};
var parseNamed_default = parseNamed;

// node_modules/culori/src/rgb/parseHex.js
var hex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;
var parseHex = (color) => {
  let match;
  return (match = color.match(hex)) ? parseNumber_default(parseInt(match[1], 16), match[1].length) : void 0;
};
var parseHex_default = parseHex;

// node_modules/culori/src/util/regex.js
var num = "([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)";
var num_none = `(?:${num}|none)`;
var per = `${num}%`;
var per_none = `(?:${num}%|none)`;
var num_per = `(?:${num}%|${num})`;
var num_per_none = `(?:${num}%|${num}|none)`;
var hue = `(?:${num}(deg|grad|rad|turn)|${num})`;
var hue_none = `(?:${num}(deg|grad|rad|turn)|${num}|none)`;
var c = `\\s*,\\s*`;
var rx_num_per_none = new RegExp("^" + num_per_none + "$");

// node_modules/culori/src/rgb/parseRgbLegacy.js
var rgb_num_old = new RegExp(
  `^rgba?\\(\\s*${num}${c}${num}${c}${num}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var rgb_per_old = new RegExp(
  `^rgba?\\(\\s*${per}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var parseRgbLegacy = (color) => {
  let res = { mode: "rgb" };
  let match;
  if (match = color.match(rgb_num_old)) {
    if (match[1] !== void 0) {
      res.r = match[1] / 255;
    }
    if (match[2] !== void 0) {
      res.g = match[2] / 255;
    }
    if (match[3] !== void 0) {
      res.b = match[3] / 255;
    }
  } else if (match = color.match(rgb_per_old)) {
    if (match[1] !== void 0) {
      res.r = match[1] / 100;
    }
    if (match[2] !== void 0) {
      res.g = match[2] / 100;
    }
    if (match[3] !== void 0) {
      res.b = match[3] / 100;
    }
  } else {
    return void 0;
  }
  if (match[4] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, match[4] / 100));
  } else if (match[5] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, +match[5]));
  }
  return res;
};
var parseRgbLegacy_default = parseRgbLegacy;

// node_modules/culori/src/_prepare.js
var prepare = (color, mode) => color === void 0 ? void 0 : typeof color !== "object" ? parse_default(color) : color.mode !== void 0 ? color : mode ? { ...color, mode } : void 0;
var prepare_default = prepare;

// node_modules/culori/src/converter.js
var converter = (target_mode = "rgb") => (color) => (color = prepare_default(color, target_mode)) !== void 0 ? (
  // if the color's mode corresponds to our target mode
  color.mode === target_mode ? (
    // then just return the color
    color
  ) : (
    // otherwise check to see if we have a dedicated
    // converter for the target mode
    converters[color.mode][target_mode] ? (
      // and return its result...
      converters[color.mode][target_mode](color)
    ) : (
      // ...otherwise pass through RGB as an intermediary step.
      // if the target mode is RGB...
      target_mode === "rgb" ? (
        // just return the RGB
        converters[color.mode].rgb(color)
      ) : (
        // otherwise convert color.mode -> RGB -> target_mode
        converters.rgb[target_mode](converters[color.mode].rgb(color))
      )
    )
  )
) : void 0;
var converter_default = converter;

// node_modules/culori/src/modes.js
var converters = {};
var modes = {};
var parsers = [];
var colorProfiles = {};
var identity = (v) => v;
var useMode = (definition12) => {
  converters[definition12.mode] = {
    ...converters[definition12.mode],
    ...definition12.toMode
  };
  Object.keys(definition12.fromMode || {}).forEach((k3) => {
    if (!converters[k3]) {
      converters[k3] = {};
    }
    converters[k3][definition12.mode] = definition12.fromMode[k3];
  });
  if (!definition12.ranges) {
    definition12.ranges = {};
  }
  if (!definition12.difference) {
    definition12.difference = {};
  }
  definition12.channels.forEach((channel) => {
    if (definition12.ranges[channel] === void 0) {
      definition12.ranges[channel] = [0, 1];
    }
    if (!definition12.interpolate[channel]) {
      throw new Error(`Missing interpolator for: ${channel}`);
    }
    if (typeof definition12.interpolate[channel] === "function") {
      definition12.interpolate[channel] = {
        use: definition12.interpolate[channel]
      };
    }
    if (!definition12.interpolate[channel].fixup) {
      definition12.interpolate[channel].fixup = identity;
    }
  });
  modes[definition12.mode] = definition12;
  (definition12.parse || []).forEach((parser) => {
    useParser(parser, definition12.mode);
  });
  return converter_default(definition12.mode);
};
var getMode = (mode) => modes[mode];
var useParser = (parser, mode) => {
  if (typeof parser === "string") {
    if (!mode) {
      throw new Error(`'mode' required when 'parser' is a string`);
    }
    colorProfiles[parser] = mode;
  } else if (typeof parser === "function") {
    if (parsers.indexOf(parser) < 0) {
      parsers.push(parser);
    }
  }
};

// node_modules/culori/src/parse.js
var IdentStartCodePoint = /[^\x00-\x7F]|[a-zA-Z_]/;
var IdentCodePoint = /[^\x00-\x7F]|[-\w]/;
var Tok = {
  Function: "function",
  Ident: "ident",
  Number: "number",
  Percentage: "percentage",
  ParenClose: ")",
  None: "none",
  Hue: "hue",
  Alpha: "alpha"
};
var _i = 0;
function is_num(chars) {
  let ch = chars[_i];
  let ch1 = chars[_i + 1];
  if (ch === "-" || ch === "+") {
    return /\d/.test(ch1) || ch1 === "." && /\d/.test(chars[_i + 2]);
  }
  if (ch === ".") {
    return /\d/.test(ch1);
  }
  return /\d/.test(ch);
}
function is_ident(chars) {
  if (_i >= chars.length) {
    return false;
  }
  let ch = chars[_i];
  if (IdentStartCodePoint.test(ch)) {
    return true;
  }
  if (ch === "-") {
    if (chars.length - _i < 2) {
      return false;
    }
    let ch1 = chars[_i + 1];
    if (ch1 === "-" || IdentStartCodePoint.test(ch1)) {
      return true;
    }
    return false;
  }
  return false;
}
var huenits = {
  deg: 1,
  rad: 180 / Math.PI,
  grad: 9 / 10,
  turn: 360
};
function num2(chars) {
  let value = "";
  if (chars[_i] === "-" || chars[_i] === "+") {
    value += chars[_i++];
  }
  value += digits(chars);
  if (chars[_i] === "." && /\d/.test(chars[_i + 1])) {
    value += chars[_i++] + digits(chars);
  }
  if (chars[_i] === "e" || chars[_i] === "E") {
    if ((chars[_i + 1] === "-" || chars[_i + 1] === "+") && /\d/.test(chars[_i + 2])) {
      value += chars[_i++] + chars[_i++] + digits(chars);
    } else if (/\d/.test(chars[_i + 1])) {
      value += chars[_i++] + digits(chars);
    }
  }
  if (is_ident(chars)) {
    let id = ident(chars);
    if (id === "deg" || id === "rad" || id === "turn" || id === "grad") {
      return { type: Tok.Hue, value: value * huenits[id] };
    }
    return void 0;
  }
  if (chars[_i] === "%") {
    _i++;
    return { type: Tok.Percentage, value: +value };
  }
  return { type: Tok.Number, value: +value };
}
function digits(chars) {
  let v = "";
  while (/\d/.test(chars[_i])) {
    v += chars[_i++];
  }
  return v;
}
function ident(chars) {
  let v = "";
  while (_i < chars.length && IdentCodePoint.test(chars[_i])) {
    v += chars[_i++];
  }
  return v;
}
function identlike(chars) {
  let v = ident(chars);
  if (chars[_i] === "(") {
    _i++;
    return { type: Tok.Function, value: v };
  }
  if (v === "none") {
    return { type: Tok.None, value: void 0 };
  }
  return { type: Tok.Ident, value: v };
}
function tokenize(str = "") {
  let chars = str.trim();
  let tokens = [];
  let ch;
  _i = 0;
  while (_i < chars.length) {
    ch = chars[_i++];
    if (ch === "\n" || ch === "	" || ch === " ") {
      while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
        _i++;
      }
      continue;
    }
    if (ch === ",") {
      return void 0;
    }
    if (ch === ")") {
      tokens.push({ type: Tok.ParenClose });
      continue;
    }
    if (ch === "+") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      return void 0;
    }
    if (ch === "-") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      if (is_ident(chars)) {
        tokens.push({ type: Tok.Ident, value: ident(chars) });
        continue;
      }
      return void 0;
    }
    if (ch === ".") {
      _i--;
      if (is_num(chars)) {
        tokens.push(num2(chars));
        continue;
      }
      return void 0;
    }
    if (ch === "/") {
      while (_i < chars.length && (chars[_i] === "\n" || chars[_i] === "	" || chars[_i] === " ")) {
        _i++;
      }
      let alpha;
      if (is_num(chars)) {
        alpha = num2(chars);
        if (alpha.type !== Tok.Hue) {
          tokens.push({ type: Tok.Alpha, value: alpha });
          continue;
        }
      }
      if (is_ident(chars)) {
        if (ident(chars) === "none") {
          tokens.push({
            type: Tok.Alpha,
            value: { type: Tok.None, value: void 0 }
          });
          continue;
        }
      }
      return void 0;
    }
    if (/\d/.test(ch)) {
      _i--;
      tokens.push(num2(chars));
      continue;
    }
    if (IdentStartCodePoint.test(ch)) {
      _i--;
      tokens.push(identlike(chars));
      continue;
    }
    return void 0;
  }
  return tokens;
}
function parseColorSyntax(tokens) {
  tokens._i = 0;
  let token = tokens[tokens._i++];
  if (!token || token.type !== Tok.Function || token.value !== "color") {
    return void 0;
  }
  token = tokens[tokens._i++];
  if (token.type !== Tok.Ident) {
    return void 0;
  }
  const mode = colorProfiles[token.value];
  if (!mode) {
    return void 0;
  }
  const res = { mode };
  const coords = consumeCoords(tokens, false);
  if (!coords) {
    return void 0;
  }
  const channels = getMode(mode).channels;
  for (let ii = 0, c2, ch; ii < channels.length; ii++) {
    c2 = coords[ii];
    ch = channels[ii];
    if (c2.type !== Tok.None) {
      res[ch] = c2.type === Tok.Number ? c2.value : c2.value / 100;
      if (ch === "alpha") {
        res[ch] = Math.max(0, Math.min(1, res[ch]));
      }
    }
  }
  return res;
}
function consumeCoords(tokens, includeHue) {
  const coords = [];
  let token;
  while (tokens._i < tokens.length) {
    token = tokens[tokens._i++];
    if (token.type === Tok.None || token.type === Tok.Number || token.type === Tok.Alpha || token.type === Tok.Percentage || includeHue && token.type === Tok.Hue) {
      coords.push(token);
      continue;
    }
    if (token.type === Tok.ParenClose) {
      if (tokens._i < tokens.length) {
        return void 0;
      }
      continue;
    }
    return void 0;
  }
  if (coords.length < 3 || coords.length > 4) {
    return void 0;
  }
  if (coords.length === 4) {
    if (coords[3].type !== Tok.Alpha) {
      return void 0;
    }
    coords[3] = coords[3].value;
  }
  if (coords.length === 3) {
    coords.push({ type: Tok.None, value: void 0 });
  }
  return coords.every((c2) => c2.type !== Tok.Alpha) ? coords : void 0;
}
function parseModernSyntax(tokens, includeHue) {
  tokens._i = 0;
  let token = tokens[tokens._i++];
  if (!token || token.type !== Tok.Function) {
    return void 0;
  }
  let coords = consumeCoords(tokens, includeHue);
  if (!coords) {
    return void 0;
  }
  coords.unshift(token.value);
  return coords;
}
var parse = (color) => {
  if (typeof color !== "string") {
    return void 0;
  }
  const tokens = tokenize(color);
  const parsed = tokens ? parseModernSyntax(tokens, true) : void 0;
  let result = void 0;
  let i = 0;
  let len = parsers.length;
  while (i < len) {
    if ((result = parsers[i++](color, parsed)) !== void 0) {
      return result;
    }
  }
  return tokens ? parseColorSyntax(tokens) : void 0;
};
var parse_default = parse;

// node_modules/culori/src/rgb/parseRgb.js
function parseRgb(color, parsed) {
  if (!parsed || parsed[0] !== "rgb" && parsed[0] !== "rgba") {
    return void 0;
  }
  const res = { mode: "rgb" };
  const [, r2, g, b, alpha] = parsed;
  if (r2.type === Tok.Hue || g.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (r2.type !== Tok.None) {
    res.r = r2.type === Tok.Number ? r2.value / 255 : r2.value / 100;
  }
  if (g.type !== Tok.None) {
    res.g = g.type === Tok.Number ? g.value / 255 : g.value / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value / 255 : b.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseRgb_default = parseRgb;

// node_modules/culori/src/rgb/parseTransparent.js
var parseTransparent = (c2) => c2 === "transparent" ? { mode: "rgb", r: 0, g: 0, b: 0, alpha: 0 } : void 0;
var parseTransparent_default = parseTransparent;

// node_modules/culori/src/interpolate/lerp.js
var lerp = (a, b, t) => a + t * (b - a);

// node_modules/culori/src/interpolate/piecewise.js
var get_classes = (arr) => {
  let classes = [];
  for (let i = 0; i < arr.length - 1; i++) {
    let a = arr[i];
    let b = arr[i + 1];
    if (a === void 0 && b === void 0) {
      classes.push(void 0);
    } else if (a !== void 0 && b !== void 0) {
      classes.push([a, b]);
    } else {
      classes.push(a !== void 0 ? [a, a] : [b, b]);
    }
  }
  return classes;
};
var interpolatorPiecewise = (interpolator) => (arr) => {
  let classes = get_classes(arr);
  return (t) => {
    let cls = t * classes.length;
    let idx = t >= 1 ? classes.length - 1 : Math.max(Math.floor(cls), 0);
    let pair = classes[idx];
    return pair === void 0 ? void 0 : interpolator(pair[0], pair[1], cls - idx);
  };
};

// node_modules/culori/src/interpolate/linear.js
var interpolatorLinear = interpolatorPiecewise(lerp);

// node_modules/culori/src/fixup/alpha.js
var fixupAlpha = (arr) => {
  let some_defined = false;
  let res = arr.map((v) => {
    if (v !== void 0) {
      some_defined = true;
      return v;
    }
    return 1;
  });
  return some_defined ? res : arr;
};

// node_modules/culori/src/rgb/definition.js
var definition = {
  mode: "rgb",
  channels: ["r", "g", "b", "alpha"],
  parse: [
    parseRgb_default,
    parseHex_default,
    parseRgbLegacy_default,
    parseNamed_default,
    parseTransparent_default,
    "srgb"
  ],
  serialize: "srgb",
  interpolate: {
    r: interpolatorLinear,
    g: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  gamut: true,
  white: { r: 1, g: 1, b: 1 },
  black: { r: 0, g: 0, b: 0 }
};
var definition_default = definition;

// node_modules/culori/src/lrgb/convertRgbToLrgb.js
var fn = (c2 = 0) => {
  const abs = Math.abs(c2);
  if (abs <= 0.04045) {
    return c2 / 12.92;
  }
  return (Math.sign(c2) || 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
};
var convertRgbToLrgb = ({ r: r2, g, b, alpha }) => {
  let res = {
    mode: "lrgb",
    r: fn(r2),
    g: fn(g),
    b: fn(b)
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertRgbToLrgb_default = convertRgbToLrgb;

// node_modules/culori/src/xyz65/convertRgbToXyz65.js
var convertRgbToXyz65 = (rgb4) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb4);
  let res = {
    mode: "xyz65",
    x: 0.4123907992659593 * r2 + 0.357584339383878 * g + 0.1804807884018343 * b,
    y: 0.2126390058715102 * r2 + 0.715168678767756 * g + 0.0721923153607337 * b,
    z: 0.0193308187155918 * r2 + 0.119194779794626 * g + 0.9505321522496607 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertRgbToXyz65_default = convertRgbToXyz65;

// node_modules/culori/src/lrgb/convertLrgbToRgb.js
var fn2 = (c2 = 0) => {
  const abs = Math.abs(c2);
  if (abs > 31308e-7) {
    return (Math.sign(c2) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  }
  return c2 * 12.92;
};
var convertLrgbToRgb = ({ r: r2, g, b, alpha }, mode = "rgb") => {
  let res = {
    mode,
    r: fn2(r2),
    g: fn2(g),
    b: fn2(b)
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLrgbToRgb_default = convertLrgbToRgb;

// node_modules/culori/src/xyz65/convertXyz65ToRgb.js
var convertXyz65ToRgb = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default({
    r: x * 3.2409699419045226 - y * 1.537383177570094 - 0.4986107602930034 * z,
    g: x * -0.9692436362808796 + y * 1.8759675015077204 + 0.0415550574071756 * z,
    b: x * 0.0556300796969936 - y * 0.2039769588889765 + 1.0569715142428784 * z
  });
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToRgb_default = convertXyz65ToRgb;

// node_modules/culori/src/util/normalizeHue.js
var normalizeHue = (hue4) => (hue4 = hue4 % 360) < 0 ? hue4 + 360 : hue4;
var normalizeHue_default = normalizeHue;

// node_modules/culori/src/fixup/hue.js
var hue2 = (hues, fn4) => {
  return hues.map((hue4, idx, arr) => {
    if (hue4 === void 0) {
      return hue4;
    }
    let normalized = normalizeHue_default(hue4);
    if (idx === 0 || hues[idx - 1] === void 0) {
      return normalized;
    }
    return fn4(normalized - normalizeHue_default(arr[idx - 1]));
  }).reduce((acc, curr) => {
    if (!acc.length || curr === void 0 || acc[acc.length - 1] === void 0) {
      acc.push(curr);
      return acc;
    }
    acc.push(curr + acc[acc.length - 1]);
    return acc;
  }, []);
};
var fixupHueShorter = (arr) => hue2(arr, (d) => Math.abs(d) <= 180 ? d : d - 360 * Math.sign(d));

// node_modules/culori/src/difference.js
var differenceHueSaturation = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0 || !std.s || !smp.s) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
  return 2 * Math.sqrt(std.s * smp.s) * dH;
};
var differenceHueNaive = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  if (Math.abs(smp_h - std_h) > 180) {
    return std_h - (smp_h - 360 * Math.sign(smp_h - std_h));
  }
  return smp_h - std_h;
};
var differenceHueChroma = (std, smp) => {
  if (std.h === void 0 || smp.h === void 0 || !std.c || !smp.c) {
    return 0;
  }
  let std_h = normalizeHue_default(std.h);
  let smp_h = normalizeHue_default(smp.h);
  let dH = Math.sin((smp_h - std_h + 360) / 2 * Math.PI / 180);
  return 2 * Math.sqrt(std.c * smp.c) * dH;
};
var differenceEuclidean = (mode = "rgb", weights = [1, 1, 1, 0]) => {
  let def = getMode(mode);
  let channels = def.channels;
  let diffs = def.difference;
  let conv = converter_default(mode);
  return (std, smp) => {
    let ConvStd = conv(std);
    let ConvSmp = conv(smp);
    return Math.sqrt(
      channels.reduce((sum, k3, idx) => {
        let delta = diffs[k3] ? diffs[k3](ConvStd, ConvSmp) : ConvStd[k3] - ConvSmp[k3];
        return sum + (weights[idx] || 0) * Math.pow(isNaN(delta) ? 0 : delta, 2);
      }, 0)
    );
  };
};

// node_modules/culori/src/average.js
var averageAngle = (val) => {
  let sum = val.reduce(
    (sum2, val2) => {
      if (val2 !== void 0) {
        let rad = val2 * Math.PI / 180;
        sum2.sin += Math.sin(rad);
        sum2.cos += Math.cos(rad);
      }
      return sum2;
    },
    { sin: 0, cos: 0 }
  );
  let angle2 = Math.atan2(sum.sin, sum.cos) * 180 / Math.PI;
  return angle2 < 0 ? 360 + angle2 : angle2;
};

// node_modules/culori/src/lch/convertLabToLch.js
var convertLabToLch = ({ l, a, b, alpha }, mode = "lch") => {
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let c2 = Math.sqrt(a * a + b * b);
  let res = { mode, l, c: c2 };
  if (c2) res.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLabToLch_default = convertLabToLch;

// node_modules/culori/src/lch/convertLchToLab.js
var convertLchToLab = ({ l, c: c2, h, alpha }, mode = "lab") => {
  if (h === void 0) h = 0;
  let res = {
    mode,
    l,
    a: c2 ? c2 * Math.cos(h / 180 * Math.PI) : 0,
    b: c2 ? c2 * Math.sin(h / 180 * Math.PI) : 0
  };
  if (alpha !== void 0) res.alpha = alpha;
  return res;
};
var convertLchToLab_default = convertLchToLab;

// node_modules/culori/src/constants.js
var D50 = {
  X: 0.3457 / 0.3585,
  Y: 1,
  Z: (1 - 0.3457 - 0.3585) / 0.3585
};
var D65 = {
  X: 0.3127 / 0.329,
  Y: 1,
  Z: (1 - 0.3127 - 0.329) / 0.329
};
var k = Math.pow(29, 3) / Math.pow(3, 3);
var e = Math.pow(6, 3) / Math.pow(29, 3);

// node_modules/culori/src/hsl/convertHslToRgb.js
function convertHslToRgb({ h, s, l, alpha }) {
  h = normalizeHue_default(h !== void 0 ? h : 0);
  if (s === void 0) s = 0;
  if (l === void 0) l = 0;
  let m1 = l + s * (l < 0.5 ? l : 1 - l);
  let m2 = m1 - (m1 - l) * 2 * Math.abs(h / 60 % 2 - 1);
  let res;
  switch (Math.floor(h / 60)) {
    case 0:
      res = { r: m1, g: m2, b: 2 * l - m1 };
      break;
    case 1:
      res = { r: m2, g: m1, b: 2 * l - m1 };
      break;
    case 2:
      res = { r: 2 * l - m1, g: m1, b: m2 };
      break;
    case 3:
      res = { r: 2 * l - m1, g: m2, b: m1 };
      break;
    case 4:
      res = { r: m2, g: 2 * l - m1, b: m1 };
      break;
    case 5:
      res = { r: m1, g: 2 * l - m1, b: m2 };
      break;
    default:
      res = { r: 2 * l - m1, g: 2 * l - m1, b: 2 * l - m1 };
  }
  res.mode = "rgb";
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsl/convertRgbToHsl.js
function convertRgbToHsl({ r: r2, g, b, alpha }) {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let M = Math.max(r2, g, b), m = Math.min(r2, g, b);
  let res = {
    mode: "hsl",
    s: M === m ? 0 : (M - m) / (1 - Math.abs(M + m - 1)),
    l: 0.5 * (M + m)
  };
  if (M - m !== 0)
    res.h = (M === r2 ? (g - b) / (M - m) + (g < b) * 6 : M === g ? (b - r2) / (M - m) + 2 : (r2 - g) / (M - m) + 4) * 60;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/util/hue.js
var hueToDeg = (val, unit) => {
  switch (unit) {
    case "deg":
      return +val;
    case "rad":
      return val / Math.PI * 180;
    case "grad":
      return val / 10 * 9;
    case "turn":
      return val * 360;
  }
};
var hue_default = hueToDeg;

// node_modules/culori/src/hsl/parseHslLegacy.js
var hsl_old = new RegExp(
  `^hsla?\\(\\s*${hue}${c}${per}${c}${per}\\s*(?:,\\s*${num_per}\\s*)?\\)$`
);
var parseHslLegacy = (color) => {
  let match = color.match(hsl_old);
  if (!match) return;
  let res = { mode: "hsl" };
  if (match[3] !== void 0) {
    res.h = +match[3];
  } else if (match[1] !== void 0 && match[2] !== void 0) {
    res.h = hue_default(match[1], match[2]);
  }
  if (match[4] !== void 0) {
    res.s = Math.min(Math.max(0, match[4] / 100), 1);
  }
  if (match[5] !== void 0) {
    res.l = Math.min(Math.max(0, match[5] / 100), 1);
  }
  if (match[6] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, match[6] / 100));
  } else if (match[7] !== void 0) {
    res.alpha = Math.max(0, Math.min(1, +match[7]));
  }
  return res;
};
var parseHslLegacy_default = parseHslLegacy;

// node_modules/culori/src/hsl/parseHsl.js
function parseHsl(color, parsed) {
  if (!parsed || parsed[0] !== "hsl" && parsed[0] !== "hsla") {
    return void 0;
  }
  const res = { mode: "hsl" };
  const [, h, s, l, alpha] = parsed;
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (s.type !== Tok.None) {
    if (s.type === Tok.Hue) {
      return void 0;
    }
    res.s = s.value / 100;
  }
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = l.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseHsl_default = parseHsl;

// node_modules/culori/src/hsl/definition.js
var definition2 = {
  mode: "hsl",
  toMode: {
    rgb: convertHslToRgb
  },
  fromMode: {
    rgb: convertRgbToHsl
  },
  channels: ["h", "s", "l", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  parse: [parseHsl_default, parseHslLegacy_default],
  serialize: (c2) => `hsl(${c2.h !== void 0 ? c2.h : "none"} ${c2.s !== void 0 ? c2.s * 100 + "%" : "none"} ${c2.l !== void 0 ? c2.l * 100 + "%" : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    s: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default2 = definition2;

// node_modules/culori/src/hsv/convertHsvToRgb.js
function convertHsvToRgb({ h, s, v, alpha }) {
  h = normalizeHue_default(h !== void 0 ? h : 0);
  if (s === void 0) s = 0;
  if (v === void 0) v = 0;
  let f2 = Math.abs(h / 60 % 2 - 1);
  let res;
  switch (Math.floor(h / 60)) {
    case 0:
      res = { r: v, g: v * (1 - s * f2), b: v * (1 - s) };
      break;
    case 1:
      res = { r: v * (1 - s * f2), g: v, b: v * (1 - s) };
      break;
    case 2:
      res = { r: v * (1 - s), g: v, b: v * (1 - s * f2) };
      break;
    case 3:
      res = { r: v * (1 - s), g: v * (1 - s * f2), b: v };
      break;
    case 4:
      res = { r: v * (1 - s * f2), g: v * (1 - s), b: v };
      break;
    case 5:
      res = { r: v, g: v * (1 - s), b: v * (1 - s * f2) };
      break;
    default:
      res = { r: v * (1 - s), g: v * (1 - s), b: v * (1 - s) };
  }
  res.mode = "rgb";
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsv/convertRgbToHsv.js
function convertRgbToHsv({ r: r2, g, b, alpha }) {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let M = Math.max(r2, g, b), m = Math.min(r2, g, b);
  let res = {
    mode: "hsv",
    s: M === 0 ? 0 : 1 - m / M,
    v: M
  };
  if (M - m !== 0)
    res.h = (M === r2 ? (g - b) / (M - m) + (g < b) * 6 : M === g ? (b - r2) / (M - m) + 2 : (r2 - g) / (M - m) + 4) * 60;
  if (alpha !== void 0) res.alpha = alpha;
  return res;
}

// node_modules/culori/src/hsv/definition.js
var definition3 = {
  mode: "hsv",
  toMode: {
    rgb: convertHsvToRgb
  },
  parse: ["--hsv"],
  serialize: "--hsv",
  fromMode: {
    rgb: convertRgbToHsv
  },
  channels: ["h", "s", "v", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    s: interpolatorLinear,
    v: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueSaturation
  },
  average: {
    h: averageAngle
  }
};
var definition_default3 = definition3;

// node_modules/culori/src/hwb/convertHwbToRgb.js
function convertHwbToRgb({ h, w, b, alpha }) {
  if (w === void 0) w = 0;
  if (b === void 0) b = 0;
  if (w + b > 1) {
    let s = w + b;
    w /= s;
    b /= s;
  }
  return convertHsvToRgb({
    h,
    s: b === 1 ? 1 : 1 - w / (1 - b),
    v: 1 - b,
    alpha
  });
}

// node_modules/culori/src/hwb/convertRgbToHwb.js
function convertRgbToHwb(rgba) {
  let hsv = convertRgbToHsv(rgba);
  if (hsv === void 0) return void 0;
  let s = hsv.s !== void 0 ? hsv.s : 0;
  let v = hsv.v !== void 0 ? hsv.v : 0;
  let res = {
    mode: "hwb",
    w: (1 - s) * v,
    b: 1 - v
  };
  if (hsv.h !== void 0) res.h = hsv.h;
  if (hsv.alpha !== void 0) res.alpha = hsv.alpha;
  return res;
}

// node_modules/culori/src/hwb/parseHwb.js
function ParseHwb(color, parsed) {
  if (!parsed || parsed[0] !== "hwb") {
    return void 0;
  }
  const res = { mode: "hwb" };
  const [, h, w, b, alpha] = parsed;
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (w.type !== Tok.None) {
    if (w.type === Tok.Hue) {
      return void 0;
    }
    res.w = w.value / 100;
  }
  if (b.type !== Tok.None) {
    if (b.type === Tok.Hue) {
      return void 0;
    }
    res.b = b.value / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseHwb_default = ParseHwb;

// node_modules/culori/src/hwb/definition.js
var definition4 = {
  mode: "hwb",
  toMode: {
    rgb: convertHwbToRgb
  },
  fromMode: {
    rgb: convertRgbToHwb
  },
  channels: ["h", "w", "b", "alpha"],
  ranges: {
    h: [0, 360]
  },
  gamut: "rgb",
  parse: [parseHwb_default],
  serialize: (c2) => `hwb(${c2.h !== void 0 ? c2.h : "none"} ${c2.w !== void 0 ? c2.w * 100 + "%" : "none"} ${c2.b !== void 0 ? c2.b * 100 + "%" : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    w: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueNaive
  },
  average: {
    h: averageAngle
  }
};
var definition_default4 = definition4;

// node_modules/culori/src/xyz50/constants.js
var k2 = Math.pow(29, 3) / Math.pow(3, 3);
var e2 = Math.pow(6, 3) / Math.pow(29, 3);

// node_modules/culori/src/lab/convertLabToXyz50.js
var fn3 = (v) => Math.pow(v, 3) > e2 ? Math.pow(v, 3) : (116 * v - 16) / k2;
var convertLabToXyz50 = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let fy = (l + 16) / 116;
  let fx = a / 500 + fy;
  let fz = fy - b / 200;
  let res = {
    mode: "xyz50",
    x: fn3(fx) * D50.X,
    y: fn3(fy) * D50.Y,
    z: fn3(fz) * D50.Z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLabToXyz50_default = convertLabToXyz50;

// node_modules/culori/src/xyz50/convertXyz50ToRgb.js
var convertXyz50ToRgb = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default({
    r: x * 3.1341359569958707 - y * 1.6173863321612538 - 0.4906619460083532 * z,
    g: x * -0.978795502912089 + y * 1.916254567259524 + 0.03344273116131949 * z,
    b: x * 0.07195537988411677 - y * 0.2289768264158322 + 1.405386058324125 * z
  });
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToRgb_default = convertXyz50ToRgb;

// node_modules/culori/src/lab/convertLabToRgb.js
var convertLabToRgb = (lab) => convertXyz50ToRgb_default(convertLabToXyz50_default(lab));
var convertLabToRgb_default = convertLabToRgb;

// node_modules/culori/src/xyz50/convertRgbToXyz50.js
var convertRgbToXyz50 = (rgb4) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb4);
  let res = {
    mode: "xyz50",
    x: 0.436065742824811 * r2 + 0.3851514688337912 * g + 0.14307845442264197 * b,
    y: 0.22249319175623702 * r2 + 0.7168870538238823 * g + 0.06061979053616537 * b,
    z: 0.013923904500943465 * r2 + 0.09708128566574634 * g + 0.7140993584005155 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertRgbToXyz50_default = convertRgbToXyz50;

// node_modules/culori/src/lab/convertXyz50ToLab.js
var f = (value) => value > e2 ? Math.cbrt(value) : (k2 * value + 16) / 116;
var convertXyz50ToLab = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let f0 = f(x / D50.X);
  let f1 = f(y / D50.Y);
  let f2 = f(z / D50.Z);
  let res = {
    mode: "lab",
    l: 116 * f1 - 16,
    a: 500 * (f0 - f1),
    b: 200 * (f1 - f2)
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToLab_default = convertXyz50ToLab;

// node_modules/culori/src/lab/convertRgbToLab.js
var convertRgbToLab = (rgb4) => {
  let res = convertXyz50ToLab_default(convertRgbToXyz50_default(rgb4));
  if (rgb4.r === rgb4.b && rgb4.b === rgb4.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToLab_default = convertRgbToLab;

// node_modules/culori/src/lab/parseLab.js
function parseLab(color, parsed) {
  if (!parsed || parsed[0] !== "lab") {
    return void 0;
  }
  const res = { mode: "lab" };
  const [, l, a, b, alpha] = parsed;
  if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (l.type !== Tok.None) {
    res.l = Math.min(Math.max(0, l.value), 100);
  }
  if (a.type !== Tok.None) {
    res.a = a.type === Tok.Number ? a.value : a.value * 125 / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value : b.value * 125 / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseLab_default = parseLab;

// node_modules/culori/src/lab/definition.js
var definition5 = {
  mode: "lab",
  toMode: {
    xyz50: convertLabToXyz50_default,
    rgb: convertLabToRgb_default
  },
  fromMode: {
    xyz50: convertXyz50ToLab_default,
    rgb: convertRgbToLab_default
  },
  channels: ["l", "a", "b", "alpha"],
  ranges: {
    l: [0, 100],
    a: [-125, 125],
    b: [-125, 125]
  },
  parse: [parseLab_default],
  serialize: (c2) => `lab(${c2.l !== void 0 ? c2.l : "none"} ${c2.a !== void 0 ? c2.a : "none"} ${c2.b !== void 0 ? c2.b : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    l: interpolatorLinear,
    a: interpolatorLinear,
    b: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default5 = definition5;

// node_modules/culori/src/lch/parseLch.js
function parseLch(color, parsed) {
  if (!parsed || parsed[0] !== "lch") {
    return void 0;
  }
  const res = { mode: "lch" };
  const [, l, c2, h, alpha] = parsed;
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = Math.min(Math.max(0, l.value), 100);
  }
  if (c2.type !== Tok.None) {
    res.c = Math.max(
      0,
      c2.type === Tok.Number ? c2.value : c2.value * 150 / 100
    );
  }
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseLch_default = parseLch;

// node_modules/culori/src/lch/definition.js
var definition6 = {
  mode: "lch",
  toMode: {
    lab: convertLchToLab_default,
    rgb: (c2) => convertLabToRgb_default(convertLchToLab_default(c2))
  },
  fromMode: {
    rgb: (c2) => convertLabToLch_default(convertRgbToLab_default(c2)),
    lab: convertLabToLch_default
  },
  channels: ["l", "c", "h", "alpha"],
  ranges: {
    l: [0, 100],
    c: [0, 150],
    h: [0, 360]
  },
  parse: [parseLch_default],
  serialize: (c2) => `lch(${c2.l !== void 0 ? c2.l : "none"} ${c2.c !== void 0 ? c2.c : "none"} ${c2.h !== void 0 ? c2.h : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  interpolate: {
    h: { use: interpolatorLinear, fixup: fixupHueShorter },
    c: interpolatorLinear,
    l: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  },
  difference: {
    h: differenceHueChroma
  },
  average: {
    h: averageAngle
  }
};
var definition_default6 = definition6;

// node_modules/culori/src/lrgb/definition.js
var definition7 = {
  ...definition_default,
  mode: "lrgb",
  toMode: {
    rgb: convertLrgbToRgb_default
  },
  fromMode: {
    rgb: convertRgbToLrgb_default
  },
  parse: ["srgb-linear"],
  serialize: "srgb-linear"
};
var definition_default7 = definition7;

// node_modules/culori/src/oklab/convertLrgbToOklab.js
var convertLrgbToOklab = ({ r: r2, g, b, alpha }) => {
  if (r2 === void 0) r2 = 0;
  if (g === void 0) g = 0;
  if (b === void 0) b = 0;
  let L2 = Math.cbrt(
    0.412221469470763 * r2 + 0.5363325372617348 * g + 0.0514459932675022 * b
  );
  let M = Math.cbrt(
    0.2119034958178252 * r2 + 0.6806995506452344 * g + 0.1073969535369406 * b
  );
  let S = Math.cbrt(
    0.0883024591900564 * r2 + 0.2817188391361215 * g + 0.6299787016738222 * b
  );
  let res = {
    mode: "oklab",
    l: 0.210454268309314 * L2 + 0.7936177747023054 * M - 0.0040720430116193 * S,
    a: 1.9779985324311684 * L2 - 2.42859224204858 * M + 0.450593709617411 * S,
    b: 0.0259040424655478 * L2 + 0.7827717124575296 * M - 0.8086757549230774 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLrgbToOklab_default = convertLrgbToOklab;

// node_modules/culori/src/oklab/convertRgbToOklab.js
var convertRgbToOklab = (rgb4) => {
  let res = convertLrgbToOklab_default(convertRgbToLrgb_default(rgb4));
  if (rgb4.r === rgb4.b && rgb4.b === rgb4.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToOklab_default = convertRgbToOklab;

// node_modules/culori/src/oklab/convertOklabToLrgb.js
var convertOklabToLrgb = ({ l, a, b, alpha }) => {
  if (l === void 0) l = 0;
  if (a === void 0) a = 0;
  if (b === void 0) b = 0;
  let L2 = Math.pow(l + 0.3963377773761749 * a + 0.2158037573099136 * b, 3);
  let M = Math.pow(l - 0.1055613458156586 * a - 0.0638541728258133 * b, 3);
  let S = Math.pow(l - 0.0894841775298119 * a - 1.2914855480194092 * b, 3);
  let res = {
    mode: "lrgb",
    r: 4.076741636075957 * L2 - 3.3077115392580616 * M + 0.2309699031821044 * S,
    g: -1.2684379732850317 * L2 + 2.6097573492876887 * M - 0.3413193760026573 * S,
    b: -0.0041960761386756 * L2 - 0.7034186179359362 * M + 1.7076146940746117 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertOklabToLrgb_default = convertOklabToLrgb;

// node_modules/culori/src/oklab/convertOklabToRgb.js
var convertOklabToRgb = (c2) => convertLrgbToRgb_default(convertOklabToLrgb_default(c2));
var convertOklabToRgb_default = convertOklabToRgb;

// node_modules/culori/src/oklab/parseOklab.js
function parseOklab(color, parsed) {
  if (!parsed || parsed[0] !== "oklab") {
    return void 0;
  }
  const res = { mode: "oklab" };
  const [, l, a, b, alpha] = parsed;
  if (l.type === Tok.Hue || a.type === Tok.Hue || b.type === Tok.Hue) {
    return void 0;
  }
  if (l.type !== Tok.None) {
    res.l = Math.min(
      Math.max(0, l.type === Tok.Number ? l.value : l.value / 100),
      1
    );
  }
  if (a.type !== Tok.None) {
    res.a = a.type === Tok.Number ? a.value : a.value * 0.4 / 100;
  }
  if (b.type !== Tok.None) {
    res.b = b.type === Tok.Number ? b.value : b.value * 0.4 / 100;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseOklab_default = parseOklab;

// node_modules/culori/src/oklab/definition.js
var definition8 = {
  ...definition_default5,
  mode: "oklab",
  toMode: {
    lrgb: convertOklabToLrgb_default,
    rgb: convertOklabToRgb_default
  },
  fromMode: {
    lrgb: convertLrgbToOklab_default,
    rgb: convertRgbToOklab_default
  },
  ranges: {
    l: [0, 1],
    a: [-0.4, 0.4],
    b: [-0.4, 0.4]
  },
  parse: [parseOklab_default],
  serialize: (c2) => `oklab(${c2.l !== void 0 ? c2.l : "none"} ${c2.a !== void 0 ? c2.a : "none"} ${c2.b !== void 0 ? c2.b : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`
};
var definition_default8 = definition8;

// node_modules/culori/src/oklch/parseOklch.js
function parseOklch(color, parsed) {
  if (!parsed || parsed[0] !== "oklch") {
    return void 0;
  }
  const res = { mode: "oklch" };
  const [, l, c2, h, alpha] = parsed;
  if (l.type !== Tok.None) {
    if (l.type === Tok.Hue) {
      return void 0;
    }
    res.l = Math.min(
      Math.max(0, l.type === Tok.Number ? l.value : l.value / 100),
      1
    );
  }
  if (c2.type !== Tok.None) {
    res.c = Math.max(
      0,
      c2.type === Tok.Number ? c2.value : c2.value * 0.4 / 100
    );
  }
  if (h.type !== Tok.None) {
    if (h.type === Tok.Percentage) {
      return void 0;
    }
    res.h = h.value;
  }
  if (alpha.type !== Tok.None) {
    res.alpha = Math.min(
      1,
      Math.max(
        0,
        alpha.type === Tok.Number ? alpha.value : alpha.value / 100
      )
    );
  }
  return res;
}
var parseOklch_default = parseOklch;

// node_modules/culori/src/oklch/definition.js
var definition9 = {
  ...definition_default6,
  mode: "oklch",
  toMode: {
    oklab: (c2) => convertLchToLab_default(c2, "oklab"),
    rgb: (c2) => convertOklabToRgb_default(convertLchToLab_default(c2, "oklab"))
  },
  fromMode: {
    rgb: (c2) => convertLabToLch_default(convertRgbToOklab_default(c2), "oklch"),
    oklab: (c2) => convertLabToLch_default(c2, "oklch")
  },
  parse: [parseOklch_default],
  serialize: (c2) => `oklch(${c2.l !== void 0 ? c2.l : "none"} ${c2.c !== void 0 ? c2.c : "none"} ${c2.h !== void 0 ? c2.h : "none"}${c2.alpha < 1 ? ` / ${c2.alpha}` : ""})`,
  ranges: {
    l: [0, 1],
    c: [0, 0.4],
    h: [0, 360]
  }
};
var definition_default9 = definition9;

// node_modules/culori/src/p3/convertP3ToXyz65.js
var convertP3ToXyz65 = (rgb4) => {
  let { r: r2, g, b, alpha } = convertRgbToLrgb_default(rgb4);
  let res = {
    mode: "xyz65",
    x: 0.486570948648216 * r2 + 0.265667693169093 * g + 0.1982172852343625 * b,
    y: 0.2289745640697487 * r2 + 0.6917385218365062 * g + 0.079286914093745 * b,
    z: 0 * r2 + 0.0451133818589026 * g + 1.043944368900976 * b
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertP3ToXyz65_default = convertP3ToXyz65;

// node_modules/culori/src/p3/convertXyz65ToP3.js
var convertXyz65ToP3 = ({ x, y, z, alpha }) => {
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = convertLrgbToRgb_default(
    {
      r: x * 2.4934969119414263 - y * 0.9313836179191242 - 0.402710784450717 * z,
      g: x * -0.8294889695615749 + y * 1.7626640603183465 + 0.0236246858419436 * z,
      b: x * 0.0358458302437845 - y * 0.0761723892680418 + 0.9568845240076871 * z
    },
    "p3"
  );
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToP3_default = convertXyz65ToP3;

// node_modules/culori/src/p3/definition.js
var definition10 = {
  ...definition_default,
  mode: "p3",
  parse: ["display-p3"],
  serialize: "display-p3",
  fromMode: {
    rgb: (color) => convertXyz65ToP3_default(convertRgbToXyz65_default(color)),
    xyz65: convertXyz65ToP3_default
  },
  toMode: {
    rgb: (color) => convertXyz65ToRgb_default(convertP3ToXyz65_default(color)),
    xyz65: convertP3ToXyz65_default
  }
};
var definition_default10 = definition10;

// node_modules/culori/src/xyz65/convertXyz65ToXyz50.js
var convertXyz65ToXyz50 = (xyz65) => {
  let { x, y, z, alpha } = xyz65;
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "xyz50",
    x: 1.0479298208405488 * x + 0.0229467933410191 * y - 0.0501922295431356 * z,
    y: 0.0296278156881593 * x + 0.990434484573249 * y - 0.0170738250293851 * z,
    z: -0.0092430581525912 * x + 0.0150551448965779 * y + 0.7518742899580008 * z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz65ToXyz50_default = convertXyz65ToXyz50;

// node_modules/culori/src/xyz65/convertXyz50ToXyz65.js
var convertXyz50ToXyz65 = (xyz50) => {
  let { x, y, z, alpha } = xyz50;
  if (x === void 0) x = 0;
  if (y === void 0) y = 0;
  if (z === void 0) z = 0;
  let res = {
    mode: "xyz65",
    x: 0.9554734527042182 * x - 0.0230985368742614 * y + 0.0632593086610217 * z,
    y: -0.0283697069632081 * x + 1.0099954580058226 * y + 0.021041398966943 * z,
    z: 0.0123140016883199 * x - 0.0205076964334779 * y + 1.3303659366080753 * z
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertXyz50ToXyz65_default = convertXyz50ToXyz65;

// node_modules/culori/src/xyz65/definition.js
var definition11 = {
  mode: "xyz65",
  toMode: {
    rgb: convertXyz65ToRgb_default,
    xyz50: convertXyz65ToXyz50_default
  },
  fromMode: {
    rgb: convertRgbToXyz65_default,
    xyz50: convertXyz50ToXyz65_default
  },
  ranges: {
    x: [0, 0.95],
    y: [0, 1],
    z: [0, 1.088]
  },
  channels: ["x", "y", "z", "alpha"],
  parse: ["xyz", "xyz-d65"],
  serialize: "xyz-d65",
  interpolate: {
    x: interpolatorLinear,
    y: interpolatorLinear,
    z: interpolatorLinear,
    alpha: { use: interpolatorLinear, fixup: fixupAlpha }
  }
};
var definition_default11 = definition11;

// node_modules/culori/src/round.js
var r = (value, precision) => Math.round(value * (precision = Math.pow(10, precision))) / precision;
var round = (precision = 4) => (value) => typeof value === "number" ? r(value, precision) : value;
var round_default = round;

// node_modules/culori/src/formatter.js
var twoDecimals = round_default(2);
var clamp = (value) => Math.max(0, Math.min(1, value || 0));
var fixup = (value) => Math.round(clamp(value) * 255);
var rgb = converter_default("rgb");
var hsl = converter_default("hsl");
var serializeHex = (color) => {
  if (color === void 0) {
    return void 0;
  }
  let r2 = fixup(color.r);
  let g = fixup(color.g);
  let b = fixup(color.b);
  return "#" + (1 << 24 | r2 << 16 | g << 8 | b).toString(16).slice(1);
};
var formatHex = (c2) => serializeHex(rgb(c2));

// node_modules/culori/src/map.js
var mapper = (fn4, mode = "rgb", preserve_mode = false) => {
  let channels = mode ? getMode(mode).channels : null;
  let conv = mode ? converter_default(mode) : prepare_default;
  return (color) => {
    let conv_color = conv(color);
    if (!conv_color) {
      return void 0;
    }
    let res = (channels || getMode(conv_color.mode).channels).reduce(
      (res2, ch) => {
        let v = fn4(conv_color[ch], ch, conv_color, mode);
        if (v !== void 0 && !isNaN(v)) {
          res2[ch] = v;
        }
        return res2;
      },
      { mode: conv_color.mode }
    );
    if (!preserve_mode) {
      return res;
    }
    let prep = prepare_default(color);
    if (prep && prep.mode !== res.mode) {
      return converter_default(prep.mode)(res);
    }
    return res;
  };
};
var mapAlphaMultiply = (v, ch, c2) => {
  if (ch !== "alpha") {
    return (v || 0) * (c2.alpha !== void 0 ? c2.alpha : 1);
  }
  return v;
};
var mapAlphaDivide = (v, ch, c2) => {
  if (ch !== "alpha" && c2.alpha !== 0) {
    return (v || 0) / (c2.alpha !== void 0 ? c2.alpha : 1);
  }
  return v;
};

// node_modules/culori/src/util/normalizePositions.js
var normalizePositions = (arr) => {
  if (arr[0] === void 0) {
    arr[0] = 0;
  }
  if (arr[arr.length - 1] === void 0) {
    arr[arr.length - 1] = 1;
  }
  let i = 1;
  let j;
  let from_idx;
  let from_pos;
  let inc;
  while (i < arr.length) {
    if (arr[i] === void 0) {
      from_idx = i;
      from_pos = arr[i - 1];
      j = i;
      while (arr[j] === void 0) j++;
      inc = (arr[j] - from_pos) / (j - i + 1);
      while (i < j) {
        arr[i] = from_pos + (i + 1 - from_idx) * inc;
        i++;
      }
    } else if (arr[i] < arr[i - 1]) {
      arr[i] = arr[i - 1];
    }
    i++;
  }
  return arr;
};
var normalizePositions_default = normalizePositions;

// node_modules/culori/src/easing/midpoint.js
var midpoint = (H = 0.5) => (t) => H <= 0 ? 1 : H >= 1 ? 0 : Math.pow(t, Math.log(0.5) / Math.log(H));
var midpoint_default = midpoint;

// node_modules/culori/src/interpolate/interpolate.js
var isfn = (o) => typeof o === "function";
var isobj = (o) => o && typeof o === "object";
var isnum = (o) => typeof o === "number";
var interpolate_fn = (colors, mode = "rgb", overrides, premap) => {
  let def = getMode(mode);
  let conv = converter_default(mode);
  let conv_colors = [];
  let positions = [];
  let fns = {};
  colors.forEach((val) => {
    if (Array.isArray(val)) {
      conv_colors.push(conv(val[0]));
      positions.push(val[1]);
    } else if (isnum(val) || isfn(val)) {
      fns[positions.length] = val;
    } else {
      conv_colors.push(conv(val));
      positions.push(void 0);
    }
  });
  normalizePositions_default(positions);
  let fixed = def.channels.reduce((res, ch) => {
    let ffn;
    if (isobj(overrides) && isobj(overrides[ch]) && overrides[ch].fixup) {
      ffn = overrides[ch].fixup;
    } else if (isobj(def.interpolate[ch]) && def.interpolate[ch].fixup) {
      ffn = def.interpolate[ch].fixup;
    } else {
      ffn = (v) => v;
    }
    res[ch] = ffn(conv_colors.map((color) => color[ch]));
    return res;
  }, {});
  if (premap) {
    let ccolors = conv_colors.map((color, idx) => {
      return def.channels.reduce(
        (c2, ch) => {
          c2[ch] = fixed[ch][idx];
          return c2;
        },
        { mode }
      );
    });
    fixed = def.channels.reduce((res, ch) => {
      res[ch] = ccolors.map((c2) => {
        let v = premap(c2[ch], ch, c2, mode);
        return isNaN(v) ? void 0 : v;
      });
      return res;
    }, {});
  }
  let interpolators = def.channels.reduce((res, ch) => {
    let ifn;
    if (isfn(overrides)) {
      ifn = overrides;
    } else if (isobj(overrides) && isfn(overrides[ch])) {
      ifn = overrides[ch];
    } else if (isobj(overrides) && isobj(overrides[ch]) && overrides[ch].use) {
      ifn = overrides[ch].use;
    } else if (isfn(def.interpolate[ch])) {
      ifn = def.interpolate[ch];
    } else if (isobj(def.interpolate[ch])) {
      ifn = def.interpolate[ch].use;
    }
    res[ch] = ifn(fixed[ch]);
    return res;
  }, {});
  let n = conv_colors.length - 1;
  return (t) => {
    t = Math.min(Math.max(0, t), 1);
    if (t <= positions[0]) {
      return conv_colors[0];
    }
    if (t > positions[n]) {
      return conv_colors[n];
    }
    let idx = 0;
    while (positions[idx] < t) idx++;
    let start = positions[idx - 1];
    let delta = positions[idx] - start;
    let P = (t - start) / delta;
    let fn4 = fns[idx] || fns[0];
    if (fn4 !== void 0) {
      if (isnum(fn4)) {
        fn4 = midpoint_default((fn4 - start) / delta);
      }
      P = fn4(P);
    }
    let t0 = (idx - 1 + P) / n;
    return def.channels.reduce(
      (res, channel) => {
        let val = interpolators[channel](t0);
        if (val !== void 0) {
          res[channel] = val;
        }
        return res;
      },
      { mode }
    );
  };
};
var interpolate = (colors, mode = "rgb", overrides) => interpolate_fn(colors, mode, overrides);
var interpolateWith = (premap, postmap) => (colors, mode = "rgb", overrides) => {
  let post = postmap ? mapper(postmap, mode) : void 0;
  let it = interpolate_fn(colors, mode, overrides, premap);
  return post ? (t) => post(it(t)) : it;
};
var interpolateWithPremultipliedAlpha = interpolateWith(
  mapAlphaMultiply,
  mapAlphaDivide
);

// node_modules/culori/src/clamp.js
var rgb2 = converter_default("rgb");
var fixup_rgb = (c2) => {
  const res = {
    mode: c2.mode,
    r: Math.max(0, Math.min(c2.r !== void 0 ? c2.r : 0, 1)),
    g: Math.max(0, Math.min(c2.g !== void 0 ? c2.g : 0, 1)),
    b: Math.max(0, Math.min(c2.b !== void 0 ? c2.b : 0, 1))
  };
  if (c2.alpha !== void 0) {
    res.alpha = c2.alpha;
  }
  return res;
};
var inrange_rgb = (c2) => {
  return c2 !== void 0 && (c2.r === void 0 || c2.r >= 0 && c2.r <= 1) && (c2.g === void 0 || c2.g >= 0 && c2.g <= 1) && (c2.b === void 0 || c2.b >= 0 && c2.b <= 1);
};
function inGamut(mode = "rgb") {
  const { gamut } = getMode(mode);
  if (!gamut) {
    return (color) => true;
  }
  const conv = converter_default(typeof gamut === "string" ? gamut : mode);
  return (color) => inrange_rgb(conv(color));
}
function clampGamut(mode = "rgb") {
  const { gamut } = getMode(mode);
  if (!gamut) {
    return (color) => prepare_default(color);
  }
  const destMode = typeof gamut === "string" ? gamut : mode;
  const destConv = converter_default(destMode);
  const inDestGamut = inGamut(destMode);
  return (color) => {
    const original = prepare_default(color);
    if (!original) {
      return void 0;
    }
    const converted = destConv(original);
    if (inDestGamut(converted)) {
      return original;
    }
    const clamped = fixup_rgb(converted);
    if (original.mode === clamped.mode) {
      return clamped;
    }
    return converter_default(original.mode)(clamped);
  };
}
function toGamut(dest = "rgb", mode = "oklch", delta = differenceEuclidean("oklch"), jnd = 0.02) {
  const destConv = converter_default(dest);
  const destMode = getMode(dest);
  if (!destMode.gamut) {
    return (color) => destConv(color);
  }
  const inDestinationGamut = inGamut(dest);
  const clipToGamut = clampGamut(dest);
  const ucs = converter_default(mode);
  const { ranges } = getMode(mode);
  if (!ranges.l || !ranges.c) {
    throw new Error("LCH-like space expected");
  }
  return (color) => {
    color = prepare_default(color);
    if (color === void 0) {
      return void 0;
    }
    const candidate = { ...ucs(color) };
    if (candidate.l === void 0) candidate.l = 0;
    if (candidate.c === void 0) candidate.c = 0;
    if (candidate.l >= ranges.l[1]) {
      const res = { ...destMode.white, mode: dest };
      if (color.alpha !== void 0) {
        res.alpha = color.alpha;
      }
      return res;
    }
    if (candidate.l <= ranges.l[0]) {
      const res = { ...destMode.black, mode: dest };
      if (color.alpha !== void 0) {
        res.alpha = color.alpha;
      }
      return res;
    }
    if (inDestinationGamut(candidate)) {
      return destConv(candidate);
    }
    let start = 0;
    let end = candidate.c;
    let epsilon = (ranges.c[1] - ranges.c[0]) / 4e3;
    let clipped = clipToGamut(candidate);
    while (end - start > epsilon) {
      candidate.c = (start + end) * 0.5;
      clipped = clipToGamut(candidate);
      if (inDestinationGamut(candidate) || delta && jnd > 0 && delta(candidate, clipped) <= jnd) {
        start = candidate.c;
      } else {
        end = candidate.c;
      }
    }
    return destConv(inDestinationGamut(candidate) ? candidate : clipped);
  };
}

// node_modules/culori/src/deficiency.js
var rgb3 = converter_default("rgb");
var PROT = [
  [1, 0, -0, 0, 1, 0, -0, -0, 1],
  [
    0.856167,
    0.182038,
    -0.038205,
    0.029342,
    0.955115,
    0.015544,
    -288e-5,
    -1563e-6,
    1.004443
  ],
  [
    0.734766,
    0.334872,
    -0.069637,
    0.05184,
    0.919198,
    0.028963,
    -4928e-6,
    -4209e-6,
    1.009137
  ],
  [
    0.630323,
    0.465641,
    -0.095964,
    0.069181,
    0.890046,
    0.040773,
    -6308e-6,
    -7724e-6,
    1.014032
  ],
  [
    0.539009,
    0.579343,
    -0.118352,
    0.082546,
    0.866121,
    0.051332,
    -7136e-6,
    -0.011959,
    1.019095
  ],
  [
    0.458064,
    0.679578,
    -0.137642,
    0.092785,
    0.846313,
    0.060902,
    -7494e-6,
    -0.016807,
    1.024301
  ],
  [
    0.38545,
    0.769005,
    -0.154455,
    0.100526,
    0.829802,
    0.069673,
    -7442e-6,
    -0.02219,
    1.029632
  ],
  [
    0.319627,
    0.849633,
    -0.169261,
    0.106241,
    0.815969,
    0.07779,
    -7025e-6,
    -0.028051,
    1.035076
  ],
  [
    0.259411,
    0.923008,
    -0.18242,
    0.110296,
    0.80434,
    0.085364,
    -6276e-6,
    -0.034346,
    1.040622
  ],
  [
    0.203876,
    0.990338,
    -0.194214,
    0.112975,
    0.794542,
    0.092483,
    -5222e-6,
    -0.041043,
    1.046265
  ],
  [
    0.152286,
    1.052583,
    -0.204868,
    0.114503,
    0.786281,
    0.099216,
    -3882e-6,
    -0.048116,
    1.051998
  ]
];
var DEUTER = [
  [1, 0, -0, 0, 1, 0, -0, -0, 1],
  [
    0.866435,
    0.177704,
    -0.044139,
    0.049567,
    0.939063,
    0.01137,
    -3453e-6,
    7233e-6,
    0.99622
  ],
  [
    0.760729,
    0.319078,
    -0.079807,
    0.090568,
    0.889315,
    0.020117,
    -6027e-6,
    0.013325,
    0.992702
  ],
  [
    0.675425,
    0.43385,
    -0.109275,
    0.125303,
    0.847755,
    0.026942,
    -795e-5,
    0.018572,
    0.989378
  ],
  [
    0.605511,
    0.52856,
    -0.134071,
    0.155318,
    0.812366,
    0.032316,
    -9376e-6,
    0.023176,
    0.9862
  ],
  [
    0.547494,
    0.607765,
    -0.155259,
    0.181692,
    0.781742,
    0.036566,
    -0.01041,
    0.027275,
    0.983136
  ],
  [
    0.498864,
    0.674741,
    -0.173604,
    0.205199,
    0.754872,
    0.039929,
    -0.011131,
    0.030969,
    0.980162
  ],
  [
    0.457771,
    0.731899,
    -0.18967,
    0.226409,
    0.731012,
    0.042579,
    -0.011595,
    0.034333,
    0.977261
  ],
  [
    0.422823,
    0.781057,
    -0.203881,
    0.245752,
    0.709602,
    0.044646,
    -0.011843,
    0.037423,
    0.974421
  ],
  [
    0.392952,
    0.82361,
    -0.216562,
    0.263559,
    0.69021,
    0.046232,
    -0.01191,
    0.040281,
    0.97163
  ],
  [
    0.367322,
    0.860646,
    -0.227968,
    0.280085,
    0.672501,
    0.047413,
    -0.01182,
    0.04294,
    0.968881
  ]
];
var TRIT = [
  [1, 0, -0, 0, 1, 0, -0, -0, 1],
  [
    0.92667,
    0.092514,
    -0.019184,
    0.021191,
    0.964503,
    0.014306,
    8437e-6,
    0.054813,
    0.93675
  ],
  [
    0.89572,
    0.13333,
    -0.02905,
    0.029997,
    0.9454,
    0.024603,
    0.013027,
    0.104707,
    0.882266
  ],
  [
    0.905871,
    0.127791,
    -0.033662,
    0.026856,
    0.941251,
    0.031893,
    0.01341,
    0.148296,
    0.838294
  ],
  [
    0.948035,
    0.08949,
    -0.037526,
    0.014364,
    0.946792,
    0.038844,
    0.010853,
    0.193991,
    0.795156
  ],
  [
    1.017277,
    0.027029,
    -0.044306,
    -6113e-6,
    0.958479,
    0.047634,
    6379e-6,
    0.248708,
    0.744913
  ],
  [
    1.104996,
    -0.046633,
    -0.058363,
    -0.032137,
    0.971635,
    0.060503,
    1336e-6,
    0.317922,
    0.680742
  ],
  [
    1.193214,
    -0.109812,
    -0.083402,
    -0.058496,
    0.97941,
    0.079086,
    -2346e-6,
    0.403492,
    0.598854
  ],
  [
    1.257728,
    -0.139648,
    -0.118081,
    -0.078003,
    0.975409,
    0.102594,
    -3316e-6,
    0.501214,
    0.502102
  ],
  [
    1.278864,
    -0.125333,
    -0.153531,
    -0.084748,
    0.957674,
    0.127074,
    -989e-6,
    0.601151,
    0.399838
  ],
  [
    1.255528,
    -0.076749,
    -0.178779,
    -0.078411,
    0.930809,
    0.147602,
    4733e-6,
    0.691367,
    0.3039
  ]
];
var deficiency = (lut, t) => {
  let tt = Math.max(0, Math.min(1, t));
  let i = Math.round(tt / 0.1);
  let w = Math.round(tt % 0.1);
  let arr = lut[i];
  if (w > 0 && i < lut.length - 1) {
    let arr_2 = lut[i + 1];
    arr = arr.map((v, idx) => lerp(arr[idx], arr_2[idx], w));
  }
  return (color) => {
    let c2 = prepare_default(color);
    if (c2 === void 0) {
      return void 0;
    }
    let { r: r2, g, b } = rgb3(c2);
    let ret = {
      mode: "rgb",
      r: arr[0] * r2 + arr[1] * g + arr[2] * b,
      g: arr[3] * r2 + arr[4] * g + arr[5] * b,
      b: arr[6] * r2 + arr[7] * g + arr[8] * b
    };
    if (c2.alpha !== void 0) {
      ret.alpha = c2.alpha;
    }
    return converter_default(c2.mode)(ret);
  };
};
var filterDeficiencyProt = (severity = 1) => deficiency(PROT, severity);
var filterDeficiencyDeuter = (severity = 1) => deficiency(DEUTER, severity);
var filterDeficiencyTrit = (severity = 1) => deficiency(TRIT, severity);

// node_modules/culori/src/wcag.js
function luminance(color) {
  let c2 = converter_default("lrgb")(color);
  return 0.2126 * c2.r + 0.7152 * c2.g + 0.0722 * c2.b;
}
function contrast(a, b) {
  let L1 = luminance(a);
  let L2 = luminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// cli/src/engine/parse.js
useMode(definition_default);
useMode(definition_default7);
useMode(definition_default2);
useMode(definition_default3);
useMode(definition_default4);
useMode(definition_default5);
useMode(definition_default6);
useMode(definition_default8);
useMode(definition_default9);
useMode(definition_default11);
useMode(definition_default10);
var toRgb = toGamut("rgb", "oklch");
var asRgb = converter_default("rgb");
var WORDS = {
  rgb: "rgb",
  rgba: "rgb",
  srgb: "rgb",
  hsl: "hsl",
  hsla: "hsl",
  hsv: "hsv",
  hsva: "hsv",
  hsb: "hsv",
  hsba: "hsv",
  hwb: "hwb",
  cmyk: "cmyk",
  lab: "lab",
  cielab: "lab",
  "cie-lab": "lab",
  lch: "lch",
  cielch: "lch",
  oklab: "oklab",
  oklch: "oklch",
  xyz: "xyz",
  "xyz-d65": "xyz",
  ciexyz: "xyz",
  argb: "argb",
  decimal: "decimal",
  int: "decimal",
  integer: "decimal"
};
var NEEDS = {
  rgb: "red, green and blue (0\u2013255, percentages or 0\u20131), and an optional alpha",
  hsl: "hue, saturation and lightness, e.g. 120 50% 50%",
  hsv: "hue, saturation and value (brightness), e.g. 120 50% 80%",
  hwb: "hue, whiteness and blackness, e.g. 120 20% 30%",
  cmyk: "cyan, magenta, yellow and black (0\u2013100 or 0\u20131)",
  lab: "L (0\u2013100), a and b, e.g. 54 81 70",
  lch: "L (0\u2013100), chroma and hue, e.g. 54 107 40",
  oklab: "L (0\u20131 or %), a and b, e.g. 0.63 0.22 0.13",
  oklch: "L (0\u20131 or %), chroma and hue, e.g. 0.63 0.26 29",
  xyz: "X, Y and Z (0\u20131 or 0\u2013100)",
  argb: "alpha, red, green and blue",
  decimal: "one whole number from 0 to 16777215"
};
var fail = (error) => ({ error });
var clamp2 = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
var NUM = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|°|rad|grad|turn)?$/i;
function num3(t) {
  const frac = t.match(/^([+-]?[\d.]+)\/([\d.]+)$/);
  if (frac) return { v: Number(frac[1]) / Number(frac[2]), unit: "", dot: true };
  const m = t.match(NUM);
  if (!m) return null;
  return { v: Number(m[1]), unit: (m[2] || "").toLowerCase().replace("\xB0", "deg"), dot: m[1].includes(".") || /e/i.test(m[1]) };
}
var hueOf = (t) => t.unit === "rad" ? t.v * 180 / Math.PI : t.unit === "grad" ? t.v * 0.9 : t.unit === "turn" ? t.v * 360 : t.v;
var alphaOf = (t) => !t ? 1 : clamp2(t.unit === "%" ? t.v / 100 : t.v > 100 ? t.v / 255 : t.v > 1 ? t.v / 100 : t.v);
var share = (t, frac) => clamp2(t.unit === "%" ? t.v / 100 : frac ? t.v : t.v / 100);
function fromHex(h, argb) {
  if (h.length === 3 || h.length === 4) h = h.split("").map((c2) => c2 + c2).join("");
  if (h.length === 8 && argb) return { hex: h.slice(2), alpha: Math.round(parseInt(h.slice(0, 2), 16) / 255 * 1e3) / 1e3 };
  if (h.length === 8) return { hex: h.slice(0, 6), alpha: Math.round(parseInt(h.slice(6), 16) / 255 * 1e3) / 1e3 };
  return { hex: h, alpha: 1 };
}
function done(c2, alpha, mode) {
  const direct = asRgb(c2);
  const inside = direct && [direct.r, direct.g, direct.b].every((x) => x >= -1e-6 && x <= 1 + 1e-6);
  const rgb4 = inside ? { mode: "rgb", r: clamp2(direct.r), g: clamp2(direct.g), b: clamp2(direct.b) } : toRgb(c2);
  if (!rgb4 || [rgb4.r, rgb4.g, rgb4.b].some((x) => Number.isNaN(x))) return fail("That does not make a color.");
  return { hex: formatHex(rgb4).slice(1), alpha: Math.round(clamp2(alpha ?? 1) * 1e3) / 1e3, mode };
}
function fromNumbers(mode, ts) {
  const n = ts.length;
  const want = (k3) => n < k3 ? fail(`${mode.toUpperCase()} needs ${NEEDS[mode]}.`) : null;
  switch (mode) {
    case "rgb": {
      if (want(3)) return want(3);
      const frac = ts.slice(0, 3).every((t) => t.unit !== "%" && t.v <= 1) && ts.slice(0, 3).some((t) => t.dot);
      const ch = (t) => clamp2(t.unit === "%" ? t.v / 100 : frac ? t.v : t.v / 255);
      if (ts.slice(0, 3).some((t) => t.unit !== "%" && t.v > 255)) return fail("RGB channels go from 0 to 255.");
      return done({ mode: "rgb", r: ch(ts[0]), g: ch(ts[1]), b: ch(ts[2]) }, alphaOf(ts[3]), "rgb");
    }
    case "argb": {
      if (want(4)) return want(4);
      const [a, ...rest] = ts;
      const r2 = fromNumbers("rgb", rest);
      return r2.error ? r2 : { ...r2, alpha: alphaOf(a), mode: "argb" };
    }
    case "hsl":
    case "hsv":
    case "hwb": {
      if (want(3)) return want(3);
      const [h, x, y] = ts;
      const frac = [x, y].every((t) => t.unit !== "%" && t.v <= 1) && [x, y].some((t) => t.dot);
      const hue4 = frac && !h.unit && h.v <= 1 && h.dot ? h.v * 360 : hueOf(h);
      const c2 = mode === "hsl" ? { mode, h: hue4, s: share(x, frac), l: share(y, frac) } : mode === "hsv" ? { mode, h: hue4, s: share(x, frac), v: share(y, frac) } : { mode, h: hue4, w: share(x, frac), b: share(y, frac) };
      return done(c2, alphaOf(ts[3]), mode);
    }
    case "cmyk": {
      if (want(4)) return want(4);
      const frac = ts.slice(0, 4).every((t) => t.unit !== "%" && t.v <= 1);
      const [c2, m, y, k3] = ts.slice(0, 4).map((t) => share(t, frac));
      return done({ mode: "rgb", r: (1 - c2) * (1 - k3), g: (1 - m) * (1 - k3), b: (1 - y) * (1 - k3) }, alphaOf(ts[4]), "cmyk");
    }
    case "lab":
    case "lch": {
      if (want(3)) return want(3);
      const L2 = ts[0].v;
      return done(mode === "lab" ? { mode: "lab", l: L2, a: ts[1].v, b: ts[2].v } : { mode: "lch", l: L2, c: ts[1].v, h: hueOf(ts[2]) }, alphaOf(ts[3]), mode);
    }
    case "oklab":
    case "oklch": {
      if (want(3)) return want(3);
      const L2 = ts[0].unit === "%" || ts[0].v > 1 ? ts[0].v / 100 : ts[0].v;
      const ab = (t) => t.unit === "%" ? t.v / 100 * 0.4 : t.v;
      return done(mode === "oklab" ? { mode: "oklab", l: L2, a: ab(ts[1]), b: ab(ts[2]) } : { mode: "oklch", l: L2, c: ab(ts[1]), h: hueOf(ts[2]) }, alphaOf(ts[3]), mode);
    }
    case "xyz": {
      if (want(3)) return want(3);
      const k3 = ts.slice(0, 3).some((t) => t.v > 1.5 || t.unit === "%") ? 100 : 1;
      return done({ mode: "xyz65", x: ts[0].v / k3, y: ts[1].v / k3, z: ts[2].v / k3 }, alphaOf(ts[3]), "xyz");
    }
    case "decimal": {
      if (n !== 1 || ts[0].dot || ts[0].unit) return fail(`A decimal color is ${NEEDS.decimal}.`);
      let v = ts[0].v;
      if (v < 0) v += 2 ** 32;
      if (v > 4294967295) return fail(`A decimal color is ${NEEDS.decimal}.`);
      if (v > 16777215) return { hex: (v & 16777215).toString(16).padStart(6, "0"), alpha: Math.round(Math.floor(v / 2 ** 24) / 255 * 1e3) / 1e3, mode: "decimal" };
      return { hex: v.toString(16).padStart(6, "0"), alpha: 1, mode: "decimal" };
    }
    default:
      return fail("Unknown color model.");
  }
}
function guess(ts) {
  const n = ts.length;
  if (n === 1 && !ts[0].dot && !ts[0].unit) return "decimal";
  if (ts[0]?.unit && ts[0].unit !== "%") return "hsl";
  if (n >= 3 && !ts[0].unit && (ts[1].unit === "%" || ts[2].unit === "%")) return "hsl";
  if (n === 4 && !ts[3].dot && ts.every((t) => t.v <= 100)) return "cmyk";
  if (n === 3 || n === 4) return "rgb";
  return null;
}
function parseColor(input, opts = {}) {
  if (input == null) return fail("Type a color.");
  let s = String(input).normalize("NFKC").replace(/[−‒–—]/g, "-").trim().replace(/;+$/, "").trim();
  if (!s) return fail("Type a color.");
  const as = WORDS[opts.as] || opts.as;
  const xml = s.match(/<color[^>]*>\s*([^<]+?)\s*<\/color>/i);
  if (xml) return parseColor(xml[1], { ...opts, as: /^#?[0-9a-f]{8}$/i.test(xml[1]) ? "argb" : opts.as });
  const decl = s.match(/^(?:--)?([a-z][\w-]*)\s*[:=]\s*(.+)$/i);
  if (decl && !WORDS[decl[1].toLowerCase()] && !/^(red|green|blue|hue)$/i.test(decl[1])) return parseColor(decl[2], opts);
  const low = s.toLowerCase();
  const named2 = (k3) => {
    const m = low.match(new RegExp(`\\b${k3}\\s*:\\s*([+-]?[\\d.]+(?:\\s*/\\s*[\\d.]+)?)`));
    return m ? num3(m[1].replace(/\s+/g, "")) : null;
  };
  if (/\b(?:red|calibratedred|devicered)\s*:/.test(low)) {
    const r2 = named2("(?:calibrated|device)?red"), g = named2("green"), b = named2("blue"), a = named2("alpha") || named2("opacity");
    if (r2 && g && b) {
      const frac = [r2, g, b].every((t) => t.v <= 1);
      return done({ mode: "rgb", r: frac ? r2.v : r2.v / 255, g: frac ? g.v : g.v / 255, b: frac ? b.v : b.v / 255 }, a ? alphaOf(a) : 1, "rgb");
    }
  }
  if (/\bhue\s*:/.test(low) && /saturation\s*:/.test(low) && /brightness\s*:/.test(low)) {
    const h = named2("hue"), sa = named2("saturation"), br = named2("brightness"), a = named2("alpha") || named2("opacity");
    if (h && sa && br) return done({ mode: "hsv", h: h.v <= 1 ? h.v * 360 : h.v, s: sa.v <= 1 ? sa.v : sa.v / 100, v: br.v <= 1 ? br.v : br.v / 100 }, a ? alphaOf(a) : 1, "hsv");
  }
  const ox = low.match(/0x([0-9a-f]{8}|[0-9a-f]{6})\b/);
  if (ox) return { ...fromHex(ox[1], true), mode: ox[1].length === 8 ? "argb" : "hex" };
  const call = low.match(/(?:color\.)?(rgb|argb|fromargb|fromrgbo)\s*\(([^)]*)\)/);
  if (call && !/^(rgb|rgba)\s*\(/.test(low)) {
    const ts = call[2].split(/[\s,]+/).filter(Boolean).map(num3);
    if (ts.every(Boolean)) {
      if (call[1] === "argb" || call[1] === "fromargb") return fromNumbers("argb", ts);
      return fromNumbers("rgb", ts);
    }
  }
  const quoted = s.match(/["'`]\s*([^"'`]+?)\s*["'`]/);
  if (quoted && quoted[1] !== s) return parseColor(quoted[1], /parsecolor/.test(low) ? { ...opts, as: "argb" } : opts);
  const pref = /^(#|0x|&h|\\x)/.test(low), spaced = /\s/.test(low);
  const hx = low.replace(/^(#|0x|&h|\\x)/, "").replace(/\s+/g, "");
  if (/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hx)) {
    const letters = /[a-f]/.test(hx);
    const isHex = pref || as === "hex" || as === "argb" || letters && (!spaced || /^([0-9a-f]{2}\s+){2,3}[0-9a-f]{2}$/.test(low)) || !letters && !spaced && !as && (hx.length === 3 || hx.length === 6);
    if (isHex) return { ...fromHex(hx, as === "argb"), mode: hx.length === 8 && as === "argb" ? "argb" : "hex" };
  }
  const fn4 = low.match(/^([a-z][a-z0-9-]*)\s*[(:]?\s*(.*?)\s*\)?$/);
  let mode = null, body = low;
  if (fn4 && WORDS[fn4[1]]) {
    mode = WORDS[fn4[1]];
    body = fn4[2];
  } else if (/^color\s*\(/.test(low)) {
    const c3 = parse_default(low);
    return c3 ? done(c3, c3.alpha ?? 1, "rgb") : fail("That CSS color() is not one this reads.");
  }
  if (mode || /^[\s\d.,+\-/%°a-z()]+$/.test(body)) {
    const raw = body.replace(/[()]/g, " ").split(/[\s,]+|\s*\/\s*/).filter(Boolean);
    const ts = raw.map(num3);
    if (raw.length && ts.every(Boolean)) {
      mode ||= as && as !== "hex" && as !== "name" ? as : guess(ts);
      if (mode) return fromNumbers(mode, ts);
    }
  }
  const c2 = parse_default(low);
  if (c2) {
    const r2 = asRgb(c2);
    if (r2) return done(c2, c2.alpha ?? 1, c2.mode === "rgb" ? /^[a-z]+$/.test(low) ? "name" : "rgb" : c2.mode);
  }
  const byName = opts.name?.(s);
  if (byName) return { hex: byName, alpha: 1, mode: "name" };
  return fail(as && NEEDS[as] ? `Could not read that as ${as.toUpperCase()}. It needs ${NEEDS[as]}.` : "Could not read that color. Try #ff5733, rgb 255 87 51, hsl 11 100% 60% or a color name.");
}

// cli/src/engine/color.js
useMode(definition_default);
useMode(definition_default7);
useMode(definition_default2);
useMode(definition_default3);
useMode(definition_default4);
useMode(definition_default5);
useMode(definition_default6);
useMode(definition_default8);
useMode(definition_default9);
useMode(definition_default10);
useMode(definition_default11);
var okDist = differenceEuclidean("oklab");
var toSrgb = toGamut("rgb", "oklch");
var toP3 = toGamut("p3", "oklch");
var col = (hex3) => parse_default("#" + hex3);
var r1 = (n, d = 0) => {
  const f2 = 10 ** d;
  const v = Math.round(n * f2) / f2;
  return Object.is(v, -0) ? 0 : v;
};
var hue3 = (h) => h == null || Number.isNaN(h) ? 0 : r1((h % 360 + 360) % 360, 1);
function info(hex3) {
  const c2 = col(hex3);
  const rgb4 = { r: Math.round(c2.r * 255), g: Math.round(c2.g * 255), b: Math.round(c2.b * 255) };
  const hsl2 = useConv("hsl")(c2), hsv = useConv("hsv")(c2), hwb = useConv("hwb")(c2);
  const lab = useConv("lab")(c2), lch = useConv("lch")(c2), oklab = useConv("oklab")(c2), oklch = useConv("oklch")(c2);
  const p3 = useConv("p3")(c2), xyz = useConv("xyz65")(c2);
  const k3 = 1 - Math.max(c2.r, c2.g, c2.b);
  const cmyk = k3 >= 1 ? { c: 0, m: 0, y: 0, k: 100 } : { c: r1((1 - c2.r - k3) / (1 - k3) * 100), m: r1((1 - c2.g - k3) / (1 - k3) * 100), y: r1((1 - c2.b - k3) / (1 - k3) * 100), k: r1(k3 * 100) };
  const H = (x) => hue3(x);
  const L2 = r1(oklch.l * 100, 2), C3 = r1(oklch.c, 4), Hh = oklch.c < 1e-4 ? 0 : r1(H(oklch.h), 2);
  const v = {
    hex: "#" + hex3,
    hexUpper: "#" + hex3.toUpperCase(),
    rgb: rgb4,
    hsl: { h: H(hsl2.h), s: r1(hsl2.s * 100, 1), l: r1(hsl2.l * 100, 1) },
    hsv: { h: H(hsv.h), s: r1(hsv.s * 100, 1), v: r1(hsv.v * 100, 1) },
    hwb: { h: H(hwb.h), w: r1(hwb.w * 100, 1), b: r1(hwb.b * 100, 1) },
    cmyk,
    lab: { l: r1(lab.l, 2), a: r1(lab.a, 2), b: r1(lab.b, 2) },
    lch: { l: r1(lch.l, 2), c: r1(lch.c, 2), h: H(lch.h) },
    oklab: { l: r1(oklab.l, 4), a: r1(oklab.a, 4), b: r1(oklab.b, 4) },
    oklch: { l: L2, c: C3, h: Hh },
    p3: { r: r1(p3.r, 4), g: r1(p3.g, 4), b: r1(p3.b, 4) },
    xyz: { x: r1(xyz.x * 100, 2), y: r1(xyz.y * 100, 2), z: r1(xyz.z * 100, 2) },
    decimal: parseInt(hex3, 16),
    luminance: r1(luminance(c2), 4)
  };
  v.strings = {
    hex: v.hex,
    rgb: `rgb(${rgb4.r} ${rgb4.g} ${rgb4.b})`,
    rgbLegacy: `rgb(${rgb4.r}, ${rgb4.g}, ${rgb4.b})`,
    hsl: `hsl(${v.hsl.h} ${v.hsl.s}% ${v.hsl.l}%)`,
    hsv: `hsv(${v.hsv.h}, ${v.hsv.s}%, ${v.hsv.v}%)`,
    hwb: `hwb(${v.hwb.h} ${v.hwb.w}% ${v.hwb.b}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    lab: `lab(${v.lab.l}% ${v.lab.a} ${v.lab.b})`,
    lch: `lch(${v.lch.l}% ${v.lch.c} ${v.lch.h})`,
    oklab: `oklab(${r1(oklab.l * 100, 2)}% ${v.oklab.a} ${v.oklab.b})`,
    oklch: `oklch(${L2}% ${C3} ${Hh})`,
    p3: `color(display-p3 ${v.p3.r} ${v.p3.g} ${v.p3.b})`,
    xyz: `color(xyz-d65 ${r1(xyz.x, 4)} ${r1(xyz.y, 4)} ${r1(xyz.z, 4)})`,
    decimal: String(v.decimal),
    android: `0xFF${hex3.toUpperCase()}`,
    swift: `Color(red: ${r1(c2.r, 3)}, green: ${r1(c2.g, 3)}, blue: ${r1(c2.b, 3)})`,
    uikit: `UIColor(red: ${r1(c2.r, 3)}, green: ${r1(c2.g, 3)}, blue: ${r1(c2.b, 3)}, alpha: 1)`,
    flutter: `Color(0xFF${hex3.toUpperCase()})`
  };
  return v;
}
var converters2 = {};
function useConv(mode) {
  return converters2[mode] ||= converter_default(mode);
}
function contrast2(a, b) {
  const x = contrast(col(a), col(b)), r2 = r1(x, 2);
  return [3, 4.5, 7].some((t) => x < t && r2 >= t) ? Math.floor(x * 100) / 100 : r2;
}
var inSrgb = inGamut("rgb");
function cvd(filter, severity = 1) {
  const f2 = filter(severity);
  return (c2) => {
    const l = useConv("lrgb")(c2);
    const o = f2({ mode: "rgb", r: l.r, g: l.g, b: l.b, alpha: c2.alpha });
    return useConv("rgb")({ mode: "lrgb", r: Math.max(0, Math.min(1, o.r)), g: Math.max(0, Math.min(1, o.g)), b: Math.max(0, Math.min(1, o.b)) });
  };
}
function moods(hexes) {
  const all = hexes.map((h) => useConv("oklch")(col(h)));
  const darkest = all.reduce((m, x) => x.l < m.l ? x : m, all[0]);
  const o = all.length > 3 && darkest.l < 0.32 ? all.filter((x) => x !== darkest) : all;
  const avgL = o.reduce((s, x) => s + x.l, 0) / o.length, avgC = o.reduce((s, x) => s + x.c, 0) / o.length;
  const maxC = Math.max(...o.map((x) => x.c));
  const soft = o.filter((x) => x.l > 0.78 && x.c >= 0.015 && x.c < 0.13).length;
  const warm = o.filter((x) => x.c > 0.04 && ((x.h || 0) < 100 || (x.h || 0) > 330)).length;
  const cool = o.filter((x) => x.c > 0.04 && (x.h || 0) > 160 && (x.h || 0) < 300).length;
  const t = [];
  if (soft >= Math.min(3, o.length - 1) && maxC < 0.16) t.push("pastel");
  if (avgL < 0.45) t.push("dark");
  if (avgL > 0.75) t.push("light");
  if (maxC > 0.2) t.push("bright");
  if (avgC < 0.06 && maxC < 0.12) t.push("muted");
  if (maxC < 0.04) t.push("neutral");
  if (warm >= Math.ceil(o.length / 2)) t.push("warm");
  if (cool >= Math.ceil(o.length / 2)) t.push("cool");
  return t;
}

// cli/src/engine/check-input.js
var MAX_TOKENS = 300;
var CSS_NAMES = new Set("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" "));
var FN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
var BARE_HSL = /^-?[\d.]+(?:deg)?\s+[\d.]+%\s+[\d.]+%(?:\s*\/\s*[\d.]+%?)?$/;
function looksColor(raw) {
  const v = String(raw).trim();
  if (!v || v.length > 120) return false;
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
  if (FN.test(v)) return true;
  if (BARE_HSL.test(v)) return true;
  return CSS_NAMES.has(v.toLowerCase()) || v.toLowerCase() === "transparent";
}
function formatOf(raw) {
  const v = String(raw).trim().toLowerCase();
  if (v.startsWith("#")) return v.length <= 5 || v.length === 7 ? /[A-F]/.test(raw) && !/[a-f]/.test(raw) ? "HEX" : "hex" : "hex8";
  if (BARE_HSL.test(v)) return "hsl-bare";
  const m = v.match(/^([a-z]+)\(/);
  if (m) return m[1].replace(/a$/, "") + (/,/.test(v) ? "-legacy" : "");
  return "name";
}
function mix(v) {
  const m = /^color-mix\(\s*in\s+([\w-]+)(?:\s+(?:shorter|longer|increasing|decreasing)\s+hue)?\s*,(.*)\)$/i.exec(v.trim());
  if (!m) return null;
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of m[2]) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && !depth) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  if (parts.length !== 2) return null;
  const one = (x) => {
    const pm = x.trim().match(/^(.*?)(?:\s+([\d.]+)%)?$/s);
    return { c: parseColor(pm[1].trim()), p: pm[2] != null ? Number(pm[2]) : null };
  };
  const a = one(parts[0]), b = one(parts[1]);
  if (!a.c.hex || !b.c.hex) return null;
  let pa = a.p, pb = b.p;
  if (pa == null && pb == null) {
    pa = 50;
    pb = 50;
  } else if (pa == null) pa = 100 - pb;
  else if (pb == null) pb = 100 - pa;
  const sum = pa + pb;
  if (sum <= 0) return null;
  const space = { srgb: "rgb", "srgb-linear": "lrgb", oklab: "oklab", oklch: "oklch", lab: "lab", lch: "lch", hsl: "hsl", hwb: "hwb", xyz: "xyz65", "xyz-d65": "xyz65", "display-p3": "p3" }[m[1].toLowerCase()] || "oklab";
  const ca = parse_default("#" + a.c.hex), cb = parse_default("#" + b.c.hex);
  ca.alpha = a.c.alpha ?? 1;
  cb.alpha = b.c.alpha ?? 1;
  const out = interpolate([ca, cb], space)(pb / sum);
  return { hex: formatHex(out).slice(1), alpha: Math.round(Math.min(1, out.alpha ?? 1) * (sum < 100 ? sum / 100 : 1) * 1e3) / 1e3 };
}
var readOne = (raw) => {
  if (/^color-mix\(/i.test(String(raw).trim())) return mix(raw);
  const r2 = parseColor(String(raw).trim());
  return r2.hex ? { hex: r2.hex, alpha: r2.alpha ?? 1 } : null;
};
function blankComments(s, line = true) {
  let out = s.replace(/\/\*[^]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  if (line) out = out.replace(/(^|[^:"'(\w\/])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
  return out;
}
var DARK_SEL = /\.dark\b|\[data-(?:[\w-]*theme|mode|color-scheme)=["']?dark|\.theme-dark|\bdark-theme\b|\[theme=["']?dark/i;
var DARK_MEDIA = /prefers-color-scheme\s*:\s*dark/i;
var LIGHT_SEL = /\.light\b|\[data-(?:theme|mode|color-scheme)=["']?light|prefers-color-scheme\s*:\s*light/i;
var MODE_ATTR = `\\[data-(?:[\\w-]*theme|mode|color-scheme)(?:=["']?(?:light|dark)["']?)?\\]`;
var GLOBAL_PART = new RegExp(`^((:root|html|body|:host|\\*)?(${MODE_ATTR}|\\.(dark|light)(-theme|-mode)?|:not\\(\\.dark\\)|:not\\(\\.light\\)|:not\\(${MODE_ATTR}\\))*|:root|html|body|:host|\\*|\\.dark|\\.light)$`, "i");
function isGlobalScope(prelude) {
  const p = String(prelude || "").trim().replace(/:(?:where|is)\(([^()]*)\)/g, "$1");
  if (!p || /^@(media|supports|layer|theme|container|document|scope)\b/i.test(p)) return true;
  if (p.startsWith("@")) return false;
  return p.split(",").some((x) => GLOBAL_PART.test(x.trim().replace(/\s+/g, " ")) || /^(:root|html)\s+(body)?$/.test(x.trim()));
}
var PROPS = {
  color: "fg",
  "background-color": "bg",
  background: "bg",
  "border-color": "border",
  border: "border",
  "border-top": "border",
  "border-bottom": "border",
  outline: "outline",
  "outline-color": "outline",
  fill: "fill",
  stroke: "stroke",
  "caret-color": "caret",
  "text-decoration-color": "decoration",
  "column-rule-color": "border"
};
function readCss(text2) {
  const src = blankComments(text2, /^\s*[$@][\w-]+\s*:/m.test(text2) && !/^\s*@(media|supports|import|font-face|layer|container|charset|keyframes)\b/m.test(text2.slice(0, 0)));
  const tokens = [], rules = [];
  const stack = [];
  let i = 0, start = 0;
  const darkSel = (p) => {
    const parts = String(p).split(",").map((x) => x.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, ""));
    return parts.every((x) => DARK_SEL.test(x));
  };
  const mode = () => stack.some((p) => DARK_MEDIA.test(p) || !p.startsWith("@") && darkSel(p)) ? "dark" : "light";
  const decls = [];
  const flushDecl = (from, to) => {
    const d = src.slice(from, to);
    const m = d.match(/^\s*([$@]?-{0,2}[A-Za-z_][\w-]*)\s*:\s*/);
    if (!m || d.slice(m[0].length).trim() === "") return;
    let vs = from + m[0].length, ve = to;
    while (ve > vs && /\s/.test(src[ve - 1])) ve--;
    let val = src.slice(vs, ve);
    const imp = val.match(/\s*!(?:important|default|global)\s*$/i);
    if (imp) {
      val = val.slice(0, -imp[0].length);
      ve -= imp[0].length;
    }
    if (stack.some((p) => /^@media\b[^{]*\bprint\b/i.test(p) && !/screen/i.test(p))) return;
    decls.push({ supports: stack.some((p) => /^@supports\b/i.test(p)), prop: m[1], value: val, span: [vs, ve], depth: stack.length, prelude: stack[stack.length - 1] || "", global: stack.every(isGlobalScope), mode: mode(), scoped: stack.some((p) => LIGHT_SEL.test(p)), block: blockId });
  };
  let blockId = 0, blockSeq = 0;
  const blockStack = [];
  let quote = null, paren = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "(") {
      paren++;
      continue;
    }
    if (ch === ")") {
      paren = Math.max(0, paren - 1);
      continue;
    }
    if (paren) continue;
    if (ch === "{") {
      const prelude = src.slice(start, i).trim();
      stack.push(prelude);
      blockStack.push(blockId);
      blockId = ++blockSeq;
      start = i + 1;
    } else if (ch === "}") {
      flushDecl(start, i);
      stack.pop();
      blockId = blockStack.pop() ?? 0;
      start = i + 1;
    } else if (ch === ";") {
      flushDecl(start, i);
      start = i + 1;
    }
  }
  flushDecl(start, src.length);
  let firstTheme = null;
  if (!decls.some((d) => d.global && d.prop.startsWith("--") && looksColor(d.value.trim()))) {
    const d0 = decls.find((d) => d.prop.startsWith("--") && looksColor(d.value.trim()) && /theme|\[data-[\w-]*(theme|mode)|color-scheme/i.test(d.prelude));
    const key = d0 && (d0.prelude.match(/\.[\w-]+|\[data-[\w-]+=["']?[\w-]+["']?\]/) || [])[0];
    if (key) {
      firstTheme = key;
      for (const d of decls) if (d.prelude.includes(key)) {
        d.global = true;
        if (DARK_SEL.test(d.prelude) && !DARK_SEL.test(key)) d.mode = "dark";
      }
    }
  }
  const vars = /* @__PURE__ */ new Map();
  const themeScopes = /* @__PURE__ */ new Set();
  const unread = /* @__PURE__ */ new Map();
  const scoped = /* @__PURE__ */ new Map();
  const keep = (t, d) => {
    const k3 = `${t.name}|${t.mode}`;
    const was = vars.get(k3);
    if (was && d && d.supports) {
      was.p3Copy = true;
      return;
    }
    if (was) was.dropped = true;
    vars.set(k3, t);
    tokens.push(t);
  };
  for (const d of decls) {
    if (d.prop.startsWith("--tw-")) continue;
    const isVar = d.prop.startsWith("--") || (d.prop.startsWith("$") || d.prop.startsWith("@") && !/^@(media|supports|import|font-face|keyframes|layer|theme|container|tailwind|apply|use|forward|include|mixin|function|return|if|else|each|for|while|charset|namespace|page)$/.test(d.prop)) && d.depth <= 1;
    if (!isVar) continue;
    const raw = d.value.trim();
    if (d.prop.startsWith("--") && !d.global) {
      scoped.set(`${d.block}|${d.prop}`, raw);
      if (/theme|\[data-/i.test(d.prelude) && looksColor(raw)) themeScopes.add(d.prelude.replace(/\s+/g, " ").slice(0, 60));
      continue;
    }
    const ref = raw.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/) || raw.match(/^([$@][\w-]+)$/);
    const hslRef = raw.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    const ld = splitLightDark(raw);
    if (ld) {
      for (const [m, part] of [["light", ld[0]], ["dark", ld[1]]]) {
        if (!looksColor(part.text)) continue;
        const c2 = readOne(part.text);
        if (!c2) continue;
        const at = d.span[0] + part.at;
        const tk = { name: d.prop, mode: m, raw: part.text, span: [at, at + part.text.length], format: formatOf(part.text), ...c2 };
        keep(tk, d);
      }
      continue;
    }
    const t = { name: d.prop, mode: d.mode, raw, span: d.span, format: formatOf(raw) };
    if (ref) {
      t.alias = ref[1];
      if (ref[2] && looksColor(ref[2])) t.fallback = ref[2].trim();
    } else if (hslRef) {
      t.alias = hslRef[2];
      t.wrap = hslRef[1].toLowerCase();
      t.wrapAlpha = hslRef[3];
      t.span = null;
    } else if (looksColor(raw)) {
      const c2 = readOne(raw);
      if (!c2) continue;
      Object.assign(t, c2);
    } else {
      const fn4 = raw.match(/^([a-z][\w-]*)\(/i)?.[1] || (raw.includes("#{") ? "#{\u2026}" : null);
      if (fn4 && /colou?r|bg|background|text|fg|border|primary|secondary|accent|brand|link|success|danger|warning|info|surface/i.test(d.prop + " " + raw) && !/^(calc|var|url|min|max|clamp|env|attr|counter|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient)$/i.test(fn4)) unread.set(fn4, (unread.get(fn4) || 0) + 1);
      continue;
    }
    keep(t, d);
  }
  for (let i2 = tokens.length - 1; i2 >= 0; i2--) if (tokens[i2].dropped) tokens.splice(i2, 1);
  const lookup = (name, m) => vars.get(`${name}|${m}`) || vars.get(`${name}|light`);
  const resolve = (t, seen = /* @__PURE__ */ new Set()) => {
    if (t.hex || !t.alias) return t;
    if (seen.has(t)) return t;
    seen.add(t);
    const to = lookup(t.alias, t.mode);
    if (!to) return t;
    resolve(to, seen);
    if (t.wrap && to.raw) {
      const c2 = readOne(`${t.wrap}(${to.raw}${t.wrapAlpha ? ` / ${t.wrapAlpha}` : ""})`);
      if (c2) Object.assign(t, c2, { via: to.name });
    } else if (to.hex) Object.assign(t, { hex: to.hex, alpha: to.alpha, via: to.name });
    return t;
  };
  tokens.forEach((t) => resolve(t));
  for (const t of tokens) if (!t.hex && t.fallback) {
    const c2 = readOne(t.fallback);
    if (c2) Object.assign(t, c2);
  }
  if (tokens.some((t) => t.mode === "dark")) {
    for (const t of tokens.filter((x) => x.mode === "light" && x.alias && !vars.has(`${x.name}|dark`))) {
      const to = vars.get(`${t.alias}|dark`);
      if (!to) continue;
      resolve(to);
      const c2 = t.wrap && to.raw ? readOne(`${t.wrap}(${to.raw}${t.wrapAlpha ? ` / ${t.wrapAlpha}` : ""})`) : to.hex ? { hex: to.hex, alpha: to.alpha } : null;
      if (c2) {
        const d = { ...t, ...c2, mode: "dark", span: null, via: to.name };
        vars.set(`${t.name}|dark`, d);
        tokens.push(d);
      }
    }
  }
  const valueOf = (raw, m, span, block, depth = 0) => {
    const v = raw.trim();
    if (/gradient\(|url\(/i.test(v)) return { image: true };
    const fn4 = v.match(/^(hsla?|rgba?|oklch)\(\s*var\(\s*(--[\w-]+)\s*\)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i);
    if (fn4) {
      const t = lookup(fn4[2], m);
      const c2 = t?.raw && readOne(`${fn4[1]}(${t.raw}${fn4[3] ? ` / ${fn4[3]}` : ""})`);
      return c2 ? { ...c2, token: t.name } : null;
    }
    const vr = v.match(/var\(\s*(--[\w-]+)/) || v.match(/^([$@][\w-]+)$/);
    if (vr) {
      const sv = block != null && depth < 6 && scoped.get(`${block}|${vr[1]}`);
      if (sv) {
        const inner = valueOf(sv, m, null, block, depth + 1);
        return inner ? { ...inner, token: void 0, span: null, raw: void 0 } : null;
      }
      const t = lookup(vr[1], m);
      return t?.hex ? { hex: t.hex, alpha: t.alpha, token: t.name } : null;
    }
    const lit = (x, at) => {
      const c2 = readOne(x);
      return c2 && { ...c2, raw: x, format: formatOf(x), span: span ? [span[0] + at, span[0] + at + x.length] : null };
    };
    if (looksColor(v)) return lit(v, raw.indexOf(v));
    for (const part of v.split(/\s+(?![^(]*\))/)) if (looksColor(part)) return lit(part, raw.indexOf(part));
    return null;
  };
  const byBlock = /* @__PURE__ */ new Map();
  for (const d of decls) {
    const kind = PROPS[d.prop.toLowerCase()];
    if (!kind && !/^font-(size|weight)$/i.test(d.prop)) continue;
    if (!d.prelude || d.prop.startsWith("--")) continue;
    let r2 = byBlock.get(d.block);
    if (!r2) {
      r2 = { selector: d.prelude.replace(/\s+/g, " ").slice(0, 120), mode: d.mode, scoped: d.scoped };
      byBlock.set(d.block, r2);
    }
    if (/^font-size$/i.test(d.prop)) {
      const px = toPx(d.value);
      if (px) r2.fontSize = px;
      continue;
    }
    if (/^font-weight$/i.test(d.prop)) {
      const w = d.value.trim() === "bold" ? 700 : Number(d.value);
      if (w) r2.fontWeight = w;
      continue;
    }
    const ldv = splitLightDark(d.value.trim());
    if (ldv) {
      const off = d.value.indexOf(d.value.trim());
      const lv = valueOf(ldv[0].text, "light", [d.span[0] + off + ldv[0].at, 0], d.block), dv = valueOf(ldv[1].text, "dark", [d.span[0] + off + ldv[1].at, 0], d.block);
      if (lv) {
        r2[kind] = lv;
        r2.scoped = true;
      }
      let twin = byBlock.get(`${d.block}|dark`);
      if (!twin) {
        twin = { selector: r2.selector, mode: "dark", scoped: true, twinOf: r2 };
        byBlock.set(`${d.block}|dark`, twin);
      }
      if (dv) twin[kind] = dv;
      continue;
    }
    const v = valueOf(d.value, d.mode, d.span, d.block);
    if (v && (v.hex || v.image)) {
      r2[kind] = v;
      const tw = byBlock.get(`${d.block}|dark`);
      if (tw && !tw[kind]) tw[kind] = v;
    }
  }
  for (const r2 of byBlock.values()) {
    if (r2.twinOf) {
      for (const k3 of ["fg", "bg", "border", "outline", "fontSize", "fontWeight"]) if (r2[k3] === void 0 && r2.twinOf[k3] !== void 0) r2[k3] = r2.twinOf[k3];
    }
    if (r2.fg || r2.bg || r2.border || r2.outline) rules.push(r2);
  }
  const notes = firstTheme ? [`Only the first theme, ${firstTheme}, is checked${themeScopes.size ? `; ${themeScopes.size} other theme ${themeScopes.size === 1 ? "scope is" : "scopes are"} not` : ""}. Paste one theme at a time to check another.`] : themeScopes.size ? [`${themeScopes.size} other theme ${themeScopes.size === 1 ? "scope was" : "scopes were"} not checked (${[...themeScopes].slice(0, 3).join(", ")}${themeScopes.size > 3 ? ", \u2026" : ""}): only the default light and dark colors are. Paste one theme at a time to check it.`] : [];
  const n = [...unread.values()].reduce((a, b) => a + b, 0);
  if (n) notes.push(`${n} color ${n === 1 ? "value uses" : "values use"} a function this checker cannot work out (${[...unread.keys()].slice(0, 5).map((f2) => f2.startsWith("#") ? f2 : `${f2}()`).join(", ")}), so ${n === 1 ? "it was" : "they were"} not checked. Paste the compiled CSS to check ${n === 1 ? "it" : "them"}.`);
  return { tokens: tokens.filter((t) => t.hex), rules, notes, vars: decls.filter((d) => d.prop.startsWith("--")).length };
}
function splitLightDark(v) {
  const m = /^light-dark\(/i.exec(v);
  if (!m || !v.endsWith(")")) return null;
  const inner = v.slice(m[0].length, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const c2 = inner[i];
    if (c2 === "(") depth++;
    else if (c2 === ")") depth--;
    else if (c2 === "," && !depth) {
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
  return m[2] === "px" ? n : m[2] === "pt" ? n * 4 / 3 : n * 16;
}
function jsonLeaves(text2) {
  const out = [];
  let i = 0;
  const ws = () => {
    while (/\s/.test(text2[i] || "")) i++;
  };
  const str = () => {
    const s = i;
    i++;
    while (i < text2.length && text2[i] !== '"') {
      if (text2[i] === "\\") i++;
      i++;
    }
    i++;
    return { value: JSON.parse(text2.slice(s, i)), span: [s + 1, i - 1] };
  };
  const val = (path5) => {
    ws();
    const c2 = text2[i];
    if (c2 === "{") {
      i++;
      ws();
      if (text2[i] === "}") {
        i++;
        return;
      }
      for (; ; ) {
        ws();
        const k3 = str().value;
        ws();
        i++;
        val([...path5, k3]);
        ws();
        if (text2[i] === ",") {
          i++;
          continue;
        }
        i++;
        return;
      }
    }
    if (c2 === "[") {
      i++;
      ws();
      if (text2[i] === "]") {
        i++;
        return;
      }
      for (let n = 0; ; n++) {
        val([...path5, String(n)]);
        ws();
        if (text2[i] === ",") {
          i++;
          continue;
        }
        i++;
        return;
      }
    }
    if (c2 === '"') {
      const s = str();
      out.push({ path: path5, value: s.value, span: s.span });
      return;
    }
    const m = text2.slice(i).match(/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/);
    i += m ? m[0].length : 1;
  };
  val([]);
  return out;
}
var MODE_WORD = /^(light|dark|day|night|lightmode|darkmode|light-mode|dark-mode)$/i;
var modeOfWord = (w) => /dark|night/i.test(w) ? "dark" : "light";
function json5(text2) {
  let out = "", i = 0;
  while (i < text2.length) {
    const c2 = text2[i];
    if (c2 === '"' || c2 === "'") {
      let j = i + 1, str = "";
      while (j < text2.length && text2[j] !== c2) {
        if (text2[j] === "\\") {
          str += text2[j] + text2[j + 1];
          j += 2;
          continue;
        }
        str += text2[j] === '"' ? '\\"' : text2[j];
        j++;
      }
      out += '"' + str + '"';
      i = j + 1;
      continue;
    }
    if (c2 === "/" && text2[i + 1] === "/") {
      while (i < text2.length && text2[i] !== "\n") i++;
      continue;
    }
    if (c2 === "/" && text2[i + 1] === "*") {
      const e3 = text2.indexOf("*/", i + 2);
      i = e3 < 0 ? text2.length : e3 + 2;
      continue;
    }
    if (/[A-Za-z_$]/.test(c2) && /[{,]\s*$/.test(out)) {
      const m = /^[A-Za-z_$][\w$-]*/.exec(text2.slice(i));
      const after = text2.slice(i + m[0].length).match(/^\s*:/);
      if (after) {
        out += '"' + m[0] + '"';
        i += m[0].length;
        continue;
      }
    }
    out += c2;
    i++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}
function readJson(text2) {
  let data, converted = false;
  try {
    data = JSON.parse(text2);
  } catch {
    try {
      const plain = json5(text2);
      data = JSON.parse(plain);
      text2 = plain;
      converted = true;
    } catch {
      return null;
    }
  }
  const tokens = [];
  const figma = data?.meta?.variables ? Object.values(data.meta.variables) : Array.isArray(data?.variables) ? data.variables : null;
  if (figma && figma.some((v) => v && v.valuesByMode)) {
    const modes2 = /* @__PURE__ */ new Map();
    for (const col3 of Object.values(data?.meta?.variableCollections || {})) for (const m of col3.modes || []) modes2.set(m.modeId, m.name);
    for (const m of data.modes ? Object.entries(data.modes) : []) modes2.set(m[0], m[1]?.name || m[1]);
    const byId = new Map(figma.map((v) => [v.id, v]));
    const rgbOf = (v, modeId, depth = 0) => {
      const x = v.valuesByMode?.[modeId] ?? Object.values(v.valuesByMode || {})[0];
      if (x && x.type === "VARIABLE_ALIAS" && depth < 8) {
        const to = byId.get(x.id);
        return to ? rgbOf(to, modeId in (to.valuesByMode || {}) ? modeId : Object.keys(to.valuesByMode)[0], depth + 1) : null;
      }
      return x && typeof x.r === "number" ? x : null;
    };
    for (const v of figma) {
      if (v.resolvedType && v.resolvedType !== "COLOR") continue;
      for (const modeId of Object.keys(v.valuesByMode || {})) {
        const x = rgbOf(v, modeId);
        if (!x) continue;
        const c2 = readOne(`rgb(${Math.round(x.r * 255)} ${Math.round(x.g * 255)} ${Math.round(x.b * 255)})`);
        const mname = String(modes2.get(modeId) || "");
        tokens.push({ name: String(v.name || v.id).replace(/\//g, "."), ...c2, alpha: x.a ?? 1, mode: /dark|night/i.test(mname) ? "dark" : "light", raw: null, span: null, format: "hex" });
      }
    }
    return { kind: "figma", tokens };
  }
  const leaves = jsonLeaves(text2);
  const dtcg = leaves.some((l) => l.path[l.path.length - 1] === "$value") || /"\$value"\s*:\s*\{/.test(text2);
  const sd = !dtcg && leaves.some((l) => l.path[l.path.length - 1] === "value");
  const byName = /* @__PURE__ */ new Map();
  for (const l of leaves) {
    let path5 = l.path;
    const last = path5[path5.length - 1];
    if (dtcg) {
      if (last !== "$value") continue;
      path5 = path5.slice(0, -1);
    } else if (sd) {
      if (last !== "value") continue;
      path5 = path5.slice(0, -1);
    }
    const modeIdx = path5.findIndex((p) => MODE_WORD.test(p));
    const mode = modeIdx >= 0 ? modeOfWord(path5[modeIdx]) : "light";
    const clean = path5.filter((p, k3) => k3 !== modeIdx && !/^\$/.test(p));
    const name = clean.join(".");
    const raw = String(l.value).trim();
    const t = { name, mode, raw, span: l.span, format: formatOf(raw) };
    const alias = raw.match(/^\{([^}]+)\}$/);
    if (alias) t.alias = alias[1];
    else if (looksColor(raw)) {
      const c2 = readOne(raw);
      if (!c2) continue;
      Object.assign(t, c2);
    } else continue;
    tokens.push(t);
    byName.set(`${name}|${mode}`, t);
  }
  if (dtcg) {
    const walk2 = (o, path5) => {
      if (!o || typeof o !== "object") return;
      if (o.$value && typeof o.$value === "object" && (o.$value.hex || o.$value.components)) {
        const v = o.$value;
        const sp = String(v.colorSpace || "srgb").toLowerCase(), k3 = (v.components || []).map((x) => x === "none" ? 0 : Number(x));
        const css = ["oklch", "oklab", "lab", "lch", "hwb"].includes(sp) ? `${sp}(${k3.join(" ")})` : sp === "hsl" ? `hsl(${k3[0]} ${k3[1]}% ${k3[2]}%)` : `color(${sp} ${k3.join(" ")})`;
        const c2 = v.hex ? readOne(v.hex) : readOne(css);
        const modeIdx = path5.findIndex((p) => MODE_WORD.test(p));
        if (c2) {
          const tk = { name: path5.filter((_, k4) => k4 !== modeIdx && !/^\$/.test(path5[k4])).join("."), ...c2, alpha: v.alpha ?? 1, mode: modeIdx >= 0 ? modeOfWord(path5[modeIdx]) : "light", raw: null, span: null, format: "hex" };
          tokens.push(tk);
          byName.set(`${tk.name}|${tk.mode}`, tk);
        }
        return;
      }
      for (const [k3, x] of Object.entries(o)) if (!k3.startsWith("$")) walk2(x, [...path5, k3]);
    };
    walk2(data, []);
  }
  for (const t of tokens) {
    let x = t, n = 0;
    while (x && !x.hex && x.alias && n++ < 8) x = byName.get(`${x.alias}|${t.mode}`) || byName.get(`${x.alias}|light`);
    if (x?.hex && x !== t) Object.assign(t, { hex: x.hex, alpha: x.alpha, via: x.name });
  }
  const unresolved = tokens.filter((t) => !t.hex && t.alias).length;
  if (converted) for (const t of tokens) t.span = null;
  return { kind: dtcg ? "dtcg" : sd ? "style-dictionary" : "json", tokens: tokens.filter((t) => t.hex), vars: unresolved, notes: unresolved ? [`${unresolved} ${unresolved === 1 ? "token points" : "tokens point"} to a color defined in another file, so ${unresolved === 1 ? "it was" : "they were"} not checked: check the token files together.`] : [] };
}
function readTailwind(text2) {
  const src = blankComments(text2);
  const tokens = [];
  const path5 = [];
  const re = /(?:(['"`]?)([A-Za-z_$][\w$-]*|\d+)\1\s*:\s*(?:(\{)|(['"`])([^'"`\n]*)\4))|(\})/g;
  let m;
  while (m = re.exec(src)) {
    if (m[6]) {
      path5.pop();
      continue;
    }
    const key = m[2];
    if (m[3]) {
      path5.push(key);
      continue;
    }
    const raw = m[5];
    const inColors = path5.includes("colors") || path5.includes("backgroundColor") || path5.includes("textColor");
    if (!inColors || !looksColor(raw)) continue;
    const c2 = readOne(raw);
    if (!c2) continue;
    const at = m.index + m[0].length - raw.length - 1;
    const p = [...path5.slice(path5.lastIndexOf("colors") + 1), key].filter((x) => x !== "DEFAULT");
    tokens.push({ name: p.join("-"), ...c2, mode: "light", raw, span: [at, at + raw.length], format: formatOf(raw) });
  }
  return { tokens };
}
var ANY_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)/gi;
function readList(text2) {
  const tokens = [];
  const seen = /* @__PURE__ */ new Map();
  const add = (raw, start, name) => {
    const c2 = readOne(raw);
    if (!c2) return;
    const n = (name || "").trim().replace(/[:=\s]+$/, "").replace(/^[-*•\s]+/, "").slice(0, 60) || `#${c2.hex}`;
    if (seen.has(n)) {
      if (seen.get(n) === c2.hex) return;
    }
    seen.set(n, c2.hex);
    tokens.push({ name: n, ...c2, mode: "light", raw, span: [start, start + raw.length], format: formatOf(raw), unnamed: !name });
  };
  let m, found = 0;
  ANY_COLOR.lastIndex = 0;
  while (m = ANY_COLOR.exec(text2)) {
    found++;
    const lineStart = text2.lastIndexOf("\n", m.index) + 1;
    const before = text2.slice(lineStart, m.index);
    const nm = before.match(/([A-Za-z][\w .\-/]{0,50}?)\s*[:=]\s*$/);
    add(m[0], m.index, nm ? nm[1] : null);
  }
  if (found) {
    const taken = tokens.map((t) => t.span);
    const re = /(?<![\w#(-])([a-z]+)(?![\w(-])/gi;
    while (m = re.exec(text2)) if (CSS_NAMES.has(m[1].toLowerCase()) && !taken.some(([a, b]) => m.index >= a && m.index < b) && !/[:=]\s*$/.test(text2.slice(text2.lastIndexOf("\n", m.index) + 1, m.index)) && !/[:=]/.test(text2.slice(m.index + m[1].length, text2.indexOf("\n", m.index) < 0 ? void 0 : text2.indexOf("\n", m.index)))) add(m[1], m.index, null);
  }
  if (!found) {
    const re = /[^\s,;|]+/g;
    while (m = re.exec(text2)) {
      const parts = /^[0-9a-f]{6}(?:-[0-9a-f]{6})+$/i.test(m[0]) ? m[0].split("-") : [m[0]];
      let off = m.index;
      for (const p of parts) {
        if (/^[0-9a-f]{3,8}$/i.test(p) || CSS_NAMES.has(p.toLowerCase())) add(p, off, null);
        off += p.length + 1;
      }
    }
  }
  return { tokens };
}
function readInput(text2, max = 2e5) {
  const s = String(text2 || "").slice(0, max);
  const t = s.trim();
  let out;
  if (/^[{[]/.test(t)) {
    const j = readJson(t);
    if (j) out = { kind: j.kind, tokens: j.tokens.map((x) => ({ ...x, span: x.span ? [x.span[0] + s.indexOf(t), x.span[1] + s.indexOf(t)] : null })), rules: [], notes: j.notes, vars: j.vars };
  }
  if (!out && /(module\.exports|export\s+default|\bcolors\s*:\s*\{)/.test(s) && !/--[\w-]+\s*:/.test(s)) {
    out = { kind: "tailwind", ...readTailwind(s), rules: [] };
  }
  if (!out && /[{;]/.test(s) && /(--[\w-]+|\$[\w-]+|@[\w-]+|\b(?:color|background(?:-color)?))\s*:/.test(s)) {
    const c2 = readCss(s);
    out = { kind: /@theme\b/.test(s) ? "tailwind4" : /\$[\w-]+\s*:/.test(s) ? "scss" : /@[\w-]+\s*:/.test(s) && !/--[\w-]+\s*:/.test(s) ? "less" : "css", ...c2 };
  }
  if (!out || !out.tokens.length && !(out.rules || []).length && !out.vars) out = { kind: "list", ...readList(s), rules: [] };
  const warnings = [...out.notes || []];
  if (out.tokens.length > MAX_TOKENS) {
    const step = (t2) => /(^|[-_.])(background|bg|foreground|fg|text|surface|border|primary|accent|muted|card|ring|input|link|destructive|error|success|warning)([-_.]|$)/i.test(t2.name) ? 0 : /[-_.](50|[1-9]00|950|[1-9]|1[0-2])$/.test(t2.name) ? 2 : 1;
    out.tokens = out.tokens.map((t2, i) => [t2, i]).sort((a, b) => step(a[0]) - step(b[0]) || a[1] - b[1]).slice(0, MAX_TOKENS).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
    warnings.push(`Only ${MAX_TOKENS} of the colors are checked: the named ones first, then scale steps.`);
  }
  return { ...out, warnings };
}

// cli/src/engine/check.js
var okDist2 = differenceEuclidean("oklab");
var toOklch = converter_default("oklch");
var toRgb2 = converter_default("rgb");
var toSrgb2 = toGamut("rgb", "oklch");
var col2 = (hex3) => parse_default("#" + hex3);
var r12 = (n, d = 0) => {
  const f2 = 10 ** d;
  const v = Math.round(n * f2) / f2;
  return Object.is(v, -0) ? 0 : v;
};
var fromOklch = (l, c2, h) => formatHex(toSrgb2({ mode: "oklch", l: Math.max(0, Math.min(1, l)), c: c2, h })).slice(1);
var dE = (a, b) => r12(okDist2(col2(a), col2(b)) * 100, 1);
var VERSION = "1.0.0";
var MAX_PAIRS = 400;
var BG_WORDS = ["background", "bg", "surface", "canvas", "card", "popover", "paper", "page", "backdrop", "layer", "container", "sheet", "panel", "well", "sidebar", "modal", "dialog", "overlay", "fill", "highlight", "selection", "hover", "code"];
var FG_WORDS = ["foreground", "fg", "text", "ink", "on", "label", "heading", "title", "copy", "content", "caption", "placeholder", "icon", "font", "type"];
var BORDER_WORDS = ["border", "outline", "ring", "divider", "stroke", "separator", "input", "focus", "hairline", "rule"];
var ACCENT_WORDS = ["primary", "secondary", "tertiary", "accent", "brand", "link", "info", "success", "warning", "warn", "danger", "error", "err", "destructive", "positive", "negative", "critical", "caution", "notice", "attention", "neutral", "muted", "subtle", "ok", "alert"];
var STATUS = ["info", "success", "warning", "warn", "danger", "error", "err", "destructive", "positive", "negative", "critical", "caution", "notice", "ok", "alert", "invalid", "valid"];
var UTILITY = /^\.(?:[\w-]+\\:)*(?:text|bg|border|fill|stroke|from|via|to|ring|outline|decoration|placeholder|caret|accent|divide|shadow|link|btn-outline|bg-gradient)-[\w\\/.\[\]#-]+(?::[\w-]+)*$/;
var SCALE_STEP = /^(50|[1-9]00|950|[1-9]|1[0-2]|[1-9]0|a?[1-9]00)$/i;
function words(name) {
  return String(name).replace(/^(--|\$|@)/, "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase().replace(/([a-z])(\d)/g, "$1-$2").split(/[-_./\s]+/).filter((w) => w && !["md", "sys", "ref", "color", "colors", "colour", "theme", "tw", "semantic", "global", "default", "token", "tokens", "value", "chakra", "mantine", "bs", "ui", "sl"].includes(w));
}
var PRIMITIVE = /(^|[.\-_/])(base|primitives?|palette|core|ref|ramps?|scales?|raw|swatch(es)?)[.\-_/]./i;
function roleOf(name) {
  const w = words(name);
  if (!w.length) return { role: null };
  if (w.includes("disabled") || w.includes("inactive")) return { role: "ignore", why: "disabled: exempt from contrast" };
  if (PRIMITIVE.test(String(name).replace(/^(--|\$|@)/, "")) && !w.some((x) => ["on", "foreground", "fg", "text", "background", "bg", "surface", "border"].includes(x))) return { role: "scale", primitive: true };
  const has = (list) => w.some((x) => list.includes(x));
  const last = w[w.length - 1];
  if (/^(chart|series|data|categorical|viz|graph|plot)$/.test(w[0]) || w.includes("chart")) return { role: "chart" };
  const onIdx = w.indexOf("on");
  if (onIdx >= 0 && onIdx < w.length - 1) return { role: "text", on: w.slice(onIdx + 1).join("-"), why: "named on-\u2026" };
  if (w.length > 1 && ["foreground", "fg", "contrast", "text", "content", "ink", "icon"].includes(last) && !FG_WORDS.includes(w[0])) {
    return { role: "text", on: w.slice(0, -1).join("-"), why: `named \u2026-${last}` };
  }
  if (has(BORDER_WORDS)) return { role: has(["input", "ring", "focus", "outline", "field"]) ? "control" : "border" };
  if (FG_WORDS.includes(w[0]) && w.length > 1 && !has(BG_WORDS)) return { role: "text", sub: w.slice(1).join("-") };
  if (has(FG_WORDS) && !has(BG_WORDS)) return { role: "text" };
  if (has(BG_WORDS)) return { role: "bg", accent: has(ACCENT_WORDS) };
  if (SCALE_STEP.test(last) && w.length > 1) return { role: "scale", stem: w.slice(0, -1).join("-") };
  if (has(STATUS)) return { role: "accent", status: true };
  if (has(ACCENT_WORDS)) return { role: "accent", muted: has(["muted", "subtle", "neutral"]) };
  return { role: null };
}
var L = (hex3) => toOklch(col2(hex3)).l;
var C = (hex3) => toOklch(col2(hex3)).c || 0;
function over(hex3, alpha, bg) {
  if (alpha == null || alpha >= 1) return hex3;
  const a = toRgb2(col2(hex3)), b = toRgb2(col2(bg));
  const m = (x, y) => x * alpha + y * (1 - alpha);
  return formatHex({ mode: "rgb", r: m(a.r, b.r), g: m(a.g, b.g), b: m(a.b, b.b) }).slice(1);
}
var TARGETS = {
  AA: { text: 4.5, large: 3, ui: 3, label: "WCAG 2 AA" },
  AAA: { text: 7, large: 4.5, ui: 3, label: "WCAG 2 AAA" }
};
var KIND_LABEL = { text: "text", large: "large text", ui: "UI part", decor: "decoration" };
var kindLabel = (k3) => KIND_LABEL[k3] || k3;
var isLarge = (px, weight = 400) => px >= 24 || weight >= 700 && px >= 18.66;
var needOf = (kind, target) => kind === "decor" ? 0 : (TARGETS[target] || TARGETS.AA)[kind] ?? 4.5;
var VISION = [
  { id: "protanopia", label: "Protanopia", note: "no red cones, about 1% of men", f: cvd(filterDeficiencyProt, 1) },
  { id: "deuteranopia", label: "Deuteranopia", note: "no green cones, about 1% of men", f: cvd(filterDeficiencyDeuter, 1) },
  { id: "tritanopia", label: "Tritanopia", note: "no blue cones, rare", f: cvd(filterDeficiencyTrit, 1) },
  { id: "protanomaly", label: "Protanomaly", note: "weak red cones, about 1% of men", f: cvd(filterDeficiencyProt, 0.6) },
  { id: "deuteranomaly", label: "Deuteranomaly", note: "weak green cones, about 5% of men, the most common", f: cvd(filterDeficiencyDeuter, 0.6) },
  { id: "tritanomaly", label: "Tritanomaly", note: "weak blue cones, rare", f: cvd(filterDeficiencyTrit, 0.6) },
  { id: "achromatopsia", label: "Achromatopsia", note: "no color at all, very rare", f: (c2) => ({ mode: "oklch", l: toOklch(c2).l, c: 0, h: 0 }) }
];
var simCache = /* @__PURE__ */ new Map();
function seeAs(hex3, id) {
  const k3 = `${hex3}|${id}`;
  let v = simCache.get(k3);
  if (!v) {
    const t = VISION.find((x) => x.id === id);
    v = formatHex(toSrgb2(t.f(col2(hex3)))).slice(1);
    if (simCache.size > 2e4) simCache.clear();
    simCache.set(k3, v);
  }
  return v;
}
function glareRatio(a, b, veil = 0.1) {
  const la = luminance(col2(a)) + veil, lb = luminance(col2(b)) + veil;
  return r12((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05), 2);
}
function plan(read, opts = {}) {
  const tokens = read.tokens.map((t, i) => ({ ...t, id: i, ...roleOf(t.name) }));
  if (tokens.some((t) => t.mode === "dark") && tokens.some((t) => t.mode === "light")) {
    const dark = new Set(tokens.filter((t) => t.mode === "dark").map((t) => t.name));
    for (const t of tokens.filter((x) => x.mode === "light" && !dark.has(x.name))) tokens.push({ ...t, id: tokens.length, mode: "dark", inherited: true, span: null });
  }
  for (const t of tokens) {
    const r2 = opts.roles?.[t.name] || opts.roles?.["#" + t.hex] || opts.roles?.[t.hex];
    if (r2) {
      Object.assign(t, { role: r2 === "ignore" ? "ignore" : r2, why: "set by you", on: void 0, sub: void 0 });
    }
  }
  const surfaces = new Set(tokens.filter((t) => t.role === "text" && t.on).map((t) => t.on));
  for (const t of tokens) if (surfaces.has(words(t.name).join("-")) && t.why !== "set by you" && (t.role === "text" || t.role == null || t.role === "accent" && t.muted)) {
    t.role = "bg";
    t.why = "has its own text color";
  }
  const mutedRole = /* @__PURE__ */ new Map();
  for (const t of [...tokens].sort((a, b) => (a.mode === "light" ? -1 : 1) - (b.mode === "light" ? -1 : 1))) {
    if (t.role !== "accent" || !t.muted || t.why === "set by you") continue;
    if (!mutedRole.has(t.name)) mutedRole.set(t.name, (t.mode === "dark" ? L(t.hex) < 0.3 : L(t.hex) > 0.85) ? "bg" : "text");
    t.role = mutedRole.get(t.name);
    t.why = t.role === "bg" ? "muted: a surface" : "muted: text";
  }
  for (const t of tokens) {
    const m = String(t.name).match(/^(.*?)[-_]colou?r$/);
    if (!m || t.why === "set by you" || t.role === "text" || /(^|[-_])(bg|background|border|outline|ring|shadow|fill)([-_]|$)/i.test(m[1])) continue;
    let stem = m[1], bgTok = null;
    while (stem && !bgTok) {
      bgTok = tokens.find((x) => x.mode === t.mode && [`${stem}-bg`, `${stem}-bg-color`, `${stem}-background`, `${stem}_bg`].includes(x.name));
      if (!bgTok) {
        const i = Math.max(stem.lastIndexOf("-"), stem.lastIndexOf("_"));
        stem = i > 0 ? stem.slice(0, i) : "";
      }
    }
    if (bgTok) {
      t.role = "text";
      t.on = words(bgTok.name).join("-");
      t.why = `beside ${bgTok.name}`;
    }
  }
  const key = (t) => `${words(t.name).join("-")}|${t.mode}`;
  const byKey = /* @__PURE__ */ new Map();
  for (const t of tokens) if (!t.via) byKey.set(key(t), t);
  for (const t of tokens) if (t.via && byKey.has(key(t)) && byKey.get(key(t)) !== t && byKey.get(key(t)).hex === t.hex) {
    t.role = "ignore";
    t.why = `the same as ${byKey.get(key(t)).name}`;
  }
  const modes2 = [.../* @__PURE__ */ new Set([...tokens.map((t) => t.mode), ...(read.rules || []).map((r2) => r2.mode)])].sort((a, b) => a === "light" ? -1 : b === "light" ? 1 : 0);
  const pairs = [];
  const seen = /* @__PURE__ */ new Map();
  const add = (fg, bg, kind, why, extra = {}) => {
    if (!fg || !bg || fg === bg || fg.role === "ignore" || bg.role === "ignore") return;
    if (fg.alpha === 0 || bg.alpha === 0 || fg.via === bg.name || bg.via === fg.name) return;
    const asFg = fg, asBg = bg;
    fg = canon(fg);
    bg = canon(bg);
    if (fg === bg) return;
    const last = (x) => words(x.name).at(-1);
    if (fg.hex === bg.hex && COLOR_WORDS.test(last(fg) || "") && last(fg) === last(bg)) return;
    if (asFg !== fg) extra = { ...extra, asFg: asFg.name };
    if (asBg !== bg) extra = { ...extra, asBg: asBg.name };
    if (fg.hex === bg.hex && (fg.alpha ?? 1) === (bg.alpha ?? 1) && (extra.guess || extra.selector)) return;
    const key2 = `${fg.id}>${bg.id}`;
    if (seen.has(key2)) {
      const p2 = seen.get(key2);
      if (p2 && rank(kind) > rank(p2.kind)) Object.assign(p2, { kind, why });
      return;
    }
    const p = { key: key2, fg, bg, kind, why, mode: fg.mode, ...extra };
    seen.set(key2, p);
    pairs.push(p);
  };
  const rank = (k3) => ({ text: 3, large: 2, ui: 1, decor: 0 })[k3] ?? 0;
  const pairsLater = [];
  const byName = new Map(tokens.map((t) => [`${t.name}|${t.mode}`, t]));
  const canon = (t) => {
    let x = t, n = 0;
    while (x.via && n++ < 8) {
      const y = byName.get(`${x.via}|${x.mode}`) || byName.get(`${x.via}|light`);
      if (!y || y === x || y.role === "ignore" || isPalette(y)) break;
      x = y;
    }
    return x;
  };
  for (const mode of modes2) {
    const all = tokens.filter((t) => t.mode === mode && t.role !== "ignore");
    const named2 = new Map(all.map((t) => [words(t.name).join("-"), t]));
    const unnamed = all.every((t) => t.unnamed || t.role == null) || all.length <= 12 && all.every((t) => t.role === "scale" && !/\d$/.test(t.name) || t.role == null);
    if (unnamed && !read.rules?.length) {
      const by = [...all].sort((a, b) => L(b.hex) - L(a.hex));
      const light = by[0], dark = by[by.length - 1];
      for (const t of all) {
        if (t.why === "set by you") continue;
        t.role = t === light ? "bg" : t === dark ? "text" : C(t.hex) > 0.04 ? "accent" : L(t.hex) > 0.8 ? "bg" : L(t.hex) < 0.35 ? "text" : "accent";
        t.why = t === light ? "lightest" : t === dark ? "darkest" : "by lightness";
      }
    }
    const bgs = all.filter((t) => t.role === "bg" && !t.accent);
    const modeRules = (read.rules || []).filter((x) => (x.mode === mode || mode === "dark" && x.mode === "light" && !x.scoped) && !DISABLED.test(x.selector));
    const pageRule = [...modeRules].reverse().find((x) => PAGE_SEL.test(x.selector) && x.bg && !x.bg.image && x.bg.alpha !== 0);
    let main2 = bgs.length ? pickMain(bgs, mode) : null;
    if (!main2 && pageRule) main2 = pageRule.bg.token ? all.find((t) => t.name === pageRule.bg.token) : synth(tokens, pageRule.bg, mode, pageRule.selector);
    if (!main2) main2 = pickMain(all, mode);
    if (!main2 && mode === "light" && modeRules.some((x) => x.fg)) {
      main2 = synth(tokens, { hex: "ffffff", alpha: 1 }, mode, "the browser default");
      main2.name = "page background (white, the browser default)";
      main2.span = null;
    }
    if (pageRule && main2 && !modeRules.some((x) => PAGE_SEL.test(x.selector) && x.fg)) {
      const dflt = synth(tokens, { hex: mode === "dark" ? "ffffff" : "000000", alpha: 1 }, mode, "the browser default");
      dflt.name = mode === "dark" ? "default text (white)" : "default text (black)";
      dflt.span = null;
      pairsLater.push([dflt, main2]);
    }
    const texts = all.filter((t) => t.role === "text");
    for (const [a, b] of pairsLater.splice(0)) add(a, b, "text", "the browser's default text on the page background");
    for (const r2 of modeRules.filter((x) => !(UTILITY.test(x.selector) && !(x.fg && x.bg)) && !(mode === "dark" && x.mode === "light" && ![x.fg, x.bg, x.border, x.outline].some((v) => v?.token)))) {
      const tok = (v) => {
        if (!v || v.image) return null;
        if (v.token) {
          const own = tokens.find((t) => t.name === v.token && t.mode === mode);
          const real = own && own.role === "ignore" ? all.find((t) => key(t) === key(own) && t.role !== "ignore") : own;
          if (real && real.role !== "ignore") return real;
        }
        return synth(tokens, v, mode, r2.selector);
      };
      if (!r2.bg && r2.fg && (ELSEWHERE.test(r2.selector) || TEXT_UTILITY.test(r2.selector))) continue;
      const base = !r2.bg ? modeRules.find((x) => x !== r2 && x.bg && !x.bg.image && baseSel(x.selector) === baseSel(r2.selector) && states(x.selector) === states(r2.selector)) || modeRules.find((x) => x !== r2 && x.bg && !x.bg.image && baseSel(x.selector) === baseSel(r2.selector) && !states(x.selector)) : null;
      const bg = r2.bg && !r2.bg.image ? tok(r2.bg) : base ? tok(base.bg) : main2;
      const large = r2.fontSize ? isLarge(r2.fontSize, r2.fontWeight) : false;
      if (r2.fg) add(tok(r2.fg), bg, large ? "large" : "text", `${r2.selector} sets ${r2.bg ? "color and background" : "color"}`, { selector: r2.selector, image: r2.bg?.image, guess: !r2.bg && !base });
      for (const k3 of ["border", "outline"]) if (r2[k3] && bg) add(tok(r2[k3]), bg, /input|select|textarea|button|focus|checkbox|radio/i.test(r2.selector) || k3 === "outline" ? "ui" : "decor", `${r2.selector} sets ${k3}`, { selector: r2.selector });
    }
    for (const t of texts) {
      if (t.on) {
        const base = named2.get(t.on) || named2.get(t.on.replace(/-?(default|base)$/, "")) || ["bg", "background", "surface", "fill", "container"].map((x) => named2.get(`${t.on}-${x}`)).find(Boolean) || [...named2.entries()].find(([k3, v]) => v !== t && v.role !== "text" && (k3.endsWith(t.on) || t.on.endsWith(k3)))?.[1];
        if (base && base !== t) add(t, base, "text", `${t.name} is named for ${base.name}`);
        if (main2 && base !== main2 && (!base || /muted|subtle|secondary|surface|card|popover|background/.test(t.on))) add(t, main2, "text", `${t.name} on the page background`, { guess: !base });
      } else if (main2) {
        add(t, main2, "text", "text on the page background", { guess: !!(main2.literal || /lightness/.test(t.why || "")), generic: !/^(foreground|fg|text|ink|body|body-text|default|text-default|fg-default|text-primary)$/.test(words(t.name).join("-")) });
        if (bgs.length <= 6) {
          for (const b of bgs) if (b !== main2 && !hasOwnText(b, texts)) add(t, b, "text", `text on ${b.name}`);
        }
      }
    }
    for (const t of all.filter((x) => x.role === "accent")) {
      if (!main2 || t === main2) continue;
      const own = texts.find((x) => x.on && (named2.get(x.on) === t || words(t.name).join("-") === x.on));
      if (own) {
        if (t.status) add(t, main2, "text", "if used as text (error and warning messages)", { optional: true });
        continue;
      }
      add(t, main2, words(t.name).includes("link") || t.status ? "text" : "ui", words(t.name).includes("link") ? "links are text" : t.status ? "status text and icons" : "buttons, icons and accents on the background", { guess: true, ...t.status && !words(t.name).includes("link") ? { optional: true } : {} });
      if (unnamed) for (const x of texts) add(x, t, "text", "text on an accent", { optional: true });
    }
    for (const t of all.filter((x) => x.role === "border" || x.role === "control")) if (main2) add(t, main2, t.role === "control" ? "ui" : "decor", t.role === "control" ? "input borders and focus rings (WCAG 1.4.11)" : "dividers and card edges (decoration)");
    for (const t of all.filter((x) => x.role === "chart")) if (main2) add(t, main2, "ui", "chart colors on the background (WCAG 1.4.11)");
    if (unnamed) {
      for (const x of all) if (x.role === "text" && main2) add(x, main2, "text", "darkest on lightest");
    }
    for (const [a, b, kind] of opts.pairs || []) {
      const fa = findTok(all, a), fb = findTok(all, b);
      if (fa && fb) add(fa, fb, kind || "text", "declared by you");
    }
  }
  const groups2 = [];
  for (const mode of modes2) {
    const all = tokens.filter((t) => t.mode === mode && t.role !== "ignore");
    const status = all.filter((t) => t.status && !t.on);
    const chart = all.filter((t) => t.role === "chart");
    const accents = all.filter((t) => t.role === "accent" && !t.status && C(t.hex) > 0.04);
    if (status.length >= 2) groups2.push({ id: `status-${mode}`, label: "Status colors", mode, members: status });
    if (chart.length >= 2) groups2.push({ id: `chart-${mode}`, label: "Chart colors", mode, members: chart });
    if (accents.length >= 2 && !chart.length) groups2.push({ id: `accents-${mode}`, label: "Accent colors", mode, members: accents });
  }
  const inPair = new Set(pairs.flatMap((p) => [p.fg.name, p.bg.name, p.asFg, p.asBg]));
  const unchecked = [...new Set(tokens.filter((t) => !t.unnamed && !t.literal && !t.inherited && t.role !== "ignore" && t.role !== "scale" && !inPair.has(t.name) && !tokens.some((x) => x.via === t.name)).map((t) => t.name))];
  return { tokens, pairs: pairs.slice(0, MAX_PAIRS), groups: groups2, modes: modes2, tooMany: pairs.length > MAX_PAIRS, unchecked };
}
var TEXT_UTILITY = /(^|[\s.:(*,>])\.?[\w\\:\[\]\.*-]*text-[\w\\/.!\[\]#-]+/;
var baseSel = (sel) => String(sel).split(",")[0].trim().replace(/::?[\w-]+(\([^)]*\))?/g, "").trim();
var DISABLED = /:disabled|\[disabled\]|\.disabled\b|aria-disabled=["']?true|is-disabled|--disabled/i;
var states = (sel) => [...new Set(String(sel).split(",")[0].match(/:(hover|focus-visible|focus-within|focus|active|checked|selected|current)\b/g) || [])].sort().join("");
var PAGE_SEL = /^(html|body|:root)(\s*,\s*(html|body|:root))*$/i;
var ELSEWHERE = /invers|revers|on-dark|on-light|knockout|\.dark\b|dark-mode|-dark\b|::selection|disabled/i;
function pickMain(list, mode) {
  const exact = list.find((t) => /^(background|bg|page|canvas|body|surface|base|background-default|bg-default|surface-default)$/.test(words(t.name).join("-")));
  if (exact) return exact;
  return [...list].sort((a, b) => mode === "dark" ? L(a.hex) - L(b.hex) : L(b.hex) - L(a.hex))[0] || null;
}
var hasOwnText = (b, texts) => {
  const w = words(b.name).join("-"), stem = w.replace(/-(bg|background|surface|fill|container)$/, "");
  return texts.some((x) => x.on && (w.endsWith(x.on) || stem === x.on));
};
function findTok(all, ref) {
  const s = String(ref).replace(/^#/, "").toLowerCase();
  return all.find((t) => t.name === ref) || all.find((t) => t.name.toLowerCase() === String(ref).toLowerCase()) || all.find((t) => t.hex === s);
}
function synth(tokens, v, mode, selector) {
  let t = tokens.find((x) => x.literal && x.hex === v.hex && (x.alpha ?? 1) === (v.alpha ?? 1) && x.mode === mode);
  if (!t) {
    t = { name: (v.alpha ?? 1) < 1 ? v.raw || `#${v.hex}${Math.round(v.alpha * 255).toString(16).padStart(2, "0")}` : `#${v.hex}`, hex: v.hex, alpha: v.alpha, mode, id: tokens.length, role: "literal", literal: true, raw: v.raw || null, span: v.span || null, format: v.format, where: selector };
    tokens.push(t);
  }
  return t;
}
function judge(p, target = "AA", apca2) {
  const bgHex = p.bg.alpha < 1 ? over(p.bg.hex, p.bg.alpha, p.mode === "dark" ? "000000" : "ffffff") : p.bg.hex;
  const fgHex = over(p.fg.hex, p.fg.alpha, bgHex);
  const ratio2 = contrast2(fgHex, bgHex);
  const need = needOf(p.kind, target);
  const out = {
    // shown under the name the design uses (an alias), fixed at its source
    fg: { name: p.asFg || p.fg.name, hex: p.fg.hex, alpha: p.fg.alpha ?? 1, shown: fgHex, ...p.asFg ? { source: p.fg.name } : {} },
    bg: { name: p.asBg || p.bg.name, hex: p.bg.hex, alpha: p.bg.alpha ?? 1, shown: bgHex, ...p.asBg ? { source: p.bg.name } : {} },
    mode: p.mode,
    kind: p.kind,
    why: p.why,
    ratio: ratio2,
    need,
    pass: ratio2 >= need,
    level: p.kind === "ui" ? ratio2 >= 3 ? "meets 3:1" : "under 3:1" : ratio2 >= 7 ? "AAA" : ratio2 >= 4.5 ? "AA" : ratio2 >= 3 ? "AA large" : "fail",
    margin: r12(ratio2 - need, 2)
  };
  if (p.image) out.image = true;
  if (p.optional) {
    out.optional = true;
    out.pass = null;
  }
  if ((p.guess || p.generic) && ratio2 < 1.2) {
    out.optional = true;
    out.pass = null;
    out.unknownBg = true;
    out.why = `${p.why}; nearly the page color, so it sits on a background the stylesheets do not show`;
  }
  if (apca2) out.lc = apca2(fgHex, bgHex);
  out.glare = glareRatio(fgHex, bgHex);
  let worst = null;
  for (const v of VISION) {
    const r2 = contrast2(seeAs(fgHex, v.id), seeAs(bgHex, v.id));
    if (!worst || r2 < worst.ratio) worst = { id: v.id, label: v.label, ratio: r2 };
  }
  out.vision = worst;
  out.lowVision = ratio2 >= 7;
  return out;
}
function collisions(groups2) {
  const out = [];
  for (const g of groups2) {
    const m = g.members.slice(0, 24);
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
      const a = m[i], b = m[j];
      if (a.hex === b.hex) continue;
      const normal = dE(a.hex, b.hex);
      const under = VISION.map((v) => ({ id: v.id, label: v.label, d: dE(seeAs(a.hex, v.id), seeAs(b.hex, v.id)) }));
      const low = (l) => l.reduce((x, y) => y.d < x.d ? y : x);
      const common = under.filter((x) => /^(protan|deuteran)/.test(x.id));
      const worst = low(common).d < 10 ? low(common) : low(under);
      if (normal < 10 || worst.d < 10) {
        out.push({
          group: g.label,
          mode: g.mode,
          a: { name: a.name, hex: a.hex },
          b: { name: b.name, hex: b.hex },
          normal,
          worst,
          hard: under.filter((x) => x.d < 10).map((x) => x.label),
          common: under.some((x) => x.d < 10 && /^(protan|deuteran)/.test(x.id)),
          severity: normal < 5 || worst.d < 5 ? "same" : "close"
        });
      }
    }
  }
  return out;
}
var hueName = (h) => h < 40 || h >= 355 ? "red" : h < 78 ? "orange" : h < 110 ? "yellow" : h < 165 ? "green" : h < 200 ? "teal" : h < 275 ? "blue" : h < 330 ? "purple" : "pink";
var angle = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
function feel(hexes) {
  const list = [...new Set(hexes)];
  if (!list.length) return null;
  const o = list.map((h) => ({ hex: h, ...toOklch(col2(h)) })).map((x) => ({ ...x, c: x.c || 0, h: x.h || 0 }));
  const chromatic = o.filter((x) => x.c > 0.04);
  const notes = [];
  const clusters = [];
  for (const x of [...chromatic].sort((a, b) => b.c - a.c)) {
    const k3 = clusters.find((cl) => angle(cl.h, x.h) <= 25);
    if (k3) k3.members.push(x);
    else clusters.push({ h: x.h, members: [x] });
  }
  const hs = clusters.map((c2) => c2.h);
  let harmony = "neutral";
  if (hs.length === 1) harmony = "monochromatic";
  else if (hs.length === 2) {
    const a = angle(hs[0], hs[1]);
    harmony = a >= 150 ? "complementary" : a <= 60 ? "analogous" : "contrasting";
  } else if (hs.length >= 3) {
    const spread = Math.max(...hs.flatMap((a) => hs.map((b) => angle(a, b))));
    const sorted = [...hs].sort((a, b) => a - b), gaps = sorted.map((h, i) => (sorted[(i + 1) % sorted.length] - h + 360) % 360 || 360);
    if (spread <= 90) harmony = "analogous";
    else if (hs.length === 3 && gaps.every((g) => g >= 90 && g <= 150)) harmony = "triadic";
    else if (hs.length === 3 && Math.max(...gaps) >= 150 && Math.min(...gaps) <= 60) harmony = "split complementary";
    else if (hs.length === 4 && gaps.every((g) => g >= 60 && g <= 120)) harmony = "tetradic";
    else harmony = "free (no single rule)";
  }
  let warm = 0, cool = 0;
  for (const x of chromatic) {
    if (x.h < 100 || x.h > 330) warm += x.c;
    else if (x.h > 160 && x.h < 300) cool += x.c;
  }
  const temperature = !chromatic.length ? "neutral" : warm > cool * 1.5 ? "warm" : cool > warm * 1.5 ? "cool" : "mixed";
  const cs = o.map((x) => x.c).sort((a, b) => a - b), med = cs[Math.floor(cs.length / 2)];
  const loud = o.filter((x) => x.c > 0.15 && x.c > Math.max(med, 0.03) * 2.5);
  if (loud.length === 1 && o.length >= 3) notes.push({ kind: "loud", text: `#${loud[0].hex} is far more saturated than the rest; it will pull the eye. Good for one call to action, tiring as a large area.`, hex: loud[0].hex });
  const chromaSpread = r12(cs[cs.length - 1] - cs[0], 3);
  const ls = o.map((x) => x.l).sort((a, b) => a - b);
  const lightRange = r12(ls[ls.length - 1] - ls[0], 2);
  const steps = ls.filter((l, i) => !i || l - ls[i - 1] >= 0.08).length;
  const best = o.length >= 2 ? contrast2(o.reduce((a, b) => a.l > b.l ? a : b).hex, o.reduce((a, b) => a.l < b.l ? a : b).hex) : 21;
  if (lightRange < 0.5 && o.length >= 2 && best < 4.5) notes.push({ kind: "flat", text: `The lightest and darkest colors are only ${Math.round(lightRange * 100)} points apart in lightness, so no pair will carry body text. Add a near-black or near-white.` });
  else if (steps < Math.min(3, o.length)) notes.push({ kind: "steps", text: "Few distinct lightness steps: headings, text and surfaces will be hard to tell apart. Spread the lightness more." });
  const vib = [];
  for (let i = 0; i < chromatic.length; i++) for (let j = i + 1; j < chromatic.length; j++) {
    const a = chromatic[i], b = chromatic[j];
    if (a.c > 0.12 && b.c > 0.12 && angle(a.h, b.h) >= 120 && Math.abs(a.l - b.l) < 0.12) vib.push([a.hex, b.hex]);
  }
  if (vib.length) notes.push({ kind: "vibrate", text: `${vib.map(([a, b]) => `#${a} and #${b}`).join(", ")} are strong opposite hues at about the same lightness: as text on each other they vibrate. Use one as text only on a neutral.`, pairs: vib });
  const edge = o.filter((x) => {
    const v = toGamut("p3", "oklch")({ mode: "oklch", l: x.l, c: 0.4, h: x.h });
    return x.c > 0.1 && toOklch(v).c > x.c * 1.3;
  });
  const muddy = o.filter((x) => x.l > 0.35 && x.l < 0.6 && x.c > 0.03 && x.c < 0.07 && x.h > 40 && x.h < 120);
  if (muddy.length && muddy.length < o.length) notes.push({ kind: "muddy", text: `${muddy.map((x) => "#" + x.hex).join(", ")} ${muddy.length === 1 ? "sits" : "sit"} in the dull olive-brown band (mid lightness, low chroma, warm hue), which can read as dirty next to clean colors.` });
  const neutrals = o.filter((x) => x.c <= 0.04).length;
  return {
    harmony,
    hues: clusters.map((c2) => ({ h: r12(c2.h), name: hueName(c2.h), count: c2.members.length })),
    temperature,
    chroma: { max: r12(cs[cs.length - 1], 3), median: r12(med, 3), spread: chromaSpread },
    lightness: { min: r12(ls[0], 2), max: r12(ls[ls.length - 1], 2), range: lightRange, steps },
    neutrals,
    vivid: chromatic.length,
    moods: moods(list),
    p3: edge.map((x) => x.hex),
    notes
  };
}
var WEIGHT = { text: 1, literal: 1.1, control: 1.2, border: 1.2, chart: 1.6, bg: 1.8, scale: 1.5, accent: 2.2 };
function nearestL(hex3, test) {
  const o = toOklch(col2(hex3)), c2 = o.c || 0, h = o.h || 0;
  const at = (l) => fromOklch(l, c2, h);
  let best = null;
  for (const s of [1, -1]) {
    let hit = null;
    for (let d2 = 0.01; d2 <= 1.001; d2 += 0.01) {
      const l = o.l + s * d2;
      if (l < -1e-3 || l > 1.001) break;
      if (test(at(Math.min(1, Math.max(0, l))))) {
        hit = d2;
        break;
      }
    }
    if (hit == null) continue;
    let d = hit;
    for (let f2 = hit - 1e-3; f2 > hit - 0.01 && f2 > 0; f2 -= 1e-3) {
      if (test(at(Math.min(1, Math.max(0, o.l + s * f2))))) d = f2;
      else break;
    }
    if (!best || d < best.d) best = { d, x: at(Math.min(1, Math.max(0, o.l + s * d))) };
  }
  return best && test(best.x) ? best.x : null;
}
var COLOR_WORDS = /^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|grey|slate|zinc|neutral|stone|white|black|brown|navy|maroon|olive|silver|gold|magenta|lavender|coral|beige)$/i;
var isPalette = (t) => t.role === "scale" || !!t.primitive || COLOR_WORDS.test(words(t.name).at(-1) || "");
function solve(planned, target = "AA", lock = [], opts = {}) {
  const margin = opts.margin ?? 0.1;
  const value = new Map(planned.tokens.map((t) => [t.id, t.hex]));
  const locked = new Set(lock.map(String));
  const pairs = planned.pairs.filter((p) => p.kind !== "decor" && !p.optional && !p.image && !((p.guess || p.generic) && contrast2(p.fg.hex, p.bg.hex) < 1.2));
  const shownBg = (p, v) => p.bg.alpha < 1 ? over(v.get(p.bg.id), p.bg.alpha, p.mode === "dark" ? "000000" : "ffffff") : v.get(p.bg.id);
  const ratioOf = (p, v = value) => {
    const bg = shownBg(p, v);
    return contrast(col2(over(v.get(p.fg.id), p.fg.alpha, bg)), col2(bg));
  };
  const ok = (p, v = value, extra = 0) => {
    const r2 = ratioOf(p, v);
    return r2 >= needOf(p.kind, target) + extra && contrast2(over(v.get(p.fg.id), p.fg.alpha, shownBg(p, v)), shownBg(p, v)) >= needOf(p.kind, target);
  };
  const lum2 = (h) => luminance(col2(h));
  const side = new Map(pairs.map((p) => [p, Math.sign(lum2(value.get(p.fg.id)) - lum2(value.get(p.bg.id)))]));
  const sameSide = (p) => {
    const sg = side.get(p);
    return !sg || Math.sign(lum2(value.get(p.fg.id)) - lum2(value.get(p.bg.id))) === sg;
  };
  const byId = new Map(planned.tokens.map((t) => [t.id, t]));
  const copies = /* @__PURE__ */ new Map();
  for (const t of planned.tokens) if (t.inherited) {
    const src = planned.tokens.find((x) => x.name === t.name && x.mode === "light" && !x.inherited);
    if (src) copies.set(src.id, [...copies.get(src.id) || [], t.id]);
  }
  const ids = (t) => [t.id, ...copies.get(t.id) || []];
  const setAll = (t, x) => {
    for (const i of ids(t)) value.set(i, x);
  };
  const siblings = (t) => {
    const src = t.via && planned.tokens.find((x) => x.name === t.via && x.mode === t.mode) || planned.tokens.find((x) => x.name === t.via);
    if (!src || !isPalette(src)) return null;
    const stem = src.name.replace(/[-_.]?\d+$/, "");
    if (stem === src.name) return planned.tokens.filter((x) => x !== src && x.mode === src.mode && isPalette(x) && !x.via && dE(src.hex, x.hex) <= 25).map((x) => ({ x, src }));
    return planned.tokens.filter((x) => x !== src && x.mode === src.mode && x.name !== src.name && x.name.replace(/[-_.]?\d+$/, "") === stem && /\d+$/.test(x.name)).map((x) => ({ x, src }));
  };
  const movable = (t) => !t.inherited && !locked.has(t.name) && !locked.has(t.hex) && !locked.has("#" + t.hex) && !(isPalette(t) && planned.tokens.some((x) => x.via === t.name));
  const moved = /* @__PURE__ */ new Map(), repoint = /* @__PURE__ */ new Map(), flipped = /* @__PURE__ */ new Set();
  for (let round2 = 0; round2 < 60; round2++) {
    const failing2 = pairs.filter((p) => !ok(p));
    if (!failing2.length) break;
    let best = null;
    const cands = /* @__PURE__ */ new Map();
    for (const p of failing2.slice(0, 40)) for (const t of [p.fg, p.bg]) {
      const tk = byId.get(t.id) || t;
      if (movable(tk)) cands.set(tk.id, tk);
    }
    for (const t of cands.values()) {
      const all = ids(t);
      const mine = pairs.filter((p) => all.includes(p.fg.id) || all.includes(p.bg.id));
      const prev = value.get(t.id);
      const test = (x) => {
        setAll(t, x);
        const r2 = mine.every((p) => ok(p, value, failing2.includes(p) ? margin : 0) && sameSide(p));
        setAll(t, prev);
        return r2;
      };
      let to = null, via = null;
      const sib = siblings(t);
      if (sib) {
        const hit = sib.filter(({ x }) => test(x.hex)).sort((a, b2) => dE(prev, a.x.hex) - dE(prev, b2.x.hex))[0];
        if (hit) {
          to = hit.x.hex;
          via = { from: hit.src.name, to: hit.x.name };
        }
      }
      if (!to) to = nearestL(prev, test);
      if (!to) continue;
      const fixes = failing2.filter((p) => all.includes(p.fg.id) || all.includes(p.bg.id)).length;
      const cost = dE(prev, to) * (WEIGHT[t.role] || 1.5) * (via ? 0.8 : 1) / fixes;
      if (!best || cost < best.cost) best = { t, to, cost, via };
    }
    if (!best) break;
    setAll(best.t, best.to);
    moved.set(best.t.id, best.t);
    if (best.via) repoint.set(best.t.id, best.via);
    else repoint.delete(best.t.id);
  }
  for (const p of pairs.filter((x) => !ok(x))) {
    const f2 = byId.get(p.fg.id), b = byId.get(p.bg.id);
    if (!f2 || !b || movable(b) || !movable(f2) || !f2.on) continue;
    const all = ids(f2), mine = pairs.filter((x) => all.includes(x.fg.id) || all.includes(x.bg.id));
    const prev = value.get(f2.id);
    const best = ["000000", "ffffff", prev].map((seed) => nearestL(seed, (x) => {
      setAll(f2, x);
      const r2 = mine.every((q) => ok(q, value, q === p ? margin : 0));
      setAll(f2, prev);
      return r2;
    })).filter(Boolean).sort((a, c2) => dE(prev, a) - dE(prev, c2))[0];
    if (best) {
      setAll(f2, best);
      moved.set(f2.id, f2);
      flipped.add(f2.id);
    }
  }
  const changes = [...moved.values()].map((t) => ({
    name: t.name,
    mode: t.mode,
    role: t.role,
    from: t.hex,
    to: value.get(t.id),
    deltaE: dE(t.hex, value.get(t.id)),
    span: t.span,
    raw: t.raw,
    format: t.format,
    alpha: t.alpha,
    ...repoint.get(t.id) ? { repoint: repoint.get(t.id) } : {},
    ...copies.get(t.id) ? { alsoDark: true } : {},
    ...flipped.has(t.id) ? { flipped: true } : {}
  })).filter((c2) => c2.from !== c2.to);
  const why = (p) => {
    const f2 = byId.get(p.fg.id), b = byId.get(p.bg.id);
    const stuck = [f2, b].filter((t) => !movable(t));
    if (stuck.length === 2) return `${stuck.map((t) => t.name).join(" and ")} cannot change (${stuck.map((t) => locked.has(t.name) || locked.has("#" + t.hex) ? "locked" : t.inherited ? "inherited from light mode" : "a palette step other tokens use").join(", ")})`;
    const lockedOne = [f2, b].find((t) => locked.has(t.name) || locked.has("#" + t.hex));
    if (lockedOne) return `${lockedOne.name} is locked, and the other color cannot move far enough without turning the pair around`;
    const shared = [f2, b].find((t) => copies.get(t.id) || t.inherited);
    if (shared) return `${shared.name} is the same value in light and dark mode, and no single value passes on both backgrounds: give it its own dark value`;
    return "no single color can move without breaking another pair or turning the pair around";
  };
  const remaining = pairs.filter((p) => !ok(p)).map((p) => {
    const keep = (id, x) => {
      const v = new Map(value).set(id, x);
      return ok(p, v, margin) && Math.sign(lum2(v.get(p.fg.id)) - lum2(v.get(p.bg.id))) === side.get(p);
    };
    return {
      fg: p.fg.name,
      bg: p.bg.name,
      mode: p.mode,
      kind: p.kind,
      reason: why(p),
      suggest: { fg: movable(byId.get(p.fg.id)) ? nearestL(value.get(p.fg.id), (x) => keep(p.fg.id, x)) : null, bg: movable(byId.get(p.bg.id)) ? nearestL(value.get(p.bg.id), (x) => keep(p.bg.id, x)) : null }
    };
  }).slice(0, 60);
  return { target, changes, remaining, values: value };
}
function writeLike(hex3, raw, format, alpha = 1) {
  const v = info(hex3), a = alpha < 1 ? alpha : null;
  const pct = (x) => `${r12(x, 1)}%`;
  switch (format) {
    case "HEX":
      return "#" + hex3.toUpperCase() + (a != null ? Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase() : "");
    case "hex":
    case "hex8":
    case "name":
      return "#" + hex3 + (a != null ? Math.round(a * 255).toString(16).padStart(2, "0") : "");
    case "hsl-bare":
      return `${v.hsl.h} ${pct(v.hsl.s)} ${pct(v.hsl.l)}${a != null ? ` / ${a}` : ""}`;
    case "hsl":
      return `hsl(${v.hsl.h} ${pct(v.hsl.s)} ${pct(v.hsl.l)}${a != null ? ` / ${a}` : ""})`;
    case "hsl-legacy":
      return a != null ? `hsla(${v.hsl.h}, ${pct(v.hsl.s)}, ${pct(v.hsl.l)}, ${a})` : `hsl(${v.hsl.h}, ${pct(v.hsl.s)}, ${pct(v.hsl.l)})`;
    case "rgb":
      return `rgb(${v.rgb.r} ${v.rgb.g} ${v.rgb.b}${a != null ? ` / ${a}` : ""})`;
    case "rgb-legacy":
      return a != null ? `rgba(${v.rgb.r}, ${v.rgb.g}, ${v.rgb.b}, ${a})` : `rgb(${v.rgb.r}, ${v.rgb.g}, ${v.rgb.b})`;
    case "oklch": {
      const decimal = raw && /oklch\(\s*0?\.\d/i.test(raw);
      const o = v.oklch;
      return `oklch(${decimal ? r12(o.l / 100, 4) : `${o.l}%`} ${o.c} ${o.h}${a != null ? ` / ${a}` : ""})`;
    }
    default:
      return "#" + hex3;
  }
}
function applyFix(text2, changes, label = "colors") {
  const edits = changes.filter((c2) => c2.span).map((c2) => ({ ...c2, out: c2.repoint && c2.raw && c2.raw.includes(c2.repoint.from) ? c2.raw.replace(c2.repoint.from, c2.repoint.to) : writeLike(c2.to, c2.raw, c2.format, c2.alpha) })).sort((a, b) => b.span[0] - a.span[0]);
  let out = text2;
  for (const e3 of edits) out = out.slice(0, e3.span[0]) + e3.out + out.slice(e3.span[1]);
  const A = text2.split("\n"), B = out.split("\n");
  const changed = A.map((l, i) => l !== B[i]);
  const hunks = [];
  for (let i = 0; i < A.length; i++) {
    if (!changed[i]) continue;
    const s = Math.max(0, i - 2);
    let e3 = i;
    while (e3 + 1 < A.length && (changed[e3 + 1] || changed.slice(e3 + 1, e3 + 4).some(Boolean))) e3++;
    e3 = Math.min(A.length - 1, e3 + 2);
    const lines = [];
    const cut = (a, b) => {
      if (a.length <= 300) return [a, b];
      let i2 = 0;
      while (i2 < a.length && a[i2] === b[i2]) i2++;
      let j = 0;
      while (j < a.length - i2 && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
      const from = Math.max(0, i2 - 80);
      return [`${from ? "\u2026" : ""}${a.slice(from, Math.min(a.length, a.length - j + 80))}${a.length - j + 80 < a.length ? "\u2026" : ""}`, `${from ? "\u2026" : ""}${b.slice(from, Math.min(b.length, b.length - j + 80))}${b.length - j + 80 < b.length ? "\u2026" : ""}`];
    };
    for (let k3 = s; k3 <= e3; k3++) {
      if (changed[k3]) {
        const [x, y] = cut(A[k3], B[k3]);
        lines.push("-" + x, "+" + y);
      } else lines.push(" " + (A[k3].length > 300 ? A[k3].slice(0, 120) + "\u2026" : A[k3]));
    }
    const len = e3 - s + 1;
    hunks.push(`@@ -${s + 1},${len} +${s + 1},${len} @@
${lines.join("\n")}`);
    i = e3;
  }
  const diff = hunks.length ? `--- a/${label}
+++ b/${label}
${hunks.join("\n")}
` : "";
  return { text: out, diff, unwritten: changes.filter((c2) => !c2.span).map((c2) => c2.name) };
}
function check(input, opts = {}) {
  const text2 = Array.isArray(input) ? input.join("\n") : String(input ?? "");
  const read = readInput(text2, opts.max || 2e5);
  const target = opts.target === "AAA" ? "AAA" : "AA";
  const planned = plan(read, opts);
  const judged = planned.pairs.map((p) => judge(p, target, opts.apca));
  const clash = collisions(planned.groups);
  const fix = solve(planned, target, opts.lock || [], { margin: opts.margin });
  const applied = applyFix(text2, fix.changes, opts.label);
  const byMode = {};
  for (const m of planned.modes) byMode[m] = feel(planned.tokens.filter((t) => t.mode === m && t.role !== "ignore").map((t) => t.hex));
  const failing2 = judged.filter((p) => !p.pass && p.kind !== "decor" && !p.optional);
  const report = {
    version: VERSION,
    input: { kind: read.kind, colors: new Set(planned.tokens.filter((t) => !t.inherited).map((t) => `${t.name}|${t.mode}`)).size, rules: read.rules?.length || 0, modes: planned.modes, warnings: [...read.warnings, ...planned.tooMany ? [`Only the first ${MAX_PAIRS} pairs are checked.`] : []] },
    target,
    standard: TARGETS[target].label,
    tokens: planned.tokens.filter((t) => !t.literal || judged.some((p) => p.fg.name === t.name || p.bg.name === t.name)).map((t) => ({ name: t.name, hex: t.hex, alpha: t.alpha ?? 1, mode: t.mode, role: t.role || "other", why: t.why || null, at: t.span ? t.span[0] : null, ...t.where ? { where: t.where } : {}, ...t.inherited ? { inherited: true } : {} })),
    pairs: judged,
    collisions: clash.slice(0, 60),
    unchecked: planned.unchecked,
    feel: byMode,
    fix: { changes: fix.changes.map((c2) => ({ ...c2, span: c2.span || null, raw: c2.raw ?? null })), remaining: fix.remaining, text: fix.changes.length ? applied.text : null, diff: applied.diff, unwritten: applied.unwritten }
  };
  report.summary = summarize(report);
  return report;
}
function summarize(r2) {
  const judged = r2.pairs.filter((p) => p.kind !== "decor" && !p.optional);
  const fail2 = judged.filter((p) => !p.pass);
  const pass = judged.length - fail2.length;
  const lines = [];
  if (!r2.input.colors) return { pass: 0, fail: 0, total: 0, issues: 0, text: r2.input.rules ? `${r2.input.rules} CSS rules read, but none sets a color that can be paired (colors set by scripts or images are not seen).` : "No colors found. Paste hex codes, CSS, Tailwind config or design tokens.", lines: [] };
  if (!judged.length) lines.push(`${r2.input.colors} ${r2.input.colors === 1 ? "color" : "colors"} read, but no pairs to judge: tell the checker which colors are text and which are backgrounds.`);
  else lines.push(`${judged.length} ${judged.length === 1 ? "pair" : "pairs"} checked against ${r2.standard}: ${pass} pass, ${fail2.length} fail.`);
  if (fail2.length) {
    const kinds = {};
    for (const p of fail2) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
    lines.push(`Failing: ${Object.entries(kinds).map(([k3, n]) => `${n} ${kindLabel(k3)}${n === 1 ? "" : k3 === "text" || k3 === "large" ? "" : "s"}`).join(", ")}. The worst is ${fail2.sort((a, b) => a.ratio / a.need - b.ratio / b.need)[0].fg.name} on ${fail2[0].bg.name} at ${fail2[0].ratio}:1 (needs ${fail2[0].need}:1).`);
  }
  if (r2.fix.changes.length) {
    const ch = r2.fix.changes;
    lines.push(`Changing ${ch.length} ${ch.length === 1 ? "color" : "colors"} fixes ${r2.fix.remaining.length ? "most of it" : "every failing pair"}: ${ch.slice(0, 4).map((c2) => `${c2.name === "#" + c2.from ? "" : c2.name + " "}${r2.input.modes.length > 1 ? `(${c2.mode}) ` : ""}#${c2.from} \u2192 #${c2.to} (\u0394E ${c2.deltaE})`).join(", ")}${ch.length > 4 ? ", \u2026" : ""}.`);
  }
  if (r2.fix.remaining.length) lines.push(`${r2.fix.remaining.length} ${r2.fix.remaining.length === 1 ? "pair needs" : "pairs need"} both colors to move; see the suggestions.`);
  const cvd2 = r2.pairs.filter((p) => p.pass && p.vision && p.vision.ratio < p.need);
  if (cvd2.length) lines.push(`${cvd2.length} passing ${cvd2.length === 1 ? "pair drops" : "pairs drop"} below ${r2.standard} for some color vision (${[...new Set(cvd2.map((p) => p.vision.label))].join(", ")}).`);
  const same = r2.collisions.filter((c2) => c2.normal >= 10 && c2.common), rare = r2.collisions.filter((c2) => c2.normal >= 10 && !c2.common);
  if (same.length) lines.push(`${same.length} ${same.length === 1 ? "pair" : "pairs"} of ${same[0].group.toLowerCase()} look alike with red-green color blindness${rare.length ? ` (${rare.length} more only with rarer types)` : ""}: don't let color alone tell them apart.`);
  else if (rare.length) lines.push(`${rare.length} ${rare.length === 1 ? "pair looks" : "pairs look"} alike only with rarer color blindness (${[...new Set(rare.map((c2) => c2.worst.label))].join(", ")}).`);
  if (r2.unchecked?.length) lines.push(`${r2.unchecked.length} ${r2.unchecked.length === 1 ? "color has" : "colors have"} no role and ${r2.unchecked.length === 1 ? "was" : "were"} not checked: ${r2.unchecked.slice(0, 6).join(", ")}${r2.unchecked.length > 6 ? ", \u2026" : ""}. Give ${r2.unchecked.length === 1 ? "it" : "them"} a role to check ${r2.unchecked.length === 1 ? "it" : "them"}.`);
  const narrow = judged.filter((p) => p.pass && p.kind === "text" && p.ratio < 5);
  if (narrow.length) lines.push(`${narrow.length} text ${narrow.length === 1 ? "pair passes" : "pairs pass"} by less than 0.5; glare and low vision will lose ${narrow.length === 1 ? "it" : "them"}.`);
  return { pass, fail: fail2.length, total: judged.length, issues: fail2.length + same.length, text: lines.join(" "), lines };
}

// cli/src/files.js
import fs from "node:fs";
import path from "node:path";
var EXT = /\.(css|scss|sass|less|pcss|postcss|json|js|cjs|mjs|ts|txt)$/i;
var SKIP = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", "coverage", "vendor", ".turbo", ".cache"]);
var CONFIG_JS = /(^|[/\\])(tailwind\.config|theme|tokens?|colors?|palette)[\w.-]*\.(c|m)?(js|ts)$/i;
function globToRe(g) {
  let s = "";
  for (let i = 0; i < g.length; i++) {
    const c2 = g[i];
    if (c2 === "*" && g[i + 1] === "*") {
      s += ".*";
      i++;
      if (g[i + 1] === "/") i++;
    } else if (c2 === "*") s += "[^/]*";
    else if (c2 === "?") s += "[^/]";
    else s += c2.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${s}$`);
}
function walk(dir, out, root) {
  let list;
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e3 of list) {
    if (e3.name.startsWith(".") && e3.name !== ".") continue;
    const p = path.join(dir, e3.name);
    if (e3.isDirectory()) {
      if (!SKIP.has(e3.name)) walk(p, out, root);
    } else if (EXT.test(e3.name)) out.push(p);
  }
}
function expand(args, cwd = process.cwd()) {
  const out = [];
  const named2 = /* @__PURE__ */ new Set();
  for (const a of args.length ? args : ["."]) {
    if (/[*?]/.test(a)) {
      const base = a.slice(0, a.search(/[*?]/)).replace(/[^/]*$/, "") || ".";
      const re = globToRe(path.posix.normalize(a.replace(/\\/g, "/")).replace(/^\.\//, ""));
      const all = [];
      walk(path.resolve(cwd, base), all, cwd);
      for (const f2 of all) {
        const rel2 = path.relative(cwd, f2).replace(/\\/g, "/");
        if (re.test(rel2)) out.push(f2);
      }
      continue;
    }
    const p = path.resolve(cwd, a);
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      throw new Error(`No such file or folder: ${a}`);
    }
    if (st.isDirectory()) walk(p, out, cwd);
    else {
      out.push(p);
      named2.add(p);
    }
  }
  const keep = (f2) => !/\.(js|cjs|mjs|ts)$/i.test(f2) || CONFIG_JS.test(f2);
  const jsonOk = (f2) => !/\.json$/i.test(f2) || !/(^|[/\\])(package(-lock)?|tsconfig[\w.-]*|jsconfig|composer|manifest|\.?eslintrc[\w.-]*|renovate|turbo|vercel|firebase|app)\.json$/i.test(f2);
  return [...new Set(out)].filter((f2) => named2.has(f2) || keep(f2) && jsonOk(f2)).sort();
}
var skipped = [];
function groups(files, read = (f2) => fs.readFileSync(f2, "utf8")) {
  const css = [], other = [];
  for (const f2 of files) {
    const text2 = read(f2);
    if (text2.length > 5e6) {
      skipped.push(`${f2} (over 5 MB, not read)`);
      continue;
    }
    if (/\.(css|scss|sass|less|pcss|postcss)$/i.test(f2)) css.push({ file: f2, text: text2 });
    else other.push({ file: f2, text: text2 });
  }
  const out = [];
  const defs = css.map((c2) => new Set([...c2.text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])));
  const uses = css.map((c2) => new Set([...c2.text.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])));
  const parent = css.map((_, i) => i);
  const find = (i) => parent[i] === i ? i : parent[i] = find(parent[i]);
  for (let i = 0; i < css.length; i++) for (let j = 0; j < css.length; j++) {
    if (i !== j && [...uses[i]].some((v) => !defs[i].has(v) && defs[j].has(v))) parent[find(i)] = find(j);
  }
  const sets = /* @__PURE__ */ new Map();
  css.forEach((c2, i) => {
    const r2 = find(i);
    sets.set(r2, [...sets.get(r2) || [], c2]);
  });
  for (const list of sets.values()) {
    let text2 = "", parts = [];
    for (const c2 of list) {
      parts.push({ file: c2.file, start: text2.length, end: text2.length + c2.text.length, text: c2.text });
      text2 += c2.text + "\n";
    }
    out.push({ label: list.length === 1 ? list[0].file : `${list.length} stylesheets that share variables`, text: text2, parts });
  }
  for (const o of other) out.push({ label: o.file, text: o.text, parts: [{ file: o.file, start: 0, end: o.text.length, text: o.text }] });
  return out;
}
function locate(group, offset) {
  const p = group.parts.find((x) => offset >= x.start && offset <= x.end) || group.parts[0];
  const before = p.text.slice(0, Math.max(0, offset - p.start));
  const line = before.split("\n").length;
  return { file: p.file, line, column: before.length - before.lastIndexOf("\n") };
}

// cli/src/output.js
import path2 from "node:path";
var C2 = process.stdout.isTTY && !process.env.NO_COLOR ? { r: "\x1B[31m", g: "\x1B[32m", y: "\x1B[33m", d: "\x1B[2m", b: "\x1B[1m", x: "\x1B[0m" } : { r: "", g: "", y: "", d: "", b: "", x: "" };
var rel = (f2) => /^https?:/.test(f2) ? f2 : path2.relative(process.cwd(), f2).replace(/\\/g, "/") || f2;
var SITE = "https://everyhexcode.com";
function whereOf(group, report, pair) {
  for (const side of [pair.fg, pair.bg]) {
    const t = report.tokens.find((x) => x.name === side.name && x.mode === pair.mode && x.at != null) || report.tokens.find((x) => x.name === side.name && x.at != null);
    if (t) return locate(group, t.at);
  }
  return { file: group.parts[0].file, line: 1, column: 1 };
}
var failing = (r2) => r2.pairs.filter((p) => !p.pass && p.kind !== "decor" && !p.optional);
var lookAlike = (r2) => r2.collisions.filter((c2) => c2.common).filter((c2, i, l) => l.findIndex((x) => x.a.name === c2.a.name && x.b.name === c2.b.name) === i);
var link = (r2) => `${SITE}/color-checker`;
var fixOf = (r2, p) => r2.fix.changes.filter((c2) => c2.mode === p.mode && (c2.name === p.fg.name || c2.name === p.bg.name)).map((c2) => `${c2.name} \u2192 #${c2.to}`).filter((x, i, l) => l.indexOf(x) === i).join(", ");
function text(results, opts) {
  const out = [];
  for (const { group, report: r2 } of results) {
    out.push(`${C2.b}${rel(group.label)}${C2.x} ${C2.d}(${r2.input.kind}, ${r2.input.colors} ${r2.input.colors === 1 ? "color" : "colors"}${r2.input.modes.length > 1 ? ", light and dark" : ""})${C2.x}`);
    const f2 = failing(r2);
    for (const p of f2) {
      const at = whereOf(group, r2, p);
      const fx = fixOf(r2, p);
      const where = /^https?:/.test(at.file) ? (p.why || "").replace(/ sets .*$/, "") : `${rel(at.file)}:${at.line}`;
      out.push(`  ${C2.r}\u2717${C2.x} ${p.fg.name} on ${p.bg.name}${r2.input.modes.length > 1 ? ` [${p.mode}]` : ""}: ${C2.b}${p.ratio}:1${C2.x}, needs ${p.need}:1 (${p.kind})  ${C2.d}${where}${C2.x}${fx ? `
      ${C2.g}fix:${C2.x} ${fx}` : ""}`);
    }
    for (const c2 of lookAlike(r2)) out.push(`  ${C2.y}!${C2.x} ${c2.a.name} and ${c2.b.name} look alike with ${c2.worst.label.toLowerCase()} (\u0394E ${c2.worst.d})`);
    if (opts.verbose) for (const p of r2.pairs.filter((x) => x.pass)) out.push(`  ${C2.g}\u2713${C2.x} ${p.fg.name} on ${p.bg.name}${r2.input.modes.length > 1 ? ` [${p.mode}]` : ""}: ${p.ratio}:1`);
    out.push(`  ${f2.length ? C2.r : C2.g}${r2.summary.pass} pass, ${r2.summary.fail} fail${C2.x} against ${r2.standard}${r2.input.warnings.length ? `  ${C2.y}${r2.input.warnings.join(" ")}${C2.x}` : ""}`);
    if (r2.fix.remaining.length) out.push(`  ${C2.y}${r2.fix.remaining.length} ${r2.fix.remaining.length === 1 ? "pair has" : "pairs have"} no single-color fix: ${r2.fix.remaining.slice(0, 2).map((x) => `${x.fg} on ${x.bg}: ${x.reason}`).join("; ")}.${C2.x}`);
    out.push("");
  }
  return out.join("\n");
}
function json(results) {
  return JSON.stringify(results.map(({ group, report }) => ({ file: group.parts.length === 1 ? rel(group.parts[0].file) : group.parts.map((p) => rel(p.file)), report })), null, 2);
}
function markdown(results) {
  const out = ["## Color check", ""];
  for (const { group, report: r2 } of results) {
    const f2 = failing(r2);
    out.push(`### ${rel(group.label)}: ${f2.length ? `\u274C ${r2.summary.fail} failing` : "\u2705 all pass"} (${r2.standard})`, "", r2.summary.text, "");
    if (f2.length) {
      out.push("| Text | Background | Mode | Contrast | Needs | Where | Fix |", "|---|---|---|---|---|---|---|");
      for (const p of f2) {
        const at = whereOf(group, r2, p);
        out.push(`| \`${p.fg.name}\` | \`${p.bg.name}\` | ${p.mode} | ${p.ratio}:1 | ${p.need}:1 | ${/^https?:/.test(at.file) ? `\`${(p.why || "").replace(/ sets .*$/, "").replace(/\|/g, "/")}\`` : `${rel(at.file)}:${at.line}`} | ${fixOf(r2, p) || "\u2013"} |`);
      }
      out.push("");
    }
    if (r2.fix.diff) out.push("<details><summary>The fix as a diff</summary>", "", "```diff", r2.fix.diff.trim(), "```", "", "</details>", "");
  }
  out.push(`Checked with [everyhexcode](${link()}): WCAG 2 contrast, color vision and the nearest passing colors.`);
  return out.join("\n");
}
var esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
var escP = (s) => esc(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
function github(results) {
  const out = [];
  for (const { group, report: r2 } of results) {
    for (const p of failing(r2)) {
      const at = whereOf(group, r2, p), fx = fixOf(r2, p);
      const loc = /^https?:/.test(at.file) ? "" : `file=${escP(rel(at.file))},line=${at.line},col=${at.column},`;
      out.push(`::error ${loc}title=${escP(`Contrast ${p.ratio}:1 (needs ${p.need}:1)`)}::${esc(`${p.fg.name} on ${p.bg.name}${r2.input.modes.length > 1 ? ` (${p.mode} mode)` : ""}${loc ? "" : ` at ${(p.why || "").replace(/ sets .*$/, "")}`} is ${p.ratio}:1; ${p.kind === "ui" ? "UI parts need 3:1 (WCAG 1.4.11)" : `text needs ${p.need}:1 (WCAG 1.4.3)`}.${fx ? ` Nearest passing: ${fx}.` : ""}`)}`);
    }
    for (const c2 of lookAlike(r2)) out.push(`::warning title=Colors look alike::${esc(`${c2.a.name} and ${c2.b.name} look alike with ${c2.worst.label.toLowerCase()} (\u0394E ${c2.worst.d}). Do not let color alone tell them apart (WCAG 1.4.1).`)}`);
  }
  return out.join("\n");
}
function sarif(results, version) {
  const rules = [
    { id: "contrast-text", name: "TextContrast", shortDescription: { text: "Text contrast below WCAG 2 (1.4.3)" }, helpUri: `${SITE}/guides/wcag-color-contrast`, defaultConfiguration: { level: "error" } },
    { id: "contrast-ui", name: "NonTextContrast", shortDescription: { text: "UI part contrast below 3:1 (WCAG 1.4.11)" }, helpUri: `${SITE}/guides/wcag-color-contrast`, defaultConfiguration: { level: "error" } },
    { id: "look-alike", name: "ColorsLookAlike", shortDescription: { text: "Colors that look alike with color blindness (WCAG 1.4.1)" }, helpUri: `${SITE}/color-blind-palette-checker`, defaultConfiguration: { level: "warning" } }
  ];
  const res = [];
  for (const { group, report: r2 } of results) {
    for (const p of failing(r2)) {
      const at = whereOf(group, r2, p), fx = fixOf(r2, p);
      res.push({
        ruleId: p.kind === "ui" ? "contrast-ui" : "contrast-text",
        level: "error",
        message: { text: `${p.fg.name} on ${p.bg.name}${r2.input.modes.length > 1 ? ` (${p.mode} mode)` : ""}: ${p.ratio}:1, needs ${p.need}:1.${fx ? ` Nearest passing: ${fx}.` : ""}` },
        locations: [{ physicalLocation: { artifactLocation: { uri: rel(at.file) }, region: { startLine: at.line, startColumn: at.column } } }],
        partialFingerprints: { pair: `${p.fg.name}|${p.bg.name}|${p.mode}` }
      });
    }
    for (const c2 of lookAlike(r2)) {
      const t = r2.tokens.find((x) => x.name === c2.a.name && x.at != null);
      const at = t ? locate(group, t.at) : { file: group.parts[0].file, line: 1, column: 1 };
      res.push({
        ruleId: "look-alike",
        level: "warning",
        message: { text: `${c2.a.name} and ${c2.b.name} look alike with ${c2.worst.label.toLowerCase()} (\u0394E ${c2.worst.d}).` },
        locations: [{ physicalLocation: { artifactLocation: { uri: rel(at.file) }, region: { startLine: at.line } } }]
      });
    }
  }
  return JSON.stringify({
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{ tool: { driver: { name: "everyhexcode", version, informationUri: SITE + "/color-checker", rules } }, results: res }]
  }, null, 2);
}

// cli/src/render.js
import { execFileSync, spawn } from "node:child_process";
import fs2 from "node:fs";
import os from "node:os";
import path3 from "node:path";
import zlib from "node:zlib";
var CANDIDATES = {
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"],
  linux: ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium", "/usr/bin/microsoft-edge"],
  win32: [`${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`]
};
function headlessShells() {
  const out = [];
  for (const root of [path3.join(process.cwd(), "chrome-headless-shell"), path3.join(os.homedir(), ".cache", "puppeteer", "chrome-headless-shell")]) {
    let vers = [];
    try {
      vers = fs2.readdirSync(root).sort().reverse();
    } catch {
      continue;
    }
    for (const v of vers) {
      let subs = [];
      try {
        subs = fs2.readdirSync(path3.join(root, v));
      } catch {
        continue;
      }
      for (const sub of subs) out.push(path3.join(root, v, sub, process.platform === "win32" ? "chrome-headless-shell.exe" : "chrome-headless-shell"));
    }
  }
  return out;
}
function findChrome(given) {
  const list = [given, process.env.CHROME_PATH, ...headlessShells(), ...CANDIDATES[process.platform] || []].filter(Boolean);
  const hit = list.find((p) => {
    try {
      return fs2.statSync(p).isFile();
    } catch {
      return false;
    }
  });
  if (!hit) throw new Error("No Chrome or Chromium found. Install one, or set CHROME_PATH (or --chrome) to its binary.");
  return hit;
}
function launch(bin) {
  const dir = fs2.mkdtempSync(path3.join(os.tmpdir(), "everyhexcode-chrome-"));
  const shell = /headless[-_]shell/i.test(bin);
  const args = [
    ...shell ? [] : ["--headless=new"],
    "--remote-debugging-port=0",
    `--user-data-dir=${dir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--use-mock-keychain",
    "--password-store=basic",
    "--hide-scrollbars",
    "--mute-audio",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--force-color-profile=srgb",
    "about:blank"
  ];
  if (process.getuid?.() === 0) args.unshift("--no-sandbox");
  if (process.env.EHC_FLAGS != null) args.splice(0, args.length, "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`, ...process.env.EHC_FLAGS.split(" ").filter(Boolean), "about:blank");
  const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
  const bye = () => {
    try {
      child.kill("SIGKILL");
    } catch {
    }
    try {
      fs2.rmSync(dir, { recursive: true, force: true });
    } catch {
    }
  };
  process.once("exit", bye);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.once(sig, () => {
    bye();
    process.exit(130);
  });
  let exited = false;
  child.on("exit", () => {
    exited = true;
  });
  const stop = () => new Promise((resolve) => {
    const sweep = () => {
      if (process.platform === "win32") return;
      try {
        for (const line of execFileSync("ps", ["-ax", "-o", "pid=,command="], { encoding: "utf8" }).split("\n")) {
          const m = line.trim().match(/^(\d+)\s+(.*)$/);
          if (m && m[2].includes(dir) && Number(m[1]) !== process.pid) try {
            process.kill(Number(m[1]), "SIGKILL");
          } catch {
          }
        }
      } catch {
      }
    };
    const done2 = () => {
      setTimeout(() => {
        sweep();
        fs2.rmSync(dir, { recursive: true, force: true });
        resolve();
      }, 500);
    };
    if (exited) return done2();
    child.once("exit", done2);
    setTimeout(() => {
      if (!exited) try {
        child.kill("SIGTERM");
      } catch {
      }
    }, 1500);
    setTimeout(() => {
      if (!exited) try {
        child.kill("SIGKILL");
      } catch {
      }
    }, 5e3);
    setTimeout(() => {
      if (!exited) done2();
    }, 6e3);
  });
  return new Promise((resolve, reject) => {
    let err = "";
    const t = setTimeout(() => {
      stop();
      reject(new Error("Chrome did not start within 45 s."));
    }, 45e3);
    child.stderr.on("data", (d) => {
      err += d;
      const m = err.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(t);
        resolve({ ws: m[1], stop, pid: child.pid });
      }
    });
    child.on("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`Chrome exited (${code}): ${err.slice(-300)}`));
    });
  });
}
function connect(url) {
  if (typeof WebSocket === "undefined") throw new Error("The rendered scan needs Node 22 or newer (built-in WebSocket).");
  const ws = new WebSocket(url);
  let id = 0;
  const wait = /* @__PURE__ */ new Map(), on = /* @__PURE__ */ new Map();
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && wait.has(m.id)) {
      const w = wait.get(m.id);
      wait.delete(m.id);
      m.error ? w.reject(new Error(m.error.message)) : w.resolve(m.result);
    } else if (m.method) for (const f2 of on.get(m.method) || []) f2(m.params, m.sessionId);
  });
  const send = (method, params = {}, sessionId, ms = 2e4) => new Promise((resolve, reject) => {
    const i = ++id;
    const t = setTimeout(() => {
      wait.delete(i);
      reject(new Error(`Chrome did not answer ${method} within ${ms / 1e3} s.`));
    }, ms);
    wait.set(i, { resolve: (v) => {
      clearTimeout(t);
      resolve(v);
    }, reject: (e3) => {
      clearTimeout(t);
      reject(e3);
    } });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
  const once = (method, ms = 3e4, when = () => true) => new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    const f2 = (p) => {
      if (!when(p)) return;
      clearTimeout(t);
      on.set(method, (on.get(method) || []).filter((x) => x !== f2));
      resolve(p);
    };
    on.set(method, [...on.get(method) || [], f2]);
  });
  const listen = (method, f2) => on.set(method, [...on.get(method) || [], f2]);
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve({ send, once, on: listen, close: () => ws.close() }));
    ws.addEventListener("error", () => reject(new Error("Could not connect to Chrome.")));
  });
}
function decodePng(buf) {
  let p = 8, w = 0, h = 0, type = 6;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      type = data[9];
      if (data[8] !== 8) throw new Error("Only 8-bit PNG");
    } else if (kind === "IDAT") idat.push(data);
    else if (kind === "IEND") break;
    p += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : (() => {
    throw new Error("Unsupported PNG");
  })();
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f2 = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c2 = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (f2 === 1) v += a;
      else if (f2 === 2) v += b;
      else if (f2 === 3) v += a + b >> 1;
      else if (f2 === 4) {
        const pp = a + b - c2, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c2);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c2;
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { width: w, height: h, px: (x, y) => {
    const i = y * stride + x * bpp;
    return [out[i], out[i + 1], out[i + 2]];
  } };
}
var lum = ([r2, g, b]) => {
  const f2 = (c2) => {
    c2 /= 255;
    return c2 <= 0.04045 ? c2 / 12.92 : ((c2 + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f2(r2) + 0.7152 * f2(g) + 0.0722 * f2(b);
};
var ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
var hex2 = (c2) => "#" + c2.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
var COLLECT = `(() => {
  // any CSS colour (rgb, oklch, color(), color-mix\u2026) to sRGB 0-255 with alpha, by painting one pixel and reading it back
  const c1 = document.createElement('canvas'); c1.width = c1.height = 1;
  const cv = c1.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
  const memo = new Map();
  const rgba = (s) => { if (memo.has(s)) return memo.get(s).slice(); if (!s || s === 'transparent' || s === 'rgba(0, 0, 0, 0)') return [0, 0, 0, 0]; cv.clearRect(0, 0, 1, 1); cv.fillStyle = 'rgba(0,0,0,0)'; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; const v = [d[0], d[1], d[2], d[3] / 255]; memo.set(s, v); return v.slice(); };
  const over = (top, under) => { const a = top[3]; return [top[0]*a + under[0]*(1-a), top[1]*a + under[1]*(1-a), top[2]*a + under[2]*(1-a), 1]; };
  const canvasBg = (() => { const h = rgba(getComputedStyle(document.documentElement).backgroundColor), b = rgba(getComputedStyle(document.body).backgroundColor); const base = matchMedia('(prefers-color-scheme: dark)').matches && /dark/.test(getComputedStyle(document.documentElement).colorScheme) ? [18,18,18,1] : [255,255,255,1]; return over(h, h[3] < 1 ? over(b, base) : base); })();
  const path = (el) => { const p = []; for (let e = el; e && e !== document.body && p.length < 3; e = e.parentElement) { let s = e.tagName.toLowerCase(); if (e.id) { s += '#' + e.id; p.unshift(s); break; } const c = [...e.classList].filter((x) => !/[:\\[\\]/]/.test(x)).slice(0, 2); if (c.length) s += '.' + c.join('.'); p.unshift(s); } return p.join(' > ') || el.tagName.toLowerCase(); };
  const out = [];
  const els = document.body ? document.body.querySelectorAll('*') : [];
  const opc = new Map();
  // elements already read on an earlier screen; marked in a set, not an attribute, because changing attributes
  // while reading styles makes the browser recompute every style on a big page
  const seen = window.__ehcSeen || (window.__ehcSeen = new WeakSet());
  const mark = [];
  let n = window.__ehcN || 0;
  for (const el of els) {
    if (n >= 3000) break;
    if (seen.has(el)) continue;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|PATH|IFRAME|CANVAS|VIDEO|IMG|OPTION)$/i.test(el.tagName)) continue;
    const own = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length > 1);
    const field = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName);
    if (!own && !field) continue;
    if (el.disabled || el.closest('[aria-disabled="true"], fieldset:disabled')) continue; // disabled controls are exempt
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || cs.display === 'none' || parseFloat(cs.fontSize) < 6) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const opOf = (e) => { if (!e) return 1; if (opc.has(e)) return opc.get(e); const v = parseFloat(getComputedStyle(e).opacity) * opOf(e.parentElement); opc.set(e, v); return v; };
    const op = opOf(el);
    if (op < 0.1) continue;
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(r.width / 2, 12))), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    // what lies under that spot, from the element itself downwards
    const stack = document.elementsFromPoint(x, y);
    const from = stack.indexOf(el) >= 0 ? stack.indexOf(el) : 0;
    const layers = []; let image = false;
    for (const e of stack.slice(from)) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== 'none') { image = true; break; }
      if (/^(IMG|VIDEO|CANVAS|SVG|PICTURE)$/i.test(e.tagName) && e !== el) { image = true; break; }
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    let bg = layers.length && layers[layers.length - 1][3] >= 1 ? layers[layers.length - 1] : canvasBg;
    for (let i = layers.length - (layers.length && layers[layers.length - 1][3] >= 1 ? 2 : 1); i >= 0; i--) bg = over(layers[i], bg);
    const fg = rgba(cs.color); fg[3] *= op;
    n++;
    out.push({ i: n - 1, sel: path(el), text: (el.innerText || el.value || '').trim().slice(0, 40), fg, bg, image, size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) || 400, rect: [r.left, r.top + scrollY, r.width, r.height] });
    seen.add(el);
    if (image) mark.push([el, n - 1]);
  }
  for (const [e, i] of mark) e.setAttribute('data-ehc-i', String(i));
  window.__ehcN = n;
  return { items: out, height: Math.min(document.documentElement.scrollHeight, 12000), url: location.href };
})()`;
async function renderScan(url, opts = {}) {
  const bin = findChrome(opts.chrome);
  const width = opts.width || 1280;
  const ch = await launch(bin);
  opts.log?.(`${/headless[-_]shell/i.test(bin) ? "chrome-headless-shell" : "Chrome"} started (pid ${ch.pid}, headless, temporary profile).`);
  let cdp;
  try {
    cdp = await connect(ch.ws);
    const { targetInfos } = await cdp.send("Target.getTargets");
    const targetId = targetInfos.find((t) => t.type === "page")?.targetId || (await cdp.send("Target.createTarget", { url: "about:blank" })).targetId;
    let { sessionId: s } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    await cdp.send("Page.enable", {}, s);
    await cdp.send("Page.setLifecycleEventsEnabled", { enabled: true }, s);
    await cdp.send("Page.bringToFront", {}, s);
    const { userAgent } = await cdp.send("Browser.getVersion");
    await cdp.send("Emulation.setUserAgentOverride", { userAgent: userAgent.replace("HeadlessChrome", "Chrome") }, s);
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true }, s);
    cdp.on("Page.javascriptDialogOpening", (p) => {
      opts.log?.(`Dismissed a ${p.type} dialog: ${String(p.message).slice(0, 80)}`);
      cdp.send("Page.handleJavaScriptDialog", { accept: false }, s).catch(() => {
      });
    });
    const rules = [], notes = [];
    let gone = false;
    cdp.on("Inspector.detached", () => {
      gone = true;
    });
    cdp.on("Target.detachedFromTarget", (p) => {
      if (p.targetId === targetId) gone = true;
    });
    const started = Date.now(), budget = (opts.timeout || 150) * 1e3;
    const evaluate = async (expression) => {
      for (let i = 0; ; i++) {
        try {
          return await cdp.send("Runtime.evaluate", { expression, returnByValue: true }, s, 15e3);
        } catch (e3) {
          if (!/did not answer/.test(e3.message)) throw e3;
          if (i >= 1 || gone || Date.now() - started > budget) throw new Error("STALLED");
          opts.log?.("The page is not answering; reconnecting to it.");
          try {
            await cdp.send("Target.detachFromTarget", { sessionId: s }, void 0, 5e3);
          } catch {
          }
          ({ sessionId: s } = await cdp.send("Target.attachToTarget", { targetId, flatten: true }));
          await cdp.send("Page.enable", {}, s).catch(() => {
          });
          await new Promise((r2) => setTimeout(r2, 1500));
        }
      }
    };
    let elements = 0, images = 0, finalUrl = url;
    for (const mode of opts.modes || ["light", "dark"]) {
      const items = [];
      let over2 = [];
      try {
        await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: mode }, { name: "prefers-reduced-motion", value: "reduce" }] }, s);
        await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false }, s);
        opts.log?.(`${mode}: loading ${url}`);
        const loaded = cdp.once("Page.loadEventFired", 3e4);
        const idle = cdp.once("Page.lifecycleEvent", 3e4, (p) => p.name === "networkIdle");
        const nav = await cdp.send("Page.navigate", { url }, s);
        if (nav.errorText) throw new Error(`Could not load ${url}: ${nav.errorText}`);
        const ev = await loaded;
        await Promise.race([idle, new Promise((r2) => setTimeout(r2, 6e3))]);
        if (process.env.EHC_DEBUG) opts.log?.(`load event: ${ev ? "yes" : "no (30 s)"}`);
        await new Promise((r2) => setTimeout(r2, 1200));
        const until = Date.now() + 6e4;
        let shotsOk = true;
        for (let step = 0; step < 15; step++) {
          const res = await evaluate(`scrollTo(0, ${step * 800}); ${COLLECT}`);
          if (res.exceptionDetails) throw new Error("The page could not be read: " + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
          const got = res.result.value;
          finalUrl = got.url;
          items.push(...got.items);
          for (const it of got.items.filter((x) => x.image)) {
            if (!shotsOk || over2.length >= 60) break;
            if (Date.now() > until) {
              opts.log?.("Image sampling stopped after 60 s; the rest keep their composited background.");
              shotsOk = false;
              break;
            }
            over2.push(it);
            await cdp.send("Runtime.evaluate", { expression: `(() => { const e = document.querySelector('[data-ehc-i="${it.i}"]'); if (e) { e.dataset.ehcColor = e.style.color; e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); } })()` }, s);
            const [x, y, w, hh] = it.rect;
            try {
              const shot = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, x), y: Math.max(0, y), width: Math.max(1, Math.min(w, 600)), height: Math.max(1, Math.min(hh, 300)), scale: 1 } }, s, 8e3);
              const img = decodePng(Buffer.from(shot.data, "base64"));
              const fg = it.fg.slice(0, 3), samples = [];
              const stepPx = Math.max(1, Math.floor(Math.sqrt(img.width * img.height / 3e3)));
              for (let yy = 0; yy < img.height; yy += stepPx) for (let xx = 0; xx < img.width; xx += stepPx) {
                const c2 = img.px(xx, yy);
                samples.push({ c: c2, r: ratio(fg, c2) });
              }
              samples.sort((a, b) => a.r - b.r);
              const worst = samples[Math.floor(samples.length * 0.1)];
              if (worst) {
                it.bg = [...worst.c, 1];
                it.sampled = true;
              }
            } catch (e3) {
              if (/did not answer/.test(e3.message)) {
                opts.log?.("Screenshots are not answering on this page; image sampling stopped.");
                shotsOk = false;
              }
            }
            await cdp.send("Runtime.evaluate", { expression: `(() => { const e = document.querySelector('[data-ehc-i="${it.i}"]'); if (e) { e.style.color = e.dataset.ehcColor || ''; e.style.removeProperty('text-shadow'); } })()` }, s);
          }
          if ((step + 1) * 800 >= got.height) break;
        }
      } catch (e3) {
        if (!/STALLED|did not answer|detached|closed|Target closed|No session/i.test(e3.message) && !gone) throw e3;
        notes.push(`${mode} mode: the page stopped answering after ${items.length ? `${items.length} texts were read` : "loading"}${gone ? " (its renderer quit)" : ""}; ${items.length ? "the result is partial" : "nothing could be read"}.`);
        gone = true;
      }
      opts.log?.(`${mode}: ${items.length} text elements, ${over2.length} over images or gradients`);
      elements += items.length;
      images += over2.length;
      const seen = /* @__PURE__ */ new Map();
      for (const it of items) {
        const large = it.size >= 24 || it.weight >= 700 && it.size >= 18.66;
        const k3 = `${hex2(it.fg.slice(0, 3))}${it.fg[3]}|${hex2(it.bg.slice(0, 3))}|${large}`;
        const prev = seen.get(k3);
        if (prev) {
          prev.count++;
          continue;
        }
        seen.set(k3, { it, large, count: 1 });
      }
      const block = [...seen.values()].map(({ it, count }) => {
        const fg = it.fg[3] < 1 ? `rgb(${it.fg.slice(0, 3).map(Math.round).join(" ")} / ${Math.round(it.fg[3] * 100) / 100})` : hex2(it.fg.slice(0, 3));
        const sel = `${it.sel.replace(/[{}()]/g, "")}${count > 1 ? ` (and ${count - 1} more)` : ""}${it.sampled ? " (over an image: the worst part behind the text)" : it.image ? " (over an image)" : ""}`;
        return `${sel} { color: ${fg}; background-color: ${hex2(it.bg.slice(0, 3))}; font-size: ${it.size}px; font-weight: ${it.weight}; }`;
      }).join("\n");
      if (block) rules.push(mode === "dark" ? `@media (prefers-color-scheme: dark) {
${block}
}` : block);
      if (gone) break;
    }
    if (!elements && !notes.length) throw new Error("No visible text was found on the page. Sites that block automated browsers (nytimes.com does) or need a sign-in show nothing to read; check their stylesheets with `everyhexcode check`, or scan a page you run yourself.");
    if (!elements) throw new Error(`The page stopped answering before any text could be read: its scripts keep the browser busy.${/headless[-_]shell/i.test(bin) ? "" : " chrome-headless-shell often copes where full Chrome does not: npx @puppeteer/browsers install chrome-headless-shell@stable, then run the scan again."} Or check the stylesheets with \`everyhexcode check\`.`);
    return { url: finalUrl, css: rules.join("\n\n"), elements, images, notes };
  } finally {
    try {
      await Promise.race([cdp?.send("Browser.close"), new Promise((r2) => setTimeout(r2, 1500))]);
    } catch {
    }
    try {
      cdp?.close();
    } catch {
    }
    await ch.stop();
  }
}

// cli/src/cli.js
var VERSION2 = "0.1.0";
var HELP = `everyhexcode ${VERSION2}: check and fix the colors in your code

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
  --timeout <s>          give up on a page that stops answering after this long (default 150), keeping what was read

Settings file (colorcheck.json)
  { "files": ["src/styles"], "target": "AA", "lock": ["--brand"], "roles": { "--muted": "bg" },
    "pairs": [["--link", "--card", "text"]], "ignore": ["--decorative"], "failOn": "fail" }

Exit codes: 0 all pass, 1 failing pairs, 2 usage or read error.
Licensed under the Functional Source License (FSL-1.1-ALv2): free for your own use, see LICENSE.md.`;
function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--") {
      a._.push(...argv.slice(i + 1));
      break;
    }
    if (x.startsWith("--")) {
      const [k3, v] = x.slice(2).split(/=(.*)/s);
      const flag = ["write", "verbose", "dark", "help", "version", "light"].includes(k3);
      a[k3] = v !== void 0 ? v : flag ? true : argv[++i];
    } else if (x === "-h") a.help = true;
    else if (x === "-v") a.version = true;
    else a._.push(x);
  }
  return a;
}
function loadConfig(file) {
  const p = file || (fs3.existsSync("colorcheck.json") ? "colorcheck.json" : null);
  if (!p) return {};
  try {
    return JSON.parse(fs3.readFileSync(p, "utf8"));
  } catch (e3) {
    throw new Error(`Could not read ${p}: ${e3.message}`);
  }
}
function emit(results, a, version) {
  const fmt = a.format || "text";
  const body = fmt === "json" ? json(results) : fmt === "sarif" ? sarif(results, version) : fmt === "markdown" ? markdown(results) : fmt === "github" ? github(results) : text(results, a);
  if (a.out) fs3.writeFileSync(a.out, body + "\n");
  else if (body) process.stdout.write(body + "\n");
  if (a.sarif) fs3.writeFileSync(a.sarif, sarif(results, version) + "\n");
  if (process.env.GITHUB_STEP_SUMMARY && fmt === "github") fs3.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown(results) + "\n");
}
function exitCode(results, failOn) {
  if (failOn === "none") return 0;
  const bad = results.some(({ report }) => failing(report).length);
  const warn = results.some(({ report }) => lookAlike(report).length);
  return bad || failOn === "warn" && warn ? 1 : 0;
}
function writeBack(group, report) {
  const written = [];
  if (group.merged) return written;
  for (const part of group.parts) {
    const mine = report.fix.changes.filter((c2) => c2.span && c2.span[0] >= part.start && c2.span[1] <= part.end).map((c2) => ({ ...c2, span: [c2.span[0] - part.start, c2.span[1] - part.start] }));
    if (!mine.length) continue;
    const fixed = applyFix(part.text, mine, path4.basename(part.file));
    fs3.writeFileSync(part.file, fixed.text);
    written.push(`${path4.relative(process.cwd(), part.file) || part.file}: ${mine.map((c2) => `${c2.name} #${c2.from} \u2192 #${c2.to}`).join(", ")}`);
  }
  return written;
}
async function main() {
  const a = parseArgs(process.argv.slice(2));
  const cmd = ["check", "fix", "scan"].includes(a._[0]) ? a._.shift() : "check";
  if (a.help) {
    console.log(HELP);
    return 0;
  }
  if (a.version) {
    console.log(`everyhexcode ${VERSION2} (engine ${VERSION})`);
    return 0;
  }
  const bad = [["target", ["AA", "AAA", "aa", "aaa"]], ["format", ["text", "json", "sarif", "markdown", "github"]], ["fail-on", ["fail", "warn", "none"]]].find(([k3, ok]) => a[k3] !== void 0 && !ok.includes(String(a[k3])));
  if (bad) {
    console.error(`everyhexcode: --${bad[0]} must be one of ${bad[0] === "target" ? "AA, AAA" : bad[1].join(", ")}`);
    return 2;
  }
  const cfg = loadConfig(a.config);
  const target = String(a.target || cfg.target || "AA").toUpperCase() === "AAA" ? "AAA" : "AA";
  const lock = [...cfg.lock || [], ...String(a.lock || "").split(",").filter(Boolean)];
  const roles = { ...cfg.roles || {} };
  for (const n of cfg.ignore || []) roles[n] = "ignore";
  const opts = { target, lock, roles, pairs: cfg.pairs, max: 5e6 };
  const failOn = a["fail-on"] || cfg.failOn || "fail";
  if (cmd === "scan") {
    const url = a._[0] || cfg.url;
    if (!url) {
      console.error("Give a URL: everyhexcode scan http://localhost:3000");
      return 2;
    }
    const modes2 = a.dark ? ["dark"] : a.light ? ["light"] : ["light", "dark"];
    const s = await renderScan(url, { chrome: a.chrome, width: Number(a.width) || 1280, timeout: Number(a.timeout) || 150, modes: modes2, log: (m) => process.stderr.write(m + "\n") });
    const report = check(s.css, { ...opts, label: "rendered" });
    report.input.kind = "rendered page";
    const group = { label: `${s.url} (rendered)`, text: s.css, parts: [{ file: s.url, start: 0, end: s.css.length, text: s.css }] };
    emit([{ group, report }], a, VERSION2);
    if ((a.format || "text") === "text") process.stderr.write(`Read ${s.elements} text elements (${s.images} over images or gradients) in ${modes2.join(" and ")} mode.
${s.notes.map((n) => `Note: ${n}
`).join("")}`);
    report.input.warnings.push(...s.notes);
    return exitCode([{ report }], failOn);
  }
  const files = expand(a._.length ? a._ : cfg.files || ["."]);
  if (!files.length) {
    console.error("No CSS, SCSS, Less, token or Tailwind config files found.");
    return 2;
  }
  let results = groups(files).map((group) => ({ group, report: check(group.text, { ...opts, label: path4.basename(group.label) }) }));
  const tokenJson = results.filter(({ group }) => /\.json5?$/i.test(group.label));
  if (tokenJson.length > 1 && tokenJson.some(({ report }) => report.input.warnings.some((w) => /another file/.test(w)))) {
    const merge = (a2, b) => {
      for (const [k3, v] of Object.entries(b)) a2[k3] = v && typeof v === "object" && !Array.isArray(v) && a2[k3] && typeof a2[k3] === "object" ? merge(a2[k3], v) : v;
      return a2;
    };
    let all = {};
    for (const { group: group2 } of tokenJson) {
      try {
        all = merge(all, JSON.parse(group2.text));
      } catch {
        try {
          all = merge(all, JSON.parse(json5(group2.text)));
        } catch {
        }
      }
    }
    const text2 = JSON.stringify(all, null, 2);
    const group = { label: `${tokenJson.length} token files together`, text: text2, parts: [{ file: tokenJson[0].group.parts[0].file, start: 0, end: text2.length, text: text2 }], merged: true };
    results = [...results.filter((x) => !tokenJson.includes(x)), { group, report: check(text2, { ...opts, label: "tokens" }) }];
  }
  for (const { group, report } of results) if (!report.input.colors && report.input.warnings.length) console.error(`${path4.relative(process.cwd(), group.label) || group.label}: ${report.input.warnings.join(" ")}`);
  results = results.filter(({ report }) => report.input.colors);
  for (const x of skipped) console.error(`everyhexcode: skipped ${x}`);
  if (!results.length) {
    console.error(`No colors found in ${files.length} file(s)${skipped.length ? ` (${skipped.length} skipped)` : ""}: nothing to check.`);
    return skipped.length ? 2 : 0;
  }
  if (cmd === "fix" && a.write) {
    const lines = results.flatMap(({ group, report }) => writeBack(group, report));
    const unwritten = results.flatMap(({ group, report }) => report.fix.changes.filter((c2) => !c2.span || group.merged).map((c2) => `${c2.name}${report.input.modes.length > 1 ? ` (${c2.mode})` : ""}: #${c2.from} \u2192 #${c2.to}`));
    console.log(lines.length ? `Changed:
${lines.map((l) => "  " + l).join("\n")}` : unwritten.length ? "No file text to change." : "Nothing to change.");
    if (unwritten.length) console.log(`Change these where they are defined (they have no value in the file text):
${unwritten.map((l) => "  " + l).join("\n")}`);
    const again = groups(files).map((group) => ({ group, report: check(group.text, { ...opts, label: path4.basename(group.label) }) }));
    emit(again, a, VERSION2);
    return exitCode(again, failOn);
  }
  if (cmd === "fix" && (a.format || "text") === "text") {
    for (const { report } of results) if (report.fix.diff) process.stdout.write(report.fix.diff + "\n");
    console.error("Run with --write to change the files.");
    return exitCode(results, failOn);
  }
  emit(results, a, VERSION2);
  return exitCode(results, failOn);
}
process.stdout.on("error", (e3) => {
  if (e3.code === "EPIPE") process.exit(process.exitCode || 0);
  throw e3;
});
main().then((code) => {
  process.exitCode = code;
}, (e3) => {
  console.error(`everyhexcode: ${e3.message}`);
  process.exitCode = 2;
});
