"""Site content that build.py turns into pages: FAQ, insights, talent-pool profiles, vacancies.

Add a real vacancy to JOBS and rebuild — it gets its own page under /careers/<slug>
with JobPosting structured data for Google for Jobs. While JOBS is empty the careers
page says so plainly and points to the talent pool; nothing is invented.
"""

FAQ = [
    ("How quickly can an engineer start?",
     "Usually two to four weeks from the first call. A shortlist normally follows within a week; the rest depends on the seniority you need and the candidate's notice period."),
    ("Who owns the code and intellectual property?",
     "You do. Our contracts assign the intellectual property created for you to your company, and every engineer we place is bound by confidentiality before they see your code."),
    ("What happens if an engineer is not the right fit?",
     "Tell us, and we replace them. We check in with you and the engineer regularly so that a poor fit is caught in weeks, not quarters."),
    ("Do your engineers work remotely or on-site?",
     "Both. Engineers work remotely, hybrid or on-site — in Prague or at your premises — as agreed for each engagement."),
    ("How does billing work?",
     "Monthly, in EUR, USD or CZK, based on approved time sheets. One invoice covers the whole team, whatever its size."),
    ("Do you work with companies outside the Czech Republic?",
     "Yes. We work with clients across the EU and beyond, in the CET time zone, under contracts governed by Czech law unless agreed otherwise."),
    ("How do you handle data protection and security?",
     "We process personal data under GDPR, sign your NDA and security policies, and give engineers only the access their work requires. Access is removed on the day an engagement ends."),
    ("What is your relationship with Damas Engineering?",
     "Techno Software Czech is a partner of Damas Engineering. You contract with us in Prague; through the partnership we can search a much larger network when a role is rare or a team must grow quickly."),
]

