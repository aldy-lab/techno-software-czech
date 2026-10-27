"""Render a 1200×630 share card for every page build.py listed in og-pages.json.

    python3 tools/og.py        (needs Playwright + Chromium)
"""
import functools, html, http.server, json, pathlib, re, socketserver, threading
from playwright.sync_api import sync_playwright

TOOLS = pathlib.Path(__file__).resolve().parent
SITE = TOOLS.parent / "site"
OUT = SITE / "assets" / "img" / "og"
OUT.mkdir(parents=True, exist_ok=True)
pages = json.loads((TOOLS / "og-pages.json").read_text())
sprite = re.search(r"<!-- CHROME:SPRITE -->.*?<!-- /CHROME:SPRITE -->", (SITE / "index.html").read_text(), re.S).group(0)

CARD = """<!doctype html><html class="js"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/main.css">
<style>body{{margin:0;width:1200px;height:630px;overflow:hidden}} .c{{position:relative;width:1200px;height:630px;background:#1530d6;color:#fff;isolation:isolate}}
.c canvas{{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;z-index:-1}}
.c::before{{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#1530d6 45%,rgba(21,48,214,.2))}}
.in{{position:absolute;inset:56px 64px;display:flex;flex-direction:column;justify-content:space-between}}
h1{{font-size:{size}px;font-weight:380;letter-spacing:-.04em;line-height:1;max-width:15ch}}
.row{{display:flex;justify-content:space-between;align-items:center}} .logo__mark{{width:44px;height:44px}} .logo__name{{font-size:1.5rem}}</style></head>
<body><div class="c"><canvas data-dither="hero" data-t="7"></canvas><div class="in">
<div class="row"><span class="logo"><svg class="logo__mark" viewBox="0 0 32 32"><use href="#mark"/></svg><span class="logo__word"><span class="logo__name">Techno Software</span><span class="logo__sub">CZECH</span></span></span>
<span class="label bracket" style="color:#c6cfff">{eyebrow}</span></div>
<h1>{title}</h1>
<div class="row"><span class="label" style="color:#c6cfff">Technical team augmentation · Prague</span><span class="label" style="color:#c6cfff">A spin-off of Damas Engineering</span></div>
</div></div>{sprite}<script src="/assets/js/main.js"></script></body></html>"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


httpd = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(SITE)))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{httpd.server_address[1]}"
with sync_playwright() as p:
    b = p.chromium.launch()
    for key, eyebrow, title in pages:
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        pg.goto(base + "/robots.txt")  # same origin, no page script already loaded
        size = 76 if len(title) < 40 else 62
        pg.set_content(CARD.format(eyebrow=html.escape(eyebrow), title=html.escape(title), size=size, sprite=sprite))
        pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
        pg.screenshot(path=str(OUT / f"{key}.png"))
        pg.close()
    b.close()
httpd.shutdown()
print(len(pages), "share cards →", OUT)
