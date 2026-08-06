/**
 * Nick's 2-Year Engineering Roadmap data conforming to the RoadmapData schema.
 * Task IDs match the existing "nick-roadmap-v1" localStorage key for migration compatibility.
 *
 * Source of truth: nick_roadmap.html (v3, updated Jul 9, 2026).
 *
 * @type {import('../types/roadmap.js').RoadmapData}
 */

export const NICK_ROADMAP_ID = "nick-2yr-engineering";

export const nickRoadmap = {
  id: NICK_ROADMAP_ID,
  title: "Nick's 2-Year Engineering Roadmap",
  subtitle: "Jun 2026 – Feb 2029 · v3 updated Jul 9, 2026",
  dateRange: { start: "2026-06-15", end: "2029-02-28" },
  accentColors: ["#0F6E56", "#185FA5", "#534AB7", "#993C1D"],
  categories: {
    cert:    { label: "Cert",        bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
    malnax:  { label: "Malnax",      bg: "var(--color-background-success)",   color: "var(--color-text-success)" },
    skill:   { label: "Skill",       bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
    read:    { label: "Read",        bg: "var(--color-background-warning)",   color: "var(--color-text-warning)" },
    linux:   { label: "Linux",       bg: "var(--color-background-danger)",    color: "var(--color-text-danger)" },
    python:  { label: "Python",      bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
    ansible: { label: "Ansible",     bg: "var(--color-background-success)",   color: "var(--color-text-success)" },
    biz:     { label: "Biz",         bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
    http:    { label: "HTTP",        bg: "#eee6fb", color: "#534AB7" },
    travel:  { label: "Travel",      bg: "#fdeee0", color: "#b5591a" },
    capture: { label: "Capture/BD",  bg: "#fdf0f5", color: "#a3175e" },
    cloud:   { label: "Multi-cloud", bg: "#e8f7fb", color: "#0f7a99" },
    buffer:  { label: "Buffer",      bg: "#f0f0f0", color: "#888888" },
  },
  phases: [
    {
      id: "p1",
      title: "Phase 1",
      subtitle: "Post-SAA Momentum + Malnax Public Launch",
      dateRange: "Jun 15 – Sep 1, 2026",
      milestones: ["Splunk Power User ✓", "Malnax static site live", "SAM.gov finalized", "HTTP fundamentals", "Proof-points log started"],
      weeks: [
        {
          id: "p1w1", label: "Week 1", dates: "Jun 15–21 · DONE",
          tasks: [
            { id: "p1w1a", cat: "malnax", text: "Fix deployment: write .gitlab-ci.yml that runs vercel deploy via Vercel CLI. Bypasses private repo cost and earns real CI/CD pipeline experience simultaneously" },
            { id: "p1w1b", cat: "cert",   text: "Splunk: Create free Splunk Education account, enroll in Splunk Fundamentals 1. Understand what Splunk actually does and why your environment uses it" },
            { id: "p1w1c", cat: "read",   text: "Resume ABCs of Real Estate Investing — target finishing this book by end of Phase 1" },
          ],
        },
        {
          id: "p1w2", label: "Week 2", dates: "Jul 8–14",
          tasks: [
            { id: "p1w2a", cat: "malnax", text: "Malnax: Understand every file in your Vite project before touching code — index.html, vite.config.js, package.json, src/ structure. No black boxes" },
            { id: "p1w2b", cat: "cert",   text: "Splunk Fundamentals 1: searches, SPL syntax, data inputs, field extraction basics. Build intuition for how Splunk indexes and queries data" },
            { id: "p1w2c", cat: "read",   text: "ABCs of Real Estate: continue through chapters on evaluating deals and cash flow analysis" },
          ],
        },
        {
          id: "p1w3", label: "Week 3", dates: "Jul 15–21",
          tasks: [
            { id: "p1w3a", cat: "malnax", text: "Malnax: Point malnax.com to Vercel — add the domain in Vercel project settings and configure DNS at your registrar. Makes the site real and publicly reachable" },
            { id: "p1w3b", cat: "cert",   text: "Splunk: finish Fundamentals 1, begin Fundamentals 2 — transforming commands, lookups, scheduled alerts, dashboard panels" },
            { id: "p1w3c", cat: "read",   text: "ABCs of Real Estate: continue — deal evaluation and cash flow analysis chapters" },
          ],
        },
        {
          id: "p1w4", label: "Week 4", dates: "Jul 22–28 · light week",
          tasks: [
            { id: "p1w4a", cat: "malnax", text: "Malnax: Build a clean static landing page — replace the Vite starter template with a professional homepage (hero, mission statement, capability cards, contact section). Reference leidos.com, lockheedmartin.com, gdit.com, rtx.com, saic.com, caci.com, battelle.com, mantech.com. Static React only, no backend calls yet" },
            { id: "p1w4b", cat: "cert",   text: "Splunk Fundamentals 2: continue — lighter pace this week to leave room for travel prep" },
            { id: "p1w4c", cat: "travel", text: "Toronto trip Jul 27–30 — protect this window. No new material queued for the back half of this week" },
          ],
        },
        {
          id: "p1w5", label: "Week 5", dates: "Jul 29–Aug 4 · light week",
          tasks: [
            { id: "p1w5a", cat: "malnax", text: "Malnax: Add About and Contact pages with basic routing (React Router). Still static, still no database — just structure that proves the site can grow" },
            { id: "p1w5b", cat: "cert",   text: "Splunk Fundamentals 2: complete course — statistical commands, field aliases, calculated fields, data model overview" },
            { id: "p1w5c", cat: "http",   text: "HTTP deep dive kickoff: request/response cycle, methods (GET/POST/PUT/DELETE), status code families, headers. Good low-lift reading for travel downtime" },
          ],
        },
        {
          id: "p1w6", label: "Week 6", dates: "Aug 5–11",
          tasks: [
            { id: "p1w6a", cat: "malnax",  text: "Malnax: Push to main — confirm your pipeline auto-deploys to Vercel production. Confirm malnax.com shows your real site" },
            { id: "p1w6b", cat: "cert",    text: "Splunk Power User content: knowledge objects, regex field extraction, event types, tags, data model acceleration — the exam-specific material" },
            { id: "p1w6c", cat: "linux",   text: "Linux foundations (1hr): filesystem hierarchy (/etc /var /usr /home), navigation (ls, cd, pwd, find, grep), permissions (chmod, chown, rwx model)" },
            { id: "p1w6d", cat: "capture", text: "Start a running 'wins & proof points' log — capture every technical milestone (Splunk cert, malnax.com launch) in resume-ready and future-capability-statement-ready language as it happens, instead of reconstructing it later" },
          ],
        },
        {
          id: "p1w7", label: "Week 7", dates: "Aug 12–18",
          tasks: [
            { id: "p1w7a", cat: "malnax", text: "Malnax: Park the backend — Render is proven and running. Leave it alone until you have actual dynamic content (job postings, articles) that justifies API calls" },
            { id: "p1w7b", cat: "cert",   text: "🎯 SIT FOR SPLUNK POWER USER EXAM — target this week (hard backstop: before Aug 31)" },
            { id: "p1w7c", cat: "linux",  text: "Linux: processes (ps, top, kill), users and groups (useradd, usermod), basic shell scripting — variables, loops, conditionals, exit codes" },
          ],
        },
        {
          id: "p1w8", label: "Week 8", dates: "Aug 19–25",
          tasks: [
            { id: "p1w8a", cat: "biz",  text: "🎯 Open Malnax business bank account and apply for a business credit card — target Aug 20, hard checkpoint ahead of the SAM.gov deletion date" },
            { id: "p1w8b", cat: "biz",  text: "SAM.gov: finalize registration for MALNAX LLC (UEI VMH1DBUEY925) using new banking info — move status out of 'Work in Progress'" },
            { id: "p1w8c", cat: "http", text: "HTTP deep dive continued: HTTPS/TLS handshake basics, caching headers, idempotency, REST conventions" },
          ],
        },
        {
          id: "p1w9", label: "Week 9", dates: "Aug 26–Sep 1",
          tasks: [
            { id: "p1w9a", cat: "biz",     text: "🎯 Confirm SAM.gov registration is fully submitted — hard deadline Sep 2, 2026, registration is deleted if still incomplete" },
            { id: "p1w9b", cat: "ansible", text: "Ansible: install, understand YAML syntax rules (indentation is everything), run first ad-hoc command against localhost. Continues into Phase 2" },
            { id: "p1w9c", cat: "read",    text: "Finish ABCs of Real Estate Investing. Begin The Book on Rental Property Investing" },
          ],
        },
      ],
    },
    {
      id: "p2",
      title: "Phase 2",
      subtitle: "AWS SAP Deep Dive + BD Foundation",
      dateRange: "Sep 2026 – Feb 2027",
      milestones: ["AWS SAP ✓ (flexible timing)", "Linux fluency", "Python + boto3", "Ansible fluency"],
      weeks: [
        {
          id: "p2w1", label: "Weeks 1–2", dates: "Sep 2–15",
          tasks: [
            { id: "p2w1a", cat: "cert",    text: "SAP orientation: understand how SAP differs from SAA — design thinking vs service knowledge. Map domain weights to a study schedule around your available hours" },
            { id: "p2w1b", cat: "ansible", text: "Ansible: roles directory structure, variables, conditionals (when:), handlers — building on Phase 1 foundations" },
            { id: "p2w1c", cat: "biz",     text: "Reminder: Malnax Business Roadmap gets built this month, now that the bank account and SAM.gov status are both settled" },
            { id: "p2w1d", cat: "read",    text: "Book on Rental Property Investing: continue — cash flow analysis, cap rate, deal evaluation, property management basics" },
          ],
        },
        {
          id: "p2w2", label: "Weeks", dates: "Sep 16–Oct 13",
          tasks: [
            { id: "p2w2a", cat: "cert",   text: "SAP Domain 1 — Organizational Complexity: multi-account strategy, AWS Organizations, SCPs, networking deep dive (Transit Gateway, Direct Connect, VPN, Route 53 Resolver)" },
            { id: "p2w2b", cat: "linux",  text: "Linux: systemd services (start/stop/enable/status), cron jobs (crontab syntax), log files (/var/log), SSH config and key-based auth setup" },
            { id: "p2w2c", cat: "malnax", text: "Malnax: Containerize backend with Docker — write Dockerfile line by line, understand every instruction (FROM, RUN, COPY, EXPOSE, CMD). Deploy container to Render" },
          ],
        },
        {
          id: "p2w3", label: "Weeks", dates: "Oct 14–Nov 10",
          tasks: [
            { id: "p2w3a", cat: "cert",   text: "SAP Domain 2 — New Solutions: HA patterns, DR strategies (pilot light, warm standby, multi-site), event-driven architecture (SQS/SNS/EventBridge decoupling patterns)" },
            { id: "p2w3b", cat: "python", text: "Python + boto3: write scripts that list S3 buckets, describe EC2 instances, check IAM users. Understand the AWS SDK pattern — credentials, clients, paginators, error handling" },
            { id: "p2w3c", cat: "malnax", text: "Malnax: Add contact/inquiry form to frontend. Handle POST endpoint in FastAPI. Understand HTTP methods, status codes, request validation with Pydantic — apply your HTTP deep dive directly here" },
          ],
        },
        {
          id: "p2buf1", label: "Buffer / Catch-up", dates: "Nov 11–17",
          tasks: [
            { id: "p2buf1a", cat: "buffer", text: "No new material this week. Catch up on anything behind schedule, review notes from the last 8 weeks, or just rest. This week exists on purpose — using it isn't falling behind" },
          ],
        },
        {
          id: "p2w4", label: "Weeks", dates: "Nov 18–Dec 8",
          tasks: [
            { id: "p2w4a", cat: "cert",   text: "SAP Domain 3 — Migration Planning: 7 Rs of migration (rehost, replatform, refactor, etc.), AWS Migration Hub, DMS, Server Migration Service, hybrid networking patterns" },
            { id: "p2w4b", cat: "python", text: "Python: write a monitoring script that checks an AWS resource via CloudWatch and sends SNS alert if threshold exceeded. Understand the logging module and structured log output" },
            { id: "p2w4c", cat: "linux",  text: "Linux: environment variables, .bashrc vs .bash_profile, PATH manipulation, writing reusable bash functions, error handling in scripts (set -e, trap)" },
          ],
        },
        {
          id: "p2w5", label: "Weeks", dates: "Dec 9–29",
          tasks: [
            { id: "p2w5a", cat: "cert",    text: "SAP Domain 4 — Cost Optimization: pricing models (On-Demand vs Reserved vs Spot vs Savings Plans), Cost Explorer, AWS Budgets, Trusted Advisor, Compute Optimizer" },
            { id: "p2w5b", cat: "ansible", text: "Ansible + Docker integration: write a playbook that pulls and runs a container. Understand how Ansible fits a deployment pipeline" },
            { id: "p2w5c", cat: "read",    text: "Tax-Free Wealth (Tom Wheelwright): begin — directly applicable to Malnax LLC tax strategy, depreciation, QBI deduction for pass-through entities, business expense strategy" },
          ],
        },
        {
          id: "p2w6", label: "Weeks", dates: "Jan 13–26, 2027",
          tasks: [
            { id: "p2w6a", cat: "cert",   text: "SAP: full timed mock exams on TutorialsDojo. Target consistent 78%+ before sitting. For every wrong answer: read the actual AWS doc page, not just the explanation" },
            { id: "p2w6b", cat: "malnax", text: "Malnax v1 review: document every file, function, and route. Write a README that explains the entire stack to a stranger. Tests whether your Socratic approach actually worked" },
            { id: "p2w6c", cat: "read",   text: "Tax-Free Wealth: continue. Note every strategy applicable to your situation — LLC structure, home office, equipment depreciation, self-employment considerations" },
          ],
        },
        {
          id: "p2w7", label: "Weeks", dates: "Jan 27–Feb 16, 2027",
          tasks: [
            { id: "p2w7a", cat: "cert",   text: "🎯 SIT FOR AWS SAP — no fixed date, sit once mock scores are consistently ready. Do not sit until you're scoring 78%+" },
            { id: "p2w7b", cat: "read",   text: "The Lean Startup (Eric Ries): begin — MVP thinking, validated learning, build-measure-learn. Core mental model for how you structure Malnax service offerings" },
            { id: "p2w7c", cat: "malnax", text: "Malnax: plan v2 — what dynamic features would make this site useful? (case studies, blog, inquiry form with DB, admin panel). Scope before building" },
          ],
        },
      ],
    },
    {
      id: "p3",
      title: "Phase 3",
      subtitle: "AZ-305 + Capability Buildout + Cloud Advisory Framework",
      dateRange: "Feb – Aug 2027",
      milestones: ["AZ-305 ✓", "IaC hands-on", "Malnax on AWS", "DevSecOps preview", "AWS vs Azure framework drafted"],
      weeks: [
        {
          id: "p3b1", label: "Break: Weeks 1–3", dates: "Feb 17–Mar 9",
          tasks: [
            { id: "p3b1a", cat: "skill", text: "Cert break — no exam prep. Review everything built since June: Splunk knowledge, SAP architecture patterns, Python scripts, Malnax codebase. What real gaps stand out?" },
            { id: "p3b1b", cat: "skill", text: "ARM templates: understand JSON structure (parameters, variables, resources, outputs, dependsOn). Deploy a resource group + storage account via ARM. Understand why IaC matters" },
            { id: "p3b1c", cat: "read",  text: "Principles (Ray Dalio): begin — decision-making frameworks, radical transparency. High leverage reading during a reflection period between major cert grinds" },
          ],
        },
        {
          id: "p3b2", label: "Break: Weeks 4–6", dates: "Mar 10–30",
          tasks: [
            { id: "p3b2a", cat: "skill",  text: "Bicep: rewrite your ARM template in Bicep syntax. Understand why Bicep exists — cleaner syntax, same ARM engine underneath. Compare both deployments and understand the tradeoffs" },
            { id: "p3b2b", cat: "python", text: "Python: build a real utility — e.g. a daily AWS cost logger to CSV, or a Malnax uptime monitor that pings your site hourly and logs status" },
            { id: "p3b2c", cat: "read",   text: "Start With Why (Simon Sinek): apply the Golden Circle to Malnax — what is your Why? This directly informs how you pitch services to IC/DoD clients when the time comes" },
          ],
        },
        {
          id: "p3w1", label: "AZ-305: Weeks 7–8", dates: "Mar 31–Apr 13",
          tasks: [
            { id: "p3w1a", cat: "cert",   text: "AZ-305: Governance foundation from AZ-104 base — management groups, subscriptions, Azure Policy, RBAC. Shift to design-level thinking: not 'how to configure' but 'when and why'" },
            { id: "p3w1b", cat: "malnax", text: "Malnax v2: Add PostgreSQL database via FastAPI + SQLAlchemy. Understand ORM — models, sessions, queries. First real persistent data layer is a significant architectural step" },
            { id: "p3w1c", cat: "read",   text: "Financial Freedom (Grant Sabatier): savings rate optimization, FI number calculation, investment layering strategies. Reinforces your compounding roadmap with specific tactics" },
          ],
        },
        {
          id: "p3w2", label: "AZ-305: Weeks 9–11", dates: "Apr 14–May 4",
          tasks: [
            { id: "p3w2a", cat: "cert",   text: "AZ-305: Identity and security (Entra ID, MFA, Conditional Access, PIM, Defender for Cloud), monitoring (Azure Monitor, Log Analytics workspace, alerts and action groups)" },
            { id: "p3w2b", cat: "skill",  text: "Terraform basics (no cert): HCL syntax, state files, terraform plan/apply/destroy. Provision an Azure resource group. Understand Terraform vs ARM/Bicep — when you'd pick each" },
            { id: "p3w2c", cat: "malnax", text: "Malnax: Add JWT auth to admin section of FastAPI. Understand token-based auth — access tokens, refresh tokens, where to store on frontend (httpOnly cookie vs localStorage and why it matters)" },
          ],
        },
        {
          id: "p3w3", label: "AZ-305: Weeks 12–14", dates: "May 5–25",
          tasks: [
            { id: "p3w3a", cat: "cert",  text: "AZ-305: Infrastructure solutions — VM patterns, storage types (blob vs files vs disk), VNets, load balancing (ALB vs AGW), CDN, private endpoints. Scenario-based design thinking" },
            { id: "p3w3b", cat: "linux", text: "Linux scripting: write a multi-step deployment script (build → test → copy artifacts → restart service). Error handling with set -e, trap, exit codes, logging to file" },
            { id: "p3w3c", cat: "read",  text: "The E-Myth Revisited (Gerber): most important book on the list for Malnax. The technician vs manager vs entrepreneur distinction will permanently change how you think about building a business" },
          ],
        },
        {
          id: "p3buf1", label: "Buffer / Catch-up", dates: "May 26–Jun 1",
          tasks: [
            { id: "p3buf1a", cat: "buffer", text: "No new material this week. Catch up, review, or rest — especially useful buffer heading into your AZ-305 final push" },
          ],
        },
        {
          id: "p3w4", label: "AZ-305: Weeks 15–17", dates: "Jun 2–22",
          tasks: [
            { id: "p3w4a", cat: "cert",   text: "AZ-305: Application architecture (App Service, AKS intro, API Management, Service Bus, Event Grid), data solutions (Cosmos DB vs Azure SQL — when and why each)" },
            { id: "p3w4b", cat: "skill",  text: "DevSecOps preview: integrate SAST scanning into Malnax GitLab pipeline — Bandit for Python, ESLint security plugin for JS. Security as a gate, not an afterthought" },
            { id: "p3w4c", cat: "malnax", text: "Malnax: Migrate from Render/Vercel to AWS — FastAPI to EC2 or Lambda, frontend to S3 + CloudFront. Apply your SAP architecture knowledge to your own production deployment" },
          ],
        },
        {
          id: "p3w5", label: "AZ-305: Weeks 18–20", dates: "Jun 23–Jul 13",
          tasks: [
            { id: "p3w5a", cat: "cert",   text: "🎯 SIT FOR AZ-305 — final mock exams (MeasureUp recommended), target 80%+. AWS SAA + SAP + AZ-104 + AZ-305 is a serious multi-cloud credential stack at this point" },
            { id: "p3w5b", cat: "malnax", text: "Malnax full audit: site live on AWS, CI/CD deploys on push, frontend + backend connected, DB persisting, auth working, security scanning in pipeline. Document all of it" },
            { id: "p3w5c", cat: "biz",    text: "Malnax business ops: Zoho Mail (nick@malnax.com) set up, SAM.gov profile updated with any new credentials, CAGE code status checked. Malnax starts looking like a real company" },
          ],
        },
        {
          id: "p3cloudfw", label: "Cloud Advisory Kickoff", dates: "Jul 14–20",
          tasks: [
            { id: "p3cloudfwa", cat: "cloud", text: "Draft v1 of the AWS vs Azure decision framework for Malnax: cost model differences (Reserved/Savings Plans vs Azure Reserved Instances), performance patterns for common workloads, and DoD-specific factors (GovCloud IL5 vs Azure Government IL6/Secret regions). You now have both certs — write down what you actually believe, not just what the docs say" },
          ],
        },
      ],
    },
    {
      id: "p4",
      title: "Phase 4",
      subtitle: "DevSecOps + Malnax Maturation + Capture Readiness",
      dateRange: "Jul 2027 – Feb 2029",
      milestones: ["DevSecOps-ready resume", "CISSP study begins", "Malnax first engagement", "Cloud advisory memo finalized", "Capability statement v1", "Teaming research", "GCP/Oracle literacy", "Capture management primer", "Past-performance doc", "Job Transition Roadmap trigger"],
      weeks: [
        {
          id: "p4bd0", label: "BD Checkpoint", dates: "Jul 21–27, 2027",
          tasks: [
            { id: "p4bd0a", cat: "capture", text: "Draft a one-page Malnax capability statement skeleton — core competencies, differentiators, NAICS/PSC code placeholders, past-performance placeholder. Even with zero contracts yet, having the format ready removes friction before your first real engagement" },
            { id: "p4bd0b", cat: "capture", text: "CMMC 2.0 + NIST 800-171 primer: understand the 3 CMMC levels and the 110 NIST 800-171 control families at a category level. Awareness only — this is the compliance bar Malnax will eventually have to clear to touch CUI" },
          ],
        },
        {
          id: "p4cloud0", label: "Cloud Literacy Pass 1", dates: "Jul 28–Aug 3, 2027",
          tasks: [
            { id: "p4cloud0a", cat: "cloud", text: "GCP + Oracle Cloud literacy pass: create free-tier accounts, deploy one trivial resource in each (a Compute Engine instance, an OCI compute instance). Goal is orientation, not mastery — recognize console layout, core service names, and how their IAM models differ from AWS/Azure" },
          ],
        },
        {
          id: "p4m1", label: "Months 1–2", dates: "Aug–Sep 2027",
          tasks: [
            { id: "p4m1a", cat: "skill", text: "DevSecOps foundations: threat modeling (STRIDE framework), OWASP Top 10 applied to your own Malnax stack. Audit your site like an attacker would — then fix what you find" },
            { id: "p4m1b", cat: "skill", text: "Container security: image scanning with Trivy, least-privilege containers (non-root user, read-only filesystem), secrets management via AWS Secrets Manager — no secrets in code" },
            { id: "p4m1c", cat: "read",  text: "Good to Great (Jim Collins): what separates great engineers from good ones. Maps to your 'not just agentic' philosophy — the Hedgehog Concept applies directly to your career" },
          ],
        },
        {
          id: "p4bd1", label: "BD Checkpoint", dates: "Oct 2027",
          tasks: [
            { id: "p4bd1b", cat: "capture", text: "Research 3–5 potential teaming partners or subcontracting primes in the small-business IC/DoD space. Understand how SBA set-asides and subcontracting actually work — Malnax's realistic entry point is subbing, not prime contracts on day one" },
          ],
        },
        {
          id: "p4cloud1", label: "Cloud Literacy Pass 2", dates: "Nov 2027",
          tasks: [
            { id: "p4cloud1a", cat: "cloud", text: "Second pass on GCP/OCI: read through their IAM and networking docs side-by-side with AWS/Azure equivalents. No certs needed here — you need to be able to translate a client's GCP or Oracle environment into terms you already understand" },
          ],
        },
        {
          id: "p4m2", label: "Months 3–4", dates: "Dec 2027–Jan 2028",
          tasks: [
            { id: "p4m2a", cat: "skill",  text: "CI/CD security gates: add DAST scanning, dependency auditing (pip-audit, npm audit), container scanning to every Malnax pipeline run. Security is not a step — it's a gate" },
            { id: "p4m2b", cat: "python", text: "Python: write a Lambda function that audits IAM policies for overly permissive rules (admin:* attachments, public S3 buckets) and sends SNS alert. Real security automation in practice" },
            { id: "p4m2c", cat: "read",   text: "Crushing It (Gary V): read with a filter — take what applies to building Malnax brand and personal reputation in the IC/DoD space. Your credibility and network are your pipeline" },
          ],
        },
        {
          id: "p4cloudfinal", label: "Cloud Advisory Finalization", dates: "Feb 2028",
          tasks: [
            { id: "p4cloudfinala", cat: "cloud", text: "Finalize the AWS vs Azure (with GCP/Oracle notes) advisory memo as a real internal Malnax document. This is what lets you confidently point a future client toward the right platform based on their compliance tier, workload type, and budget — not a guess" },
          ],
        },
        {
          id: "p4m3", label: "Months 5–6", dates: "Feb–Mar 2028",
          tasks: [
            { id: "p4m3a", cat: "skill",   text: "IaC security: run Checkov against your Terraform/Bicep templates before every deploy. Understand the misconfigs it catches and why they're critical. Integrate as a CI/CD gate" },
            { id: "p4m3b", cat: "malnax",  text: "Malnax: Build out a portfolio/case studies section with technical depth — Malnax build journey, any GF's-parents engagement work (sanitized), Leidos-relevant patterns (sanitized). This is your living technical resume" },
            { id: "p4m3c", cat: "capture", text: "Capture management primer: read through the basics of GovCon capture (opportunity identification, teaming, proposal fundamentals). If the GF's-parents engagement is live by now, informally run it like a real capture — it's your first case study whether you label it that or not" },
            { id: "p4m3d", cat: "read",    text: "Crucial Conversations: as important as any cert on this list for the Principal Architect path. Client-facing IC work, leadership, and business development all require this skill" },
          ],
        },
        {
          id: "p4buf1", label: "Buffer / Catch-up", dates: "Apr 2028",
          tasks: [
            { id: "p4buf1a", cat: "buffer", text: "No new material this month. Use it to catch up, revisit anything shaky from Phase 3-4, or just breathe before the CISSP runway starts" },
          ],
        },
        {
          id: "p4m4", label: "Months 7–9", dates: "May–Jul 2028",
          tasks: [
            { id: "p4m4a", cat: "skill",   text: "Observability deep dive: difference between logging, monitoring, and observability. Distributed tracing, structured logging (JSON), CloudWatch Insights or Grafana dashboards" },
            { id: "p4m4b", cat: "biz",     text: "Malnax: if timing feels right, open the conversation with GF's parents about cloud optimization. Frame as a learning engagement. Document everything — one real engagement changes your credibility" },
            { id: "p4m4c", cat: "capture", text: "If the GF's-parents engagement has happened, document it as a formal past-performance write-up, formatted the way IC/DoD RFPs actually expect. This becomes Malnax's first real past-performance citation. Also evaluate whether a CMMC Level 1 self-assessment makes sense for Malnax yet" },
            { id: "p4m4d", cat: "read",    text: "Dare to Lead + The 5 Levels of Leadership: read together over 6–8 weeks. Leadership vocabulary becomes critical as you approach senior and principal-level roles and client conversations" },
          ],
        },
        {
          id: "p4m5", label: "Months 10–13", dates: "Aug 2028–Feb 2029",
          tasks: [
            { id: "p4m5a", cat: "cert",  text: "CISSP: begin formal study. AWS SAA + SAP + AZ-104 + AZ-305 + cybersec master's + Security+ + real IC SWE experience gives you a massive head start. Budget 6–9 months from here" },
            { id: "p4m5b", cat: "biz",   text: "Malnax readiness audit: website live on AWS, SAM.gov active + CAGE code obtained, business bank account open, professional email, portfolio populated, first engagement documented" },
            { id: "p4m5c", cat: "skill", text: "Career audit trigger: AWS SAA + SAP + AZ-104 + AZ-305 + Splunk PU + CISSP in progress + 2 yrs Leidos IC SWE — this is the point where the Job Transition Roadmap (built Aug 4, 2026) is meant to be opened and acted on, not this document" },
          ],
        },
      ],
    },
  ],
  createdAt: "2026-06-15T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
};
