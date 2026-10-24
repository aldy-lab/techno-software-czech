"""Build the site from tools/index.src.html (the source of truth for header, footer
and SVG sprite) and tools/content.py.

    python3 tools/build.py && python3 tools/og.py

SITE is the public origin; INDEXABLE flips noindex/robots once the domain is live.
"""
import hashlib, html, json, pathlib, re, sys
from datetime import date

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import content as C  # noqa: E402

SITE = "https://techno-software-czech.vercel.app"
INDEXABLE = False  # flip to True when the real domain is connected

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent / "site"
src = (TOOLS / "index.src.html").read_text(encoding="utf-8")
og_jobs = []  # (key, eyebrow, title) for tools/og.py

# One fingerprint for all CSS + JS: URLs change whenever any of them does, so the
# host can cache /assets/css and /assets/js for a year (see vercel.json).
ASSETS = sorted((ROOT / "assets" / "css").glob("*.css")) + sorted((ROOT / "assets" / "js").glob("*.js"))
VER = hashlib.sha256(b"".join(f.read_bytes() for f in ASSETS)).hexdigest()[:10]

# Prefetch same-site pages on hover/touch, so the next page is usually already here.
SPECULATION = """<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/assets/*"}}]},"eagerness":"moderate"}]}</script>"""


def block(name):
    return re.search(rf"<!-- CHROME:{name} -->.*?<!-- /CHROME:{name} -->", src, re.S).group(0)


def esc(s):
    return html.escape(s, quote=True)


def clean(o):
    """Drop empty fields before serialising — Google rejects JSON-LD containing null."""
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items() if v not in (None, "", [], {})}
    if isinstance(o, list):
        return [clean(v) for v in o if v not in (None, "", [], {})]
    return o


def ld(obj):
    return f'<script type="application/ld+json">{json.dumps(clean(obj), ensure_ascii=False)}</script>'


def crumbs_ld(items):
    return ld({"@context": "https://schema.org", "@type": "BreadcrumbList",
               "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]})


def og_for(key, eyebrow, title):
    og_jobs.append((key, eyebrow, title))
    return f"{SITE}/assets/img/og/{key}.png"


def finish(page):
    page = page.replace("{{SITE}}", SITE)
    page = page.replace('href="/assets/css/main.css"', f'href="/assets/css/main.css?v={VER}"')
    page = page.replace('src="/assets/js/main.js"', f'src="/assets/js/main.js?v={VER}"')
    page = page.replace("</head>", SPECULATION + "\n</head>", 1)
    if INDEXABLE:
        page = page.replace('<meta name="robots" content="noindex">\n', "")
    return page


def page(path, title, desc, body, og, extra_head="", solid=True):
    head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)} — Techno Software Czech</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}{path}">
<meta name="theme-color" content="#1530d6">
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<meta property="og:type" content="{'article' if path.startswith('/insights/') else 'website'}">
<meta property="og:site_name" content="Techno Software Czech">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image">
{extra_head}
<script>document.documentElement.classList.add('js')</script>
</head>
<body{' class="page-solid"' if solid else ''}>
<a class="skip" href="#main">Skip to content</a>
"""
    tail = "\n".join([block("FOOTER"), block("SPRITE"), '<script src="/assets/js/main.js" defer></script>\n</body>\n</html>\n'])
    return finish(head + block("HEADER") + "\n" + body + "\n" + tail)


def arrow(href, text):
    return f'<a class="link-arrow" href="{href}">{text} <svg viewBox="0 0 16 16"><use href="#arrow"/></svg></a>'


def btn(href, text, cls="btn"):
    return f'<a class="{cls}" href="{href}">{text} <span class="btn__icon"><svg viewBox="0 0 16 16"><use href="#arrow"/></svg></span></a>'


def nice(d):
    return date.fromisoformat(d).strftime("%-d %B %Y")


def post_cards(posts):
    cards = "".join(f"""
      <a class="post rv" href="/insights/{p['slug']}">
        <div class="post__fig"><canvas data-dither="{p['scene']}" data-colors="light" aria-hidden="true"></canvas></div>
        <div class="post__body">
          <div class="post__meta label"><span>{p['tag']}</span><span>{p['minutes']} min read</span></div>
          <h3>{esc(p['title'])}</h3>
          <p>{esc(p['desc'])}</p>
        </div>
      </a>""" for p in posts)
    return f'<div class="posts">{cards}\n    </div>'


def faq_items():
    out = []
    for i, (q, a) in enumerate(C.FAQ):
        out.append(f"""        <div class="acc__item">
          <h3><button class="acc__btn" type="button" aria-expanded="false"><span class="acc__title"><span class="label">{i + 1:02d}</span><span>{esc(q)}</span></span><span class="acc__sign" aria-hidden="true"></span></button></h3>
          <div class="acc__panel"><div class="acc__inner"><div class="acc__content"><p>{esc(a)}</p></div></div></div>
        </div>""")
    return "\n".join(out)


# ------------------------------------------------------------------ home
home = src.replace("<!-- POSTS:3 -->", post_cards(C.POSTS[:3])).replace("<!-- FAQ -->", faq_items())
home = home.replace("</head>", ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
    {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in C.FAQ]}) + "\n</head>", 1)
(ROOT / "index.html").write_text(finish(home), encoding="utf-8")


# ------------------------------------------------------------------ insights
def text_hero(crumbs, h1, lead, meta=""):
    return f"""<main id="main">
