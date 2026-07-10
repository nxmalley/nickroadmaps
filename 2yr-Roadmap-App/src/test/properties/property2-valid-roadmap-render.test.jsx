import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
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
  cat: fc.constantFrom('cert', 'skill', 'read'),
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
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  subtitle: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  dateRange: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
  milestones: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
  weeks: fc.array(weekArb, { minLength: 1, maxLength: 3 }),
});

const roadmapArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  subtitle: fc.string({ minLength: 0, maxLength: 100 }),
  dateRange: fc.record({
    start: fc.constant('2026-01-01'),
    end: fc.constant('2027-01-01'),
  }),
  accentColors: fc.array(
    fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
    { minLength: 1, maxLength: 4 }
  ),
  categories: fc.constant({
    cert: { label: 'Cert', bg: '#1a2b3c', color: '#ffffff' },
    skill: { label: 'Skill', bg: '#2b3c4d', color: '#ffffff' },
    read: { label: 'Read', bg: '#3c4d5e', color: '#ffffff' },
  }),
  phases: fc.array(phaseArb, { minLength: 1, maxLength: 3 }),
  createdAt: fc.constant('2026-01-01T00:00:00.000Z'),
  updatedAt: fc.constant('2026-01-01T00:00:00.000Z'),
});

describe('Property 2: Valid Roadmap Data Renders Without Error', () => {
  it('any schema-conforming roadmap renders without throwing', () => {
    fc.assert(
      fc.property(roadmapArb, (roadmap) => {
        expect(() => {
          const { unmount } = render(
            <RoadmapView
              roadmap={roadmap}
              progress={{}}
              onToggleTask={() => {}}
            />
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
          <RoadmapView
            roadmap={roadmap}
            progress={{}}
            onToggleTask={() => {}}
          />
        );

        // The first phase is active by default — all its task texts should appear
        const firstPhase = roadmap.phases[0];
        for (const week of firstPhase.weeks) {
          for (const task of week.tasks) {
            expect(container.textContent).toContain(task.text);
          }
        }

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
