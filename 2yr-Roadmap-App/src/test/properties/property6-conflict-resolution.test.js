import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveConflict } from '../../hooks/useProgressStore.js';

/**
 * Property 6: Conflict Resolution — Most Recent Timestamp Wins
 * Validates: Requirements 5.5
 *
 * For any two progress records with different updatedAt timestamps,
 * the resolved record is always the one with the more recent timestamp.
 */
describe('Property 6: Conflict Resolution — Most Recent Timestamp Wins', () => {
  it('for two records with different timestamps, the more recent one wins', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01'), noInvalidDate: true }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01'), noInvalidDate: true }),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.boolean()),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.boolean()),
        (date1, date2, tasks1, tasks2) => {
          fc.pre(date1.getTime() !== date2.getTime());

          const record1 = { roadmapId: 'test', tasks: tasks1, updatedAt: date1.toISOString() };
          const record2 = { roadmapId: 'test', tasks: tasks2, updatedAt: date2.toISOString() };

          const result = resolveConflict(record1, record2);

          const expected = date1.getTime() > date2.getTime() ? record1 : record2;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('a record with a timestamp always wins over a record without', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01'), noInvalidDate: true }),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.boolean()),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.boolean()),
        (date, tasks1, tasks2) => {
          const withTimestamp = { roadmapId: 'test', tasks: tasks1, updatedAt: date.toISOString() };
          const withoutTimestamp = { roadmapId: 'test', tasks: tasks2, updatedAt: null };

          // Whether passed as local or remote, the one with timestamp wins
          expect(resolveConflict(withTimestamp, withoutTimestamp)).toBe(withTimestamp);
          expect(resolveConflict(withoutTimestamp, withTimestamp)).toBe(withTimestamp);
        }
      ),
      { numRuns: 100 }
    );
  });
});
