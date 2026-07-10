import { useState, useCallback } from "react";

/**
 * Generate a unique ID for new phases/weeks/tasks.
 */
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Deep clone helper.
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Swap two items in an array (immutable).
 */
function swapItems(arr, indexA, indexB) {
  if (indexA < 0 || indexB < 0 || indexA >= arr.length || indexB >= arr.length) return arr;
  const next = [...arr];
  [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
  return next;
}

// Shared inline styles
const styles = {
  overlay: {
    padding: "1rem 0",
    fontFamily: "var(--font-sans)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 500,
    color: "var(--color-text-primary)",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  btnPrimary: {
    padding: "6px 16px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "13px",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    background: "#0F6E56",
    color: "#fff",
  },
  btnDanger: {
    padding: "6px 16px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "13px",
    fontWeight: 500,
    border: "1px solid var(--color-border-secondary)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--color-text-secondary)",
  },
  btnSmall: {
    padding: "3px 8px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "11px",
    border: "1px solid var(--color-border-tertiary)",
    background: "transparent",
    color: "var(--color-text-secondary)",
    cursor: "pointer",
  },
  btnSmallDanger: {
    padding: "3px 8px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "11px",
    border: "1px solid #993c1d",
    background: "transparent",
    color: "#993c1d",
    cursor: "pointer",
  },
  btnAdd: {
    padding: "4px 10px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "12px",
    border: "1px dashed var(--color-border-secondary)",
    background: "transparent",
    color: "var(--color-text-secondary)",
    cursor: "pointer",
    marginTop: "8px",
  },
  sectionCard: {
    background: "var(--color-background-secondary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    marginBottom: "12px",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    gap: "8px",
  },
  input: {
    padding: "4px 8px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "13px",
    border: "1px solid var(--color-border-secondary)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputSmall: {
    padding: "3px 6px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "12px",
    border: "1px solid var(--color-border-secondary)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  },
  weekCard: {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)",
    marginBottom: "8px",
    overflow: "hidden",
  },
  weekHeader: {
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--color-background-secondary)",
    gap: "8px",
  },
  taskRow: {
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderTop: "0.5px solid var(--color-border-tertiary)",
  },
  errorNotification: {
    position: "fixed",
    top: "16px",
    right: "16px",
    padding: "10px 16px",
    borderRadius: "var(--border-radius-md)",
    background: "#993c1d",
    color: "#fff",
    fontSize: "13px",
    zIndex: 9999,
    maxWidth: "320px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
};

/**
 * EditModeOverlay — Full editing interface for roadmap structure.
 *
 * @param {object} props
 * @param {import('../types/roadmap.js').RoadmapData} props.roadmap - Current persisted roadmap
 * @param {(updatedData: import('../types/roadmap.js').RoadmapData) => Promise<void>} props.onSave - Persist changes
 * @param {() => void} props.onDiscard - Revert to view mode
 */
export default function EditModeOverlay({ roadmap, onSave, onDiscard }) {
  // Working copy: deep clone of the roadmap prop
  const [workingCopy, setWorkingCopy] = useState(() => deepClone(roadmap));
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // --- Phase collapse toggle ---
  const togglePhaseCollapse = useCallback((phaseId) => {
    setCollapsedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  // --- Update helper ---
  const updatePhases = useCallback((updater) => {
    setWorkingCopy((prev) => ({ ...prev, phases: updater(prev.phases) }));
  }, []);

  // ===================== PHASE OPERATIONS =====================

  const addPhase = useCallback(() => {
    updatePhases((phases) => [
      ...phases,
      {
        id: generateId(),
        title: "New Phase",
        subtitle: "",
        dateRange: "",
        milestones: [],
        weeks: [],
      },
    ]);
  }, [updatePhases]);

  const removePhase = useCallback((phaseIndex) => {
    if (!window.confirm("Are you sure you want to remove this phase? This action cannot be undone.")) return;
    updatePhases((phases) => phases.filter((_, i) => i !== phaseIndex));
  }, [updatePhases]);

  const movePhase = useCallback((phaseIndex, direction) => {
    const target = phaseIndex + direction;
    updatePhases((phases) => swapItems(phases, phaseIndex, target));
  }, [updatePhases]);

  const updatePhaseField = useCallback((phaseIndex, field, value) => {
    updatePhases((phases) =>
      phases.map((p, i) => (i === phaseIndex ? { ...p, [field]: value } : p))
    );
  }, [updatePhases]);

  const updatePhaseMilestones = useCallback((phaseIndex, milestonesStr) => {
    const milestones = milestonesStr.split(",").map((m) => m.trim()).filter(Boolean);
    updatePhases((phases) =>
      phases.map((p, i) => (i === phaseIndex ? { ...p, milestones } : p))
    );
  }, [updatePhases]);

  // ===================== WEEK OPERATIONS =====================

  const addWeek = useCallback((phaseIndex) => {
    updatePhases((phases) =>
      phases.map((p, i) =>
        i === phaseIndex
          ? { ...p, weeks: [...p.weeks, { id: generateId(), label: "New Week", dates: "", tasks: [] }] }
          : p
      )
    );
  }, [updatePhases]);

  const removeWeek = useCallback((phaseIndex, weekIndex) => {
    if (!window.confirm("Are you sure you want to remove this week? This action cannot be undone.")) return;
    updatePhases((phases) =>
      phases.map((p, i) =>
        i === phaseIndex ? { ...p, weeks: p.weeks.filter((_, wi) => wi !== weekIndex) } : p
      )
    );
  }, [updatePhases]);

  const moveWeek = useCallback((phaseIndex, weekIndex, direction) => {
    const target = weekIndex + direction;
    updatePhases((phases) =>
      phases.map((p, i) =>
        i === phaseIndex ? { ...p, weeks: swapItems(p.weeks, weekIndex, target) } : p
      )
    );
  }, [updatePhases]);

  const updateWeekField = useCallback((phaseIndex, weekIndex, field, value) => {
    updatePhases((phases) =>
      phases.map((p, pi) =>
        pi === phaseIndex
          ? { ...p, weeks: p.weeks.map((w, wi) => (wi === weekIndex ? { ...w, [field]: value } : w)) }
          : p
      )
    );
  }, [updatePhases]);

  // ===================== TASK OPERATIONS =====================

  const addTask = useCallback((phaseIndex, weekIndex) => {
    updatePhases((phases) =>
      phases.map((p, pi) =>
        pi === phaseIndex
          ? {
              ...p,
              weeks: p.weeks.map((w, wi) =>
                wi === weekIndex
                  ? { ...w, tasks: [...w.tasks, { id: generateId(), cat: "", text: "" }] }
                  : w
              ),
            }
          : p
      )
    );
  }, [updatePhases]);

  const removeTask = useCallback((phaseIndex, weekIndex, taskIndex) => {
    updatePhases((phases) =>
      phases.map((p, pi) =>
        pi === phaseIndex
          ? {
              ...p,
              weeks: p.weeks.map((w, wi) =>
                wi === weekIndex ? { ...w, tasks: w.tasks.filter((_, ti) => ti !== taskIndex) } : w
              ),
            }
          : p
      )
    );
  }, [updatePhases]);

  const updateTaskField = useCallback((phaseIndex, weekIndex, taskIndex, field, value) => {
    updatePhases((phases) =>
      phases.map((p, pi) =>
        pi === phaseIndex
          ? {
              ...p,
              weeks: p.weeks.map((w, wi) =>
                wi === weekIndex
                  ? { ...w, tasks: w.tasks.map((t, ti) => (ti === taskIndex ? { ...t, [field]: value } : t)) }
                  : w
              ),
            }
          : p
      )
    );
  }, [updatePhases]);

  // ===================== SAVE / DISCARD =====================

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(workingCopy);
    } catch (err) {
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [onSave, workingCopy]);

  const handleDiscard = useCallback(() => {
    onDiscard();
  }, [onDiscard]);

  // ===================== RENDER =====================

  return (
    <div style={styles.overlay}>
      {/* Error notification */}
      {error && (
        <div style={styles.errorNotification} role="alert">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: "12px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "14px" }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header with Save / Discard */}
      <div style={styles.header}>
        <h2 style={styles.title}>Edit: {workingCopy.title}</h2>
        <div style={styles.buttonGroup}>
          <button style={styles.btnDanger} onClick={handleDiscard} disabled={saving}>
            Discard
          </button>
          <button style={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Phases list */}
      {workingCopy.phases.map((phase, phaseIndex) => {
        const isCollapsed = collapsedPhases[phase.id];
        return (
          <div key={phase.id} style={styles.sectionCard}>
            {/* Phase header (clickable to collapse) */}
            <div style={styles.sectionHeader} onClick={() => togglePhaseCollapse(phase.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                  {isCollapsed ? "▶" : "▼"}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {phase.title || "Untitled Phase"}
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                  ({phase.weeks.length} week{phase.weeks.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                <button
                  style={styles.btnSmall}
                  onClick={() => movePhase(phaseIndex, -1)}
                  disabled={phaseIndex === 0}
                  title="Move up"
                  aria-label="Move phase up"
                >
                  ↑
                </button>
                <button
                  style={styles.btnSmall}
                  onClick={() => movePhase(phaseIndex, 1)}
                  disabled={phaseIndex === workingCopy.phases.length - 1}
                  title="Move down"
                  aria-label="Move phase down"
                >
                  ↓
                </button>
                <button
                  style={styles.btnSmallDanger}
                  onClick={() => removePhase(phaseIndex)}
                  title="Remove phase"
                  aria-label="Remove phase"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Phase details (collapsible) */}
            {!isCollapsed && (
              <div style={{ padding: "10px 14px" }}>
                {/* Phase fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "2px" }}>Title</label>
                    <input
                      style={styles.input}
                      value={phase.title}
                      onChange={(e) => updatePhaseField(phaseIndex, "title", e.target.value)}
                      placeholder="Phase title"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "2px" }}>Subtitle</label>
                    <input
                      style={styles.input}
                      value={phase.subtitle}
                      onChange={(e) => updatePhaseField(phaseIndex, "subtitle", e.target.value)}
                      placeholder="Phase subtitle"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "2px" }}>Date Range</label>
                    <input
                      style={styles.input}
                      value={phase.dateRange}
                      onChange={(e) => updatePhaseField(phaseIndex, "dateRange", e.target.value)}
                      placeholder="e.g. Jun 15 – Aug 2026"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "2px" }}>Milestones (comma-separated)</label>
                    <input
                      style={styles.input}
                      value={phase.milestones.join(", ")}
                      onChange={(e) => updatePhaseMilestones(phaseIndex, e.target.value)}
                      placeholder="Milestone 1, Milestone 2"
                    />
                  </div>
                </div>

                {/* Weeks within this phase */}
                <div style={{ marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                    Weeks
                  </span>
                  {phase.weeks.map((week, weekIndex) => (
                    <div key={week.id} style={styles.weekCard}>
                      {/* Week header */}
                      <div style={styles.weekHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                          <input
                            style={{ ...styles.inputSmall, width: "120px" }}
                            value={week.label}
                            onChange={(e) => updateWeekField(phaseIndex, weekIndex, "label", e.target.value)}
                            placeholder="Week label"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            style={{ ...styles.inputSmall, width: "140px" }}
                            value={week.dates}
                            onChange={(e) => updateWeekField(phaseIndex, weekIndex, "dates", e.target.value)}
                            placeholder="Dates"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                            {week.tasks.length} task{week.tasks.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            style={styles.btnSmall}
                            onClick={() => moveWeek(phaseIndex, weekIndex, -1)}
                            disabled={weekIndex === 0}
                            title="Move week up"
                            aria-label="Move week up"
                          >
                            ↑
                          </button>
                          <button
                            style={styles.btnSmall}
                            onClick={() => moveWeek(phaseIndex, weekIndex, 1)}
                            disabled={weekIndex === phase.weeks.length - 1}
                            title="Move week down"
                            aria-label="Move week down"
                          >
                            ↓
                          </button>
                          <button
                            style={styles.btnSmallDanger}
                            onClick={() => removeWeek(phaseIndex, weekIndex)}
                            title="Remove week"
                            aria-label="Remove week"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Tasks within this week */}
                      {week.tasks.map((task, taskIndex) => (
                        <div key={task.id} style={styles.taskRow}>
                          <input
                            style={{ ...styles.inputSmall, width: "70px", flexShrink: 0 }}
                            value={task.cat}
                            onChange={(e) => updateTaskField(phaseIndex, weekIndex, taskIndex, "cat", e.target.value)}
                            placeholder="cat"
                            title="Category key"
                          />
                          <input
                            style={{ ...styles.inputSmall, flex: 1 }}
                            value={task.text}
                            onChange={(e) => updateTaskField(phaseIndex, weekIndex, taskIndex, "text", e.target.value)}
                            placeholder="Task text"
                          />
                          <button
                            style={styles.btnSmallDanger}
                            onClick={() => removeTask(phaseIndex, weekIndex, taskIndex)}
                            title="Remove task"
                            aria-label="Remove task"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Add task button */}
                      <div style={{ padding: "4px 12px 8px" }}>
                        <button style={styles.btnAdd} onClick={() => addTask(phaseIndex, weekIndex)}>
                          + Add Task
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add week button */}
                  <button style={styles.btnAdd} onClick={() => addWeek(phaseIndex)}>
                    + Add Week
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add phase button */}
      <button style={{ ...styles.btnAdd, width: "100%", padding: "10px" }} onClick={addPhase}>
        + Add Phase
      </button>
    </div>
  );
}
