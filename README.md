# Techno Software Czech — website

Static one-page site for Techno Software Czech s.r.o. (IČO 29521513, Praha 1),
technical team augmentation, partner of Damas Engineering.

- `tools/index.src.html` — the home page source and the shared header/footer/sprite (edit this, not `site/index.html`)
- `tools/content.py` — FAQ, insights articles, careers profiles, perks and **vacancies (`JOBS`)**
- `tools/build.py` — writes every page (home, /careers, /careers/<job>, /insights, /insights/<post>,
  privacy, 404), `sitemap.xml` and `robots.txt`, with Article / BreadcrumbList / FAQPage / JobPosting JSON-LD.
  Set `SITE` and `INDEXABLE` there.
- `tools/og.py` — renders a 1200×630 share card per page into `site/assets/img/og/`
- `site/assets/js/main.js` — go-live CONFIG block at the top; every image on the site
  is a generated Bayer-dither drawing (no stock photos to license).
- `site/` is what Vercel serves (Root Directory = `site`).

```
python3 tools/build.py && python3 tools/og.py
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
| Careers email or form endpoint (`CAREERS_EMAIL` / `FORM_ENDPOINT`) | Application form hidden; careers page shows the postal address instead. CV upload appears only with an endpoint |
| Real vacancies → `JOBS` in content.py | "Open positions" says none are published and points to the talent pool — no invented job ads |
| Confirm candidate promises | "reply within a week", employment *or* IČO contract, perks wording, talent-pool retention of 2 years / 6 months (also in the privacy notice) |
| Review the three insights articles | Written as general information with "not legal advice" notes; the DORA and Czech-contract pieces should be read by someone at the client before launch |
| Czech version | English only for now |
