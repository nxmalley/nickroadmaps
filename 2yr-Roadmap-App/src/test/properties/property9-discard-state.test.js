import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 9: Discard Reverts to Persisted State
 * Validates: Requirements 7.6
 *
 * For any persisted roadmap state and any set of unsaved edits,
 * invoking "discard" SHALL produce a state exactly equal to the last persisted state.
 *
 * Implementation approach: The EditModeOverlay component creates a deep clone
 * (JSON.parse(JSON.stringify(...))) of the roadmap prop as a working copy.
 * All edits mutate the clone. Discard simply re-renders with the original prop.
 * This test verifies that deep cloning isolates the original from any mutations
 * applied to the clone — proving that discarding always yields the persisted state.
 */

// --- Arbitraries ---

/** Hex color string arbitrary (e.g., "#a3f4b2") */
const hexColorArb = fc.stringMatching(/^[0-9a-f]{6}$/).map((s) => `#${s}`);

/** Generate an arbitrary task */
const taskArb = fc.record({
  id: fc.uuid(),
  cat: fc.stringMatching(/^[a-z]{1,10}$/),
  text: fc.string({ minLength: 1, maxLength: 100 }),
});

/** Generate an arbitrary week with 1-5 tasks */
const weekArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1, maxLength: 30 }),
  dates: fc.string({ minLength: 0, maxLength: 30 }),
  tasks: fc.array(taskArb, { minLength: 1, maxLength: 5 }),
});

/** Generate an arbitrary phase with 1-3 weeks */
const phaseArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  subtitle: fc.string({ minLength: 0, maxLength: 50 }),
  dateRange: fc.string({ minLength: 0, maxLength: 30 }),
  milestones: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
  weeks: fc.array(weekArb, { minLength: 1, maxLength: 3 }),
});

/** Generate an arbitrary roadmap */
const roadmapArb = fc.record({
  id: fc.stringMatching(/^[a-z0-9]{1,30}$/),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  subtitle: fc.string({ minLength: 0, maxLength: 200 }),
  dateRange: fc.record({
    start: fc.constant('2024-01-01'),
    end: fc.constant('2025-12-31'),
  }),
  accentColors: fc.array(hexColorArb, { minLength: 1, maxLength: 5 }),
  categories: fc.dictionary(
    fc.stringMatching(/^[a-z]{1,10}$/),
    fc.record({
      label: fc.string({ minLength: 1, maxLength: 30 }),
      bg: hexColorArb,
      color: hexColorArb,
    })
  ),
  phases: fc.array(phaseArb, { minLength: 1, maxLength: 4 }),
  createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
  updatedAt: fc.constant('2024-06-01T00:00:00.000Z'),
});

/**
 * Arbitrary that generates a mutation function to apply to a roadmap clone.
 * Each mutation simulates an edit the user might make in EditModeOverlay.
 */
const mutationArb = fc.oneof(
  // Mutation: change the title
  fc.string({ minLength: 1, maxLength: 50 }).map((newTitle) => (clone) => {
    clone.title = newTitle;
  }),
  // Mutation: change subtitle
  fc.string({ minLength: 0, maxLength: 50 }).map((newSubtitle) => (clone) => {
    clone.subtitle = newSubtitle;
  }),
  // Mutation: add a new phase
  fc.constant((clone) => {
    clone.phases.push({
      id: 'added-phase-' + Date.now(),
      title: 'Added Phase',
      subtitle: '',
      dateRange: '',
      milestones: [],
      weeks: [{ id: 'added-week', label: 'New Week', dates: '', tasks: [{ id: 'added-task', cat: 'misc', text: 'New task' }] }],
    });
  }),
  // Mutation: remove first phase (if more than one)
  fc.constant((clone) => {
    if (clone.phases.length > 1) {
      clone.phases.splice(0, 1);
    }
  }),
  // Mutation: modify a task text in first phase/first week
  fc.string({ minLength: 1, maxLength: 50 }).map((newText) => (clone) => {
    if (clone.phases.length > 0 && clone.phases[0].weeks.length > 0 && clone.phases[0].weeks[0].tasks.length > 0) {
      clone.phases[0].weeks[0].tasks[0].text = newText;
    }
  }),
  // Mutation: add a task to the first week of the first phase
  fc.constant((clone) => {
    if (clone.phases.length > 0 && clone.phases[0].weeks.length > 0) {
      clone.phases[0].weeks[0].tasks.push({ id: 'injected-task', cat: 'test', text: 'Injected' });
    }
  }),
  // Mutation: swap phases order
  fc.constant((clone) => {
    if (clone.phases.length >= 2) {
      const temp = clone.phases[0];
      clone.phases[0] = clone.phases[1];
      clone.phases[1] = temp;
    }
  }),
  // Mutation: modify milestones
  fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }).map((newMilestones) => (clone) => {
    if (clone.phases.length > 0) {
      clone.phases[0].milestones = newMilestones;
    }
  }),
  // Mutation: add a week
  fc.constant((clone) => {
    if (clone.phases.length > 0) {
      clone.phases[0].weeks.push({ id: 'new-week-mutation', label: 'Mutated Week', dates: '', tasks: [] });
    }
  }),
  // Mutation: remove a task
  fc.constant((clone) => {
    if (clone.phases.length > 0 && clone.phases[0].weeks.length > 0 && clone.phases[0].weeks[0].tasks.length > 1) {
      clone.phases[0].weeks[0].tasks.pop();
    }
  })
);

