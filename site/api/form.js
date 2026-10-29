/* =====================================================================
   /api/form — the contact and careers forms, delivered by email.
   Ported from the alprojects endpoint, cut down to these two forms.

   Nothing is stored: each submission becomes one email and is gone.
   No dependencies: the mail provider is a JSON POST over fetch.

   SETTINGS (Vercel project → Settings → Environment Variables)
     MAIL_PROVIDER   resend | dry-run     unset = the endpoint refuses (503)
     MAIL_API_KEY    the provider's key
     MAIL_TO         where submissions go       default info@technosoftware.cz
     MAIL_FROM       a sender the provider has verified, e.g. forms@technosoftware.cz

   With MAIL_PROVIDER unset, GET answers {configured:false} and the page keeps
   using the visitor's email app, exactly as before. Set the variables and the
   forms start delivering, with no deploy in between. Any failure returns a
   non-2xx, and the page then falls back to the email app with every field
   filled in — a submission is never reported sent when it was not.

   Functions run in Frankfurt (vercel.json "regions"), so form data is
   processed in the EU.
   ===================================================================== */

const MAX_BYTES = 4 * 1024 * 1024;  // under the platform's 4.5 MB request cap
const ALLOWED_EXT = ["pdf", "doc", "docx"];
const ORIGINS = (process.env.SITE_ORIGIN || "https://technosoftware.cz,https://www.technosoftware.cz")
  .split(",").map((s) => s.trim()).filter(Boolean);

// which fields each form may send; anything else is dropped, not emailed
const FORMS = {
  form: { subject: "Team request", fields: ["name", "company", "email", "need", "message"], files: false },
  "careers-form": { subject: "Application", fields: ["name", "email", "role", "link", "mode", "contract", "talent_pool", "message"], files: true },
};
const PROVIDERS = { resend: "Resend" };

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
const oneLine = (s) => String(s == null ? "" : s).replace(/[\r\n]+/g, " ").slice(0, 200);

// one delivered submission per minute per address and form, per instance — blunts a script,
// nothing more. Only a send that succeeded counts, so a retry after a failure is never refused.
const seen = new Map();
function throttled(key) {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 120000) seen.delete(k);
  return seen.has(key) && now - seen.get(key) < 60000;
}

async function send(mail) {
  const provider = (process.env.MAIL_PROVIDER || "").toLowerCase();
  if (!provider) return { ok: false, unconfigured: true, error: "MAIL_PROVIDER is not set" };
  if (provider === "dry-run") {
    console.log("[form] dry-run:", JSON.stringify({ to: mail.to, subject: mail.subject, bytes: mail.text.length, files: mail.attachments.map((a) => a.filename) }));
    return { ok: true };
  }
  const key = process.env.MAIL_API_KEY;
  if (!key) return { ok: false, error: "MAIL_API_KEY is not set" };
  if (provider === "resend") {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify({
        from: mail.from, to: [mail.to], reply_to: mail.replyTo, subject: mail.subject, text: mail.text,
        attachments: mail.attachments.map((a) => ({ filename: a.filename, content: a.base64 })),
      }),
    });
    if (!r.ok) return { ok: false, error: "resend " + r.status + " " + (await r.text()).slice(0, 300) };
    let id = null;
    try { id = (await r.json()).id; } catch { /* accepted */ }
    console.log("[form] resend accepted id=" + id);
    return { ok: true };
  }
  return { ok: false, error: "unknown MAIL_PROVIDER " + provider };
}

async function handle(request) {
  // GET: is a mail processor configured? The page and the privacy notice ask.
  if (request.method === "GET") {
    const p = (process.env.MAIL_PROVIDER || "").toLowerCase();
    return json(200, { configured: !!PROVIDERS[p] && !!process.env.MAIL_API_KEY, processor: PROVIDERS[p] || null });
  }
  if (request.method !== "POST") return json(405, { ok: false, error: "post only" });

  const origin = request.headers.get("origin") || "";
  if (!ORIGINS.includes(origin) && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return json(403, { ok: false, error: "origin" });

  let data;
  try { data = await request.formData(); } catch { return json(413, { ok: false, error: "body" }); }
  const which = String(data.get("form") || "");
  const form = FORMS[which];
  if (!form) return json(400, { ok: false, error: "unknown form" });
  if (String(data.get("website") || "").trim()) return json(200, { ok: true });  // honeypot: tell the bot it worked

  const email = String(data.get("email") || "").trim();
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return json(422, { ok: false, error: "email" });
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (throttled(ip + "|" + which)) return json(429, { ok: false, error: "too soon" });

  const lines = [];
  for (const f of form.fields) {
    const v = data.getAll(f).filter((x) => typeof x === "string" && x.trim()).join(", ");
    if (v) lines.push(f.padEnd(12) + v.replace(/\r?\n/g, "\n" + " ".repeat(12)));
  }
  const attachments = [];
  if (form.files) {
    for (const f of data.getAll("cv").filter((x) => x && typeof x === "object" && x.name && x.size)) {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) return json(422, { ok: false, error: "file type" });
      if (f.size > MAX_BYTES) return json(413, { ok: false, error: "file too large" });
      attachments.push({ filename: f.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120), base64: Buffer.from(await f.arrayBuffer()).toString("base64") });
    }
  }
  lines.push("", "--- request ---", "page        " + oneLine(data.get("page") || origin), "received    " + new Date().toISOString());

  const who = oneLine(which === "form" ? (data.get("company") || data.get("name")) : data.get("name"));
  const result = await send({
    to: process.env.MAIL_TO || "info@technosoftware.cz",
    from: process.env.MAIL_FROM || "Techno Software Czech <forms@technosoftware.cz>",
    replyTo: email,
    subject: oneLine(form.subject + (which === "careers-form" && data.get("role") ? " — " + data.get("role") : "") + (who ? " — " + who : "")),
    text: lines.join("\n"),
    attachments,
  });
  if (!result.ok) {
    console.error("[form] not sent:", result.error);
    return json(result.unconfigured ? 503 : 502, { ok: false, error: "mail" });
  }
  seen.set(ip + "|" + which, Date.now());
  return json(200, { ok: true });
}

// Vercel's Node runtime calls (req, res); tests and Web runtimes call (Request).
export default async function handler(a, b) {
  if (!b || typeof b.end !== "function") return handle(a);
  const req = a, res = b;
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size <= MAX_BYTES + 512 * 1024) chunks.push(c); }
  let out;
  if (size > MAX_BYTES + 512 * 1024) out = json(413, { ok: false, error: "body too large" });
  else {
    const url = (req.headers["x-forwarded-proto"] || "https") + "://" + (req.headers["x-forwarded-host"] || req.headers.host) + req.url;
    try {
      out = await handle(new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
    } catch (e) {
      console.error("[form] threw:", e);
      out = json(500, { ok: false, error: "server" });
    }
  }
  res.statusCode = out.status;
  out.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await out.arrayBuffer()));
}
