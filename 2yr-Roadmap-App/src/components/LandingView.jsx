/**
 * LandingView component — displayed when no roadmap is selected.
 * Shows all available roadmaps as cards with name, date range, and progress.
 * Includes a "Create Roadmap" action button.
 *
 * @param {object} props
 * @param {import('../types/roadmap.js').RoadmapMeta[]} props.roadmaps - Array of roadmap metadata
 * @param {(id: string) => void} props.onSelectRoadmap - Called when a roadmap card is clicked
 * @param {() => void} props.onCreateRoadmap - Called when "Create Roadmap" is clicked
 */
export default function LandingView({ roadmaps, onSelectRoadmap, onCreateRoadmap }) {
  /**
   * Format a date range for display.
   * Converts ISO date strings to a human-friendly format like "Jun 2024 – Aug 2026".
   */
  function formatDateRange(start, end) {
    const opts = { month: "short", year: "numeric" };
    try {
      const s = new Date(start).toLocaleDateString("en-US", opts);
      const e = new Date(end).toLocaleDateString("en-US", opts);
      return `${s} – ${e}`;
    } catch {
      return `${start} – ${end}`;
    }
  }

  /**
   * Compute progress percentage for a roadmap.
   */
  function getProgress(completedTasks, totalTasks) {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  return (
    <div style={{ padding: "2rem 1rem", fontFamily: "var(--font-sans)" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
            Your Roadmaps
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "4px 0 0" }}>
            {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"} available
          </p>
        </div>
        <button
          onClick={onCreateRoadmap}
          aria-label="Create Roadmap"
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            borderRadius: "var(--border-radius-md)",
            border: "1px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--color-text-secondary)";
            e.currentTarget.style.background = "var(--color-border-tertiary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--color-border-secondary)";
            e.currentTarget.style.background = "var(--color-background-secondary)";
          }}
        >
          + Create Roadmap
        </button>
      </div>

      {/* Roadmap cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "12px",
      }}>
        {roadmaps.map((roadmap) => {
          const pct = getProgress(roadmap.completedTasks, roadmap.totalTasks);
          return (
            <div
              key={roadmap.id}
              role="button"
              tabIndex={0}
              aria-label={`View ${roadmap.title} roadmap`}
              onClick={() => onSelectRoadmap(roadmap.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRoadmap(roadmap.id);
                }
              }}
              style={{
                background: "var(--color-background-secondary)",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                padding: "16px",
                cursor: "pointer",
                transition: "border-color 0.15s, transform 0.1s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--color-border-secondary)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--color-border-tertiary)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Card title */}
              <h3 style={{
                fontSize: "15px",
                fontWeight: 500,
                margin: "0 0 4px",
                color: "var(--color-text-primary)",
              }}>
                {roadmap.title}
              </h3>

              {/* Subtitle */}
              {roadmap.subtitle && (
                <p style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  margin: "0 0 10px",
                  lineHeight: 1.4,
                }}>
                  {roadmap.subtitle}
                </p>
              )}

              {/* Date range */}
              <p style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                margin: roadmap.subtitle ? "0 0 12px" : "0 0 12px",
              }}>
                {formatDateRange(roadmap.dateRange.start, roadmap.dateRange.end)}
              </p>

              {/* Progress bar */}
              <div style={{
                height: "4px",
                background: "var(--color-border-tertiary)",
                borderRadius: "2px",
                overflow: "hidden",
                marginBottom: "8px",
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "var(--color-background-info)",
                  borderRadius: "2px",
                  transition: "width 0.3s",
                }} />
              </div>

              {/* Progress text */}
              <p style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}>
                {roadmap.completedTasks}/{roadmap.totalTasks} · {pct}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {roadmaps.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          color: "var(--color-text-tertiary)",
        }}>
          <p style={{ fontSize: "14px", margin: "0 0 12px" }}>No roadmaps yet</p>
          <p style={{ fontSize: "13px", margin: 0 }}>
            Click "Create Roadmap" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
