import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRoadmapRegistry, computeRoadmapMeta } from './useRoadmapRegistry.js';
import { nickRoadmap } from '../data/nick-roadmap.js';
import { financialRoadmap } from '../data/financial-roadmap.js';

const BUNDLED_ROADMAPS = [nickRoadmap, financialRoadmap];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('computeRoadmapMeta', () => {
  it('computes totalTasks by counting all tasks across phases and weeks', () => {
    const roadmap = {
      id: 'test-roadmap',
      title: 'Test',
      subtitle: 'Test subtitle',
      dateRange: { start: '2026-01-01', end: '2027-01-01' },
      phases: [
        {
          id: 'p1',
          weeks: [
            { id: 'w1', tasks: [{ id: 't1' }, { id: 't2' }] },
            { id: 'w2', tasks: [{ id: 't3' }] },
          ],
        },
        {
          id: 'p2',
          weeks: [
            { id: 'w3', tasks: [{ id: 't4' }, { id: 't5' }, { id: 't6' }] },
          ],
        },
      ],
    };

    const meta = computeRoadmapMeta(roadmap);

    expect(meta.id).toBe('test-roadmap');
    expect(meta.title).toBe('Test');
    expect(meta.subtitle).toBe('Test subtitle');
    expect(meta.dateRange).toEqual({ start: '2026-01-01', end: '2027-01-01' });
    expect(meta.totalTasks).toBe(6);
    expect(meta.completedTasks).toBe(0);
  });

  it('returns 0 totalTasks for a roadmap with no phases', () => {
    const roadmap = {
      id: 'empty',
      title: 'Empty',
      subtitle: '',
      dateRange: { start: '2026-01-01', end: '2026-12-31' },
      phases: [],
    };

    const meta = computeRoadmapMeta(roadmap);
    expect(meta.totalTasks).toBe(0);
    expect(meta.completedTasks).toBe(0);
  });

  it('returns 0 totalTasks for phases with no weeks', () => {
    const roadmap = {
      id: 'no-weeks',
      title: 'No Weeks',
      subtitle: '',
      dateRange: { start: '2026-01-01', end: '2026-12-31' },
      phases: [{ id: 'p1', weeks: [] }],
    };

    const meta = computeRoadmapMeta(roadmap);
    expect(meta.totalTasks).toBe(0);
  });

  it('correctly counts tasks in the nickRoadmap', () => {
    const meta = computeRoadmapMeta(nickRoadmap);

    // Count manually: each phase has multiple weeks with 3 tasks each
    let expectedTotal = 0;
    for (const phase of nickRoadmap.phases) {
      for (const week of phase.weeks) {
        expectedTotal += week.tasks.length;
      }
    }

    expect(meta.id).toBe('nick-2yr-engineering');
    expect(meta.totalTasks).toBe(expectedTotal);
    expect(meta.completedTasks).toBe(0);
  });
});

