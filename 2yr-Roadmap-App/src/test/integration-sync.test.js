import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressStore } from '../hooks/useProgressStore.js';
import { useMigration } from '../hooks/useMigration.js';
import { NICK_ROADMAP_ID } from '../data/nick-roadmap.js';

/**
 * Integration tests: localStorage ↔ backend sync
 *
 * Validates: Requirements 5.2, 5.3, 5.5, 5.6, 8.2
 */

describe('Integration: localStorage ↔ backend sync', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 1: Offline → Online sync recovery
  // Validates: Req 5.6 — retain in localStorage and retry on next connection
  // ─────────────────────────────────────────────────────────────────────────
  describe('Offline → Online sync recovery', () => {
    it('stores toggle in localStorage when backend is down, then syncs when backend recovers', async () => {
      vi.useFakeTimers();

      // Backend initially fails on GET (initial load)
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      // Wait for the load to fail (timeout fires)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5001);
      });

      expect(result.current.isOffline).toBe(true);

      // User toggles a task while offline
      act(() => {
        result.current.toggle('task-1');
      });

      // Verify localStorage was updated immediately
      const stored = JSON.parse(localStorage.getItem('progress:test-roadmap'));
      expect(stored.tasks['task-1']).toBe(true);
      expect(stored.updatedAt).toBeDefined();

      // Backend becomes available — the debounced sync fires
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Advance past the 2s debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // Backend should have received a PUT with the correct data
      const putCalls = global.fetch.mock.calls.filter(
        (call) => call[1]?.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThanOrEqual(1);

      const body = JSON.parse(putCalls[0][1].body);
      expect(body.tasks['task-1']).toBe(true);
    });

    it('retries failed syncs with exponential backoff until backend recovers', async () => {
      vi.useFakeTimers();

      // Initial load succeeds with empty data
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Now make PUT fail for the sync
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      act(() => {
        result.current.toggle('task-1');
      });

      // First debounce fires at 2s — fails
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Retry #1 at +2s (exponential backoff: 2^1 * 1000 = 2s)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Now backend recovers
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      // Retry #2 at +4s (exponential backoff: 2^2 * 1000 = 4s)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });

      // Sync should succeed now
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const putCall = global.fetch.mock.calls[0];
      expect(putCall[1].method).toBe('PUT');
      const body = JSON.parse(putCall[1].body);
      expect(body.tasks['task-1']).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 2: Conflict resolution — backend wins (more recent timestamp)
  // Validates: Req 5.5 — most recent updatedAt wins
  // ─────────────────────────────────────────────────────────────────────────
  describe('Conflict resolution (backend wins)', () => {
    it('uses backend data when backend updatedAt is more recent than localStorage', async () => {
      vi.useFakeTimers();

      // localStorage has older data
      const localRecord = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': true, 'task-2': false },
        updatedAt: '2024-06-01T10:00:00.000Z', // T1 - older
      };
      localStorage.setItem('progress:test-roadmap', JSON.stringify(localRecord));

      // Backend has newer data
      const remoteRecord = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': false, 'task-2': true, 'task-3': true },
        updatedAt: '2024-06-02T10:00:00.000Z', // T2 - newer
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(remoteRecord),
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      // Advance timers to let the fetch promise resolve
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Backend's data should win — UI displays backend's data
      expect(result.current.progress).toEqual({ 'task-1': false, 'task-2': true, 'task-3': true });
      expect(result.current.loading).toBe(false);

      // localStorage should be updated to match backend
      const stored = JSON.parse(localStorage.getItem('progress:test-roadmap'));
      expect(stored.tasks).toEqual(remoteRecord.tasks);
      expect(stored.updatedAt).toBe(remoteRecord.updatedAt);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 3: Conflict resolution — localStorage wins (more recent timestamp)
  // Validates: Req 5.5 — most recent updatedAt wins
  // ─────────────────────────────────────────────────────────────────────────
  describe('Conflict resolution (localStorage wins)', () => {
    it('keeps localStorage data and pushes to backend when local updatedAt is more recent', async () => {
      vi.useFakeTimers();

      // localStorage has newer data
      const localRecord = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': true, 'task-2': true },
        updatedAt: '2024-06-03T10:00:00.000Z', // T2 - newer
      };
      localStorage.setItem('progress:test-roadmap', JSON.stringify(localRecord));

      // Backend has older data
      const remoteRecord = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': false, 'task-2': false },
        updatedAt: '2024-06-01T10:00:00.000Z', // T1 - older
      };

      // First call is GET (returns old data), subsequent calls are PUT (accepts sync)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(remoteRecord),
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      // Advance timers to let the fetch resolve and the sync PUT fire
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // localStorage's data should win — UI displays localStorage's data
      expect(result.current.progress).toEqual({ 'task-1': true, 'task-2': true });
      expect(result.current.loading).toBe(false);

      // Backend should receive a PUT with localStorage data (sync local → backend)
      const putCalls = global.fetch.mock.calls.filter(
        (call) => call[1]?.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThanOrEqual(1);

      const body = JSON.parse(putCalls[0][1].body);
      expect(body.tasks['task-1']).toBe(true);
      expect(body.tasks['task-2']).toBe(true);
      expect(body.updatedAt).toBe('2024-06-03T10:00:00.000Z');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 4: Migration from legacy format
  // Validates: Req 8.2 — import "nick-roadmap-v1" into new progress format
  // ─────────────────────────────────────────────────────────────────────────
  describe('Migration from legacy format', () => {
    it('imports matching task IDs from legacy data, skips unmatched, marks migration complete', async () => {
      // Setup: legacy localStorage data with mix of valid and invalid IDs
      const legacyData = {
        'p1w1a': true,   // valid ID in nick-roadmap
        'p1w1b': true,   // valid ID in nick-roadmap
        'invalid-xyz': true, // unmatched ID — should be skipped
        'p1w1c': false,  // valid ID but false — should be skipped
      };
      localStorage.setItem('nick-roadmap-v1', JSON.stringify(legacyData));

      // Backend has no existing progress for the default roadmap
      global.fetch = vi.fn().mockImplementation((url, options) => {
        if (!options || !options.method || options.method === 'GET') {
          // GET — no existing backend progress
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ roadmapId: NICK_ROADMAP_ID, tasks: {}, updatedAt: null }),
          });
        }
        // PUT — accept the migration write
        return Promise.resolve({ ok: true });
      });

      const { result } = renderHook(() => useMigration());

      await waitFor(() => {
        expect(result.current.migrated).toBe(true);
      });

      expect(result.current.migrating).toBe(false);

      // Migration should be marked complete (idempotence flag)
      expect(localStorage.getItem('roadmap-migration-complete')).toBe('true');

      // New progress format should contain only matched true entries
      const storedRaw = localStorage.getItem(`progress:${NICK_ROADMAP_ID}`);
      expect(storedRaw).not.toBeNull();
      const stored = JSON.parse(storedRaw);
      expect(stored.tasks['p1w1a']).toBe(true);
      expect(stored.tasks['p1w1b']).toBe(true);
      expect(stored.tasks['invalid-xyz']).toBeUndefined();
      expect(stored.tasks['p1w1c']).toBeUndefined();
      expect(stored.updatedAt).toBeDefined();
    });

    it('is idempotent — second migration run does not change already-migrated data', async () => {
      // First migration already ran
      localStorage.setItem('roadmap-migration-complete', 'true');
      localStorage.setItem('nick-roadmap-v1', JSON.stringify({ p1w1a: true }));

      // Existing progress that was modified after initial migration
      const existingProgress = {
        roadmapId: NICK_ROADMAP_ID,
        tasks: { 'p1w1a': true, 'p1w2a': true },
        updatedAt: '2024-06-15T12:00:00.000Z',
      };
      localStorage.setItem(`progress:${NICK_ROADMAP_ID}`, JSON.stringify(existingProgress));

      const { result } = renderHook(() => useMigration());

      await waitFor(() => {
        expect(result.current.migrated).toBe(true);
      });

      expect(global.fetch).not.toHaveBeenCalled();

      // Progress should remain unchanged
      const stored = JSON.parse(localStorage.getItem(`progress:${NICK_ROADMAP_ID}`));
      expect(stored.tasks['p1w2a']).toBe(true); // post-migration data preserved
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 5: Backend timeout falls back to localStorage
  // Validates: Req 5.3 — load from localStorage with offline indicator on timeout
  // ─────────────────────────────────────────────────────────────────────────
  describe('Backend timeout falls back to localStorage', () => {
    it('shows localStorage data and sets isOffline when backend times out after 5s', async () => {
      vi.useFakeTimers();

      // localStorage has cached data
      const cachedRecord = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': true, 'task-2': true },
        updatedAt: '2024-06-01T10:00:00.000Z',
      };
      localStorage.setItem('progress:test-roadmap', JSON.stringify(cachedRecord));

      // Backend never responds (simulates > 5s timeout)
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        return new Promise((_, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }
        });
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      // localStorage data should be available immediately
      expect(result.current.progress).toEqual({ 'task-1': true, 'task-2': true });

      // Advance past the 5s timeout
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5001);
      });

      // Should be in offline mode with cached data shown
      expect(result.current.isOffline).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.progress).toEqual({ 'task-1': true, 'task-2': true });
      expect(result.current.error).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 6: Write failure retains data in localStorage for retry
  // Validates: Req 5.6 — retain in localStorage and retry on next connection
  // ─────────────────────────────────────────────────────────────────────────
  describe('Write failure retains data in localStorage for retry', () => {
    it('keeps updated data in localStorage and retries sync with exponential backoff', async () => {
      vi.useFakeTimers();

      // Initial load succeeds
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // PUT will fail from now on
      global.fetch = vi.fn().mockRejectedValue(new Error('Server unreachable'));

      // User toggles a task
      act(() => {
        result.current.toggle('task-1');
      });

      // localStorage should be updated immediately
      const stored = JSON.parse(localStorage.getItem('progress:test-roadmap'));
      expect(stored.tasks['task-1']).toBe(true);
      expect(stored.updatedAt).toBeDefined();

      // First sync attempt fires after 2s debounce — fails
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Retry #1 at +2s (backoff: 2^1 * 1000 = 2s)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Retry #2 at +4s (backoff: 2^2 * 1000 = 4s)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Data remains in localStorage throughout all retries
      const storedAfterRetries = JSON.parse(localStorage.getItem('progress:test-roadmap'));
      expect(storedAfterRetries.tasks['task-1']).toBe(true);

      // Each PUT call should send the correct data
      for (const call of global.fetch.mock.calls) {
        expect(call[1].method).toBe('PUT');
        const body = JSON.parse(call[1].body);
        expect(body.tasks['task-1']).toBe(true);
      }
    });

    it('transitions to offline mode after max retries exhausted', async () => {
      vi.useFakeTimers();

      // Initial load succeeds
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
      });

      const { result } = renderHook(() => useProgressStore('test-roadmap'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // All PUTs will fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      act(() => {
        result.current.toggle('task-1');
      });

      // Debounce: 2s → first attempt
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // Retries: 2s, 4s, 8s, 16s, 32s (5 retries with exponential backoff)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);   // retry 1
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);   // retry 2
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(8000);   // retry 3
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16000);  // retry 4
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(32000);  // retry 5 (max)
      });

      // After max retries, should be offline
      expect(result.current.isOffline).toBe(true);
      expect(result.current.error).toBeTruthy();

      // Data should still be in localStorage
      const stored = JSON.parse(localStorage.getItem('progress:test-roadmap'));
      expect(stored.tasks['task-1']).toBe(true);
    });
  });
});
