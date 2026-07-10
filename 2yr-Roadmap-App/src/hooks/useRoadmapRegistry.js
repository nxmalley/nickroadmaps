import { useState, useEffect, useCallback } from 'react';
import { nickRoadmap } from '../data/nick-roadmap.js';

/**
 * Computes metadata summary for a single roadmap.
 * Exported separately for unit testing.
 *
 * @param {import('../types/roadmap.js').RoadmapData} roadmap
 * @returns {import('../types/roadmap.js').RoadmapMeta}
 */
export function computeRoadmapMeta(roadmap) {
  let totalTasks = 0;

  for (const phase of roadmap.phases) {
    for (const week of phase.weeks) {
      totalTasks += week.tasks.length;
    }
  }

  return {
    id: roadmap.id,
    title: roadmap.title,
    subtitle: roadmap.subtitle,
    dateRange: roadmap.dateRange,
    completedTasks: 0,
    totalTasks,
  };
}

/**
 * Hook that manages the registry of all roadmap definitions.
 * Fetches from /api/roadmaps on mount, falls back to nickRoadmap if empty or on error.
 * Provides addRoadmap (POST) and updateRoadmap (PUT) with optimistic local updates.
 *
 * @returns {{
 *   roadmaps: import('../types/roadmap.js').RoadmapData[],
 *   meta: import('../types/roadmap.js').RoadmapMeta[],
 *   addRoadmap: (data: import('../types/roadmap.js').RoadmapData) => Promise<void>,
 *   updateRoadmap: (id: string, data: Partial<import('../types/roadmap.js').RoadmapData>) => Promise<void>,
 *   loading: boolean,
 *   error: string | null
 * }}
 */
export function useRoadmapRegistry() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch roadmaps on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchRoadmaps() {
      try {
        const response = await fetch('/api/roadmaps');

        if (!response.ok) {
          throw new Error(`Failed to fetch roadmaps: ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setRoadmaps(data);
          } else {
            // Backend returned empty — use nickRoadmap as default
            setRoadmaps([nickRoadmap]);
          }
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          // On fetch failure, fall back to nickRoadmap
          setRoadmaps([nickRoadmap]);
          setError(err.message || 'Failed to load roadmaps');
          setLoading(false);
        }
      }
    }

    fetchRoadmaps();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute meta array from current roadmaps
  const meta = roadmaps.map(computeRoadmapMeta);

  /**
   * Add a new roadmap with optimistic local update.
   * @param {import('../types/roadmap.js').RoadmapData} data
   */
  const addRoadmap = useCallback(async (data) => {
    // Optimistically add to local state
    setRoadmaps((prev) => [...prev, data]);
    setError(null);

    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Failed to create roadmap: ${response.status}`);
      }

      const confirmed = await response.json();

      // Replace optimistic entry with server-confirmed response
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === data.id ? confirmed : r))
      );
    } catch (err) {
      // Revert optimistic update
      setRoadmaps((prev) => prev.filter((r) => r.id !== data.id));
      setError(err.message || 'Failed to add roadmap');
    }
  }, []);

  /**
   * Update an existing roadmap with optimistic local update.
   * @param {string} id
   * @param {Partial<import('../types/roadmap.js').RoadmapData>} data
   */
  const updateRoadmap = useCallback(async (id, data) => {
    // Store previous state for rollback
    const previousRoadmaps = roadmaps;

    // Optimistically update local state
    setRoadmaps((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    setError(null);

    try {
      const response = await fetch(`/api/roadmaps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Failed to update roadmap: ${response.status}`);
      }

      const confirmed = await response.json();

      // Replace with server-confirmed response
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === id ? confirmed : r))
      );
    } catch (err) {
      // Revert optimistic update
      setRoadmaps(previousRoadmaps);
      setError(err.message || 'Failed to update roadmap');
    }
  }, [roadmaps]);

  return {
    roadmaps,
    meta,
    addRoadmap,
    updateRoadmap,
    loading,
    error,
  };
}