<header class="art-hero"><div class="wrap">
  <nav class="crumbs label" aria-label="Breadcrumb">{crumbs}</nav>
  <h1>{h1}</h1>
  <p class="lead">{lead}</p>{meta}
</div></header>"""


SEP = '<span aria-hidden="true">/</span>'
CTA = f"""<section class="cta-band"><canvas data-dither="waves" aria-hidden="true"></canvas><div class="wrap">
  <h2>Need engineers who already speak your domain?</h2>{btn("/#contact", "Talk to us", "btn btn--light")}
</div></section>"""

idx_body = text_hero(f'<a href="/">Home</a>{SEP}<span>Insights</span>', "Insights",
                     "Practical notes for engineering leaders on building teams, contracting in the Czech Republic and working in regulated industries.") + f"""
<section class="section"><div class="wrap">{post_cards(C.POSTS)}</div></section>
{CTA}
</main>"""
(ROOT / "insights.html").write_text(page("/insights", "Insights", "Practical notes for engineering leaders on team augmentation, contracting in Czechia and regulated industries.",
                                         idx_body, og_for("insights", "Insights", "Notes for engineering leaders"),
                                         crumbs_ld([("Home", "/"), ("Insights", "/insights")])), encoding="utf-8")

(ROOT / "insights").mkdir(exist_ok=True)
for p in C.POSTS:
    toc = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in re.findall(r'<h2 id="([\w-]+)">(.*?)</h2>', p["body"]))
    meta = f'<div class="art-meta label"><span>{p["tag"]}</span><span>{nice(p["date"])}</span><span>{p["minutes"]} min read</span><span>Techno Software Czech</span></div>'
    body = text_hero(f'<a href="/">Home</a>{SEP}<a href="/insights">Insights</a>{SEP}<span>{p["tag"]}</span>', esc(p["title"]), esc(p["lead"]), meta) + f"""
<div class="wrap"><figure class="art-fig"><canvas data-dither="{p['scene']}" data-colors="light" aria-hidden="true"></canvas></figure></div>
<div class="wrap art">
  <aside class="art__aside"><span class="label">On this page</span><ol>{toc}</ol></aside>
  <article class="art__body">{p['body']}</article>
</div>
<section class="section section--alt"><div class="wrap">
  <div class="sec-head"><h2>Read next</h2>{arrow("/insights", "All insights")}</div>
  {post_cards([q for q in C.POSTS if q is not p][:3])}
