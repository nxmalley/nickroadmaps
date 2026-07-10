import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { migrateLegacyProgress } from '../../hooks/useMigration.js';

/**
 * Property 11: Migration Idempotence
 *
 * For any legacy completion map, running the migration function N times (N >= 1)
 * SHALL produce the same progress record as running it exactly once.
 *
 * **Validates: Requirements 8.4**
 */
describe('Property 11: Migration Idempotence', () => {
  it('migrating N times produces the same result as migrating once', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.boolean()),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 2, max: 5 }),
        (legacyData, validIdArray, n) => {
          const validSet = new Set(validIdArray);

          // Run once
          const firstResult = migrateLegacyProgress(legacyData, validSet);

          // Run N times (feeding output back as input each time)
          let current = legacyData;
          for (let i = 0; i < n; i++) {
            current = migrateLegacyProgress(current, validSet);
          }

          expect(current).toEqual(firstResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('migrating the output of a migration produces the same result', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.boolean()),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 20 }),
        (legacyData, validIdArray) => {
          const validSet = new Set(validIdArray);

          const firstResult = migrateLegacyProgress(legacyData, validSet);
          const secondResult = migrateLegacyProgress(firstResult, validSet);

          expect(secondResult).toEqual(firstResult);
        }
      ),
      { numRuns: 100 }
    );
  });
});