# ------------------------------------------------------------------ insights
# scene = which generated dither image heads the article (see assets/js/main.js SCENES)
POSTS = [
    {
        "slug": "team-augmentation-vs-outsourcing-vs-hiring",
        "title": "Team augmentation, outsourcing or a new hire: how to choose",
        "desc": "Three ways to add engineering capacity, what each is good at, and the way each one fails.",
        "lead": "Every engineering leader eventually has more roadmap than people. There are three ways to close the gap — and they fail in different ways.",
        "date": "2026-10-24", "minutes": 5, "scene": "manufacturing", "tag": "Engagement",
        "body": """
<h2 id="hire">Hiring permanently</h2>
<p>A permanent hire is the right answer for work that is core to your product and will exist for years: the people who own your architecture, your domain logic and your engineering culture.</p>
<p>Its weakness is time. Sourcing, interviews and offers take weeks; in the Czech Republic the statutory notice period is at least two months, so a good candidate who accepts today often starts a quarter from now. And if the role turns out to be temporary, scaling back is slow and expensive.</p>

<h2 id="outsource">Outsourcing a project</h2>
<p>Outsourcing hands a defined scope to a vendor who delivers it with their own team and process. It works best when the work is separable from your product — a migration, an integration, an internal tool — and can be specified well up front.</p>
<p>It fails when the scope moves. Every change becomes a change request, and when the project ends, the knowledge leaves with the vendor's team.</p>

<h2 id="augment">Team augmentation</h2>
<p>With augmentation, engineers join your team. They work in your repositories, attend your stand-ups and report to your leads; the provider recruits, vets, contracts and pays them, and stays accountable for how they perform.</p>
<p>It is the right fit when you already have engineering leadership and a working process, but lack capacity or a specific skill. Its cost is your attention: augmented engineers need onboarding and direction like any team member.</p>

<h2 id="compare">Side by side</h2>
<div class="tablewrap"><table>
<tr><th></th><th>Hire</th><th>Outsource</th><th>Augment</th></tr>
<tr><td><strong>Who leads the work</strong></td><td>You</td><td>Vendor</td><td>You</td></tr>
<tr><td><strong>Time to start</strong></td><td>Months</td><td>Weeks</td><td>Weeks</td></tr>
<tr><td><strong>Handles changing scope</strong></td><td>Well</td><td>Poorly</td><td>Well</td></tr>
<tr><td><strong>Knowledge stays</strong></td><td>Yes</td><td>Mostly no</td><td>In your repos and docs</td></tr>
<tr><td><strong>Scaling down</strong></td><td>Hard</td><td>At contract end</td><td>Month by month</td></tr>
</table></div>

<h2 id="choose">Choose augmentation when</h2>
<ul>
<li>your roadmap is clear but your team is too small to deliver it on time;</li>
<li>you need a skill for months, not years — AUTOSAR, a payment scheme, a cloud migration;</li>
<li>you want to test a role before committing to a permanent headcount;</li>
<li>you have leads who can direct the work, and want to keep the code and knowledge in-house.</li>
</ul>
<p>Most teams end up combining all three: permanent hires for the core, augmentation for capacity and rare skills, and outsourcing for work that can genuinely be handed over.</p>
""",
    },
    {
        "slug": "employment-or-contractor-czech-republic",
        "title": "Engaging engineers in the Czech Republic: employment or contractor?",
        "desc": "The two common ways to engage engineers in Czechia, what each costs and requires, and the line you must not cross.",
        "lead": "Foreign companies building teams in Prague meet two arrangements early: the employment contract and the contractor on a trade licence. Both are legal. Mixing them up is not.",
        "date": "2026-10-24", "minutes": 6, "scene": "globe", "tag": "Czech Republic",
        "body": """
<h2 id="employment">The employment contract</h2>
<p>A standard employment contract (<em>pracovní smlouva</em>) is governed by the Labour Code. It gives the engineer the full protection of Czech employment law: paid holiday, sick pay and a notice period of at least two months on either side.</p>
<p>On top of the gross salary, the employer pays social security and health insurance contributions — roughly a third of the gross amount. Budget for the total cost, not the salary.</p>

<h2 id="contractor">The contractor on a trade licence</h2>
<p>Many Czech engineers work as self-employed contractors with a trade licence (<em>živnostenský list</em>) and invoice under their company identification number, the IČO. For clients this means monthly invoices, no payroll and flexible terms.</p>
<p>It suits genuinely independent work: a defined result, the contractor's own tools and schedule, and freedom to work for other clients.</p>

<h2 id="line">The line you must not cross</h2>
<p>Czech law defines <strong>dependent work</strong> — work performed personally, under the employer's instructions, in a relationship of superiority and subordination. Dependent work may only be performed in an employment relationship.</p>
<p>Running what is in substance employment through a trade licence is known as <em>švarcsystém</em>. It is treated as illegal work, and both the company and the individual face significant fines, plus back-payment of contributions. The label on the contract does not decide it; the way the work is actually done does.</p>

<h2 id="where-we-fit">Where team augmentation fits</h2>
<p>In an augmentation engagement the engineer contracts with the provider, and the provider contracts with you. The provider is responsible for choosing the right legal form for each person and for keeping it consistent with how the work is really organised — which is why it pays to discuss working arrangements before the first day, not after.</p>

<h2 id="checklist">A checklist for any engineering contract</h2>
<ul>
<li><strong>Intellectual property:</strong> an explicit assignment of work results to your company.</li>
<li><strong>Confidentiality:</strong> an NDA signed before access to code or data.</li>
<li><strong>Notice and termination:</strong> how quickly either side can end the engagement.</li>
<li><strong>Place and mode of work:</strong> remote, hybrid or on-site, written down.</li>
<li><strong>Access and equipment:</strong> who provides laptops and accounts, and how they are returned.</li>
<li><strong>Data protection:</strong> GDPR roles and a data processing agreement where personal data is involved.</li>
</ul>
<p class="note">This article is general information, not legal advice. Have a Czech employment lawyer review your specific arrangements.</p>
""",
    },
    {
        "slug": "dora-external-engineers-fintech",
        "title": "DORA and external engineers: what fintech teams need in place",
        "desc": "How the EU Digital Operational Resilience Act affects banks and fintechs that bring in external engineers, and what to prepare.",
        "lead": "Since January 2025, EU financial entities must manage the risk of every ICT third party they rely on. If you bring external engineers into your systems, that probably includes them.",
        "date": "2026-10-24", "minutes": 6, "scene": "fintech", "tag": "Fintech",
        "body": """
<h2 id="what">What DORA is</h2>
<p>The Digital Operational Resilience Act — Regulation (EU) 2022/2554 — has applied since 17 January 2025. It sets one standard for how banks, payment and e-money institutions, investment firms, insurers, crypto-asset service providers and other financial entities manage ICT risk.</p>
<p>One of its pillars is <strong>ICT third-party risk</strong>: a financial entity remains fully responsible for its obligations even when it relies on outside providers, and must manage those providers accordingly.</p>

<h2 id="engineers">Does it cover augmented engineers?</h2>
<p>That depends on what the engineers do and how the arrangement is set up. External engineers who build, run or have access to ICT systems are often treated as part of an ICT service, and many institutions take the conservative view and bring such arrangements into their DORA processes. Your compliance team should make the call; your engineering team should be ready for it.</p>

<h2 id="contracts">What the contract needs</h2>
<p>For ICT services, DORA requires specific contractual provisions. Expect your compliance team to ask for:</p>
<ul>
<li>a clear description of the services and of the locations where they are performed and where data is processed;</li>
<li>provisions on availability, integrity, security and confidentiality of data;</li>
<li>cooperation with the institution and its supervisors, including access, inspection and audit rights;</li>
<li>termination rights and an exit strategy, so work can move back in-house or to another provider;</li>
<li>support during ICT incidents.</li>
</ul>
<p>Financial entities must also keep a <strong>register of information</strong> covering all contractual arrangements for ICT services — so the arrangement has to be documented in a form that can be entered there.</p>

<h2 id="practice">What to have ready in practice</h2>
<ul>
<li><strong>Access by least privilege</strong> — engineers get the systems their work needs, through your identity provider, and nothing else.</li>
<li><strong>Same-day offboarding</strong> — accounts, keys and devices are revoked when an engagement ends.</li>
<li><strong>Knowledge kept in your systems</strong> — code, documentation and decisions live in your repositories, so exit is possible without disruption.</li>
<li><strong>Named locations</strong> — where each engineer works from is known and written into the contract.</li>
<li><strong>Incident duties</strong> — external engineers know how to report an incident inside your process.</li>
</ul>
<p>Getting these right from the first engagement is far cheaper than retrofitting them during an audit.</p>
<p class="note">This article is general information, not legal or regulatory advice. Your compliance function and supervisor guidance determine how DORA applies to your institution.</p>
""",
    },
]

