import { useState, useEffect, useMemo } from "react";

/* ─── Start with an empty board; entries are created by the user. ─── */
const INITIAL_ENTRIES = [];

const ALL_TAGS = ["Personal", "Career", "Growth", "Work", "Finance"];

// Seed certifications — ordered newest first. Users can add/edit/remove.
const INITIAL_CERTIFICATIONS = [
  { id: "cert-aws-saa", name: "AWS Certified Solutions Architect - Associate", issuer: "Amazon Web Services", earned: "June 2026" },
  { id: "cert-az-104", name: "Microsoft Certified: Azure Administrator Associate (AZ-104)", issuer: "Microsoft", earned: "April 2025" },
  { id: "cert-sec-plus", name: "CompTIA Security+", issuer: "CompTIA", earned: "December 2024" },
  { id: "cert-isc2-cc", name: "ISC2 Certified in Cybersecurity (CC)", issuer: "ISC2", earned: "August 2023" },
];

const newEntryTemplate = () => ({
  id: `entry-${Date.now()}`,
  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  title: "Untitled Entry",
  tags: [],
  body: "",
});

const newCertTemplate = () => ({
  id: `cert-${Date.now()}`,
  name: "",
  issuer: "",
  earned: "",
});

// Goals start empty; the user creates them. Each goal tracks its own status.
const INITIAL_GOALS = [];

const newGoalTemplate = () => ({
  id: `goal-${Date.now()}`,
  title: "",
  description: "",
  started: "",         // when you decided to pursue it (free text, you fill in)
  accomplished: "",    // when you completed it (free text, you fill in later)
  status: "current",   // "current" | "achieved" | "archived"
  archiveReason: "",   // why it was archived (set when status -> "archived")
});

// Parse a free-text "earned" date (e.g. "February 2026", "Feb 2026", "2026")
// into a sortable timestamp. Unparseable/blank values return -Infinity so they
// sink to the bottom of a newest-first sort (e.g. a half-typed new entry).
function parseEarnedDate(earned) {
  if (!earned || typeof earned !== "string") return -Infinity;
  const t = Date.parse(earned);
  if (!Number.isNaN(t)) return t;
  // Fallback: a bare year like "2026"
  const yearMatch = earned.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const y = Date.parse(`${yearMatch[0]}-01-01`);
    if (!Number.isNaN(y)) return y;
  }
  return -Infinity;
}

// Bullet markers by nesting depth, cycling for deeper levels.
const BULLET_MARKERS = ["•", "◦", "▪", "‣"];

/**
 * Render a journal body:
 *  - lines ending in ":" become section headers
 *  - lines starting with "- " (optionally indented) become bullets;
 *    leading whitespace (2 spaces or 1 tab per level) sets nesting depth
 *  - blank lines are spacing
 */
