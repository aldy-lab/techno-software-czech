"""Generate sub-pages from index.html's chrome, and the sitemap.

    python3 tools/build.py

index.html is the source of truth for header, footer and SVG sprite.
SITE is the public origin; change it once the domain is live.
"""
import pathlib, re

SITE = "https://techno-software-czech.vercel.app"
INDEXABLE = False  # flip to True when the real domain is connected

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
src = (ROOT.parent / "tools" / "index.src.html").read_text(encoding="utf-8")


def block(name):
    m = re.search(rf"<!-- CHROME:{name} -->.*?<!-- /CHROME:{name} -->", src, re.S)
    return m.group(0)


def finish(html):
    html = html.replace("{{SITE}}", SITE)
    if INDEXABLE:
        html = html.replace('<meta name="robots" content="noindex">\n', "")
    return html


HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} — Techno Software Czech</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{{{{SITE}}}}{path}">
<meta name="theme-color" content="#1530d6">
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/main.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-solid">
<a class="skip" href="#main">Skip to content</a>
"""

PRIVACY = """<main id="main" class="doc"><div class="wrap">
<p class="label label--muted" style="margin-bottom:20px">Last updated 24 October 2026</p>
<h1>Privacy notice</h1>
<div class="doc__body">
<p>This notice explains how Techno Software Czech s.r.o. handles personal data collected through this website, under the EU General Data Protection Regulation (GDPR) and Czech Act No. 110/2019 Coll.</p>
<h2>Controller</h2>
<p>Techno Software Czech s.r.o., Školská 1736/12, 110 00 Praha 1 – Nové Město, Czech Republic. IČO 29521513, registered with the Municipal Court in Prague, file C 447880.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Contact requests.</strong> When you write to us, we receive your name, company, email address and the content of your message.</li>
<li><strong>Server logs.</strong> Our hosting provider records technical data such as IP address and browser type for security and operation, kept for a short period.</li>
</ul>
<p>This website sets no cookies, runs no analytics and loads no third-party trackers, fonts or embeds.</p>
<h2>Why, and on what basis</h2>
<p>We use contact data to answer your enquiry and prepare an offer (Art. 6(1)(b) GDPR, steps prior to a contract) and server logs to keep the site secure (Art. 6(1)(f), legitimate interest).</p>
<h2>How long</h2>
<p>Enquiries that do not lead to cooperation are deleted within 12 months. Data relating to a contract is kept for as long as tax and accounting law requires.</p>
<h2>Who processes it</h2>
<p>The site is hosted by Vercel Inc. Data shared with our partner Damas Engineering is limited to what is needed to staff your request, and only with your agreement.</p>
<h2>Your rights</h2>
<p>You may request access, correction, deletion, restriction or portability of your data, and object to processing. You may also complain to the Czech Office for Personal Data Protection (<a href="https://uoou.gov.cz" rel="noopener">uoou.gov.cz</a>).</p>
</div></div></main>
"""

NOTFOUND = """<main id="main" class="doc"><div class="wrap">
<p class="label label--muted" style="margin-bottom:20px">Error 404</p>
<h1>This page is<br>not in the build.</h1>
<div class="doc__body"><p>The address may have changed. Everything we do is on the home page.</p>
<p><a class="btn" href="/">Back to home <span class="btn__icon"><svg viewBox="0 0 16 16"><use href="#arrow"/></svg></span></a></p></div>
</div></main>
"""

PAGES = [
    ("privacy.html", "/privacy", "Privacy notice", "How Techno Software Czech s.r.o. handles personal data.", PRIVACY),
    ("404.html", "/404", "Page not found", "Page not found.", NOTFOUND),
]

tail = "\n".join([block("FOOTER"), block("SPRITE"), '<script src="/assets/js/main.js" defer></script>\n</body>\n</html>\n'])
for fname, path, title, desc, body in PAGES:
    html = HEAD.format(title=title, desc=desc, path=path) + block("HEADER") + "\n" + body + tail
    (ROOT / fname).write_text(finish(html), encoding="utf-8")

(ROOT / "index.html").write_text(finish(src), encoding="utf-8")

urls = ["/", "/privacy"]
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(
    ("User-agent: *\nAllow: /\n" if INDEXABLE else "User-agent: *\nDisallow: /\n") + f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("built", [p[0] for p in PAGES], "+ index.html, sitemap.xml, robots.txt")
