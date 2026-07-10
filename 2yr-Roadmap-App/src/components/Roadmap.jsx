import { useState, useEffect } from "react";

const CAT = {
  cert:    { label: "Cert",    bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
  malnax:  { label: "Malnax",  bg: "var(--color-background-success)",   color: "var(--color-text-success)" },
  skill:   { label: "Skill",   bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
  read:    { label: "Read",    bg: "var(--color-background-warning)",   color: "var(--color-text-warning)" },
  linux:   { label: "Linux",   bg: "var(--color-background-danger)",    color: "var(--color-text-danger)" },
  python:  { label: "Python",  bg: "var(--color-background-info)",      color: "var(--color-text-info)" },
  ansible: { label: "Ansible", bg: "var(--color-background-success)",   color: "var(--color-text-success)" },
  biz:     { label: "Biz",     bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
};

const A = ["#0F6E56","#185FA5","#534AB7","#993C1D"];

const PHASES = [
  {
    id:"p1", title:"Phase 1", sub:"Post-SAA Momentum", range:"Jun 15 – Aug 2026",
    milestones:["Splunk Power User","Ansible foundations","Malnax live on CI/CD"],
    weeks:[
      { id:"p1w1", label:"Week 1", dates:"Jun 15–21", tasks:[
        {id:"p1w1a",cat:"malnax",text:"Fix deployment: write .gitlab-ci.yml that runs vercel deploy via Vercel CLI. Bypasses private repo cost and earns real CI/CD pipeline experience simultaneously"},
        {id:"p1w1b",cat:"cert",  text:"Splunk: Create free Splunk Education account, enroll in Splunk Fundamentals 1. Understand what Splunk actually does and why your environment uses it"},
        {id:"p1w1c",cat:"read",  text:"Resume ABCs of Real Estate Investing — target finishing this book by end of Phase 1 (Week 9)"},
      ]},
      { id:"p1w2", label:"Week 2", dates:"Jun 22–28", tasks:[
        {id:"p1w2a",cat:"cert",  text:"Splunk Fundamentals 1: searches, SPL syntax, data inputs, field extraction basics. Build intuition for how Splunk indexes and queries data"},
        {id:"p1w2b",cat:"malnax",text:"Malnax: Understand every file in your Vite project before touching code — index.html, vite.config.js, package.json, src/ structure. No black boxes"},
        {id:"p1w2c",cat:"read",  text:"ABCs of Real Estate: continue through chapters on evaluating deals and cash flow analysis"},
      ]},
      { id:"p1w3", label:"Week 3", dates:"Jun 29–Jul 5", tasks:[
        {id:"p1w3a",cat:"cert",   text:"Splunk: Begin Fundamentals 2 — transforming commands, lookups, scheduled alerts, dashboard panels"},
        {id:"p1w3b",cat:"ansible",text:"Ansible: Install on your machine, understand YAML syntax rules (indentation is everything), run first ad-hoc command against localhost"},
        {id:"p1w3c",cat:"malnax", text:"Malnax: Explain every component in your frontend skeleton out loud. If you can't explain what a file does and why it exists, research it before moving on"},
      ]},
      { id:"p1w4", label:"Week 4", dates:"Jul 6–12", tasks:[
        {id:"p1w4a",cat:"cert",   text:"Splunk Fundamentals 2: complete course — statistical commands, field aliases, calculated fields, data model overview"},
        {id:"p1w4b",cat:"ansible",text:"Ansible: Write first playbook — ping localhost, install a package, create a directory. Understand hosts, tasks, modules. Learn what idempotent means and why it matters"},
        {id:"p1w4c",cat:"malnax", text:"Malnax: Understand FastAPI structure line by line — what is a route, what is a request model, what does uvicorn do, why ASGI over WSGI"},
      ]},
      { id:"p1w5", label:"Week 5", dates:"Jul 13–19", tasks:[
        {id:"p1w5a",cat:"cert",   text:"Splunk Power User content: knowledge objects, regex field extraction, event types, tags, data model acceleration — the exam-specific material"},
        {id:"p1w5b",cat:"ansible",text:"Ansible: Roles directory structure, variables, conditionals (when:), handlers. Understand the difference between a task and a handler"},
        {id:"p1w5c",cat:"malnax", text:"Malnax: Write first FastAPI endpoint — a /health route returning JSON. Test with curl. Understand the full HTTP request/response cycle"},
      ]},
      { id:"p1w6", label:"Week 6", dates:"Jul 20–26", tasks:[
        {id:"p1w6a",cat:"cert",   text:"Splunk: Practice Power User exam questions. Identify weak areas, revisit Fundamentals 1/2 for each specific gap you find"},
        {id:"p1w6b",cat:"ansible",text:"Ansible: Docker + Ansible integration — write a playbook that pulls and runs a container. Understand how Ansible fits a deployment pipeline"},
        {id:"p1w6c",cat:"malnax", text:"Malnax: Connect frontend to backend — call your /health endpoint from Vite app, display the response. This is your first full-stack moment"},
      ]},
      { id:"p1w7", label:"Week 7", dates:"Jul 27–Aug 2", tasks:[
        {id:"p1w7a",cat:"cert",  text:"Splunk: Final review and timed mock exams. Register for the actual exam this week"},
        {id:"p1w7b",cat:"linux", text:"Linux foundations (1hr): filesystem hierarchy (/etc /var /usr /home), navigation (ls, cd, pwd, find, grep), permissions (chmod, chown, rwx model)"},
        {id:"p1w7c",cat:"malnax",text:"Malnax: Add a build stage (vite build) and deploy stage (vercel deploy via CLI) to .gitlab-ci.yml. Get the pipeline running green end-to-end"},
      ]},
      { id:"p1w8", label:"Week 8", dates:"Aug 3–9", tasks:[
        {id:"p1w8a",cat:"cert",  text:"🎯 SIT FOR SPLUNK POWER USER EXAM this week"},
        {id:"p1w8b",cat:"linux", text:"Linux: processes (ps, top, kill), users and groups (useradd, usermod), basic shell scripting — variables, loops, conditionals, exit codes"},
        {id:"p1w8c",cat:"malnax",text:"Malnax: Add second page/route to frontend (e.g. /services or /about). Understand client-side routing — what actually happens during navigation"},
      ]},
      { id:"p1w9", label:"Week 9", dates:"Aug 10–16", tasks:[
        {id:"p1w9a",cat:"cert",  text:"SAP: Download official exam guide, map 4 domains (Org Complexity 26% / New Solutions 29% / Migration 25% / Cost 20%). Order Adrian Cantrill SAP course"},
        {id:"p1w9b",cat:"linux", text:"Linux: networking basics (ping, curl, netstat, /etc/hosts, /etc/resolv.conf), package managers (apt/yum), understanding running services"},
        {id:"p1w9c",cat:"read",  text:"Finish ABCs of Real Estate Investing. Begin Book on Rental Property Investing"},
      ]},
    ]
  },
  {
    id:"p2", title:"Phase 2", sub:"AWS SAP Deep Dive", range:"Aug 17 – Jan 2027",
    milestones:["AWS SAP ✓","Linux fluency","Python + boto3","Malnax v1 deployed"],
    weeks:[
      { id:"p2w1", label:"Weeks 1–2", dates:"Aug 17–30", tasks:[
        {id:"p2w1a",cat:"cert",  text:"SAP orientation: understand how SAP differs from SAA — design thinking vs service knowledge. Map domain weights to a study schedule around your 3hr/week floor"},
        {id:"p2w1b",cat:"skill", text:"Study one real AWS reference architecture end-to-end: multi-account landing zone, Transit Gateway, VPC design. Understand why each piece exists before domains begin"},
        {id:"p2w1c",cat:"read",  text:"Book on Rental Property Investing: continue — cash flow analysis, cap rate, deal evaluation, property management basics"},
      ]},
      { id:"p2w2", label:"Weeks 3–6", dates:"Aug 31–Sep 27", tasks:[
        {id:"p2w2a",cat:"cert",  text:"SAP Domain 1 — Organizational Complexity: multi-account strategy, AWS Organizations, SCPs, networking deep dive (Transit Gateway, Direct Connect, VPN, Route 53 Resolver)"},
        {id:"p2w2b",cat:"linux", text:"Linux: systemd services (start/stop/enable/status), cron jobs (crontab syntax), log files (/var/log), SSH config and key-based auth setup"},
        {id:"p2w2c",cat:"malnax",text:"Malnax: Containerize backend with Docker — write Dockerfile line by line, understand every instruction (FROM, RUN, COPY, EXPOSE, CMD). Deploy container to Render"},
      ]},
      { id:"p2w3", label:"Weeks 7–10", dates:"Sep 28–Oct 25", tasks:[
        {id:"p2w3a",cat:"cert",  text:"SAP Domain 2 — New Solutions: HA patterns, DR strategies (pilot light, warm standby, multi-site), event-driven architecture (SQS/SNS/EventBridge decoupling patterns)"},
        {id:"p2w3b",cat:"python",text:"Python + boto3: write scripts that list S3 buckets, describe EC2 instances, check IAM users. Understand the AWS SDK pattern — credentials, clients, paginators, error handling"},
        {id:"p2w3c",cat:"malnax",text:"Malnax: Add contact/inquiry form to frontend. Handle POST endpoint in FastAPI. Understand HTTP methods, status codes, request validation with Pydantic"},
      ]},
      { id:"p2w4", label:"Weeks 11–13", dates:"Oct 26–Nov 15", tasks:[
        {id:"p2w4a",cat:"cert",  text:"SAP Domain 3 — Migration Planning: 7 Rs of migration (rehost, replatform, refactor, etc.), AWS Migration Hub, DMS, Server Migration Service, hybrid networking patterns"},
        {id:"p2w4b",cat:"python",text:"Python: write a monitoring script that checks an AWS resource via CloudWatch and sends SNS alert if threshold exceeded. Understand the logging module and structured log output"},
        {id:"p2w4c",cat:"linux", text:"Linux: environment variables, .bashrc vs .bash_profile, PATH manipulation, writing reusable bash functions, error handling in scripts (set -e, trap)"},
      ]},
      { id:"p2w5", label:"Weeks 14–16", dates:"Nov 16–Dec 6", tasks:[
        {id:"p2w5a",cat:"cert",  text:"SAP Domain 4 — Cost Optimization: pricing models (On-Demand vs Reserved vs Spot vs Savings Plans), Cost Explorer, AWS Budgets, Trusted Advisor, Compute Optimizer"},
        {id:"p2w5b",cat:"skill", text:"CI/CD deep dive: trace a full pipeline source → build → test → deploy. Understand build artifacts, environment variables in pipelines, rollback strategies, approval gates"},
        {id:"p2w5c",cat:"read",  text:"Tax-Free Wealth (Tom Wheelwright): begin — directly applicable to Malnax LLC tax strategy, depreciation, QBI deduction for pass-through entities, business expense strategy"},
      ]},
      { id:"p2w6", label:"Weeks 17–18", dates:"Dec 7–20", tasks:[
        {id:"p2w6a",cat:"cert",  text:"SAP: Full timed mock exams on TutorialsDojo. Target consistent 78%+ before sitting. For every wrong answer: read the actual AWS doc page, not just the explanation"},
        {id:"p2w6b",cat:"malnax",text:"Malnax v1 review: document every file, function, and route. Write a README that explains the entire stack to a stranger. This tests whether your Socratic approach actually worked"},
        {id:"p2w6c",cat:"read",  text:"Tax-Free Wealth: continue. Note every strategy applicable to your situation — LLC structure, home office, equipment depreciation, self-employment considerations"},
      ]},
      { id:"p2w7", label:"Weeks 19–20", dates:"Dec 21–Jan 10 2027", tasks:[
        {id:"p2w7a",cat:"cert",  text:"🎯 SIT FOR AWS SAP — target December 2026. If mock scores below 78% consistently, flex to January 2027. Do not sit until you're scoring ready"},
        {id:"p2w7b",cat:"read",  text:"The Lean Startup (Eric Ries): begin — MVP thinking, validated learning, build-measure-learn. Core mental model for how you structure Malnax service offerings"},
        {id:"p2w7c",cat:"malnax",text:"Malnax: Plan v2 — what dynamic features would make this site useful? (case studies, blog, inquiry form with DB, admin panel). Scope before building"},
      ]},
    ]
  },
  {
    id:"p3", title:"Phase 3", sub:"Recovery + AZ-305", range:"Feb – Jun 2027",
    milestones:["AZ-305 ✓","IaC hands-on","Malnax on AWS","DevSecOps preview"],
    weeks:[
      { id:"p3b1", label:"Break: Weeks 1–3", dates:"Feb 1–21", tasks:[
        {id:"p3b1a",cat:"skill", text:"Cert break — no exam prep. Review everything built since June: Splunk knowledge, SAP architecture patterns, Python scripts, Malnax codebase. What real gaps stand out?"},
        {id:"p3b1b",cat:"skill", text:"ARM templates: understand JSON structure (parameters, variables, resources, outputs, dependsOn). Deploy a resource group + storage account via ARM. Understand why IaC matters"},
        {id:"p3b1c",cat:"read",  text:"Principles (Ray Dalio): begin — decision-making frameworks, radical transparency. High leverage reading during a reflection period between major cert grinds"},
      ]},
      { id:"p3b2", label:"Break: Weeks 4–6", dates:"Feb 22–Mar 14", tasks:[
        {id:"p3b2a",cat:"skill", text:"Bicep: rewrite your ARM template in Bicep syntax. Understand why Bicep exists — cleaner syntax, same ARM engine underneath. Compare both deployments and understand the tradeoffs"},
        {id:"p3b2b",cat:"python",text:"Python: build a real utility — e.g. a daily AWS cost logger to CSV, or a Malnax uptime monitor that pings your site hourly and logs status"},
        {id:"p3b2c",cat:"read",  text:"Start With Why (Simon Sinek): apply the Golden Circle to Malnax — what is your Why? This directly informs how you pitch services to IC/DoD clients when the time comes"},
      ]},
      { id:"p3w1", label:"AZ-305: Weeks 7–8", dates:"Mar 15–28", tasks:[
        {id:"p3w1a",cat:"cert",  text:"AZ-305: Governance foundation from AZ-104 base — management groups, subscriptions, Azure Policy, RBAC. Shift to design-level thinking: not 'how to configure' but 'when and why'"},
        {id:"p3w1b",cat:"malnax",text:"Malnax v2: Add PostgreSQL database via FastAPI + SQLAlchemy. Understand ORM — models, sessions, queries. First real persistent data layer is a significant architectural step"},
        {id:"p3w1c",cat:"read",  text:"The E-Myth Revisited (Gerber): most important book on the list for Malnax. The technician vs manager vs entrepreneur distinction will permanently change how you think about building a business"},
      ]},
      { id:"p3w2", label:"AZ-305: Weeks 9–11", dates:"Mar 29–Apr 18", tasks:[
        {id:"p3w2a",cat:"cert",  text:"AZ-305: Identity and security (Entra ID, MFA, Conditional Access, PIM, Defender for Cloud), monitoring (Azure Monitor, Log Analytics workspace, alerts and action groups)"},
        {id:"p3w2b",cat:"skill", text:"Terraform basics (no cert): HCL syntax, state files, terraform plan/apply/destroy. Provision an Azure resource group. Understand Terraform vs ARM/Bicep — when you'd pick each"},
        {id:"p3w2c",cat:"malnax",text:"Malnax: Add JWT auth to admin section of FastAPI. Understand token-based auth — access tokens, refresh tokens, where to store on frontend (httpOnly cookie vs localStorage and why it matters)"},
      ]},
      { id:"p3w3", label:"AZ-305: Weeks 12–14", dates:"Apr 19–May 9", tasks:[
        {id:"p3w3a",cat:"cert",  text:"AZ-305: Infrastructure solutions — VM patterns, storage types (blob vs files vs disk), VNets, load balancing (ALB vs AGW), CDN, private endpoints. Scenario-based design thinking"},
        {id:"p3w3b",cat:"linux", text:"Linux scripting: write a multi-step deployment script (build → test → copy artifacts → restart service). Error handling with set -e, trap, exit codes, logging to file"},
        {id:"p3w3c",cat:"read",  text:"Financial Freedom (Grant Sabatier): savings rate optimization, FI number calculation, investment layering strategies. Reinforces your compounding roadmap with specific tactics"},
      ]},
      { id:"p3w4", label:"AZ-305: Weeks 15–17", dates:"May 10–30", tasks:[
        {id:"p3w4a",cat:"cert",  text:"AZ-305: Application architecture (App Service, AKS intro, API Management, Service Bus, Event Grid), data solutions (Cosmos DB vs Azure SQL — when and why each)"},
        {id:"p3w4b",cat:"skill", text:"DevSecOps preview: integrate SAST scanning into Malnax GitLab pipeline — Bandit for Python, ESLint security plugin for JS. Security as a gate, not an afterthought"},
        {id:"p3w4c",cat:"malnax",text:"Malnax: Migrate from Render/Vercel to AWS — FastAPI to EC2 or Lambda, frontend to S3 + CloudFront. Apply your SAP architecture knowledge to your own production deployment"},
      ]},
      { id:"p3w5", label:"AZ-305: Weeks 18–20", dates:"May 31–Jun 20", tasks:[
        {id:"p3w5a",cat:"cert",  text:"🎯 SIT FOR AZ-305 — final mock exams (MeasureUp recommended), target 80%+. AWS SAA + SAP + AZ-104 + AZ-305 is a serious multi-cloud credential stack at this point"},
        {id:"p3w5b",cat:"malnax",text:"Malnax full audit: site live on AWS, CI/CD deploys on push, frontend + backend connected, DB persisting, auth working, security scanning in pipeline. Document all of it"},
        {id:"p3w5c",cat:"biz",   text:"Malnax business ops: open business bank account, set up Zoho Mail (nick@malnax.com), update SAM.gov profile with new credentials. Malnax starts looking like a real company"},
      ]},
    ]
  },
  {
    id:"p4", title:"Phase 4", sub:"DevSecOps + Malnax Maturation", range:"Jul 2027 – Jun 2028",
    milestones:["DevSecOps-ready resume","CISSP study begins","Malnax first engagement","Job transition window"],
    weeks:[
      { id:"p4m1", label:"Months 1–2", dates:"Jul–Aug 2027", tasks:[
        {id:"p4m1a",cat:"skill", text:"DevSecOps foundations: threat modeling (STRIDE framework), OWASP Top 10 applied to your own Malnax stack. Audit your site like an attacker would — then fix what you find"},
        {id:"p4m1b",cat:"skill", text:"Container security: image scanning with Trivy, least-privilege containers (non-root user, read-only filesystem), secrets management via AWS Secrets Manager — no secrets in code"},
        {id:"p4m1c",cat:"read",  text:"Good to Great (Jim Collins): what separates great engineers from good ones. Maps to your 'not just agentic' philosophy — the Hedgehog Concept applies directly to your career"},
      ]},
      { id:"p4m2", label:"Months 3–4", dates:"Sep–Oct 2027", tasks:[
        {id:"p4m2a",cat:"skill", text:"CI/CD security gates: add DAST scanning, dependency auditing (pip-audit, npm audit), container scanning to every Malnax pipeline run. Security is not a step — it's a gate"},
        {id:"p4m2b",cat:"python",text:"Python: write a Lambda function that audits IAM policies for overly permissive rules (admin:* attachments, public S3 buckets) and sends SNS alert. Real security automation in practice"},
        {id:"p4m2c",cat:"read",  text:"Crushing It (Gary V): read with a filter — take what applies to building Malnax brand and personal reputation in the IC/DoD space. Your credibility and network are your pipeline"},
      ]},
      { id:"p4m3", label:"Months 5–6", dates:"Nov–Dec 2027", tasks:[
        {id:"p4m3a",cat:"skill", text:"IaC security: run Checkov against your Terraform/Bicep templates before every deploy. Understand the misconfigs it catches and why they're critical. Integrate as a CI/CD gate"},
        {id:"p4m3b",cat:"malnax",text:"Malnax: Build out a portfolio/case studies section with technical depth — Malnax build journey, any GF parents company work, Leidos-relevant patterns (sanitized). This is your living technical resume"},
        {id:"p4m3c",cat:"read",  text:"Crucial Conversations: as important as any cert on this list for the Principal Architect path. Client-facing IC work, leadership, and business development all require this skill"},
      ]},
      { id:"p4m4", label:"Months 7–9", dates:"Jan–Mar 2028", tasks:[
        {id:"p4m4a",cat:"skill", text:"Observability deep dive: difference between logging, monitoring, and observability. Distributed tracing, structured logging (JSON), CloudWatch Insights or Grafana dashboards"},
        {id:"p4m4b",cat:"biz",   text:"Malnax: If timing feels right, open the conversation with GF's parents about cloud optimization. Frame as a learning engagement. Document everything — one real engagement changes your credibility"},
        {id:"p4m4c",cat:"read",  text:"Dare to Lead + 5 Levels of Leadership: read together over 6–8 weeks. Leadership vocabulary becomes critical as you approach senior and principal-level roles and client conversations"},
      ]},
      { id:"p4m5", label:"Months 10–12", dates:"Apr–Jun 2028", tasks:[
        {id:"p4m5a",cat:"cert",  text:"CISSP: Begin formal study. AWS SAA + SAP + AZ-104 + AZ-305 + cybersec master's + Security+ + real IC SWE experience gives you a massive head start. Budget 6–9 months from here"},
        {id:"p4m5b",cat:"biz",   text:"Malnax readiness audit: website live on AWS, SAM.gov active + CAGE code obtained, business bank account open, professional email, portfolio populated, first engagement documented"},
        {id:"p4m5c",cat:"skill", text:"Career audit: AWS SAA + SAP + AZ-104 + AZ-305 + Splunk PU + CISSP in progress + 2 yrs Leidos IC SWE. DevSecOps roles are accessible. Evaluate the market — what's the move?"},
      ]},
    ]
  },
];

const STORAGE_KEY = "nick-roadmap-v1";

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState(0);
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setChecked(JSON.parse(stored));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const toggle = async (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const allTasks = PHASES.flatMap(p => p.weeks.flatMap(w => w.tasks));
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => checked[t.id]).length;
  const pct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const phase = PHASES[activePhase];
  const phaseTasks = phase.weeks.flatMap(w => w.tasks);
  const phaseDone = phaseTasks.filter(t => checked[t.id]).length;
  const phaseTotal = phaseTasks.length;
  const accent = A[activePhase];

  if (!loaded) return (
    <div style={{padding:"2rem",color:"var(--color-text-secondary)",fontSize:"14px"}}>Loading your roadmap...</div>
  );

  return (
    <div style={{padding:"1rem 0",fontFamily:"var(--font-sans)"}}>
      <h2 style={{fontSize:"18px",fontWeight:500,margin:"0 0 3px",color:"var(--color-text-primary)"}}>
        Nick's 2-Year Engineering Roadmap
      </h2>
      <p style={{fontSize:"13px",color:"var(--color-text-secondary)",margin:"0 0 1rem"}}>Jun 2026 – Jun 2028</p>

      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"1.5rem"}}>
        <div style={{flex:1,height:"5px",background:"var(--color-background-secondary)",borderRadius:"3px",overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:"#0F6E56",borderRadius:"3px",transition:"width 0.3s"}} />
        </div>
        <span style={{fontSize:"12px",color:"var(--color-text-secondary)",flexShrink:0}}>
          {completedTasks}/{totalTasks} · {pct}%
        </span>
      </div>

      <div style={{display:"flex",gap:"8px",marginBottom:"1.5rem",overflowX:"auto",paddingBottom:"4px"}}>
        {PHASES.map((p,i) => {
          const phT = p.weeks.flatMap(w => w.tasks);
          const phD = phT.filter(t => checked[t.id]).length;
          return (
            <button key={p.id} onClick={() => setActivePhase(i)} style={{
              padding:"6px 14px",borderRadius:"var(--border-radius-md)",fontSize:"13px",flexShrink:0,
              border:`1px solid ${activePhase===i ? A[i] : "var(--color-border-tertiary)"}`,
              background:"transparent",color:activePhase===i ? A[i] : "var(--color-text-secondary)",
              cursor:"pointer",fontWeight:activePhase===i ? 500 : 400,
            }}>
              {p.title}
              {phD > 0 && phD < phT.length && (
                <span style={{marginLeft:"6px",fontSize:"10px",opacity:0.7}}>{phD}/{phT.length}</span>
              )}
              {phD === phT.length && phT.length > 0 && (
                <span style={{marginLeft:"5px",fontSize:"11px"}}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{borderLeft:`3px solid ${accent}`,paddingLeft:"14px",marginBottom:"1.25rem"}}>
        <p style={{margin:0,fontSize:"15px",fontWeight:500,color:"var(--color-text-primary)"}}>{phase.sub}</p>
        <p style={{margin:"2px 0 8px",fontSize:"12px",color:"var(--color-text-secondary)"}}>
          {phase.range} · {phaseDone}/{phaseTotal} complete
        </p>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {phase.milestones.map((m,i) => (
            <span key={i} style={{fontSize:"11px",padding:"2px 8px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",color:"var(--color-text-secondary)"}}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {phase.weeks.map((week) => {
          const wDone = week.tasks.filter(t => checked[t.id]).length;
          const wComplete = wDone === week.tasks.length;
          return (
            <div key={week.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
              <div style={{padding:"8px 14px",background:"var(--color-background-secondary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontSize:"13px",fontWeight:500,color:"var(--color-text-primary)"}}>{week.label}</span>
                  <span style={{fontSize:"11px",color:"var(--color-text-secondary)",marginLeft:"8px"}}>{week.dates}</span>
                </div>
                <span style={{fontSize:"11px",color:wComplete?"var(--color-text-success)":"var(--color-text-secondary)"}}>
                  {wDone}/{week.tasks.length}{wComplete ? " ✓" : ""}
                </span>
              </div>
              {week.tasks.map((task) => (
                <div key={task.id} onClick={() => toggle(task.id)}
                  style={{padding:"10px 14px",display:"flex",gap:"10px",alignItems:"flex-start",cursor:"pointer",borderTop:"0.5px solid var(--color-border-tertiary)",background:"transparent"}}
                  onMouseEnter={e => e.currentTarget.style.background="var(--color-background-secondary)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <div style={{width:"15px",height:"15px",borderRadius:"3px",flexShrink:0,marginTop:"2px",border:`1.5px solid ${checked[task.id] ? accent : "var(--color-border-secondary)"}`,background:checked[task.id] ? accent : "transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                    {checked[task.id] && <span style={{fontSize:"10px",color:"white",lineHeight:1}}>✓</span>}
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"flex-start",flex:1,minWidth:0}}>
                    <span style={{fontSize:"10px",padding:"2px 6px",borderRadius:"3px",fontWeight:500,flexShrink:0,marginTop:"2px",background:CAT[task.cat]?.bg,color:CAT[task.cat]?.color}}>
                      {CAT[task.cat]?.label}
                    </span>
                    <span style={{fontSize:"13px",lineHeight:"1.55",color:checked[task.id]?"var(--color-text-tertiary)":"var(--color-text-primary)",textDecoration:checked[task.id]?"line-through":"none"}}>
                      {task.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{marginTop:"1.5rem",padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",fontSize:"12px",color:"var(--color-text-secondary)",lineHeight:"1.6"}}>
        <span style={{fontWeight:500,color:"var(--color-text-primary)"}}>Reading track: </span>
        P1: ABCs of RE + Rental Property · P2: Tax-Free Wealth + Lean Startup · P3: Principles + Start With Why + E-Myth + Financial Freedom · P4: Good to Great + Crushing It + Crucial Conversations + Dare to Lead + 5 Levels
      </div>
    </div>
  );
}
