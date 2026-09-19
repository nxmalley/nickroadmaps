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
        { id: "p1g1b", cat: "debt", text: "Confirm $0 balance and close out loan servicing account" },
      ]},
      { id: "p1g2", label: "Retirement", tasks: [
        { id: "p1g2b", cat: "k401", text: "Roth 401k active at 6% into Vanguard Institutional 500 Index Trust A — confirmed immediate vesting" },
        { id: "p1g2d", cat: "k401", text: "Add beneficiaries to Roth 401k (Empower) and Roth IRA (Fidelity) — parents 50/50 primary" },
      ]},
      { id: "p1g3", label: "Move-Out Requirements (in order)", tasks: [
        { id: "p1g3a", cat: "moveout", text: "1. Student loans fully paid off" },
        { id: "p1g3b", cat: "moveout", text: "2. Roth IRA maxed for 2026 + $3k contributed to 2027" },
        { id: "p1g3c", cat: "moveout", text: "3. HYSA at $15k e-fund + $5k move-in fund ($20k total)" },
      ]},
      { id: "p1g4", label: "CMA — Phase 1 (Foundation)", tasks: [
        { id: "p1g4a", cat: "cma", text: "Continue $382/mo \"pay myself\" split evenly BRKB / SCHD on the 15th" },
        { id: "p1g4b", cat: "cma", text: "Reach $10,000 total foundation balance to trigger Phase 2" },
        { id: "p1g4c", cat: "cma", text: "Log share counts (BRKB + SCHD) each quarterly review" },
      ]},
      { id: "p1g5", label: "Admin & Housekeeping", tasks: [
        { id: "p1g5a", cat: "hysa", text: "Decide on formal HYSA max balance policy vs. redirecting excess to CMA" },
        { id: "p1g5b", cat: "credit", text: "Keep Cash Rewards Plus + More Rewards active — hold off on Flagship until move-out" },
      ]},
    ],
  },
  {
    id: "p2", title: "Phase 2", sub: "Independence + Sequencing", range: "Jan 2027 – Dec 2028",
    milestones: ["Moved out", "CMA hits $10k", "MSFT → NEE → JPM → COST sequence", "Flagship card upgrade"],
    groups: [
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
    ],
  },
  {
    id: "p3", title: "Phase 3", sub: "Scaling Years", range: "2029 – 2035",
    milestones: ["Phase 3 rebalance (80/20)", "Net worth $700k–1.1M"],
    groups: [
      { id: "p3g1", label: "CMA — Phase 3 (Rebalance)", tasks: [
        { id: "p3g1a", cat: "cma", text: "Once all 4 individual stocks hit $3k, rebalance to 80% foundation (40% SCHD / 40% BRKB) / 20% individual (5% each)" },
      ]},
    ],
  },
  {
    id: "p4", title: "Phase 4", sub: "$5M Push", range: "2036 – 2046",
    milestones: ["Full portfolio maturity", "$5M ultimate goal"],
    groups: [
      { id: "p4g3", label: "Net Worth Milestones", tasks: [
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
  { date: "Oct 2024", assets: "25,434", netWorth: "-10,465", salary: "35,800", debt: "35,899", credit: "-" },
  { date: "Jan 2025", assets: "28,937", netWorth: "-13,571", salary: "35,800", debt: "42,508", credit: "-" },
  { date: "Apr 2025", assets: "31,542", netWorth: "-9,153", salary: "43,700", debt: "40,695", credit: "-" },
  { date: "Jul 2025", assets: "31,586", netWorth: "-7,566", salary: "43,700", debt: "39,152", credit: "-" },
  { date: "Oct 2025", assets: "34,277", netWorth: "-3,103", salary: "43,700", debt: "37,380", credit: "-" },
  { date: "Jan 2026", assets: "39,186", netWorth: "7,001", salary: "54,142", debt: "32,185", credit: "785" },
  { date: "Apr 2026", assets: "39,404", netWorth: "14,834", salary: "54,142", debt: "24,570", credit: "785" },
  { date: "Jul 2026", assets: "42,335", netWorth: "27,129", salary: "100,000", debt: "15,206", credit: "770" },
];

/* ─── Expense tracking config ─── */
// Tracking periods run November → October. Order matters for month-over-month deltas.
const EXPENSE_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const EXPENSE_CATEGORIES = [
  { key: "groceries", label: "Groceries", icon: "🛒", color: "#22c55e" },
  { key: "dining", label: "Dining / Entertainment", icon: "🍽️", color: "#f59e0b" },
  { key: "personalCare", label: "Personal Care", icon: "🧴", color: "#a78bfa" },
  { key: "misc", label: "Miscellaneous", icon: "•••", color: "#64748b" },
  { key: "gas", label: "Gas", icon: "⛽", color: "#14b8a6" },
  { key: "malnax", label: "Business - Malnax", icon: "💼", color: "#3b82f6" },
  { key: "transportation", label: "Transportation", icon: "🚌", color: "#8b5cf6" },
  { key: "lawyer", label: "Lawyer / Fines", icon: "⚖️", color: "#ef4444" },
  { key: "carMaintenance", label: "Car Maintenance", icon: "🔧", color: "#eab308" },
  { key: "vacation", label: "Vacation", icon: "✈️", color: "#06b6d4" },
];

// Which categories were tracked in each period. 2024-2025 used only the
// original 5, plus Vacation.
const EXPENSE_PERIOD_CATEGORIES = {
  "2024-2025": ["groceries", "dining", "personalCare", "misc", "gas", "vacation"],
  "2025-2026": EXPENSE_CATEGORIES.map(c => c.key),
  "2026-2027": EXPENSE_CATEGORIES.map(c => c.key),
};

const EXPENSE_PERIODS = [
  { key: "2024-2025", label: "2024 – 2025", range: "Nov 2024 – Oct 2025" },
  { key: "2025-2026", label: "2025 – 2026", range: "Nov 2025 – Oct 2026" },
  { key: "2026-2027", label: "2026 – 2027", range: "Nov 2026 – Oct 2027" },
];

/* ─── Migration helper (pure — no component deps) ─── */
function migrateEarnedItems(items) {
  if (!Array.isArray(items)) return items;
  const CANONICAL = [
    { id: "earn-yukon", name: "GMC Yukon Denali", category: "Vehicle", price: 70000, image: "/GMC_Yukon.png", goalType: "none", goalTarget: 0 },
    { id: "earn-maserati", name: "Maserati MC20 Cielo", category: "Vehicle", price: 225000, image: "/Maserati_McPura.png", goalType: "networth", goalTarget: 2000000 },
    { id: "earn-amg", name: "Mercedes-AMG GT R", category: "Vehicle", price: 175000, image: "/AMG_GTR.png", goalType: "networth", goalTarget: 3500000 },
    { id: "earn-gshock", name: "G-Shock GM-2100BB-1A", category: "Watch", price: 250, image: "/GShock.png", goalType: "debtfree", goalTarget: 0, debtStart: 45000 },
    { id: "earn-tissot", name: "Tissot PRX Quartz", subtitle: "(Steel and Black Dial)", category: "Watch", price: 450, image: "/Tissot_PRX.png", goalType: "debtfree", goalTarget: 0, debtStart: 45000 },
    { id: "earn-seiko", name: "Seiko Alpinist SPB121", category: "Watch", price: 750, image: "/Seiko_Alpinist.png", goalType: "networth", goalTarget: 200000 },
    { id: "earn-longines", name: "Longines Master Collection", subtitle: "(L2.919.4.78.3)", description: "Brown Leather and White Dial + Black Leather Strap", category: "Watch", price: 3100, image: "/Longines_MoonPhase.png", goalType: "networth", goalTarget: 350000 },
    { id: "earn-tag", name: "Tag Heuer Carrera Date", subtitle: "WBN2111.BA0639", description: "(Steel and Silver Dial)", category: "Watch", price: 3700, image: "/Tag_CarreraDate.png", goalType: "networth", goalTarget: 500000 },
    { id: "earn-rolex", name: "Rolex Day-Date 40MM", subtitle: "Everose Gold Slate Roman", description: "Ombre Dial 228235", category: "Watch", price: 65000, image: "/Rolex_Everose.png", goalType: "networth", goalTarget: 2500000 },
    { id: "earn-rolex-yg", name: "Rolex Day-Date 40MM", subtitle: "Yellow Gold", description: "White Dial 228238", category: "Watch", price: 50000, image: "/Rolex_YellowGold.png", goalType: "networth", goalTarget: 3000000 },
  ];
  const canonMap = {};
  for (const c of CANONICAL) canonMap[c.id] = c;
  const OLD_ID_MAP = { "earn-suv": "earn-yukon", "earn-porsche": "earn-amg" };

  const result = items.map(item => {
    const remappedId = OLD_ID_MAP[item.id] || item.id;
    const canon = canonMap[remappedId];
    if (canon) {
      return { ...item, ...canon, id: remappedId, completed: item.completed, completedAt: item.completedAt };
    }
    if (!item.name && item.text) return { ...item, name: item.text };
    return item;
  });

  const existingIds = new Set(result.map(r => r.id));
  for (const canon of CANONICAL) {
    if (!existingIds.has(canon.id)) {
      result.push({ ...canon, completed: false, completedAt: null });
    }
  }
  return result;
}

// Back-fill the `assets` field on saved log entries that predate the Assets column.
// Uses known seed values by date, else derives assets = netWorth + debt.
function migrateLog(entries) {
  if (!Array.isArray(entries)) return entries;
  const seedByDate = {};
  for (const e of INITIAL_LOG) seedByDate[e.date] = e.assets;
  const num = (v) => parseFloat(String(v ?? "").replace(/[^0-9.\u002D]/g, "")) || 0;
  return entries.map(entry => {
    if (entry.assets !== undefined && entry.assets !== "" && entry.assets !== null) return entry;
    const seeded = seedByDate[entry.date];
    const assets = seeded !== undefined ? seeded : String(num(entry.netWorth) + num(entry.debt));
    return { ...entry, assets };
  });
}

/* ─── Component ─── */
export default function FinancialRoadmap() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const { progress, toggle } = useProgressStore("financial-masterplan");
  const [activePhase, setActivePhase] = useState(0);
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "rules" | "history" | "accounts" | "future"
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [earnedTab, setEarnedTab] = useState("pending");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [editingLogIdx, setEditingLogIdx] = useState(null);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [updateModal, setUpdateModal] = useState(null); // { accId, accName, accType, currentBalance, newBalance, note }
  const [updateDraft, setUpdateDraft] = useState({ value: "", note: "" });
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showAddLogEntry, setShowAddLogEntry] = useState(false);
  const [showSalaryPanel, setShowSalaryPanel] = useState(false);
  const [salaryDraft, setSalaryDraft] = useState({ year: "", title: "", employer: "", salary: "" });
  const [expandedYear, setExpandedYear] = useState(null);

  // Salary history — loaded from Upstash on mount
  const [salaryHistory, setSalaryHistory] = useState([
    { year: "2026", title: "Jr Software Engineer", employer: "Leidos", salary: "100000" },
    { year: "2025", title: "Service Desk Tier 1 Technician", employer: "Leidos", salary: "54142" },
    { year: "2025", title: "IT Service Desk Analyst", employer: "SAIC", salary: "43700" },
    { year: "2024–2025", title: "Support Specialist", employer: "Media Cross", salary: "35800" },
  ]);

  // Account change log — loaded from Upstash on mount
  const [accountChangeLog, setAccountChangeLog] = useState([]);

  // Monthly earnings data — loaded from Upstash on mount
  const [earningsData, setEarningsData] = useState({
    "2021": { Jan: 617.44, Feb: 658.67, Mar: 515.26, Apr: 768.48, May: 1050.72, Jun: 769.37, Jul: 281.29, Aug: 542.32, Sep: 0, Oct: 0, Nov: 0, Dec: 0 },
    "2022": { Jan: 0, Feb: 348.00, Mar: 0, Apr: 99.79, May: 382.69, Jun: 514.73, Jul: 510.46, Aug: 808.11, Sep: 0, Oct: 0, Nov: 0, Dec: 57.56 },
    "2023": { Jan: 292.89, Feb: 87.05, Mar: 136.23, Apr: 0, May: 0, Jun: 0, Jul: 1331.26, Aug: 4410.78, Sep: 488.66, Oct: 0, Nov: 0, Dec: 31.05 },
    "2024": { Jan: 39.62, Feb: 16.99, Mar: 1589.00, Apr: 0, May: 741.63, Jun: 505.44, Jul: 1381.74, Aug: 2063.65, Sep: 2341.34, Oct: 2453.22, Nov: 2452.78, Dec: 2452.72 },
    "2025": { Jan: 2456.48, Feb: 2457.32, Mar: 3781.18, Apr: 2522.78, May: 3266.86, Jun: 3297.26, Jul: 3298.37, Aug: 3010.09, Sep: 3298.37, Oct: 5297.09, Nov: 3675.02, Dec: 5136.52 },
    "2026": { Jan: 3568.24, Feb: 3939.40, Mar: 6194.06, Apr: 6011.25, May: 5059.40, Jun: 5209.34, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 },
  });

  // Expense tracking — keyed by tracking period, then category, then month.
  // Periods run Jul → Jun. 2024-2025 used only the first 5 categories.
  const [expenseData, setExpenseData] = useState({});
  const [expenseYear, setExpenseYear] = useState("2025-2026");
  const [editingCategory, setEditingCategory] = useState(null); // category key being edited
  const [expandedExpenseYear, setExpandedExpenseYear] = useState("2025-2026");

  // Net worth log — loaded from Upstash on mount
  const [log, setLog] = useState(INITIAL_LOG);
  const [logDraft, setLogDraft] = useState({ date: "", assets: "", netWorth: "", salary: "", debt: "", credit: "" });

  // Future Implementation notes — loaded from Upstash on mount
  const [futureNotes, setFutureNotes] = useState([
    { id: "fn1", text: "Backdoor Roth IRA — research contribution limits and conversion steps for high earners" },
    { id: "fn2", text: "Mega Backdoor Roth 401k — check if Empower plan allows after-tax contributions + in-plan conversion" },
  ]);
  const [futureDraft, setFutureDraft] = useState("");

  // Investments & Accounts data — persisted in localStorage
  // Investments & Accounts — loaded from Upstash on mount
  const [accounts, setAccounts] = useState([
    { id: "acc1", name: "NFCU", type: "Savings", badge: "savings", balance: 16625, limit: 12000, description: "High-yield savings. Credit card paid in full on 19th monthly.", metric: "limit", metricLabel: "of $12,000 limit" },
    { id: "acc2", name: "USAA", type: "Savings", badge: "savings", balance: 25, limit: 4000, description: "Minimum balance to keep account open. Bills only.", metric: "limit", metricLabel: "of $4,000 limit" },
    { id: "acc3", name: "Empower", type: "Roth 401k", badge: "retirement", balance: 1868, contribution: "6%", fund: "Vanguard Inst'l 500 Index Trust", vested: "100%", description: "Leidos employer plan. Immediate vesting.", metric: "contribution" },
    { id: "acc4", name: "Fidelity", type: "Roth IRA", badge: "retirement", balance: 10704, fund: "FXAIX", returnPct: 8.72, description: "Roth IRA — S&P 500 index fund.", metric: "return" },
    { id: "acc5", name: "Fidelity", type: "CMA (Taxable)", badge: "brokerage", balance: 4504, fund: "BRKB, SCHD + 4 more", monthlyContribution: 382, description: "Cash Management Account. $382/mo split evenly BRKB/SCHD.", metric: "contribution_monthly" },
    { id: "acc6", name: "Capital One", type: "HYSA", badge: "savings", balance: 603, apy: "3.00%", description: "High-yield savings. 360 Performance.", metric: "apy" },
    { id: "acc7", name: "Robinhood", type: "Crypto", badge: "speculative", balance: 531, fund: "DOGE, XRP", description: "Crypto holdings.", metric: "none" },
  ]);

  // Other Assets (e.g. car value) — loaded from Upstash on mount
  const [otherAssets, setOtherAssets] = useState([
    { id: "oa-corolla", category: "vehicles", type: "Car Value", name: "2010 Toyota Corolla S", value: 7500 },
  ]);
  const [otherAssetDraft, setOtherAssetDraft] = useState({ category: "vehicles", name: "", value: "" });

  // Completed/archived groups — loaded from Upstash on mount
  const [completedArchive, setCompletedArchive] = useState([]);

  // Earned rewards — lifestyle purchases earned through discipline
  const [earnedItems, setEarnedItems] = useState([
    { id: "earn-yukon", name: "GMC Yukon Denali", category: "Vehicle", price: 70000, image: "/GMC_Yukon.png", goalType: "none", goalTarget: 0, completed: false, completedAt: null },
    { id: "earn-maserati", name: "Maserati MC20 Cielo", category: "Vehicle", price: 225000, image: "/Maserati_McPura.png", goalType: "networth", goalTarget: 2000000, completed: false, completedAt: null },
    { id: "earn-amg", name: "Mercedes-AMG GT R", category: "Vehicle", price: 175000, image: "/AMG_GTR.png", goalType: "networth", goalTarget: 3500000, completed: false, completedAt: null },
    { id: "earn-gshock", name: "G-Shock GM-2100BB-1A", category: "Watch", price: 250, image: "/GShock.png", goalType: "debtfree", goalTarget: 0, debtStart: 45000, completed: false, completedAt: null },
    { id: "earn-tissot", name: "Tissot PRX Quartz", subtitle: "(Steel and Black Dial)", category: "Watch", price: 450, image: "/Tissot_PRX.png", goalType: "debtfree", goalTarget: 0, debtStart: 45000, completed: false, completedAt: null },
    { id: "earn-seiko", name: "Seiko Alpinist SPB121", category: "Watch", price: 750, image: "/Seiko_Alpinist.png", goalType: "networth", goalTarget: 200000, completed: false, completedAt: null },
    { id: "earn-longines", name: "Longines Master Collection", subtitle: "(L2.919.4.78.3)", description: "Brown Leather and White Dial + Black Leather Strap", category: "Watch", price: 3100, image: "/Longines_MoonPhase.png", goalType: "networth", goalTarget: 350000, completed: false, completedAt: null },
    { id: "earn-tag", name: "Tag Heuer Carrera Date", subtitle: "WBN2111.BA0639", description: "(Steel and Silver Dial)", category: "Watch", price: 3700, image: "/Tag_CarreraDate.png", goalType: "networth", goalTarget: 500000, completed: false, completedAt: null },
    { id: "earn-rolex", name: "Rolex Day-Date 40MM", subtitle: "Everose Gold Slate Roman", description: "Ombre Dial 228235", category: "Watch", price: 65000, image: "/Rolex_Everose.png", goalType: "networth", goalTarget: 2500000, completed: false, completedAt: null },
    { id: "earn-rolex-yg", name: "Rolex Day-Date 40MM", subtitle: "Yellow Gold", description: "White Dial 228238", category: "Watch", price: 50000, image: "/Rolex_YellowGold.png", goalType: "networth", goalTarget: 3000000, completed: false, completedAt: null },
  ]);
  const [earnedViewMode, setEarnedViewMode] = useState("grid"); // "grid" | "list"
  const [earnedSort, setEarnedSort] = useState("custom"); // "custom" | "progress" | "price-asc" | "price-desc" | "name"

  // Load persisted data from server on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/financial-data');
        if (res.ok) {
          const data = await res.json();
          if (data && !cancelled) {
            if (data.log) setLog(migrateLog(data.log));
            if (data.accountChangeLog) setAccountChangeLog(data.accountChangeLog);
            if (data.accounts) setAccounts(data.accounts);
            if (data.salaryHistory) setSalaryHistory(data.salaryHistory);
            if (data.earningsData) setEarningsData(data.earningsData);
            if (data.futureNotes) setFutureNotes(data.futureNotes);
            if (data.earnedItems) setEarnedItems(migrateEarnedItems(data.earnedItems));
            if (data.otherAssets) setOtherAssets(data.otherAssets);
            if (data.expenseData) setExpenseData(data.expenseData);
            if (data.completedArchive) setCompletedArchive(data.completedArchive);
          }
        }
      } catch { /* fallback to localStorage defaults already loaded */ }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Save all financial data to server whenever any piece changes
  useEffect(() => {
    if (!dataLoaded) return; // Don't save before initial load completes
    const data = { log, accountChangeLog, accounts, salaryHistory, earningsData, futureNotes, earnedItems, otherAssets, expenseData, completedArchive };
    fetch('/api/financial-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => { /* silent */ });
  }, [dataLoaded, log, accountChangeLog, accounts, salaryHistory, earningsData, futureNotes, earnedItems, otherAssets, expenseData, completedArchive]);

  // Auto-archive fully completed groups
  useEffect(() => {
    PHASES.forEach(p => {
      p.groups.forEach(group => {
        const allDone = group.tasks.length > 0 && group.tasks.every(t => progress[t.id]);
        if (allDone) {
          setCompletedArchive(prev => {
            if (prev.some(a => a.groupId === group.id)) return prev;
            const timestamp = new Date().toISOString();
            return [...prev, {
              id: `arch-${group.id}-${Date.now()}`,
              groupId: group.id,
              groupLabel: group.label,
              phaseTitle: `${p.title} — ${p.sub}`,
              completedAt: timestamp,
              tasks: group.tasks.map(t => ({ id: t.id, text: t.text, cat: t.cat, completedAt: timestamp })),
            }];
          });
        }
      });
    });
  }, [progress]);

  // Net worth milestone thresholds — auto-checked based on current net worth
  const NW_MILESTONES = [
    { id: "nw100k", threshold: 100000 },
    { id: "nw250k", threshold: 250000 },
    { id: "nw500k", threshold: 500000 },
    { id: "nw1m", threshold: 1000000 },
    { id: "nw1.5m", threshold: 1500000 },
    { id: "nw2m", threshold: 2000000 },
    { id: "nw3m", threshold: 3000000 },
    { id: "nw4m", threshold: 4000000 },
    { id: "nw5m", threshold: 5000000 },
  ];

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
  const parseNw = (val) => parseFloat(String(val).replace(/[^0-9.\u002D]/g, "")) || 0;
  // Net worth = Assets − Liabilities (Debt). Falls back to stored netWorth for legacy entries without assets.
  const computeNw = (entry) => {
    if (!entry) return 0;
    if (entry.assets !== undefined && entry.assets !== "" && entry.assets !== null) {
      return parseNw(entry.assets) - parseNw(entry.debt);
    }
    return parseNw(entry.netWorth);
  };
  const latestEntry = log[log.length - 1];
  const currentNw = computeNw(latestEntry);
  const prevEntry = log.length >= 2 ? log[log.length - 2] : null;
  const prevNw = prevEntry ? computeNw(prevEntry) : null;
  const nwDelta = prevNw !== null ? currentNw - prevNw : null;
  const goal = 5000000;
  const goalPct = goal > 0 ? Math.max(0, Math.min((currentNw / goal) * 100, 100)) : 0;

  const formattedNw = currentNw >= 0
    ? `$${currentNw.toLocaleString()}`
    : `-$${Math.abs(currentNw).toLocaleString()}`;

  // Sparkline points
  const nwValues = log.map(e => computeNw(e));
  const sparkW = 150, sparkH = 40;
  const minNw = Math.min(...nwValues);
  const maxNw = Math.max(...nwValues);
  const nwRange = maxNw - minNw || 1;
  const sparkPoints = nwValues.map((v, i) => {
    const x = nwValues.length > 1 ? (i / (nwValues.length - 1)) * sparkW : sparkW / 2;
    const y = sparkH - ((v - minNw) / nwRange) * (sparkH - 4) - 2;
    return `${x},${y}`;
  }).join(" ");



  function toggleGroup(groupId) {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function addFutureNote() {
    if (!futureDraft.trim()) return;
    setFutureNotes(prev => [...prev, { id: `fn-${Date.now()}`, text: futureDraft.trim() }]);
    setFutureDraft("");
  }

  function removeFutureNote(id) {
    setFutureNotes(prev => prev.filter(n => n.id !== id));
  }



  function completeEarnedItem(id) {
    setEarnedItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: true, completedAt: new Date().toISOString() } : item
    ));
  }

  function removeEarnedItem(id) {
    setEarnedItems(prev => prev.filter(item => item.id !== id));
  }

  // Donut chart math
  const donutRadius = 30;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (goalPct / 100) * donutCircumference;

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, fontFamily: "var(--font-sans)", background: "#0f172a" }}>
      {/* ═══ Left Sidebar ═══ */}
      <aside style={{
        width: "200px",
        flexShrink: 0,
        background: "#0f172a",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        height: "100%",
        overflowY: "auto",
      }}>
        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "16px 8px 0" }}>
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "history", label: "Financial Breakdown" },
            { key: "accounts", label: "Investments & Accounts" },
            { key: "rules", label: "Rules" },
            { key: "future", label: "Future Implementation" },
          ].map(item => {
            const isActive = activeView === item.key;
            return (
              <button key={item.key} onClick={() => setActiveView(item.key)} style={{
                display: "flex", alignItems: "center",
                padding: "10px 12px", borderRadius: "6px", border: "none",
                background: isActive ? "#1e293b" : "transparent",
                color: isActive ? "#4ade80" : "#94a3b8",
                fontSize: "14px", fontWeight: isActive ? 500 : 400,
                cursor: "pointer", textAlign: "left", width: "100%",
                borderLeft: isActive ? "3px solid #0F6E56" : "3px solid transparent",
              }}>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: "0 8px", marginTop: "auto", paddingBottom: "16px" }}>
          <button onClick={() => setActiveView("earned")} style={{
            display: "flex", alignItems: "center",
            padding: "10px 12px", borderRadius: "6px", border: "none",
            background: activeView === "earned" ? "#1e293b" : "transparent",
            color: activeView === "earned" ? "#4ade80" : "#94a3b8",
            fontSize: "14px", fontWeight: activeView === "earned" ? 500 : 400,
            cursor: "pointer", textAlign: "left", width: "100%",
            borderLeft: activeView === "earned" ? "3px solid #0F6E56" : "3px solid transparent",
            marginBottom: "12px",
          }}>
            <span>Earned not Given 🎁</span>
          </button>
          <p style={{ fontSize: "12px", fontStyle: "italic", color: "#64748b", margin: 0, lineHeight: 1.4, padding: "0 8px" }}>
            &ldquo;Discipline today,<br />freedom tomorrow.&rdquo;
          </p>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <main style={{ flex: 1, padding: "28px 32px 60px", overflowY: "auto", height: "100%" }}>
        {/* Header */}
        <p style={{ fontSize: "15px", color: "#94a3b8", margin: "0 0 4px" }}>Welcome back, Nick 👋</p>
        <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>
          Nick&apos;s 20-Year Wealth Roadmap
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px" }}>
          Jul 2026 – 2046 · Goal: $5,000,000 Net Worth
        </p>

        {/* ═══ Dashboard View ═══ */}
        {activeView === "dashboard" && (
          <>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {/* Card 1: Current Net Worth */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Net Worth</p>
                <p style={{ fontSize: "26px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>{formattedNw}</p>
                {nwDelta !== null && (
                  <p style={{ fontSize: "13px", color: nwDelta >= 0 ? "#4ade80" : "#f87171", margin: "0 0 10px" }}>
                    {nwDelta >= 0 ? "+" : "-"}${Math.abs(nwDelta).toLocaleString()} this month
                  </p>
                )}
                {/* Interactive Sparkline */}
                <div style={{ position: "relative", marginTop: "6px" }}>
                  <svg width={sparkW} height={sparkH} style={{ display: "block" }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
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
                        {nwValues.map((v, i) => {
                          const x = nwValues.length > 1 ? (i / (nwValues.length - 1)) * sparkW : sparkW / 2;
                          const y = sparkH - ((v - minNw) / nwRange) * (sparkH - 4) - 2;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r={hoveredPoint === i ? 4 : 2.5}
                              fill={hoveredPoint === i ? "#4ade80" : "#0F6E56"}
                              stroke={hoveredPoint === i ? "#fff" : "none"}
                              strokeWidth="1.5"
                              style={{ cursor: "pointer", transition: "r 0.1s" }}
                              onMouseEnter={() => setHoveredPoint(i)}
                            />
                          );
                        })}
                      </>
                    )}
                  </svg>
                  {hoveredPoint !== null && log[hoveredPoint] && (
                    <div style={{
                      position: "absolute", bottom: `${sparkH + 4}px`,
                      left: `${nwValues.length > 1 ? (hoveredPoint / (nwValues.length - 1)) * sparkW : sparkW / 2}px`,
                      transform: "translateX(-50%)",
                      background: "#334155", borderRadius: "6px", padding: "6px 10px",
                      fontSize: "11px", color: "#f1f5f9", whiteSpace: "nowrap",
                      pointerEvents: "none", zIndex: 10, border: "1px solid #475569",
                    }}>
                      <div style={{ fontWeight: 600 }}>{log[hoveredPoint].date}</div>
                      <div style={{ color: nwValues[hoveredPoint] >= 0 ? "#4ade80" : "#f87171" }}>
                        {nwValues[hoveredPoint] >= 0 ? "$" : "-$"}{Math.abs(nwValues[hoveredPoint]).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Overall Progress (donut) */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px", alignSelf: "flex-start" }}>Overall Progress</p>
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
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Phase</p>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px" }}>{phase.sub}</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 10px" }}>{phaseDone} / {phaseTotal} tasks complete</p>
                <div style={{ height: "3px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${phaseTotal ? (phaseDone / phaseTotal) * 100 : 0}%`, height: "100%", background: accent, borderRadius: "2px", transition: "width 0.3s" }} />
                </div>
              </div>

              {/* Card 4: Task Progress */}
              <div style={{ background: "#1e293b", borderRadius: "10px", padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Task Progress</p>
                <p style={{ fontSize: "26px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>{completedTasks}/{totalTasks}</p>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 10px" }}>
                  {totalTasks ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0}% complete
                </p>
                <div style={{ height: "3px", background: "#334155", borderRadius: "2px", overflow: "hidden", marginBottom: "10px" }}>
                  <div style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%`, height: "100%", background: "#0F6E56", borderRadius: "2px", transition: "width 0.3s" }} />
                </div>
                <button onClick={() => setActiveView("completed")} style={{ background: "none", border: "none", padding: 0, fontSize: "11px", color: "#4ade80", cursor: "pointer", textDecoration: "none" }}>
                  View completed →
                </button>
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
                    padding: "8px 16px", borderRadius: "8px", fontSize: "14px",
                    flexShrink: 0, border: "none", cursor: "pointer",
                    background: isActive ? "#1e293b" : "transparent",
                    color: isActive ? phaseAccent : "#94a3b8",
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? `2px solid ${phaseAccent}` : "2px solid transparent",
                  }}>
                    <span>{p.title}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{p.sub}</span>
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
                {phase.groups.filter(group => !completedArchive.some(a => a.groupId === group.id)).map((group) => {
                  const gDone = group.tasks.filter(t => progress[t.id] || NW_MILESTONES.some(m => m.id === t.id && currentNw >= m.threshold)).length;
                  const gTotal = group.tasks.length;
                  const isCollapsed = !!collapsedGroups[group.id];
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
                        <span style={{ fontSize: "15px", fontWeight: 500, color: "#f1f5f9", flex: 1 }}>{group.label}</span>
                        <span style={{ fontSize: "13px", color: gDone === gTotal ? "#4ade80" : "#94a3b8" }}>
                          {gDone}/{gTotal}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b", transition: "transform 0.2s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                      </div>

                      {/* Tasks */}
                      {!isCollapsed && group.tasks.map((task) => {
                        const catDef = CAT[task.cat] || { label: task.cat, bg: "#334155", color: "#94a3b8" };
                        const isNwMilestone = NW_MILESTONES.some(m => m.id === task.id);
                        const isChecked = isNwMilestone
                          ? currentNw >= (NW_MILESTONES.find(m => m.id === task.id)?.threshold || Infinity)
                          : !!progress[task.id];
                        return (
                          <div
                            key={task.id}
                            onClick={isNwMilestone ? undefined : () => toggle(task.id)}
                            style={{
                              padding: "10px 16px 10px 42px", display: "flex", gap: "10px",
                              alignItems: "flex-start", cursor: isNwMilestone ? "default" : "pointer",
                              borderTop: "1px solid #334155", background: "transparent",
                            }}
                            onMouseEnter={isNwMilestone ? undefined : (e => { e.currentTarget.style.background = "#253247"; })}
                            onMouseLeave={isNwMilestone ? undefined : (e => { e.currentTarget.style.background = "transparent"; })}
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
                                fontSize: "11px", padding: "2px 6px", borderRadius: "3px",
                                fontWeight: 500, flexShrink: 0, marginTop: "2px",
                                background: catDef.bg, color: catDef.color,
                              }}>{catDef.label}</span>
                              <span style={{
                                fontSize: "14px", lineHeight: "1.55",
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

        {/* ═══ Accounts View (from sidebar) ═══ */}
        {activeView === "accounts" && renderAccounts()}

        {/* ═══ Future Implementation View (from sidebar) ═══ */}
        {activeView === "future" && renderFuture()}

        {/* ═══ Earned not Given View (from sidebar) ═══ */}
        {activeView === "earned" && renderEarned()}

        {/* ═══ Completed View (from task progress link) ═══ */}
        {activeView === "completed" && (
          <div>
            <button onClick={() => setActiveView("dashboard")} style={{ background: "none", border: "none", padding: 0, fontSize: "13px", color: "#4ade80", cursor: "pointer", marginBottom: "16px" }}>
              ← Back to Dashboard
            </button>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px" }}>Completed</h3>
            {completedArchive.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No completed groups yet. When all tasks in a group are checked off, it will appear here with a timestamp.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {completedArchive.map(entry => (
                  <div key={entry.id} style={{ padding: "14px 16px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#4ade80" }}>{entry.groupLabel}</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(entry.completedAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 8px" }}>{entry.phaseTitle}</p>
                    {entry.tasks.map(t => (
                      <div key={t.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "4px 0" }}>
                        <span style={{ fontSize: "10px", color: "#4ade80" }}>✓</span>
                        <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  /* ─── Render helpers ─── */
  function renderEarned() {
    const pending = earnedItems.filter(item => !item.completed);
    const completed = earnedItems.filter(item => item.completed);
    const activeList = earnedTab === "pending" ? pending : completed;

    // Sort logic
    const sortedList = [...activeList].sort((a, b) => {
      if (earnedSort === "price-asc") return (a.price || 0) - (b.price || 0);
      if (earnedSort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (earnedSort === "name") return (a.name || a.text || "").localeCompare(b.name || b.text || "");
      if (earnedSort === "progress") return parseFloat(getItemProgress(b) || "0") - parseFloat(getItemProgress(a) || "0");
      return 0;
    });

    // Stats
    const totalValue = earnedItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalRewards = earnedItems.length;
    const completedCount = completed.length;

    // Ring SVG
    const ringRadius = 38;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringProgress = totalRewards > 0 ? (completedCount / totalRewards) : 0;
    const ringOffset = ringCircumference - ringProgress * ringCircumference;

    // Progress calculation per item based on goalType
    function getItemProgress(item) {
      if (item.completed) return "100.00";
      if (!item.goalType || item.goalType === "none") return null;
      if (item.goalType === "debtfree") {
        const debtStart = item.debtStart || 45000;
        const currentDebt = log.length > 0 ? parseFloat(String(log[log.length - 1].debt).replace(/[^0-9.]/g, "")) || 0 : debtStart;
        const paid = debtStart - currentDebt;
        const pct = Math.max(0, Math.min((paid / debtStart) * 100, 100));
        return pct.toFixed(2);
      }
      if (item.goalType === "networth") {
        const target = item.goalTarget || 1;
        const pct = Math.max(0, Math.min((currentNw / target) * 100, 100));
        return pct.toFixed(2);
      }
      return "0.00";
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ═══ Header ═══ */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "15px", color: "#94a3b8", margin: "0 0 4px" }}>Welcome back, Nick 👋</p>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>
            Earned not Given 🎁
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
            Lifestyle purchases earned through financial discipline.<br />
            Check off when you get it to yourself.
          </p>
        </div>

        {/* ═══ Stats Bar ═══ */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#1e293b", borderRadius: "12px", padding: "20px 28px", border: "1px solid #334155" }}>
          {/* Ring */}
          <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={ringRadius} fill="none" stroke="#334155" strokeWidth="6" />
              <circle cx="45" cy="45" r={ringRadius} fill="none" stroke="#0F6E56" strokeWidth="6"
                strokeDasharray={ringCircumference} strokeDashoffset={ringOffset}
                strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#4ade80" }}>{totalRewards}</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Total Rewards</span>
            </div>
          </div>

          {/* Total Value */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>${totalValue.toLocaleString()}</p>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Total Value</p>
          </div>

          {/* Completed */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{completedCount}</p>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Completed</p>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "60px", background: "#334155", margin: "0 12px" }} />

          {/* Discipline Pays */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>🏆</span>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Discipline Pays</p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, maxWidth: "220px", lineHeight: 1.4 }}>
                Every reward on this list represents choices you made today.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Tabs + Controls Row ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "24px", borderBottom: "2px solid #334155", paddingBottom: "0" }}>
            <button onClick={() => setEarnedTab("pending")} style={{
              background: "none", border: "none", padding: "8px 0", fontSize: "14px", cursor: "pointer",
              color: earnedTab === "pending" ? "#4ade80" : "#94a3b8",
              fontWeight: earnedTab === "pending" ? 600 : 400,
              borderBottom: earnedTab === "pending" ? "2px solid #4ade80" : "2px solid transparent",
              marginBottom: "-2px",
            }}>
              Pending ({pending.length})
            </button>
            <button onClick={() => setEarnedTab("completed")} style={{
              background: "none", border: "none", padding: "8px 0", fontSize: "14px", cursor: "pointer",
              color: earnedTab === "completed" ? "#4ade80" : "#94a3b8",
              fontWeight: earnedTab === "completed" ? 600 : 400,
              borderBottom: earnedTab === "completed" ? "2px solid #4ade80" : "2px solid transparent",
              marginBottom: "-2px",
            }}>
              Completed ({completed.length})
            </button>
          </div>

          {/* Sort + View Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>Sort by:</span>
              <select value={earnedSort} onChange={e => setEarnedSort(e.target.value)} style={{
                background: "#1e293b", border: "1px solid #334155", borderRadius: "6px",
                padding: "6px 10px", fontSize: "13px", color: "#e2e8f0", cursor: "pointer",
              }}>
                <option value="custom">Custom</option>
                <option value="progress">Closest to Completion</option>
                <option value="price-desc">Price (High → Low)</option>
                <option value="price-asc">Price (Low → High)</option>
                <option value="name">Name</option>
              </select>
            </div>
            {/* View toggle */}
            <div style={{ display: "flex", background: "#1e293b", borderRadius: "6px", border: "1px solid #334155", overflow: "hidden" }}>
              <button onClick={() => setEarnedViewMode("grid")} style={{
                background: earnedViewMode === "grid" ? "#334155" : "transparent", border: "none",
                padding: "6px 10px", cursor: "pointer", color: earnedViewMode === "grid" ? "#4ade80" : "#64748b", fontSize: "14px",
              }}>⊞</button>
              <button onClick={() => setEarnedViewMode("list")} style={{
                background: earnedViewMode === "list" ? "#334155" : "transparent", border: "none",
                padding: "6px 10px", cursor: "pointer", color: earnedViewMode === "list" ? "#4ade80" : "#64748b", fontSize: "14px",
              }}>≡</button>
            </div>
          </div>
        </div>

        {/* ═══ Rewards Grid / List ═══ */}
        {earnedViewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {sortedList.length === 0 && (
              <p style={{ fontSize: "13px", color: "#64748b", gridColumn: "1 / -1" }}>
                {earnedTab === "pending" ? "No pending rewards. Add something you're working toward." : "Nothing completed yet. Keep grinding."}
              </p>
            )}
            {sortedList.map(item => {
              const itemProg = getItemProgress(item);
              return (
              <div key={item.id} style={{
                background: "#0b1120", borderRadius: "10px", border: "1px solid #334155",
                overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
                opacity: item.completed ? 0.7 : 1,
              }}>
                {/* Status badge */}
                <span style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: item.completed ? "#0F6E56" : "#1e40af",
                  color: "#fff", fontSize: "clamp(8px, 1.2vw, 11px)", fontWeight: 600,
                  padding: "clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px)", borderRadius: "4px", letterSpacing: "0.3px", zIndex: 2,
                  whiteSpace: "nowrap",
                }}>
                  {item.completed ? "Earned" : "Pending"}
                </span>
                {/* Checkbox */}
                {!item.completed && (
                  <div
                    onClick={() => completeEarnedItem(item.id)}
                    style={{
                      position: "absolute", top: "8px", left: "8px",
                      width: "16px", height: "16px", borderRadius: "3px",
                      border: "1.5px solid #475569", background: "rgba(15,23,42,0.6)",
                      cursor: "pointer", zIndex: 2,
                    }}
                    title="Mark as earned"
                  />
                )}
                {item.completed && (
                  <div style={{
                    position: "absolute", top: "8px", left: "8px",
                    width: "16px", height: "16px", borderRadius: "3px",
                    border: "1.5px solid #0F6E56", background: "#0F6E56",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                  }}>
                    <span style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}>✓</span>
                  </div>
                )}
                {/* Item name/description — top left, below checkbox */}
                <div style={{ padding: "28px 10px 4px", zIndex: 1 }}>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 2px", lineHeight: 1.3 }}>
                    {item.name || item.text}
                  </p>
                  {item.subtitle && <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{item.subtitle}</p>}
                  {item.description && <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{item.description}</p>}
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontStyle: "italic" }}>{item.category}</p>
                </div>
                {/* Image — fills remaining space */}
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "4px 8px",
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name || item.text} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: "40px", opacity: 0.3 }}>🎁</span>
                  )}
                </div>
                {/* Price + Progress % at bottom */}
                <div style={{ padding: "6px 10px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "17px", fontWeight: 700, color: "#4ade80" }}>${(item.price || 0).toLocaleString()}</span>
                  {itemProg !== null && <span style={{ fontSize: "15px", color: "#94a3b8" }}>{itemProg}%</span>}
                </div>
                {/* Progress bar */}
                {itemProg !== null && (
                  <div style={{ height: "5px", background: "#334155", flexShrink: 0 }}>
                    <div style={{ height: "100%", width: `${parseFloat(itemProg)}%`, background: "#4ade80", borderRadius: "0 3px 3px 0", transition: "width 0.3s ease" }} />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sortedList.length === 0 && (
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                {earnedTab === "pending" ? "No pending rewards." : "Nothing completed yet."}
              </p>
            )}
            {sortedList.map(item => {
              const prog = getItemProgress(item);
              return (
              <div key={item.id} style={{
                padding: "12px 16px", background: "#1e293b", borderRadius: "10px",
                border: "1px solid #334155", display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div
                  onClick={() => !item.completed && completeEarnedItem(item.id)}
                  style={{
                    width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                    border: item.completed ? "1.5px solid #0F6E56" : "1.5px solid #475569",
                    background: item.completed ? "#0F6E56" : "transparent",
                    cursor: item.completed ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {item.completed && <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>✓</span>}
                </div>
                {item.image && (
                  <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    <img src={item.image} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: item.completed ? "#64748b" : "#e2e8f0", margin: 0, textDecoration: item.completed ? "line-through" : "none" }}>
                    {item.name || item.text}
                  </p>
                  {item.category && <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>{item.category}</p>}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#4ade80", flexShrink: 0 }}>
                  ${(item.price || 0).toLocaleString()}
                </span>
                {prog !== null && <span style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0 }}>{prog}%</span>}
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px",
                  background: item.completed ? "#0F6E56" : "#1e40af", color: "#fff", flexShrink: 0,
                }}>
                  {item.completed ? "Earned" : "Pending"}
                </span>
                <button onClick={() => removeEarnedItem(item.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "16px", padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
              );
            })}
          </div>
        )}

        {/* ═══ Add Reward Footer Bar ═══ */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          background: "#1e293b", borderRadius: "12px", padding: "16px 24px",
          border: "1px solid #334155",
        }}>
          <span style={{ fontSize: "28px" }}>🎁</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 2px" }}>Add a reward you&apos;re working toward...</p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Add any goal that motivates you to keep building your future.</p>
          </div>
          <button onClick={() => {
            const name = prompt("Reward name:");
            if (!name) return;
            const category = prompt("Category (Vehicle / Watch / Tech / Other):", "Watch");
            const priceStr = prompt("Price ($):", "0");
            const price = parseFloat(priceStr) || 0;
            setEarnedItems(prev => [...prev, { id: `earn-${Date.now()}`, name, category: category || "Other", price, image: null, goalType: "none", goalTarget: 0, completed: false, completedAt: null }]);
          }} style={{
            padding: "10px 20px", fontSize: "13px", fontWeight: 600, borderRadius: "8px",
            border: "1px solid #0F6E56", background: "transparent", color: "#4ade80", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            + Add Reward
          </button>
        </div>
      </div>
    );
  }

  function renderFuture() {
    return (
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px" }}>Future Implementation</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" }}>Ideas and strategies to research and implement later.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {futureNotes.map(note => (
            <div key={note.id} style={{ padding: "12px 16px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "13px", color: "#e2e8f0", flex: 1, lineHeight: 1.5 }}>{note.text}</span>
              <button onClick={() => removeFutureNote(note.id)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", padding: "0 4px", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={futureDraft}
            onChange={e => setFutureDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addFutureNote(); }}
            placeholder="Type a new idea or strategy to look into..."
            style={{ flex: 1, padding: "10px 14px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#0f172a", color: "#e2e8f0" }}
          />
          <button onClick={addFutureNote} style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 500, borderRadius: "6px", border: "1px solid #0F6E56", background: "transparent", color: "#4ade80", cursor: "pointer" }}>Add</button>
        </div>
      </div>
    );
  }

  function renderAccounts() {
    function addSalaryEntry() {
      if (!salaryDraft.year || !salaryDraft.salary) return;
      setSalaryHistory(prev => [{ ...salaryDraft }, ...prev]);
      setSalaryDraft({ year: "", title: "", employer: "", salary: "" });
      setShowSalaryForm(false);
    }

    const accountsTotal = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const otherAssetsTotal = otherAssets.reduce((s, a) => s + (Number(a.value) || 0), 0);
    const totalBalance = accountsTotal + otherAssetsTotal;
    const cashTotal = accounts.filter(a => a.badge === "savings").reduce((s, a) => s + (a.balance || 0), 0);
    const retirementTotal = accounts.filter(a => a.badge === "retirement").reduce((s, a) => s + (a.balance || 0), 0);
    const brokerageTotal = accounts.filter(a => a.badge === "brokerage").reduce((s, a) => s + (a.balance || 0), 0);
    const cryptoTotal = accounts.filter(a => a.badge === "speculative").reduce((s, a) => s + (a.balance || 0), 0);
    const totalDebt = log.length > 0 ? parseFloat(String(log[log.length - 1].debt).replace(/[^0-9.]/g, "")) || 0 : 0;

    const badgeColors = { savings: "#94a3b8", retirement: "#3b82f6", brokerage: "#059669", speculative: "#ec4899" };
    const badgeLabels = { savings: "Cash", retirement: "Retirement", brokerage: "Brokerage", speculative: "Crypto" };

    // Other-asset categories: how each is tagged, charted, and iconed.
    const OTHER_ASSET_CATEGORIES = {
      vehicles: { tag: "Car Value", chartLabel: "Vehicles", color: "#7c3aed", placeholder: "Car (e.g. 2024 GMC Yukon)" },
      home: { tag: "Home Value", chartLabel: "Real Estate", color: "#eab308", placeholder: "Property (e.g. Primary Residence)" },
      other: { tag: "Other", chartLabel: "Other", color: "#f97316", placeholder: "Asset (e.g. Art collection)" },
    };
    const getAssetCat = (asset) => OTHER_ASSET_CATEGORIES[asset.category] || OTHER_ASSET_CATEGORIES.other;
    const trackedAccounts = ["acc3", "acc4", "acc5", "acc6"]; // Empower, Fidelity Roth, Fidelity CMA, Capital One

    function getGrowth(accId) {
      const logs = accountChangeLog.filter(l => l.accId === accId);
      if (logs.length === 0) return null;
      const first = logs[0].newBalance;
      const acc = accounts.find(a => a.id === accId);
      const current = acc?.balance || 0;
      if (first === 0) return null;
      return ((current - first) / Math.abs(first) * 100).toFixed(2);
    }

    function openUpdateModal(acc) {
      setUpdateModal({ accId: acc.id, accName: acc.name, accType: acc.type, currentBalance: acc.balance });
      setUpdateDraft({ value: String(acc.balance), note: "" });
    }

    function openOtherAssetModal(asset) {
      setUpdateModal({ accId: asset.id, accName: asset.name, accType: asset.type, currentBalance: Number(asset.value) || 0, isOtherAsset: true });
      setUpdateDraft({ value: String(Number(asset.value) || 0), note: "" });
    }

    function confirmUpdate() {
      if (!updateModal) return;
      const newBal = parseFloat(updateDraft.value) || 0;
      const oldBal = updateModal.currentBalance;

      if (updateModal.isOtherAsset) {
        setOtherAssets(prev => prev.map(a => a.id === updateModal.accId ? { ...a, value: newBal } : a));
      } else {
        setAccounts(prev => prev.map(a => a.id === updateModal.accId ? { ...a, balance: newBal } : a));
      }

      // Log the change for tracked accounts and all other assets
      if (updateModal.isOtherAsset || trackedAccounts.includes(updateModal.accId)) {
        setAccountChangeLog(prev => [...prev, {
          id: `log-${Date.now()}`,
          accId: updateModal.accId,
          accName: updateModal.accName,
          accType: updateModal.accType,
          assetKind: updateModal.isOtherAsset ? "other" : "account",
          oldBalance: oldBal,
          newBalance: newBal,
          change: newBal - oldBal,
          changePct: oldBal !== 0 ? ((newBal - oldBal) / Math.abs(oldBal) * 100).toFixed(2) : "N/A",
          note: updateDraft.note || "",
          date: new Date().toISOString(),
        }]);
      }

      setUpdateModal(null);
      setUpdateDraft({ value: "", note: "" });
    }

    // Per-category totals for other assets, charted under their own labels.
    const otherAssetCatData = Object.entries(OTHER_ASSET_CATEGORIES).map(([key, cfg]) => ({
      label: cfg.chartLabel,
      value: otherAssets.filter(a => (a.category || "other") === key).reduce((s, a) => s + (Number(a.value) || 0), 0),
      color: cfg.color,
    }));

    // Allocation donut
    const allocData = [
      { label: "Cash", value: cashTotal, color: "#94a3b8" },
      { label: "Retirement", value: retirementTotal, color: "#3b82f6" },
      { label: "Brokerage", value: brokerageTotal, color: "#059669" },
      { label: "Crypto", value: cryptoTotal, color: "#ec4899" },
      ...otherAssetCatData,
    ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    const allocTotal = allocData.reduce((s, d) => s + d.value, 0);

    return (
      <div style={{ position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Accounts Overview</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>All your accounts. One place. Total financial picture.</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowChangeLog(true)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>📋</span> Change Log
            </button>
            <button onClick={() => setShowSalaryPanel(true)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>💼</span> Salary History
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "14px 16px", border: "1px solid #334155" }}>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 6px", textTransform: "uppercase" }}>Total Assets</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>${totalBalance.toLocaleString()}</p>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "14px 16px", border: "1px solid #334155" }}>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 6px", textTransform: "uppercase" }}>Cash</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>${cashTotal.toLocaleString()}</p>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>{allocTotal > 0 ? ((cashTotal / allocTotal) * 100).toFixed(1) : 0}% of assets</p>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "14px 16px", border: "1px solid #334155" }}>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 6px", textTransform: "uppercase" }}>Total Investments</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>${(retirementTotal + brokerageTotal + cryptoTotal).toLocaleString()}</p>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>{allocTotal > 0 ? (((retirementTotal + brokerageTotal + cryptoTotal) / allocTotal) * 100).toFixed(1) : 0}% of assets</p>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "14px 16px", border: "1px solid #334155" }}>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 6px", textTransform: "uppercase" }}>Total Debt</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#f87171", margin: 0 }}>${totalDebt.toLocaleString()}</p>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>Student loans</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "28px" }}>
          {/* Account List */}
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 500, color: "#f1f5f9", margin: "0 0 12px" }}>All Accounts</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {[...accounts].sort((a, b) => {
                const catOrder = { brokerage: 0, savings: 1, retirement: 2, speculative: 3 };
                const catA = catOrder[a.badge] ?? 99;
                const catB = catOrder[b.badge] ?? 99;
                if (catA !== catB) return catA - catB;
                return a.name.localeCompare(b.name);
              }).map(acc => {
                const logos = { NFCU: "/nfcu-logo.png", USAA: "/USAA logo.png", Empower: "/Empower logo.png", Fidelity: "/fidelity-logo.png", "Capital One": "/Capital-One-Logo.png", Robinhood: "/robinhood-logo.png" };
                const growth = trackedAccounts.includes(acc.id) ? getGrowth(acc.id) : null;
                return (
                  <div key={acc.id} style={{ background: "#1e293b", borderRadius: "8px", padding: "18px 24px", border: "1px solid #334155", display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: "20px", alignItems: "center", minHeight: "70px" }}>
                    {/* Logo */}
                    <img src={logos[acc.name] || ""} alt={acc.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", background: "#334155" }} />
                    {/* Name + type */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>{acc.name}</span>
                        <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "4px", fontWeight: 500, background: `${badgeColors[acc.badge] || "#475569"}22`, color: badgeColors[acc.badge] || "#94a3b8" }}>
                          {badgeLabels[acc.badge] || acc.type}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>{acc.description}</p>
                    </div>
                    {/* Balance (display only — locked in) */}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 2px" }}>Current Balance</p>
                      <p style={{ fontSize: "20px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>${(acc.balance || 0).toLocaleString()}</p>
                    </div>
                    {/* Growth (for tracked accounts) */}
                    <div style={{ textAlign: "right", minWidth: "80px" }}>
                      {trackedAccounts.includes(acc.id) ? (
                        <>
                          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 2px" }}>All Time Growth</p>
                          <p style={{ fontSize: "16px", fontWeight: 500, color: growth !== null && parseFloat(growth) >= 0 ? "#4ade80" : growth !== null ? "#f87171" : "#64748b", margin: 0 }}>
                            {growth !== null ? `${parseFloat(growth) >= 0 ? "+" : ""}${growth}%` : "—"}
                          </p>
                        </>
                      ) : (
                        <>
                          {acc.metric === "limit" && <><p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 2px" }}>{acc.limit ? ((acc.balance / acc.limit) * 100).toFixed(0) + "% Used" : ""}</p><p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>{acc.metricLabel}</p></>}
                          {acc.metric === "none" && <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>—</p>}
                        </>
                      )}
                    </div>
                    {/* Update button */}
                    <button onClick={() => openUpdateModal(acc)} style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#94a3b8", cursor: "pointer" }}>
                      Update
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocation Sidebar */}
          <div>
            <div style={{ background: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 500, color: "#f1f5f9", margin: "0 0 14px" }}>Allocation by Type</h4>
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 14px" }}>
                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                  {(() => {
                    let offset = 0;
                    const circumference = 2 * Math.PI * 45;
                    return allocData.map((d, i) => {
                      const pct = allocTotal > 0 ? d.value / allocTotal : 0;
                      const dash = pct * circumference;
                      const el = <circle key={i} cx="60" cy="60" r="45" fill="none" stroke={d.color} strokeWidth="12" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} />;
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>${(allocTotal / 1000).toFixed(1)}k</p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>Total</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {allocData.map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{allocTotal > 0 ? ((d.value / allocTotal) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══ Other Assets ═══ */}
        <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #1e293b", width: "calc(100% - 308px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ fontSize: "22px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>Other Assets</h4>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {otherAssets.map(asset => {
              const cat = getAssetCat(asset);
              return (
              <div key={asset.id} style={{ background: "#1e293b", borderRadius: "8px", padding: "16px 24px", border: "1px solid #334155", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "20px", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 600, color: "#f1f5f9" }}>{asset.name}</span>
                    <span style={{ fontSize: "14px", padding: "3px 10px", borderRadius: "4px", fontWeight: 500, background: `${cat.color}22`, color: cat.color }}>{cat.tag}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 2px" }}>Estimated Value</p>
                  <p style={{ fontSize: "20px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>${(Number(asset.value) || 0).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button onClick={() => openOtherAssetModal(asset)} style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#94a3b8", cursor: "pointer" }}>
                    Update
                  </button>
                  <button onClick={() => setOtherAssets(prev => prev.filter(a => a.id !== asset.id))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#f87171", padding: "2px 6px" }} title="Remove asset">🗑</button>
                </div>
              </div>
              );
            })}
            {otherAssets.length === 0 && (
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0" }}>No other assets yet. Add one below.</p>
            )}
          </div>

          {/* Add other-asset form */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={otherAssetDraft.category}
              onChange={e => setOtherAssetDraft(prev => ({ ...prev, category: e.target.value }))}
              style={{ padding: "10px 14px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0", cursor: "pointer" }}
            >
              <option value="vehicles">Car Value</option>
              <option value="home">Home Value</option>
              <option value="other">Other</option>
            </select>
            <input
              value={otherAssetDraft.name}
              onChange={e => setOtherAssetDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder={OTHER_ASSET_CATEGORIES[otherAssetDraft.category]?.placeholder || "Asset name"}
              style={{ flex: "1 1 240px", padding: "10px 14px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }}
            />
            <input
              type="number"
              value={otherAssetDraft.value}
              onChange={e => setOtherAssetDraft(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Worth ($)"
              style={{ width: "160px", padding: "10px 14px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }}
            />
            <button
              onClick={() => {
                if (!otherAssetDraft.name.trim() || !otherAssetDraft.value) return;
                const cfg = OTHER_ASSET_CATEGORIES[otherAssetDraft.category] || OTHER_ASSET_CATEGORIES.other;
                const newId = `oa-${Date.now()}`;
                const newVal = Number(otherAssetDraft.value) || 0;
                const newName = otherAssetDraft.name.trim();
                setOtherAssets(prev => [...prev, { id: newId, category: otherAssetDraft.category, type: cfg.tag, name: newName, value: newVal }]);
                setAccountChangeLog(prev => [...prev, {
                  id: `log-${Date.now()}`,
                  accId: newId,
                  accName: newName,
                  accType: cfg.tag,
                  assetKind: "other",
                  oldBalance: 0,
                  newBalance: newVal,
                  change: newVal,
                  changePct: "N/A",
                  note: `Added new ${cfg.tag} asset`,
                  date: new Date().toISOString(),
                }]);
                setOtherAssetDraft({ category: "vehicles", name: "", value: "" });
              }}
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}
            >+ Add</button>
          </div>
        </div>

        {/* Salary History Slide-out Panel */}
        {showSalaryPanel && (
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "480px", background: "#0f172a", borderLeft: "1px solid #334155", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Salary Through the Years</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>Your career compensation history.</p>
              </div>
              <button onClick={() => setShowSalaryPanel(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 100px", gap: "16px", padding: "0 0 10px", borderBottom: "1px solid #334155", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Year</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Job Title</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Employer</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, textAlign: "right" }}>Salary</span>
              </div>
              {/* Entries */}
              {salaryHistory.map((entry, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 100px", gap: "16px", padding: "12px 0", borderBottom: "1px solid #1e293b", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#f1f5f9" }}>{entry.year}</span>
                  <span style={{ fontSize: "14px", color: "#e2e8f0" }}>{entry.title}</span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>{entry.employer}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", textAlign: "right" }}>${Number(entry.salary).toLocaleString()}</span>
                </div>
              ))}
              {/* Add entry form */}
              <button onClick={() => setShowSalaryForm(prev => !prev)} style={{ width: "100%", marginTop: "16px", padding: "12px", fontSize: "14px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#334155", color: "#e2e8f0", cursor: "pointer" }}>+ Add Entry</button>
              {showSalaryForm && (
                <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "70px 1fr 1fr 100px", gap: "10px", alignItems: "center" }}>
                  <input value={salaryDraft.year} onChange={e => setSalaryDraft(p => ({ ...p, year: e.target.value }))} placeholder="Year" style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }} />
                  <input value={salaryDraft.title} onChange={e => setSalaryDraft(p => ({ ...p, title: e.target.value }))} placeholder="Job Title" style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }} />
                  <input value={salaryDraft.employer} onChange={e => setSalaryDraft(p => ({ ...p, employer: e.target.value }))} placeholder="Employer" style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }} />
                  <input value={salaryDraft.salary} onChange={e => setSalaryDraft(p => ({ ...p, salary: e.target.value }))} placeholder="Salary" style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#e2e8f0" }} />
                  <button onClick={addSalaryEntry} style={{ gridColumn: "1 / -1", padding: "10px", fontSize: "13px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#059669", color: "#fff", cursor: "pointer" }}>Save</button>
                </div>
              )}
            </div>
          </div>
        )}

        {updateModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155", width: "380px", maxWidth: "90vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>Confirm Balance Update</h4>
                <button onClick={() => setUpdateModal(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}>×</button>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px" }}>You're about to update the balance for:</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <img src={{ NFCU: "/nfcu-logo.png", USAA: "/USAA logo.png", Empower: "/Empower logo.png", Fidelity: "/fidelity-logo.png", "Capital One": "/Capital-One-Logo.png", Robinhood: "/robinhood-logo.png" }[updateModal.accName] || ""} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", background: "#334155" }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9", margin: 0 }}>{updateModal.accName}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{updateModal.accType}</p>
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px" }}>New Balance</p>
              <input
                type="number"
                value={updateDraft.value}
                onChange={e => setUpdateDraft(prev => ({ ...prev, value: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") confirmUpdate(); }}
                autoFocus
                style={{ width: "100%", padding: "10px 14px", fontSize: "20px", fontWeight: 700, border: "1px solid #334155", borderRadius: "8px", background: "#0f172a", color: "#4ade80", boxSizing: "border-box", marginBottom: "12px" }}
              />
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px" }}>Are you sure you want to save this change?</p>
              {trackedAccounts.includes(updateModal.accId) && (
                <>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "12px 0 4px" }}>Note (optional)</p>
                  <textarea
                    value={updateDraft.note}
                    onChange={e => setUpdateDraft(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="e.g. Market gain, monthly contribution..."
                    maxLength={200}
                    style={{ width: "100%", padding: "8px 12px", fontSize: "12px", border: "1px solid #334155", borderRadius: "6px", background: "#0f172a", color: "#e2e8f0", resize: "none", height: "60px", boxSizing: "border-box" }}
                  />
                  <p style={{ fontSize: "10px", color: "#475569", margin: "2px 0 0", textAlign: "right" }}>{updateDraft.note.length}/200</p>
                </>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button onClick={() => setUpdateModal(null)} style={{ flex: 1, padding: "10px", fontSize: "13px", borderRadius: "6px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Cancel</button>
                <button onClick={confirmUpdate} style={{ flex: 1, padding: "10px", fontSize: "13px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer" }}>Confirm & Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Change Log Slide-out Panel */}
        {showChangeLog && (
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "420px", background: "#0f172a", borderLeft: "1px solid #334155", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Change Log</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>History of balance updates for your tracked accounts.</p>
              </div>
              <button onClick={() => setShowChangeLog(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {accountChangeLog.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginTop: "40px" }}>No changes logged yet. Update a tracked account to start.</p>
              ) : (() => {
                const categoryOrder = [
                  { key: "savings", label: "Cash", color: "#94a3b8" },
                  { key: "retirement", label: "Retirement", color: "#3b82f6" },
                  { key: "brokerage", label: "Brokerage", color: "#059669" },
                  { key: "speculative", label: "Crypto", color: "#ec4899" },
                  { key: "other", label: "Other Assets", color: "#f59e0b" },
                ];
                const getCategory = (entry) => {
                  if (entry.assetKind === "other") return "other";
                  const acc = accounts.find(a => a.id === entry.accId);
                  return acc?.badge || "savings";
                };
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {categoryOrder.map(cat => {
                      const entries = [...accountChangeLog].reverse().filter(e => getCategory(e) === cat.key);
                      if (entries.length === 0) return null;
                      return (
                        <div key={cat.key}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color }} />
                            <span style={{ fontSize: "12px", fontWeight: 600, color: cat.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.label}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>({entries.length})</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {entries.map(entry => (
                              <div key={entry.id} style={{ padding: "12px 14px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{entry.accName}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: entry.note ? "6px" : 0 }}>
                                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>${entry.oldBalance.toLocaleString()}</span>
                                  <span style={{ fontSize: "10px", color: "#64748b" }}>→</span>
                                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#f1f5f9" }}>${entry.newBalance.toLocaleString()}</span>
                                  <span style={{ fontSize: "11px", color: entry.change >= 0 ? "#4ade80" : "#f87171", marginLeft: "6px" }}>
                                    {entry.change >= 0 ? "+" : ""}${entry.change.toLocaleString()} ({entry.changePct}%)
                                  </span>
                                </div>
                                {entry.note && <p style={{ fontSize: "11px", color: "#64748b", margin: 0, fontStyle: "italic" }}>{entry.note}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }

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
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = Object.keys(earningsData).sort();
    const lifetimeTotal = years.reduce((sum, y) => sum + Object.values(earningsData[y]).reduce((s, v) => s + (v || 0), 0), 0);


    // Net worth chart data — responsive, uses percentage-based layout
    const chartViewW = 1000, chartViewH = 260;
    const chartPadLeft = 60, chartPadRight = 30, chartPadTop = 20, chartPadBot = 40;
    const plotW = chartViewW - chartPadLeft - chartPadRight;
    const plotH = chartViewH - chartPadTop - chartPadBot;
    const nwChartValues = log.map(e => computeNw(e));
    const nwChartMin = Math.min(...nwChartValues, 0);
    const nwChartMax = Math.max(...nwChartValues, 1);
    const nwChartRange = nwChartMax - nwChartMin || 1;

    const chartPoints = nwChartValues.map((v, i) => {
      const x = chartPadLeft + (nwChartValues.length > 1 ? (i / (nwChartValues.length - 1)) * plotW : plotW / 2);
      const y = chartPadTop + plotH - ((v - nwChartMin) / nwChartRange) * plotH;
      return { x, y, value: v, label: log[i].date };
    });
    const polyline = chartPoints.map(p => `${p.x},${p.y}`).join(" ");
    const areaPolygon = `${chartPadLeft},${chartPadTop + plotH} ${polyline} ${chartPoints[chartPoints.length - 1]?.x || chartPadLeft},${chartPadTop + plotH}`;

    // Y-axis ticks
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => nwChartMin + (nwChartRange / yTicks) * i);

    function updateMonth(year, month, value) {
      const num = parseFloat(value) || 0;
      setEarningsData(prev => ({
        ...prev,
        [year]: { ...prev[year], [month]: num },
      }));
    }

    function formatCompact(val) {
      if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val.toFixed(0)}`;
    }

    // ─── Expense tracking helpers ───
    const activeCatKeys = EXPENSE_PERIOD_CATEGORIES[expenseYear] || EXPENSE_CATEGORIES.map(c => c.key);
    const activeCats = EXPENSE_CATEGORIES.filter(c => activeCatKeys.includes(c.key));
    const periodExpenses = expenseData[expenseYear] || {};

    // Total for a category across the whole period.
    const catTotal = (catKey, period = expenseYear) => {
      const months = (expenseData[period] || {})[catKey] || {};
      return EXPENSE_MONTHS.reduce((s, m) => s + (Number(months[m]) || 0), 0);
    };
    // Value for a given month.
    const catMonth = (catKey, month) => Number((periodExpenses[catKey] || {})[month]) || 0;

    // Latest month with any data entered across active categories, and the one before it.
    const monthsWithData = EXPENSE_MONTHS.filter(m => activeCatKeys.some(k => catMonth(k, m) > 0));
    const latestMonth = monthsWithData[monthsWithData.length - 1] || null;
    const prevMonth = latestMonth ? EXPENSE_MONTHS[EXPENSE_MONTHS.indexOf(latestMonth) - 1] : null;

    // Month-over-month % change for a category (latest vs prev month).
    const catDelta = (catKey) => {
      if (!latestMonth || !prevMonth) return null;
      const cur = catMonth(catKey, latestMonth);
      const prev = catMonth(catKey, prevMonth);
      if (prev === 0) return cur === 0 ? 0 : null; // no baseline
      return ((cur - prev) / prev) * 100;
    };

    const periodTotalAll = activeCatKeys.reduce((s, k) => s + catTotal(k), 0);
    const latestMonthTotal = latestMonth ? activeCatKeys.reduce((s, k) => s + catMonth(k, latestMonth), 0) : 0;
    const prevMonthTotal = prevMonth ? activeCatKeys.reduce((s, k) => s + catMonth(k, prevMonth), 0) : 0;
    const totalDeltaPct = prevMonthTotal > 0 ? ((latestMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;

    const money = (v) => `$${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const catLabel = (key) => EXPENSE_CATEGORIES.find(c => c.key === key)?.label || key;

    function updateExpense(period, catKey, month, value) {
      const num = parseFloat(value) || 0;
      setExpenseData(prev => ({
        ...prev,
        [period]: {
          ...(prev[period] || {}),
          [catKey]: { ...((prev[period] || {})[catKey] || {}), [month]: num },
        },
      }));
    }

    function generateExpenseReport() {
      const period = EXPENSE_PERIODS.find(p => p.key === expenseYear);
      const rows = activeCats.map(c => {
        const total = catTotal(c.key);
        const pct = periodTotalAll > 0 ? ((total / periodTotalAll) * 100).toFixed(1) : "0.0";
        return `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd">${c.label}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right">${money(total)}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right">${pct}%</td></tr>`;
      }).join("");
      const monthRows = EXPENSE_MONTHS.map(m => {
        const tot = activeCatKeys.reduce((s, k) => s + catMonth(k, m), 0);
        return `<tr><td style="padding:4px 10px">${m}</td><td style="padding:4px 10px;text-align:right">${money(tot)}</td></tr>`;
      }).join("");
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Expense Report ${period?.label || expenseYear}</title></head>
        <body style="font-family:Arial,sans-serif;color:#111;padding:32px;max-width:760px;margin:auto">
          <h1 style="margin:0 0 4px">Expense Report</h1>
          <p style="color:#555;margin:0 0 20px">${period?.range || expenseYear} · Total: <strong>${money(periodTotalAll)}</strong></p>
          <h2 style="font-size:16px;margin:0 0 8px">By Category</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px"><thead><tr>
            <th style="text-align:left;padding:6px 10px;border-bottom:2px solid #111">Category</th>
            <th style="text-align:right;padding:6px 10px;border-bottom:2px solid #111">Total</th>
            <th style="text-align:right;padding:6px 10px;border-bottom:2px solid #111">% of Spend</th>
          </tr></thead><tbody>${rows}</tbody></table>
          <h2 style="font-size:16px;margin:0 0 8px">Monthly Totals</h2>
          <table style="width:100%;border-collapse:collapse"><tbody>${monthRows}</tbody></table>
          <p style="color:#888;font-size:12px;margin-top:24px">Generated ${new Date().toLocaleDateString()}</p>
        </body></html>`;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
      }
    }

    function DeltaBadge({ pct }) {
      if (pct === null) return <span style={{ fontSize: "11px", color: "#64748b" }}>— new</span>;
      const up = pct > 0.05, down = pct < -0.05;
      const color = up ? "#f87171" : down ? "#4ade80" : "#94a3b8";
      const arrow = up ? "↑" : down ? "↓" : "—";
      return <span style={{ fontSize: "11px", color }}>{arrow} {Math.abs(pct).toFixed(1)}%</span>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ═══ Page Header ═══ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
              Financial Breakdown <span style={{ fontSize: "18px" }}>📈</span>
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Track your income, expenses, debt, and net worth over time.</p>
          </div>
        </div>

        {/* ═══ Net Worth Over Time Chart (own section, capped height) ═══ */}
        <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px 24px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>NET WORTH OVER TIME</p>
            <span style={{ fontSize: "12px", color: "#94a3b8", background: "#0f172a", padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155" }}>
              Since {log[0]?.date || "—"}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <svg width="100%" viewBox={`0 0 ${chartViewW} ${chartViewH}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block", width: "100%", height: "auto", minHeight: "200px", maxHeight: "400px" }}
              onMouseLeave={() => setHoveredChartPoint(null)}
            >
              <defs>
                <linearGradient id="nwChartFillLg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F6E56" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0F6E56" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Y-axis grid lines + labels */}
              {yTickValues.map((val, i) => {
                const y = chartPadTop + plotH - ((val - nwChartMin) / nwChartRange) * plotH;
                return (
                  <g key={i}>
                    <line x1={chartPadLeft} y1={y} x2={chartViewW - chartPadRight} y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 3" />
                    <text x={chartPadLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{formatCompact(val)}</text>
                  </g>
                );
              })}
              {/* Area fill */}
              {chartPoints.length > 1 && <polygon points={areaPolygon} fill="url(#nwChartFillLg)" />}
              {/* Line */}
              {chartPoints.length > 1 && <polyline points={polyline} fill="none" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {/* Data points with hover */}
              {chartPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredChartPoint === i ? 6 : 3.5}
                  fill={hoveredChartPoint === i ? "#4ade80" : "#0F6E56"}
                  stroke={hoveredChartPoint === i ? "#fff" : "#0f172a"}
                  strokeWidth={hoveredChartPoint === i ? 2 : 1.5}
                  style={{ cursor: "pointer", transition: "r 0.15s, fill 0.15s" }}
                  onMouseEnter={() => setHoveredChartPoint(i)}
                />
              ))}
              {/* X-axis labels */}
              {chartPoints.map((p, i) => (
                <text key={i} x={p.x} y={chartViewH - 8} textAnchor="middle" fontSize="11" fill="#64748b">{p.label}</text>
              ))}
            </svg>
            {/* Tooltip on hover */}
            {hoveredChartPoint !== null && chartPoints[hoveredChartPoint] && (() => {
              const pt = chartPoints[hoveredChartPoint];
              const pctX = ((pt.x) / chartViewW) * 100;
              const pctY = ((pt.y) / chartViewH) * 100;
              return (
                <div style={{
                  position: "absolute",
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                  transform: "translate(-50%, -130%)",
                  background: "#334155",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 10,
                  border: "1px solid #475569",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>{pt.label}</div>
                  <div style={{ color: pt.value >= 0 ? "#4ade80" : "#f87171", fontWeight: 500 }}>
                    {pt.value >= 0 ? "$" : "-$"}{Math.abs(pt.value).toLocaleString()}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ═══ Total Earnings + Lifetime Earnings By Year (single row) ═══ */}
        <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "16px 24px", display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Left ~20%: Total Earnings */}
          <div style={{ flexShrink: 0, minWidth: "180px" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Total Earnings (All Time)</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#a78bfa", margin: 0 }}>
              ${lifetimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {/* Divider */}
          <div style={{ width: "1px", height: "36px", background: "#334155", flexShrink: 0 }} />
          {/* Right ~80%: Lifetime Earnings By Year */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>LIFETIME EARNINGS BY YEAR</p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Total income received each year.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", flex: 1, justifyContent: "flex-end", overflowX: "auto" }}>
            {years.map(year => {
              const yearTotal = Object.values(earningsData[year]).reduce((s, v) => s + (v || 0), 0);
              return (
                <div key={year}
                  onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                  style={{ textAlign: "center", cursor: "pointer", padding: "4px 12px", borderRadius: "6px", background: expandedYear === year ? "#334155" : "transparent", transition: "background 0.15s" }}
                >
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 2px" }}>{year}</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>${yearTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              const nextYear = String(Math.max(...years.map(Number)) + 1);
              if (!earningsData[nextYear]) {
                const emptyMonths = {};
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].forEach(m => { emptyMonths[m] = 0; });
                setEarningsData(prev => ({ ...prev, [nextYear]: emptyMonths }));
                setExpandedYear(nextYear);
              }
            }}
            style={{ background: "#0F6E56", border: "none", color: "#fff", fontSize: "11px", fontWeight: 500, cursor: "pointer", padding: "6px 12px", borderRadius: "6px", whiteSpace: "nowrap" }}
            title="Add next year"
          >+ Add Year</button>
          <button
            onClick={() => setExpandedYear(expandedYear ? null : years[years.length - 1])}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer", padding: "4px" }}
            title="Expand monthly breakdown"
          >⌄</button>
        </div>

        {/* Expanded year monthly breakdown */}
        {expandedYear && earningsData[expandedYear] && (
          <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#f1f5f9" }}>{expandedYear} Monthly Breakdown</span>
              <button onClick={() => setExpandedYear(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
              {MONTHS.map(month => {
                const value = earningsData[expandedYear][month] || 0;
                const locked = expandedYear === "2021" || (earningsData[expandedYear].Dec > 0 && expandedYear !== String(new Date().getFullYear()));
                return (
                  <div key={month} style={{ padding: "10px", background: "#0f172a", borderRadius: "6px" }}>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 4px", textTransform: "uppercase" }}>{month}</p>
                    {locked ? (
                      <p style={{ fontSize: "12px", fontWeight: 500, color: value > 0 ? "#e2e8f0" : "#475569", margin: 0 }}>
                        {value > 0 ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                      </p>
                    ) : (
                      <input
                        type="number"
                        value={value || ""}
                        onChange={e => updateMonth(expandedYear, month, e.target.value)}
                        placeholder="0.00"
                        style={{ width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #334155", borderRadius: "4px", background: "#1e293b", color: "#e2e8f0", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Expense Categories Section ═══ */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Expense Categories</h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Total spent across all categories for the selected period.</p>
            </div>
            <select
              value={expenseYear}
              onChange={e => { setExpenseYear(e.target.value); setEditingCategory(null); }}
              style={{ padding: "8px 12px", fontSize: "12px", border: "1px solid #334155", borderRadius: "8px", background: "#0f172a", color: "#e2e8f0", cursor: "pointer" }}
            >
              {EXPENSE_PERIODS.map(p => <option key={p.key} value={p.key}>{p.range}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", marginBottom: "24px" }}>
            {/* Left: category panels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {activeCats.map(cat => {
                const total = catTotal(cat.key);
                const delta = catDelta(cat.key);
                const isEditing = editingCategory === cat.key;
                return (
                  <div
                    key={cat.key}
                    onClick={() => setEditingCategory(isEditing ? null : cat.key)}
                    style={{
                      background: "#1e293b", borderRadius: "12px",
                      border: isEditing ? `1px solid ${cat.color}` : "1px solid #334155",
                      padding: "16px", cursor: "pointer", transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{cat.icon}</div>
                        <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.2 }}>{cat.label}</span>
                      </div>
                      <span style={{ fontSize: "13px", color: "#475569" }}>›</span>
                    </div>
                    <p style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>{money(total)}</p>
                    <DeltaBadge pct={delta} />
                    <div style={{ height: "4px", background: "#0f172a", borderRadius: "2px", overflow: "hidden", marginTop: "10px" }}>
                      <div style={{ width: `${periodTotalAll > 0 ? Math.min((total / periodTotalAll) * 100, 100) : 0}%`, height: "100%", background: cat.color, borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: total expenses + report */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "18px 20px" }}>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px" }}>Total Expenses</p>
                <p style={{ fontSize: "26px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>{money(periodTotalAll)}</p>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #334155" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px" }}>{prevMonth ? `${prevMonth}` : "Last Month"}</p>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#94a3b8", margin: 0 }}>{money(prevMonthTotal)}</p>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px" }}>{latestMonth ? `${latestMonth}` : "This Month"}</p>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>{money(latestMonthTotal)}</p>
                    <div style={{ marginTop: "2px" }}><DeltaBadge pct={totalDeltaPct} /></div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "18px 20px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>Want a detailed view?</p>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>Generate a PDF report with a full breakdown and comparison of your spending.</p>
                <button onClick={generateExpenseReport} style={{ width: "100%", padding: "10px", fontSize: "12px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer" }}>Generate Report</button>
              </div>
            </div>
          </div>

          {/* Inline monthly editor for the selected category */}
          {editingCategory && (
            <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px 24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>{catLabel(editingCategory)} — Monthly Amounts ({EXPENSE_PERIODS.find(p => p.key === expenseYear)?.range})</span>
                <button onClick={() => setEditingCategory(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
                {EXPENSE_MONTHS.map(month => (
                  <div key={month} style={{ padding: "10px", background: "#0f172a", borderRadius: "6px" }}>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 4px", textTransform: "uppercase" }}>{month}</p>
                    <input
                      type="number"
                      value={catMonth(editingCategory, month) || ""}
                      onChange={e => updateExpense(expenseYear, editingCategory, month, e.target.value)}
                      placeholder="0.00"
                      style={{ width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #334155", borderRadius: "4px", background: "#1e293b", color: "#e2e8f0", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yearly breakdown accordion */}
          <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "16px 20px", marginBottom: "8px" }}>
            <div style={{ marginBottom: "12px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 2px" }}>Yearly Breakdown</h4>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Your spending by category for each tracking period.</p>
            </div>
            {EXPENSE_PERIODS.map(period => {
              const keys = EXPENSE_PERIOD_CATEGORIES[period.key] || [];
              const periodTotal = keys.reduce((s, k) => s + catTotal(k, period.key), 0);
              const isOpen = expandedExpenseYear === period.key;
              return (
                <div key={period.key} style={{ borderTop: "1px solid #334155" }}>
                  <div
                    onClick={() => setExpandedExpenseYear(isOpen ? null : period.key)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{period.label} <span style={{ color: "#64748b", fontWeight: 400 }}>({period.range})</span></span>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{money(periodTotal)}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{isOpen ? "⌃" : "⌄"}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", padding: "4px 4px 16px" }}>
                      {keys.map(k => {
                        const cat = EXPENSE_CATEGORIES.find(c => c.key === k);
                        const total = catTotal(k, period.key);
                        const pct = periodTotal > 0 ? ((total / periodTotal) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={k} style={{ background: "#0f172a", borderRadius: "8px", padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px" }}>{cat?.icon}</span>
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{cat?.label}</span>
                            </div>
                            <p style={{ fontSize: "15px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 2px" }}>{money(total)}</p>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{pct}%</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Financial History Section ═══ */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>📋</span>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>FINANCIAL HISTORY</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", background: "#1e293b", padding: "6px 12px", borderRadius: "6px", border: "1px solid #334155" }}>All Time</span>
              <button onClick={() => setShowAddLogEntry(true)} style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 500,
                borderRadius: "6px", border: "none",
                background: "#0F6E56", color: "#fff", cursor: "pointer",
              }}>+ Add Entry</button>
            </div>
          </div>

          <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Date", "Assets", "Debt", "Credit", "Net Worth", "Actions"].map(h => (
                    <th key={h} style={{ width: h === "Actions" ? "80px" : "auto", textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#94a3b8", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...log].reverse().map((entry, idx) => {
                  const realIdx = log.length - 1 - idx;
                  const nwVal = computeNw(entry);
                  const nwColor = nwVal >= 0 ? "#4ade80" : "#f87171";
                  return (
                    <tr key={realIdx} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ textAlign: "left", padding: "12px 16px", color: "#e2e8f0" }}>{entry.date}</td>
                      <td style={{ textAlign: "left", padding: "12px 16px", color: "#e2e8f0" }}>{entry.assets ? `$${Number(String(entry.assets).replace(/[^0-9.]/g, "")).toLocaleString()}` : "—"}</td>
                      <td style={{ textAlign: "left", padding: "12px 16px", color: "#e2e8f0" }}>{entry.debt ? `$${Number(String(entry.debt).replace(/[^0-9.]/g, "")).toLocaleString()}` : "—"}</td>
                      <td style={{ textAlign: "left", padding: "12px 16px", color: "#e2e8f0" }}>{entry.credit || "—"}</td>
                      <td style={{ textAlign: "left", padding: "12px 16px", color: nwColor, fontWeight: 500 }}>
                        {nwVal >= 0 ? `$${nwVal.toLocaleString()}` : `-$${Math.abs(nwVal).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: "left", padding: "12px 16px" }}>
                        <button onClick={() => {
                          setEditingLogIdx(realIdx);
                          setLogDraft({ date: entry.date, assets: entry.assets || "", netWorth: entry.netWorth || "", salary: entry.salary || "", debt: entry.debt || "", credit: entry.credit || "" });
                        }} style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "13px", color: "#94a3b8", padding: "2px 6px",
                        }} title="Edit entry">✏️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add/Edit entry inline form — columns aligned under the table headers */}
          {(showAddLogEntry || editingLogIdx !== null) && (() => {
            const computedNw = (parseNw(logDraft.assets) || 0) - (parseNw(logDraft.debt) || 0);
            const inputStyle = { width: "100%", padding: "8px 12px", fontSize: "12px", border: "1px solid #334155", borderRadius: "6px", background: "#0f172a", color: "#e2e8f0", boxSizing: "border-box" };
            const labelStyle = { fontSize: "11px", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" };
            const save = () => {
              const entryToSave = { ...logDraft, netWorth: String(computedNw) };
              if (editingLogIdx !== null) {
                setLog(prev => prev.map((entry, i) => i === editingLogIdx ? entryToSave : entry));
                setEditingLogIdx(null);
              } else {
                if (!logDraft.date || !logDraft.assets) return;
                setLog(prev => [...prev, entryToSave]);
                setShowAddLogEntry(false);
              }
              setLogDraft({ date: "", assets: "", netWorth: "", salary: "", debt: "", credit: "" });
            };
            const cancel = () => { setShowAddLogEntry(false); setEditingLogIdx(null); setLogDraft({ date: "", assets: "", netWorth: "", salary: "", debt: "", credit: "" }); };
            return (
              <div style={{ marginTop: "16px", background: "#1e293b", borderRadius: "10px", padding: "16px", border: "1px solid #334155" }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "12px" }}>
                  {editingLogIdx !== null ? "Edit Entry" : "New Entry"}
                </span>
                {/* Same column layout as the table: Date | Assets | Debt | Credit | Net Worth | Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input value={logDraft.date} onChange={e => setLogDraft(prev => ({ ...prev, date: e.target.value }))} placeholder="e.g. Oct 2026" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Assets</label>
                    <input value={logDraft.assets} onChange={e => setLogDraft(prev => ({ ...prev, assets: e.target.value }))} placeholder="Assets" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Debt</label>
                    <input value={logDraft.debt} onChange={e => setLogDraft(prev => ({ ...prev, debt: e.target.value }))} placeholder="Debt" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Credit</label>
                    <input value={logDraft.credit} onChange={e => setLogDraft(prev => ({ ...prev, credit: e.target.value }))} placeholder="Credit" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Net Worth</label>
                    <div style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600, color: computedNw >= 0 ? "#4ade80" : "#f87171" }}>
                      {computedNw >= 0 ? `$${computedNw.toLocaleString()}` : `-$${Math.abs(computedNw).toLocaleString()}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={save} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer" }}>Save</button>
                    <button onClick={cancel} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Footer note */}
          <p style={{ fontSize: "11px", color: "#64748b", margin: "12px 0 0", fontStyle: "italic" }}>
            ⓘ Net Worth = Assets − Debt, calculated automatically from each entry.
          </p>
        </div>
      </div>
    );
  }
}
