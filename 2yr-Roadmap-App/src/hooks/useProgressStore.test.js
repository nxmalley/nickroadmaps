import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressStore, getStorageKey, resolveConflict } from './useProgressStore.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get _store() { return store; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('getStorageKey', () => {
  it('returns composite key with roadmapId', () => {
    expect(getStorageKey('my-roadmap')).toBe('progress:my-roadmap');
  });

  it('handles special characters in roadmapId', () => {
    expect(getStorageKey('roadmap-with-dashes')).toBe('progress:roadmap-with-dashes');
  });
});

describe('resolveConflict', () => {
  it('returns remote when both have no updatedAt', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: null };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: null };
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it('returns remote when local has no updatedAt', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: null };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: '2024-01-02T00:00:00Z' };
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it('returns local when remote has no updatedAt', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: '2024-01-02T00:00:00Z' };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: null };
    expect(resolveConflict(local, remote)).toBe(local);
  });

  it('returns the record with more recent updatedAt', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: '2024-01-01T00:00:00Z' };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: '2024-01-02T00:00:00Z' };
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it('returns local when local is more recent', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: '2024-01-03T00:00:00Z' };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: '2024-01-02T00:00:00Z' };
    expect(resolveConflict(local, remote)).toBe(local);
  });

  it('returns remote when timestamps are equal', () => {
    const local = { roadmapId: 'test', tasks: { a: true }, updatedAt: '2024-01-01T00:00:00Z' };
    const remote = { roadmapId: 'test', tasks: { b: true }, updatedAt: '2024-01-01T00:00:00Z' };
    expect(resolveConflict(local, remote)).toBe(remote);
  });
});

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty state when roadmapId is null', () => {
    const { result } = renderHook(() => useProgressStore(null));

    expect(result.current.progress).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.syncing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('loads progress from localStorage immediately on mount', async () => {
    const storedRecord = {
      roadmapId: 'test-roadmap',
      tasks: { 'task-1': true, 'task-2': false },
      updatedAt: '2024-01-01T00:00:00Z',
    };
    localStorageMock.setItem('progress:test-roadmap', JSON.stringify(storedRecord));

    // Mock fetch to return empty (backend has no data)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    // Progress should be available immediately from localStorage
    expect(result.current.progress).toEqual({ 'task-1': true, 'task-2': false });

    // Wait for fetch to complete to avoid act warnings
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('fetches from backend and uses remote data when more recent', async () => {
    const localRecord = {
      roadmapId: 'test-roadmap',
      tasks: { 'task-1': true },
      updatedAt: '2024-01-01T00:00:00Z',
    };
    localStorageMock.setItem('progress:test-roadmap', JSON.stringify(localRecord));

    const remoteRecord = {
      roadmapId: 'test-roadmap',
      tasks: { 'task-1': true, 'task-2': true },
      updatedAt: '2024-01-02T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(remoteRecord),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Remote was more recent, so it wins
    expect(result.current.progress).toEqual({ 'task-1': true, 'task-2': true });
  });

  it('sets isOffline when backend fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('toggles a task and updates localStorage synchronously', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggle('task-1');
    });

    // State updated immediately
    expect(result.current.progress['task-1']).toBe(true);

    // localStorage updated synchronously
    const stored = JSON.parse(localStorageMock.getItem('progress:test-roadmap'));
    expect(stored.tasks['task-1']).toBe(true);
    expect(stored.updatedAt).toBeTruthy();
  });

  it('debounces backend sync after toggle (2 second delay)', async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    // Flush the initial fetch promise
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Clear the initial fetch call count
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    act(() => {
      result.current.toggle('task-1');
    });

    // No backend call immediately
    expect(global.fetch).not.toHaveBeenCalled();

    // After 2 seconds, backend sync fires
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/progress/test-roadmap',
      expect.objectContaining({ method: 'PUT' })
    );

    vi.useRealTimers();
  });

  it('batches multiple toggles within the 2s debounce window', async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    // Flush the initial fetch promise
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    global.fetch.mockClear();
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    act(() => {
      result.current.toggle('task-1');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    act(() => {
      result.current.toggle('task-2');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    act(() => {
      result.current.toggle('task-3');
    });

    // Only one PUT should fire after 2s from last toggle
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Should be a single PUT call with all 3 tasks
    const putCalls = global.fetch.mock.calls.filter(
      (call) => call[1]?.method === 'PUT'
    );
    expect(putCalls.length).toBe(1);

    const body = JSON.parse(putCalls[0][1].body);
    expect(body.tasks['task-1']).toBe(true);
    expect(body.tasks['task-2']).toBe(true);
    expect(body.tasks['task-3']).toBe(true);

    vi.useRealTimers();
  });

  it('resets state when roadmapId changes to null', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: { 'task-1': true }, updatedAt: '2024-01-01T00:00:00Z' }),
    });

    const { result, rerender } = renderHook(
      ({ id }) => useProgressStore(id),
      { initialProps: { id: 'test-roadmap' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ id: null });

    expect(result.current.progress).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('sets isOffline on backend fetch timeout (5s)', async () => {
    vi.useFakeTimers();

    // Fetch that never resolves (will be aborted)
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

    // Advance past the 5s timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5001);
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.loading).toBe(false);

    vi.useRealTimers();
  });

  it('initializes all tasks as incomplete for a new roadmap with no stored data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'new-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('new-roadmap'));

    // No stored data, so progress starts empty (all tasks implicitly incomplete)
    expect(result.current.progress).toEqual({});

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('retries with exponential backoff on sync failure', async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ roadmapId: 'test-roadmap', tasks: {}, updatedAt: null }),
    });

    const { result } = renderHook(() => useProgressStore('test-roadmap'));

    // Flush the initial fetch
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Now make PUT fail
    global.fetch.mockClear();
    global.fetch.mockRejectedValue(new Error('Network error'));

    act(() => {
      result.current.toggle('task-1');
    });

    // First debounce fires at 2s
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // First call failed, retry scheduled at 2s
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Retry #1 fired
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    // Retry #2 fired
    expect(global.fetch).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});
