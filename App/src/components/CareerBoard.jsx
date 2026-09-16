import { useState, useEffect } from "react";

/* ─── Seed data (used on first load, before anything is persisted) ─── */
const INITIAL_JOBS = [
  {
    id: "job-leidos",
    company: "Leidos",
    title: "IT Analyst",
    department: "",
    startDate: "Mar 2025",
    endDate: "Apr 2026",
    current: true,
    location: "Norfolk, VA",
    salary: "",
    responsibilities: [
      "Managed enterprise-scale NMCI systems supporting secure network, endpoint, and identity operations on NNPI and SIPR designated systems.",
      "Managed LDAP-based Active Directory & FlankSpeed environments — provisioning user & computer accounts, managing group memberships, and troubleshooting Group Policy application issues.",
    ],
    notes: "",
  },
  {
    id: "job-tower",
    company: "Tower Federal Credit Union",
    title: "Cybersecurity Analyst Intern",
    department: "",
    startDate: "Jun 2023",
    endDate: "Aug 2023",
    current: false,
    location: "Laurel, MD",
    salary: "",
    responsibilities: [
      "Authored an API Security Standard to govern the secure transition to Microsoft Azure.",
      "Designed four operational playbooks using Tines (SOAR), successfully automating two core services and backup processes to increase productivity.",
      "Developed and presented a comprehensive Incident Response Summary to the CEO and Board of Directors following a third-party vendor compromise.",
    ],
    notes: "",
  },
];

const EMPTY_DRAFT = { company: "", title: "", department: "", startDate: "", endDate: "", location: "", salary: "", notes: "" };

// Bump when the seed data changes to force a one-time refresh of persisted jobs.
const SEED_VERSION = 2;