function renderBody(body) {
  const lines = body.split("\n");
  const out = [];
  let bulletBuffer = [];

  const flushBullets = (key) => {
    if (bulletBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} style={{ listStyle: "none", margin: "0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {bulletBuffer.map((b, i) => (
          <li key={i} style={{ display: "flex", gap: "10px", fontSize: "16px", color: "#cbd5e1", lineHeight: 1.6, paddingLeft: `${b.depth * 24}px` }}>
            <span style={{ flexShrink: 0, color: "#60a5fa" }}>{BULLET_MARKERS[b.depth % BULLET_MARKERS.length]}</span>
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((raw, idx) => {
    // Measure indentation before trimming. Tabs count as one level each;
    // every 2 leading spaces counts as one level.
    const match = raw.match(/^(\s*)-\s+(.*)$/);
    if (match) {
      const indent = match[1];
      const spaces = indent.replace(/\t/g, "  ").length; // tab = 2 spaces
      const depth = Math.floor(spaces / 2);
      bulletBuffer.push({ text: match[2], depth });
      return;
    }

    const line = raw.trim();
    flushBullets(idx);
    if (line === "") return;

    if (line.endsWith(":")) {
      out.push(
        <p key={idx} style={{ fontSize: "18px", fontWeight: 600, color: "#e2e8f0", margin: "10px 0 12px" }}>
          {line.slice(0, -1)}
        </p>
      );
    } else {
      out.push(
        <p key={idx} style={{ fontSize: "16px", color: "#cbd5e1", lineHeight: 1.65, margin: "0 0 16px" }}>
          {line}
        </p>
      );
    }
  });
  flushBullets("end");
  return out;
}

export default function CareerBoard() {
  // `loadSucceeded` is set true ONLY when the server load genuinely returns.
  // Saving is gated on this (not merely on mount completing), so a failed or
  // transient-error load can never trigger a PUT that overwrites good server
  // data with in-memory defaults.
  const [loadSucceeded, setLoadSucceeded] = useState(false);
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [certifications, setCertifications] = useState(INITIAL_CERTIFICATIONS);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [activeSection, setActiveSection] = useState("journal");
  const [selectedId, setSelectedId] = useState(INITIAL_ENTRIES[0]?.id || null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [editing, setEditing] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalView, setGoalView] = useState("current"); // "current" | "achieved" | "archived"
  const [archivingGoalId, setArchivingGoalId] = useState(null); // goal pending an archive reason
  const [archiveReasonDraft, setArchiveReasonDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/career-board-data");
        if (res.ok) {
          const data = await res.json();
          if (data && !cancelled) {
            // User-created entries are ALWAYS loaded if present — never gated
            // behind seedVersion, so stored journal content is never discarded.
            if (Array.isArray(data.entries)) {
              setEntries(data.entries);
              setSelectedId(data.entries[0]?.id || null);
            }
            // Certifications: use stored list if present; otherwise fall back to
            // the seed (covers older saves that predate the certifications field).
            if (Array.isArray(data.certifications)) {
              setCertifications(data.certifications);
            }
            // Goals: load stored list if present (covers older saves that
            // predate the goals field, which simply keep the empty default).
            if (Array.isArray(data.goals)) {
              setGoals(data.goals);
            }
          }
          // Load genuinely succeeded (server responded ok) — safe to persist now.
          if (!cancelled) setLoadSucceeded(true);
        }
        // If the response was NOT ok, we deliberately do NOT enable saving, so
        // a failed load can never overwrite good server data with defaults.
      } catch {
        // Network/transient error — leave saving disabled for this session.
        // Nothing is overwritten; the user keeps viewing in-memory defaults.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist whenever entries or certifications change — ONLY after a successful
  // load. If the load failed, loadSucceeded stays false and we never PUT,
  // guaranteeing defaults can't clobber stored data.
  useEffect(() => {
    if (!loadSucceeded) return;
    fetch("/api/career-board-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, certifications, goals }),
    }).catch(() => { /* silent */ });
  }, [loadSucceeded, entries, certifications, goals]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesTag = tagFilter === "All" || (e.tags || []).includes(tagFilter);
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [entries, tagFilter, search]);

  const selected = entries.find(e => e.id === selectedId) || null;

  function addEntry() {
    const entry = newEntryTemplate();
    setEntries(prev => [entry, ...prev]);
    setSelectedId(entry.id);
    setEditing(true);
  }

  function updateEntry(id, patch) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }

  function removeEntry(id) {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id || null);
      return next;
    });
    setEditing(false);
  }

  function toggleTag(id, tag) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const has = (entry.tags || []).includes(tag);
    updateEntry(id, { tags: has ? entry.tags.filter(t => t !== tag) : [...(entry.tags || []), tag] });
  }

  function addCertification() {
    const cert = newCertTemplate();
    setCertifications(prev => [cert, ...prev]);
    setEditingCertId(cert.id);
  }

  function updateCertification(id, patch) {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  function removeCertification(id) {
    setCertifications(prev => prev.filter(c => c.id !== id));
    if (editingCertId === id) setEditingCertId(null);
  }

  function addGoal() {
    const goal = newGoalTemplate();
    setGoals(prev => [goal, ...prev]);
    setEditingGoalId(goal.id);
  }

  function updateGoal(id, patch) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }

  function removeGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (editingGoalId === id) setEditingGoalId(null);
  }

  function achieveGoal(id) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: "achieved" } : g));
    if (editingGoalId === id) setEditingGoalId(null);
  }

  function startArchiveGoal(id) {
    setArchivingGoalId(id);
    setArchiveReasonDraft("");
  }

  function cancelArchiveGoal() {
    setArchivingGoalId(null);
    setArchiveReasonDraft("");
  }

  function confirmArchiveGoal(id) {
    const reason = archiveReasonDraft.trim();
    if (!reason) return; // require a reason
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: "archived", archiveReason: reason } : g));
    setArchivingGoalId(null);
    setArchiveReasonDraft("");
    if (editingGoalId === id) setEditingGoalId(null);
  }

  const navItems = [
    { key: "journal", label: "Career Journal" },
    { key: "certifications", label: "Certifications" },
    { key: "goals", label: "Goals" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, fontFamily: "var(--font-sans)", background: "#0a1120", color: "#e2e8f0" }}>
      {/* ═══ Top bar ═══ */}
      <header style={{ display: "flex", alignItems: "center", gap: "20px", padding: "12px 24px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "200px", flexShrink: 0 }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>📓</div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>Career Journal</span>
        </div>
        <div style={{ flex: 1, maxWidth: "560px", margin: "0 auto" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your journal…"
            style={{ width: "100%", padding: "9px 14px", fontSize: "13px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ width: "200px", flexShrink: 0 }} />
      </header>

      {/* ═══ Body: sidebar + list + reader ═══ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left sidebar */}
        <aside style={{ width: "200px", flexShrink: 0, borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "16px 0", overflowY: "auto" }}>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
            {navItems.map(item => {
              const isActive = activeSection === item.key;
              return (
                <button key={item.key} onClick={() => setActiveSection(item.key)} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "8px", border: "none",
                  background: isActive ? "#1e293b" : "transparent",
                  color: isActive ? "#60a5fa" : "#94a3b8",
                  fontSize: "14px", fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", textAlign: "left", width: "100%",
                }}>
                  <span style={{ fontSize: "15px" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "16px 20px 0" }}>
            <p style={{ fontSize: "11px", fontStyle: "italic", color: "#475569", margin: 0, lineHeight: 1.5 }}>
              &ldquo;Progress isn&apos;t about being perfect. It&apos;s about being better than yesterday.&rdquo;
            </p>
          </div>
        </aside>

        {activeSection === "certifications" ? (
          /* ═══ Certifications page ═══ */
          <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "28px 40px" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>Certifications</h2>
                <button onClick={addCertification} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add Certification</button>
              </div>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.5 }}>
                Your earned certifications. Add new ones as you accomplish them.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...certifications].sort((a, b) => parseEarnedDate(b.earned) - parseEarnedDate(a.earned)).map(cert => {
                  const isEditingCert = editingCertId === cert.id;
                  return (
                    <div key={cert.id} style={{ padding: "18px 20px", borderRadius: "12px", background: "#0f1a2e", border: "1px solid #1e293b" }}>
                      {isEditingCert ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Certification name</label>
                            <input
                              value={cert.name}
                              onChange={e => updateCertification(cert.id, { name: e.target.value })}
                              placeholder="e.g. AWS Certified Solutions Architect - Associate"
                              style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Issuer</label>
                              <input
                                value={cert.issuer}
                                onChange={e => updateCertification(cert.id, { issuer: e.target.value })}
                                placeholder="e.g. Amazon Web Services"
                                style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                              />
                            </div>
                            <div style={{ width: "180px" }}>
                              <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Earned</label>
                              <input
                                value={cert.earned}
                                onChange={e => updateCertification(cert.id, { earned: e.target.value })}
                                placeholder="e.g. June 2026"
                                style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                              />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                            <button onClick={() => removeCertification(cert.id)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete</button>
                            <button onClick={() => setEditingCertId(null)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Done</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🏅</div>
                          <div>
                            <p style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 3px" }}>{cert.name || "Untitled Certification"}</p>
                            {cert.issuer && <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 2px" }}>{cert.issuer}</p>}
                            {cert.earned && <p style={{ fontSize: "12px", color: "#60a5fa", margin: 0 }}>Earned {cert.earned}</p>}
                          </div>
                          <button onClick={() => setEditingCertId(cert.id)} style={{ padding: "7px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#cbd5e1", cursor: "pointer" }}>Edit</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {certifications.length === 0 && (
                  <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginTop: "24px" }}>
                    No certifications yet. Click &ldquo;Add Certification&rdquo; to add your first.
                  </p>
                )}
              </div>
            </div>
          </main>
        ) : activeSection === "goals" ? (
          /* ═══ Goals page ═══ */
          <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "28px 40px" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>Goals</h2>
                <button onClick={addGoal} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add Goal</button>
              </div>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.5 }}>
                Track what you&apos;re working toward. Fill in the accomplished date and mark a goal achieved when you reach it.
              </p>

              {/* View switcher: Current/Achieved tabs (left) + Archived toggle (right) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #1e293b", paddingBottom: "0" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[{ key: "current", label: "Current" }, { key: "achieved", label: "Achieved" }].map(tab => {
                    const isActive = goalView === tab.key;
                    const count = goals.filter(g => (g.status || "current") === tab.key).length;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setGoalView(tab.key)}
                        style={{
                          padding: "8px 16px", fontSize: "14px", fontWeight: isActive ? 600 : 400,
                          border: "none", background: "transparent", cursor: "pointer",
                          color: isActive ? "#60a5fa" : "#94a3b8",
                          borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                          marginBottom: "-1px",
                        }}
                      >
                        {tab.label} <span style={{ color: "#64748b", fontSize: "12px" }}>({count})</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setGoalView(goalView === "archived" ? "current" : "archived")}
                  style={{
                    padding: "6px 12px", fontSize: "12px", borderRadius: "6px", cursor: "pointer",
                    border: `1px solid ${goalView === "archived" ? "#334155" : "#1e293b"}`,
                    background: goalView === "archived" ? "#1e293b" : "transparent",
                    color: goalView === "archived" ? "#cbd5e1" : "#64748b",
                  }}
                >
                  {goalView === "archived" ? "← Back to goals" : `Archived (${goals.filter(g => g.status === "archived").length})`}
                </button>
              </div>

              {(() => {
                const groupGoals = goals.filter(g => (g.status || "current") === goalView);
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {groupGoals.map(goal => {
                        const isEditingGoal = editingGoalId === goal.id;
                        const isArchivingGoal = archivingGoalId === goal.id;
                        const canAchieve = goal.status === "current" && !!(goal.accomplished || "").trim();
                        const borderColor = goal.status === "achieved" ? "#1e3a2e" : goal.status === "archived" ? "#3a2e1e" : "#1e293b";
                        return (
                          <div key={goal.id} style={{ padding: "16px 20px", borderRadius: "12px", background: "#0f1a2e", border: `1px solid ${borderColor}` }}>
                            {isEditingGoal ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div>
                                  <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Goal</label>
                                  <input
                                    value={goal.title}
                                    onChange={e => updateGoal(goal.id, { title: e.target.value })}
                                    placeholder="e.g. Earn AWS DevOps Engineer - Professional"
                                    style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Description</label>
                                  <textarea
                                    value={goal.description}
                                    onChange={e => updateGoal(goal.id, { description: e.target.value })}
                                    placeholder="What is this goal and why does it matter?"
                                    style={{ width: "100%", minHeight: "70px", padding: "9px 12px", fontSize: "14px", lineHeight: 1.5, border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                                  />
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Started (when you decided to pursue it)</label>
                                    <input
                                      value={goal.started}
                                      onChange={e => updateGoal(goal.id, { started: e.target.value })}
                                      placeholder="e.g. September 2026"
                                      style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                                    />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Accomplished (fill in when done)</label>
                                    <input
                                      value={goal.accomplished}
                                      onChange={e => updateGoal(goal.id, { accomplished: e.target.value })}
                                      placeholder="e.g. April 2027"
                                      style={{ width: "100%", padding: "9px 12px", fontSize: "14px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
                                    />
                                  </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                                  <button onClick={() => removeGoal(goal.id)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete</button>
                                  <button onClick={() => setEditingGoalId(null)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Done</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px" }}>{goal.title || "Untitled Goal"}</p>
                                    {goal.description && <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 8px", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{goal.description}</p>}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                      {goal.started && <span style={{ fontSize: "12px", color: "#94a3b8" }}>Started: <span style={{ color: "#cbd5e1" }}>{goal.started}</span></span>}
                                      {goal.accomplished && <span style={{ fontSize: "12px", color: "#94a3b8" }}>Accomplished: <span style={{ color: goal.status === "achieved" ? "#4ade80" : "#60a5fa" }}>{goal.accomplished}</span></span>}
                                    </div>
                                    {goal.status === "archived" && goal.archiveReason && (
                                      <p style={{ fontSize: "12px", color: "#b5916a", margin: "8px 0 0", fontStyle: "italic" }}>Archived: {goal.archiveReason}</p>
                                    )}
                                  </div>
                                  <button onClick={() => setEditingGoalId(goal.id)} style={{ padding: "7px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#cbd5e1", cursor: "pointer", flexShrink: 0 }}>Edit</button>
                                </div>
                                {isArchivingGoal ? (
                                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "12px", color: "#64748b" }}>Reason for archiving</label>
                                    <textarea
                                      value={archiveReasonDraft}
                                      onChange={e => setArchiveReasonDraft(e.target.value)}
                                      placeholder="Why are you archiving this goal? (e.g. no longer relevant, replaced by a different goal)"
                                      style={{ width: "100%", minHeight: "60px", padding: "9px 12px", fontSize: "14px", lineHeight: 1.5, border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                                    />
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                      <button onClick={cancelArchiveGoal} style={{ padding: "7px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Cancel</button>
                                      <button onClick={() => confirmArchiveGoal(goal.id)} disabled={!archiveReasonDraft.trim()} style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: archiveReasonDraft.trim() ? "#b45309" : "#3a2e1e", color: archiveReasonDraft.trim() ? "#fff" : "#6b5533", cursor: archiveReasonDraft.trim() ? "pointer" : "not-allowed" }}>Archive goal</button>
                                    </div>
                                  </div>
                                ) : (goal.status === "current" && (
                                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1e293b", display: "flex", gap: "8px" }}>
                                    {canAchieve && (
                                      <button onClick={() => achieveGoal(goal.id)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#16a34a", color: "#fff", cursor: "pointer" }}>Mark as Achieved</button>
                                    )}
                                    <button onClick={() => startArchiveGoal(goal.id)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "1px solid #3a2e1e", background: "transparent", color: "#b5916a", cursor: "pointer" }}>Archive</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {groupGoals.length === 0 && (
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                          {goalView === "current" ? "No current goals. Click “Add Goal” to set one."
                            : goalView === "achieved" ? "No achieved goals yet."
                            : "No archived goals."}
                        </p>
                      )}
                    </div>
                );
              })()}
            </div>
          </main>
        ) : (
        <>
        {/* Middle: entry list */}
        <section style={{ width: "380px", flexShrink: 0, borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "24px 24px 16px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>Career Journal</h2>
              <button onClick={addEntry} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>+ New Entry</button>
            </div>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.5 }}>
              Capture your thoughts, wins, challenges, and ideas. This is your space to reflect, plan, and track your journey.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search entries…"
                style={{ flex: 1, padding: "8px 12px", fontSize: "13px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", boxSizing: "border-box" }}
              />
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                style={{ padding: "8px 10px", fontSize: "13px", border: "1px solid #1e293b", borderRadius: "8px", background: "#111c30", color: "#e2e8f0", cursor: "pointer" }}
              >
                <option value="All">All</option>
                {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredEntries.map(entry => {
              const isSelected = entry.id === selectedId;
              const preview = entry.body.replace(/\n/g, " ").slice(0, 80);
              return (
                <div
                  key={entry.id}
                  onClick={() => { setSelectedId(entry.id); setEditing(false); setMenuOpen(false); }}
                  style={{
                    padding: "14px 16px", borderRadius: "10px", cursor: "pointer",
                    background: isSelected ? "#12233f" : "#0f1a2e",
                    border: isSelected ? "1px solid #2563eb" : "1px solid #1e293b",
                    transition: "background 0.12s, border-color 0.12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{entry.date}</span>
                    <span style={{ fontSize: "14px", color: "#475569" }}>⋯</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", margin: "4px 0 4px" }}>{entry.title}</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {preview}{entry.body.length > 80 ? "…" : ""}
                  </p>
                </div>
              );
            })}
            {filteredEntries.length === 0 && (
              <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginTop: "24px" }}>
                {entries.length === 0 ? "No entries yet. Click “New Entry” to begin." : "No entries match your search."}
              </p>
            )}
          </div>
        </section>

        {/* Right: reader / editor */}
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "28px 40px" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", gap: "14px" }}>
              <p style={{ fontSize: "15px", color: "#94a3b8", margin: 0 }}>Your journal is empty.</p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Start capturing your thoughts, wins, and ideas.</p>
              <button onClick={addEntry} style={{ marginTop: "6px", padding: "9px 18px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>+ New Entry</button>
            </div>
          ) : editing ? (
            /* ── Editor ── */
            <div style={{ maxWidth: "720px", margin: 0, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <input
                  value={selected.date}
                  onChange={e => updateEntry(selected.id, { date: e.target.value })}
                  style={{ fontSize: "13px", color: "#94a3b8", background: "#111c30", border: "1px solid #1e293b", borderRadius: "6px", padding: "6px 10px", width: "160px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => removeEntry(selected.id)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete</button>
                  <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Done</button>
                </div>
              </div>
              <input
                value={selected.title}
                onChange={e => updateEntry(selected.id, { title: e.target.value })}
                placeholder="Entry title"
                style={{ width: "100%", fontSize: "24px", fontWeight: 700, color: "#f8fafc", background: "transparent", border: "none", borderBottom: "1px solid #1e293b", padding: "0 0 8px", marginBottom: "16px", boxSizing: "border-box", outline: "none" }}
              />
              <textarea
                value={selected.body}
                onChange={e => updateEntry(selected.id, { body: e.target.value })}
                onKeyDown={e => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const ta = e.target;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const next = selected.body.slice(0, start) + "  " + selected.body.slice(end);
                    updateEntry(selected.id, { body: next });
                    // Restore caret just after the inserted spaces.
                    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
                  }
                }}
                placeholder={"Write your entry…\n\nTip: end a line with ':' for a section header, and start a line with '- ' for a bullet. Press Tab (or add spaces) before '- ' to nest a sub-bullet."}
                style={{ width: "100%", minHeight: "340px", fontSize: "16px", lineHeight: 1.6, color: "#cbd5e1", background: "#0f1a2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "16px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", margin: "0 0 10px" }}>Tags</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ALL_TAGS.map(tag => {
                    const active = (selected.tags || []).includes(tag);
                    return (
                      <button key={tag} onClick={() => toggleTag(selected.id, tag)} style={{
                        padding: "5px 12px", fontSize: "12px", borderRadius: "14px", cursor: "pointer",
                        border: active ? "1px solid #2563eb" : "1px solid #334155",
                        background: active ? "#1e3a5f" : "transparent",
                        color: active ? "#93c5fd" : "#94a3b8",
                      }}>{tag}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ── Reader ── */
            <div style={{ maxWidth: "720px", margin: 0, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>{selected.date}</span>
                <div style={{ display: "flex", gap: "8px", position: "relative" }}>
                  <button onClick={() => setEditing(true)} style={{ padding: "7px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#cbd5e1", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => setMenuOpen(o => !o)} title="More options" style={{ padding: "7px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #334155", background: menuOpen ? "#1e293b" : "#0f172a", color: "#94a3b8", cursor: "pointer" }}>⋮</button>
                  {menuOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#0f1a2e", border: "1px solid #334155", borderRadius: "8px", boxShadow: "0 6px 20px rgba(0,0,0,0.4)", zIndex: 20, minWidth: "140px", overflow: "hidden" }}>
                      <button onClick={() => { setEditing(true); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: "13px", border: "none", background: "transparent", color: "#cbd5e1", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => { removeEntry(selected.id); setMenuOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: "13px", border: "none", borderTop: "1px solid #1e293b", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete entry</button>
                    </div>
                  )}
                </div>
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f8fafc", margin: "0 0 20px", textAlign: "left" }}>{selected.title}</h1>
              <div style={{ textAlign: "left" }}>{renderBody(selected.body)}</div>
              {(selected.tags || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px" }}>
                  {selected.tags.map(tag => (
                    <span key={tag} style={{ padding: "5px 14px", fontSize: "12px", borderRadius: "14px", background: "#1e3a5f", color: "#93c5fd" }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
        </>
        )}
      </div>
    </div>
  );
}
