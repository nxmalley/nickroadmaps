import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { migrateLegacyProgress } from '../../hooks/useMigration.js';

/**
 * Property 10: Legacy Migration Correctness
 *
 * For any valid legacy completion map (object mapping task IDs to booleans),
 * migration SHALL produce a progress record where every task ID that exists
 * in both the legacy map and the target roadmap retains its boolean value,
 * and task IDs present only in the legacy map are ignored.
 *
 * **Validates: Requirements 8.2, 8.3**
 */
// Filter out __proto__ since it cannot be set as an own property on plain objects
const safeString = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== '__proto__');

describe('Property 10: Legacy Migration Correctness', () => {
  it('matching task IDs with true value are preserved in the migrated result', () => {
    fc.assert(
      fc.property(
        fc.array(safeString, { minLength: 1, maxLength: 20 }),
        fc.array(safeString, { minLength: 0, maxLength: 10 }),
        (validIds, extraIds) => {
          const validSet = new Set(validIds);

          // Create legacy data with some valid IDs (true) and some extra IDs
          const legacyData = {};
          for (const id of validIds) {
            legacyData[id] = true;
          }
          for (const id of extraIds) {
            if (!validSet.has(id)) {
              legacyData[id] = true;
            }
          }

          const result = migrateLegacyProgress(legacyData, validSet);

          // All valid IDs with true value should be in the result
          for (const id of validIds) {
            expect(result[id]).toBe(true);
          }

          // No extra IDs should be in the result (use hasOwn to avoid prototype properties)
          for (const id of extraIds) {
            if (!validSet.has(id)) {
              expect(Object.hasOwn(result, id)).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('IDs with false values are not included in the migration result', () => {
    fc.assert(
      fc.property(
        fc.array(safeString, { minLength: 1, maxLength: 20 }),
        (ids) => {
          const validSet = new Set(ids);
          const legacyData = {};
          for (const id of ids) {
            legacyData[id] = false; // all false
          }

          const result = migrateLegacyProgress(legacyData, validSet);

          // Result should be empty since all are false
          expect(Object.keys(result)).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('unmatched IDs are always excluded regardless of their value', () => {
    fc.assert(
      fc.property(
        fc.dictionary(safeString, fc.boolean()),
        (legacyData) => {
          // Use an empty valid set — nothing should match
          const emptySet = new Set();
          const result = migrateLegacyProgress(legacyData, emptySet);
          expect(Object.keys(result)).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
