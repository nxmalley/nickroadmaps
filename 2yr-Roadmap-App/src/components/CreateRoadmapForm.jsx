import { useState, useId } from "react";

/**
 * Default accent colors for new roadmaps.
 */
const DEFAULT_ACCENT_COLORS = ["#0F6E56", "#185FA5", "#534AB7"];

/**
 * Preset color options for category pickers.
 */
const COLOR_PRESETS = [
  "#0F6E56", "#185FA5", "#534AB7", "#993c1d", "#6b21a8",
  "#b45309", "#0369a1", "#be185d", "#065f46", "#7c2d12",
  "#1e3a5f", "#4c1d95", "#78350f", "#164e63", "#831843",
];

/**
 * Slugify a title into a URL-safe ID.
 * @param {string} title
 * @returns {string}
 */
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Validate the form and return an object of field errors.
 * Returns empty object if all fields are valid.
 */
function validateForm({ title, subtitle, startDate, endDate, categories }) {
  const errors = {};

  // Title: required, 1-100 chars
  if (!title.trim()) {
    errors.title = "Title is required.";
  } else if (title.trim().length > 100) {
    errors.title = "Title must be 100 characters or fewer.";
  }

  // Subtitle: optional, 0-200 chars
  if (subtitle.length > 200) {
    errors.subtitle = "Subtitle must be 200 characters or fewer.";
  }

  // Start date: required
  if (!startDate) {
    errors.startDate = "Start date is required.";
  }

  // End date: required, must be >= start
  if (!endDate) {
    errors.endDate = "End date is required.";
  } else if (startDate && endDate < startDate) {
    errors.endDate = "End date must be on or after start date.";
  }

  // Categories: 1-20, each with label 1-30 chars
  if (categories.length === 0) {
    errors.categories = "At least one category is required.";
  } else if (categories.length > 20) {
    errors.categories = "Maximum 20 categories allowed.";
  }

  // Per-category validation
  const categoryErrors = categories.map((cat) => {
    if (!cat.label.trim()) {
      return "Label is required.";
    } else if (cat.label.trim().length > 30) {
      return "Label must be 30 characters or fewer.";
    }
    return null;
  });

  if (categoryErrors.some((e) => e !== null)) {
    errors.categoryItems = categoryErrors;
  }

  return errors;
}

/**
 * CreateRoadmapForm — form for creating new roadmaps with full validation.
 *
 * @param {object} props
 * @param {(roadmapData: import('../types/roadmap.js').RoadmapData) => Promise<void>} props.onSubmit
 * @param {() => void} props.onCancel
 */
