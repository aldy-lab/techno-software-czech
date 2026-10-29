"""Write the Czech pages (/cs/…) by translating the BUILT English pages.

    python3 tools/build.py && python3 tools/i18n.py            build /cs/, fail below 100 %
    python3 tools/i18n.py --todo                                list strings cs.py still lacks

Unit of translation = a run of text with its inline tags (outermost block wins), so a
sentence containing a link or a <b> is translated whole and words can move. Icons
(<svg>…</svg>) appear in keys as <svg/>. A translation must carry exactly the tags of
its source, in any order. Plain attributes (alt, aria-label, placeholder, meta
descriptions, <title>) are units too. tools/cs.py maps English → Czech; "=" keeps
the English (brand names, addresses).
"""
import html, json, pathlib, re, sys
from html.parser import HTMLParser

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent / "site"
PAGES = {"index.html": "cs/index.html", "careers.html": "cs/careers.html", "privacy.html": "cs/privacy.html"}
EN_PATH = {"cs/index.html": "/", "cs/careers.html": "/careers", "cs/privacy.html": "/privacy"}

INLINE = {"a", "b", "strong", "em", "i", "span", "br", "small", "abbr", "code", "sup", "sub", "svg", "time", "s", "u", "input", "label", "wbr"}
VOID = {"br", "img", "input", "meta", "link", "hr", "wbr", "source", "area", "base", "col", "embed", "param", "track"}
SKIP = {"script", "style", "svg", "canvas", "noscript", "template", "head", "textarea"}
ATTRS = ("alt", "aria-label", "placeholder", "title")
SVG = re.compile(r"<svg\b.*?</svg>", re.S)
COMMENT = re.compile(r"<!--.*?-->", re.S)
TAG = re.compile(r"<[^>]+>")


class Node:
    def __init__(self, tag, attrs, start, inner):
        self.tag, self.attrs, self.start, self.inner, self.end_inner, self.end = tag, dict(attrs), start, inner, None, None
        self.kids = []


class Tree(HTMLParser):
    """Element tree with source offsets (start of tag, start/end of inner HTML)."""

    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src, self.lines = src, [0]
        for m in re.finditer("\n", src):
            self.lines.append(m.end())
        self.root = Node("#root", [], 0, 0)
        self.stack = [self.root]
        self.feed(src); self.close()
        self.root.end_inner = self.root.end = len(src)

    def off(self):
        ln, col = self.getpos()
        return self.lines[ln - 1] + col

    def handle_starttag(self, tag, attrs):
        o = self.off()
        n = Node(tag, attrs, o, o + len(self.get_starttag_text()))
        self.stack[-1].kids.append(n)
        if tag in VOID:
            n.end_inner = n.end = n.inner
        else:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        o = self.off()
        n = Node(tag, attrs, o, o + len(self.get_starttag_text()))
        n.end_inner = n.end = n.inner
        self.stack[-1].kids.append(n)

    def handle_endtag(self, tag):
        o = self.off()
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                for n in self.stack[i:]:
                    n.end_inner = o
                    n.end = self.src.index(">", o) + 1
                del self.stack[i:]
                return


def inline(n):
    return n.tag in INLINE and (n.tag == "svg" or all(inline(k) for k in n.kids))


def has_text(s):
    return bool(re.search(r"[A-Za-zÀ-ž]", html.unescape(TAG.sub("", SVG.sub("", COMMENT.sub("", s))))))


def units(src):
    """Yield (start, end) of every translatable run of text in <body> and <title>."""
    tree = Tree(src)
    out = []

    def trim(a, b):
        while True:
            s = src[a:b]
            ls = len(s) - len(s.lstrip()); a += ls; s = s.lstrip()
            rs = len(s) - len(s.rstrip()); b -= rs; s = s.rstrip()
            m = re.match(r"<!--.*?-->", s, re.S)
            if m: a += m.end(); continue
            m = re.search(r"<!--(?:(?!<!--).)*?-->$", s, re.S)
            if m: b -= len(s) - m.start(); continue
            return a, b

    def walk(n):
        if n.tag == "title":
            out.append((n.inner, n.end_inner)); return
        if n.tag in SKIP and n.tag != "head":
            return
        if n.tag == "head":
            for k in n.kids:
                if k.tag == "title": walk(k)
            return
        pos, run_start = n.inner, n.inner
        for k in n.kids + [None]:
            if k is None or not inline(k):
                stop = n.end_inner if k is None else k.start
                a, b = trim(run_start, stop)
                if b > a and has_text(src[a:b]):
                    # no loose text between the elements (a menu, a pair of buttons, a stat):
                    # each element is its own phrase
                    inside = [c for c in n.kids if a <= c.start and c.end <= b]
                    bare = src[a:b]
                    for c in reversed(inside):
                        bare = bare[:c.start - a] + bare[c.end - a:]
                    if inside and not has_text(bare):
                        for c in inside:
                            if c.tag != "svg": walk(c)
                    else:
                        out.append((a, b))
                if k is not None:
                    walk(k)
                    run_start = k.end
        return

    walk(tree.root)
    return out, tree


