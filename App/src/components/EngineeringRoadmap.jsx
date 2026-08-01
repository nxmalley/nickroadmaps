import { useState } from "react";
import { useProgressStore } from "../hooks/useProgressStore.js";
import { nickRoadmap, NICK_ROADMAP_ID } from "../data/nick-roadmap.js";
import { DEFAULT_TEXT_COLOR, DEFAULT_BG_COLOR } from "../constants/defaults.js";

/**
 * EngineeringRoadmap — standalone component for Nick's 2-Year Engineering Roadmap.
 * All data comes from nick-roadmap.js. Progress state from useProgressStore.
 * Receives NO props — fully self-contained.
 */
export default function EngineeringRoadmap() {
  const { progress, toggle } = useProgressStore(NICK_ROADMAP_ID);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const { phases, accentColors, categories, title, subtitle } = nickRoadmap;

  // Overall progress
  const allTasks = phases.flatMap(p => p.weeks.flatMap(w => w.tasks));
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => progress[t.id]).length;
  const pct = totalTasks ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  // Active phase data
  const phase = phases[activePhaseIndex];
  const phaseTasks = phase.weeks.flatMap(w => w.tasks);
  const phaseDone = phaseTasks.filter(t => progress[t.id]).length;
  const phaseTotal = phaseTasks.length;
  const accent = accentColors[activePhaseIndex] || "var(--color-border-tertiary)";

  function getCategoryStyle(catKey) {
    if (Object.hasOwn(categories, catKey)) {
      const catDef = categories[catKey];
      return { bg: catDef.bg, color: catDef.color, label: catDef.label };
    }
    return { bg: DEFAULT_BG_COLOR, color: DEFAULT_TEXT_COLOR, label: catKey };
  }

  return (
    <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 3px", color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>
        {subtitle}
      </p>

      {/* Overall progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1, height: "5px", background: "var(--color-background-secondary)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accentColors[0] || "#0F6E56", borderRadius: "3px", transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
          {completedTasks}/{totalTasks} · {pct}%
        </span>
      </div>

      {/* Phase navigation buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "4px" }}>
        {phases.map((p, i) => {
          const phT = p.weeks.flatMap(w => w.tasks);
          const phD = phT.filter(t => progress[t.id]).length;
          const isActive = activePhaseIndex === i;
          const phaseAccent = accentColors[i] || "var(--color-border-tertiary)";
          return (
            <button
              key={p.id}
              onClick={() => setActivePhaseIndex(i)}
              style={{
                padding: "6px 14px", borderRadius: "var(--border-radius-md)", fontSize: "13px", flexShrink: 0,
                border: `1px solid ${isActive ? phaseAccent : "var(--color-border-tertiary)"}`,
                background: "transparent", cursor: "pointer", fontWeight: isActive ? 500 : 400,
                color: isActive ? phaseAccent : "var(--color-text-secondary)",
              }}
            >
              {p.title}
              {phD > 0 && phD < phT.length && <span style={{ marginLeft: "6px", fontSize: "10px", opacity: 0.7 }}>{phD}/{phT.length}</span>}
              {phD === phT.length && phT.length > 0 && <span style={{ marginLeft: "5px", fontSize: "11px" }}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Phase header */}
      <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "14px", marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)" }}>{phase.subtitle}</p>
        <p style={{ margin: "2px 0 8px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {phase.dateRange} · {phaseDone}/{phaseTotal} complete
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {phase.milestones.map((m, i) => (
            <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Week cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {phase.weeks.map((week) => {
          const wDone = week.tasks.filter(t => progress[t.id]).length;
          const wComplete = wDone === week.tasks.length;
          return (
            <div key={week.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: "var(--color-background-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{week.label}</span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginLeft: "8px" }}>{week.dates}</span>
                </div>
                <span style={{ fontSize: "11px", color: wComplete ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
                  {wDone}/{week.tasks.length}{wComplete ? " ✓" : ""}
                </span>
              </div>
              {week.tasks.map((task) => {
                const catStyle = getCategoryStyle(task.cat);
                const isChecked = !!progress[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggle(task.id)}
                    style={{ padding: "10px 14px", display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer", borderTop: "0.5px solid var(--color-border-tertiary)", background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--color-background-secondary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: "15px", height: "15px", borderRadius: "3px", flexShrink: 0, marginTop: "2px",
                      border: `1.5px solid ${isChecked ? accent : "var(--color-border-secondary)"}`,
                      background: isChecked ? accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                    }}>
                      {isChecked && <span style={{ fontSize: "10px", color: "white", lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", fontWeight: 500, flexShrink: 0, marginTop: "2px", background: catStyle.bg, color: catStyle.color }}>
                        {catStyle.label}
                      </span>
                      <span style={{ fontSize: "13px", lineHeight: "1.55", color: isChecked ? "var(--color-text-tertiary)" : "var(--color-text-primary)", textDecoration: isChecked ? "line-through" : "none" }}>
                        {task.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
