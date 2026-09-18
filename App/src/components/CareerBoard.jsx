import { useState, useEffect, useMemo } from "react";

/* ─── Start with an empty board; entries are created by the user. ─── */
const INITIAL_ENTRIES = [];

// Bump when the seed data changes to force a one-time refresh of persisted entries.
const SEED_VERSION = 4;

const ALL_TAGS = ["Personal", "Career", "Growth", "Work", "Finance"];

const newEntryTemplate = () => ({
  id: `entry-${Date.now()}`,
  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  title: "Untitled Entry",
  tags: [],
  body: "",
});

/**
 * Render a journal body: lines ending in ":" become section headers,
 * lines starting with "- " become bullets, blank lines are spacing.
 */
function renderBody(body) {
  const lines = body.split("\n");
  const out = [];
  let bulletBuffer = [];

  const flushBullets = (key) => {
    if (bulletBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} style={{ margin: "0 0 14px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {bulletBuffer.map((b, i) => (
          <li key={i} style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6 }}>{b}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
      return;
    }
    flushBullets(idx);
    if (line === "") {
      return;
    }
    if (line.endsWith(":")) {
      out.push(
        <p key={idx} style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0", margin: "8px 0 10px" }}>
          {line.slice(0, -1)}
        </p>
      );
    } else {
      out.push(
        <p key={idx} style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 14px" }}>
          {line}
        </p>
      );
    }
  });
  flushBullets("end");
  return out;
}

export default function CareerBoard() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [activeSection, setActiveSection] = useState("journal");
  const [selectedId, setSelectedId] = useState(INITIAL_ENTRIES[0]?.id || null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [editing, setEditing] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/career-board-data");
        if (res.ok) {
          const data = await res.json();
          if (data && !cancelled && Array.isArray(data.entries) && data.seedVersion === SEED_VERSION) {
            setEntries(data.entries);
            setSelectedId(data.entries[0]?.id || null);
          }
        }
      } catch { /* local-only fallback */ }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist whenever entries change (after initial load)
  useEffect(() => {
    if (!dataLoaded) return;
    fetch("/api/career-board-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries, seedVersion: SEED_VERSION }),
    }).catch(() => { /* silent */ });
  }, [dataLoaded, entries]);

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

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "journal", label: "Career Journal", icon: "📓" },
    { key: "certifications", label: "Certifications", icon: "🎓" },
    { key: "goals", label: "Goals", icon: "🎯" },
    { key: "settings", label: "Settings", icon: "⚙️" },
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
          <span style={{ fontSize: "16px", color: "#64748b" }}>🔔</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600 }}>NM</div>
            <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Nicholas M.</span>
          </div>
        </div>
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

        {/* Middle: entry list */}
        <section style={{ width: "380px", flexShrink: 0, borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "24px 24px 16px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>Career Journal</h2>
              <button onClick={addEntry} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>+ New Entry</button>
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.5 }}>
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
                  onClick={() => { setSelectedId(entry.id); setEditing(false); }}
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
            <div style={{ maxWidth: "720px" }}>
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
                placeholder={"Write your entry…\n\nTip: end a line with ':' for a section header, and start a line with '- ' for a bullet."}
                style={{ width: "100%", minHeight: "340px", fontSize: "14px", lineHeight: 1.6, color: "#cbd5e1", background: "#0f1a2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "16px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
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
            <div style={{ maxWidth: "720px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>{selected.date}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#cbd5e1", cursor: "pointer" }}>✏️ Edit</button>
                  <button onClick={() => removeEntry(selected.id)} title="Delete entry" style={{ padding: "7px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#94a3b8", cursor: "pointer" }}>⋮</button>
                </div>
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f8fafc", margin: "0 0 20px" }}>{selected.title}</h1>
              <div>{renderBody(selected.body)}</div>
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
      </div>
    </div>
  );
}
