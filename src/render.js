// The rendered scan: load a page in your own Chrome (headless, a throwaway profile, closed afterwards), and for every
// visible text read its colour and the colour actually behind it: the stack of backgrounds under the text's own spot,
// translucent layers composited, and where an image or gradient sits behind it, the screen pixels themselves (the text
// hidden for the shot), taking the worst part of what is behind. Light and dark mode via prefers-color-scheme. The
// result is written as CSS rules (one per distinct text, background and size) that the checker reads like any CSS.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const CANDIDATES = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge'],
  win32: [`${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`],
};
export function findChrome(given) {
  const list = [given, process.env.CHROME_PATH, ...(CANDIDATES[process.platform] || [])].filter(Boolean);
  const hit = list.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  if (!hit) throw new Error('No Chrome or Chromium found. Install one, or set CHROME_PATH (or --chrome) to its binary.');
  return hit;
}

/** Start Chrome headless with a temporary profile; resolves with its DevTools address and a way to stop it. */
export function launch(bin) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'everyhexcode-chrome-'));
  const args = ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--use-mock-keychain', '--password-store=basic',
    '--hide-scrollbars', '--mute-audio', '--disable-extensions', '--disable-background-networking', '--disable-sync', '--force-color-profile=srgb', 'about:blank'];
  if (process.getuid?.() === 0) args.unshift('--no-sandbox'); // root in a CI container
  if (process.env.EHC_FLAGS != null) args.splice(0, args.length, '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, ...process.env.EHC_FLAGS.split(' ').filter(Boolean), 'about:blank');
  const child = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  // if this process ends early (Ctrl-C, a CI timeout), Chrome goes with it
  const bye = () => { try { child.kill('SIGKILL'); } catch { /* gone */ } try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* gone */ } };
  process.once('exit', bye);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(sig, () => { bye(); process.exit(130); });
  // stop: ask nicely (the caller sends Browser.close first), then SIGTERM, and SIGKILL only if Chrome is still there,
  // so its helper processes go with it; the profile folder is removed once it has exited
  let exited = false;
  child.on('exit', () => { exited = true; });
  const stop = () => new Promise((resolve) => {
    // helper processes that outlive the browser carry our profile folder in their command line: those, and only those, go too
    const sweep = () => {
      if (process.platform === 'win32') return;
      try {
        for (const line of execFileSync('ps', ['-ax', '-o', 'pid=,command='], { encoding: 'utf8' }).split('\n')) {
          const m = line.trim().match(/^(\d+)\s+(.*)$/);
          if (m && m[2].includes(dir) && Number(m[1]) !== process.pid) try { process.kill(Number(m[1]), 'SIGKILL'); } catch { /* gone */ }
        }
      } catch { /* no ps */ }
    };
    const done = () => { setTimeout(() => { sweep(); fs.rmSync(dir, { recursive: true, force: true }); resolve(); }, 500); };
    if (exited) return done();
    child.once('exit', done);
    setTimeout(() => { if (!exited) try { child.kill('SIGTERM'); } catch { /* gone */ } }, 1500);
    setTimeout(() => { if (!exited) try { child.kill('SIGKILL'); } catch { /* gone */ } }, 5000);
    setTimeout(() => { if (!exited) done(); }, 6000);
  });
  return new Promise((resolve, reject) => {
    let err = '';
    const t = setTimeout(() => { stop(); reject(new Error('Chrome did not start within 45 s.')); }, 45000);
    child.stderr.on('data', (d) => {
      err += d;
      const m = err.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); resolve({ ws: m[1], stop, pid: child.pid }); }
    });
    child.on('exit', (code) => { clearTimeout(t); reject(new Error(`Chrome exited (${code}): ${err.slice(-300)}`)); });
  });
}

