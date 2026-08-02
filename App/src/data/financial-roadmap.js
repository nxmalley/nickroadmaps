/**
 * Financial Masterplan — metadata for the landing page card.
 * Task IDs must match FinancialRoadmap.jsx exactly for progress counting.
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
    debt: { label: "Debt", bg: "#fdeaea", color: "#b91c1c" },
    k401: { label: "401k", bg: "#e0f2fe", color: "#0369a1" },
    moveout: { label: "Move-Out", bg: "#fef3c7", color: "#92400e" },
    cma: { label: "CMA", bg: "#d1fae5", color: "#065f46" },
    hysa: { label: "HYSA", bg: "#fef3c7", color: "#92400e" },
    credit: { label: "Credit", bg: "#f3f4f6", color: "#374151" },
    life: { label: "Life", bg: "#f3f4f6", color: "#374151" },
  },
  phases: [
    {
      id: "p1",
      title: "Phase 1",
      subtitle: "Foundation Sprint",
      dateRange: "Jul – Dec 2026",
      milestones: ["Student loan → $0", "2026 Roth maxed", "Move-out reqs complete", "CMA foundation building"],
      weeks: [
        { id: "p1g1", label: "Debt Elimination", dates: "Jul – Dec 2026", tasks: [
          { id: "p1g1a", cat: "debt", text: "Direct all excess cash above NFCU ($12k) / USAA ($4k) maxes to student loan principal every month" },
          { id: "p1g1b", cat: "debt", text: "Confirm $0 balance and close out loan servicing account" },
        ]},
        { id: "p1g2", label: "Retirement", dates: "Jul – Dec 2026", tasks: [
          { id: "p1g2b", cat: "k401", text: "Roth 401k active at 6% into Vanguard Institutional 500 Index Trust A — confirmed immediate vesting" },
          { id: "p1g2d", cat: "k401", text: "Add beneficiaries to Roth 401k (Empower) and Roth IRA (Fidelity) — parents 50/50 primary" },
        ]},
        { id: "p1g3", label: "Move-Out Requirements", dates: "Jul – Dec 2026", tasks: [
          { id: "p1g3a", cat: "moveout", text: "1. Student loans fully paid off" },
          { id: "p1g3b", cat: "moveout", text: "2. Roth IRA maxed for 2026 + $3k contributed to 2027" },
          { id: "p1g3c", cat: "moveout", text: "3. HYSA at $15k e-fund + $5k move-in fund ($20k total)" },
        ]},
        { id: "p1g4", label: "CMA Phase 1", dates: "Jul – Dec 2026", tasks: [
          { id: "p1g4a", cat: "cma", text: "Continue $382/mo pay myself split evenly BRKB / SCHD on the 15th" },
          { id: "p1g4b", cat: "cma", text: "Reach $10,000 total foundation balance to trigger Phase 2" },
          { id: "p1g4c", cat: "cma", text: "Log share counts (BRKB + SCHD) each quarterly review" },
        ]},
        { id: "p1g5", label: "Admin and Housekeeping", dates: "Jul – Dec 2026", tasks: [
          { id: "p1g5a", cat: "hysa", text: "Decide on formal HYSA max balance policy vs. redirecting excess to CMA" },
          { id: "p1g5b", cat: "credit", text: "Keep Cash Rewards Plus + More Rewards active — hold off on Flagship until move-out" },
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
        { id: "p2g2", label: "CMA Phase 2", dates: "Jan 2027 – Dec 2028", tasks: [
          { id: "p2g2a", cat: "cma", text: "Shift to 80% individual stock / 20% foundation once CMA hits $10k" },
          { id: "p2g2b", cat: "cma", text: "Sequence 1: Build MSFT position to $3,000" },
          { id: "p2g2c", cat: "cma", text: "Sequence 2: Build NEE position to $3,000" },
          { id: "p2g2d", cat: "cma", text: "Sequence 3: Build JPM position to $3,000" },
          { id: "p2g2e", cat: "cma", text: "Sequence 4: Build COST position to $3,000" },
        ]},
        { id: "p2g3", label: "Credit", dates: "Jan 2027 – Dec 2028", tasks: [
          { id: "p2g3a", cat: "credit", text: "Request NFCU product change: Cash Rewards Plus → Flagship" },
          { id: "p2g3b", cat: "credit", text: "Request credit limit increase after 6–12 months at $100k+ income" },
        ]},
      ],
    },
    {
      id: "p3",
      title: "Phase 3",
      subtitle: "Scaling Years",
      dateRange: "2029 – 2035",
      milestones: ["Phase 3 rebalance (80/20)", "Net worth $700k–1.1M"],
      weeks: [
        { id: "p3g1", label: "CMA Phase 3 Rebalance", dates: "2029 – 2035", tasks: [
          { id: "p3g1a", cat: "cma", text: "Once all 4 individual stocks hit $3k, rebalance to 80% foundation / 20% individual" },
        ]},
      ],
    },
    {
      id: "p4",
      title: "Phase 4",
      subtitle: "$5M Push",
      dateRange: "2036 – 2046",
      milestones: ["Full portfolio maturity", "$5M ultimate goal"],
      weeks: [
        { id: "p4g3", label: "Net Worth Milestones", dates: "2036 – 2046", tasks: [
          { id: "nw100k", cat: "life", text: "$100,000 net worth" },
          { id: "nw250k", cat: "life", text: "$250,000 net worth" },
          { id: "nw500k", cat: "life", text: "$500,000 net worth" },
          { id: "nw1m", cat: "life", text: "$1,000,000 net worth" },
          { id: "nw1.5m", cat: "life", text: "$1,500,000 net worth" },
          { id: "nw2m", cat: "life", text: "$2,000,000 net worth" },
          { id: "nw3m", cat: "life", text: "$3,000,000 net worth" },
          { id: "nw4m", cat: "life", text: "$4,000,000 net worth" },
          { id: "nw5m", cat: "life", text: "$5,000,000 net worth — ultimate goal" },
        ]},
      ],
    },
  ],
};
