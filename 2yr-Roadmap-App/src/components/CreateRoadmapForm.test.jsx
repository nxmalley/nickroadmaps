import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateRoadmapForm, { validateForm, slugify } from "./CreateRoadmapForm.jsx";

describe("CreateRoadmapForm", () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  function fillValidForm() {
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: "My Plan" },
    });
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2025-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText(/category 1 label/i), {
      target: { value: "Skill" },
    });
  }

  it("renders the form with all fields", () => {
    render(<CreateRoadmapForm {...defaultProps} />);
    expect(screen.getByRole("heading", { name: /create roadmap/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^subtitle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create roadmap/i })).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("starts with one empty category row", () => {
    render(<CreateRoadmapForm {...defaultProps} />);
    expect(screen.getByLabelText(/category 1 label/i)).toBeInTheDocument();
  });

  it("shows inline validation errors for missing required fields on submit", async () => {
    render(<CreateRoadmapForm {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /create roadmap/i }));

    await waitFor(() => {
      expect(screen.getByText("Title is required.")).toBeInTheDocument();
      expect(screen.getByText("Start date is required.")).toBeInTheDocument();
      expect(screen.getByText("End date is required.")).toBeInTheDocument();
      expect(screen.getByText("Label is required.")).toBeInTheDocument();
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("validates end date must be >= start date", async () => {
    render(<CreateRoadmapForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: "2025-06-01" } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: "2025-05-01" } });
    fireEvent.change(screen.getByLabelText(/category 1 label/i), { target: { value: "Cat" } });

    fireEvent.click(screen.getByRole("button", { name: /create roadmap/i }));

    await waitFor(() => {
      expect(screen.getByText("End date must be on or after start date.")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with valid roadmap data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateRoadmapForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /create roadmap/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const data = onSubmit.mock.calls[0][0];
    expect(data.title).toBe("My Plan");
    expect(data.id).toBe("my-plan");
    expect(data.dateRange.start).toBe("2025-01-01");
    expect(data.dateRange.end).toBe("2026-12-31");
    expect(data.phases).toEqual([]);
    expect(data.accentColors).toEqual(["#0F6E56", "#185FA5", "#534AB7"]);
    expect(Object.values(data.categories)[0].label).toBe("Skill");
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
  });

  it("shows non-blocking error notification on submit failure and retains form input", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<CreateRoadmapForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /create roadmap/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });

    // Form input should be retained
    expect(screen.getByLabelText(/^title/i)).toHaveValue("My Plan");
  });

  it("dismisses the error notification", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Save failed"));
    render(<CreateRoadmapForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /create roadmap/i }));

    await waitFor(() => {
      expect(screen.getByText("Save failed")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/dismiss error/i));
    expect(screen.queryByText("Save failed")).not.toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<CreateRoadmapForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("can add and remove categories", () => {
    render(<CreateRoadmapForm {...defaultProps} />);

    fireEvent.click(screen.getByText("+ Add Category"));
    expect(screen.getByLabelText(/category 2 label/i)).toBeInTheDocument();

    // Remove first category
    const removeButtons = screen.getAllByLabelText(/remove category/i);
    fireEvent.click(removeButtons[0]);
    expect(screen.queryByLabelText(/category 2 label/i)).not.toBeInTheDocument();
  });

  it("limits categories to 20", () => {
    render(<CreateRoadmapForm {...defaultProps} />);

    // Add 19 more categories (starts with 1)
    for (let i = 0; i < 19; i++) {
      fireEvent.click(screen.getByText("+ Add Category"));
    }

    // Add button should be gone at 20
    expect(screen.queryByText("+ Add Category")).not.toBeInTheDocument();
  });
});

describe("slugify", () => {
  it("converts a title to a URL-safe slug", () => {
    expect(slugify("My Cool Plan")).toBe("my-cool-plan");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  ---test--- ")).toBe("test");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("validateForm", () => {
  const validInput = {
    title: "My Plan",
    subtitle: "",
    startDate: "2025-01-01",
    endDate: "2026-12-31",
    categories: [{ label: "Skill", bg: "#0F6E56", color: "#fff" }],
  };

  it("returns no errors for valid input", () => {
    expect(validateForm(validInput)).toEqual({});
  });

  it("rejects title over 100 chars", () => {
    const errors = validateForm({ ...validInput, title: "a".repeat(101) });
    expect(errors.title).toBeDefined();
  });

  it("rejects subtitle over 200 chars", () => {
    const errors = validateForm({ ...validInput, subtitle: "a".repeat(201) });
    expect(errors.subtitle).toBeDefined();
  });

  it("rejects empty categories", () => {
    const errors = validateForm({ ...validInput, categories: [] });
    expect(errors.categories).toBeDefined();
  });

  it("rejects category label over 30 chars", () => {
    const errors = validateForm({
      ...validInput,
      categories: [{ label: "a".repeat(31), bg: "#000", color: "#fff" }],
    });
    expect(errors.categoryItems).toBeDefined();
    expect(errors.categoryItems[0]).toBeDefined();
  });
});
