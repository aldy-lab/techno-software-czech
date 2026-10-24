/* =====================================================================
   GO-LIVE CONFIG — fill these in when the client supplies them.
   A blank value ("") removes the element that uses it from the page,
   so nothing ships as a dead link.
   ===================================================================== */
const CONFIG = {
  EMAIL: "",          // e.g. "info@technosoftware.cz"  → mailto links + form fallback
  PHONE: "",          // e.g. "+420 123 456 789"
  LINKEDIN: "",       // company page URL
  FORM_ENDPOINT: "",  // POST endpoint (Formspree, Basin, own API). Blank + no EMAIL → form removed
  CAREERS_EMAIL: "",  // e.g. "careers@technosoftware.cz" — falls back to EMAIL; CV upload needs FORM_ENDPOINT
};
// where each form's mail goes when there is no endpoint
const FORM_MAIL = { form: () => CONFIG.EMAIL, "careers-form": () => CONFIG.CAREERS_EMAIL || CONFIG.EMAIL };

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  /* ---------- config → DOM ---------- */
  const tel = CONFIG.PHONE.replace(/[^+\d]/g, "");
  const cfg = {
    email: CONFIG.EMAIL && { href: `mailto:${CONFIG.EMAIL}`, text: CONFIG.EMAIL },
    phone: CONFIG.PHONE && { href: `tel:${tel}`, text: CONFIG.PHONE },
    linkedin: CONFIG.LINKEDIN && { href: CONFIG.LINKEDIN },
  };
  $$("[data-cfg]").forEach((el) => {
    const key = el.dataset.cfg;
    if (key in FORM_MAIL) {
      if (!CONFIG.FORM_ENDPOINT && !FORM_MAIL[key]()) {
        el.remove();
        $$(`[data-fallback-for="${key}"]`).forEach((f) => (f.hidden = false));
      }
      return;
    }
    const v = cfg[key];
    if (!v) return el.remove();
    el.href = v.href;
    const t = $("[data-cfg-text]", el);
    if (t && v.text) t.textContent = v.text;
  });
  if (!CONFIG.FORM_ENDPOINT) $$("[data-needs-endpoint]").forEach((el) => el.remove());
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- header ---------- */
  const header = $("#header");
  const hero = $(".hero");
  if (header && hero) {
    const io = new IntersectionObserver(([e]) => header.classList.toggle("is-solid", !e.isIntersecting), {
      rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
    });
    io.observe(hero);
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
  };
  menuBtn?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("#mnav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  matchMedia("(min-width: 1001px)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------- accordion ---------- */
  $$("[data-acc]").forEach((acc) => {
    $$(".acc__btn", acc).forEach((btn) =>
      btn.addEventListener("click", () => {
        const item = btn.closest(".acc__item");
        const open = !item.classList.contains("is-open");
        $$(".acc__item", acc).forEach((i) => {
          i.classList.remove("is-open");
          $(".acc__btn", i).setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      })
    );
  });

  /* ---------- reveal ---------- */
  const rv = $$(".rv");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px" }
    );
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add("in"));

  /* ---------- forms (contact + careers) ---------- */
  $$("form[data-cfg]").forEach((form) => {
    const status = $(".form__status", form);
    const to = FORM_MAIL[form.dataset.cfg]();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.website.value) return;
      const bad = $$("[required]", form).find((f) => !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)));
      if (bad) {
        status.textContent = "Please fill in your name, a valid email and a short message.";
        bad.focus();
        return;
      }
      const data = new FormData(form);
      data.set("form", form.dataset.cfg);
      if (CONFIG.FORM_ENDPOINT) {
        status.textContent = "Sending…";
        try {
          const r = await fetch(CONFIG.FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.textContent = form.dataset.cfg === "form" ? "Thank you — we will be in touch within one business day." : "Thank you — your application has arrived.";
        } catch {
          status.textContent = to ? `Sending failed. Please email ${to}.` : "Sending failed. Please try again.";
        }
      } else {
        const lines = [];
        for (const [k, v] of data) if (v && !["website", "form", "message"].includes(k) && typeof v === "string") lines.push(`${k}: ${v}`);
        const subject = form.dataset.cfg === "form" ? "Team request — " + (data.get("company") || data.get("name")) : "Application — " + (data.get("role") || "talent pool") + " — " + data.get("name");
        location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n") + "\n\n" + data.get("message"))}`;
        status.textContent = "Opening your email app…";
      }
    });
  });

  // "Apply for this profile" pre-selects the profile in the careers form
  $$("[data-role]").forEach((a) => a.addEventListener("click", () => {
    const sel = $("#c-role");
    if (sel) sel.value = a.dataset.role;
  }));

  /* =====================================================================
     DITHER — every image on the site is drawn here: a scalar field per
     scene, ordered (Bayer 4×4) dither into three tones, blown up with
     image-rendering: pixelated. No photography to license.
     ===================================================================== */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const hex = (h) => {
    const n = parseInt(h.slice(1), 16);
    return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16);
  };
  const LIGHT = [0, hex("#9eadff"), hex("#1530d6")];
  const ONBLUE = [0, hex("#3d58f0"), hex("#c6cfff")];
  const ONDEEP = [0, hex("#2a44e8"), hex("#8fa0ff")];
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const fract = (v) => v - Math.floor(v);
  const hash = (a, b) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
  const TAU = Math.PI * 2;

  // f(x, y, t, a): x ∈ [0, a], y ∈ [0, 1] (y down), returns intensity 0..1
  const SCENES = {
    hero: {
      colors: ONBLUE, animate: true,
      f(x, y, t, a) {
        const wide = Math.min(a, 1.7);
        const cx = a + 0.3, cy = -0.6;
        const R = Math.hypot(cx - a * 0.22, cy);
        const dx = x - cx, dy = y - cy;
        const th = Math.atan2(dy, dx);
        const w = (0.1 + 0.1 * wide) * (1 + 0.12 * Math.sin(th * 5 + t * 0.15));
        const d = Math.hypot(dx, dy) - R;
        let out = 0;
        const v = d / w;
        if (v > -1 && v < 1) {
          const z = Math.sqrt(1 - v * v);
          const shade = clamp(0.18 + 0.75 * z - 0.35 * v);
          const ph = th * R * 150 + v * 1.4 - t * 0.5;
          const rib = Math.max(0, Math.cos(ph));
          out = shade * (0.3 + 0.7 * Math.pow(rib, 0.7)) * (0.55 + 0.45 * z);
        }
        // a thin guide wire riding the outer edge
        const g = Math.abs(d - w * 1.45 - 0.03);
        if (g < 0.004) out = Math.max(out, 0.55);
        // inner faint halo
        if (d < -w && d > -w - 0.25) out = Math.max(out, 0.12 * (1 - (-w - d) / 0.25) * (0.5 + 0.5 * Math.cos(th * R * 60)));
        return out;
      },
    },
    globe: {
      colors: LIGHT, animate: true, fps: 20,
      f(x, y, t, a) {
        const cx = a / 2, cy = 0.5, r = 0.4;
        const dx = (x - cx) / r, dy = (y - cy) / r, q = dx * dx + dy * dy;
        if (q > 1) {
          const e = Math.abs(Math.hypot((x - cx) / 1.45, (y - cy) / 0.42) - r);
          return e < 0.0035 && !(q < 1.3 && y < cy) ? 0.6 : 0;
        }
        const z = Math.sqrt(1 - q);
        const tilt = 0.4, ct = Math.cos(tilt), st = Math.sin(tilt);
        const yy = dy * ct - z * st, zz = dy * st + z * ct;
        const lat = Math.asin(-yy), lon = Math.atan2(dx, zz) + t * 0.12;
        const gl = Math.max(Math.abs(fract(lon / (TAU / 18)) - 0.5), Math.abs(fract(lat / (Math.PI / 9)) - 0.5));
        const line = gl > 0.45 ? 0.85 : 0;
        const shade = 0.08 + 0.42 * clamp(z * 0.8 - dx * 0.25 - dy * 0.3);
        // Praha, 50.08° N 14.42° E
        const pl = (50.08 * Math.PI) / 180, pn = (14.42 * Math.PI) / 180;
        const dl = lat - pl, dn = Math.atan2(Math.sin(lon - pn - 0.4), Math.cos(lon - pn - 0.4));
        if (dl * dl + dn * dn * Math.cos(pl) ** 2 < 0.0022) return 1;
        return Math.max(shade, line * (0.35 + 0.65 * z));
      },
    },
    fintech: {
      colors: ONBLUE, hover: true,
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
      colors: ONBLUE, hover: true,
      f(x, y, t, a) {
        const cx = a * 0.58, cy = 0.54, dx = x - cx, dy = y - cy;
        const r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) + t * 0.6;
        let out = 0;
        if (r < 0.42 && r > 0.33) out = 0.35 + 0.25 * (Math.cos(th * 48) > 0.3 ? 1 : 0);
        if (r < 0.33 && r > 0.3) out = 0.95;
        if (r < 0.3 && r > 0.075) {
          const s = Math.abs(Math.sin(th * 2.5));
          if (s < 0.09 + (0.3 - r) * 0.25) out = 0.85 * (0.6 + 0.4 * (r / 0.3));
          else out = 0.06;
        }
        if (r < 0.075) out = r < 0.03 ? 0.2 : 0.9;
        const brake = Math.atan2(dy, dx);
        if (r > 0.18 && r < 0.24 && brake > -2.6 && brake < -1.6) out = Math.max(out, 0.5);
        if (x < cx - 0.46 && Math.abs(fract(y * 14) - 0.5) < 0.05 && hash(Math.floor(y * 14), 1) > 0.35) {
          const len = hash(Math.floor(y * 14), 2) * 0.6;
          if (x > cx - 0.46 - len) out = 0.5;
        }
        return out;
      },
    },
    manufacturing: {
      colors: LIGHT, hover: true,
      f(x, y, t, a) {
        const gear = (cx, cy, R, n, rot) => {
          const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) + rot;
          const tooth = Math.cos(th * n) > 0.1 ? 0.035 : 0;
          if (r > R + tooth) return -1;
          if (r < R * 0.28) return r < R * 0.16 ? 0 : 0.95;
          if (r > R - 0.012 && !tooth) return 0.95;
          const spoke = Math.abs(Math.sin((th * 6) / 2)) < 0.16;
          if (r < R * 0.82 && r > R * 0.3 && !spoke) return 0.08;
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
      colors: LIGHT, hover: true,
      f(x, y, t) {
        const k = 7.5, ph = x * k + t * 0.8, A = 0.24;
        let out = 0;
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const sy = 0.5 + sgn * A * Math.sin(ph), depth = 0.5 + 0.5 * sgn * Math.cos(ph);
          const th = 0.022 + 0.018 * depth;
          if (Math.abs(y - sy) < th) out = Math.max(out, 0.35 + 0.65 * depth);
        }
        const rung = Math.abs(fract(ph / (TAU / 10)) - 0.5);
        const top = 0.5 - A * Math.abs(Math.sin(ph)), bot = 0.5 + A * Math.abs(Math.sin(ph));
        if (rung < 0.06 && y > top && y < bot) out = Math.max(out, 0.3);
        if (!out && hash(Math.floor(x * 60), Math.floor(y * 60)) > 0.985) out = 0.4;
        return out;
      },
    },
    energy: {
      colors: LIGHT, hover: true,
      f(x, y, t, a) {
        let out = 0;
        for (let p = 0; p < 3; p++) {
          const sy = 0.5 + 0.3 * Math.sin(x * 7 - t * 1.4 + (p * TAU) / 3);
          const dd = Math.abs(y - sy);
          if (dd < 0.011 + p * 0.002) out = Math.max(out, [1, 0.62, 0.38][p]);
        }
        if (Math.abs(y - 0.5) < 0.0035) out = Math.max(out, 0.5);
        if (Math.abs(fract(x * 3.2) - 0.5) > 0.494) out = Math.max(out, 0.3);
        if (!out && Math.abs(fract(x * 25) - 0.5) > 0.44 && Math.abs(fract(y * 25) - 0.5) > 0.44) out = 0.3;
        return out;
      },
    },
    map: {
      colors: LIGHT, animate: true, fps: 20,
      f(x, y, t, a) {
        const cx = a * 0.56, cy = 0.46, dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
        // Vltava, schematically: it bends west of Nové Město
        const rv = Math.abs(x - (a * 0.2 + 0.07 * Math.sin(y * 5.5 + 0.6) + 0.04 * Math.sin(y * 13)));
        if (rv < 0.035) return rv < 0.026 ? 0.38 : 0.7;
        let out = 0;
        const bx = fract((x + 0.02 * Math.floor(y * 9)) * 9), by = fract(y * 9);
        if (bx > 0.12 && bx < 0.88 && by > 0.14 && by < 0.86) out = 0.12;
        if (Math.abs(dx) < 0.003 || Math.abs(dy) < 0.003) out = Math.max(out, r < 0.3 ? 0.9 : 0.35);
        const ring = Math.abs(fract(r / 0.12 - t * 0.25) - 0.5);
        if (ring > 0.47 && r < 0.42) out = Math.max(out, 0.55 * (1 - r / 0.42));
        if (Math.abs(r - 0.05) < 0.006) out = 1;
        if (r < 0.016) out = 1;
        return out;
      },
    },
    telecom: {
      colors: LIGHT, hover: true,
      f(x, y, t, a) {
        const ox = a * 0.18, oy = 0.92, dx = x - ox, dy = y - oy;
        const r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
        let out = 0;
        if (y < oy && x > 0) {
          const ring = Math.floor(r / 0.085), lr = fract(r / 0.085);
          const seg = Math.floor((th + Math.PI) * (6 + ring * 2) + ring * 1.7);
          const on = hash(ring, seg) > 0.22;
          if (lr < 0.16 && on && ring > 0) out = 0.45 + 0.5 * clamp(1 - fract(r * 2 - t * 0.5) * 2);
        }
        if (Math.abs(x - ox) < 0.008 && y > oy - 0.04) out = 1;
        const gx = fract(x * 18), gy = fract(y * 18);
        if (!out && gx < 0.1 && gy < 0.1) out = 0.3;
        return out;
      },
    },
    waves: {
      colors: [0, hex("#2a46e6"), hex("#4560f5")], animate: true, fps: 20,
      f(x, y, t, a) {
        const n = 22, yy = y * n, i = Math.floor(yy);
        const off = 0.9 * Math.sin(x * 2.2 + i * 0.35 + t * 0.25) + 0.6 * Math.sin(x * 5.1 - i * 0.2 - t * 0.18) + 0.4 * Math.sin(x * 9 + i);
        const lv = fract(yy + off * 0.5);
        const right = sstep(a * 0.35, a, x);
        return lv < 0.08 ? 0.35 + 0.5 * right : 0;
      },
    },
  };

  const dithers = [];
  $$("canvas[data-dither]").forEach((cv) => {
    const scene = SCENES[cv.dataset.dither];
    if (!scene) return;
    const ctx = cv.getContext("2d");
    const st = { cv, ctx, scene, w: 0, h: 0, img: null, buf: null, t: 0, visible: false, hover: false, last: 0 };
    const isLight = !cv.closest(".ind--feature") && scene.colors === ONBLUE && cv.closest(".ind");
    if (isLight) st.scene = { ...scene, colors: LIGHT };
    if (cv.closest(".ind--feature")) st.scene = { ...scene, colors: ONDEEP };
    dithers.push(st);
  });

  const PX = () => (innerWidth < 700 ? 2.5 : 3);

  function size(st) {
    const r = st.cv.getBoundingClientRect();
    const px = PX();
    const w = Math.max(8, Math.round(r.width / px)), h = Math.max(8, Math.round(r.height / px));
    if (w === st.w && h === st.h) return false;
    st.w = w; st.h = h;
    st.cv.width = w; st.cv.height = h;
    st.img = st.ctx.createImageData(w, h);
    st.buf = new Uint32Array(st.img.data.buffer);
    return true;
  }

  function draw(st) {
    const { w, h, buf, scene } = st;
    if (!w) return;
    const a = w / h, inv = 1 / h, col = scene.colors, f = scene.f, t = st.t;
    let k = 0;
    for (let j = 0; j < h; j++) {
      const y = j * inv, bj = (j & 3) << 2;
      for (let i = 0; i < w; i++, k++) {
        const v = f(i * inv, y, t, a) * 2;
        const base = v | 0, fr = v - base;
        const lvl = base + (fr > BAYER[bj | (i & 3)] ? 1 : 0);
        buf[k] = col[lvl > 2 ? 2 : lvl];
      }
    }
    st.ctx.putImageData(st.img, 0, 0);
  }

  // hero ribs read better a quarter-turn in — start mid-motion, not at t=0
  dithers.forEach((st) => (st.t = 4));

  let lastW = innerWidth;
  const sizeAll = (force) => dithers.forEach((st) => (size(st) || force) && draw(st));
  sizeAll(true);
  addEventListener("resize", () => {
    // width only: a phone's URL bar changes height on every scroll
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    sizeAll(true);
  });
  if (document.fonts) document.fonts.ready.then(() => sizeAll(false));

  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const st = dithers.find((d) => d.cv === e.target);
    if (st) st.visible = e.isIntersecting;
  }));
  dithers.forEach((st) => vio.observe(st.cv));

  if (canHover) {
    dithers.filter((st) => st.scene.hover).forEach((st) => {
      const card = st.cv.closest(".ind");
      card?.addEventListener("pointerenter", () => (st.hover = true));
      card?.addEventListener("pointerleave", () => (st.hover = false));
    });
  }

  if (!reduce) {
    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      if (!document.hidden) {
        for (const st of dithers) {
          if (!st.visible) continue;
          const run = st.scene.animate || st.hover;
          if (!run) continue;
          st.t += dt;
          const fps = st.scene.fps || 30;
          if (now - st.last < 1000 / fps) continue;
          st.last = now;
          draw(st);
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // for whoever opens the console
  console.log("%c▟▀▙  Techno Software Czech\n%cLooking for your next team? You are reading the right source.", "font:600 13px monospace;color:#1530d6", "font:12px monospace;color:#4b5486");
})();
