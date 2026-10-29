"""Tell Bing, Seznam, Yandex and the other IndexNow engines that pages changed.

    python3 tools/indexnow.py            every URL in site/sitemap.xml
    python3 tools/indexnow.py /cs /careers

Run after a deploy. The key is the 32-hex file at the site root (site/<key>.txt);
the engines fetch it to prove the request comes from the site's owner.
Google does not take part — use Search Console for Google.
"""
import json, pathlib, re, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
HOST = "technosoftware.cz"
key = next(p.stem for p in ROOT.glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", p.stem))
urls = [f"https://{HOST}{u}" for u in sys.argv[1:]] or re.findall(r"<loc>(.*?)</loc>", (ROOT / "sitemap.xml").read_text())
body = json.dumps({"host": HOST, "key": key, "keyLocation": f"https://{HOST}/{key}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", body, {"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, len(urls), "urls submitted")
