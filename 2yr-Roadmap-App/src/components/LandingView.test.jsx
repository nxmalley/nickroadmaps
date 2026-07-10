import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LandingView from "./LandingView.jsx";

const mockRoadmaps = [
  {
    id: "roadmap-1",
    title: "Engineering Roadmap",
    subtitle: "2-year plan for mastery",
    dateRange: { start: "2024-06-15", end: "2026-08-01" },
    completedTasks: 10,
    totalTasks: 40,
  },
  {
    id: "roadmap-2",
    title: "Reading List",
    subtitle: "",
    dateRange: { start: "2025-01-01", end: "2025-12-31" },
    completedTasks: 0,
    totalTasks: 20,
  },
];

describe("LandingView", () => {
  it("renders roadmap cards with titles", () => {
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    expect(screen.getByText("Engineering Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Reading List")).toBeInTheDocument();
  });

  it("displays progress as completed/total · percentage", () => {
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    // 10/40 = 25%
    expect(screen.getByText("10/40 · 25%")).toBeInTheDocument();
    // 0/20 = 0%
    expect(screen.getByText("0/20 · 0%")).toBeInTheDocument();
  });

  it("displays formatted date ranges", () => {
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    // Dates are formatted using toLocaleDateString which may vary by timezone.
    // Check that date-related content is present using partial matching.
    expect(screen.getByText(/2024.*2026/)).toBeInTheDocument();
    expect(screen.getByText(/2024.*2025|2025.*2025/)).toBeInTheDocument();
  });

  it("calls onSelectRoadmap when a card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={onSelect}
        onCreateRoadmap={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Engineering Roadmap"));
    expect(onSelect).toHaveBeenCalledWith("roadmap-1");
  });

  it("does not render a Create Roadmap button (roadmaps are managed in code)", () => {
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={() => {}}
      />
    );

    expect(screen.queryByText("+ Create Roadmap")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Roadmap" })).not.toBeInTheDocument();
  });

  it("renders empty state when no roadmaps exist", () => {
    render(
      <LandingView
        roadmaps={[]}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    expect(screen.getByText("No roadmaps yet")).toBeInTheDocument();
  });

  it("shows correct roadmap count", () => {
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    expect(screen.getByText("2 roadmaps available")).toBeInTheDocument();
  });

  it("shows singular when one roadmap exists", () => {
    render(
      <LandingView
        roadmaps={[mockRoadmaps[0]]}
        onSelectRoadmap={() => {}}
        onCreateRoadmap={() => {}}
      />
    );

    expect(screen.getByText("1 roadmap available")).toBeInTheDocument();
  });

  it("supports keyboard navigation on cards", () => {
    const onSelect = vi.fn();
    render(
      <LandingView
        roadmaps={mockRoadmaps}
        onSelectRoadmap={onSelect}
        onCreateRoadmap={() => {}}
      />
    );

    const card = screen.getByRole("button", { name: "View Engineering Roadmap roadmap" });
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("roadmap-1");
  });
});