describe('useRoadmapRegistry', () => {
  it('fetches roadmaps from API on mount', async () => {
    const mockRoadmaps = [
      { id: 'r1', title: 'Roadmap 1', subtitle: '', dateRange: { start: '2026-01-01', end: '2026-12-31' }, phases: [] },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoadmaps,
    });

    const { result } = renderHook(() => useRoadmapRegistry());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roadmaps).toEqual(mockRoadmaps);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/roadmaps');
  });

  it('falls back to nickRoadmap when API returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useRoadmapRegistry());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roadmaps).toEqual(BUNDLED_ROADMAPS);
    expect(result.current.error).toBeNull();
  });

  it('falls back to nickRoadmap silently on fetch error (no error banner)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRoadmapRegistry());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // No backend configured is an expected path — fall back without surfacing an error.
    expect(result.current.roadmaps).toEqual(BUNDLED_ROADMAPS);
    expect(result.current.error).toBeNull();
  });

  it('falls back to nickRoadmap silently on non-ok response (no error banner)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useRoadmapRegistry());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roadmaps).toEqual(BUNDLED_ROADMAPS);
    expect(result.current.error).toBeNull();
  });

  it('computes meta array from roadmaps', async () => {
    const mockRoadmaps = [
      {
        id: 'r1', title: 'Roadmap 1', subtitle: 'Sub 1',
        dateRange: { start: '2026-01-01', end: '2026-12-31' },
        phases: [{ id: 'p1', weeks: [{ id: 'w1', tasks: [{ id: 't1' }, { id: 't2' }] }] }],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoadmaps,
    });

    const { result } = renderHook(() => useRoadmapRegistry());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.meta).toEqual([
      {
        id: 'r1',
        title: 'Roadmap 1',
        subtitle: 'Sub 1',
        dateRange: { start: '2026-01-01', end: '2026-12-31' },
        completedTasks: 0,
        totalTasks: 2,
      },
    ]);
  });

  describe('addRoadmap', () => {
    it('optimistically adds roadmap and confirms with server response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useRoadmapRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newRoadmap = {
        id: 'new-roadmap',
        title: 'New Roadmap',
        subtitle: '',
        dateRange: { start: '2026-06-01', end: '2027-06-01' },
        phases: [],
      };

      const confirmedRoadmap = { ...newRoadmap, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => confirmedRoadmap,
      });

      await act(async () => {
        await result.current.addRoadmap(newRoadmap);
      });

      // Should contain the server-confirmed version
      expect(result.current.roadmaps.find((r) => r.id === 'new-roadmap')).toEqual(confirmedRoadmap);
      expect(result.current.error).toBeNull();

      // Verify POST was called
      expect(mockFetch).toHaveBeenCalledWith('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoadmap),
      });
    });

    it('reverts optimistic add on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useRoadmapRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newRoadmap = {
        id: 'fail-roadmap',
        title: 'Will Fail',
        subtitle: '',
        dateRange: { start: '2026-01-01', end: '2026-12-31' },
        phases: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await act(async () => {
        await result.current.addRoadmap(newRoadmap);
      });

      // Roadmap should be reverted
      expect(result.current.roadmaps.find((r) => r.id === 'fail-roadmap')).toBeUndefined();
      expect(result.current.error).toBe('Server error');
    });
  });

  describe('updateRoadmap', () => {
    it('optimistically updates roadmap and confirms with server response', async () => {
      const existingRoadmap = {
        id: 'existing',
        title: 'Existing',
        subtitle: 'Old subtitle',
        dateRange: { start: '2026-01-01', end: '2026-12-31' },
        phases: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [existingRoadmap],
      });

      const { result } = renderHook(() => useRoadmapRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedRoadmap = { ...existingRoadmap, subtitle: 'New subtitle', updatedAt: '2026-07-01T00:00:00Z' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedRoadmap,
      });

      await act(async () => {
        await result.current.updateRoadmap('existing', { subtitle: 'New subtitle' });
      });

      expect(result.current.roadmaps.find((r) => r.id === 'existing').subtitle).toBe('New subtitle');
      expect(result.current.error).toBeNull();

      // Verify PUT was called
      expect(mockFetch).toHaveBeenCalledWith('/api/roadmaps/existing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtitle: 'New subtitle' }),
      });
    });

    it('reverts optimistic update on failure', async () => {
      const existingRoadmap = {
        id: 'existing',
        title: 'Existing',
        subtitle: 'Original',
        dateRange: { start: '2026-01-01', end: '2026-12-31' },
        phases: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [existingRoadmap],
      });

      const { result } = renderHook(() => useRoadmapRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Update failed' }),
      });

      await act(async () => {
        await result.current.updateRoadmap('existing', { subtitle: 'Should revert' });
      });

      // Should revert to original
      expect(result.current.roadmaps.find((r) => r.id === 'existing').subtitle).toBe('Original');
      expect(result.current.error).toBe('Update failed');
    });
  });

  it('clears error on next successful operation', async () => {
    // Initial fetch succeeds (empty) so we start clean.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useRoadmapRegistry());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // A failed addRoadmap sets an error.
    const failRoadmap = {
      id: 'fail',
      title: 'Fail',
      subtitle: '',
      dateRange: { start: '2026-01-01', end: '2026-12-31' },
      phases: [],
    };
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.addRoadmap(failRoadmap);
    });

    expect(result.current.error).toBe('Network error');

    // Now do a successful addRoadmap — error should clear.
    const newRoadmap = {
      id: 'new',
      title: 'New',
      subtitle: '',
      dateRange: { start: '2026-01-01', end: '2026-12-31' },
      phases: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newRoadmap,
    });

    await act(async () => {
      await result.current.addRoadmap(newRoadmap);
    });

    expect(result.current.error).toBeNull();
  });
});
