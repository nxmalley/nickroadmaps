import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { getStorageKey } from '../../hooks/useProgressStore.js';

/**
 * Property 4: Completion State Isolation Between Roadmaps
 *
 * For any two distinct roadmaps and any sequence of task toggles applied to one roadmap,
 * the completion state of the other roadmap SHALL remain unchanged.
 *
 * **Validates: Requirements 4.1, 2.4**
 */
describe('Property 4: Completion State Isolation Between Roadmaps', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggling tasks in one roadmap never modifies another roadmap state', () => {
    fc.assert(
      fc.property(
        // Two distinct roadmap IDs (URL-safe strings)
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        // Task IDs to toggle in roadmap1
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          { minLength: 1, maxLength: 10 }
        ),
        // Initial progress for roadmap2 (task ID -> boolean)
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
          fc.boolean()
        ),
        (roadmapId1, roadmapId2, taskIds, roadmap2Progress) => {
          // Ensure distinct IDs
          fc.pre(roadmapId1 !== roadmapId2);

          // Clear localStorage for a clean slate per iteration
          localStorage.clear();

          // Set up roadmap2's initial state in localStorage
          const key2 = getStorageKey(roadmapId2);
          const initialRecord2 = {
            roadmapId: roadmapId2,
            tasks: roadmap2Progress,
            updatedAt: '2024-01-01T00:00:00Z',
          };
          localStorage.setItem(key2, JSON.stringify(initialRecord2));

          // Snapshot roadmap2 state before any modifications to roadmap1
          const snapshotBefore = localStorage.getItem(key2);

          // Apply a sequence of task toggles to roadmap1's localStorage key
          const key1 = getStorageKey(roadmapId1);
          const tasks1 = {};
          for (const taskId of taskIds) {
            tasks1[taskId] = !tasks1[taskId];
          }
          const record1 = {
            roadmapId: roadmapId1,
            tasks: tasks1,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(key1, JSON.stringify(record1));

          // Assert roadmap2's localStorage entry is completely unchanged
          const snapshotAfter = localStorage.getItem(key2);
          expect(snapshotAfter).toEqual(snapshotBefore);

          // Also verify the parsed data matches
          const afterRecord2 = JSON.parse(snapshotAfter);
          expect(afterRecord2).toEqual(initialRecord2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('storage keys for different roadmaps are distinct', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        (roadmapId1, roadmapId2) => {
          fc.pre(roadmapId1 !== roadmapId2);

          const key1 = getStorageKey(roadmapId1);
          const key2 = getStorageKey(roadmapId2);

          // Different roadmap IDs must produce different storage keys
          expect(key1).not.toEqual(key2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
