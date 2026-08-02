import { useState, useEffect } from "react";
import { useProgressStore } from "../hooks/useProgressStore.js";

/* ─── Data ─── */
const CAT = {
  debt: { label: "Debt", bg: "var(--color-background-danger)", color: "var(--color-text-danger)" },
  roth: { label: "Roth", bg: "var(--color-background-info)", color: "var(--color-text-info)" },
  k401: { label: "401k", bg: "var(--color-background-info)", color: "var(--color-text-info)" },
  hysa: { label: "HYSA", bg: "var(--color-background-warning)", color: "var(--color-text-warning)" },
  cma: { label: "CMA", bg: "var(--color-background-success)", color: "var(--color-text-success)" },
  credit: { label: "Credit", bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
  malnax: { label: "Malnax", bg: "var(--color-background-success)", color: "var(--color-text-success)" },
  life: { label: "Life", bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
  moveout: { label: "Move-Out", bg: "var(--color-background-warning)", color: "var(--color-text-warning)" },
  re: { label: "Real Estate", bg: "var(--color-background-danger)", color: "var(--color-text-danger)" },
  career: { label: "Career", bg: "var(--color-background-info)", color: "var(--color-text-info)" },
};

const A = ["#0F6E56", "#185FA5", "#534AB7", "#993C1D"];

const PHASES = [
  {
    id: "p1", title: "Phase 1", sub: "Foundation Sprint", range: "Jul – Dec 2026",
    milestones: ["Student loan → $0", "2026 Roth maxed", "Move-out reqs complete", "CMA foundation building"],
    groups: [
      { id: "p1g1", label: "Debt Elimination", tasks: [
        { id: "p1g1a", cat: "debt", text: "Direct all excess cash above NFCU ($12k) / USAA ($4k) maxes to student loan principal every month" },
        { id: "p1g1b", cat: "debt", text: "Hard deadline: mass payoff of any remaining balance by Dec 1, 2026 regardless of pace" },
        { id: "p1g1c", cat: "debt", text: "Confirm $0 balance and close out loan servicing account" },
      ]},
      { id: "p1g2", label: "Retirement", tasks: [
        { id: "p1g2a", cat: "roth", text: "Max 2026 Roth IRA ($7,000 total) in FXAIX once debt is cleared" },
        { id: "p1g2b", cat: "k401", text: "Roth 401k active at 6% into Vanguard Institutional 500 Index Trust A — confirmed immediate vesting" },
        { id: "p1g2c", cat: "roth", text: "Begin 2027 Roth IRA contributions, target $3k+ before move-out" },
        { id: "p1g2d", cat: "k401", text: "Add beneficiaries to Roth 401k (Empower) and Roth IRA (Fidelity) — parents 50/50 primary" },
      ]},
      { id: "p1g3", label: "Move-Out Requirements (in order)", tasks: [
        { id: "p1g3a", cat: "moveout", text: "1. Student loans fully paid off" },
        { id: "p1g3b", cat: "moveout", text: "2. Roth IRA maxed for 2026 + $3k contributed to 2027" },
        { id: "p1g3c", cat: "moveout", text: "3. HYSA at $15k e-fund + $5k move-in fund ($20k total)" },
        { id: "p1g3d", cat: "moveout", text: "4. Net worth reaches $100,000" },
      ]},
      { id: "p1g4", label: "CMA — Phase 1 (Foundation)", tasks: [
        { id: "p1g4a", cat: "cma", text: "Continue $382/mo \"pay myself\" split evenly BRKB / SCHD on the 15th" },
        { id: "p1g4b", cat: "cma", text: "Reach $10,000 total foundation balance to trigger Phase 2" },
        { id: "p1g4c", cat: "cma", text: "Log share counts (BRKB + SCHD) each quarterly review" },
      ]},
      { id: "p1g5", label: "Admin & Housekeeping", tasks: [
        { id: "p1g5a", cat: "hysa", text: "Decide on formal HYSA max balance policy vs. redirecting excess to CMA" },
        { id: "p1g5b", cat: "credit", text: "Keep Cash Rewards Plus + More Rewards active — hold off on Flagship until move-out" },
        { id: "p1g5c", cat: "malnax", text: "Hold off on Malnax business credit card until real transactions exist — verify bureau reporting before applying" },
      ]},
    ],
  },
  {
    id: "p2", title: "Phase 2", sub: "Independence + Sequencing", range: "Jan 2027 – Dec 2028",
    milestones: ["Moved out", "CMA hits $10k", "MSFT → NEE → JPM → COST sequence", "Flagship card upgrade"],
    groups: [
      { id: "p2g1", label: "Housing Transition", tasks: [
        { id: "p2g1a", cat: "life", text: "Move out once all 4 move-out requirements are satisfied" },
        { id: "p2g1b", cat: "life", text: "Re-evaluate NFCU/USAA direct deposit split and account maxes for independent living (bills vs. spending separation)" },
        { id: "p2g1c", cat: "life", text: "Finalize 1BR lease and fold rent into monthly waterfall math" },
      ]},
      { id: "p2g2", label: "CMA — Phase 2 (Sequential Growth Stocks)", tasks: [
        { id: "p2g2a", cat: "cma", text: "Shift to 80% individual stock / 20% foundation (10% SCHD / 10% BRKB) once CMA hits $10k" },
        { id: "p2g2b", cat: "cma", text: "Sequence 1: Build MSFT position to $3,000" },
        { id: "p2g2c", cat: "cma", text: "Sequence 2: Build NEE position to $3,000" },
        { id: "p2g2d", cat: "cma", text: "Sequence 3: Build JPM position to $3,000" },
        { id: "p2g2e", cat: "cma", text: "Sequence 4: Build COST position to $3,000" },
      ]},
      { id: "p2g3", label: "Credit", tasks: [
        { id: "p2g3a", cat: "credit", text: "Request NFCU product change: Cash Rewards Plus → Flagship (~Mar 2027, no new inquiry/account age)" },
        { id: "p2g3b", cat: "credit", text: "Request credit limit increase after 6–12 months at $100k+ income" },
      ]},
      { id: "p2g4", label: "Career", tasks: [
        { id: "p2g4a", cat: "career", text: "Track 3-year mark at Leidos — evaluate next move per career principle" },
        { id: "p2g4b", cat: "career", text: "Confirm vesting schedule + Roth 401k availability in writing before accepting next offer" },
        { id: "p2g4c", cat: "k401", text: "Execute clean Roth 401k → Roth IRA direct rollover on departure (sell plan fund, repurchase FXAIX)" },
      ]},
      { id: "p2g5", label: "Malnax", tasks: [
        { id: "p2g5a", cat: "malnax", text: "Finalize Malnax Business Roadmap (banking + SAM.gov settled)" },
        { id: "p2g5b", cat: "malnax", text: "Complete Zoho DNS config + website cleanup (remove placeholder content)" },
        { id: "p2g5c", cat: "malnax", text: "Reassess business credit card (Chase Ink or similar that reports to D&B) once real revenue exists" },
      ]},
    ],
  },
  {
    id: "p3", title: "Phase 3", sub: "Scaling Years", range: "2029 – 2035",
    milestones: ["Phase 3 rebalance (80/20)", "Real estate re-evaluated", "Vehicle upgrade window", "Net worth $700k–1.1M"],
    groups: [
      { id: "p3g1", label: "CMA — Phase 3 (Rebalance)", tasks: [
        { id: "p3g1a", cat: "cma", text: "Once all 4 individual stocks hit $3k, rebalance to 80% foundation (40% SCHD / 40% BRKB) / 20% individual (5% each)" },
        { id: "p3g1b", cat: "cma", text: "Annual check: confirm no material BRKB overlap has emerged in MSFT/NEE/JPM/COST" },
        { id: "p3g1c", cat: "cma", text: "Diversify Roth IRA — add international index fund + REIT allocation" },
      ]},
      { id: "p3g2", label: "Real Estate", tasks: [
        { id: "p3g2a", cat: "re", text: "Revisit ODU/Norfolk rental property plan (target window: age 28–30)" },
        { id: "p3g2b", cat: "re", text: "Confirm 20% down payment saved to avoid PMI" },
        { id: "p3g2c", cat: "re", text: "Separate repair fund ($5k target) from personal emergency fund once purchased" },
        { id: "p3g2d", cat: "re", text: "Factor in vacancy assumption (1–2 months/yr) and property management cost if not self-managing" },
      ]},
      { id: "p3g3", label: "Lifestyle Milestones", tasks: [
        { id: "p3g3a", cat: "life", text: "Corolla end-of-life vehicle purchase (~$55k SUV) — only after liquidity + cash flow + disruption checks pass" },
        { id: "p3g3b", cat: "life", text: "$1M net worth watch purchase — cap at 3% of net worth (Rolex-tier)" },
      ]},
      { id: "p3g4", label: "Career", tasks: [
        { id: "p3g4a", cat: "career", text: "Target Solutions / Systems Architect track" },
        { id: "p3g4b", cat: "career", text: "CISSP study and certification" },
      ]},
    ],
  },
  {
    id: "p4", title: "Phase 4", sub: "Principal Track + $5M Push", range: "2036 – 2046",
    milestones: ["Principal/Architect comp", "Full portfolio maturity", "$2M by ~44", "$5M ultimate goal"],
    groups: [
      { id: "p4g1", label: "Portfolio Maturity", tasks: [
        { id: "p4g1a", cat: "cma", text: "Maintain never-sell discipline across CMA + Roth through every market cycle" },
        { id: "p4g1b", cat: "roth", text: "Continue quarterly net worth tracking without interruption" },
      ]},
      { id: "p4g2", label: "Malnax / Business", tasks: [
        { id: "p4g2a", cat: "malnax", text: "Evaluate Malnax growth into multi-employee prime contractor" },
        { id: "p4g2b", cat: "malnax", text: "S-corp election once net income justifies it" },
      ]},
      { id: "p4g3", label: "Net Worth Milestones", tasks: [
        { id: "p4g3a", cat: "life", text: "$2,000,000 net worth checkpoint" },
        { id: "p4g3b", cat: "life", text: "$5,000,000 net worth — ultimate 20-year goal" },
      ]},
    ],
  },
];

const RULES = [
  "Zero consumer debt — every card balance paid in full, every month, always.",
  "Max Roth IRA every year without exception — resets to top priority every Jan 1st.",
  "Never hold idle cash above defined account maximums.",
  "Always capture the full employer 401k match before anything else.",
  "Verify vesting schedule in writing before every job departure.",
  "CMA positions are never sold — foundation and growth stocks ride permanently.",
  "Quarterly net worth review — every Jan 10, Apr 10, Jul 10, Oct 10.",
  "Never stay in the same position at the same company more than 3 years.",
  "Reward yourself intentionally at earned milestones — discipline is the vehicle, not the destination.",
];

const INITIAL_LOG = [
  { date: "Jan 2025", netWorth: "-13,571", salary: "45,000", debt: "45,000", credit: "-" },
  { date: "Jan 10 2026", netWorth: "7,000", salary: "45,000", debt: "27,000", credit: "785" },
  { date: "Apr 10 2026", netWorth: "14,834", salary: "100,000", debt: "24,000", credit: "785" },
  { date: "Jul 10 2026", netWorth: "27,129", salary: "100,000", debt: "15,206", credit: "770" },
];

const NW_STORAGE_KEY = "financial-roadmap-networth-log";

const GROUP_ICONS = {
  "Debt Elimination": "💰",
  "Retirement": "📈",
  "Move-Out Requirements (in order)": "🏠",
  "CMA — Phase 1 (Foundation)": "📈",
  "Admin & Housekeeping": "📋",
  "Housing Transition": "🏠",
  "CMA — Phase 2 (Sequential Growth Stocks)": "📈",
  "Credit": "💳",
  "Career": "🏢",
  "Malnax": "🏢",
  "CMA — Phase 3 (Rebalance)": "📈",
  "Real Estate": "🏠",
  "Lifestyle Milestones": "📋",
  "Portfolio Maturity": "📈",
  "Malnax / Business": "🏢",
  "Net Worth Milestones": "📊",
};

/* ─── Component ─── */
export default function FinancialRoadmap() {
  const { progress, toggle } = useProgressStore("financial-masterplan");
  const [activePhase, setActivePhase] = useState(0);
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "rules" | "history"
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "rules" | "log"
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Net worth log — persisted separately in localStorage
  const [log, setLog] = useState(() => {
    try {
      const raw = localStorage.getItem(NW_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_LOG;
    } catch {
      return INITIAL_LOG;
    }
  });
  const [logDraft, setLogDraft] = useState({ date: "", netWorth: "", salary: "", debt: "", credit: "" });

  useEffect(() => {
    try {
      localStorage.setItem(NW_STORAGE_KEY, JSON.stringify(log));
    } catch { /* ignore */ }
  }, [log]);

  // Overall progress
  const allTasks = PHASES.flatMap(p => p.groups.flatMap(g => g.tasks));
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => progress[t.id]).length;

  // Active phase data
  const phase = PHASES[activePhase];
  const phaseTasks = phase.groups.flatMap(g => g.tasks);
  const phaseDone = phaseTasks.filter(t => progress[t.id]).length;
  const phaseTotal = phaseTasks.length;
  const accent = A[activePhase] || A[0];

  // Net worth parsing helpers
  const parseNw = (val) => parseFloat(String(val).replace(/[^0-9.\-]/g, "")) || 0;
  const latestEntry = log[log.length - 1];
  const currentNw = latestEntry ? parseNw(latestEntry.netWorth) : 0;
  const prevEntry = log.length >= 2 ? log[log.length - 2] : null;
  const prevNw = prevEntry ? parseNw(prevEntry.netWorth) : null;
  const nwDelta = prevNw !== null ? currentNw - prevNw : null;
  const goal = 5000000;
  const goalPct = goal > 0 ? Math.max(0, Math.min((currentNw / goal) * 100, 100)) : 0;

  const formattedNw = currentNw >= 0
    ? `$${currentNw.toLocaleString()}`
    : `-$${Math.abs(currentNw).toLocaleString()}`;

  // Sparkline points
  const nwValues = log.map(e => parseNw(e.netWorth));
  const sparkW = 150, sparkH = 40;
  const minNw = Math.min(...nwValues);
  const maxNw = Math.max(...nwValues);
  const nwRange = maxNw - minNw || 1;
  const sparkPoints = nwValues.map((v, i) => {
    const x = nwValues.length > 1 ? (i / (nwValues.length - 1)) * sparkW : sparkW / 2;
    const y = sparkH - ((v - minNw) / nwRange) * (sparkH - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  function addLogEntry() {
    if (!logDraft.date || !logDraft.netWorth) return;
    setLog(prev => [...prev, { ...logDraft }]);
    setLogDraft({ date: "", netWorth: "", salary: "", debt: "", credit: "" });
  }

  function removeLogEntry(idx) {
    setLog(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleGroup(groupId) {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  // Donut chart math
  const donutRadius = 30;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (goalPct / 100) * donutCircumference;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", background: "#0f172a" }}>
      {/* ═══ Left Sidebar ═══ */}
      <aside style={{
        width: "200px",
        flexShrink: 0,
        background: "#0f172a",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "16px 8px 0" }}>
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "history", label: "Financial Breakdown History" },
            { key: "rules", label: "Rules" },
          ].map(item => {
            const isActive = activeView === item.key;
            return (
              <button key={item.key} onClick={() => setActiveView(item.key)} style={{
                display: "flex", alignItems: "center",
                padding: "10px 12px", borderRadius: "6px", border: "none",
                background: isActive ? "#1e293b" : "transparent",
                color: isActive ? "#4ade80" : "#94a3b8",
                fontSize: "13px", fontWeight: isActive ? 500 : 400,
                cursor: "pointer", textAlign: "left", width: "100%",
                borderLeft: isActive ? "3px solid #0F6E56" : "3px solid transparent",
              }}>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: "0 16px", marginTop: "auto" }}>
          <p style={{ fontSize: "11px", fontStyle: "italic", color: "#475569", margin: 0, lineHeight: 1.5 }}>
            &ldquo;Discipline today, freedom tomorrow.&rdquo;
          </p>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh" }}>
        {/* Header */}
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 4px" }}>Welcome back, Nick 👋</p>
        <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>
          Nick&apos;s 20-Year Wealth Roadmap
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px" }}>
          Jul 2026 – 2046 · Goal: $5,000,000 Net Worth
        </p>

        {/* ═══ Dashboard View ═══ */}
        {activeView === "dashboard" && (
          <>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {/* Card 1: Current Net Worth */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Net Worth</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>{formattedNw}</p>
                {nwDelta !== null && (
                  <p style={{ fontSize: "12px", color: nwDelta >= 0 ? "#4ade80" : "#f87171", margin: "0 0 10px" }}>
                    {nwDelta >= 0 ? "+" : "-"}${Math.abs(nwDelta).toLocaleString()} this month
                  </p>
                )}
                {/* Sparkline */}
                <svg width={sparkW} height={sparkH} style={{ display: "block", marginTop: "6px" }}>
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F6E56" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0F6E56" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {nwValues.length > 1 && (
                    <>
                      <polygon
                        points={`0,${sparkH} ${sparkPoints} ${sparkW},${sparkH}`}
                        fill="url(#sparkFill)"
                      />
                      <polyline
                        points={sparkPoints}
                        fill="none"
                        stroke="#0F6E56"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Card 2: Overall Progress (donut) */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px", alignSelf: "flex-start" }}>Overall Progress</p>
                <div style={{ position: "relative", width: "72px", height: "72px" }}>
                  <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="36" cy="36" r={donutRadius} fill="none" stroke="#334155" strokeWidth="6" />
                    <circle cx="36" cy="36" r={donutRadius} fill="none" stroke="#0F6E56" strokeWidth="6"
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={donutOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "13px", fontWeight: 600, color: "#f1f5f9",
                  }}>{goalPct.toFixed(2)}%</span>
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "10px 0 0" }}>$5,000,000 goal</p>
              </div>

              {/* Card 3: Current Phase */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Phase</p>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px" }}>{phase.sub}</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 10px" }}>{phaseDone} / {phaseTotal} tasks complete</p>
                <div style={{ height: "3px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${phaseTotal ? (phaseDone / phaseTotal) * 100 : 0}%`, height: "100%", background: accent, borderRadius: "2px", transition: "width 0.3s" }} />
                </div>
              </div>

              {/* Card 4: Task Progress */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Task Progress</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>{completedTasks}/{totalTasks}</p>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 10px" }}>
                  {totalTasks ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0}% complete
                </p>
                <div style={{ height: "3px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%`, height: "100%", background: "#0F6E56", borderRadius: "2px", transition: "width 0.3s" }} />
                </div>
              </div>
            </div>

            {/* Phase Selector Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
              {PHASES.map((p, i) => {
                const phT = p.groups.flatMap(g => g.tasks);
                const phD = phT.filter(t => progress[t.id]).length;
                const isActive = activePhase === i;
                const phaseAccent = A[i] || A[0];
                return (
                  <button key={p.id} onClick={() => setActivePhase(i)} style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                    flexShrink: 0, border: "none", cursor: "pointer",
                    background: isActive ? "#1e293b" : "transparent",
                    color: isActive ? phaseAccent : "#94a3b8",
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? `2px solid ${phaseAccent}` : "2px solid transparent",
                  }}>
                    <span>{p.title}</span>
                    <span style={{ display: "block", fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{p.sub}</span>
                    {phD > 0 && phD < phT.length && (
                      <span style={{ fontSize: "10px", opacity: 0.7, marginLeft: "4px" }}>{phD}/{phT.length}</span>
                    )}
                    {phD === phT.length && phT.length > 0 && (
                      <span style={{ fontSize: "11px", marginLeft: "4px" }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ═══ Tasks ═══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {phase.groups.map((group) => {
                  const gDone = group.tasks.filter(t => progress[t.id]).length;
                  const gTotal = group.tasks.length;
                  const isCollapsed = !!collapsedGroups[group.id];
                  const icon = GROUP_ICONS[group.label] || "📋";
                  return (
                    <div key={group.id} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid #334155", overflow: "hidden" }}>
                      {/* Group header */}
                      <div
                        onClick={() => toggleGroup(group.id)}
                        style={{
                          padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
                          cursor: "pointer", userSelect: "none",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{icon}</span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#f1f5f9", flex: 1 }}>{group.label}</span>
                        <span style={{ fontSize: "12px", color: gDone === gTotal ? "#4ade80" : "#94a3b8" }}>
                          {gDone}/{gTotal}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b", transition: "transform 0.2s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                      </div>

                      {/* Tasks */}
                      {!isCollapsed && group.tasks.map((task) => {
                        const catDef = CAT[task.cat] || { label: task.cat, bg: "#334155", color: "#94a3b8" };
                        const isChecked = !!progress[task.id];
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggle(task.id)}
                            style={{
                              padding: "10px 16px 10px 42px", display: "flex", gap: "10px",
                              alignItems: "flex-start", cursor: "pointer",
                              borderTop: "1px solid #334155", background: "transparent",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#253247"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Checkbox */}
                            <div style={{
                              width: "15px", height: "15px", borderRadius: "3px",
                              flexShrink: 0, marginTop: "2px",
                              border: `1.5px solid ${isChecked ? accent : "#475569"}`,
                              background: isChecked ? accent : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {isChecked && <span style={{ fontSize: "10px", color: "#fff", lineHeight: 1 }}>✓</span>}
                            </div>
                            {/* Badge + text */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                              <span style={{
                                fontSize: "10px", padding: "2px 6px", borderRadius: "3px",
                                fontWeight: 500, flexShrink: 0, marginTop: "2px",
                                background: catDef.bg, color: catDef.color,
                              }}>{catDef.label}</span>
                              <span style={{
                                fontSize: "13px", lineHeight: "1.55",
                                color: isChecked ? "#64748b" : "#e2e8f0",
                                textDecoration: isChecked ? "line-through" : "none",
                              }}>{task.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
          </>
        )}

        {/* ═══ Rules View (from sidebar) ═══ */}
        {activeView === "rules" && renderRules()}

        {/* ═══ History View (from sidebar) ═══ */}
        {activeView === "history" && renderLog()}
      </main>
    </div>
  );

  /* ─── Render helpers ─── */
  function renderRules() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 12px" }}>Financial Rules</h3>
        {RULES.map((rule, i) => (
          <div key={i} style={{
            padding: "12px 16px", background: "#1e293b", borderRadius: "8px",
            fontSize: "13px", lineHeight: "1.55", color: "#e2e8f0",
            display: "flex", gap: "10px", alignItems: "flex-start",
            border: "1px solid #334155",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F6E56", flexShrink: 0 }}>{i + 1}.</span>
            <span>{rule}</span>
          </div>
        ))}
      </div>
    );
  }

  function renderLog() {
    return (
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px" }}>Financial Breakdown History</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Date", "Net Worth", "Salary", "Debt", "Credit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
                <th style={{ width: "36px" }} />
              </tr>
            </thead>
            <tbody>
              {log.map((entry, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{entry.date}</td>
                  <td style={{ padding: "10px 12px", color: "#f1f5f9", fontWeight: 500 }}>{entry.netWorth}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{entry.salary}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{entry.debt}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{entry.credit}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button onClick={() => removeLogEntry(idx)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: "14px", color: "#64748b", padding: "2px 6px",
                    }} title="Remove entry">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add entry form */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {[
            { key: "date", placeholder: "Date (e.g. Oct 10 2026)", width: "170px" },
            { key: "netWorth", placeholder: "Net Worth", width: "110px" },
            { key: "salary", placeholder: "Salary", width: "100px" },
            { key: "debt", placeholder: "Debt", width: "100px" },
            { key: "credit", placeholder: "Credit", width: "80px" },
          ].map(field => (
            <input
              key={field.key}
              value={logDraft[field.key]}
              onChange={e => setLogDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              style={{
                width: field.width, padding: "8px 12px", fontSize: "12px",
                border: "1px solid #334155", borderRadius: "6px",
                background: "#0f172a", color: "#e2e8f0",
              }}
            />
          ))}
          <button onClick={addLogEntry} style={{
            padding: "8px 16px", fontSize: "12px", fontWeight: 500,
            borderRadius: "6px", border: "1px solid #0F6E56",
            background: "transparent", color: "#4ade80", cursor: "pointer",
          }}>Add</button>
        </div>
      </div>
    );
  }
}