/** A minimal DevTools protocol client over Node's built-in WebSocket. */
export function connect(url) {
  if (typeof WebSocket === 'undefined') throw new Error('The rendered scan needs Node 22 or newer (built-in WebSocket).');
  const ws = new WebSocket(url);
  let id = 0;
  const wait = new Map(), on = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && wait.has(m.id)) { const w = wait.get(m.id); wait.delete(m.id); m.error ? w.reject(new Error(m.error.message)) : w.resolve(m.result); }
    else if (m.method) for (const f of on.get(m.method) || []) f(m.params, m.sessionId);
  });
  // every call has a time limit, so a page that never settles cannot hang the scan
  const send = (method, params = {}, sessionId, ms = 20000) => new Promise((resolve, reject) => {
    const i = ++id;
    const t = setTimeout(() => { wait.delete(i); reject(new Error(`Chrome did not answer ${method} within ${ms / 1000} s.`)); }, ms);
    wait.set(i, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
  const once = (method, ms = 30000, when = () => true) => new Promise((resolve) => { const t = setTimeout(() => resolve(null), ms); const f = (p) => { if (!when(p)) return; clearTimeout(t); on.set(method, (on.get(method) || []).filter((x) => x !== f)); resolve(p); }; on.set(method, [...(on.get(method) || []), f]); });
  const listen = (method, f) => on.set(method, [...(on.get(method) || []), f]);
  return new Promise((resolve, reject) => { ws.addEventListener('open', () => resolve({ send, once, on: listen, close: () => ws.close() })); ws.addEventListener('error', () => reject(new Error('Could not connect to Chrome.'))); });
}

/** PNG (8-bit RGB or RGBA, as Chrome writes screenshots) → { width, height, px(x, y) → [r, g, b] }. */
export function decodePng(buf) {
  let p = 8, w = 0, h = 0, type = 6;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), kind = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8) throw new Error('Only 8-bit PNG'); }
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    p += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : (() => { throw new Error('Unsupported PNG'); })();
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * stride + x] = v & 255;
    }
  }
  return { width: w, height: h, px: (x, y) => { const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

// Runs in the page: every visible element with its own text, its colour and the colours behind it. Colours are
// normalised through a canvas, so oklch() and color() come back as rgb, alpha kept.
const COLLECT = `(() => {
  // any CSS colour (rgb, oklch, color(), color-mix…) to sRGB 0-255 with alpha, by painting one pixel and reading it back
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

export async function renderScan(url, opts = {}) {
  const bin = findChrome(opts.chrome);
  const width = opts.width || 1280;
  const ch = await launch(bin);
  opts.log?.(`Chrome started (pid ${ch.pid}, headless, temporary profile).`);
  let cdp;
  try {
    cdp = await connect(ch.ws);
    // the tab Chrome opened with, brought to the front: a background tab can be frozen and never answer
    const { targetInfos } = await cdp.send('Target.getTargets');
    const targetId = targetInfos.find((t) => t.type === 'page')?.targetId || (await cdp.send('Target.createTarget', { url: 'about:blank' })).targetId;
    let { sessionId: s } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, s);
    await cdp.send('Page.setLifecycleEventsEnabled', { enabled: true }, s);
    // Runtime.enable is left off: with it and Page.enable both on, some pages (stripe.com) never answer again
    await cdp.send('Page.bringToFront', {}, s);
    // some sites stall a browser that calls itself HeadlessChrome; the page is read, never automated, so say Chrome
    const { userAgent } = await cdp.send('Browser.getVersion');
    await cdp.send('Emulation.setUserAgentOverride', { userAgent: userAgent.replace('HeadlessChrome', 'Chrome') }, s);
    await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true }, s);
    // an alert, confirm or beforeunload dialog stops the page until answered: dismiss it
    cdp.on('Page.javascriptDialogOpening', (p) => { opts.log?.(`Dismissed a ${p.type} dialog: ${String(p.message).slice(0, 80)}`); cdp.send('Page.handleJavaScriptDialog', { accept: false }, s).catch(() => {}); });
    const rules = [];
    // a call sent while the page is still swapping documents (a redirect or reload done by script) is never answered:
    // ask again, a few times, before giving up
    const evaluate = async (expression) => {
      for (let i = 0; ; i++) {
        try { return await cdp.send('Runtime.evaluate', { expression, returnByValue: true }, s, 15000); } catch (e) {
          if (!/did not answer/.test(e.message)) throw e;
          if (i >= 1) throw new Error('The page stopped answering: its own scripts keep the browser busy. Scan a lighter page (a local build, one route), or check the CSS with `everyhexcode check`.');
          // an unanswered call blocks the ones after it: a fresh session to the same tab clears it
          opts.log?.('The page is not answering; reconnecting to it.');
          try { await cdp.send('Target.detachFromTarget', { sessionId: s }, undefined, 5000); } catch { /* already gone */ }
          ({ sessionId: s } = await cdp.send('Target.attachToTarget', { targetId, flatten: true }));
          await cdp.send('Page.enable', {}, s).catch(() => {});
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    };
    let elements = 0, images = 0, finalUrl = url;
    for (const mode of opts.modes || ['light', 'dark']) {
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }, { name: 'prefers-reduced-motion', value: 'reduce' }] }, s);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, s);
      opts.log?.(`${mode}: loading ${url}`);
      const loaded = cdp.once('Page.loadEventFired', 30000);
      // network idle is the better sign a script-built page has settled; a page that keeps polling never gets there
      const idle = cdp.once('Page.lifecycleEvent', 20000, (p) => p.name === 'networkIdle');
      const nav = await cdp.send('Page.navigate', { url }, s);
      if (nav.errorText) throw new Error(`Could not load ${url}: ${nav.errorText}`);
      const ev = await loaded;
      await idle;
      if (process.env.EHC_DEBUG) opts.log?.(`load event: ${ev ? 'yes' : 'no (30 s)'}`);
      await new Promise((r) => setTimeout(r, 1200));
      // walk down the page a screen at a time: what is under each text is read while it is in view
      const items = [];
      let over = [];
      const until = Date.now() + 60000;
      let shotsOk = true;
      for (let step = 0; step < 15; step++) {
        const res = await evaluate(`scrollTo(0, ${step * 800}); ${COLLECT}`);
        if (res.exceptionDetails) throw new Error('The page could not be read: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
        const got = res.result.value;
        finalUrl = got.url;
        items.push(...got.items);
        // text over an image or gradient: hide the text, photograph the box, take the worst tenth of what is behind it
        for (const it of got.items.filter((x) => x.image)) {
          if (!shotsOk || over.length >= 60) break;
          if (Date.now() > until) { opts.log?.('Image sampling stopped after 60 s; the rest keep their composited background.'); shotsOk = false; break; }
          over.push(it);
          await cdp.send('Runtime.evaluate', { expression: `(() => { const e = document.querySelector('[data-ehc-i="${it.i}"]'); if (e) { e.dataset.ehcColor = e.style.color; e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); } })()` }, s);
          const [x, y, w, hh] = it.rect;
          try {
            const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: Math.max(0, x), y: Math.max(0, y), width: Math.max(1, Math.min(w, 600)), height: Math.max(1, Math.min(hh, 300)), scale: 1 } }, s, 8000);
            const img = decodePng(Buffer.from(shot.data, 'base64'));
            const fg = it.fg.slice(0, 3), samples = [];
            const stepPx = Math.max(1, Math.floor(Math.sqrt((img.width * img.height) / 3000)));
            for (let yy = 0; yy < img.height; yy += stepPx) for (let xx = 0; xx < img.width; xx += stepPx) { const c = img.px(xx, yy); samples.push({ c, r: ratio(fg, c) }); }
            samples.sort((a, b) => a.r - b.r);
            const worst = samples[Math.floor(samples.length * 0.1)];
            if (worst) { it.bg = [...worst.c, 1]; it.sampled = true; }
          } catch (e) { if (/did not answer/.test(e.message)) { opts.log?.('Screenshots are not answering on this page; image sampling stopped.'); shotsOk = false; } }
          await cdp.send('Runtime.evaluate', { expression: `(() => { const e = document.querySelector('[data-ehc-i="${it.i}"]'); if (e) { e.style.color = e.dataset.ehcColor || ''; e.style.removeProperty('text-shadow'); } })()` }, s);
        }
        if ((step + 1) * 800 >= got.height) break;
      }
      opts.log?.(`${mode}: ${items.length} text elements, ${over.length} over images or gradients`);
      elements += items.length;
      images += over.length;
      // one rule per distinct text colour, background and size class, named after the first element that has it
      const seen = new Map();
      for (const it of items) {
        const large = it.size >= 24 || (it.weight >= 700 && it.size >= 18.66);
        const k = `${hex(it.fg.slice(0, 3))}${it.fg[3]}|${hex(it.bg.slice(0, 3))}|${large}`;
        const prev = seen.get(k);
        if (prev) { prev.count++; continue; }
        seen.set(k, { it, large, count: 1 });
      }
      const block = [...seen.values()].map(({ it, count }) => {
        const fg = it.fg[3] < 1 ? `rgb(${it.fg.slice(0, 3).map(Math.round).join(' ')} / ${Math.round(it.fg[3] * 100) / 100})` : hex(it.fg.slice(0, 3));
        const sel = `${it.sel.replace(/[{}()]/g, '')}${count > 1 ? ` (and ${count - 1} more)` : ''}${it.sampled ? ' (over an image: the worst part behind the text)' : it.image ? ' (over an image)' : ''}`;
        return `${sel} { color: ${fg}; background-color: ${hex(it.bg.slice(0, 3))}; font-size: ${it.size}px; font-weight: ${it.weight}; }`;
      }).join('\n');
      rules.push(mode === 'dark' ? `@media (prefers-color-scheme: dark) {\n${block}\n}` : block);
    }
    return { url: finalUrl, css: rules.join('\n\n'), elements, images };
  } finally {
    try { await Promise.race([cdp?.send('Browser.close'), new Promise((r) => setTimeout(r, 1500))]); } catch { /* closing */ }
    try { cdp?.close(); } catch { /* closed */ }
    await ch.stop();
  }
}
