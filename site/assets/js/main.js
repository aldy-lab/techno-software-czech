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

const V = (document.currentScript && new URL(document.currentScript.src).search) || "";

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
     DITHER — the generated images. Drawing lives in dither-scenes.js and
     runs in a worker on an OffscreenCanvas wherever the browser allows it,
     so the patterns never compete with scrolling; otherwise on the page.
     ===================================================================== */
  const canvases = $$("canvas[data-dither]");
  if (canvases.length) {
    const PX = () => (innerWidth < 700 ? 2.5 : 3);
    const colorsFor = (cv) => cv.dataset.colors || (cv.closest(".ind--feature") ? "ondeep" : cv.closest(".ind") ? "light" : undefined);
    const offscreen = "Worker" in window && "transferControlToOffscreen" in HTMLCanvasElement.prototype;
    let send;
    if (offscreen) {
      const worker = new Worker(`/assets/js/dither-worker.js${V}`);
      send = (m, transfer) => worker.postMessage(m, transfer || []);
    }
    const start = (eng) => {
      const dims = new Map();
      const sizeOf = (cv, box) => [Math.max(8, Math.round(box.width / PX())), Math.max(8, Math.round(box.height / PX()))];
      canvases.forEach((cv, id) => {
        const [w, h] = sizeOf(cv, cv.getBoundingClientRect());
        dims.set(cv, [w, h]);
        const o = { scene: cv.dataset.dither, colors: colorsFor(cv), t: cv.dataset.t ? +cv.dataset.t : 4, w, h };
        if (send) { const oc = cv.transferControlToOffscreen(); send({ type: "add", id, canvas: oc, ...o }, [oc]); }
        else eng.add(id, cv, o);
        cv.dataset.id = id;
      });
      const api = send
        ? { size: (id, w, h) => send({ type: "size", id, w, h }), vis: (id, v) => send({ type: "vis", id, v }), hover: (id, v) => send({ type: "hover", id, v }), pause: (v) => send({ type: "pause", v }), still: (v) => send({ type: "still", v }), input: (id, x, y, s, live) => send({ type: "input", id, x, y, s, live }) }
        : eng;
      if (reduce) api.still(true);
      const heroCv = canvases.find((cv) => cv.classList.contains("hero__canvas") && cv.dataset.dither === "hero");
      if (heroCv && !reduce) heroLens(heroCv, +heroCv.dataset.id, api);
      const ro = new ResizeObserver((es) => es.forEach((e) => {
        const [w, h] = sizeOf(e.target, e.contentRect);
        const [ow, oh] = dims.get(e.target);
        if (w !== ow || h !== oh) { dims.set(e.target, [w, h]); api.size(+e.target.dataset.id, w, h); }
      }));
      canvases.forEach((cv) => ro.observe(cv));
      const io = new IntersectionObserver((es) => es.forEach((e) => api.vis(+e.target.dataset.id, e.isIntersecting)), { rootMargin: "120px 0px" });
      canvases.forEach((cv) => io.observe(cv));
      document.addEventListener("visibilitychange", () => api.pause(document.hidden));
      if (canHover) canvases.forEach((cv) => {
        const card = cv.closest(".ind, .post, .ct");
        if (!card) return;
        card.addEventListener("pointerenter", () => api.hover(+cv.dataset.id, true));
        card.addEventListener("pointerleave", () => api.hover(+cv.dataset.id, false));
      });
    };
    /* The hero lens follows the cursor; with no cursor (phones, or a still mouse)
       a "ghost" cursor drifts on its own, and a tap moves the lens there. */
    function heroLens(cv, id, api) {
      const hero = cv.closest(".hero");
      const coord = document.createElement("span");
      coord.className = "hero__coord"; coord.setAttribute("aria-hidden", "true");
      hero.appendChild(coord);
      let tx = 0.62, ty = 0.4, ts = 0, x = tx, y = ty, sv = 0, last = -1e9, hold = 0, real = false, raf = 0, shown = false;
      let sent = [0, 0, -1];
      const at = (e) => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; };
      hero.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        at(e); ts = 1; real = true; last = performance.now();
        coord.style.transform = `translate(${e.clientX - hero.getBoundingClientRect().left + 22}px, ${e.clientY - hero.getBoundingClientRect().top + 18}px)`;
        coord.textContent = `X ${String(Math.round(e.clientX)).padStart(4, "0")} · Y ${String(Math.round(e.clientY + scrollY)).padStart(4, "0")}`;
        if (!e.target.closest("a, button")) { if (!shown) { coord.classList.add("is-on"); shown = true; } }
        else if (shown) { coord.classList.remove("is-on"); shown = false; }
        kick();
      }, { passive: true });
      hero.addEventListener("pointerleave", () => { real = false; last = performance.now() - 2600; coord.classList.remove("is-on"); shown = false; });
      hero.addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch") return; at(e); ts = 1; real = false; last = hold = performance.now(); kick(); }, { passive: true });
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
      let prevT = 0;
      const tick = (now) => {
        raf = 0;
        if (!visible || document.hidden) return;
        const idle = now - last > 3200 && !(hold && now - hold < 1600);
        // a live cursor gets every frame; the drifting ghost needs ~30 updates a second
        if (!real && now - prevT < 32) { raf = requestAnimationFrame(tick); return; }
        prevT = now;
        if (idle) { const T = now / 1000; tx = 0.6 + 0.26 * Math.sin(T * 0.29); ty = 0.36 + 0.2 * Math.sin(T * 0.43 + 1.2); ts = 0.62; }
        else if (!real && !(hold && now - hold < 1600)) ts = 0;
        const k = real ? 0.22 : 0.05;
        x += (tx - x) * k; y += (ty - y) * k; sv += (ts - sv) * 0.07;
        if (Math.abs(x - sent[0]) > 0.0008 || Math.abs(y - sent[1]) > 0.0008 || Math.abs(sv - sent[2]) > 0.004) { sent = [x, y, sv]; api.input(id, x, y, sv, real); }
        raf = requestAnimationFrame(tick);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      document.addEventListener("visibilitychange", kick);
      kick();
    }

    if (send) start(null);
    else {
      const sc = document.createElement("script");
      sc.src = `/assets/js/dither-scenes.js${V}`;
      sc.onload = () => start(self.TSCDither.engine(requestAnimationFrame));
      document.head.appendChild(sc);
    }
  }

  /* ---------- easter egg: "Build a team", a 30-second game ----------
     Opened by any [data-game] button; game.js loads only on the first click. */
  let gameLoad;
  $$("[data-game]").forEach((btn) => btn.addEventListener("click", () => {
    gameLoad = gameLoad || new Promise((ok, fail) => {
      const sc = document.createElement("script");
      sc.src = `/assets/js/game.js${V}`;
      sc.onload = ok; sc.onerror = fail;
      document.head.appendChild(sc);
    });
    gameLoad.then(() => window.TSCGame.open(btn));
  }));

  // for whoever opens the console — engineers are exactly who we want to meet
  console.log(
    "%c▟▀▙  Techno Software Czech%c\n\nReading the console? Then you are the kind of engineer we place.\n→ " + location.origin + "/careers\n\nP.S. there is a small game in the footer.",
    "font:600 13px monospace;color:#1530d6", "font:12px/1.5 monospace;color:#4b5486"
  );
})();
