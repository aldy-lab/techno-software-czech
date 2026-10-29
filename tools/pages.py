"""Service pages (/services/<slug>), industry pages (/industries/<slug>) and the
vetting page (/how-we-vet). Bodies are HTML; every <h2 id> becomes an entry in the
"On this page" list. Promises here must match the home page and the FAQ — the client
has not confirmed them yet (see README, "Waiting on the client")."""

SERVICES = [
    {
        "slug": "team-augmentation", "stats": [('1 week', 'To a shortlist'), ('2 – 4 weeks', 'To the first sprint'), ('Monthly', 'Add or release people')], "scene": "augment", "n": "01",
        "name": "Team augmentation",
        "title": "Team augmentation: senior engineers inside your team",
        "desc": "Senior software, embedded, QA and DevOps engineers who join your existing team in weeks. Prague-based team augmentation, monthly flexibility, replacement guarantee.",
        "lead": "Individual engineers who join your squads, use your tools and follow your ceremonies — productive from the first sprint, and released month by month when the peak is over.",
        "tags": ["Shortlist within a week", "2 – 4 weeks to start", "Replacement guarantee", "Monthly terms"],
        "industries": ["fintech", "automotive", "manufacturing"],
        "body": """
<h2 id="what">What it is</h2>
<p>Team augmentation adds people, not a project. You keep the roadmap, the backlog and the code ownership; we supply engineers who work as part of your team — in your repositories, your stand-ups and your sprint planning — and stand behind them contractually.</p>
<p>It is the fastest way to close a skill gap or absorb a delivery peak without opening a permanent headcount or handing the work to an outside vendor.</p>
<h2 id="when">When it fits</h2>
<ul>
<li><strong>A skill you do not have in-house</strong> — AUTOSAR, a payments scheme, Kubernetes at scale — needed for months, not forever.</li>
<li><strong>A deadline that outgrew the team</strong>: a release, a migration, a regulatory date.</li>
<li><strong>A hiring freeze</strong> while the work keeps coming.</li>
<li><strong>Cover</strong> for parental leave, a long notice period or a key person moving on.</li>
</ul>
<h2 id="how">How it works</h2>
<p>A call with your engineering lead gives us the stack, the seniority and the way the team works. We search our own bench and the Damas Engineering network, screen candidates technically and send a shortlist — normally within a week. You interview and decide. We handle the contract, equipment and access, and the engineer joins your next sprint planning — usually two to four weeks after the first call.</p>
<p>After that we stay involved: regular check-ins with you and the engineer, feedback in both directions, and a replacement if the fit is not right.</p>
<h2 id="terms">Terms</h2>
<ul>
<li>One monthly invoice for the whole team, in EUR, USD or CZK, based on approved time sheets.</li>
<li>Add or release people month by month.</li>
<li>Intellectual property created for you is assigned to your company; every engineer signs confidentiality before seeing your code.</li>
<li>Contracts under Czech law unless agreed otherwise.</li>
</ul>
""",
    },
    {
        "slug": "dedicated-teams", "stats": [('4 – 20', 'People per team'), ('1', 'Accountable lead'), ('Monthly', 'Scale up or down')], "scene": "team", "n": "02",
        "name": "Dedicated teams",
        "title": "Dedicated development teams, assembled around your product",
        "desc": "A complete cross-functional team — engineers, QA, tech lead and delivery manager — working only on your product. Built in Prague with the Damas Engineering network.",
        "lead": "A complete, cross-functional team with its own tech lead, aligned to your product goals and working only for you — without the months it takes to hire one.",
        "tags": ["Tech lead included", "Shared roadmap", "Velocity reporting", "4 – 20 people"],
        "industries": ["fintech", "healthcare", "energy"],
        "body": """
<h2 id="what">What it is</h2>
<p>A dedicated team is a self-organising unit — engineers, QA, a tech lead and, where it helps, a delivery manager — that works exclusively on your product. You set the priorities; the team owns how the work gets done and reports progress in a form you choose.</p>
<h2 id="when">When it fits</h2>
<ul>
<li><strong>A new product or platform</strong> that needs a team now, not after a year of hiring.</li>
<li><strong>A scale-up</strong> whose roadmap is growing faster than its recruiting.</li>
<li><strong>A separate stream of work</strong> — a migration, a new market, a rebuild — that should not slow the core team down.</li>
</ul>
<h2 id="team">How the team is built</h2>
<p>We start with the outcome you need and work back to the roles. The tech lead is chosen first and takes part in selecting the rest of the team, so the people who will work together are picked together. You interview the key roles and approve every member.</p>
<p>The team grows in steps — usually from a core of three or four people — and can be scaled up or down month by month as the roadmap changes.</p>
<h2 id="visibility">What you see</h2>
<ul>
<li>A shared roadmap and backlog in your tools.</li>
<li>Sprint reviews and velocity reporting.</li>
<li>One accountable contact on our side for the team as a whole.</li>
<li>One monthly invoice, whatever the size of the team.</li>
</ul>
""",
    },
    {
        "slug": "web-mobile-development", "stats": [('Web', 'React · Angular'), ('Mobile', 'Kotlin · Swift · Flutter'), ('Back-end', 'Java · .NET · Node')], "scene": "web", "n": "03",
        "name": "Web & mobile development",
        "title": "Web and mobile development engineers",
        "desc": "Front-end, back-end and mobile engineers for customer portals, internal platforms and native or cross-platform apps — React, Angular, Kotlin, Swift, Flutter, Java, .NET, Node.",
        "lead": "Customer portals, internal platforms and native or cross-platform apps — built on maintainable architecture and handed over with documentation your team can own.",
        "tags": ["React · Angular", "Kotlin · Swift · Flutter", "Java · .NET · Node"],
        "industries": ["fintech", "healthcare", "energy"],
        "body": """
<h2 id="what">What we staff</h2>
<ul>
<li><strong>Front-end engineers</strong> — React, Angular and TypeScript, design systems, accessibility and performance.</li>
<li><strong>Back-end engineers</strong> — Java and Spring, .NET, Node and Python services and APIs.</li>
<li><strong>Mobile engineers</strong> — native Kotlin and Swift, or Flutter where one codebase makes sense.</li>
<li><strong>Full-stack engineers</strong> for smaller teams that need people who can carry a feature end to end.</li>
</ul>
<h2 id="how">How we work</h2>
<p>Engineers join your team and your conventions. Where there are none yet — a new product, a rebuild — they bring sensible defaults: code review, automated tests, CI from the first commit and architecture decisions written down where the next person will find them.</p>
<h2 id="handover">Built to be handed over</h2>
<p>The point of external engineers is that the work outlives the engagement. Code, documentation and infrastructure stay in your accounts; when the engagement ends, your team can run and extend what was built without us.</p>
""",
    },
    {
        "slug": "embedded-automotive-software", "stats": [('AUTOSAR', 'Classic and adaptive'), ('ISO 26262', 'Functional safety'), ('HIL / SIL', 'Test benches')], "scene": "embedded", "n": "04",
        "name": "Embedded & automotive software",
        "title": "Embedded and automotive software engineers",
        "desc": "Embedded C/C++, AUTOSAR, diagnostics and HIL/SIL test engineers for OEMs and Tier-1 suppliers — people who know ISO 26262, ASPICE and automotive toolchains.",
        "lead": "Engineers for ECU software, in-vehicle infotainment, diagnostics and test benches — people already at home with automotive process, toolchains and functional safety.",
        "tags": ["C / C++", "AUTOSAR", "ISO 26262 · ASPICE", "HIL / SIL testing"],
        "industries": ["automotive", "manufacturing", "energy"],
        "body": """
<h2 id="what">What we staff</h2>
<ul>
<li><strong>Embedded software engineers</strong> — C and C++ on microcontrollers and embedded Linux, classic and adaptive AUTOSAR.</li>
<li><strong>Diagnostics and communication</strong> — UDS, CAN, LIN and automotive Ethernet.</li>
<li><strong>Test engineers</strong> — HIL and SIL benches, test automation and requirements-based testing.</li>
<li><strong>Infotainment and connected-car</strong> engineers, from the head unit to the backend behind the fleet.</li>
</ul>
<h2 id="process">Process is part of the job</h2>
<p>Automotive software is written inside a process: ASPICE levels, ISO 26262 safety goals, traceability from requirement to test. We look for engineers who have worked that way before, so they do not need to be taught why the paperwork exists — and we say so plainly when a candidate's experience is in a neighbouring field.</p>
<h2 id="where">Where they work</h2>
<p>Much of this work depends on hardware, benches and vehicles. Engineers can work on-site at your premises, hybrid or remotely where the setup allows it — agreed for each engagement.</p>
""",
    },
    {
        "slug": "qa-test-automation", "stats": [('Every merge', 'Quality measured in CI'), ('API · load', 'Beyond the UI'), ('Traceable', 'Evidence for audits')], "scene": "qa", "n": "05",
        "name": "QA & test automation",
        "title": "QA and test automation engineers",
        "desc": "Manual and automated testing that fits your release rhythm: test strategy, Playwright and Selenium suites, API and load testing, quality gates in CI.",
        "lead": "Testing that fits your release rhythm — test strategy, regression suites, performance and API testing, wired into CI so quality is measured on every merge.",
        "tags": ["Playwright · Selenium", "API & load testing", "CI quality gates"],
        "industries": ["fintech", "healthcare", "telecom-cybersecurity"],
        "body": """
<h2 id="what">What we staff</h2>
<ul>
<li><strong>Test automation engineers</strong> — Playwright, Selenium, Cypress, and API test suites in the language your developers use.</li>
<li><strong>Performance engineers</strong> — load and stress testing, and the profiling that follows a bad result.</li>
<li><strong>QA analysts</strong> — test strategy, exploratory and acceptance testing, and test design for regulated releases.</li>
</ul>
<h2 id="approach">Measured on every merge</h2>
<p>Automated tests are only useful if they run on every change and people trust the result. Our engineers wire suites into your CI, keep them fast and stable, and treat a flaky test as a defect — so a red build means something.</p>
<h2 id="regulated">Regulated releases</h2>
<p>In banking, healthcare and automotive the evidence matters as much as the test. We staff people used to traceable test plans and reports that an auditor or a validation team can follow.</p>
""",
    },
    {
        "slug": "devops-cloud-data", "stats": [('IaC', 'Terraform · GitOps'), ('3 clouds', 'AWS · Azure · GCP'), ('Same day', 'Access removed at the end')], "scene": "devops", "n": "06",
        "name": "DevOps, cloud & data",
        "title": "DevOps, cloud and data engineers",
        "desc": "DevOps, SRE, platform and data engineers: Kubernetes, Terraform, AWS, Azure and GCP, observability, cost control, Kafka and Spark pipelines.",
        "lead": "Pipelines, infrastructure as code, observability and cost control — plus data engineers who turn scattered sources into reliable pipelines and dashboards.",
        "tags": ["Kubernetes", "Terraform", "AWS · Azure · GCP", "Kafka · Spark"],
        "industries": ["fintech", "energy", "telecom-cybersecurity"],
        "body": """
<h2 id="what">What we staff</h2>
<ul>
<li><strong>DevOps and platform engineers</strong> — CI/CD, Kubernetes, GitOps and infrastructure as code with Terraform.</li>
<li><strong>Site reliability engineers</strong> — observability, incident response and the reliability work that keeps on-call quiet.</li>
<li><strong>Cloud engineers</strong> — AWS, Azure and GCP architecture, security baselines and cost control.</li>
<li><strong>Data engineers</strong> — Kafka, Spark, SQL and dbt pipelines from scattered sources to dashboards people trust.</li>
</ul>
<h2 id="access">Access is part of the plan</h2>
<p>Platform engineers need privileged access, which makes access management part of the engagement rather than an afterthought. Engineers get only the rights their work requires, under your policies, and access is removed on the day an engagement ends.</p>
<h2 id="handover">Everything as code, in your accounts</h2>
<p>Infrastructure, pipelines and dashboards are built as code in your repositories and your cloud accounts — never in ours — so nothing depends on us once the work is done.</p>
""",
    },
]