export default function CareerBoard() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [activeSection, setActiveSection] = useState("career");
  const [expandedJobId, setExpandedJobId] = useState("job-leidos");
  const [jobTab, setJobTab] = useState({}); // { [jobId]: "responsibilities" | "notes" }
  const [editingJobId, setEditingJobId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  // Load persisted data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/career-board-data");
        if (res.ok) {
          const data = await res.json();
          // Only use stored jobs if they were saved against the current seed
          // version; otherwise keep the fresh seed (one-time refresh).
          if (data && !cancelled && Array.isArray(data.jobs) && data.seedVersion === SEED_VERSION) {
            setJobs(data.jobs);
          }
        }
      } catch { /* local-only fallback */ }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist whenever jobs change (after initial load)
  useEffect(() => {
    if (!dataLoaded) return;
    fetch("/api/career-board-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs, seedVersion: SEED_VERSION }),
    }).catch(() => { /* silent */ });
  }, [dataLoaded, jobs]);

  // Derived overview stats
  const totalPositions = jobs.length;
  const totalResponsibilities = jobs.reduce((s, j) => s + (j.responsibilities?.length || 0), 0);

  function addJob() {
    if (!draft.company.trim() || !draft.title.trim()) return;
    const isCurrent = !draft.endDate.trim();
    const newJob = {
      id: `job-${Date.now()}`,
      company: draft.company.trim(),
      title: draft.title.trim(),
      department: draft.department.trim(),
      startDate: draft.startDate.trim(),
      endDate: draft.endDate.trim() || "Present",
      current: isCurrent,
      location: draft.location.trim(),
      salary: draft.salary.trim(),
      responsibilities: [],
      notes: draft.notes.trim(),
    };
    setJobs(prev => [newJob, ...prev]);
    setDraft(EMPTY_DRAFT);
    setExpandedJobId(newJob.id);
  }

  function removeJob(id) {
    setJobs(prev => prev.filter(j => j.id !== id));
  }

  function updateJob(id, patch) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard"},
    { key: "career", label: "Career Board"},
    { key: "certifications", label: "Certifications"},
    { key: "goals", label: "Goals"},
  ];

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, fontFamily: "var(--font-sans)", background: "#0b1220", color: "#e2e8f0" }}>
      {/* ═══ Left Sidebar ═══ */}
      <aside style={{ width: "220px", flexShrink: 0, background: "#0b1220", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "20px 0", height: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 20px 20px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💼</div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>CareerBoard</p>
            <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>Track. Build. Advance.</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "16px 12px" }}>
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
        <div style={{ padding: "0 20px", marginTop: "auto" }}>
          <p style={{ fontSize: "11px", fontStyle: "italic", color: "#475569", margin: 0, lineHeight: 1.5 }}>
            &ldquo;The best time to plant a tree was 20 years ago. The second best time is now.&rdquo;
          </p>
        </div>
      </aside>

      {/* ═══ Main + Right column ═══ */}
      <div style={{ flex: 1, display: "flex", minWidth: 0, height: "100%", overflowY: "auto" }}>
        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 32px", minWidth: 0 }}>
          <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px" }}>Career Board</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px", maxWidth: "560px", lineHeight: 1.5 }}>
            Keep track of your work history, key responsibilities, and achievements. This will help you build a strong, detailed resume when you&apos;re ready.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {jobs.map(job => {
              const isExpanded = expandedJobId === job.id;
              const tab = jobTab[job.id] || "responsibilities";
              const isEditing = editingJobId === job.id;
              return (
                <div key={job.id} style={{ background: "#111c30", borderRadius: "12px", border: "1px solid #1e293b" }}>
                  {/* Job header */}
                  <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc" }}>{job.company}</span>
                        {job.current && (
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "12px", background: "#065f4633", color: "#34d399" }}>Current</span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 8px" }}>
                        {job.title}{job.department ? `  |  ${job.department}` : ""}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "#64748b" }}>
                        <span>📅 {job.startDate} – {job.endDate}</span>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.salary && <span>💵 {job.salary}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <button onClick={() => setEditingJobId(isEditing ? null : job.id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#cbd5e1", cursor: "pointer" }}>✏️ Edit</button>
                      <button onClick={() => setExpandedJobId(isExpanded ? null : job.id)} style={{ padding: "6px 10px", fontSize: "14px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#94a3b8", cursor: "pointer" }} title={isExpanded ? "Collapse" : "Expand"}>{isExpanded ? "⌃" : "⌄"}</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "0 20px 20px" }}>
                      {/* Tabs */}
                      <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #1e293b", marginBottom: "16px" }}>
                        {["responsibilities", "notes"].map(t => (
                          <button key={t} onClick={() => setJobTab(prev => ({ ...prev, [job.id]: t }))} style={{
                            background: "none", border: "none", cursor: "pointer",
                            padding: "8px 0", fontSize: "13px", fontWeight: 500,
                            color: tab === t ? "#60a5fa" : "#94a3b8",
                            borderBottom: tab === t ? "2px solid #60a5fa" : "2px solid transparent",
                          }}>{t === "responsibilities" ? "Responsibilities & Achievements" : "Notes"}</button>
                        ))}
                      </div>

                      {tab === "responsibilities" ? (
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", margin: "0 0 12px" }}>Key Responsibilities &amp; What I&apos;ve Done</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {job.responsibilities.map((r, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                <span style={{ color: "#3b82f6", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✔</span>
                                <span style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5, flex: 1 }}>{r}</span>
                                {isEditing && (
                                  <button onClick={() => updateJob(job.id, { responsibilities: job.responsibilities.filter((_, idx) => idx !== i) })} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "13px" }}>✕</button>
                                )}
                              </div>
                            ))}
                            {job.responsibilities.length === 0 && (
                              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>No responsibilities added yet.</p>
                            )}
                          </div>
                          {isEditing && (
                            <AddResponsibility onAdd={(text) => updateJob(job.id, { responsibilities: [...job.responsibilities, text] })} />
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={job.notes}
                          onChange={e => updateJob(job.id, { notes: e.target.value })}
                          placeholder="Add any additional notes about this role…"
                          style={{ width: "100%", minHeight: "100px", padding: "12px", fontSize: "13px", border: "1px solid #334155", borderRadius: "8px", background: "#0f172a", color: "#e2e8f0", resize: "vertical", boxSizing: "border-box" }}
                        />
                      )}

                      {isEditing && (
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1e293b" }}>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", margin: "0 0 10px" }}>Edit Job Details</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <EditField label="Company" value={job.company} onChange={v => updateJob(job.id, { company: v })} />
                            <EditField label="Job Title" value={job.title} onChange={v => updateJob(job.id, { title: v })} />
                            <EditField label="Department" value={job.department} onChange={v => updateJob(job.id, { department: v })} />
                            <EditField label="Location" value={job.location} onChange={v => updateJob(job.id, { location: v })} />
                            <EditField label="Start Date" value={job.startDate} onChange={v => updateJob(job.id, { startDate: v })} />
                            <EditField label="End Date" value={job.endDate} onChange={v => updateJob(job.id, { endDate: v, current: v.trim().toLowerCase() === "present" || !v.trim() })} />
                            <EditField label="Salary" value={job.salary} onChange={v => updateJob(job.id, { salary: v })} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
                            <button onClick={() => removeJob(job.id)} style={{ padding: "8px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete Job</button>
                            <button onClick={() => setEditingJobId(null)} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Done</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {jobs.length === 0 && (
              <p style={{ fontSize: "13px", color: "#64748b" }}>No jobs added yet. Use the form on the right to add one.</p>
            )}
          </div>
        </main>

        {/* Right column */}
        <aside style={{ width: "320px", flexShrink: 0, padding: "28px 24px 28px 0", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Career Overview */}
          <div style={{ background: "#111c30", borderRadius: "12px", border: "1px solid #1e293b", padding: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 16px" }}>Career Overview</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <OverviewStat icon="💼" value={String(totalPositions)} label="Total Positions" />
              <OverviewStat icon="📅" value="2+" label="Years of Experience" />
              <OverviewStat icon="☑️" value={String(totalResponsibilities)} label="Key Responsibilities Tracked" />
              <OverviewStat icon="⭐" value="3" label="Projects" />
            </div>
          </div>

          {/* Add New Job */}
          <div style={{ background: "#111c30", borderRadius: "12px", border: "1px solid #1e293b", padding: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 16px" }}>Add New Job</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <DraftField label="Company Name *" placeholder="e.g. Peraton" value={draft.company} onChange={v => setDraft(p => ({ ...p, company: v }))} />
              <DraftField label="Job Title *" placeholder="e.g. Cybersecurity Engineer" value={draft.title} onChange={v => setDraft(p => ({ ...p, title: v }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <DraftField label="Start Date *" placeholder="e.g. Aug 2024" value={draft.startDate} onChange={v => setDraft(p => ({ ...p, startDate: v }))} />
                <DraftField label="End Date" placeholder="e.g. Present" value={draft.endDate} onChange={v => setDraft(p => ({ ...p, endDate: v }))} />
              </div>
              <DraftField label="Location" placeholder="e.g. Herndon, VA" value={draft.location} onChange={v => setDraft(p => ({ ...p, location: v }))} />
              <DraftField label="Salary (Optional)" placeholder="e.g. $100,000" value={draft.salary} onChange={v => setDraft(p => ({ ...p, salary: v }))} />
              <div>
                <label style={labelStyle}>Notes (Optional)</label>
                <textarea value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))} placeholder="Add any additional details about this role…" style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} />
              </div>
              <button onClick={addJob} style={{ padding: "12px", fontSize: "13px", fontWeight: 600, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", marginTop: "4px" }}>+ Add Job</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */
const labelStyle = { fontSize: "12px", fontWeight: 500, color: "#94a3b8", display: "block", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "9px 12px", fontSize: "13px", border: "1px solid #334155", borderRadius: "6px", background: "#0f172a", color: "#e2e8f0", boxSizing: "border-box" };

function OverviewStat({ icon, value, label }) {
  return (
    <div style={{ background: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b", padding: "14px" }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <p style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: "6px 0 2px" }}>{value}</p>
      <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.3 }}>{label}</p>
    </div>
  );
}

function DraftField({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function EditField({ label, value, onChange }) {
  return (
    <div>
      <label style={{ ...labelStyle, fontSize: "11px", marginBottom: "4px" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, padding: "7px 10px", fontSize: "12px" }} />
    </div>
  );
}

function AddResponsibility({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text.trim()); setText(""); } }}
        placeholder="Add a responsibility or achievement…"
        style={{ ...inputStyle, flex: 1 }}
      />
      <button onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); } }} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
    </div>
  );
}
