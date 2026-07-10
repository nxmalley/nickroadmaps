import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import RoadmapView from '../../components/RoadmapView.jsx';

/**
 * Property 2: Valid Roadmap Data Renders Without Error
 *
 * For any roadmap data structure conforming to the schema (valid ID, title, phases
 * with weeks containing 1-20 tasks each with valid category keys), the RoadmapView
 * component SHALL render without throwing an error and SHALL produce output containing
 * all task texts and category labels.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

// --- Arbitrary generators conforming to the roadmap schema ---

const taskArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  cat: fc.constantFrom('cat1', 'cat2'),
  text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
});

const weekArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  label: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  dates: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  tasks: fc.array(taskArb, { minLength: 1, maxLength: 5 }),
});

const phaseArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  title: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  subtitle: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  dateRange: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  milestones: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
  weeks: fc.array(weekArb, { minLength: 1, maxLength: 3 }),
});

const roadmapArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  subtitle: fc.string({ minLength: 0, maxLength: 50 }),
  dateRange: fc.record({
    start: fc.constant('2026-01-01'),
    end: fc.constant('2026-12-31'),
  }),
  accentColors: fc.array(
    fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
    { minLength: 1, maxLength: 4 }
  ),
  categories: fc.constant({
    cat1: { label: 'Category One', bg: '#333333', color: '#ffffff' },
    cat2: { label: 'Category Two', bg: '#555555', color: '#eeeeee' },
  }),
  phases: fc.array(phaseArb, { minLength: 1, maxLength: 3 }),
  createdAt: fc.constant('2026-01-01T00:00:00Z'),
  updatedAt: fc.constant('2026-01-01T00:00:00Z'),
});

describe('Property 2: Valid Roadmap Data Renders Without Error', () => {
  it('any schema-conforming roadmap renders without throwing', () => {
    fc.assert(
      fc.property(roadmapArb, (roadmap) => {
        expect(() => {
          const { unmount } = render(
            <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
          );
          unmount();
        }).not.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  it('all task texts from the active phase appear in the rendered output', () => {
    fc.assert(
      fc.property(roadmapArb, (roadmap) => {
        const { container, unmount } = render(
          <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
        );

        // The first phase is active by default — all its tasks should appear
        const firstPhaseTasks = roadmap.phases[0].weeks.flatMap(w => w.tasks);
        for (const task of firstPhaseTasks) {
          expect(container.textContent).toContain(task.text);
        }

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  it('all category labels from the active phase appear in the rendered output', () => {
    fc.assert(
      fc.property(roadmapArb, (roadmap) => {
        const { container, unmount } = render(
          <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
        );

        // Category labels for tasks in the first phase should appear
        const firstPhaseTasks = roadmap.phases[0].weeks.flatMap(w => w.tasks);
        const catKeys = [...new Set(firstPhaseTasks.map(t => t.cat))];
        for (const catKey of catKeys) {
          const catDef = roadmap.categories[catKey];
          if (catDef) {
            expect(container.textContent).toContain(catDef.label);
          }
        }

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
