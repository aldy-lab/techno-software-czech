# Techno Software Czech — website

Static one-page site for Techno Software Czech s.r.o. (IČO 29521513, Praha 1),
technical team augmentation, a spin-off of Damas Engineering. English at `/`, Czech at `/cs/`.

- `tools/index.src.html` — the home page source and the shared header/footer/sprite (edit this, not `site/index.html`)
- `tools/content.py` — FAQ, insights articles, careers profiles, perks and **vacancies (`JOBS`)**
- `tools/pages.py` — the six service pages, six industry pages and *How we vet engineers*
- `tools/build.py` — writes every page (home, /careers, /careers/<job>, /insights, /insights/<post>,
  privacy, 404), `sitemap.xml` and `robots.txt`, with Article / BreadcrumbList / FAQPage / JobPosting JSON-LD.
  Set `SITE` and `INDEXABLE` there.
- `tools/i18n.py` + `tools/cs.py` — writes `/cs/` (home, careers, privacy) by translating the built English
  pages; fails below 100 % coverage or when a translation's tags differ. `--todo` lists missing strings.
  The insights articles stay English (the Czech cards say "anglicky").
- `tools/og.py` — renders a 1200×630 share card per page into `site/assets/img/og/`
- `site/assets/js/main.js` — go-live CONFIG block at the top; every image on the site
  is a generated Bayer-dither drawing (no stock photos to license).
- `site/` is what Vercel serves. **Warning:** the Vercel project is linked to this GitHub repo but its
  Root Directory is NOT set, so every push to `main` makes a production deploy of the repo root —
  an empty site that answers 404 everywhere. Until someone sets Vercel → Project → Settings →
  Build and Deployment → Root Directory = `site`, always deploy from `site/` with the CLI **after**
  pushing: `cd site && npx vercel deploy --prod`. (Once it is set, deploy from the repo root instead.)

```
python3 tools/build.py && python3 tools/i18n.py && python3 tools/og.py
python3 -m http.server 8123 --directory site
# after a production deploy: tell Bing, Seznam and the other IndexNow engines
python3 tools/indexnow.py
```

## Forms → email (`site/api/form.js`)

Both forms POST to `/api/form`, a Vercel function in Frankfurt (`regions: ["fra1"]`). It stores
nothing and refuses to send until these are set in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `MAIL_PROVIDER` | `resend` (or `dry-run` to test the whole path without sending) |
| `MAIL_API_KEY` | the Resend API key |
| `MAIL_TO` | inbox for submissions — default `info@technosoftware.cz`; can be Luca's current address until that mailbox exists |
| `MAIL_FROM` | a sender on a domain verified in Resend, e.g. `Techno Software Czech <forms@technosoftware.cz>` (Resend gives DNS records to add at GoDaddy) |

Until then the page asks the endpoint, learns it is not configured, and keeps opening the visitor's
email app — and any failed send falls back to the email app with every field filled in. The CV upload
and the privacy-notice line naming the mail processor appear only once the endpoint reports itself
configured.

## Analytics (off)

`ANALYTICS` in `tools/build.py`. Blank = no script, and the privacy notice says the site runs no
analytics. Set it to `technosoftware.cz` after creating the site in Plausible (EU-hosted, cookieless,
no banner needed) and rebuild: the script goes on every page in both languages, the privacy notice
switches to the paragraph describing Plausible, and successful forms are counted as the goals
`Enquiry` and `Application`.

## Search engines

- **Google:** Search Console → add a *Domain* property `technosoftware.cz` → add the TXT record it
  shows at GoDaddy → submit `https://technosoftware.cz/sitemap.xml`.
- **Bing, Seznam, Yandex:** `python3 tools/indexnow.py` after each deploy (key file
  `site/923d9c9c41aa3959ca7a62af1245dd31.txt`). Bing Webmaster Tools can also import the site from
  Search Console.

## Easter egg

**Build a team** — the small "Build a team" button in the footer (and on the 404 page) opens a
30-second game: tap or press Space to dock each engineer module onto the tower; overhang is cut
off, perfect docks grow the block back. Score = team size, best score kept in the browser.
The end screen links to the contact form. `assets/js/game.js` loads only on first click.

## Waiting on the client

| Item | Effect until supplied |
|---|---|
| Mailbox for info@technosoftware.cz | The address is on the site and the forms send to it, but the domain has **no MX records** — mail to it bounces |
| Phone, LinkedIn → `CONFIG` in main.js | Links are removed |
| Form endpoint (or at least an email) | No way to send an enquiry from the site |
| Domain | **Done:** technosoftware.cz (GoDaddy DNS → Vercel A/CNAME records), www → 308 to the bare domain, indexing on |
| Written OK from Damas Engineering to use their logo and the "partner" wording | Logo, "spin-off" wording and figures (500 experts, 5 countries, 2012, ISO 9001) are Damas's own published claims, attributed as such |
| Confirm service promises | "shortlist within a week", "2–4 weeks to onboard", "replacement guarantee", "reply within one business day", team sizes, EN/CZ/IT languages, EUR/USD/CZK billing — written as reasonable defaults, not supplied by the client |
| Careers email or form endpoint (`CAREERS_EMAIL` / `FORM_ENDPOINT`) | Application form hidden; careers page shows the postal address instead. CV upload appears only with an endpoint |
| Real vacancies → `JOBS` in content.py | "Open positions" says none are published and points to the talent pool — no invented job ads |
| Confirm candidate promises | "reply within a week", employment *or* IČO contract, perks wording, talent-pool retention of 2 years / 6 months (also in the privacy notice) |
| Review the three insights articles | Written as general information with "not legal advice" notes; the DORA and Czech-contract pieces should be read by someone at the client before launch |
| Confirm *How we vet engineers* | The six steps (role profile, recruiter screen, 60–90 min technical interview by an engineer in the same stack, references, client interview, check-ins) are our description of good practice, not yet confirmed by the client |
| Native review of the Czech version (`tools/cs.py`) | Translated by us; trade terms are kept in English where Czech IT uses them (team augmentation, stack, shortlist) |
