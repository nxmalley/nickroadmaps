/**
 * Financial Masterplan — skeleton roadmap for financial goals.
 * Placeholder phases and tasks to validate the multi-roadmap layout.
 * Replace the content below with your actual financial plan.
 *
 * @type {import('../types/roadmap.js').RoadmapData}
 */

export const FINANCIAL_ROADMAP_ID = "financial-masterplan";

export const financialRoadmap = {
  id: FINANCIAL_ROADMAP_ID,
  title: "Financial Masterplan",
  subtitle: "Wealth building, investing, and financial freedom",
  dateRange: { start: "2026-06-15", end: "2029-06-30" },
  accentColors: ["#b5591a", "#0f7a99", "#534AB7"],
  categories: {
    invest:  { label: "Invest",    bg: "#e8f7fb", color: "#0f7a99" },
    save:    { label: "Save",      bg: "#e6f5ee", color: "#0F6E56" },
    re:      { label: "Real Estate", bg: "#fdeee0", color: "#b5591a" },
    tax:     { label: "Tax",       bg: "#eee6fb", color: "#534AB7" },
    biz:     { label: "Biz",       bg: "#f0f0f0", color: "#888888" },
    learn:   { label: "Learn",     bg: "#fff3d6", color: "#a06a00" },
  },
  phases: [
    {
      id: "fp1",
      title: "Phase 1",
      subtitle: "Foundation",
      dateRange: "Jun 2026 – Dec 2026",
      milestones: ["Emergency fund", "Investment accounts open", "Budget system"],
      weeks: [
        {
          id: "fp1w1", label: "Month 1", dates: "Jun 2026",
          tasks: [
            { id: "fp1w1a", cat: "save",  text: "Placeholder task — replace with your content" },
            { id: "fp1w1b", cat: "learn", text: "Placeholder task — replace with your content" },
          ],
        },
        {
          id: "fp1w2", label: "Month 2", dates: "Jul 2026",
          tasks: [
            { id: "fp1w2a", cat: "invest", text: "Placeholder task — replace with your content" },
            { id: "fp1w2b", cat: "save",   text: "Placeholder task — replace with your content" },
          ],
        },
      ],
    },
    {
      id: "fp2",
      title: "Phase 2",
      subtitle: "Growth",
      dateRange: "Jan 2027 – Dec 2027",
      milestones: ["First investment property", "Tax strategy optimized"],
      weeks: [
        {
          id: "fp2w1", label: "Q1 2027", dates: "Jan – Mar 2027",
          tasks: [
            { id: "fp2w1a", cat: "re",    text: "Placeholder task — replace with your content" },
            { id: "fp2w1b", cat: "tax",   text: "Placeholder task — replace with your content" },
            { id: "fp2w1c", cat: "invest", text: "Placeholder task — replace with your content" },
          ],
        },
        {
          id: "fp2w2", label: "Q2 2027", dates: "Apr – Jun 2027",
          tasks: [
            { id: "fp2w2a", cat: "re",   text: "Placeholder task — replace with your content" },
            { id: "fp2w2b", cat: "biz",  text: "Placeholder task — replace with your content" },
          ],
        },
      ],
    },
    {
      id: "fp3",
      title: "Phase 3",
      subtitle: "Acceleration",
      dateRange: "Jan 2028 – Jun 2029",
      milestones: ["Multiple income streams", "FI number progress"],
      weeks: [
        {
          id: "fp3w1", label: "H1 2028", dates: "Jan – Jun 2028",
          tasks: [
            { id: "fp3w1a", cat: "invest", text: "Placeholder task — replace with your content" },
            { id: "fp3w1b", cat: "re",     text: "Placeholder task — replace with your content" },
            { id: "fp3w1c", cat: "biz",    text: "Placeholder task — replace with your content" },
          ],
        },
        {
          id: "fp3w2", label: "H2 2028 – 2029", dates: "Jul 2028 – Jun 2029",
          tasks: [
            { id: "fp3w2a", cat: "invest", text: "Placeholder task — replace with your content" },
            { id: "fp3w2b", cat: "re",     text: "Placeholder task — replace with your content" },
          ],
        },
      ],
    },
  ],
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};
