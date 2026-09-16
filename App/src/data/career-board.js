/**
 * Career Board — metadata for the landing page card.
 * A free-form board (jobs, responsibilities, achievements), so it has no
 * discrete tasks — phases is intentionally empty (progress shows 0/0).
 *
 * @type {import('../types/roadmap.js').RoadmapData}
 */

export const CAREER_BOARD_ID = "career-board";

export const careerBoard = {
  id: CAREER_BOARD_ID,
  title: "Career Board",
  subtitle: "Track your work history, responsibilities, and achievements",
  dateRange: { start: "2022-06-01", end: "2046-12-31" },
  accentColors: ["#2563eb", "#1d4ed8", "#3b82f6", "#60a5fa"],
  categories: {},
  phases: [],
};
