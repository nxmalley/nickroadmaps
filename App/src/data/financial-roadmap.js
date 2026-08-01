/**
 * Financial Masterplan — registry data for the landing page.
 * The standalone FinancialRoadmap component handles all rendering;
 * this file provides metadata so the shell can compute progress cards.
 *
 * Uses "weeks" as the key name (maps to "groups" conceptually) so that
 * computeMeta in DashboardShell can iterate roadmap.phases[].weeks[].tasks[].
 *
 * @type {import('../types/roadmap.js').RoadmapData}
 */

export const FINANCIAL_ROADMAP_ID = "financial-masterplan";

export const financialRoadmap = {
  id: FINANCIAL_ROADMAP_ID,
  title: "Nick's 20-Year Wealth Roadmap",
  subtitle: "Jul 2026 – 2046 · Goal: $5,000,000 Net Worth",
  dateRange: { start: "2026-07-01", end: "2046-12-31" },
  accentColors: ["#0F6E56", "#185FA5", "#534AB7", "#993C1D"],
  categories: {
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
  },
  phases: [
    {
      id: "p1",
      title: "Phase 1",
      subtitle: "Foundation Sprint",
      dateRange: "Jul – Dec 2026",
      milestones: ["Student loan → $0", "2026 Roth maxed", "Move-out reqs complete", "CMA foundation building"],
      weeks: [
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
      id: "p2",
      title: "Phase 2",
      subtitle: "Independence + Sequencing",
      dateRange: "Jan 2027 – Dec 2028",
      milestones: ["Moved out", "CMA hits $10k", "MSFT → NEE → JPM → COST sequence", "Flagship card upgrade"],
      weeks: [
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
      id: "p3",
      title: "Phase 3",
      subtitle: "Scaling Years",
      dateRange: "2029 – 2035",
      milestones: ["Phase 3 rebalance (80/20)", "Real estate re-evaluated", "Vehicle upgrade window", "Net worth $700k–1.1M"],
      weeks: [
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
      id: "p4",
      title: "Phase 4",
      subtitle: "Principal Track + $5M Push",
      dateRange: "2036 – 2046",
      milestones: ["Principal/Architect comp", "Full portfolio maturity", "$2M by ~44", "$5M ultimate goal"],
      weeks: [
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
  ],
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};