INDUSTRIES = [
    {
        "slug": "fintech", "stats": [('PSD2', 'Open banking'), ('DORA', 'ICT third-party rules'), ('Audit', 'Evidence by default')], "scene": "fintech", "n": "01",
        "name": "Fintech & banking",
        "title": "Engineers for fintech and banking",
        "desc": "Software, QA and DevOps engineers for payment platforms, core-banking integrations and trading systems — people who know PSD2, DORA and audit-grade delivery.",
        "lead": "Payment platforms, core-banking integrations and trading systems — where correctness and audit trails are non-negotiable.",
        "tags": ["PSD2", "Payments", "Core banking", "DORA"],
        "services": ["team-augmentation", "qa-test-automation", "devops-cloud-data"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>Payment processing, card and instant-payment schemes, and the integrations around them.</li>
<li>Core-banking integrations and migrations.</li>
<li>Open-banking APIs under PSD2.</li>
<li>Trading, risk and reporting systems.</li>
</ul>
<h2 id="people">The people</h2>
<p>Back-end engineers used to transactional systems, idempotency and reconciliation; QA engineers who write test evidence an auditor can follow; DevOps engineers who know what a change-management process in a bank looks like.</p>
<h2 id="dora">Regulation and external engineers</h2>
<p>Since January 2025 the EU Digital Operational Resilience Act (DORA) sets rules for how banks and fintechs manage ICT third parties — including external engineers. We sign your security policies and NDA, work within your access controls and support the documentation your register of information needs.</p>
<p><a href="/insights/dora-external-engineers-fintech">Read more: DORA and external engineers</a></p>
""",
    },
    {
        "slug": "automotive", "stats": [('ASPICE', 'Process experience'), ('ISO 26262', 'Functional safety'), ('CET', 'Close to the plants')], "scene": "automotive", "n": "02",
        "name": "Automotive & mobility",
        "title": "Engineers for automotive and mobility",
        "desc": "Embedded, AUTOSAR, ADAS, infotainment and test engineers for OEMs and Tier-1 suppliers — from ECU code to the cloud behind the fleet.",
        "lead": "Embedded and connected-car software for OEMs and Tier-1 suppliers — from ECU code to the cloud behind the fleet.",
        "tags": ["AUTOSAR", "ADAS", "Infotainment", "V2X"],
        "services": ["embedded-automotive-software", "qa-test-automation", "team-augmentation"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>ECU software on classic and adaptive AUTOSAR.</li>
<li>ADAS functions and the testing around them.</li>
<li>Infotainment, connectivity and over-the-air updates.</li>
<li>Diagnostics, end-of-line and test-bench software.</li>
<li>Fleet and mobility backends.</li>
</ul>
<h2 id="people">The people</h2>
<p>Engineers who have worked inside ASPICE processes and with ISO 26262 safety requirements, who know the toolchains, and who can work at your benches and in your vehicles when the job needs it.</p>
<h2 id="region">Close to the industry</h2>
<p>Czechia is one of Europe's densest automotive regions. Engineers in the CET time zone, a short trip from plants and development centres across Central Europe, can be on-site when the hardware is.</p>
""",
    },
    {
        "slug": "manufacturing", "stats": [('OPC UA', 'Machine connectivity'), ('MES · ERP', 'Integrations'), ('On-site', 'At the line when needed')], "scene": "manufacturing", "n": "03",
        "name": "Manufacturing & Industry 4.0",
        "title": "Engineers for manufacturing and Industry 4.0",
        "desc": "Software engineers for MES integrations, IoT telemetry, OPC UA and the internal tools that keep production lines measured and moving.",
        "lead": "MES integrations, IoT telemetry and the internal tools that keep production lines measured and moving.",
        "tags": ["IoT", "MES", "OPC UA"],
        "services": ["embedded-automotive-software", "devops-cloud-data", "web-mobile-development"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>MES and ERP integrations.</li>
<li>Machine connectivity over OPC UA and industrial protocols.</li>
<li>IoT telemetry, from the shop floor to the cloud.</li>
<li>Dashboards and internal tools for production, quality and maintenance.</li>
</ul>
<h2 id="people">The people</h2>
<p>Engineers who are comfortable on both sides of the factory gate — with PLC data and industrial networks as well as cloud services and web front-ends — and who understand that a production line cannot wait for a deployment window.</p>
<h2 id="onsite">On the shop floor when needed</h2>
<p>Commissioning and integration work often needs someone at the line. Engineers can work on-site, hybrid or remotely, agreed for each engagement.</p>
""",
    },
    {
        "slug": "healthcare", "stats": [('HL7 · FHIR', 'Interoperability'), ('GDPR', 'Special-category data'), ('Validation', 'Documentation ready')], "scene": "health", "n": "04",
        "name": "Healthcare & life sciences",
        "title": "Engineers for healthcare and life sciences",
        "desc": "Software and QA engineers for clinical and laboratory software — HL7 and FHIR integrations, privacy by design, validation-ready documentation.",
        "lead": "Clinical and lab software built with privacy by design, validation in mind and documentation regulators can follow.",
        "tags": ["HL7 / FHIR", "GDPR", "Validation"],
        "services": ["web-mobile-development", "qa-test-automation", "dedicated-teams"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>Clinical and laboratory information systems.</li>
<li>HL7 and FHIR integrations between systems that were never designed to talk.</li>
<li>Patient-facing portals and apps.</li>
<li>Test and validation of regulated software.</li>
</ul>
<h2 id="people">The people</h2>
<p>Engineers who treat health data as special-category personal data from the first design discussion, and QA engineers used to producing the documentation a validation team or a notified body expects.</p>
<h2 id="data">Data protection</h2>
<p>We process personal data under GDPR, sign your data-processing terms and give engineers only the access their work requires.</p>
""",
    },
    {
        "slug": "energy", "stats": [('Metering', 'Meter-data platforms'), ('SCADA', 'OT integrations'), ('Critical', 'Infrastructure security')], "scene": "energy", "n": "05",
        "name": "Energy & utilities",
        "title": "Engineers for energy and utilities",
        "desc": "Software, data and DevOps engineers for smart metering, grid analytics, SCADA integrations and customer platforms in energy and utilities.",
        "lead": "Metering, grid analytics and customer platforms for an industry moving from hardware to software.",
        "tags": ["Smart metering", "Analytics", "SCADA"],
        "services": ["devops-cloud-data", "embedded-automotive-software", "web-mobile-development"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>Smart-metering platforms and meter-data management.</li>
<li>Grid and consumption analytics.</li>
<li>SCADA and operational-technology integrations.</li>
<li>Customer portals, billing integrations and apps.</li>
</ul>
<h2 id="people">The people</h2>
<p>Data engineers who can handle high-volume time series, back-end engineers used to integrating with operational systems, and embedded engineers for devices in the field.</p>
<h2 id="security">Critical infrastructure</h2>
<p>Energy systems are critical infrastructure. Engineers work under your security policies and access controls, and access is removed the day an engagement ends.</p>
""",
    },
    {
        "slug": "telecom-cybersecurity", "stats": [('IAM', 'Identity and access'), ('5G', 'Network software'), ('Least privilege', 'By default')], "scene": "telecom", "n": "06",
        "name": "Telecom & cybersecurity",
        "title": "Engineers for telecom and cybersecurity",
        "desc": "Network software, identity and access management and security engineers for telecom operators and security-critical products.",
        "lead": "Network software, identity and security engineering for products that are attacked the day they launch.",
        "tags": ["IAM", "SecOps", "5G"],
        "services": ["devops-cloud-data", "qa-test-automation", "team-augmentation"],
        "body": """
<h2 id="work">The work</h2>
<ul>
<li>Network and telecom software, including 5G-era services.</li>
<li>Identity and access management.</li>
<li>Security engineering, secure SDLC and security testing.</li>
<li>Security operations tooling and automation.</li>
</ul>
<h2 id="people">The people</h2>
<p>Engineers who build with an attacker in mind — threat modelling, least privilege and secure defaults — and DevOps engineers who treat security controls as part of the pipeline, not a gate at the end.</p>
<h2 id="trust">Trust as a working practice</h2>
<p>Every engineer signs confidentiality before seeing your code, works only with the access their task needs, and is removed from your systems on the day the engagement ends.</p>
""",
    },
]

VETTING = {
    "title": "How we vet engineers", "scene": "vet",
    "stats": [("60 – 90 min", "Technical interview"), ("1 week", "To a shortlist"), ("6 steps", "From brief to follow-up")],
    # the timeline drawn above the text: (step, when)
    "steps": [("Role profile", "Day 1"), ("Screening", "Days 1 – 5"), ("Technical interview", "60 – 90 min"),
              ("References", "Before the shortlist"), ("Your interview", "Within a week"), ("Check-ins", "Ongoing")],
    "desc": "How Techno Software Czech selects engineers before you see a CV: a role profile, a technical interview with an engineer in the same stack, reference checks and regular check-ins after the start.",
    "lead": "Every engineer we propose has been interviewed by an engineer who works in the same stack. Here is the whole process, from your brief to the months after the start.",
    "body": """
<h2 id="brief">1. A role profile you approve</h2>
<p>Vetting starts before any candidate. A call with your engineering lead covers the stack, the seniority, the domain and the way the team works. We write it back as a role profile — must-haves, nice-to-haves and what the first months will look like — and search only once you have approved it.</p>
<h2 id="screen">2. Screening</h2>
<p>We search our own bench and the Damas Engineering network. A recruiter checks experience against the profile, availability, notice period, preferred work mode, language and expectations — so nobody reaches an interview who could not start.</p>
<h2 id="technical">3. A technical interview with an engineer</h2>
<p>Every candidate is interviewed for 60 to 90 minutes by an engineer who works in the same stack. It is a conversation about real work — systems they built, decisions they made and would change, how they debug and review — not trick puzzles. Where it helps, we add a short practical exercise close to the work in your team.</p>
<h2 id="references">4. References and fit</h2>
<p>We check references with previous leads and talk with the candidate about the team they would join. Candidates are proposed only for projects they have agreed to, so the people you meet actually want the job.</p>
<h2 id="you">5. You interview and decide</h2>
<p>You receive a short list of people we would hire ourselves, each with a written summary of the technical interview. You interview them as you would any candidate, and nobody starts without your yes.</p>
<h2 id="after">6. After the start</h2>
<p>Vetting does not stop at the contract. We check in regularly with you and with the engineer, pass feedback in both directions and, if the fit is not right, replace them — so a poor fit is caught in weeks, not quarters.</p>
""",
}
