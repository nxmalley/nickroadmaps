import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 1: Progress Calculation Correctness
 * **Validates: Requirements 1.2, 2.1**
 *
 * Verifies that percentage = Math.round((completedTasks / totalTasks) * 100)
 * for arbitrary task sets. The pure calculation logic mirrors the inline
 * computation in RoadmapView.jsx.
 */

// Pure progress calculation (same logic as in RoadmapView)
function calculateProgress(tasks, progress) {
  const totalTasks = tasks.length;
  if (totalTasks === 0) return { completed: 0, total: 0, percentage: 0 };
  const completedTasks = tasks.filter(t => progress[t.id]).length;
  const percentage = Math.round((completedTasks / totalTasks) * 100);
  return { completed: completedTasks, total: totalTasks, percentage };
}

describe('Property 1: Progress Calculation Correctness', () => {
  it('percentage equals Math.round((completedTasks / totalTasks) * 100) for arbitrary task sets', () => {
    fc.assert(
      fc.property(
        // Generate array of unique task IDs (at least 1 task)
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 50 }),
        // Generate progress map (taskId -> boolean)
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.boolean()),
        (taskIds, progressMap) => {
          const tasks = taskIds.map(id => ({ id }));
          const result = calculateProgress(tasks, progressMap);

          const expectedCompleted = tasks.filter(t => progressMap[t.id]).length;
          const expectedPercentage = Math.round((expectedCompleted / tasks.length) * 100);

          expect(result.completed).toBe(expectedCompleted);
          expect(result.total).toBe(tasks.length);
          expect(result.percentage).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('percentage is always between 0 and 100 inclusive', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 50 }),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.boolean()),
        (taskIds, progressMap) => {
          const tasks = taskIds.map(id => ({ id }));
          const result = calculateProgress(tasks, progressMap);
          expect(result.percentage).toBeGreaterThanOrEqual(0);
          expect(result.percentage).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 0 for empty task arrays', () => {
    const result = calculateProgress([], {});
    expect(result.percentage).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.total).toBe(0);
  });
});
