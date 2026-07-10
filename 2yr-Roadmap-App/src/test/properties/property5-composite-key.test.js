import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getStorageKey } from '../../hooks/useProgressStore.js';

/**
 * Property 5: Composite Key Determinism
 * Validates: Requirements 4.2
 *
 * Verifies that storage keys are deterministic for (roadmapId, taskId) pairs
 * and unique across distinct pairs.
 */
describe('Property 5: Composite Key Determinism', () => {
  it('getStorageKey is deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (roadmapId) => {
          const key1 = getStorageKey(roadmapId);
          const key2 = getStorageKey(roadmapId);
          expect(key1).toBe(key2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('different roadmapIds produce different storage keys', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (id1, id2) => {
          fc.pre(id1 !== id2);
          const key1 = getStorageKey(id1);
          const key2 = getStorageKey(id2);
          expect(key1).not.toBe(key2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('composite key (storageKey + taskId) is unique across distinct (roadmapId, taskId) pairs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (roadmapId1, taskId1, roadmapId2, taskId2) => {
          fc.pre(roadmapId1 !== roadmapId2 || taskId1 !== taskId2);
          const compositeKey1 = `${getStorageKey(roadmapId1)}:${taskId1}`;
          const compositeKey2 = `${getStorageKey(roadmapId2)}:${taskId2}`;
          expect(compositeKey1).not.toBe(compositeKey2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