# ------------------------------------------------------------------ careers
# Profiles we always hire for — a standing talent pool, not individual vacancies.
ROLES = [
    ("Back-end engineer", "Medior – Senior", "Services and APIs for payments, core systems and industrial platforms.", ["Java / Spring", ".NET", "Go", "Kafka"]),
    ("Embedded & automotive engineer", "Senior – Lead", "ECU software, diagnostics and test benches for OEMs and Tier-1 suppliers.", ["C / C++", "AUTOSAR", "ISO 26262", "HIL"]),
    ("QA & test automation engineer", "Medior – Senior", "Test strategy and automated suites wired into CI for every merge.", ["Playwright", "Selenium", "API testing", "Load testing"]),
    ("DevOps / platform engineer", "Senior", "Pipelines, infrastructure as code and observability for production systems.", ["Kubernetes", "Terraform", "AWS / Azure", "GitOps"]),
    ("Front-end & mobile engineer", "Medior – Senior", "Customer portals and apps built on maintainable architecture.", ["React", "Angular", "Kotlin", "Swift"]),
    ("Data engineer", "Senior", "Reliable pipelines from scattered sources to trusted dashboards.", ["Python", "Spark", "SQL", "dbt"]),
]

# Real, published vacancies only. Example shape (all keys except salary required):
# {"slug": "senior-java-engineer-fintech", "title": "Senior Java Engineer (fintech)",
#  "location": "Prague / hybrid", "type": "FULL_TIME", "remote": False,
#  "date": "2026-11-01", "valid_through": "2026-12-31",
#  "salary": {"min": 0, "max": 0, "currency": "CZK", "unit": "MONTH"},   # or None
#  "summary": "...", "body": "<h2>What you will do</h2><ul><li>...</li></ul>"}
JOBS = []

PERKS = [
    ("Projects matched to you", "We agree the stack, domain and work mode with you first. You are never put forward for an interview you did not agree to."),
    ("Terms in writing, upfront", "Rate or salary, project length and notice period are agreed before you start — no surprises after the first invoice."),
    ("Employment or contract", "Work as an employee or, where the project genuinely allows it, as a contractor on your own trade licence."),
    ("Someone in your corner", "A named contact checks in regularly, handles feedback with the client and lines up your next project."),
]

CANDIDATE_STEPS = [
    ("Apply", "Send your CV or LinkedIn and tell us what you want to work on next.", "5 minutes"),
    ("Intro call", "A short call about your experience, your preferences and your availability.", "30 minutes"),
    ("Technical interview", "A conversation with an engineer in your stack — no trick puzzles.", "60 – 90 minutes"),
    ("Client match", "We propose you only for projects you agreed to, and you meet the client team.", "When it fits"),
]
