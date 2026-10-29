/* Techno Software Czech — dither engine.
   Every image on the site is drawn here: a scalar field per scene, ordered
   (Bayer 4×4) dither into three tones, blown up with image-rendering: pixelated.

   Runs inside dither-worker.js (OffscreenCanvas) so drawing never blocks
   scrolling; main.js falls back to running it on the page where workers
   cannot draw. Same code either way: self.TSCDither.engine().
*/
(() => {
  const BAYER = new Float32Array([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16));
  const hex = (h) => {
    const n = parseInt(h.slice(1), 16);
    return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
  };
  const PAL = {
    light: [0, hex("#9eadff"), hex("#1530d6")],
    onblue: [0, hex("#3d58f0"), hex("#c6cfff")],
    ondeep: [0, hex("#2a44e8"), hex("#8fa0ff")],
    waves: [0, hex("#2a46e6"), hex("#4560f5")],
  };
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const fract = (v) => v - Math.floor(v);
  const hash = (a, b) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
  const TAU = Math.PI * 2;

  /* f(x, y, t, a, k, cache, frame, i, j) → intensity 0..1
     x ∈ [0, a], y ∈ [0, 1] (y down); k = pixel index, i/j = column/row.
     prep() runs once per size (static geometry); frame() once per frame. */
  const SCENES = {
    hero: {
      colors: "onblue", animate: true, fps: 24,
      prep(w, h, a) {
        const n = w * h, th = new Float32Array(n), d = new Float32Array(n);
        const cx = a + 0.3, cy = -0.6, R = Math.hypot(cx - a * 0.22, cy), inv = 1 / h;
        for (let j = 0, k = 0; j < h; j++) {
          const dy = j * inv - cy;
          for (let i = 0; i < w; i++, k++) {
            const dx = i * inv - cx;
            th[k] = Math.atan2(dy, dx);
            d[k] = Math.hypot(dx, dy) - R;
          }
        }
        const w0 = 0.1 + 0.1 * Math.min(a, 1.7);
        return { th, d, R, w0, lo: -w0 * 1.12 - 0.26, hi: w0 * 1.12 * 1.45 + 0.04 };
      },
      f(x, y, t, a, k, c) {
        const d = c.d[k];
        if (d < c.lo || d > c.hi) return 0;            // far from the band: nothing to draw
        const th = c.th[k];
        const w = c.w0 * (1 + 0.12 * Math.sin(th * 5 + t * 0.15));
        let out = 0;
        const v = d / w;
        if (v > -1 && v < 1) {
          const z = Math.sqrt(1 - v * v);
          const shade = clamp(0.18 + 0.75 * z - 0.35 * v);
          const rib = Math.cos(th * c.R * 150 + v * 1.4 - t * 0.5);
          out = rib > 0 ? shade * (0.3 + 0.7 * Math.pow(rib, 0.7)) * (0.55 + 0.45 * z) : shade * 0.3 * (0.55 + 0.45 * z);
        }
        if (Math.abs(d - w * 1.45 - 0.03) < 0.004) out = Math.max(out, 0.55);   // guide wire
        if (d < -w && d > -w - 0.25) out = Math.max(out, 0.12 * (1 - (-w - d) / 0.25) * (0.5 + 0.5 * Math.cos(th * c.R * 60)));
        return out;
      },
    },
    globe: {
      colors: "light", animate: true, fps: 15,
      f(x, y, t, a) {
        const cx = a / 2, cy = 0.5, r = 0.4;
        const dx = (x - cx) / r, dy = (y - cy) / r, q = dx * dx + dy * dy;
        if (q > 1) {
          const e = Math.abs(Math.hypot((x - cx) / 1.45, (y - cy) / 0.42) - r);
          return e < 0.0035 && !(q < 1.3 && y < cy) ? 0.6 : 0;
        }
        const z = Math.sqrt(1 - q);
        const ct = 0.9210610, st = 0.3894183; // tilt 0.4 rad
        const yy = dy * ct - z * st, zz = dy * st + z * ct;
        const lat = Math.asin(-yy), lon = Math.atan2(dx, zz) + t * 0.12;
        const gl = Math.max(Math.abs(fract(lon / (TAU / 18)) - 0.5), Math.abs(fract(lat / (Math.PI / 9)) - 0.5));
        const line = gl > 0.45 ? 0.85 : 0;
        const shade = 0.08 + 0.42 * clamp(z * 0.8 - dx * 0.25 - dy * 0.3);
        // Praha, 50.08° N 14.42° E
        const pl = 0.874059, pn = 0.251677;
        const dl = lat - pl, dn = Math.atan2(Math.sin(lon - pn - 0.4), Math.cos(lon - pn - 0.4));
        if (dl * dl + dn * dn * 0.4123 < 0.0022) return 1;
        return Math.max(shade, line * (0.35 + 0.65 * z));
      },
    },
    fintech: {
      colors: "onblue", hover: true,
      f(x, y, t, a) {
        const bw = 0.055, i = Math.floor(x / bw), lx = fract(x / bw);
        const h = 0.22 + 0.5 * hash(i, 3) * (0.5 + 0.5 * Math.sin(i * 0.35 + t * 0.6));
        let out = 0;
        if (lx > 0.18 && lx < 0.82 && y > 1 - h) out = 0.25 + 0.3 * (1 - (y - (1 - h)) / h);
        const line = 0.55 - 0.18 * Math.sin(x * 4.2 + t * 0.4) - 0.08 * Math.sin(x * 11 - t) + 0.15 * (x / a - 0.5) * -1;
        const dd = Math.abs(y - line);
        if (dd < 0.012) out = 1;
        else if (y > line && y < line + 0.25) out = Math.max(out, 0.18 * (1 - (y - line) / 0.25));
        if (Math.abs(fract(y * 6) - 0.5) > 0.495) out = Math.max(out, 0.3);
        return out;
      },
    },
    automotive: {
      colors: "onblue", hover: true,
      f(x, y, t, a) {
        const cx = a * 0.58, cy = 0.54, dx = x - cx, dy = y - cy;
        const r = Math.hypot(dx, dy), base = Math.atan2(dy, dx), th = base + t * 0.6;
        let out = 0;
        if (r < 0.42 && r > 0.33) out = 0.35 + 0.25 * (Math.cos(th * 48) > 0.3 ? 1 : 0);
        if (r < 0.33 && r > 0.3) out = 0.95;
        if (r < 0.3 && r > 0.075) {
          const s = Math.abs(Math.sin(th * 2.5));
          out = s < 0.09 + (0.3 - r) * 0.25 ? 0.85 * (0.6 + 0.4 * (r / 0.3)) : 0.06;
        }
        if (r < 0.075) out = r < 0.03 ? 0.2 : 0.9;
        if (r > 0.18 && r < 0.24 && base > -2.6 && base < -1.6) out = Math.max(out, 0.5);
        if (x < cx - 0.46 && Math.abs(fract(y * 14) - 0.5) < 0.05 && hash(Math.floor(y * 14), 1) > 0.35) {
          if (x > cx - 0.46 - hash(Math.floor(y * 14), 2) * 0.6) out = 0.5;
        }
        return out;
      },
    },
    manufacturing: {
      colors: "light", hover: true,
      f(x, y, t, a) {
        const gear = (cx, cy, R, n, rot) => {
          const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
          if (r > R + 0.035) return -1;
          const th = Math.atan2(dy, dx) + rot;
          const tooth = Math.cos(th * n) > 0.1 ? 0.035 : 0;
          if (r > R + tooth) return -1;
          if (r < R * 0.28) return r < R * 0.16 ? 0 : 0.95;
          if (r > R - 0.012 && !tooth) return 0.95;
          if (r < R * 0.82 && r > R * 0.3 && !(Math.abs(Math.sin(th * 3)) < 0.16)) return 0.08;
          return 0.3 + 0.5 * clamp(1 - (dx + dy + R) / (2.4 * R));
        };
        const g1 = gear(a * 0.36, 0.56, 0.3, 14, t * 0.5);
        if (g1 >= 0) return g1;
        const g2 = gear(a * 0.36 + 0.505, 0.33, 0.19, 9, -t * 0.5 * (14 / 9) + 0.17);
        if (g2 >= 0) return g2;
        return Math.abs(fract(x * 20) - 0.5) > 0.47 && Math.abs(fract(y * 20) - 0.5) > 0.47 ? 0.35 : 0;
      },
    },
    health: {
      colors: "light", hover: true,
      f(x, y, t) {
        const ph = x * 7.5 + t * 0.8, A = 0.24, s = Math.sin(ph), co = Math.cos(ph);
        let out = 0;
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const depth = 0.5 + 0.5 * sgn * co;
          if (Math.abs(y - (0.5 + sgn * A * s)) < 0.022 + 0.018 * depth) out = Math.max(out, 0.35 + 0.65 * depth);
        }
        const as = A * Math.abs(s);
        if (Math.abs(fract(ph / (TAU / 10)) - 0.5) < 0.06 && y > 0.5 - as && y < 0.5 + as) out = Math.max(out, 0.3);
        if (!out && hash(Math.floor(x * 60), Math.floor(y * 60)) > 0.985) out = 0.4;
        return out;
      },
    },
    energy: {
      colors: "light", hover: true,
      f(x, y, t) {
        let out = 0;
        for (let p = 0; p < 3; p++) {
          if (Math.abs(y - (0.5 + 0.3 * Math.sin(x * 7 - t * 1.4 + (p * TAU) / 3))) < 0.011 + p * 0.002) out = Math.max(out, p === 0 ? 1 : p === 1 ? 0.62 : 0.38);
        }
        if (Math.abs(y - 0.5) < 0.0035) out = Math.max(out, 0.5);
        if (Math.abs(fract(x * 3.2) - 0.5) > 0.494) out = Math.max(out, 0.3);
        if (!out && Math.abs(fract(x * 25) - 0.5) > 0.44 && Math.abs(fract(y * 25) - 0.5) > 0.44) out = 0.3;
        return out;
      },
    },
    map: {
      colors: "light", animate: true, fps: 15,
      f(x, y, t, a) {
        const cx = a * 0.56, cy = 0.46, dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
        // Vltava, schematically: it bends west of Nové Město
        const rv = Math.abs(x - (a * 0.2 + 0.07 * Math.sin(y * 5.5 + 0.6) + 0.04 * Math.sin(y * 13)));
        if (rv < 0.035) return rv < 0.026 ? 0.38 : 0.7;
        let out = 0;
        const bx = fract((x + 0.02 * Math.floor(y * 9)) * 9), by = fract(y * 9);
        if (bx > 0.12 && bx < 0.88 && by > 0.14 && by < 0.86) out = 0.12;
        if (Math.abs(dx) < 0.003 || Math.abs(dy) < 0.003) out = Math.max(out, r < 0.3 ? 0.9 : 0.35);
        if (r < 0.42 && Math.abs(fract(r / 0.12 - t * 0.25) - 0.5) > 0.47) out = Math.max(out, 0.55 * (1 - r / 0.42));
        if (Math.abs(r - 0.05) < 0.006 || r < 0.016) out = 1;
        return out;
      },
    },
    telecom: {
      colors: "light", hover: true,
      f(x, y, t, a) {
        const ox = a * 0.18, oy = 0.92, dx = x - ox, dy = y - oy;
        let out = 0;
        if (y < oy && x > 0) {
          const r = Math.hypot(dx, dy), ring = Math.floor(r / 0.085), lr = fract(r / 0.085);
          if (lr < 0.16 && ring > 0) {
            const seg = Math.floor((Math.atan2(dy, dx) + Math.PI) * (6 + ring * 2) + ring * 1.7);
            if (hash(ring, seg) > 0.22) out = 0.45 + 0.5 * clamp(1 - fract(r * 2 - t * 0.5) * 2);
          }
        }
        if (Math.abs(x - ox) < 0.008 && y > oy - 0.04) out = 1;
        if (!out && fract(x * 18) < 0.1 && fract(y * 18) < 0.1) out = 0.3;
        return out;
      },
    },
    /* ---- service pages: one drawing per service ---- */
    // a block of team modules with one slot open; a new module slides in and docks
    augment: {
      colors: "light", animate: true, fps: 12,
      f(x, y, t, a) {
        const c = 0.15, ox = a * 0.5 - 3.2 * c, oy = 0.5 - 2 * c;
        const u = (x - ox) / c, v = (y - oy) / c, gi = Math.floor(u), gj = Math.floor(v), lx = u - gi, ly = v - gj;
        const box = (px, py) => (px > 0.1 && px < 0.9 && py > 0.1 && py < 0.9 ? (px < 0.17 || px > 0.83 || py < 0.17 || py > 0.83 ? 2 : 1) : 0);
        let out = 0;
        if (gi >= 0 && gi < 6 && gj >= 0 && gj < 4) {
          const b = box(lx, ly);
          if (gi === 5 && gj === 1) { if (b === 2 && Math.floor((lx + ly) * 10) % 2 === 0) out = 0.55; }
          else if (b) out = b === 2 ? 0.9 : 0.28;
        }
        const s = fract(t * 0.12), k = sstep(0.05, 0.6, s), mx = ox + 5 * c + (1 - k) * (a - ox - 5 * c);
        const b = box((x - mx) / c, v - 1);
        if (b) out = b === 2 ? 1 : 0.62;
        if (Math.abs(v - 1.5) < 0.02 && x > mx + c && k < 1) out = Math.max(out, 0.45);
        if (!out && Math.abs(fract(x * 22) - 0.5) > 0.46 && Math.abs(fract(y * 22) - 0.5) > 0.46) out = 0.22;
        return out;
      },
    },
    // a team as a network: a lead node, members around it, work travelling along the links
    team: {
      colors: "light", animate: true, fps: 12,
      prep(w, h, a) {
        const n = [[0.5, 0.5], [0.24, 0.24], [0.78, 0.22], [0.16, 0.7], [0.84, 0.74], [0.5, 0.12], [0.52, 0.88], [0.32, 0.5], [0.69, 0.48]]
          .map(([x, y]) => [a * 0.5 + (x - 0.5) * Math.min(a, 1.9) * 0.8, y]);
        const e = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 5], [2, 5], [3, 6], [4, 6], [1, 7], [2, 8]];
        return { n, e };
      },
      f(x, y, t, a, k, c) {
        let out = 0;
        for (let q = 0; q < c.e.length; q++) {
          const [p0, p1] = c.e[q], ax = c.n[p0][0], ay = c.n[p0][1], bx = c.n[p1][0], by = c.n[p1][1];
          const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, s = clamp(((x - ax) * dx + (y - ay) * dy) / L);
          const d = Math.hypot(x - ax - s * dx, y - ay - s * dy);
          if (d < 0.005) out = Math.max(out, 0.4);
          if (d < 0.016 && Math.abs(s - fract(t * 0.25 + q * 0.37)) < 0.04) out = 1;
        }
        for (let q = 0; q < c.n.length; q++) {
          const r = Math.hypot(x - c.n[q][0], y - c.n[q][1]), R = q === 0 ? 0.075 : 0.045;
          if (r < R) out = r > R - 0.014 ? 1 : q === 0 ? 0.6 : 0.25;
        }
        return out;
      },
    },
    // a browser window and a phone, with content blocks loading in
    web: {
      colors: "light", animate: true, fps: 10,
      f(x, y, t, a) {
        const frame = (x0, y0, w, h, lx, ly) => x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h && (x - x0 < lx || x0 + w - x < lx || y - y0 < ly || y0 + h - y < ly);
        const bx = a * 0.5 - 0.62, by = 0.14, bw = 1.0, bh = 0.72;
        const px = bx + bw - 0.12, py = 0.3, pw = 0.3, ph = 0.6;
        let out = 0;
        if (x > px && x < px + pw && y > py && y < py + ph) {
          if (frame(px, py, pw, ph, 0.012, 0.012)) return 1;
          if (y > py + ph - 0.07 && Math.abs(x - px - pw / 2) < 0.03) return 0.9;
          const row = Math.floor((y - py - 0.06) / 0.07), lxp = (x - px - 0.04) / (pw - 0.08);
          if (row >= 0 && row < 6 && fract((y - py - 0.06) / 0.07) < 0.55 && lxp > 0 && lxp < (row % 2 ? 0.6 : 1)) return row === 0 ? 0.75 : 0.3;
          return 0;
        }
        if (frame(bx, by, bw, bh, 0.01, 0.01)) out = 1;
        else if (x > bx && x < bx + bw && y > by && y < by + 0.08) {
          out = 0.3;
          for (let d = 0; d < 3; d++) if (Math.hypot(x - bx - 0.05 - d * 0.04, y - by - 0.04) < 0.013) out = 0.95;
        } else if (x > bx && x < bx + bw && y > by && y < by + bh) {
          const lx = (x - bx) / bw, ly = (y - by - 0.08) / (bh - 0.08), cols = lx < 0.3 ? 0 : 1;
          const fill = sstep(0, 1, fract(t * 0.1) * 1.6 - ly * 0.6);
          if (cols === 0 && lx > 0.05 && lx < 0.26 && fract(ly * 8) < 0.5) out = 0.25;
          if (cols === 1 && lx > 0.34 && lx < 0.95 && ly > 0.08 && ly < 0.45) out = 0.12 + 0.45 * fill;
          if (cols === 1 && lx > 0.34 && ly > 0.55 && fract(ly * 9) < 0.45 && lx < 0.95 - 0.2 * hash(Math.floor(ly * 9), 4)) out = 0.3;
        }
        return out;
      },
    },
    // a microcontroller with traces fanning out to vias; signals run along them
    embedded: {
      colors: "light", animate: true, fps: 12,
      f(x, y, t, a) {
        const cx = a * 0.5, cy = 0.5, dx = x - cx, dy = y - cy, ax = Math.abs(dx), ay = Math.abs(dy), S = 0.17;
        if (ax < S && ay < S) {
          if (ax > S - 0.014 || ay > S - 0.014) return 1;
          if (Math.hypot(dx + S * 0.6, dy + S * 0.6) < 0.025) return 0.9;
          return Math.abs(fract(dx * 30) - 0.5) > 0.45 || Math.abs(fract(dy * 30) - 0.5) > 0.45 ? 0.35 : 0.15;
        }
        // four sides of pins, each continuing as a straight trace that ends in a via
        const side = ax > ay ? (dx > 0 ? 0 : 1) : dy > 0 ? 2 : 3;
        const along = side < 2 ? dy : dx, across = side < 2 ? ax : ay;
        const pins = 6, pitch = (2 * S) / (pins + 1), pi = Math.round(along / pitch + 0.5) - 0.5;
        let out = 0;
        if (Math.abs(pi) < pins / 2) {
          const off = along - pi * pitch, len = S + 0.1 + hash(side, pi * 2) * 0.32;
          if (across < S + 0.035 && Math.abs(off) < 0.014) out = 0.95;
          else if (across < len && Math.abs(off) < 0.005) {
            out = 0.5;
            if (Math.abs(S + fract(t * 0.3 + hash(pi * 2, side)) * (len - S) - across) < 0.022) out = 1;
          }
          const vr = Math.hypot(across - len - 0.014, off);
          if (vr < 0.02) out = vr > 0.009 ? 0.95 : 0;
        }
        if (!out && Math.abs(fract(x * 18) - 0.5) > 0.46 && Math.abs(fract(y * 18) - 0.5) > 0.46) out = 0.2;
        return out;
      },
    },
    // a test run: rows of cases, a scan line moving down, passes marked as it goes
    qa: {
      colors: "light", animate: true, fps: 12,
      f(x, y, t, a) {
        const x0 = a * 0.5 - 0.7, x1 = a * 0.5 + 0.7, rows = 9, top = 0.1, rh = 0.8 / rows;
        if (x < x0 || x > x1 || y < top || y > top + rows * rh) return Math.abs(fract(x * 20) - 0.5) > 0.46 && Math.abs(fract(y * 20) - 0.5) > 0.46 ? 0.2 : 0;
        const r = Math.floor((y - top) / rh), ly = fract((y - top) / rh), scan = fract(t * 0.12) * rows;
        if (Math.abs((y - top) / rh - scan) < 0.05) return 1;
        if (ly < 0.2 || ly > 0.8) return 0;
        const done = r < scan, bx = x - x0, len = 0.55 + 0.6 * hash(r, 7);
        if (bx < 0.1) {
          if (bx > 0.02 && bx < 0.08) {
            if (!done) return bx < 0.03 || bx > 0.07 || ly < 0.3 || ly > 0.7 ? 0.5 : 0;
            return 0.95;
          }
          return 0;
        }
        if (bx > 0.16 && bx < 0.16 + len) return done ? 0.42 : 0.18;
        if (bx > x1 - x0 - 0.18 && bx < x1 - x0 - 0.02 && done) return 0.7;
        return 0;
      },
    },
    // the delivery loop: build → test → deploy → observe, as a figure of eight with work moving round it
    devops: {
      colors: "light", animate: true, fps: 12,
      f(x, y, t, a) {
        const R = 0.27, c1 = a * 0.5 - R, c2 = a * 0.5 + R, cy = 0.5;
        const d1 = Math.hypot(x - c1, y - cy), d2 = Math.hypot(x - c2, y - cy);
        let out = 0;
        const ring = (d, cx, dir) => {
          if (Math.abs(d - R) < 0.03) {
            const th = Math.atan2(y - cy, x - cx) / TAU;
            const flow = fract(th * 10 * dir - t * 0.6);
            return Math.abs(d - R) < 0.008 ? 1 : flow < 0.35 ? 0.6 : 0.2;
          }
          return 0;
        };
        out = Math.max(ring(d1, c1, 1), ring(d2, c2, -1));
        for (let q = 0; q < 4; q++) {
          const cx = q < 2 ? c1 : c2, th = (q % 2 ? 0.5 : -0.5) * Math.PI;
          const r = Math.hypot(x - cx - R * Math.cos(th) * (q < 2 ? -1 : 1) * 0, y - cy - R * Math.sin(th));
          if (Math.abs(x - cx) < 0.03 && r < 0.035) out = r > 0.02 ? 1 : 0.3;
        }
        if (!out && Math.abs(fract(x * 20) - 0.5) > 0.46 && Math.abs(fract(y * 20) - 0.5) > 0.46) out = 0.2;
        return out;
      },
    },
    // vetting: a field of candidates, a lens passing over it, the few that pass outlined
    vet: {
      colors: "light", animate: true, fps: 12,
      f(x, y, t, a) {
        const c = 0.075, gi = Math.floor(x / c), gj = Math.floor(y / c), lx = fract(x / c), ly = fract(y / c);
        const lxC = a * (0.5 + 0.32 * Math.sin(t * 0.22)), lyC = 0.5 + 0.18 * Math.sin(t * 0.31 + 1);
        const r = Math.hypot(x - lxC, y - lyC), R = 0.24;
        const picked = hash(gi, gj) > 0.9;
        let out = 0;
        const inCell = lx > 0.25 && lx < 0.75 && ly > 0.25 && ly < 0.75;
        if (r < R) {
          const big = lx > 0.12 && lx < 0.88 && ly > 0.12 && ly < 0.88;
          if (big) out = picked ? (lx < 0.2 || lx > 0.8 || ly < 0.2 || ly > 0.8 ? 1 : 0.6) : 0.18;
          if (Math.abs(r - R) < 0.012) out = 1;
        } else if (inCell) out = picked ? 0.55 : 0.22;
        if (r > R && r < R + 0.2 && Math.abs((x - lxC) - (y - lyC)) < 0.012 && x > lxC && y > lyC) out = 0.9;
        return out;
      },
    },
    waves: {
      colors: "waves", animate: true, fps: 15,
      // the line offset depends only on column and line index: compute it once per frame
      frame(t, w, h, a) {
        const n = 22, inv = 1 / h, off = new Float32Array((n + 1) * w), right = new Float32Array(w);
        for (let i = 0; i < w; i++) {
          const x = i * inv;
          right[i] = 0.35 + 0.5 * sstep(a * 0.35, a, x);
          for (let l = 0; l <= n; l++) off[l * w + i] = 0.45 * Math.sin(x * 2.2 + l * 0.35 + t * 0.25) + 0.3 * Math.sin(x * 5.1 - l * 0.2 - t * 0.18) + 0.2 * Math.sin(x * 9 + l);
        }
        return { off, right };
      },
      f(x, y, t, a, k, c, fr, i) {
        const yy = y * 22, l = yy | 0;
        return fract(yy + fr.off[l * ((fr.right.length)) + i]) < 0.08 ? fr.right[i] : 0;
      },
    },
  };

  function render(it) {
    const { w, h, buf, scene } = it;
    const a = w / h, inv = 1 / h, col = PAL[it.colors] || PAL[scene.colors], f = scene.f, t = it.t;
    if (scene.prep && !it.cache) it.cache = scene.prep(w, h, a);
    const fr = scene.frame ? scene.frame(t, w, h, a) : null;
    for (let j = 0, k = 0; j < h; j++) {
      const y = j * inv, bj = (j & 3) << 2;
      for (let i = 0; i < w; i++, k++) {
        const v = f(i * inv, y, t, a, k, it.cache, fr, i, j) * 2;
        const base = v | 0;
        const lvl = base + (v - base > BAYER[bj | (i & 3)] ? 1 : 0);
        buf[k] = col[lvl > 2 ? 2 : lvl];
      }
    }
    it.ctx.putImageData(it.img, 0, 0);
    it.drawn = true;
  }

  /* One engine drives every canvas: sizes, visibility, hover, its own clock. */
  function engine(schedule) {
    const items = new Map();
    let paused = false, still = false, running = false, prev = 0;
    const resize = (it, w, h) => {
      if (!w || !h || (w === it.w && h === it.h)) return;
      it.w = w; it.h = h; it.canvas.width = w; it.canvas.height = h;
      it.img = it.ctx.createImageData(w, h);
      it.buf = new Uint32Array(it.img.data.buffer);
      it.cache = null; it.drawn = false;
    };
    const wants = (it) => it.visible && it.w && (!it.drawn || (!still && (it.scene.animate || it.hover)));
    const tick = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      let any = false;
      if (!paused) {
        for (const it of items.values()) {
          if (!wants(it)) continue;
          any = true;
          if (it.drawn) it.t += dt;
          if (it.drawn && now - it.last < 1000 / (it.scene.fps || 30)) continue;
          it.last = now;
          render(it);
        }
      }
      running = any;
      if (any) schedule(tick);
    };
    const wake = () => { if (!running && !paused) { running = true; prev = performance.now(); schedule(tick); } };
    return {
      add(id, canvas, o) {
        const scene = SCENES[o.scene];
        if (!scene) return;
        items.set(id, { canvas, ctx: canvas.getContext("2d"), scene, colors: o.colors, t: o.t ?? 4, w: 0, h: 0, visible: false, hover: false, last: 0, drawn: false });
        resize(items.get(id), o.w, o.h);
      },
      size(id, w, h) { const it = items.get(id); if (it) { resize(it, w, h); wake(); } },
      vis(id, v) { const it = items.get(id); if (it) { it.visible = v; if (v) wake(); } },
      hover(id, v) { const it = items.get(id); if (it) { it.hover = v; if (v) wake(); } },
      pause(v) { paused = v; if (!v) wake(); },
      still(v) { still = v; },
    };
  }

  self.TSCDither = { SCENES, PAL, render, engine };
})();
