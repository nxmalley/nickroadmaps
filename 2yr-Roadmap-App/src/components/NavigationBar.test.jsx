import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NavigationBar, { RoadmapSelector, GlobalProgressSummary } from "./NavigationBar";

const mockRoadmaps = [
  { id: "roadmap-1", title: "Engineering Plan", subtitle: "2yr plan", dateRange: { start: "2024-01-01", end: "2025-12-31" }, completedTasks: 10, totalTasks: 40 },
  { id: "roadmap-2", title: "Reading List", subtitle: "Books", dateRange: { start: "2024-06-01", end: "2025-06-01" }, completedTasks: 5, totalTasks: 20 },
];

describe("NavigationBar", () => {
  it("renders the application title", () => {
    render(<NavigationBar roadmaps={mockRoadmaps} activeId={null} onSelect={() => {}} />);
    expect(screen.getByText("Roadmap Dashboard")).toBeInTheDocument();
  });

  it("renders the roadmap selector dropdown", () => {
    render(<NavigationBar roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} />);
    expect(screen.getByText("Engineering Plan")).toBeInTheDocument();
  });

  it("renders the global progress summary", () => {
    render(<NavigationBar roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} />);
    // 10+5=15 completed, 40+20=60 total, 25%
    expect(screen.getByText("15/60")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("calls onNavigate with 'landing' when title is clicked", () => {
    const onNavigate = vi.fn();
    render(<NavigationBar roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Roadmap Dashboard"));
    expect(onNavigate).toHaveBeenCalledWith("landing");
  });
});

describe("RoadmapSelector", () => {
  it("shows 'Select Roadmap' when no active roadmap", () => {
    render(<RoadmapSelector roadmaps={mockRoadmaps} activeId={null} onSelect={() => {}} />);
    expect(screen.getByText("Select Roadmap")).toBeInTheDocument();
  });

  it("shows active roadmap title in the trigger", () => {
    render(<RoadmapSelector roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} />);
    expect(screen.getByText("Engineering Plan")).toBeInTheDocument();
  });

  it("opens dropdown and lists all roadmaps with percentages on click", () => {
    render(<RoadmapSelector roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    // Both roadmaps should be listed
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // Percentages: 10/40 = 25%, 5/20 = 25%
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect when a roadmap is clicked", () => {
    const onSelect = vi.fn();
    render(<RoadmapSelector roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getAllByRole("option")[1]);
    expect(onSelect).toHaveBeenCalledWith("roadmap-2");
  });

  it("visually distinguishes the active roadmap (Req 2.3)", () => {
    render(<RoadmapSelector roadmaps={mockRoadmaps} activeId="roadmap-1" onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    const activeOption = screen.getAllByRole("option")[0];
    // Active item has a visible left border as active-state indicator
    expect(activeOption.style.borderLeft).toContain("3px solid");
    expect(activeOption.style.borderLeft).not.toContain("transparent");
  });

  it("is still visible when only one roadmap exists (Req 2.6)", () => {
    const single = [mockRoadmaps[0]];
    render(<RoadmapSelector roadmaps={single} activeId="roadmap-1" onSelect={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

describe("GlobalProgressSummary", () => {
  it("displays aggregate completed/total and percentage", () => {
    render(<GlobalProgressSummary roadmaps={mockRoadmaps} />);
    // 15/60 = 25%
    expect(screen.getByText("15/60")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("shows 0% when there are no tasks", () => {
    const empty = [{ id: "x", title: "X", subtitle: "", dateRange: { start: "", end: "" }, completedTasks: 0, totalTasks: 0 }];
    render(<GlobalProgressSummary roadmaps={empty} />);
    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
