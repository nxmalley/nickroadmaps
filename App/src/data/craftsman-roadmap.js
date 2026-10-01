/**
 * Craftsman Track — cert-spine engineering mastery roadmap.
 *
 * Philosophy: certs are the spine, engineering skills are an always-on
 * side-quest track that compounds on top. Depth over deadline. Rest is
 * planned, not failure. Security is a lens applied across everything.
 *
 * Date treatment is intentionally mixed:
 *   - Splunk Core Power User: soft ~3-week target
 *   - AWS DevOps Engineer Pro (DOP-C02): hard April 1 deadline
 *   - 2-week rest: an earned reward
 *   - AWS Solutions Architect Pro (SAP-C03): no date, mastery-driven
 *   - CISSP: no date, mastery-driven, closes the spine
 *
 * Independent progress: unique id "craftsman-engineering" -> progress key
 * "progress:craftsman-engineering" in localStorage, fully isolated from the
 * historical nick-2yr-engineering roadmap.
 *
 * @type {import('../types/roadmap.js').RoadmapData}
 */

export const CRAFTSMAN_ROADMAP_ID = "craftsman-engineering";

export const craftsmanRoadmap = {
  id: CRAFTSMAN_ROADMAP_ID,
  title: "Craftsman Track — Cert Spine + Skills",
  subtitle: "Certs lead, skills compound. Depth over deadline — mastery, not a race.",
  dateRange: { start: "2026-09-30", end: "2029-12-31" },
  accentColors: ["#0F6E56", "#185FA5", "#8A6D1F", "#534AB7", "#993C1D", "#0f7a99"],
  categories: {
    cert:      { label: "Cert",        bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
    python:    { label: "Python",      bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
    linux:     { label: "Linux",       bg: "var(--color-background-danger)",    color: "var(--color-text-danger)" },
    http:      { label: "HTTP",        bg: "#eee6fb", color: "#534AB7" },
    net:       { label: "Networking",  bg: "#e8f7fb", color: "#0f7a99" },
    security:  { label: "Security",    bg: "var(--color-background-success)",   color: "var(--color-text-success)" },
    comms:     { label: "Comms",       bg: "#fdf0f5", color: "#a3175e" },
    read:      { label: "Read",        bg: "var(--color-background-warning)",   color: "var(--color-text-warning)" },
    reinforce: { label: "Reinforce",   bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
    rest:      { label: "Rest",        bg: "#f0f0f0", color: "#888888" },
    integrate: { label: "Integrate",   bg: "#fdeee0", color: "#b5591a" },
  },
  phases: [
    {
      id: "cp1",
      title: "Splunk PU",
      subtitle: "Splunk Core Power User — data logging mastery",
      dateRange: "Soft target: ~3 weeks",
      milestones: ["Fundamentals 1 ✓", "Fundamentals 2 ✓", "Power User exam (soft ~3wk target)"],
      weeks: [
        {
          id: "cp1s1", label: "Stage 1 · Fundamentals", dates: "Understand what Splunk does",
          tasks: [
            { id: "cp1s1a", cat: "cert", text: "Create free Splunk Education account, enroll in Splunk Fundamentals 1. Build intuition for what Splunk actually does and why your environment uses it" },
            { id: "cp1s1b", cat: "cert", text: "Fundamentals 1: searches, SPL syntax, data inputs, field extraction basics. Understand how Splunk indexes and queries data" },
            { id: "cp1s1c", cat: "cert", text: "Fundamentals 2: transforming commands, lookups, scheduled alerts, dashboard panels, statistical commands, field aliases, calculated fields" },
          ],
        },
        {
          id: "cp1s2", label: "Stage 2 · Power User exam material", dates: "Exam-specific depth",
          tasks: [
            { id: "cp1s2a", cat: "cert",     text: "Power User content: knowledge objects, regex field extraction, event types, tags, data model acceleration — the exam-specific material" },
            { id: "cp1s2b", cat: "security", text: "Connect Splunk to your day job: how security logging works — what events matter, how detections are built on top of indexed data, why log integrity matters" },
            { id: "cp1s2c", cat: "cert",     text: "🎯 Sit for Splunk Core Power User exam — soft target ~3 weeks in. Sit when the practice material feels solid, not on a forced date" },
          ],
        },
        {
          id: "cp1s3", label: "Stage 3 · Lock it in", dates: "",
          tasks: [
            { id: "cp1s3a", cat: "reinforce", text: "Build one real dashboard + one alert against sample data from scratch, no tutorial. If you can do this unaided, the knowledge stuck" },
            { id: "cp1s3b", cat: "rest",      text: "Short breather before the DOP-C02 runway. Something is better than nothing — but a planned pause is not falling behind" },
            { id: "cp1s3c", cat: "read",      text: "Reading (companion, low-lift): The E-Myth Revisited — the technician vs manager vs entrepreneur distinction. Most important early read; reframes how you think about building anything beyond yourself" },
          ],
        },
      ],
    },
    {
      id: "cp2",
      title: "DOP-C02",
      subtitle: "AWS DevOps Engineer Pro — enterprise continuous delivery",
      dateRange: "🎯 Hard deadline: April 1",
      milestones: ["🎯 April 1 — committed", "CI/CD mastery", "IaC fluency", "Monitoring + incident response", "Security in the pipeline"],
      weeks: [
        {
          id: "cp2d1", label: "Domain · SDLC Automation", dates: "CI/CD core",
          tasks: [
            { id: "cp2d1a", cat: "cert",   text: "CI/CD pipelines: CodePipeline, CodeBuild, CodeDeploy, CodeArtifact. Build, test, and deployment stages — understand what each service owns in the flow" },
            { id: "cp2d1b", cat: "cert",   text: "Deployment strategies: blue/green, canary, rolling, all-at-once. Know when each applies and the rollback behavior of each" },
            { id: "cp2d1c", cat: "linux",  text: "Compounds with skills track: write the build/deploy shell scripts yourself — don't let the console hide the mechanics" },
          ],
        },
        {
          id: "cp2d2", label: "Domain · Config Mgmt + IaC", dates: "Infrastructure as code",
          tasks: [
            { id: "cp2d2a", cat: "cert",   text: "CloudFormation deep dive: templates, stacks, change sets, nested stacks, drift detection. This is the exam's IaC backbone" },
            { id: "cp2d2b", cat: "cert",   text: "Config management: Systems Manager (SSM), parameter store, OpsWorks awareness. Immutable vs mutable infrastructure patterns" },
            { id: "cp2d2c", cat: "python", text: "Compounds with skills track: automate a stack deploy with boto3 — understand the SDK call path behind the console" },
          ],
        },
        {
          id: "cp2d3", label: "Domain · Monitoring + Logging", dates: "Observability",
          tasks: [
            { id: "cp2d3a", cat: "cert",   text: "CloudWatch (metrics, alarms, Logs, Insights), X-Ray tracing, EventBridge. Know how to detect, alert, and trace across a distributed system" },
            { id: "cp2d3b", cat: "cert",   text: "Centralized logging patterns across accounts — this is where your Splunk logging mental model transfers directly" },
          ],
        },
        {
          id: "cp2d4", label: "Domain · Incident + Event Response", dates: "Resilience",
          tasks: [
            { id: "cp2d4a", cat: "cert",   text: "Automated remediation: EventBridge rules → Lambda/SSM automation. Auto-scaling, health checks, self-healing patterns" },
            { id: "cp2d4b", cat: "cert",   text: "DR and HA: RTO/RPO, multi-region failover, backup/restore automation" },
          ],
        },
        {
          id: "cp2d5", label: "Domain · Security + Compliance", dates: "Security as a gate",
          tasks: [
            { id: "cp2d5a", cat: "security", text: "Security in CI/CD: secrets management (Secrets Manager, SSM SecureString), least-privilege pipeline roles, no credentials in code. Security is a gate, not a step" },
            { id: "cp2d5b", cat: "security", text: "Compliance automation: Config rules, GuardDuty, Security Hub, Inspector. How to prove continuous compliance — ties straight to your cybersec background" },
          ],
        },
        {
          id: "cp2d6", label: "Final push", dates: "Before April 1",
          tasks: [
            { id: "cp2d6a", cat: "cert",      text: "Full timed mock exams (TutorialsDojo). For every wrong answer, read the actual AWS doc page, not just the explanation. Target consistent passing scores before sitting" },
            { id: "cp2d6b", cat: "cert",      text: "🎯 Sit for AWS DevOps Engineer Pro (DOP-C02) — hard deadline April 1. This is the committed date" },
            { id: "cp2d6c", cat: "reinforce", text: "After the exam: write a one-page 'how I'd build a secure CI/CD pipeline from scratch' doc from memory. Proof the knowledge is yours" },
            { id: "cp2d6d", cat: "read",      text: "Reading (companion): Crucial Conversations — directly feeds the Comms track. Client-facing work, leadership, and defending technical decisions all live or die on this skill" },
          ],
        },
      ],
    },
    {
      id: "cp3",
      title: "Rest",
      subtitle: "Two-week rest — earned reward for the DOP-C02 grind",
      dateRange: "2 weeks · reward",
      milestones: ["Grind acknowledged", "No new material", "Recharge"],
      weeks: [
        {
          id: "cp3r1", label: "The reward", dates: "",
          tasks: [
            { id: "cp3r1a", cat: "rest", text: "Two full weeks off the cert grind. This is a reward you earned, not time to make up. No new material, no guilt. Come back sharper for SAP-C03" },
            { id: "cp3r1b", cat: "read", text: "Reading (optional, light): Principles (Ray Dalio) — decision-making frameworks. A reflective read that fits a rest period without feeling like work" },
          ],
        },
      ],
    },
    {
      id: "cp4",
      title: "SAP-C03",
      subtitle: "AWS Solutions Architect Pro — enterprise cloud design",
      dateRange: "",
      milestones: ["No fixed date", "Mastery-driven", "Sit when mocks are consistently ready"],
      weeks: [
        {
          id: "cp4s1", label: "Domain · Organizational Complexity", dates: "",
          tasks: [
            { id: "cp4s1a", cat: "cert", text: "Multi-account strategy: AWS Organizations, SCPs, cross-account access. Networking at scale — Transit Gateway, Direct Connect, VPN, Route 53 Resolver" },
            { id: "cp4s1b", cat: "cert", text: "Understand how SAP differs from associate-level: design thinking and tradeoffs, not service recall" },
          ],
        },
        {
          id: "cp4s2", label: "Domain · New Solutions Design", dates: "",
          tasks: [
            { id: "cp4s2a", cat: "cert",     text: "HA patterns, DR strategies (pilot light, warm standby, multi-site), event-driven architecture (SQS/SNS/EventBridge decoupling)" },
            { id: "cp4s2b", cat: "security", text: "Security architecture in the design: IAM boundaries, encryption at rest/in transit, network segmentation, data classification driving the design. The security lens on every architecture decision" },
          ],
        },
        {
          id: "cp4s3", label: "Domain · Migration + Modernization", dates: "",
          tasks: [
            { id: "cp4s3a", cat: "cert", text: "7 Rs of migration (rehost, replatform, refactor, etc.), Migration Hub, DMS, hybrid networking patterns" },
          ],
        },
        {
          id: "cp4s4", label: "Domain · Cost Control", dates: "",
          tasks: [
            { id: "cp4s4a", cat: "cert", text: "Pricing models (On-Demand vs Reserved vs Spot vs Savings Plans), Cost Explorer, Budgets, Trusted Advisor, Compute Optimizer. Cost is an architecture dimension" },
          ],
        },
        {
          id: "cp4s5", label: "Mastery check", dates: "Sit when ready",
          tasks: [
            { id: "cp4s5a", cat: "cert",      text: "Full timed mocks. No fixed date — sit only when mock scores are consistently strong. Mastery drives the timing, not a calendar" },
            { id: "cp4s5b", cat: "cert",      text: "🎯 Sit for AWS Solutions Architect Pro (SAP-C03) — when you're genuinely ready" },
            { id: "cp4s5c", cat: "reinforce", text: "Design a multi-account, multi-region architecture on a whiteboard from memory and defend every tradeoff out loud. The real test of SAP depth" },
            { id: "cp4s5d", cat: "read",      text: "Reading (companion): Start With Why (Simon Sinek) — the Golden Circle. Sharpens how you frame the 'why' behind an architecture, not just the 'what'" },
          ],
        },
      ],
    },
    {
      id: "cp5",
      title: "CISSP",
      subtitle: "CISSP — executive security + risk management",
      dateRange: "",
      milestones: ["No fixed date", "Mastery-driven", "Caps the spine", "Leverages M.S. in Cybersec"],
      weeks: [
        {
          id: "cp5c1", label: "Domains · Risk + Asset Security", dates: "",
          tasks: [
            { id: "cp5c1a", cat: "security", text: "Security & Risk Management, Asset Security: governance, risk frameworks, data classification, ownership. Your M.S. gives you a strong head start — focus on CISSP's manager-level framing" },
          ],
        },
        {
          id: "cp5c2", label: "Domains · Architecture + Comms Security", dates: "",
          tasks: [
            { id: "cp5c2a", cat: "security", text: "Security Architecture & Engineering, Communication & Network Security: secure design principles, cryptography, network security models. Ties directly to your HTTP/networking skills track" },
          ],
        },
        {
          id: "cp5c3", label: "Domains · IAM + Assessment", dates: "",
          tasks: [
            { id: "cp5c3a", cat: "security", text: "Identity & Access Management, Security Assessment & Testing: authn/authz models, access control, audits, pen testing concepts" },
          ],
        },
        {
          id: "cp5c4", label: "Domains · Operations + Software Security", dates: "",
          tasks: [
            { id: "cp5c4a", cat: "security", text: "Security Operations, Software Development Security: incident response, SecOps, secure SDLC. The SDLC domain connects to everything you build on the skills track" },
          ],
        },
        {
          id: "cp5c5", label: "Mastery check", dates: "Sit when ready",
          tasks: [
            { id: "cp5c5a", cat: "cert",      text: "Think like a manager, not an engineer — CISSP tests risk-based decision framing. Practice choosing the 'best' answer, not just the 'correct' one" },
            { id: "cp5c5b", cat: "cert",      text: "🎯 Sit for CISSP — no fixed date, mastery-driven. This caps the cert spine as your executive security credential" },
          ],
        },
      ],
    },
    {
      id: "cs1",
      title: "Skills (always-on)",
      subtitle: "Parallel skills track — compounds under the certs, no timeline",
      dateRange: "",
      milestones: ["Python zero → mastery", "Linux: deepen daily usage", "HTTP + networking: fill the gaps", "Runs alongside every cert"],
      weeks: [
        {
          id: "cs1py1", label: "Python · Foundations", dates: "Day one — from zero",
          tasks: [
            { id: "cs1py1a", cat: "python", text: "Syntax from scratch: variables, types, control flow, functions, data structures (list/dict/set/tuple). Write small programs daily — brick by brick" },
            { id: "cs1py1b", cat: "python", text: "Idioms: comprehensions, slicing, unpacking, f-strings, truthiness, EAFP vs LBYL. Start writing Pythonic code, not translated-from-another-language code" },
            { id: "cs1py1c", cat: "python", text: "Modules, packages, virtual environments (venv), pip. Understand how Python projects are structured and dependencies isolated" },
          ],
        },
        {
          id: "cs1py2", label: "Python · Working fluency", dates: "Build real things",
          tasks: [
            { id: "cs1py2a", cat: "python", text: "Standard library fluency: os, sys, pathlib, json, datetime, collections, itertools, logging, subprocess. Reach for stdlib before writing custom code" },
            { id: "cs1py2b", cat: "python", text: "Error handling (try/except/finally, custom exceptions), context managers (with), generators/iterators. The constructs that separate beginner from fluent" },
            { id: "cs1py2c", cat: "python", text: "Classes and OOP: when to use them, dataclasses, properties. Then type hints + a type checker (mypy/pyright) — production Python is typed" },
          ],
        },
        {
          id: "cs1py3", label: "Python · Automation + cloud", dates: "Compounds with certs",
          tasks: [
            { id: "cs1py3a", cat: "python", text: "boto3: list/describe/create AWS resources. Credentials, clients vs resources, paginators, waiters, error handling. This feeds DOP-C02 and SAP-C03 directly" },
            { id: "cs1py3b", cat: "python", text: "Write real utilities: a cost logger to CSV, a resource auditor, an uptime monitor. Automation you'd actually use — not toy scripts" },
          ],
        },
        {
          id: "cs1py4", label: "Python · Secure + depth", dates: "Security lens",
          tasks: [
            { id: "cs1py4a", cat: "security",  text: "Secure Python: input validation, parameterized queries, secrets handling (never in code), safe deserialization. Run bandit against your own code and understand each finding" },
            { id: "cs1py4b", cat: "reinforce", text: "Build one non-trivial project end to end (CLI tool or small API) with no tutorial. If you can ship it unaided, Python is genuinely yours" },
            { id: "cs1py4c", cat: "rest",      text: "Pace Python — it's the longest runway on this track. Steady daily reps beat burnout sprints. Something is better than nothing" },
            { id: "cs1py4d", cat: "read",      text: "Reading (tactical, later in the list): the finance/real-estate titles (ABCs of Real Estate Investing, The Book on Rental Property Investing, Tax-Free Wealth, Financial Freedom) — read these once the mindset reads are done; they're reference, not foundation" },
          ],
        },
        {
          id: "cs1lx1", label: "Linux / Git Bash · Formalize", dates: "Deepen what you already use",
          tasks: [
            { id: "cs1lx1a", cat: "linux",    text: "You use the shell daily — now formalize it: filesystem hierarchy (/etc /var /usr), navigation and search (find, grep, xargs), pipes and redirection. Fill the gaps in what you already do by habit" },
            { id: "cs1lx1b", cat: "security", text: "Permission model as a security control: rwx, chmod/chown, setuid/setgid, umask. Understand it as least-privilege enforcement, not just 'make it work'" },
            { id: "cs1lx1c", cat: "linux",    text: "Processes and services: ps, top, kill, signals, systemd (start/stop/enable/status), cron, journald/logs in /var/log" },
          ],
        },
        {
          id: "cs1lx2", label: "Linux / Git Bash · Scripting + hardening", dates: "Depth",
          tasks: [
            { id: "cs1lx2a", cat: "linux",    text: "Bash scripting with real error handling: set -euo pipefail, trap, exit codes, functions, argument parsing. Write a multi-step deploy script that fails safely" },
            { id: "cs1lx2b", cat: "security", text: "SSH + key-based auth end to end: keygen, authorized_keys, config, agent. Then basic hardening — disable password auth, least-privilege users. Security lens on the box itself" },
            { id: "cs1lx2c", cat: "reinforce", text: "Git internals beyond the daily commands: how commits/branches/refs actually work, rebase vs merge, resolving conflicts confidently. Explain the object model from memory" },
          ],
        },
        {
          id: "cs1ht1", label: "HTTP · Fill the gaps", dates: "You know some — close it",
          tasks: [
            { id: "cs1ht1a", cat: "http",     text: "Request/response cycle in full: methods (GET/POST/PUT/PATCH/DELETE), status code families, headers, content negotiation, idempotency, REST conventions. Nail the parts you're fuzzy on" },
            { id: "cs1ht1b", cat: "security", text: "TLS/HTTPS: the handshake, certificates, what encryption actually protects. Auth patterns: tokens vs cookies, where to store them (httpOnly cookie vs localStorage) and why it matters" },
            { id: "cs1ht1c", cat: "security", text: "Web risks mapped to your cybersec knowledge: OWASP Top 10 at the HTTP layer — injection, broken auth, CSRF, CORS. Connect theory you know to the wire-level mechanics" },
          ],
        },
        {
          id: "cs1net1", label: "Networking · Just enough", dates: "How it all connects",
          tasks: [
            { id: "cs1net1a", cat: "net",       text: "Mental model, bounded on purpose: OSI vs TCP/IP layers, what lives where. Enough to reason about where a problem sits — not a networking specialty" },
            { id: "cs1net1b", cat: "net",       text: "DNS, ports, TCP vs UDP, the path of a request from browser to server and back. The 'how does this packet get there' story end to end" },
            { id: "cs1net1c", cat: "reinforce", text: "Trace one real request fully: DNS resolution → TCP handshake → TLS → HTTP → response. Narrate every hop out loud. If you can, networking is 'enough' for your goals" },
          ],
        },
      ],
    },
    {
      id: "cc1",
      title: "Comms + Recall",
      subtitle: "Communication & recall — half the battle for Principal Architect",
      dateRange: "",
      milestones: ["Explain clearly + confidently", "Technical AND non-technical audiences", "Recall under pressure", "Runs continuously"],
      weeks: [
        {
          id: "cc1d1", label: "Depth drills", dates: "Recall without notes",
          tasks: [
            { id: "cc1d1a", cat: "comms",     text: "No-notes depth check: after each cert domain or skill stage, explain the core concept out loud from memory. If recall is shaky, the depth isn't there yet — revisit, don't move on" },
            { id: "cc1d1b", cat: "comms",     text: "Teach-back: explain each topic twice — once to a technical peer (precise, correct), once to a non-technical person (clear, no jargon). Both audiences, every topic" },
            { id: "cc1d1c", cat: "reinforce", text: "Keep an 'explain-it-back' log: a running doc where you write a short, plain-language explanation of each thing you learn. Rereading it is spaced repetition that compounds" },
          ],
        },
        {
          id: "cc1d2", label: "Confidence + delivery", dates: "State it strongly",
          tasks: [
            { id: "cc1d2a", cat: "comms", text: "Whiteboard narration: diagram an architecture or data flow while talking through it. Practice until you can present and draw at the same time without losing the thread" },
            { id: "cc1d2b", cat: "comms", text: "Pitch the tradeoff: for any design decision, state the choice, the alternatives, and why — in under two minutes, confidently. Knowing it isn't enough; you must be able to say it cleanly" },
            { id: "cc1d2c", cat: "comms", text: "Record yourself explaining a complex topic, then watch it back. Catch the hedging, the 'um's, the gaps in your own recall. Iterate. This is the half of the battle most engineers skip" },
          ],
        },
      ],
    },
    {
      id: "ci1",
      title: "Integration",
      subtitle: "Capstones — wire it all together toward Principal Architect",
      dateRange: "",
      milestones: ["System integration", "Cloud infrastructure", "Data flows between apps", "Security architecture", "No orphaned skills"],
      weeks: [
        {
          id: "ci1b1", label: "Build the end-to-end system", dates: "Everything, connected",
          tasks: [
            { id: "ci1b1a", cat: "integrate", text: "System integration pillar: design and build a small end-to-end system (frontend + API + data store + auth) using your own stack — Python services, Linux hosts, HTTP between components. The point is wiring, not features" },
            { id: "ci1b1b", cat: "integrate", text: "Cloud infrastructure pillar: deploy it on AWS using what the certs taught — IaC for the infra, CI/CD for delivery, CloudWatch for observability. Your SAP/DOP knowledge applied to your own system" },
            { id: "ci1b1c", cat: "integrate", text: "Data flows pillar: map and document how data moves between every component — request paths, data stores, queues/events, trust boundaries. Draw the diagram; it must match reality" },
          ],
        },
        {
          id: "ci1b2", label: "Secure + defend it", dates: "The security lens, end to end",
          tasks: [
            { id: "ci1b2a", cat: "security",  text: "Security architecture pillar: threat-model the whole system (STRIDE), apply least privilege across IAM and Linux, encrypt in transit and at rest, add security gates to the pipeline. The CISSP + M.S. lens made concrete on something you built" },
            { id: "ci1b2b", cat: "integrate", text: "Document the architecture as if handing it to another engineer: components, data flows, security decisions, tradeoffs. This is your living proof-of-capability artifact" },
            { id: "ci1b2c", cat: "comms",     text: "Present and defend the whole system out loud — architecture, data flows, security tradeoffs — to a technical and a non-technical audience. This is the Principal Architect bar: know it, and be able to say it clearly and confidently" },
          ],
        },
        {
          id: "ci1b3", label: "Leadership + reflection", dates: "",
          tasks: [
            { id: "ci1b3a", cat: "read",      text: "Reading (leadership, near the top of the ladder): Dare to Lead + The 5 Levels of Leadership — read together. The leadership vocabulary that matters as you move toward senior/principal and client-facing conversations" },
            { id: "ci1b3b", cat: "read",      text: "Reading (closing reflection): Good to Great — the Hedgehog Concept applied to your own career. What you can be best at, deeply care about, and build a reputation on" },
            { id: "ci1b3c", cat: "reinforce", text: "Career audit trigger: cert spine done + skills genuinely owned + a defensible end-to-end system built and presented. This is the point to step back and assess the next move toward Principal Architect — on your own timeline" },
          ],
        },
      ],
    },
  ],
  createdAt: "2026-09-30T00:00:00.000Z",
  updatedAt: "2026-09-30T00:00:00.000Z",
};