</div></section>
{CTA}
</main>"""
    article = ld({"@context": "https://schema.org", "@type": "Article", "headline": p["title"], "description": p["desc"],
                  "datePublished": p["date"], "dateModified": p["date"], "inLanguage": "en",
                  "image": f"{SITE}/assets/img/og/{p['slug']}.png", "mainEntityOfPage": f"{SITE}/insights/{p['slug']}",
                  "author": {"@type": "Organization", "name": "Techno Software Czech", "url": SITE},
                  "publisher": {"@type": "Organization", "name": "Techno Software Czech s.r.o.", "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/img/apple-touch-icon.png"}}})
    (ROOT / "insights" / f"{p['slug']}.html").write_text(page(
        f"/insights/{p['slug']}", p["title"], p["desc"], body, og_for(p["slug"], p["tag"], p["title"]),
        article + "\n" + crumbs_ld([("Home", "/"), ("Insights", "/insights"), (p["title"], f"/insights/{p['slug']}")])), encoding="utf-8")

# ------------------------------------------------------------------ careers
role_opts = "".join(f'<option value="{esc(r[0])}">{esc(r[0])}</option>' for r in C.ROLES) + "".join(f'<option value="{esc(j["title"])}">{esc(j["title"])}</option>' for j in C.JOBS)
roles = "".join(f"""
    <article class="role rv">
      <div class="role__top"><span class="label label--muted">{r[1]}</span><span class="role__tag">Talent pool</span></div>
      <h3>{esc(r[0])}</h3>
      <div style="display:grid;gap:14px;align-content:start"><p>{esc(r[2])}</p><ul class="ind__tags">{''.join(f'<li>{esc(t)}</li>' for t in r[3])}</ul></div>
      <a class="link-arrow" href="#apply" data-role="{esc(r[0])}">Apply for this profile <svg viewBox="0 0 16 16"><use href="#arrow"/></svg></a>
    </article>""" for r in C.ROLES)
if C.JOBS:
    jobs = '<div class="jobs">' + "".join(f"""<a class="job rv" href="/careers/{j['slug']}"><h3>{esc(j['title'])}</h3><span>{esc(j['location'])}</span><span>{nice(j['date'])}</span><svg viewBox="0 0 16 16" width="16" height="16" style="color:var(--accent)"><use href="#arrow"/></svg></a>""" for j in C.JOBS) + "</div>"
else:
    jobs = f"""<div class="jobs"><div class="jobs__empty rv"><p>No individual vacancies are published right now. We staff new client projects regularly — join the talent pool and we will contact you when one fits.</p>{btn("#apply", "Join the talent pool")}</div></div>"""
perks = "".join(f'<div class="perk rv"><b>{i + 1:02d}</b><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for i, (t, d) in enumerate(C.PERKS))
steps = "".join(f'<li class="step rv"><div class="step__h"><b>{i + 1:02d}</b><h3>{esc(t)}</h3></div><div class="step__b"><p>{esc(d)}</p><span class="label">{esc(m)}</span></div></li>' for i, (t, d, m) in enumerate(C.CANDIDATE_STEPS))

careers_body = f"""<main id="main">
<section class="hero phero" aria-labelledby="careers-title">
  <canvas class="hero__canvas" data-dither="waves" aria-hidden="true"></canvas>
  <div class="hero__rules" aria-hidden="true"><span></span><span></span></div>
  <div class="wrap hero__body">
    <p class="hero__eyebrow label bracket">Careers · Prague &amp; remote</p>
    <div class="hero__side">
      <p>We place senior engineers in fintech, automotive and industrial product teams across Europe. You get the projects; we take care of the contract, the paperwork and the follow-up.</p>
      <div class="hero__ctas">{btn("#apply", "Apply now", "btn btn--light")}<a class="btn btn--ghost" href="#profiles">Who we hire</a></div>
    </div>
    <h1 class="hero__title" id="careers-title">Do your best work<br><em>inside great teams.</em></h1>
  </div>
  <div class="hero__facts"><div class="wrap"><ul>
    <li><b>Prague</b><span class="label">Registered office</span></li>
    <li><b>Remote · hybrid</b><span class="label">Or on-site</span></li>
    <li><b>HPP · IČO</b><span class="label">Employment or contract</span></li>
    <li><b>CET</b><span class="label">Time zone</span></li>
  </ul></div></div>
</section>

<section class="section" aria-labelledby="why-join">
  <div class="wrap split"><h2 class="split__h rv" id="why-join"><span>Why</span><span>join us</span></h2></div>
  <div class="wrap"><div class="perks">{perks}</div></div>
</section>

<section class="section section--alt" id="profiles" aria-labelledby="profiles-title">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv" id="profiles-title">Who we hire</h2><p class="prose rv" style="max-width:44ch">Profiles we look for all year round. Apply once; we contact you when a client project matches your stack and preferences.</p></div>
    <div class="roles-grid">{roles}
    </div>
  </div>
</section>

<section class="section" id="open" aria-labelledby="open-title">
  <div class="wrap">
    <div class="sec-head"><h2 class="rv" id="open-title">Open positions</h2></div>
    {jobs}
  </div>
</section>

<section class="section section--alt" aria-labelledby="hire-title">
  <div class="wrap split"><h2 class="split__h rv" id="hire-title"><span>How we</span><span>hire</span></h2></div>
  <div class="wrap"><ol class="steps">{steps}</ol></div>
</section>