def key(s):
    return re.sub(r"\s+", " ", SVG.sub("<svg/>", s)).strip()


def attr_units(src):
    """(start, end) of attribute values worth translating, and meta descriptions."""
    out = []
    for m in re.finditer(r'\s(?:' + "|".join(ATTRS) + r')="([^"]*)"', src):
        if has_text(m.group(1)): out.append((m.start(1), m.end(1)))
    for m in re.finditer(r'<meta (?:name="description"|property="og:(?:title|description)") content="([^"]*)"', src):
        out.append((m.start(1), m.end(1)))
    return out


def tags(s):
    return sorted(TAG.findall(s))


def splice(src, spans, cs, missing, check):
    out, last = [], 0
    for a, b in sorted(spans):
        if a < last:
            continue  # nested in a unit already taken (outermost wins)
        k = key(src[a:b])
        t = cs.get(k)
        if t is None:
            missing.setdefault(k, None); continue
        if t == "=":
            t = k
        if check:
            if tags(t) != tags(k):
                sys.exit(f"tags differ:\n  en: {k}\n  cs: {t}")
            icons = iter(SVG.findall(src[a:b]))
            t = re.sub(r"<svg/>", lambda m: next(icons), t)
        out.append(src[last:a]); out.append(t); last = b
    out.append(src[last:])
    return "".join(out)


def translate(src, cs, missing):
    # attributes first, so the tags inside a text unit already carry their Czech labels
    src = splice(src, attr_units(src), cs, missing, False)
    return splice(src, units(src)[0], cs, missing, True)


def localise(page, en_path):
    page = page.replace('<html lang="en">', '<html lang="cs">', 1)
    # nearly every Czech word needs the latin-ext half of the font
    page = page.replace('<link rel="preload" href="/assets/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>',
                        '<link rel="preload" href="/assets/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="/assets/fonts/geist-latin-ext-wght-normal.woff2" as="font" type="font/woff2" crossorigin>', 1)
    # links to pages that exist in Czech go to the Czech page
    page = re.sub(r'href="/(careers|privacy)?([#?][^"]*)?"', lambda m: f'href="/cs/{m.group(1) or ""}{m.group(2) or ""}"', page)
    page = re.sub(r'<link rel="canonical" href="([^"]*)">', lambda m: f'<link rel="canonical" href="{m.group(1).rstrip("/").replace("technosoftware.cz", "technosoftware.cz/cs", 1)}{"/" if en_path == "/" else ""}">', page)
    page = re.sub(r'<a class="lang" href="[^"]*" hreflang="cs" lang="cs"><span class="vh">[^<]*</span>CS</a>',
                  f'<a class="lang" href="{en_path}" hreflang="en" lang="en"><span class="vh">English — </span>EN</a>', page)
    return page


def faq_ld(page, cs):
    """Translate the strings of the FAQPage JSON-LD with the same dictionary."""
    def sub(m):
        data = json.loads(m.group(1))
        if data.get("@type") != "FAQPage":
            return m.group(0)
        for q in data["mainEntity"]:
            q["name"] = html.unescape(cs[key(html.escape(q["name"], quote=True))])
            q["acceptedAnswer"]["text"] = html.unescape(cs[key(html.escape(q["acceptedAnswer"]["text"], quote=True))])
        return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'
    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', sub, page, flags=re.S)


def main():
    sys.path.insert(0, str(TOOLS))
    from cs import CS as cs
    missing = {}
    built = {}
    for en, out in PAGES.items():
        built[out] = translate((ROOT / en).read_text(encoding="utf-8"), cs, missing)
    if "--todo" in sys.argv:
        print(json.dumps(missing, ensure_ascii=False, indent=1))
        print(len(missing), "missing", file=sys.stderr); return
    if missing:
        sys.exit(f"{len(missing)} strings untranslated — run with --todo")
    for out, page in built.items():
        page = faq_ld(localise(page, EN_PATH[out]), cs)
        (ROOT / out).parent.mkdir(exist_ok=True)
        (ROOT / out).write_text(page, encoding="utf-8")
    print("cs:", ", ".join(PAGES.values()))


if __name__ == "__main__":
    main()
