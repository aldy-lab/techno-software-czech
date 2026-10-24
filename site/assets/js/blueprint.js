/* Blueprint mode — the site as an engineering drawing.
   Hidden: type "blueprint" anywhere, or tap the footer wordmark five times.
   Loaded on demand by main.js; costs nothing until someone finds it. */
(() => {
  if (window.TSCBlueprint) return;
  const doc = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n, l = 4) => String(Math.max(0, Math.round(n))).padStart(l, "0");
  let ui = null, on = false;

  const CSS = `
  html.bp, html.bp body { background: #0f1f9e !important; }
  html.bp .hero::before, html.bp .ct__fig::after { display: none !important; }
  html.bp body::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px);
    background-size: 24px 24px, 24px 24px, 120px 120px, 120px 120px; }
  html.bp main, html.bp footer, html.bp .marquee { position: relative; z-index: 1; }
  html.bp body *:not(canvas):not(img):not(svg):not(svg *):not(.bp-ui):not(.bp-ui *) {
    background-color: transparent !important; background-image: none !important; color: #fff !important;
    border-color: rgba(255,255,255,.4) !important; box-shadow: none !important; text-shadow: none !important;
    -webkit-text-stroke-color: rgba(255,255,255,.35) !important; }
  html.bp .header { background: rgba(15,31,158,.85) !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
  html.bp { --mark-fill: #fff; --mark-dock: #9eadff; cursor: crosshair; }
  html.bp canvas { opacity: .28; filter: grayscale(1) brightness(2.2); }
  html.bp section, html.bp article, html.bp .tile, html.bp .ind, html.bp .post, html.bp .role, html.bp .model, html.bp .field, html.bp .btn, html.bp .partner-badge {
    outline: 1px dashed rgba(255,255,255,.35); outline-offset: -1px; }
  html.bp section, html.bp footer { position: relative; }
  html.bp a, html.bp button, html.bp input, html.bp textarea, html.bp select, html.bp label { cursor: crosshair !important; }
  html.bp .rv { opacity: 1 !important; transform: none !important; }
  .bp-dim { position: absolute; right: 12px; bottom: 10px; z-index: 3; font: 450 11px/1.4 "Geist Mono", monospace; letter-spacing: .08em;
    color: #c6cfff !important; padding: 3px 7px; border: 1px solid rgba(198,207,255,.5) !important; pointer-events: none; text-transform: uppercase; }
  .bp-dim::before { content: "↕ "; }
  .bp-ui { position: fixed; inset: 0; z-index: 9999; pointer-events: none; font: 450 11px/1.4 "Geist Mono", monospace; letter-spacing: .06em; color: #fff; text-transform: uppercase; }
  .bp-x, .bp-y { position: absolute; background: rgba(198,207,255,.55); }
  .bp-x { left: 0; right: 0; height: 1px; } .bp-y { top: 0; bottom: 0; width: 1px; }
  .bp-xy { position: absolute; padding: 3px 6px; background: #0f1f9e; border: 1px solid rgba(198,207,255,.6); white-space: nowrap; }
  .bp-box { position: absolute; border: 1px solid #fff; background: rgba(158,173,255,.12); display: none; }
  .bp-box span { position: absolute; left: -1px; top: -21px; padding: 2px 6px; background: #fff; color: #0f1f9e; white-space: nowrap; text-transform: none; }
  .bp-tb { position: absolute; right: 16px; bottom: 16px; width: min(360px, calc(100vw - 32px)); background: #0f1f9e; border: 1px solid #fff; pointer-events: auto; }
  .bp-tb div { display: grid; grid-template-columns: 96px 1fr; border-top: 1px solid rgba(255,255,255,.45); }
  .bp-tb div:first-child { border-top: 0; grid-template-columns: 1fr; padding: 10px 12px; font-size: 13px; letter-spacing: .04em; }
  .bp-tb span { padding: 6px 12px; } .bp-tb span:first-child { border-right: 1px solid rgba(255,255,255,.45); color: #c6cfff; }
  .bp-tb a { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
  .bp-tb button { all: unset; cursor: pointer; display: block; width: 100%; box-sizing: border-box; padding: 10px 12px; text-align: center;
    border-top: 1px solid #fff; background: #fff; color: #0f1f9e; font: inherit; letter-spacing: .1em; }
  .bp-tb button:focus-visible { outline: 2px solid #9eadff; outline-offset: 2px; }
  @media (hover: none) { .bp-x, .bp-y, .bp-xy { display: none; } }
  @media (max-width: 600px) { .bp-tb { left: 12px; right: 12px; bottom: 12px; width: auto; } .bp-tb .bp-full { display: none; } .bp-tb div:first-child { padding: 8px 12px; font-size: 12px; } }
  ::view-transition-new(root) { animation: none; } ::view-transition-old(root) { animation: none; }
  `;

  function build() {
    const style = document.createElement("style");
    style.id = "bp-style";
    style.textContent = CSS;
    const el = document.createElement("div");
    el.className = "bp-ui";
    el.setAttribute("aria-hidden", "false");
    const path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/home";
    el.innerHTML = `
      <i class="bp-x"></i><i class="bp-y"></i><span class="bp-xy"></span>
      <div class="bp-box"><span></span></div>
      <div class="bp-tb" role="dialog" aria-label="Blueprint mode">
        <div>Techno Software Czech s.r.o.</div>
        <div class="bp-full"><span>Title</span><span>${document.title.split(" — ")[0]}</span></div>
        <div class="bp-full"><span>Dwg no.</span><span>TSC-${path.slice(1).replace(/\//g, "-").toUpperCase() || "HOME"}-001</span></div>
        <div class="bp-full"><span>Sheet</span><span class="bp-sheet"></span></div>
        <div class="bp-full"><span>Scale</span><span>1 : 1 · px</span></div>
        <div class="bp-full"><span>Date</span><span>${new Date().toISOString().slice(0, 10)}</span></div>
        <div><span>Checked</span><span>You found this. <a href="/careers">We hire engineers like you →</a></span></div>
        <button type="button">${matchMedia("(hover: none)").matches ? "Tap to exit blueprint" : "Esc — exit blueprint"}</button>
      </div>`;
    return { style, el, x: el.querySelector(".bp-x"), y: el.querySelector(".bp-y"), xy: el.querySelector(".bp-xy"),
      box: el.querySelector(".bp-box"), boxLabel: el.querySelector(".bp-box span"), sheet: el.querySelector(".bp-sheet"), btn: el.querySelector("button") };
  }

  const label = (t) => {
    const cls = typeof t.className === "string" && t.className.trim() ? "." + t.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    return t.tagName.toLowerCase() + cls;
  };
  let raf = 0, mx = 0, my = 0, target = null;
  const paint = () => {
    raf = 0;
    ui.x.style.top = my + "px"; ui.y.style.left = mx + "px";
    ui.xy.textContent = `X ${pad(mx)}  Y ${pad(my + scrollY)}`;
    ui.xy.style.left = Math.min(mx + 12, innerWidth - 150) + "px"; ui.xy.style.top = Math.min(my + 12, innerHeight - 28) + "px";
    if (target && !ui.el.contains(target)) {
      const r = target.getBoundingClientRect();
      Object.assign(ui.box.style, { display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
      ui.boxLabel.textContent = `${label(target)} — ${Math.round(r.width)} × ${Math.round(r.height)}`;
      ui.boxLabel.style.top = r.top < 24 ? "100%" : "-21px";
    } else ui.box.style.display = "none";
  };
  const onMove = (e) => { mx = e.clientX; my = e.clientY; target = e.target; if (!raf) raf = requestAnimationFrame(paint); };
  const onClick = (e) => {
    if (ui.el.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();       // a drawing is for reading, not clicking
    mx = e.clientX; my = e.clientY; target = e.target; paint();
  };
  const onKey = (e) => { if (e.key === "Escape") toggle(false); };
  const sheet = () => { ui.sheet.textContent = `${innerWidth} × ${document.documentElement.scrollHeight} px`; };

  function dims(add) {
    document.querySelectorAll(".bp-dim").forEach((d) => d.remove());
    if (!add) return;
    document.querySelectorAll("main > section, main > header, main > .wrap, footer").forEach((s, i) => {
      const d = document.createElement("span");
      d.className = "bp-dim";
      d.textContent = `S-${pad(i + 1, 2)} · ${Math.round(s.offsetWidth)} × ${Math.round(s.offsetHeight)}`;
      s.appendChild(d);
    });
  }

  function apply(state, from) {
    on = state;
    if (state) {
      ui = ui || build();
      document.head.appendChild(ui.style);
      document.body.appendChild(ui.el);
      doc.classList.add("bp");
      dims(true); sheet();
      if (from) { mx = from.x; my = from.y; paint(); }
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("click", onClick, true);
      addEventListener("keydown", onKey);
      addEventListener("resize", sheet);
      ui.btn.onclick = () => toggle(false);
      ui.btn.focus({ preventScroll: true });
      console.log("%c▟▀▙ blueprint mode — Esc to exit", "font:600 12px monospace;color:#1530d6");
    } else {
      doc.classList.remove("bp");
      dims(false);
      ui.style.remove(); ui.el.remove();
      removeEventListener("pointermove", onMove);
      removeEventListener("click", onClick, true);
      removeEventListener("keydown", onKey);
      removeEventListener("resize", sheet);
    }
  }

  function toggle(state = !on, from) {
    if (state === on) return;
    if (!reduce && document.startViewTransition) {
      // the drawing spreads from where it was summoned
      const x = from ? from.x : innerWidth / 2, y = from ? from.y : innerHeight / 2;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => apply(state, from));
      vt.ready.then(() => doc.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
    } else apply(state, from);
  }

  window.TSCBlueprint = { toggle };
})();