<section class="section" id="apply" aria-labelledby="apply-title">
  <div class="wrap apply">
    <div class="apply__info rv">
      <h2 id="apply-title">Apply.</h2>
      <p class="prose">One application covers every profile. Tell us what you are good at and what you want next — we read every one.</p>
      <dl class="kv"><div><dt class="label">Reply</dt><dd>Within a week</dd></div><div><dt class="label">Language</dt><dd>English or Czech</dd></div></dl>
    </div>
    <form class="contact__form rv" id="careers-form" data-cfg="careers-form" novalidate>
      <div class="fields-2">
        <div class="field"><label class="label" for="c-name">Name</label><input id="c-name" name="name" autocomplete="name" required></div>
        <div class="field"><label class="label" for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="fields-2">
        <div class="field"><label class="label" for="c-role">Profile</label><select id="c-role" name="role"><option value="">Choose a profile</option>{role_opts}<option value="Other">Other</option></select></div>
        <div class="field"><label class="label" for="c-link">LinkedIn or CV link</label><input id="c-link" name="link" type="url" inputmode="url" placeholder="https://"></div>
      </div>
      <fieldset class="field" style="margin:0;border-left:0;border-right:0;border-top:0">
        <legend class="label" style="color:var(--muted);padding:0;margin-bottom:8px">Preferred arrangement</legend>
        <div class="chips">
          <label><input type="checkbox" name="mode" value="Remote"><span>Remote</span></label>
          <label><input type="checkbox" name="mode" value="Hybrid"><span>Hybrid</span></label>
          <label><input type="checkbox" name="mode" value="On-site"><span>On-site</span></label>
          <label><input type="checkbox" name="contract" value="Employment"><span>Employment</span></label>
          <label><input type="checkbox" name="contract" value="Contractor"><span>Contractor (IČO)</span></label>
        </div>
      </fieldset>
      <div class="field" data-needs-endpoint><label class="label" for="c-cv">CV (PDF or Word, max 10 MB)</label><input id="c-cv" name="cv" type="file" accept=".pdf,.doc,.docx"></div>
      <div class="field"><label class="label" for="c-msg">About you</label><textarea id="c-msg" name="message" rows="4" required></textarea></div>
      <label class="consent"><input type="checkbox" name="talent_pool" value="yes"><span>Keep my details in the talent pool for up to 2 years so you can contact me about future projects. I can withdraw this at any time.</span></label>
      <div class="hp" aria-hidden="true"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="form__foot">
        <small>We use your details to assess your application — see the <a href="/privacy#candidates">privacy notice</a>.</small>
        <button class="btn" type="submit">Send application <span class="btn__icon"><svg viewBox="0 0 16 16"><use href="#arrow"/></svg></span></button>
      </div>
      <p class="form__status" role="status" aria-live="polite"></p>
    </form>
    <div class="apply__fallback rv" data-fallback-for="careers-form" hidden>
      <p class="lead">Send your CV and a few lines about what you want to work on next to our registered office:</p>
      <address class="lead" style="font-style:normal;color:var(--accent)">Techno Software Czech s.r.o.<br>Školská 1736/12<br>110 00 Praha 1</address>
    </div>
  </div>
</section>
</main>"""
(ROOT / "careers.html").write_text(page("/careers", "Careers", "Careers at Techno Software Czech: senior engineering work in fintech, automotive and industrial teams, remote or in Prague.",
                                         careers_body, og_for("careers", "Careers", "Do your best work inside great teams."),
                                         crumbs_ld([("Home", "/"), ("Careers", "/careers")]), solid=False), encoding="utf-8")

(ROOT / "careers").mkdir(exist_ok=True)
for j in C.JOBS:
    sal = j.get("salary")
    posting = {"@context": "https://schema.org", "@type": "JobPosting", "title": j["title"], "description": j["body"],
               "datePosted": j["date"], "validThrough": j.get("valid_through"), "employmentType": j.get("type"),
               "hiringOrganization": {"@type": "Organization", "name": "Techno Software Czech s.r.o.", "sameAs": SITE},
               "jobLocation": {"@type": "Place", "address": {"@type": "PostalAddress", "streetAddress": "Školská 1736/12", "addressLocality": "Praha", "postalCode": "110 00", "addressCountry": "CZ"}},
               "jobLocationType": "TELECOMMUTE" if j.get("remote") else None,
               "baseSalary": {"@type": "MonetaryAmount", "currency": sal["currency"], "value": {"@type": "QuantitativeValue", "minValue": sal["min"], "maxValue": sal["max"], "unitText": sal["unit"]}} if sal else None}
    body = text_hero(f'<a href="/">Home</a>{SEP}<a href="/careers">Careers</a>', esc(j["title"]), esc(j["summary"]),
                     f'<div class="art-meta label"><span>{esc(j["location"])}</span><span>{nice(j["date"])}</span></div>') + f"""
