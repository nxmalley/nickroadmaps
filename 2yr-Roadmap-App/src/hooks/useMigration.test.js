import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { migrateLegacyProgress, getValidTaskIds, useMigration } from "./useMigration.js";
import { nickRoadmap, NICK_ROADMAP_ID } from "../data/nick-roadmap.js";

describe("getValidTaskIds", () => {
  it("extracts all task IDs from roadmap phases/weeks/tasks", () => {
    const ids = getValidTaskIds(nickRoadmap);
    // Spot-check a few known IDs
    expect(ids.has("p1w1a")).toBe(true);
    expect(ids.has("p1w1b")).toBe(true);
    expect(ids.has("p4m5c")).toBe(true);
    // Should not contain non-existent IDs
    expect(ids.has("nonexistent")).toBe(false);
    // Should have a reasonable count (the roadmap has many tasks)
    expect(ids.size).toBeGreaterThan(50);
  });
});

describe("migrateLegacyProgress", () => {
  const validIds = new Set(["p1w1a", "p1w1b", "p1w2a", "p1w2b"]);

  it("maps matching task IDs with true values to the result", () => {
    const legacy = { p1w1a: true, p1w1b: true };
    const result = migrateLegacyProgress(legacy, validIds);
    expect(result).toEqual({ p1w1a: true, p1w1b: true });
  });

  it("skips task IDs not in the valid set", () => {
    const legacy = { p1w1a: true, unknown_id: true };
    const result = migrateLegacyProgress(legacy, validIds);
    expect(result).toEqual({ p1w1a: true });
  });

  it("skips task IDs with false values", () => {
    const legacy = { p1w1a: true, p1w1b: false };
    const result = migrateLegacyProgress(legacy, validIds);
    expect(result).toEqual({ p1w1a: true });
  });

  it("returns empty object when no legacy IDs match", () => {
    const legacy = { foo: true, bar: true };
    const result = migrateLegacyProgress(legacy, validIds);
    expect(result).toEqual({});
  });

  it("returns empty object for empty legacy data", () => {
    const result = migrateLegacyProgress({}, validIds);
    expect(result).toEqual({});
  });
});

describe("useMigration hook", () => {
  let originalFetch;

  beforeEach(() => {
    localStorage.clear();
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns migrated: true immediately if migration already complete", () => {
    localStorage.setItem("roadmap-migration-complete", "true");
    const { result } = renderHook(() => useMigration());
    expect(result.current.migrated).toBe(true);
    expect(result.current.migrating).toBe(false);
  });

  it("marks migration complete and returns if no legacy key exists (Req 8.5)", () => {
    // No nick-roadmap-v1 key set
    const { result } = renderHook(() => useMigration());
    expect(result.current.migrated).toBe(true);
    expect(result.current.migrating).toBe(false);
    expect(localStorage.getItem("roadmap-migration-complete")).toBe("true");
  });

  it("migrates legacy data when found and no backend progress exists", async () => {
    localStorage.setItem("nick-roadmap-v1", JSON.stringify({ p1w1a: true, p1w2b: true }));

    // Backend returns no existing progress
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (!options || options.method === undefined) {
        // GET request
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ roadmapId: NICK_ROADMAP_ID, tasks: {}, updatedAt: null }),
        });
      }
      // PUT request
      return Promise.resolve({ ok: true });
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(result.current.migrated).toBe(true);
    });

    expect(result.current.migrating).toBe(false);
    expect(localStorage.getItem("roadmap-migration-complete")).toBe("true");

    // Check that progress was stored in localStorage
    const stored = JSON.parse(localStorage.getItem(`progress:${NICK_ROADMAP_ID}`));
    expect(stored.tasks.p1w1a).toBe(true);
    expect(stored.tasks.p1w2b).toBe(true);
    expect(stored.updatedAt).toBeDefined();
  });

  it("does not overwrite existing backend progress", async () => {
    localStorage.setItem("nick-roadmap-v1", JSON.stringify({ p1w1a: true }));

    // Backend returns existing progress with updatedAt
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            roadmapId: NICK_ROADMAP_ID,
            tasks: { p1w1a: false },
            updatedAt: "2026-06-15T10:00:00.000Z",
          }),
      })
    );

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(result.current.migrated).toBe(true);
    });

    expect(localStorage.getItem("roadmap-migration-complete")).toBe("true");
    // Should NOT have written local progress (backend has data)
    expect(localStorage.getItem(`progress:${NICK_ROADMAP_ID}`)).toBeNull();
  });

  it("still completes migration if backend fetch fails", async () => {
    localStorage.setItem("nick-roadmap-v1", JSON.stringify({ p1w1a: true }));

    // Backend is unreachable
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(result.current.migrated).toBe(true);
    });

    expect(localStorage.getItem("roadmap-migration-complete")).toBe("true");
    // Progress should still be stored locally
    const stored = JSON.parse(localStorage.getItem(`progress:${NICK_ROADMAP_ID}`));
    expect(stored.tasks.p1w1a).toBe(true);
  });

  it("is idempotent — second run does not re-migrate", async () => {
    localStorage.setItem("nick-roadmap-v1", JSON.stringify({ p1w1a: true }));
    localStorage.setItem("roadmap-migration-complete", "true");

    const { result } = renderHook(() => useMigration());

    expect(result.current.migrated).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
