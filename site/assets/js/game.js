/* "Build a team" — a 30-second game hidden behind the footer button.
   One module joins the structure, again and again: tap or press Space to dock
   each engineer onto the tower. Overhang leaves the team; perfect docks grow it back.
   Loaded on demand by main.js. */
(() => {
  if (window.TSCGame) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROLES = ["Back-end", "Front-end", "QA", "DevOps", "Embedded", "Data", "Mobile", "SRE", "Analyst", "UX", "Tech lead", "AUTOSAR", "Platform", "Security"];
  const C = { bg: "#050c3d", grid: "rgba(74,99,255,.16)", gridB: "rgba(74,99,255,.3)", team: "#1530d6", teamHi: "#4a63ff", join: "#9eadff", white: "#ffffff", pale: "#c6cfff" };
  const store = { get() { try { return +localStorage.getItem("tsc-team-best") || 0; } catch { return 0; } }, set(v) { try { localStorage.setItem("tsc-team-best", v); } catch {} } };

  const CSS = `
  .tg { position: fixed; inset: 0; z-index: 200; background: ${C.bg}; color: #fff; display: grid; grid-template-rows: auto 1fr; opacity: 0; transition: opacity .35s cubic-bezier(.22,1,.36,1); }
  .tg.is-in { opacity: 1; }
  .tg[hidden] { display: none; }
  .tg__bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px clamp(16px, 3vw, 40px); border-bottom: 1px solid rgba(255,255,255,.14); font: 450 12px/1.4 "Geist Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
  .tg__title { display: flex; align-items: center; gap: 12px; } .tg__title svg { width: 22px; height: 22px; --mark-fill: #fff; --mark-dock: ${C.join}; }
  .tg__hud { display: flex; gap: clamp(14px, 3vw, 32px); color: ${C.pale}; } .tg__hud b { color: #fff; font-weight: 500; }
  .tg__x { all: unset; cursor: pointer; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.35); }
  .tg__x:focus-visible, .tg__btn:focus-visible { outline: 2px solid ${C.join}; outline-offset: 3px; }
  .tg__x::before, .tg__x::after { content: ""; position: absolute; width: 18px; height: 1.5px; background: #fff; transform: rotate(45deg); } .tg__x::after { transform: rotate(-45deg); } .tg__x { position: relative; }
  .tg__stage { position: relative; overflow: hidden; touch-action: manipulation; cursor: pointer; }
  .tg canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .tg__card { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: min(460px, calc(100% - 32px)); padding: clamp(24px, 4vw, 40px); background: rgba(5,12,61,.9); border: 1px solid rgba(255,255,255,.28); display: grid; gap: 18px; text-align: left; cursor: default; }
  .tg__card[hidden] { display: none; }
  .tg__card .k { font: 450 11px/1.4 "Geist Mono", monospace; letter-spacing: .1em; text-transform: uppercase; color: ${C.pale}; }
  .tg__card h2 { font: 380 clamp(2.2rem, 6vw, 3.4rem)/1 "Geist", sans-serif; letter-spacing: -.04em; }
  .tg__card h2 em { font-style: normal; color: ${C.pale}; }
  .tg__card p { font: 350 1.05rem/1.5 "Geist", sans-serif; color: rgba(255,255,255,.78); }
  .tg__row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
  .tg__btn { all: unset; box-sizing: border-box; cursor: pointer; min-height: 48px; padding: 0 20px; display: inline-flex; align-items: center; gap: 12px; font: 450 12px/1 "Geist Mono", monospace; letter-spacing: .1em; text-transform: uppercase; background: #fff; color: ${C.team}; }
  .tg__btn--ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.5); }
  .tg__keys { font: 450 11px/1.6 "Geist Mono", monospace; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.5); }
  body.tg-open { overflow: hidden; }
  `;

  let root, cv, ctx, startCard, endCard, hud, live, opener, W = 0, H = 0, dpr = 1;
  let state = "idle", tower = [], debris = [], pops = [], mover = null, camY = 0, camT = 0, combo = 0, last = 0, raf = 0, shake = 0, roleI = 0;
  const BH = () => Math.round(Math.max(26, Math.min(40, H / 15)));
  const baseW = () => Math.round(Math.min(W * 0.52, 340));

  function build() {
    const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement("div");
    root.className = "tg";
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Build a team — a game");
    root.innerHTML = `
      <div class="tg__bar">
        <span class="tg__title"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#mark"/></svg>Build a team</span>
        <span class="tg__hud"><span>Team <b data-score>0</b></span><span>Best <b data-best>0</b></span></span>
        <button class="tg__x" type="button" aria-label="Close the game"></button>
      </div>
      <div class="tg__stage">
        <canvas aria-hidden="true"></canvas>
        <div class="tg__card" data-start>
          <span class="k">[ 30-second game ]</span>
          <h2>Build a team.<br><em>Module by module.</em></h2>
          <p>Dock each engineer onto the team. Anything that overhangs leaves the team — a perfect dock grows it back.</p>
          <div class="tg__row"><button class="tg__btn" type="button" data-go>Start <span aria-hidden="true">→</span></button></div>
          <span class="tg__keys">Tap · Space · Enter to dock — Esc to close</span>
        </div>
        <div class="tg__card" data-end hidden>
          <span class="k" data-endk>[ Team assembled ]</span>
          <h2 data-endh></h2>
          <p data-endp></p>
          <div class="tg__row"><button class="tg__btn" type="button" data-go>Play again <span aria-hidden="true">↻</span></button><a class="tg__btn tg__btn--ghost" href="/#contact" data-real>Build the real one →</a></div>
        </div>
        <p class="sr-only" aria-live="polite" data-live style="position:absolute;left:-9999px"></p>
      </div>`;
    document.body.appendChild(root);
    cv = root.querySelector("canvas"); ctx = cv.getContext("2d");
    startCard = root.querySelector("[data-start]"); endCard = root.querySelector("[data-end]");
    hud = { score: root.querySelector("[data-score]"), best: root.querySelector("[data-best]") };
    live = root.querySelector("[data-live]");
    root.querySelector(".tg__x").addEventListener("click", close);
    root.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); start(); }));
    root.querySelector("[data-real]").addEventListener("click", () => close());
    root.querySelector(".tg__stage").addEventListener("pointerdown", (e) => { if (state === "play" && !e.target.closest(".tg__card")) { e.preventDefault(); drop(); } });
    new ResizeObserver(resize).observe(root.querySelector(".tg__stage"));
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (state === "idle") reset();
    draw();
  }

  const role = () => ROLES[roleI++ % ROLES.length];
  function reset() {
    const bw = baseW();
    tower = [{ x: (W - bw) / 2, w: bw, role: "Your team", lead: true }];
    debris = []; pops = []; combo = 0; camY = camT = 0; roleI = Math.floor(Math.random() * ROLES.length);
    spawn();
    hud.score.textContent = "0"; hud.best.textContent = store.get();
  }
  function spawn() {
    const top = tower[tower.length - 1], n = tower.length;
    const fromLeft = n % 2 === 1;
    const speed = Math.min(W * 1.25, W * (0.42 + 0.03 * n)) + 60;
    mover = { x: fromLeft ? -top.w : W, w: top.w, dir: fromLeft ? 1 : -1, speed, role: role() };
  }

  function drop() {
    const top = tower[tower.length - 1], m = mover;
    const lo = Math.max(m.x, top.x), hi = Math.min(m.x + m.w, top.x + top.w);
    const bh = BH(), y = tower.length; // row index
    if (hi - lo <= 0) {
      debris.push({ x: m.x, w: m.w, row: y, vy: 0, vyAcc: 0, vx: m.dir * 40, rot: 0, vr: m.dir * 1.6, role: m.role });
      return over();
    }
    let x = lo, w = hi - lo, perfect = false;
    if (Math.abs(m.x - top.x) <= Math.max(3, W * 0.006)) {
      perfect = true; x = top.x; w = top.w; combo++;
      if (combo >= 3) { const grow = Math.min(baseW() - w, 10); x -= grow / 2; w += grow; }
      pops.push({ x, w, row: y, t: 0, text: combo >= 3 ? `Perfect dock ×${combo}` : "Perfect dock" });
      if (navigator.vibrate) try { navigator.vibrate(12); } catch {}
    } else {
      combo = 0;
      const cutL = m.x < top.x, cx = cutL ? m.x : hi, cw = m.w - w;
      if (cw > 0.5) debris.push({ x: cx, w: cw, row: y, vy: 0, vyAcc: 0, vx: (cutL ? -1 : 1) * 60, rot: 0, vr: (cutL ? -1 : 1) * 1.2, role: "" });
      shake = reduce ? 0 : 3;
    }
    tower.push({ x, w, role: m.role, perfect, born: performance.now() });
    const score = tower.length - 1;
    hud.score.textContent = score;
    if (score > +hud.best.textContent) hud.best.textContent = score;
    const rows = Math.floor((H * 0.58) / bh);
    camT = Math.max(0, (tower.length - rows) * bh);
    spawn();
  }

  function over() {
    state = "over";
    const score = tower.length - 1, best = Math.max(score, store.get());
    store.set(best); hud.best.textContent = best;
    const h = endCard.querySelector("[data-endh]"), p = endCard.querySelector("[data-endp]"), k = endCard.querySelector("[data-endk]");
    k.textContent = score >= best && score > 0 ? "[ New best ]" : "[ Team assembled ]";
    h.innerHTML = `Team of ${score}<br><em>${score === 1 ? "engineer." : "engineers."}</em>`;
    p.textContent = score < 5 ? "A start. A real team of senior engineers takes us two to four weeks."
      : score < 15 ? "A solid team. The real one comes with the contracts, the payroll and the follow-up."
      : "That is a department. Let's talk about building it for real.";
    live.textContent = `Game over. Team of ${score}. Best ${best}.`;
    setTimeout(() => { endCard.hidden = false; endCard.querySelector("[data-go]").focus(); }, 650);
  }

  function start() {
    startCard.hidden = true; endCard.hidden = true;
    reset(); state = "play"; root.querySelector(".tg__stage").focus?.();
  }

  // ------------------------------------------------------------------ drawing
  function block(x, yTop, w, bh, fill, hi, label, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill; ctx.fillRect(x, yTop, w, bh - 2);
    // module texture: the block is a row of squares, so a cut module reads as cut
    const s = bh - 12, gap = 4;
    ctx.fillStyle = hi;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 4, yTop + 4, Math.max(0, w - 8), bh - 10); ctx.clip();
    for (let mx = x + 4; mx < x + w; mx += s + gap) ctx.fillRect(mx, yTop + 4, s, bh - 10);
    ctx.restore();
    if (label && w > 86) {
      ctx.fillStyle = C.white; ctx.font = `500 ${Math.max(9, Math.round(bh * 0.3))}px "Geist Mono", monospace`;
      ctx.textBaseline = "middle"; ctx.fillText(label.toUpperCase(), x + 10, yTop + (bh - 2) / 2 + 1);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!ctx) return;
    const bh = BH();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const sx = shake ? (Math.random() - 0.5) * shake : 0;
    ctx.translate(sx, 0);
    // drafting grid that scrolls with the tower
    const off = camY % 24;
    for (let x = (W / 2) % 24; x < W; x += 24) { ctx.fillStyle = Math.round((x - W / 2) / 24) % 5 === 0 ? C.gridB : C.grid; ctx.fillRect(x, 0, 1, H); }
    for (let y = H - off; y > 0; y -= 24) { ctx.fillStyle = C.grid; ctx.fillRect(0, y, W, 1); }
    const base = H - 28 + camY; // screen y of row 0's bottom
    const rowTop = (r) => base - (r + 1) * bh;
    // ground line + dimension tick
    ctx.fillStyle = C.gridB; ctx.fillRect(0, base, W, 1);
    // tower
    tower.forEach((b, i) => {
      const yt = rowTop(i);
      if (yt > H || yt < -bh) return;
      const fresh = b.born ? Math.min(1, (performance.now() - b.born) / 500) : 1;
      const fill = b.lead ? "#0f1f9e" : C.team;
      const hi = b.lead ? "#16238f" : fresh < 1 ? blend(C.join, C.teamHi, fresh) : C.teamHi;
      block(b.x, yt, b.w, bh, fill, hi, b.role);
    });
    // falling overhang
    debris.forEach((d) => {
      const yt = rowTop(d.row) + d.vyAcc;
      ctx.save(); ctx.translate(d.x + d.w / 2, yt + bh / 2); ctx.rotate(d.rot);
      block(-d.w / 2, -bh / 2, d.w, bh, "#0a1466", "#16238f", "", Math.max(0, 1 - d.vyAcc / (H * 0.7)));
      ctx.restore();
    });
    // the joining module
    if (state === "play" && mover) {
      const yt = rowTop(tower.length);
      block(mover.x, yt, mover.w, bh, C.join, "#b8c3ff", "", 1);
      ctx.fillStyle = C.bg; ctx.font = `500 ${Math.max(9, Math.round(bh * 0.3))}px "Geist Mono", monospace`; ctx.textBaseline = "middle";
      if (mover.w > 86) ctx.fillText(`+ ${mover.role.toUpperCase()}`, mover.x + 10, yt + (bh - 2) / 2 + 1);
      // alignment guides down to the team, like a drawing
      const top = tower[tower.length - 1];
      ctx.fillStyle = "rgba(158,173,255,.35)";
      ctx.fillRect(Math.round(top.x), 0, 1, yt); ctx.fillRect(Math.round(top.x + top.w), 0, 1, yt);
    }
    // "perfect dock" call-outs
    // "perfect dock" call-outs: a leader line out to the side, like a dimension note
    pops.forEach((p) => {
      const a = Math.max(0, 1 - p.t), yc = rowTop(p.row) + bh / 2 - 1;
      const right = p.x + p.w + 120 < W, x0 = right ? p.x + p.w + 6 : p.x - 6, dir = right ? 1 : -1;
      ctx.globalAlpha = a;
      ctx.strokeStyle = C.join; ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 3 - p.t * 6, rowTop(p.row) - 3 - p.t * 6, p.w + 6 + p.t * 12, bh + 4 + p.t * 12);
      ctx.fillStyle = C.join; ctx.fillRect(right ? x0 : x0 - 22, yc, 22, 1);
      ctx.fillStyle = C.white; ctx.font = `500 11px "Geist Mono", monospace`; ctx.textBaseline = "middle"; ctx.textAlign = right ? "left" : "right";
      ctx.fillText(p.text.toUpperCase(), x0 + dir * 28, yc - p.t * 8);
      ctx.textAlign = "start"; ctx.globalAlpha = 1;
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  const blend = (a, b, k) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (state === "play" && mover) {
      mover.x += mover.dir * mover.speed * dt;
      if (mover.x > W - mover.w * 0.25) { mover.x = W - mover.w * 0.25; mover.dir = -1; }
      if (mover.x < -mover.w * 0.75) { mover.x = -mover.w * 0.75; mover.dir = 1; }
    }
    debris.forEach((d) => { d.vy += 1600 * dt; d.vyAcc = (d.vyAcc || 0) + d.vy * dt; d.x += d.vx * dt; d.rot += d.vr * dt; });
    debris = debris.filter((d) => d.vyAcc < H * 1.2);
    pops.forEach((p) => (p.t += dt * 1.3)); pops = pops.filter((p) => p.t < 1);
    camY += (camT - camY) * Math.min(1, dt * (reduce ? 30 : 6));
    shake *= 0.85; if (shake < 0.2) shake = 0;
    draw();
    raf = requestAnimationFrame(step);
  }

  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); return close(); }
    if ((e.key === " " || e.key === "Enter") && state === "play") { e.preventDefault(); drop(); }
    if (e.key === "Tab") { // keep focus inside the dialog
      const f = [...root.querySelectorAll("button:not([hidden]), a")].filter((x) => x.offsetParent);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (root?.isConnected && !raf) { last = performance.now(); raf = requestAnimationFrame(step); } };

  function open(from) {
    opener = from || document.activeElement;
    if (!root) build();
    root.hidden = false;
    document.body.classList.add("tg-open");
    state = "idle"; startCard.hidden = false; endCard.hidden = true;
    requestAnimationFrame(() => { root.classList.add("is-in"); resize(); startCard.querySelector("[data-go]").focus(); });
    addEventListener("keydown", onKey); document.addEventListener("visibilitychange", onVis);
    last = performance.now(); raf = requestAnimationFrame(step);
  }
  function close() {
    root.classList.remove("is-in");
    removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis);
    document.body.classList.remove("tg-open");
    setTimeout(() => { cancelAnimationFrame(raf); raf = 0; root.hidden = true; state = "idle"; opener?.focus?.(); }, reduce ? 0 : 300);
  }

  window.TSCGame = { open, close, peek: () => ({ state, mover: mover && { x: mover.x, w: mover.w }, top: tower.length && { x: tower[tower.length - 1].x, w: tower[tower.length - 1].w }, team: tower.length - 1 }) };
})();