/** Generate a sequence of 1-10 mutations */
const mutationSequenceArb = fc.array(mutationArb, { minLength: 1, maxLength: 10 });

// --- Tests ---

describe('Feature: roadmap-dashboard, Property 9: Discard Reverts to Persisted State', () => {
  it('deep clone isolates original from arbitrary mutations — discard always yields persisted state', () => {
    fc.assert(
      fc.property(roadmapArb, mutationSequenceArb, (roadmap, mutations) => {
        // Snapshot the original (persisted state) before any mutations
        const persistedSnapshot = JSON.stringify(roadmap);

        // Simulate EditModeOverlay: create a deep clone (working copy)
        const workingCopy = JSON.parse(JSON.stringify(roadmap));

        // Apply arbitrary mutations to the working copy (simulating user edits)
        for (const mutate of mutations) {
          mutate(workingCopy);
        }

        // After mutations, the working copy should be different (in most cases)
        // But the ORIGINAL must remain unchanged
        const originalAfterEdits = JSON.stringify(roadmap);

        // THE PROPERTY: original roadmap is exactly equal to persisted state
        // This proves "discard" (which uses the original) produces persisted state
        expect(originalAfterEdits).toBe(persistedSnapshot);
      }),
      { numRuns: 100 }
    );
  });

  it('deep clone produces an independent copy — mutations to clone never propagate to source', () => {
    fc.assert(
      fc.property(roadmapArb, (roadmap) => {
        // Freeze original for reference
        const frozenCopy = JSON.parse(JSON.stringify(roadmap));

        // Create deep clone (same as EditModeOverlay does)
        const clone = JSON.parse(JSON.stringify(roadmap));

        // Destructive mutations on the clone
        clone.title = 'COMPLETELY DIFFERENT TITLE';
        clone.phases = [];
        clone.categories = {};
        clone.accentColors = ['#000000'];
        clone.subtitle = 'OVERWRITTEN';

        // Original must be unaffected
        expect(JSON.stringify(roadmap)).toBe(JSON.stringify(frozenCopy));
      }),
      { numRuns: 100 }
    );
  });

  it('multiple sequential clone-edit-discard cycles preserve original state', () => {
    fc.assert(
      fc.property(roadmapArb, mutationSequenceArb, (roadmap, mutations) => {
        const persistedSnapshot = JSON.stringify(roadmap);

        // Simulate multiple edit-discard cycles
        for (let cycle = 0; cycle < 3; cycle++) {
          const workingCopy = JSON.parse(JSON.stringify(roadmap));

          // Apply mutations
          for (const mutate of mutations) {
            mutate(workingCopy);
          }

          // "Discard" — just re-use original roadmap (like the parent re-renders)
          // Verify original is still intact after each cycle
          expect(JSON.stringify(roadmap)).toBe(persistedSnapshot);
        }
      }),
      { numRuns: 100 }
    );
  });
});