<div class="wrap art"><aside class="art__aside">{btn("/careers#apply", "Apply")}</aside><article class="art__body">{j['body']}</article></div>
</main>"""
    (ROOT / "careers" / f"{j['slug']}.html").write_text(page(f"/careers/{j['slug']}", j["title"], j["summary"], body, og_for(f"job-{j['slug']}", "Careers", j["title"]),
                                                             ld(posting) + "\n" + crumbs_ld([("Home", "/"), ("Careers", "/careers"), (j["title"], f"/careers/{j['slug']}")])), encoding="utf-8")

# ------------------------------------------------------------------ privacy + 404
PRIVACY = """<main id="main" class="doc"><div class="wrap">
<p class="label label--muted" style="margin-bottom:20px">Last updated 24 October 2026</p>
<h1>Privacy notice</h1>
<div class="doc__body">
<p>This notice explains how Techno Software Czech s.r.o. handles personal data collected through this website, under the EU General Data Protection Regulation (GDPR) and Czech Act No. 110/2019 Coll.</p>
<h2>Controller</h2>
<p>Techno Software Czech s.r.o., Školská 1736/12, 110 00 Praha 1 – Nové Město, Czech Republic. IČO 29521513, registered with the Municipal Court in Prague, file C 447880.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Client enquiries.</strong> Name, company, email address and the content of your message.</li>
<li><strong>Job applications.</strong> Name, email, the profile you apply for, your CV or profile link, your preferred working arrangement and what you tell us about yourself.</li>
<li><strong>Server logs.</strong> Our hosting provider records technical data such as IP address and browser type for security and operation, kept for a short period.</li>
</ul>
<p>This website sets no cookies, runs no analytics and loads no third-party trackers, fonts or embeds.</p>
<h2>Why, and on what basis</h2>
<p>We use enquiry data to answer you and prepare an offer (Art. 6(1)(b) GDPR, steps prior to a contract) and server logs to keep the site secure (Art. 6(1)(f), legitimate interest).</p>
<h2 id="candidates">Candidates</h2>
<p>We use application data to assess your application and, with your agreement, to propose you for client projects (Art. 6(1)(b) GDPR). We share your profile with a client only after you have agreed to that specific project.</p>
<p>If you tick the talent-pool box, we keep your details for up to 2 years to contact you about future projects (Art. 6(1)(a), consent). You can withdraw consent at any time; without it, we delete applications within 6 months of the end of the selection process.</p>
<h2>How long</h2>
<p>Enquiries that do not lead to cooperation are deleted within 12 months. Data relating to a contract is kept for as long as tax and accounting law requires.</p>
<h2>Who processes it</h2>
<p>The site is hosted by Vercel Inc. Data shared with our partner Damas Engineering is limited to what is needed to staff a request, and candidate data only with the candidate's agreement.</p>
<h2>Your rights</h2>
<p>You may request access, correction, deletion, restriction or portability of your data, object to processing and withdraw consent. You may also complain to the Czech Office for Personal Data Protection (<a href="https://uoou.gov.cz" rel="noopener">uoou.gov.cz</a>).</p>
</div></div></main>"""
(ROOT / "privacy.html").write_text(page("/privacy", "Privacy notice", "How Techno Software Czech s.r.o. handles personal data.", PRIVACY, f"{SITE}/assets/img/og.png"), encoding="utf-8")

NOTFOUND = f"""<main id="main" class="doc"><div class="wrap">
<p class="label label--muted" style="margin-bottom:20px">Error 404</p>
<h1>This page is<br>not in the build.</h1>
<div class="doc__body"><p>The address may have changed. Try the home page, our careers or our insights.</p>
<p style="display:flex;gap:10px;flex-wrap:wrap">{btn("/", "Back to home")}{btn("/careers", "Careers", "btn btn--ghost")}</p></div>
</div></main>"""
(ROOT / "404.html").write_text(page("/404", "Page not found", "Page not found.", NOTFOUND, f"{SITE}/assets/img/og.png"), encoding="utf-8")

# ------------------------------------------------------------------ sitemap, robots, og list
urls = ["/", "/careers", "/insights"] + [f"/insights/{p['slug']}" for p in C.POSTS] + [f"/careers/{j['slug']}" for j in C.JOBS] + ["/privacy"]
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(
    ("User-agent: *\nAllow: /\n" if INDEXABLE else "User-agent: *\nDisallow: /\n") + f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
(TOOLS / "og-pages.json").write_text(json.dumps(og_jobs, ensure_ascii=False, indent=1), encoding="utf-8")
print("built", len(urls), "urls:", " ".join(urls))
