import { useState, useRef, useEffect } from "react";

/**
 * RoadmapSelector — Dropdown that lists all roadmaps with title + completion percentage.
 * Highlights the active roadmap with a distinct visual style.
 *
 * @param {object} props
 * @param {import('../types/roadmap.js').RoadmapMeta[]} props.roadmaps
 * @param {string | null} props.activeId
 * @param {(id: string) => void} props.onSelect
 */
function RoadmapSelector({ roadmaps, activeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeRoadmap = roadmaps.find((r) => r.id === activeId);
  const activeLabel = activeRoadmap ? activeRoadmap.title : "Select Roadmap";

  function getCompletionPct(r) {
    if (!r.totalTasks) return 0;
    return Math.round((r.completedTasks / r.totalTasks) * 1000) / 10;
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)",
          color: "var(--color-text-primary)",
          fontSize: "13px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          minWidth: "140px",
          justifyContent: "space-between",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeLabel}
        </span>
        <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          role="listbox"
          aria-label="Roadmap selector"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "220px",
            margin: 0,
            padding: "4px",
            listStyle: "none",
            background: "var(--color-background-secondary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          {roadmaps.map((r) => {
            const isActive = r.id === activeId;
            const pct = getCompletionPct(r);
            return (
              <li
                key={r.id}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(r.id);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isActive
                    ? "rgba(15, 110, 86, 0.15)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #0F6E56"
                    : "3px solid transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "var(--color-background-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive
                    ? "rgba(15, 110, 86, 0.15)"
                    : "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: isActive
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                    fontWeight: isActive ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-tertiary)",
                    flexShrink: 0,
                    marginLeft: "12px",
                  }}
                >
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * GlobalProgressSummary — Shows aggregate "X/Y · Z%" across all roadmaps.
 *
 * @param {object} props
 * @param {import('../types/roadmap.js').RoadmapMeta[]} props.roadmaps
 */
function GlobalProgressSummary({ roadmaps }) {
  const totalTasks = roadmaps.reduce((sum, r) => sum + r.totalTasks, 0);
  const completedTasks = roadmaps.reduce((sum, r) => sum + r.completedTasks, 0);
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
        {completedTasks}/{totalTasks}
      </span>
      <span style={{ color: "var(--color-text-tertiary)" }}>·</span>
      <span>{pct}%</span>
    </div>
  );
}

/**
 * NavigationBar — Fixed top bar containing the app title, RoadmapSelector dropdown,
 * and GlobalProgressSummary.
 *
 * @param {object} props
 * @param {import('../types/roadmap.js').RoadmapMeta[]} props.roadmaps
 * @param {string | null} props.activeId
 * @param {(id: string) => void} props.onSelect
 * @param {(viewMode: string) => void} [props.onNavigate]
 */
export default function NavigationBar({ roadmaps, activeId, onSelect, onNavigate, onLogout }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "var(--color-background-secondary)",
        borderBottom: "1px solid var(--color-border-tertiary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Left: App title + Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate("landing")}
          aria-label="Go to dashboard"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            cursor: "pointer",
            letterSpacing: "-0.3px",
            fontFamily: "var(--font-sans)",
            background: "transparent",
            border: "none",
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
        >
          Roadmap Dashboard
        </button>

        {/* Roadmap Selector */}
        <RoadmapSelector
          roadmaps={roadmaps}
          activeId={activeId}
          onSelect={onSelect}
        />
      </div>

      {/* Right: Logout button */}
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "transparent",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            color: "var(--color-text-secondary)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text-primary)";
            e.currentTarget.style.borderColor = "var(--color-text-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.borderColor = "var(--color-border-tertiary)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M6 2a1 1 0 00-1 1v2a1 1 0 002 0V4h5v8H7v-1a1 1 0 00-2 0v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H6z"/>
            <path d="M1.3 8.7a1 1 0 010-1.4l2-2a1 1 0 111.4 1.4L4.4 7H10a1 1 0 010 2H4.4l.3.3a1 1 0 01-1.4 1.4l-2-2z"/>
          </svg>
          Logout
        </button>
      )}
    </nav>
  );
}

export { RoadmapSelector, GlobalProgressSummary };
