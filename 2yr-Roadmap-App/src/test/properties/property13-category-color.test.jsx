import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import RoadmapView from '../../components/RoadmapView.jsx';

/**
 * Property 13: Category Tag Color Mapping
 * Validates: Requirements 9.5
 *
 * For any task with a category key that exists in the roadmap's categories object,
 * the rendered category tag SHALL use the `bg` property for its background and
 * the `color` property for its text color from that category definition.
 */

/**
 * Convert a hex color string to its rgb() equivalent as jsdom normalizes it.
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function makeRoadmap(catKey, catDef) {
  return {
    id: 'test-roadmap',
    title: 'Test',
    subtitle: 'Test',
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    accentColors: ['#0F6E56'],
    categories: { [catKey]: catDef },
    phases: [{
      id: 'p1',
      title: 'Phase 1',
      subtitle: 'Test',
      dateRange: 'Jan – Dec',
      milestones: [],
      weeks: [{
        id: 'w1',
        label: 'Week 1',
        dates: 'Jan 1–7',
        tasks: [{ id: 'task-1', cat: catKey, text: 'Test task content' }]
      }]
    }],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('Property 13: Category Tag Color Mapping', () => {
  it('category tags use bg and color from the roadmaps categories definition', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z]+$/.test(s)),
        fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
        fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
        fc.string({ minLength: 1, maxLength: 15 }).filter(s => s.trim().length > 0),
        (catKey, bg, color, label) => {
          const catDef = { label, bg, color };

          const roadmap = makeRoadmap(catKey, catDef);
          const { container } = render(
            <RoadmapView roadmap={roadmap} progress={{}} onToggleTask={() => {}} />
          );

          // Find the category tag by its label text
          const allSpans = container.querySelectorAll('span');
          const catTag = Array.from(allSpans).find(span => span.textContent === label);

          expect(catTag).toBeTruthy();
          // jsdom normalizes hex colors to rgb() format
          expect(catTag.style.background).toBe(hexToRgb(bg));
          expect(catTag.style.color).toBe(hexToRgb(color));

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });
});
