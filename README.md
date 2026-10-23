# Techno Software Czech — website

Static one-page site for Techno Software Czech s.r.o. (IČO 29521513, Praha 1),
technical team augmentation, partner of Damas Engineering.

- `tools/index.src.html` — the home page source (edit this, not `site/index.html`)
- `tools/build.py` — writes `site/index.html`, `privacy.html`, `404.html`, `sitemap.xml`, `robots.txt`
  from the source's header/footer/sprite. Set `SITE` and `INDEXABLE` there.
- `site/assets/js/main.js` — go-live CONFIG block at the top; every image on the site
  is a generated Bayer-dither drawing (no stock photos to license).
- `site/` is what Vercel serves (Root Directory = `site`).

```
python3 tools/build.py
python3 -m http.server 8123 --directory site
```

## Waiting on the client

| Item | Effect until supplied |
|---|---|
| Email, phone, LinkedIn → `CONFIG` in main.js | Links are removed; the contact form is hidden and a location map shows instead |
| Form endpoint (or at least an email) | No way to send an enquiry from the site |
| Domain | `SITE` points at the vercel.app URL; `INDEXABLE = False` (noindex + robots Disallow) |
| Written OK from Damas Engineering to use their logo and the "partner" wording | Logo and figures (1,200+ experts, 7 countries, 2012, ISO 9001) are Damas's own published claims, attributed as such |
| Confirm service promises | "shortlist within a week", "2–4 weeks to onboard", "replacement guarantee", "reply within one business day", team sizes, EN/CZ/IT languages, EUR/CZK billing — written as reasonable defaults, not supplied by the client |
| Czech version | English only for now |