export default function CreateRoadmapForm({ onSubmit, onCancel }) {
  const formId = useId();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState([
    { label: "", bg: "#0F6E56", color: "#ffffff" },
  ]);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleAddCategory() {
    if (categories.length >= 20) return;
    setCategories([
      ...categories,
      { label: "", bg: COLOR_PRESETS[categories.length % COLOR_PRESETS.length], color: "#ffffff" },
    ]);
  }

  function handleRemoveCategory(index) {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
    // Clear category-specific error
    if (errors.categoryItems) {
      const newCatErrors = [...errors.categoryItems];
      newCatErrors.splice(index, 1);
      setErrors({ ...errors, categoryItems: newCatErrors });
    }
  }

  function handleCategoryChange(index, field, value) {
    const updated = categories.map((cat, i) =>
      i === index ? { ...cat, [field]: value } : cat
    );
    setCategories(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm({ title, subtitle, startDate, endDate, categories });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Build the roadmap data
    const id = slugify(title) || `roadmap-${Date.now()}`;
    const now = new Date().toISOString();

    const categoriesMap = {};
    categories.forEach((cat, i) => {
      const key = cat.label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `cat-${i}`;
      categoriesMap[key] = {
        label: cat.label.trim(),
        bg: cat.bg,
        color: cat.color,
      };
    });

    /** @type {import('../types/roadmap.js').RoadmapData} */
    const roadmapData = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      dateRange: { start: startDate, end: endDate },
      accentColors: DEFAULT_ACCENT_COLORS,
      categories: categoriesMap,
      phases: [],
      createdAt: now,
      updatedAt: now,
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(roadmapData);
    } catch (err) {
      setSubmitError(err?.message || "Failed to save roadmap. Please try again.");
      setSubmitting(false);
    }
  }

  function dismissError() {
    setSubmitError(null);
  }

  // Shared styles
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: "var(--font-sans)",
    background: "var(--color-background-primary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)",
    color: "var(--color-text-primary)",
    boxSizing: "border-box",
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: "#e5534b",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    marginBottom: "4px",
  };

  const errorTextStyle = {
    fontSize: "11px",
    color: "#e5534b",
    marginTop: "4px",
  };

  const fieldGroupStyle = {
    marginBottom: "16px",
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: "600px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          margin: "0 0 1.25rem",
        }}
      >
        Create Roadmap
      </h2>

      {/* Submit error notification */}
      {submitError && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "var(--border-radius-md)",
            background: "rgba(229, 83, 75, 0.12)",
            border: "1px solid rgba(229, 83, 75, 0.4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#e5534b" }}>{submitError}</span>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: "#e5534b",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div style={fieldGroupStyle}>
          <label htmlFor={`${formId}-title`} style={labelStyle}>
            Title <span style={{ color: "#e5534b" }}>*</span>
          </label>
          <input
            id={`${formId}-title`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="My 2-Year Engineering Plan"
            style={errors.title ? inputErrorStyle : inputStyle}
            aria-describedby={errors.title ? `${formId}-title-error` : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p id={`${formId}-title-error`} style={errorTextStyle} role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Subtitle */}
        <div style={fieldGroupStyle}>
          <label htmlFor={`${formId}-subtitle`} style={labelStyle}>
            Subtitle
          </label>
          <input
            id={`${formId}-subtitle`}
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            maxLength={200}
            placeholder="A structured path to senior engineering"
            style={errors.subtitle ? inputErrorStyle : inputStyle}
            aria-describedby={errors.subtitle ? `${formId}-subtitle-error` : undefined}
            aria-invalid={!!errors.subtitle}
          />
          {errors.subtitle && (
            <p id={`${formId}-subtitle-error`} style={errorTextStyle} role="alert">
              {errors.subtitle}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor={`${formId}-start`} style={labelStyle}>
              Start Date <span style={{ color: "#e5534b" }}>*</span>
            </label>
            <input
              id={`${formId}-start`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={errors.startDate ? inputErrorStyle : inputStyle}
              aria-describedby={errors.startDate ? `${formId}-start-error` : undefined}
              aria-invalid={!!errors.startDate}
            />
            {errors.startDate && (
              <p id={`${formId}-start-error`} style={errorTextStyle} role="alert">
                {errors.startDate}
              </p>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor={`${formId}-end`} style={labelStyle}>
              End Date <span style={{ color: "#e5534b" }}>*</span>
            </label>
            <input
              id={`${formId}-end`}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={errors.endDate ? inputErrorStyle : inputStyle}
              aria-describedby={errors.endDate ? `${formId}-end-error` : undefined}
              aria-invalid={!!errors.endDate}
            />
            {errors.endDate && (
              <p id={`${formId}-end-error`} style={errorTextStyle} role="alert">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div style={fieldGroupStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={labelStyle}>
              Categories <span style={{ color: "#e5534b" }}>*</span>
              <span style={{ fontWeight: 400, marginLeft: "6px", color: "var(--color-text-tertiary)" }}>
                ({categories.length}/20)
              </span>
            </span>
            {categories.length < 20 && (
              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--color-border-tertiary)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                + Add Category
              </button>
            )}
          </div>

          {errors.categories && (
            <p style={errorTextStyle} role="alert">
              {errors.categories}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categories.map((cat, i) => {
              const catError = errors.categoryItems?.[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    padding: "8px 10px",
                    borderRadius: "var(--border-radius-md)",
                    border: "1px solid var(--color-border-tertiary)",
                    background: "var(--color-background-primary)",
                  }}
                >
                  {/* Label input */}
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`${formId}-cat-${i}-label`} className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                      Category {i + 1} label
                    </label>
                    <input
                      id={`${formId}-cat-${i}-label`}
                      type="text"
                      value={cat.label}
                      onChange={(e) => handleCategoryChange(i, "label", e.target.value)}
                      maxLength={30}
                      placeholder="Category label"
                      style={catError ? { ...inputErrorStyle, padding: "6px 10px" } : { ...inputStyle, padding: "6px 10px" }}
                      aria-describedby={catError ? `${formId}-cat-${i}-error` : undefined}
                      aria-invalid={!!catError}
                    />
                    {catError && (
                      <p id={`${formId}-cat-${i}-error`} style={errorTextStyle} role="alert">
                        {catError}
                      </p>
                    )}
                  </div>

                  {/* Background color picker */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <label htmlFor={`${formId}-cat-${i}-bg`} style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                      BG
                    </label>
                    <input
                      id={`${formId}-cat-${i}-bg`}
                      type="color"
                      value={cat.bg}
                      onChange={(e) => handleCategoryChange(i, "bg", e.target.value)}
                      style={{
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        border: "1px solid var(--color-border-tertiary)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        background: "none",
                      }}
                      aria-label={`Category ${i + 1} background color`}
                    />
                  </div>

                  {/* Text color picker */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <label htmlFor={`${formId}-cat-${i}-color`} style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                      Text
                    </label>
                    <input
                      id={`${formId}-cat-${i}-color`}
                      type="color"
                      value={cat.color}
                      onChange={(e) => handleCategoryChange(i, "color", e.target.value)}
                      style={{
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        border: "1px solid var(--color-border-tertiary)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        background: "none",
                      }}
                      aria-label={`Category ${i + 1} text color`}
                    />
                  </div>

                  {/* Preview */}
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      alignSelf: "center",
                      background: cat.bg,
                      color: cat.color,
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                    aria-hidden="true"
                  >
                    {cat.label || "Tag"}
                  </div>

                  {/* Remove button */}
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(i)}
                      aria-label={`Remove category ${i + 1}`}
                      style={{
                        alignSelf: "center",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-tertiary)",
                        cursor: "pointer",
                        fontSize: "16px",
                        lineHeight: 1,
                        padding: "2px 6px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--color-border-tertiary)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              borderRadius: "var(--border-radius-md)",
              border: "1px solid #0F6E56",
              background: submitting ? "rgba(15, 110, 86, 0.5)" : "#0F6E56",
              color: "#ffffff",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating…" : "Create Roadmap"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Export validation and slugify for testing
export { validateForm, slugify };
