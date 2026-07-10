import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Generates the localStorage key for a given roadmap's progress.
 * @param {string} roadmapId
 * @returns {string}
 */
export function getStorageKey(roadmapId) {
  return `progress:${roadmapId}`;
}

/**
 * Resolves a conflict between two ProgressRecords by returning the one with the
 * more recent `updatedAt` timestamp.
 * @param {import('../types/roadmap.js').ProgressRecord} local
 * @param {import('../types/roadmap.js').ProgressRecord} remote
 * @returns {import('../types/roadmap.js').ProgressRecord}
 */
export function resolveConflict(local, remote) {
  if (!local.updatedAt && !remote.updatedAt) return remote;
  if (!local.updatedAt) return remote;
  if (!remote.updatedAt) return local;

  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();

  return remoteTime >= localTime ? remote : local;
}

/**
 * Reads a ProgressRecord from localStorage for the given roadmapId.
 * Returns null if nothing is stored or parsing fails.
 * @param {string} roadmapId
 * @returns {import('../types/roadmap.js').ProgressRecord | null}
 */
function readFromLocalStorage(roadmapId) {
  try {
    const raw = localStorage.getItem(getStorageKey(roadmapId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Writes a ProgressRecord to localStorage.
 * @param {string} roadmapId
 * @param {import('../types/roadmap.js').ProgressRecord} record
 */
function writeToLocalStorage(roadmapId, record) {
  try {
    localStorage.setItem(getStorageKey(roadmapId), JSON.stringify(record));
  } catch {
    // localStorage write failure is handled at the hook level
  }
}

/**
 * Custom hook for managing per-roadmap progress state with localStorage caching
 * and backend sync via exponential backoff retry.
 *
 * @param {string | null} roadmapId - The roadmap to load progress for
 * @returns {{
 *   progress: Record<string, boolean>,
 *   toggle: (taskId: string) => void,
 *   loading: boolean,
 *   syncing: boolean,
 *   error: string | null,
 *   isOffline: boolean
 * }}
 */
export function useProgressStore(roadmapId) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Refs for managing timers and preventing stale closures
  const debounceTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const currentRecordRef = useRef(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  /**
   * Syncs the current record to the backend with exponential backoff retry.
   * @param {import('../types/roadmap.js').ProgressRecord} record
   */
  const syncToBackend = useCallback(async (record) => {
    if (!roadmapId || !mountedRef.current) return;

    setSyncing(true);

    // Cancel any existing abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/progress/${roadmapId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: record.tasks,
          updatedAt: record.updatedAt,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!mountedRef.current) return;

      if (response.ok) {
        // Sync succeeded
        retryCountRef.current = 0;
        setError(null);
        setSyncing(false);
        setIsOffline(false);
        return;
      }

      if (response.status === 409) {
        // Conflict: backend has more recent data
        const data = await response.json();
        const remoteRecord = data.stored;

        if (remoteRecord && mountedRef.current) {
          // Resolve conflict — most recent timestamp wins
          const resolved = resolveConflict(record, remoteRecord);
          currentRecordRef.current = resolved;
          writeToLocalStorage(roadmapId, resolved);
          setProgress(resolved.tasks || {});

          // If the remote won, we're done. If local won, try to push again.
          if (resolved === remoteRecord) {
            setSyncing(false);
            setError(null);
            retryCountRef.current = 0;
          } else {
            // Local is newer, retry push with updated timestamp
            retryCountRef.current = 0;
            await syncToBackend(resolved);
          }
        }
        return;
      }

      // Other server errors — treat as network failure
      throw new Error(`Server responded with ${response.status}`);
    } catch (err) {
      if (err.name === 'AbortError' || !mountedRef.current) return;

      // Network error — apply exponential backoff
      const maxRetries = 5;
      if (retryCountRef.current < maxRetries) {
        const delay = Math.pow(2, retryCountRef.current + 1) * 1000; // 2s, 4s, 8s, 16s, 32s
        retryCountRef.current += 1;

        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current && currentRecordRef.current) {
            syncToBackend(currentRecordRef.current);
          }
        }, delay);
      } else {
        // Max retries reached — go offline
        if (mountedRef.current) {
          setIsOffline(true);
          setSyncing(false);
          setError('Unable to sync with server. Changes saved locally.');
          retryCountRef.current = 0;
        }
      }
    }
  }, [roadmapId]);

  /**
   * Schedules a debounced backend sync (2 second delay).
   * @param {import('../types/roadmap.js').ProgressRecord} record
   */
  const scheduleSyncDebounced = useCallback((record) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      syncToBackend(record);
    }, 2000);
  }, [syncToBackend]);

  // Load progress on mount or roadmapId change
  useEffect(() => {
    if (!roadmapId) {
      setProgress({});
      setLoading(false);
      setSyncing(false);
      setError(null);
      setIsOffline(false);
      currentRecordRef.current = null;
      return;
    }

    // Clear pending timers from previous roadmapId
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    retryCountRef.current = 0;

    // 1. Load from localStorage immediately (synchronous)
    const localRecord = readFromLocalStorage(roadmapId);
    if (localRecord) {
      setProgress(localRecord.tasks || {});
      currentRecordRef.current = localRecord;
    } else {
      setProgress({});
      currentRecordRef.current = {
        roadmapId,
        tasks: {},
        updatedAt: null,
      };
    }

    // 2. Fetch from backend
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`/api/progress/${roadmapId}`, { signal: controller.signal })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const remoteRecord = await response.json();

        // Resolve conflict between localStorage and backend
        const localCurrent = currentRecordRef.current;

        if (!remoteRecord.updatedAt && (!localCurrent || !localCurrent.updatedAt)) {
          // Both are empty/uninitialized — use local state (which may be empty)
          setLoading(false);
          return;
        }

        const resolved = resolveConflict(
          localCurrent || { roadmapId, tasks: {}, updatedAt: null },
          remoteRecord
        );

        currentRecordRef.current = resolved;
        writeToLocalStorage(roadmapId, resolved);
        setProgress(resolved.tasks || {});
        setLoading(false);
        setIsOffline(false);

        // If localStorage was more recent, push to backend
        if (resolved !== remoteRecord && resolved.updatedAt) {
          syncToBackend(resolved);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (!mountedRef.current) return;

        // Network failure or timeout — operate from localStorage
        setIsOffline(true);
        setLoading(false);

        if (err.name === 'AbortError') {
          setError('Backend request timed out. Using cached data.');
        } else {
          setError('Unable to reach server. Using cached data.');
        }
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [roadmapId, syncToBackend]);

  /**
   * Toggle a task's completion status.
   * Updates state and localStorage immediately, then debounces backend sync.
   * @param {string} taskId
   */
  const toggle = useCallback((taskId) => {
    if (!roadmapId) return;

    setProgress((prev) => {
      const newTasks = { ...prev, [taskId]: !prev[taskId] };
      const updatedAt = new Date().toISOString();

      const newRecord = {
        roadmapId,
        tasks: newTasks,
        updatedAt,
      };

      // Synchronously update localStorage
      writeToLocalStorage(roadmapId, newRecord);
      currentRecordRef.current = newRecord;

      // Schedule debounced backend sync
      scheduleSyncDebounced(newRecord);

      return newTasks;
    });

    // Clear any previous error on user action
    setError(null);
  }, [roadmapId, scheduleSyncDebounced]);

  return {
    progress,
    toggle,
    loading,
    syncing,
    error,
    isOffline,
  };
}

export default useProgressStore;
